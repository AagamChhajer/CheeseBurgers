# Proctoring System: Data Collection and Training Guide

## **Overview**
This document outlines the process for setting up a controlled environment to simulate exam sessions, collect data, manually flag suspicious behavior, and prepare the dataset for training AI models in the proctoring system.

---

## **1. Environment Setup**

- **Simulated Exam Interface:**
  - Develop a mock exam portal that replicates the actual proctoring environment.
  - Ensure functionalities for user interactions (answering questions, navigation) are included.

- **Logging Mechanism:**
  - Implement detailed logging for key behavior metrics such as mouse activity, typing speed, clipboard actions, and inactivity.
  - Include timestamps for all logged events.

- **WebSocket Integration:**
  - Simulate real-time data flow using WebSockets to mirror production behavior.
  - Ensure encrypted event logs are sent through WebSockets for security.

---

## **2. Session Planning**

- **Session Variety:**
  - Conduct 10-20 simulated sessions with varying levels of suspicious behavior.
  
  - **Types of Sessions:**
    - **Normal Behavior:** No suspicious activities, focused engagement.
    - **Mild Suspicion:** Occasional tab switching, brief inactivity, irregular typing patterns.
    - **High Suspicion:** Frequent copy-pasting, extended inactivity, use of unauthorized tools.

- **Data Points to Capture:**
  - **Mouse Activity:** Track inactivity and idle time.
  - **Keystroke Dynamics:** Measure typing speed and patterns.
  - **Clipboard Actions:** Detect copy-paste operations.
  - **Prolonged Inactivity:** Identify long periods of inactivity.
  - **Browser Extensions:** Detect the presence of suspicious extensions.

---

## **3. Manual Flagging & Rating**

- **Flagging Criteria:**
  - Post-session, manually review logs to flag any suspicious behaviors.
  - Document flagged events with context and explanations.

- **Risk Rating Scale:**
  - **1-2:** Low Risk (Standard behavior with minimal anomalies).
  - **3-4:** Medium Risk (Notable but less severe suspicious activities).
  - **5:** High Risk (Frequent or critical suspicious behaviors).

---

## **4. Data Labeling and Storage**

- **Dataset Structure:**
  - Each record should contain the following fields:
    - `session_id`
    - `user_behavior_log`
    - `anomaly_events`
    - `manual_rating`
    - `comments`

- **Storage Guidelines:**
  - Store the data in a version-controlled repository.
  - Maintain backups and document any data transformations.

---

## **5. Training Suggestions**

- **Balanced Dataset:**
  - Ensure an even distribution of low, medium, and high-risk examples to avoid model bias.

- **Feature Engineering:**
  - Focus on meaningful features such as:
    - Frequency and duration of copy-paste actions.
    - Length and frequency of inactivity periods.
    - Variations in typing speed and patterns.

- **Baseline Model Approach:**
  - Start with simpler models like Random Forests for initial benchmarking.
  - Progress to complex models like Reinforcement Learning (RL) or LSTMs based on initial results.

---

## **Next Steps**
- **Data Collection:** Begin the simulation and data collection process.
- **Manual Review:** Flag and rate the collected data.
- **Model Training:** Utilize the labeled data to train and refine AI models.
- **Evaluation:** Continuously test and validate the models against new data.

---

> **Note:** Regularly review and update this document as you refine the data collection and training process.

---

For any queries or support during the development, refer to this guide or reach out to the project lead.