import React, { useState } from 'react';
import axios from 'axios';
import './Wumpus.css';

const WumpusVisualizer = () => {
    const GRID_SIZE = 4;
    const [mode, setMode] = useState('DESIGN');
    const [world, setWorld] = useState(
        Array(GRID_SIZE).fill(null).map(() =>
            Array(GRID_SIZE).fill(null).map(() => ({ pit: false, wumpus: false, gold: false, percepts: [] }))
        )
    );
    const [agentPos, setAgentPos] = useState([3, 0]);
    const [visited, setVisited] = useState([]);
    const [logicMap, setLogicMap] = useState(Array(4).fill(Array(4).fill("UNKNOWN")));
    const [metrics, setMetrics] = useState(null);
    const [gameOver, setGameOver] = useState(null);

    const handleCellClick = (r, c) => {
        if (gameOver) return;

        if (mode === 'DESIGN') {
            if (r === 3 && c === 0) return;
            const newWorld = [...world];
            const cell = { ...newWorld[r][c] };
            if (!cell.pit && !cell.wumpus && !cell.gold) cell.pit = true;
            else if (cell.pit) { cell.pit = false; cell.wumpus = true; }
            else if (cell.wumpus) { cell.wumpus = false; cell.gold = true; }
            else { cell.gold = false; }
            newWorld[r][c] = cell;
            setWorld(newWorld);
        } else {
            const [ar, ac] = agentPos;
            const isAdjacent = (Math.abs(ar - r) === 1 && ac === c) || (Math.abs(ac - c) === 1 && ar === r);
            if (isAdjacent) moveAgent(r, c);
        }
    };

    const startMission = () => {
        const hasGold = world.flat().some(c => c.gold);
        if (!hasGold) return alert("Place the Gold (💰) first!");

        const processedWorld = world.map((row, r) => row.map((cell, c) => {
            let p = [];
            const adj = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
            adj.forEach(([ar, ac]) => {
                if (ar >= 0 && ar < GRID_SIZE && ac >= 0 && ac < GRID_SIZE) {
                    if (world[ar][ac].pit) p.push("BREEZE");
                    if (world[ar][ac].wumpus) p.push("STENCH");
                }
            });
            if (cell.gold) p.push("GLITTER");
            return { ...cell, percepts: p };
        }));

        setWorld(processedWorld);
        const initialVisited = [{ r: 3, c: 0, p: processedWorld[3][0].percepts }];
        setVisited(initialVisited);
        setMode('MISSION');
        triggerInference([3, 0], initialVisited);
    };

    const moveAgent = async (nr, nc) => {
        const newPos = [nr, nc];
        const newPercept = world[nr][nc].percepts;
        const newVisited = [...visited, { r: nr, c: nc, p: newPercept }];

        setAgentPos(newPos);
        setVisited(newVisited);

        if (world[nr][nc].pit || world[nr][nc].wumpus) {
            setGameOver("LOST");
            return;
        }
        if (world[nr][nc].gold) {
            setGameOver("WON");
            return;
        }

        triggerInference(newPos, newVisited);
    };

    const triggerInference = async (pos, history) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/wumpus', {
                grid_size: GRID_SIZE,
                agent_position: pos,
                discovered_percepts: history.map(v => [v.r, v.c, v.p || []])
            });
            setLogicMap(response.data.logic_grid);
            setMetrics({ time: response.data.execution_time_ms });
        } catch (e) {
            console.error(e);
        }
    };

    const resetDesigner = () => {
        setMode('DESIGN');
        setWorld(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ pit: false, wumpus: false, gold: false, percepts: [] }))));
        setAgentPos([3, 0]);
        setVisited([]);
        setLogicMap(Array(4).fill(Array(4).fill("UNKNOWN")));
        setGameOver(null);
        setMetrics(null);
    };

    const currentCell = world[agentPos[0]][agentPos[1]];

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="m-0 fw-bold text-primary">Logical Reasoning (Wumpus World)</h5>
                {mode === 'DESIGN' ? (
                    <button className="btn btn-primary px-4 fw-bold" onClick={startMission}>Launch Mission</button>
                ) : (
                    <button className="btn btn-outline-secondary btn-sm" onClick={resetDesigner}>Designer</button>
                )}
            </div>

            <div className="card-body bg-light">
                <div className="row g-4 justify-content-center">
                    <div className="col-12 col-lg-7">
                        <div className="grid-frame p-3 bg-white shadow-sm rounded border">
                            <div className="wumpus-grid">
                                {world.map((row, r) => row.map((cell, c) => {
                                    const isAgent = agentPos[0] === r && agentPos[1] === c;
                                    const isVisited = visited.some(v => v.r === r && v.c === c);
                                    const logic = logicMap[r][c];
                                    const [ar, ac] = agentPos;
                                    const isAdjacent = (Math.abs(ar - r) === 1 && ac === c) || (Math.abs(ac - c) === 1 && ar === r);
                                    const isClickable = mode === 'DESIGN' ? (r !== 3 || c !== 0) : (isAdjacent && !gameOver);

                                    return (
                                        <div
                                            key={`${r}-${c}`}
                                            className={`w-cell ${mode === 'DESIGN' ? 'design-cell' : isVisited ? 'mission-visited' : 'mission-hidden'} ${isClickable ? 'clickable' : ''}`}
                                            onClick={() => handleCellClick(r, c)}
                                        >
                                            <div className="cell-content">
                                                {mode === 'DESIGN' ? (
                                                    <div className="design-view">
                                                        {cell.pit && <span>🕳️</span>}
                                                        {cell.wumpus && <span>👹</span>}
                                                        {cell.gold && <span>💰</span>}
                                                        {r === 3 && c === 0 && <div className="start-label">START</div>}
                                                    </div>
                                                ) : (
                                                    <div className="mission-view">
                                                        {isAgent && <span className="agent-entity animate-pulse">🕵️</span>}
                                                        {isVisited && !isAgent && (
                                                            <div className="percepts-view">
                                                                {cell.pit && <span>🕳️</span>}
                                                                {cell.wumpus && <span>👹</span>}
                                                                {cell.gold && <span>💰</span>}
                                                                {!cell.pit && !cell.wumpus && !cell.gold && cell.percepts.length > 0 && <span className="small-text">{cell.percepts[0]}</span>}
                                                            </div>
                                                        )}
                                                        {!isVisited && logic !== "UNKNOWN" && (
                                                            <div className={`logic-pill ${logic.toLowerCase()}`}>
                                                                {logic.replace("POSSIBLE_", "? ")}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }))}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-5">
                        <div className="card h-100 border-0 shadow-sm p-4">
                            <h6 className="fw-bold mb-3 border-bottom pb-2">Status Panel</h6>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Reasoning Time:</span>
                                    <span className="fw-bold text-primary">{metrics ? metrics.time : 0} ms</span>
                                </div>
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="text-muted small">Current Percepts:</span>
                                    <span className="fw-bold text-warning">
                                        {mode === 'MISSION' && currentCell.percepts.length > 0 ? currentCell.percepts.join(', ') : "NONE"}
                                    </span>
                                </div>
                                {gameOver && (
                                    <div className={`alert ${gameOver === 'WON' ? 'alert-success' : 'alert-danger'} fw-bold text-center`}>
                                        {gameOver === 'WON' ? "GOLD ACHIEVED!" : "MISSION FAILED"}
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

export default WumpusVisualizer;