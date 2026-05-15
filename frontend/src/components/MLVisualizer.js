import React, { useState } from 'react';
import axios from 'axios';
import { Scatter, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './ML.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const MLVisualizer = () => {
    const [inputs, setInputs] = useState({ width: 20, height: 20, obstacles: 50 });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/ml', {
                grid_width: parseInt(inputs.width),
                grid_height: parseInt(inputs.height),
                obstacle_count: parseInt(inputs.obstacles)
            });
            setData(response.data);
        } catch (e) {
            alert("ML Service Unavailable");
        } finally {
            setLoading(false);
        }
    };

    const scatterData = {
        datasets: [
            {
                label: 'Cluster Centroids',
                data: [
                    { x: 500, y: 5 }, { x: 2500, y: 25 }, { x: 5000, y: 60 }
                ],
                backgroundColor: '#adb5bd',
                pointRadius: 6,
            },
            {
                label: 'Current Configuration',
                data: [{
                    x: data?.clustering.complexity_score || 0,
                    y: data?.regression.predicted_time_ms || 0
                }],
                backgroundColor: '#6610f2',
                pointRadius: 10,
            }
        ]
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white p-3 border-bottom">
                <h5 className="m-0 fw-bold text-dark">Algorithm Performance Oracle</h5>
            </div>

            <div className="card-body bg-light">
                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="card p-3 border-0 shadow-sm">
                            <h6 className="fw-bold mb-4">Feature Selection</h6>
                            <div className="mb-3">
                                <label className="small fw-bold">Grid Dimensions: {inputs.width}x{inputs.height}</label>
                                <input type="range" className="form-range" min="10" max="100" value={inputs.width}
                                    onChange={(e) => setInputs({ ...inputs, width: e.target.value, height: e.target.value })} />
                            </div>
                            <div className="mb-4">
                                <label className="small fw-bold">Obstacle Density: {inputs.obstacles}</label>
                                <input type="range" className="form-range" min="0" max="500" value={inputs.obstacles}
                                    onChange={(e) => setInputs({ ...inputs, obstacles: e.target.value })} />
                            </div>
                            <button className="btn btn-primary w-100 fw-bold" onClick={handlePredict} disabled={loading}>
                                {loading ? "Running Inference..." : "Predict Performance"}
                            </button>
                        </div>

                        {data && (
                            <div className={`card p-3 mt-3 border-0 shadow-sm text-center ${data.classification.status === 'Safe' ? 'bg-success-light' : 'bg-danger-light'}`}>
                                <div className="small fw-bold text-uppercase">Logistic Classification</div>
                                <div className="h4 m-0">{data.classification.status} ({data.classification.success_probability}%)</div>
                                <div className="small opacity-75">Confidence Score</div>
                            </div>
                        )}
                    </div>

                    <div className="col-lg-8">
                        <div className="row g-3">
                            <div className="col-12">
                                <div className="card p-3 border-0 shadow-sm" style={{ height: '250px' }}>
                                    <h6 className="fw-bold small text-muted">K-Means Complexity Clusters</h6>
                                    <Scatter data={scatterData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card p-3 border-0 shadow-sm h-100">
                                    <h6 className="fw-bold small text-muted">Regression Metrics</h6>
                                    <div className="mt-2">
                                        <div className="d-flex justify-content-between"><span>Predicted Time:</span><b>{data?.regression.predicted_time_ms || 0}ms</b></div>
                                        <div className="d-flex justify-content-between"><span>R² Score:</span><b>{data?.regression.r2_score || 0}</b></div>
                                        <div className="d-flex justify-content-between"><span>MAE:</span><b>{data?.regression.mae || 0}</b></div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card p-3 border-0 shadow-sm h-100 text-center">
                                    <h6 className="fw-bold small text-muted">Current Cluster</h6>
                                    <div className="display-6 fw-bold text-primary mt-2">
                                        {data?.clustering.cluster_name || "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MLVisualizer;