import React, { useState } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto'; // Auto-register charts
import RegisterForm from './RegisterForm';

const PenaltyDashboard = () => {
    const [searchPlate, setSearchPlate] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const fetchProfile = async (plate) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/penalty/user/${plate}/full_profile`);
            if (!res.ok) throw new Error("Vehicle not found or not registered");
            const result = await res.json();
            setData(result);
            setError('');
        } catch (err) {
            setError(err.message);
            setData(null);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial', background: '#1a1a1a', minHeight: '100vh', color: '#fff' }}>
            <h1 style={{ textAlign: 'center', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                GoodRoad: Intelligent Penalty Framework
            </h1>

            {/* 1. Registration Section */}
            <RegisterForm onRegisterSuccess={(plate) => {
                setSearchPlate(plate);
                fetchProfile(plate);
            }} />

            {/* 2. Search Section */}
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <input 
                    style={{ padding: '10px', width: '300px' }}
                    placeholder="Enter Plate Number to Search..." 
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value)}
                />
                <button 
                    onClick={() => fetchProfile(searchPlate)}
                    style={{ padding: '10px 20px', marginLeft: '10px', background: '#2196F3', color: 'white', border: 'none' }}
                >
                    Analyze Profile
                </button>
            </div>

            {error && <div style={{ textAlign: 'center', color: '#ff4444' }}><h3>⚠️ {error}</h3></div>}

            {/* 3. Dashboard Display */}
            {data && (
                <div>
                    {/* Header Stats */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', background: '#333', padding: '20px', borderRadius: '10px' }}>
                        <div>
                            <h3>Vehicle: {data.profile.plate_no}</h3>
                            <p>Owner: {data.profile.name}</p>
                            <p>Type: {data.profile.vehicle_type}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ color: data.stats.risk_level === 'High' ? 'red' : '#4CAF50' }}>
                                Risk Level: {data.stats.risk_level}
                            </h2>
                            <p>Active Points: <strong>{data.stats.active_points}</strong></p>
                            <p>Total Events: {data.stats.total_events}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: '30px' }}>
                        
                        {/* Chart 1: Timeline */}
                        <div style={{ width: '45%', background: '#2d2d2d', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
                            <h4 style={{textAlign: 'center'}}>Violation Timeline</h4>
                            <Bar data={{
                                labels: data.charts.timeline.map(x => x.month),
                                datasets: [{
                                    label: 'Violations per Month',
                                    data: data.charts.timeline.map(x => x.count),
                                    backgroundColor: '#36A2EB'
                                }]
                            }} />
                        </div>

                        {/* Chart 2: Type Distribution */}
                        <div style={{ width: '30%', background: '#2d2d2d', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
                            <h4 style={{textAlign: 'center'}}>Violation Types</h4>
                            <Pie data={{
                                labels: data.charts.distribution.map(x => x.type),
                                datasets: [{
                                    data: data.charts.distribution.map(x => x.count),
                                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                                }]
                            }} />
                        </div>

                        {/* Chart 3: Active vs Expired */}
                        <div style={{ width: '20%', background: '#2d2d2d', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
                            <h4 style={{textAlign: 'center'}}>Points Status</h4>
                            <Doughnut data={{
                                labels: ['Active Points', 'Expired Points'],
                                datasets: [{
                                    data: data.charts.points_split,
                                    backgroundColor: ['#FF4444', '#888888']
                                }]
                            }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PenaltyDashboard;

//dashboard 