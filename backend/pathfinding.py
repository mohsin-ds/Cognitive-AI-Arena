import time
import math
from collections import deque
import heapq

def get_adjacency_list(nodes, edges):
    adj = {n['id']: [] for n in nodes}
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    return adj

def euclidean_distance(n1, n2):
    return math.sqrt((n1['x'] - n2['x'])**2 + (n1['y'] - n2['y'])**2)

def run_bfs(nodes, edges, start, goal):
    start_time = time.perf_counter()
    adj = get_adjacency_list(nodes, edges)
    
    if start not in adj or goal not in adj:
        return {"error": "Invalid start or goal node"}
        
    queue = deque([[start]])
    visited = {start}
    explored_history = []
    final_path = []
    
    while queue:
        path = queue.popleft()
        current = path[-1]
        
        if current != start and current != goal:
            explored_history.append(current)
            
        if current == goal:
            final_path = path
            break
            
        for neighbor in adj[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                new_path = list(path)
                new_path.append(neighbor)
                queue.append(new_path)
                
    end_time = time.perf_counter()
    return {
        "execution_time_ms": round((end_time - start_time) * 1000, 4),
        "nodes_explored_count": len(explored_history),
        "explored_history": explored_history,
        "final_path": final_path
    }

def run_dfs(nodes, edges, start, goal):
    start_time = time.perf_counter()
    adj = get_adjacency_list(nodes, edges)
    
    if start not in adj or goal not in adj:
        return {"error": "Invalid start or goal node"}
        
    stack = [[start]]
    visited = {start}
    explored_history = []
    final_path = []
    
    while stack:
        path = stack.pop()
        current = path[-1]
        
        if current != start and current != goal:
            if current not in explored_history:
                explored_history.append(current)
            
        if current == goal:
            final_path = path
            break
            
        for neighbor in adj[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                new_path = list(path)
                new_path.append(neighbor)
                stack.append(new_path)
                
    end_time = time.perf_counter()
    return {
        "execution_time_ms": round((end_time - start_time) * 1000, 4),
        "nodes_explored_count": len(explored_history),
        "explored_history": explored_history,
        "final_path": final_path
    }

def run_astar(nodes, edges, start, goal):
    start_time = time.perf_counter()
    adj = get_adjacency_list(nodes, edges)
    node_dict = {n['id']: n for n in nodes}
    
    if start not in adj or goal not in adj:
        return {"error": "Invalid start or goal node"}
        
    goal_node = node_dict[goal]
    
    pq = []
    heapq.heappush(pq, (0, 0, start, [start]))
    tie_breaker = 1
    
    g_scores = {start: 0}
    explored_history = []
    final_path = []
    
    while pq:
        _, _, current, path = heapq.heappop(pq)
        
        if current != start and current != goal:
            if current not in explored_history:
                explored_history.append(current)
                
        if current == goal:
            final_path = path
            break
            
        current_node_data = node_dict[current]
        
        for neighbor in adj[current]:
            neighbor_node_data = node_dict[neighbor]
            
            tentative_g_score = g_scores[current] + euclidean_distance(current_node_data, neighbor_node_data)
            
            if neighbor not in g_scores or tentative_g_score < g_scores[neighbor]:
                g_scores[neighbor] = tentative_g_score
                f_score = tentative_g_score + euclidean_distance(neighbor_node_data, goal_node)
                
                new_path = list(path)
                new_path.append(neighbor)
                heapq.heappush(pq, (f_score, tie_breaker, neighbor, new_path))
                tie_breaker += 1
                
    end_time = time.perf_counter()
    return {
        "execution_time_ms": round((end_time - start_time) * 1000, 4),
        "nodes_explored_count": len(explored_history),
        "explored_history": explored_history,
        "final_path": final_path
    }