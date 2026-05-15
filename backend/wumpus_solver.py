import time

def run_wumpus_inference(grid_size, agent_pos, discovered_percepts):
    start_time = time.perf_counter()
    
    knowledge_grid = [["UNKNOWN" for _ in range(grid_size)] for _ in range(grid_size)]
    
    safe_cells = set()
    possible_pits = set()
    possible_wumpus = set()
    
    for r, c, percept in discovered_percepts:
        knowledge_grid[r][c] = "VISITED"
        safe_cells.add((r, c))
        
        adj = []
        if r > 0: adj.append((r-1, c))
        if r < grid_size - 1: adj.append((r+1, c))
        if c > 0: adj.append((r, c-1))
        if c < grid_size - 1: adj.append((r, c+1))
        
        if "BREEZE" not in percept and "STENCH" not in percept:
            for ar, ac in adj:
                safe_cells.add((ar, ac))
        
        if "BREEZE" in percept:
            for ar, ac in adj:
                if (ar, ac) not in safe_cells:
                    possible_pits.add((ar, ac))
                    
        if "STENCH" in percept:
            for ar, ac in adj:
                if (ar, ac) not in safe_cells:
                    possible_wumpus.add((ar, ac))

    for r in range(grid_size):
        for c in range(grid_size):
            if (r, c) in safe_cells and knowledge_grid[r][c] != "VISITED":
                knowledge_grid[r][c] = "SAFE"
            elif (r, c) in possible_pits and (r, c) in possible_wumpus:
                knowledge_grid[r][c] = "DANGER_BOTH"
            elif (r, c) in possible_pits:
                knowledge_grid[r][c] = "POSSIBLE_PIT"
            elif (r, c) in possible_wumpus:
                knowledge_grid[r][c] = "POSSIBLE_WUMPUS"

    end_time = time.perf_counter()
    
    return {
        "logic_grid": knowledge_grid,
        "execution_time_ms": round((end_time - start_time) * 1000, 4)
    }