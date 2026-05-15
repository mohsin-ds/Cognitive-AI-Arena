import React, { useState } from 'react';
import axios from 'axios';
import './Game.css';

const GameVisualizer = () => {
    const [board, setBoard] = useState(Array(9).fill(""));
    const [usePruning, setUsePruning] = useState(true);
    const [metrics, setMetrics] = useState(null);
    const [winner, setWinner] = useState(null);
    const [isThinking, setIsThinking] = useState(false);

    const checkWinnerLocal = (currentBoard) => {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (let line of lines) {
            const [a, b, c] = line;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return currentBoard[a];
            }
        }
        if (!currentBoard.includes("")) return "Tie";
        return null;
    };

    const handleCellClick = async (index) => {
        if (board[index] !== "" || winner || isThinking) return;

        const newBoard = [...board];
        newBoard[index] = "X";
        setBoard(newBoard);

        const winStatus = checkWinnerLocal(newBoard);
        if (winStatus) {
            setWinner(winStatus);
            return;
        }

        setIsThinking(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/game', {
                board: newBoard,
                is_maximizing: true,
                use_alpha_beta: usePruning
            });

            const { best_move, nodes_explored, execution_time_ms } = response.data;
            const aiBoard = [...newBoard];
            if (best_move !== -1) {
                aiBoard[best_move] = "O";
                setBoard(aiBoard);
                setMetrics({ nodes: nodes_explored, time: execution_time_ms });
                const finalWinStatus = checkWinnerLocal(aiBoard);
                if (finalWinStatus) setWinner(finalWinStatus);
            }
        } catch (error) {
            alert("Backend Error: Ensure FastAPI is running.");
        } finally {
            setIsThinking(false);
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(""));
        setWinner(null);
        setMetrics(null);
        setIsThinking(false);
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="m-0 fw-bold text-primary">Adversarial Search (Minimax)</h5>
                <button className="btn btn-outline-danger btn-sm" onClick={resetGame}>Reset Game</button>
            </div>

            <div className="card-body bg-light">
                <div className="row g-4">
                    <div className="col-12 col-xl-8">
                        <div className="game-workspace p-4 bg-white rounded border shadow-sm d-flex justify-content-center align-items-center">
                            <div className="ttt-grid">
                                {board.map((cell, i) => (
                                    <div
                                        key={i}
                                        className={`ttt-cell ${cell === "X" ? "cell-x" : cell === "O" ? "cell-o" : ""} ${isThinking || winner ? "cell-disabled" : ""}`}
                                        onClick={() => handleCellClick(i)}
                                    >
                                        {cell}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="card h-100 border-0 shadow-sm p-4">
                            <h6 className="fw-bold mb-3 border-bottom pb-2">AI Engine Intelligence</h6>

                            <div className="form-check form-switch mb-4">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={usePruning}
                                    onChange={() => setUsePruning(!usePruning)}
                                    disabled={isThinking}
                                />
                                <label className="form-check-label small fw-bold">Alpha-Beta Pruning</label>
                            </div>

                            {winner && (
                                <div className={`alert ${winner === "Tie" ? "alert-secondary" : "alert-success"} text-center fw-bold mb-4`}>
                                    {winner === "Tie" ? "Game Tie! 🤝" : winner === "O" ? "AI Wins! 🤖" : "You Win! 🏆"}
                                </div>
                            )}

                            <div className="metrics-panel mt-auto">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Nodes Visited:</span>
                                    <span className="fw-bold text-dark">{metrics ? metrics.nodes : 0}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="text-muted small">Search Latency:</span>
                                    <span className="fw-bold text-primary">{metrics ? metrics.time : 0} ms</span>
                                </div>

                                {usePruning && !winner && (
                                    <div className="alert alert-info border-0 shadow-sm small py-2 mb-0">
                                        <strong>Efficiency:</strong> Pruning is reducing state exploration in real-time.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameVisualizer;