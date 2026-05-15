from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any
from pathfinding import run_bfs, run_dfs, run_astar
from tsp_solver import run_hill_climbing
from game_solver import run_minimax
from wumpus_solver import run_wumpus_inference
from ml_predictor import run_ml_prediction

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PathfindingConfig(BaseModel):
    nodes: List[dict]
    edges: List[List[int]]
    start: int
    goal: int
    algorithm: str

class TSPConfig(BaseModel):
    cities: List[List[int]]
    algorithm: str

class GameConfig(BaseModel):
    board: List[str]
    is_maximizing: bool
    use_alpha_beta: bool

class WumpusConfig(BaseModel):
    grid_size: int
    agent_position: List[int]
    discovered_percepts: List[List[Any]]

class MLConfig(BaseModel):
    grid_width: int
    grid_height: int
    obstacle_count: int

@app.post("/api/pathfinding")
async def execute_pathfinding(config: PathfindingConfig):
    if config.algorithm == "BFS":
        return run_bfs(config.nodes, config.edges, config.start, config.goal)
    elif config.algorithm == "DFS":
        return run_dfs(config.nodes, config.edges, config.start, config.goal)
    elif config.algorithm == "A_STAR":
        return run_astar(config.nodes, config.edges, config.start, config.goal)
    return {"error": "Invalid algorithm"}

@app.post("/api/tsp")
async def execute_tsp(config: TSPConfig):
    if config.algorithm == "HILL_CLIMBING":
        return run_hill_climbing(config.cities)
    return {"error": "Invalid algorithm"}

@app.post("/api/game")
async def execute_game(config: GameConfig):
    return run_minimax(config.board, config.is_maximizing, config.use_alpha_beta)

@app.post("/api/wumpus")
async def execute_wumpus(config: WumpusConfig):
    return run_wumpus_inference(config.grid_size, config.agent_position, config.discovered_percepts)

@app.post("/api/ml")
async def execute_ml(config: MLConfig):
    return run_ml_prediction(config.grid_width, config.grid_height, config.obstacle_count)