import time
import math
import random

def calculate_total_distance(route, cities):
    dist = 0
    for i in range(len(route) - 1):
        x1, y1 = cities[route[i]]
        x2, y2 = cities[route[i+1]]
        dist += math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
    x1, y1 = cities[route[-1]]
    x2, y2 = cities[route[0]]
    dist += math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
    return dist

def run_hill_climbing(cities):
    start_time = time.perf_counter()
    num_cities = len(cities)
    
    if num_cities < 2:
        return {"error": "Need at least 2 cities"}

    current_route = list(range(num_cities))
    random.shuffle(current_route)
    current_dist = calculate_total_distance(current_route, cities)
    
    history = [list(current_route)]
    improved = True
    iterations = 0
    
    while improved and iterations < 1000:
        improved = False
        for i in range(num_cities - 1):
            for j in range(i + 1, num_cities):
                new_route = list(current_route)
                new_route[i], new_route[j] = new_route[j], new_route[i]
                new_dist = calculate_total_distance(new_route, cities)
                
                if new_dist < current_dist:
                    current_route = new_route
                    current_dist = new_dist
                    history.append(list(current_route))
                    improved = True
                    break 
            if improved:
                break
        iterations += 1

    end_time = time.perf_counter()
    
    return {
        "execution_time_ms": round((end_time - start_time) * 1000, 4),
        "generations_evaluated": iterations,
        "best_distance": round(current_dist, 2),
        "route_history": history,
        "best_route": current_route
    }