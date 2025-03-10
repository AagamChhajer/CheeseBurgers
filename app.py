import streamlit as st
import time
import random
import pyautogui
from datetime import datetime
import pandas as pd

# Initialize data storage
event_logs = []

# Function to log events
def log_event(event_type, details=None):
    timestamp = datetime.now()
    event_logs.append({"timestamp": timestamp, "event_type": event_type, "details": details})

# Streamlit UI
st.set_page_config(layout="wide")
st.title("Coding Test Platform")

# Display question
st.header("Question")
question = """
Write a function that takes a list of integers and returns the sum of the integers.
Example:
Input: [1, 2, 3, 4]
Output: 10
"""
st.write(question)

# Display scope
st.header("Scope")
scope = """
- The function should handle an empty list.
- The function should handle negative integers.
- The function should handle large lists efficiently.
"""
st.write(scope)

# Display test cases
st.header("Test Cases")
test_cases = """
1. Input: [1, 2, 3, 4], Output: 10
2. Input: [-1, -2, -3, -4], Output: -10
3. Input: [], Output: 0
4. Input: [1000000, 2000000, 3000000], Output: 6000000
"""
st.write(test_cases)

# Coding area
st.header("Coding Area")
code = st.text_area("Write your code here", height=300)

# Button to submit code
if st.button("Submit Code"):
    log_event("code_submitted", {"code": code})
    st.write("Code submitted successfully!")

# Display collected data
st.header("Event Logs")
st.dataframe(pd.DataFrame(event_logs))

# Simulate mouse movements and keystrokes
def simulate_user_interactions():
    for _ in range(5):
        x, y = random.randint(200, 1200), random.randint(150, 700)
        pyautogui.moveTo(x, y, duration=random.uniform(0.5, 2.0))
        log_event("mouse_move", {"x": x, "y": y})
        time.sleep(random.uniform(0.5, 2))

    keys = ["a", "b", "c", "d", "e"]
    for key in keys:
        pyautogui.press(key)
        log_event("key_press", {"key": key})
        time.sleep(random.uniform(0.5, 1))

if st.button("Simulate User Interactions"):
    simulate_user_interactions()
    st.write("User interactions simulated.")

# Run the Streamlit app
if __name__ == '__main__':
    st.write("Coding test platform is running.")