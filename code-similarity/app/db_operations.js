const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Fetch all Problems
        const problems = await prisma.problem.findMany();
        console.log('All Problems:', problems);

        // Fetch all Questions with their LLMSolutions
        const questions = await prisma.question.findMany({
            include: {
                LLMSolution: true,
                Comparison: true
            }
        });
        console.log('All Questions with Solutions:', questions);

        // Example of filtering Problems by difficulty
        const mediumProblems = await prisma.problem.findMany({
            where: {
                difficulty: 'MEDIUM'
            }
        });
        console.log('Medium Difficulty Problems:', mediumProblems);

        // Example of creating a new Problem
        const newProblem = await prisma.problem.create({
            data: {
                text: 'Write a function to find the factorial of a number',
                language: 'Python',
                difficulty: 'EASY',
                constraints: 'Time complexity should be O(n)'
            }
        });
        console.log('New Problem Created:', newProblem);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    }); 