# Cognitive AI Arena: Algorithm Visualization & Benchmarking Dashboard

This repository contains the **Cognitive AI Arena**, a high-performance platform designed for the real-time visualization and benchmarking of advanced Artificial Intelligence paradigms. The system provides a unified interface to analyze search efficiency, optimization convergence, adversarial logic, and predictive performance modeling.

---

## 👥 Contributors

* **Muhammad Mohsin**: Lead Full-Stack Developer & AI Architect.
* **Ahmed Dawood**: Systems Integration & Collaborative Developer.

---

## 🧠 Strategic AI Modules

### 1. Spatial Search & Pathfinding

* **Algorithmic Suite**: Supports **Breadth-First Search (BFS)**, **Depth-First Search (DFS)**, and **A* Heuristic Search**.
* **Real-Time Benchmarking**: Captures live metrics including **Inference Latency (ms)** and **Nodes Explored**.
* **Interactive Environment**: Dynamic node placement and edge connectivity for testing edge-case graph topologies.

### 2. Combinatorial Optimization (TSP)

* **Strategy**: Solves the **Traveling Salesperson Problem** using the **Hill Climbing** optimization algorithm.
* **Convergence Visualization**: Utilizes a distance-over-iteration line chart to show path optimization in real-time.

### 3. Adversarial Decision Making

* **Engine**: Implements **Minimax Search** with **Alpha-Beta Pruning**.
* **Efficiency Analysis**: Quantifies the reduction in explored states achieved by mathematical pruning compared to standard minimax.

### 4. Knowledge-Based Logic (Wumpus World)

* **Simulation**: A logical reasoning agent navigating a hazardous 4x4 grid.
* **Inference Engine**: Employs **Propositional Logic** to classify cells as **Safe**, **Potential Pit**, or **Potential Wumpus** based on sensory percepts.

### 5. Algorithm Performance Oracle (ML Predictor)

A predictive suite that estimates computational requirements using advanced ML methodologies:

* **Multivariate Linear Regression**: Predicts execution time by analyzing grid dimensions and obstacle density.
* **Logistic Regression**: Evaluates mission feasibility, classifying configurations as **Safe** or **Risky** via **Sigmoid** probability mapping.
* **K-Means Clustering**: Clusters environmental data into complexity tiers (**Trivial**, **Standard**, **Intensive**) using centroid analysis.

---

## 🛠️ Technical Implementation

### Frontend Architecture

* **React.js**: Modular UI for real-time interaction.
* **Chart.js**: Statistical plotting for optimization and complexity analysis.
* **Axios**: Asynchronous API communication.

### Backend Infrastructure

* **FastAPI**: Asynchronous Python framework for low-latency inference.
* **Pydantic**: Strict data validation for complex algorithmic inputs.
* **Scikit-learn**: Foundations for predictive modeling and performance estimation.

---

## ⚙️ Installation & Deployment

### Backend Setup

1. Navigate to `/backend`.
2. Initialize environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

```


3. Install requirements:
```bash
pip install -r requirements.txt

```


4. Run service:
```bash
uvicorn main:app --reload

```



### Frontend Setup

1. Navigate to `/frontend`.
2. Install packages:
```bash
npm install

```


3. Launch dashboard:
```bash
npm start

```



---

## 📂 Project Organization

```text
Cognitive-AI-Arena/
├── backend/
│   ├── main.py              # API Endpoint Definitions
│   ├── wumpus_solver.py     # Logical Inference Solver
│   ├── ml_predictor.py      # Regression & Clustering Engine
│   ├── pathfinding.py       # Graph Search Solvers
│   └── requirements.txt     # Python Dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Visualizer UI Modules
│   │   ├── App.js           # Navigation & Layout
│   │   └── App.css          # Professional Navy/Blue Styling
│   └── package.json         # Client Dependencies
└── README.md

```