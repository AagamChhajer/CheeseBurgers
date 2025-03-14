from typing import List, Dict, Any, Annotated, TypedDict
import os
import json
from datetime import datetime

# LangChain and LangGraph imports
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
# from langchain_anthropic import ChatAnthropic
from langchain_core.runnables import RunnablePassthrough

import langgraph.graph as lg
from langgraph.graph import END, StateGraph
# from langgraph.checkpoint.sqlite import SqliteSaver
# from langgraph.checkpoint.postgres import PostgresSaver

# Prisma integration
from prisma import Prisma
import asyncio

# Environment variables
import dotenv
dotenv.load_dotenv()


# --------------------- MODEL DEFINITIONS --------------------- #

class QuestionType(TypedDict):
    id: int
    text: str
    language: str
    constraints: str


class LLMSolutionType(TypedDict):
    question_id: int
    llm_name: str
    solution: str
    timestamp: str


class ComparisonResultType(TypedDict):
    question_id: int
    candidate_id: str
    candidate_solution: str
    similarity_scores: Dict[str, float]
    timestamp: str


class PipelineState(TypedDict):
    question: QuestionType
    llm_solutions: Dict[str, str]
    candidate_solution: str
    candidate_id: str
    similarity_scores: Dict[str, float]
    status: str
    error: str


# --------------------- PRISMA DATABASE TOOLS --------------------- #

# Create a Prisma client as a global singleton
prisma_client = Prisma()

@tool
async def connect_to_database(dummy: str = "") -> str:
    """Connect to the Neon PostgreSQL database via Prisma."""
    await prisma_client.connect()
    return "Connected to Neon PostgreSQL database"

@tool
async def disconnect_from_database(dummy: str = "") -> str:
    """Disconnect from the Neon PostgreSQL database."""
    await prisma_client.disconnect()
    return "Disconnected from Neon PostgreSQL database"

@tool
async def get_question_from_db(question_id: int) -> QuestionType:
    """Retrieve a specific programming question from the database."""
    question = await prisma_client.question.find_unique(
        where={
            "id": question_id
        }
    )
    
    if not question:
        raise ValueError(f"Question with ID {question_id} not found")
    
    return {
        "id": question.id,
        "text": question.text,
        "language": question.language,
        "constraints": question.constraints or ""
    }

@tool
async def store_llm_solution(solution_data: LLMSolutionType) -> str:
    """Store an LLM-generated solution in the database."""
    await prisma_client.llmsolution.create(
        data={
            "questionId": solution_data["question_id"],
            "llmName": solution_data["llm_name"],
            "solution": solution_data["solution"],
            "timestamp": datetime.now(),
            "metrics": {}
        }
    )
    return f"Solution for {solution_data['llm_name']} stored successfully"

@tool
async def store_comparison_result(result: ComparisonResultType) -> str:
    """Store a comparison result in the database."""
    await prisma_client.comparison.create(
        data={
            "questionId": result["question_id"],
            "candidateId": result["candidate_id"],
            "candidateSolution": result["candidate_solution"],
            "similarityScores": result["similarity_scores"],
            "timestamp": datetime.now()
        }
    )
    
    return f"Comparison result for candidate {result['candidate_id']} stored successfully"


# --------------------- LLM CODE GENERATION --------------------- #

def create_llm_toolkit():
    """Create LLM instances for code generation."""
    llm_list = {
        "gpt_1": ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.1,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        ),
        "gpt_2": ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.2,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        ),
        "gpt_3": ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.3,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
    }
    return llm_list


# Define the system prompt for code generation
code_gen_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a skilled programmer taking a coding test. Please solve the following programming problem. Write only the code as your answer, without explanations or additional text."),
    ("human", """
    Problem:
    {question_text}
    
    {constraints}
    
    Language: {language}
    """)
])


# --------------------- CODE COMPARISON --------------------- #

def calculate_code_similarity(code1: str, code2: str) -> float:
    """
    Calculate similarity between two code snippets using a simple Jaccard similarity.
    """
    # Simple character-based Jaccard similarity
    set1 = set(code1.replace(" ", "").replace("\n", ""))
    set2 = set(code2.replace(" ", "").replace("\n", ""))
    
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    
    if union == 0:
        return 0.0
    
    return intersection / union


# --------------------- LANGGRAPH WORKFLOW --------------------- #

async def initialize_state(question_id, candidate_id, candidate_solution):
    """Initialize the state for the pipeline."""
    # Connect to the database
    await connect_to_database.ainvoke("")
    
    # Get the question
    question = await get_question_from_db.ainvoke(question_id)
    
    return {
        "question": question,
        "llm_solutions": {},
        "candidate_solution": candidate_solution,
        "candidate_id": candidate_id,
        "similarity_scores": {},
        "status": "initialized",
        "error": ""
    }

