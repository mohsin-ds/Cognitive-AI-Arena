import React, { useState, useRef } from 'react';
import axios from 'axios';
import './Pathfinding.css';

const PathfindingVisualizer = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [nextNodeId, setNextNodeId] = useState(0);
    const [startNode, setStartNode] = useState(null);
    const [goalNode, setGoalNode] = useState(null);
    const [mode, setMode] = useState('ADD_NODE');
    const [selectedForEdge, setSelectedForEdge] = useState(null);
    const [algorithm, setAlgorithm] = useState('BFS');
    const [metrics, setMetrics] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const svgRef = useRef(null);

    const handleSvgClick = (e) => {
        if (mode !== 'ADD_NODE' || isAnimating) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setNodes([...nodes, { id: nextNodeId, x, y }]);
        setNextNodeId(nextNodeId + 1);
    };

    const handleNodeClick = (e, nodeId) => {
        e.stopPropagation();
        if (isAnimating) return;
        if (mode === 'SET_START') {
            setStartNode(nodeId);
            if (goalNode === nodeId) setGoalNode(null);
        } else if (mode === 'SET_GOAL') {
            setGoalNode(nodeId);
            if (startNode === nodeId) setStartNode(null);
        } else if (mode === 'ADD_EDGE') {
            if (selectedForEdge === null) {
                setSelectedForEdge(nodeId);
            } else {
                if (selectedForEdge !== nodeId) {
                    const edgeExists = edges.some(edge =>
                        (edge[0] === selectedForEdge && edge[1] === nodeId) ||
                        (edge[0] === nodeId && edge[1] === selectedForEdge)
                    );
                    if (!edgeExists) setEdges([...edges, [selectedForEdge, nodeId]]);
                }
                setSelectedForEdge(null);
            }
        } else if (mode === 'DELETE') {
            setNodes(nodes.filter(n => n.id !== nodeId));
            setEdges(edges.filter(e => e[0] !== nodeId && e[1] !== nodeId));
            if (startNode === nodeId) setStartNode(null);
            if (goalNode === nodeId) setGoalNode(null);
        }
    };

    const handleRunAlgorithm = async () => {
        if (startNode === null || goalNode === null) {
            alert("Set a Start and Goal Node first.");
            return;
        }
        if (isAnimating) return;
        setIsAnimating(true);
        resetAnimations();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/pathfinding', { nodes, edges, start: startNode, goal: goalNode, algorithm });
            const { explored_history, final_path, execution_time_ms, nodes_explored_count } = response.data;
            setMetrics({ time: execution_time_ms, nodes: nodes_explored_count });
            if (!final_path || final_path.length === 0) {
                alert("No path found!");
                setIsAnimating(false);
                return;
            }
            animateAlgorithm(explored_history, final_path);
        } catch (error) {
            alert("Backend Error");
            setIsAnimating(false);
        }
    };

    const animateAlgorithm = (exploredNodes, shortestPath) => {
        for (let i = 0; i <= exploredNodes.length; i++) {
            if (i === exploredNodes.length) {
                setTimeout(() => animateShortestPath(shortestPath), 30 * i);
                return;
            }
            setTimeout(() => {
                document.getElementById(`node-${exploredNodes[i]}`)?.classList.add('graph-node-visited');
            }, 30 * i);
        }
    };

    const animateShortestPath = (shortestPath) => {
        for (let i = 0; i < shortestPath.length; i++) {
            setTimeout(() => {
                const nodeId = shortestPath[i];
                if (i > 0) {
                    const prevId = shortestPath[i - 1];
                    const edgeEl = document.getElementById(`edge-${prevId}-${nodeId}`) || document.getElementById(`edge-${nodeId}-${prevId}`);
                    if (edgeEl) edgeEl.classList.add('graph-edge-path');
                }
                const nodeEl = document.getElementById(`node-${nodeId}`);
                if (nodeEl && nodeId !== startNode && nodeId !== goalNode) {
                    nodeEl.classList.remove('graph-node-visited');
                    nodeEl.classList.add('graph-node-path');
                }
                if (i === shortestPath.length - 1) setIsAnimating(false);
            }, 80 * i);
        }
    };

    const resetAnimations = () => {
        nodes.forEach(n => document.getElementById(`node-${n.id}`)?.classList.remove('graph-node-visited', 'graph-node-path'));
        edges.forEach(e => {
            document.getElementById(`edge-${e[0]}-${e[1]}`)?.classList.remove('graph-edge-path');
            document.getElementById(`edge-${e[1]}-${e[0]}`)?.classList.remove('graph-edge-path');
        });
    };

    const clearGraph = () => {
        setNodes([]); setEdges([]); setStartNode(null); setGoalNode(null); setNextNodeId(0); setMetrics(null); setSelectedForEdge(null);
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="m-0 fw-bold text-primary">Spatial Graph Pathfinding</h5>
                <button className="btn btn-outline-danger btn-sm" onClick={clearGraph} disabled={isAnimating}>Clear Map</button>
            </div>

            <div className="card-body bg-light">
                <div className="row g-4">
                    <div className="col-12 col-xl-8">
                        <div className="graph-workspace p-3 bg-white rounded border shadow-sm h-100">
                            <div className="d-flex flex-wrap gap-2 mb-3 p-2 bg-light rounded border">
                                <button className={`btn btn-sm ${mode === 'ADD_NODE' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setMode('ADD_NODE')} disabled={isAnimating}>➕ Node</button>
                                <button className={`btn btn-sm ${mode === 'ADD_EDGE' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => { setMode('ADD_EDGE'); setSelectedForEdge(null); }} disabled={isAnimating}>🔗 Connect</button>
                                <div className="vr mx-1 d-none d-md-block"></div>
                                <button className={`btn btn-sm ${mode === 'SET_START' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setMode('SET_START')} disabled={isAnimating}>🟢 Start</button>
                                <button className={`btn btn-sm ${mode === 'SET_GOAL' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setMode('SET_GOAL')} disabled={isAnimating}>🔴 Goal</button>
                                <div className="vr mx-1 d-none d-md-block"></div>
                                <button className={`btn btn-sm ${mode === 'DELETE' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setMode('DELETE')} disabled={isAnimating}>🗑️ Delete</button>
                            </div>
                            <svg ref={svgRef} className="graph-canvas w-100" onClick={handleSvgClick}>
                                {edges.map((edge, idx) => {
                                    const n1 = nodes.find(n => n.id === edge[0]);
                                    const n2 = nodes.find(n => n.id === edge[1]);
                                    if (!n1 || !n2) return null;
                                    return <line key={idx} id={`edge-${n1.id}-${n2.id}`} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} className="graph-edge" />;
                                })}
                                {nodes.map((node) => {
                                    let nClass = "graph-node";
                                    if (node.id === startNode) nClass += " graph-node-start";
                                    else if (node.id === goalNode) nClass += " graph-node-goal";
                                    else if (node.id === selectedForEdge) nClass += " graph-node-selected";
                                    return <circle key={node.id} id={`node-${node.id}`} cx={node.x} cy={node.y} r="16" className={nClass} onClick={(e) => handleNodeClick(e, node.id)} />;
                                })}
                            </svg>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="card h-100 border-0 shadow-sm p-4">
                            <h6 className="fw-bold mb-3 border-bottom pb-2">Algorithm Intelligence</h6>
                            <div className="mb-4">
                                <label className="form-label small fw-bold">Search Method</label>
                                <select className="form-select mb-3" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} disabled={isAnimating}>
                                    <option value="BFS">Breadth-First Search (BFS)</option>
                                    <option value="DFS">Depth-First Search (DFS)</option>
                                    <option value="A_STAR">A* Heuristic Search</option>
                                </select>
                                <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleRunAlgorithm} disabled={isAnimating}>Execute Search</button>
                            </div>

                            <div className="mt-auto pt-3 border-top">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Inference Speed:</span>
                                    <span className="fw-bold text-primary">{metrics ? metrics.time : 0} ms</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted small">Nodes Explored:</span>
                                    <span className="fw-bold">{metrics ? metrics.nodes : 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PathfindingVisualizer;