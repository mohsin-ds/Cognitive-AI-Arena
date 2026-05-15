import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import './TSP.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const TSPVisualizer = () => {
    const [cities, setCities] = useState([]);
    const [route, setRoute] = useState([]);
    const [distanceHistory, setDistanceHistory] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animSpeed, setAnimSpeed] = useState(40);

    const handleSVGClick = (e) => {
        if (isAnimating) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCities([...cities, [Math.round(x), Math.round(y)]]);
    };

    const generateRandomCities = () => {
        if (isAnimating) return;
        const randomCities = [];
        for (let i = 0; i < 12; i++) {
            randomCities.push([
                Math.floor(Math.random() * 700) + 50,
                Math.floor(Math.random() * 400) + 50
            ]);
        }
        setCities(randomCities);
        setRoute([]);
        setDistanceHistory([]);
        setMetrics(null);
    };

    const calculateDist = (currentRoute, currentCities) => {
        let d = 0;
        for (let i = 0; i < currentRoute.length - 1; i++) {
            const dx = currentCities[currentRoute[i]][0] - currentCities[currentRoute[i + 1]][0];
            const dy = currentCities[currentRoute[i]][1] - currentCities[currentRoute[i + 1]][1];
            d += Math.sqrt(dx * dx + dy * dy);
        }
        const ldx = currentCities[currentRoute[currentRoute.length - 1]][0] - currentCities[currentRoute[0]][0];
        const ldy = currentCities[currentRoute[currentRoute.length - 1]][1] - currentCities[currentRoute[0]][1];
        d += Math.sqrt(ldx * ldx + ldy * ldy);
        return Math.round(d);
    };

    const handleRunAlgorithm = async () => {
        if (cities.length < 3) {
            alert("Please add at least 3 houses.");
            return;
        }
        setIsAnimating(true);
        setDistanceHistory([]);
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/tsp', {
                cities: cities,
                algorithm: "HILL_CLIMBING"
            });
            const { route_history, execution_time_ms, generations_evaluated, best_distance } = response.data;
            setMetrics({ time: execution_time_ms, generations: generations_evaluated, distance: best_distance });
            animateOptimization(route_history);
        } catch (error) {
            console.error(error);
            alert("Backend Error");
            setIsAnimating(false);
        }
    };

    const animateOptimization = (routeHistory) => {
        let currentDistHistory = [];
        routeHistory.forEach((r, i) => {
            setTimeout(() => {
                setRoute(r);
                const d = calculateDist(r, cities);
                currentDistHistory.push(d);
                setDistanceHistory([...currentDistHistory]);
                if (i === routeHistory.length - 1) {
                    setIsAnimating(false);
                }
            }, i * animSpeed);
        });
    };

    const chartData = {
        labels: distanceHistory.map((_, i) => i),
        datasets: [{
            label: 'Path Distance',
            data: distanceHistory,
            borderColor: '#198754',
            backgroundColor: 'rgba(25, 135, 84, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 0
        }]
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="m-0 fw-bold text-primary">Optimization Arena (TSP)</h5>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                    <div className="d-flex align-items-center gap-2 me-2">
                        <span className="small fw-bold">Speed:</span>
                        <input type="range" min="10" max="200" value={animSpeed} onChange={(e) => setAnimSpeed(parseInt(e.target.value))} disabled={isAnimating} />
                    </div>
                    <button className="btn btn-outline-primary btn-sm" onClick={generateRandomCities} disabled={isAnimating}>🎲 Randomize</button>
                    <button className="btn btn-success btn-sm px-4 fw-bold" onClick={handleRunAlgorithm} disabled={isAnimating}>Optimize Path</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => { setCities([]); setRoute([]); setDistanceHistory([]); setMetrics(null); }}>Clear</button>
                </div>
            </div>

            <div className="card-body bg-light">
                <div className="row g-4">
                    <div className="col-12 col-xl-8">
                        <div className="bg-white shadow-sm rounded border p-2">
                            <svg className="tsp-canvas w-100" onClick={handleSVGClick} style={{ height: '500px' }}>
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="24" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#198754" />
                                    </marker>
                                </defs>
                                {route.map((cIdx, i) => {
                                    const start = cities[cIdx];
                                    const end = cities[route[i + 1] || route[0]];
                                    return (
                                        <line
                                            key={i}
                                            x1={start[0]} y1={start[1]}
                                            x2={end[0]} y2={end[1]}
                                            className={isAnimating ? "line-moving" : "line-fixed"}
                                            markerEnd={isAnimating ? "" : "url(#arrowhead)"}
                                        />
                                    );
                                })}
                                {cities.map((c, i) => (
                                    <g key={i}>
                                        <circle cx={c[0]} cy={c[1]} r="16" className="node-base" />
                                        <text x={c[0]} y={c[1]} dy=".35em" className="node-label">H{i}</text>
                                        {route.indexOf(i) !== -1 && !isAnimating && (
                                            <g>
                                                <rect x={c[0] - 22} y={c[1] - 40} width="44" height="18" rx="4" fill="#198754" />
                                                <text x={c[0]} y={c[1] - 27} className="order-label">#{route.indexOf(i) + 1}</text>
                                            </g>
                                        )}
                                    </g>
                                ))}
                            </svg>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="card h-100 border-0 shadow-sm p-4">
                            <h6 className="fw-bold border-bottom pb-2 mb-3">Convergence Intelligence</h6>
                            <div className="mb-4" style={{ height: '220px' }}>
                                <Line
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: { x: { display: false }, y: { beginAtZero: false } },
                                        plugins: { legend: { display: false } }
                                    }}
                                />
                            </div>
                            <div className="mt-auto">
                                <div className="metric-row d-flex justify-content-between mb-3">
                                    <span className="text-muted small">Optimized Distance:</span>
                                    <span className="fw-bold text-success">{distanceHistory[distanceHistory.length - 1] || 0} px</span>
                                </div>
                                <div className="metric-row d-flex justify-content-between mb-3">
                                    <span className="text-muted small">Successive Improvements:</span>
                                    <span className="fw-bold text-primary">{distanceHistory.length}</span>
                                </div>
                                <div className="metric-row d-flex justify-content-between mb-0">
                                    <span className="text-muted small">Compute Latency:</span>
                                    <span className="fw-bold text-dark">{metrics ? metrics.time : 0} ms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TSPVisualizer;