async def generate_solution(llm, state, llm_name):
    """Generate code solution using the specified LLM."""
    question = state["question"]
    
    try:
        chain = code_gen_prompt | llm
        response = chain.invoke({
            "question_text": question["text"],
            "constraints": question.get("constraints", ""),
            "language": question.get("language", "Python")
        })
        
        solution = response.content
        state["llm_solutions"][llm_name] = solution
        
        # Use ainvoke for async tool
        solution_data = {
            "question_id": question["id"],
            "llm_name": llm_name,
            "solution": solution,
            "timestamp": datetime.now().isoformat()
        }
        await store_llm_solution.ainvoke(solution_data)
        
        return state
    except Exception as e:
        state["error"] = f"Error generating solution with {llm_name}: {str(e)}"
        return state

async def compare_solutions(state):
    """Compare candidate solution with all LLM solutions."""
    similarity_scores = {}
    
    candidate_solution = state["candidate_solution"]
    
    for llm_name, llm_solution in state["llm_solutions"].items():
        similarity_scores[llm_name] = calculate_code_similarity(
            candidate_solution, 
            llm_solution
        )
    
    state["similarity_scores"] = similarity_scores
    
    # Use ainvoke for async tool
    result_data = {
        "question_id": state["question"]["id"],
        "candidate_id": state["candidate_id"],
        "candidate_solution": state["candidate_solution"],
        "similarity_scores": similarity_scores,
        "timestamp": datetime.now().isoformat()
    }
    await store_comparison_result.ainvoke(result_data)
    
    return state

def build_code_comparison_graph():
    """Build the LangGraph workflow for code comparison."""
    # Create the LLM toolkit
    llm_toolkit = create_llm_toolkit()
    
    # Define the graph
    workflow = StateGraph(PipelineState)
    
    # Add the start node
    workflow.add_node("start", lambda x: x)
    
    # Then add other nodes and edges
    for llm_name, llm in llm_toolkit.items():
        workflow.add_node(f"generate_{llm_name}", lambda state, llm=llm, name=llm_name: generate_solution(llm, state, name))
        workflow.add_edge("start", f"generate_{llm_name}")
    
    # Add comparison node
    workflow.add_node("compare_solutions", compare_solutions)
    
    # Add disconnect node
    async def disconnect_node(state):
        await disconnect_from_database.ainvoke("")
        return state
    
    workflow.add_node("disconnect", disconnect_node)
    
    # Define the edges
    # Conditional edge: when all LLM solutions are generated, move to comparison
    def all_solutions_ready(state):
        expected_llms = list(create_llm_toolkit().keys())
        return set(expected_llms).issubset(set(state["llm_solutions"].keys()))
    
    # Connect all generate nodes to comparison when condition is met
    for llm_name in llm_toolkit.keys():
        workflow.add_conditional_edges(
            f"generate_{llm_name}",
            all_solutions_ready,
            {
                True: "compare_solutions",
                False: END  # Wait for other LLMs to complete
            }
        )
    
    # From comparison to disconnect
    workflow.add_edge("compare_solutions", "disconnect")
    
    # From disconnect to end
    workflow.add_edge("disconnect", END)
    
    # Set the entry point
    workflow.set_entry_point("start")
    
    return workflow.compile()


# --------------------- MAIN EXECUTION --------------------- #

async def run_code_comparison_pipeline(
    question_id: int, 
    candidate_id: str, 
    candidate_solution: str
):
    """
    Run the complete code comparison pipeline.
    
    Args:
        question_id: ID of the programming question
        candidate_id: ID of the candidate
        candidate_solution: The candidate's code solution
    
    Returns:
        Final state with comparison results
    """
    # Create the graph
    graph = build_code_comparison_graph()
    
    # Initialize the state
    initial_state = await initialize_state(
        question_id=question_id,
        candidate_id=candidate_id,
        candidate_solution=candidate_solution
    )
    
    # Run the graph without checkpointing
    result = await graph.ainvoke(initial_state)
    
    return result

# Example usage
if __name__ == "__main__":
    import asyncio
    
    async def main():
        # Example candidate solution
        candidate_solution = """
        def fibonacci(n):
            if n <= 0:
                return 0
            elif n == 1:
                return 1
            else:
                return fibonacci(n-1) + fibonacci(n-2)
        """
        
        # Run the pipeline
        final_state = await run_code_comparison_pipeline(
            question_id=1,
            candidate_id="candidate123",
            candidate_solution=candidate_solution
        )
        
        print("Pipeline completed")
        print("Similarity scores:", final_state["similarity_scores"])
    
    asyncio.run(main())