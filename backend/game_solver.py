import time

def check_winner(board):
    win_states = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]
    for win in win_states:
        if board[win[0]] == board[win[1]] == board[win[2]] and board[win[0]] != "":
            return board[win[0]]
    if "" not in board:
        return "Tie"
    return None

def minimax(board, depth, is_maximizing, alpha, beta, use_pruning, counter):
    counter['nodes'] += 1
    winner = check_winner(board)
    
    if winner == "O": return 10 - depth
    if winner == "X": return depth - 10
    if winner == "Tie": return 0

    if is_maximizing:
        best_score = -float('inf')
        for i in range(9):
            if board[i] == "":
                board[i] = "O"
                score = minimax(board, depth + 1, False, alpha, beta, use_pruning, counter)
                board[i] = ""
                best_score = max(score, best_score)
                if use_pruning:
                    alpha = max(alpha, best_score)
                    if beta <= alpha:
                        break
        return best_score
    else:
        best_score = float('inf')
        for i in range(9):
            if board[i] == "":
                board[i] = "X"
                score = minimax(board, depth + 1, True, alpha, beta, use_pruning, counter)
                board[i] = ""
                best_score = min(score, best_score)
                if use_pruning:
                    beta = min(beta, best_score)
                    if beta <= alpha:
                        break
        return best_score

def run_minimax(board, is_maximizing, use_alpha_beta):
    start_time = time.perf_counter()
    counter = {'nodes': 0}
    
    best_score = -float('inf')
    best_move = -1
    
    for i in range(9):
        if board[i] == "":
            board[i] = "O"
            score = minimax(board, 0, False, -float('inf'), float('inf'), use_alpha_beta, counter)
            board[i] = ""
            if score > best_score:
                best_score = score
                best_move = i
                
    end_time = time.perf_counter()
    
    return {
        "best_move": best_move,
        "nodes_explored": counter['nodes'],
        "execution_time_ms": round((end_time - start_time) * 1000, 4)
    }