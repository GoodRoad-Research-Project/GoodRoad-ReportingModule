import emailjs from '@emailjs/browser';
import React, { useState } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto'; 
import RegisterForm from './RegisterForm';
import ViolationForm from './ViolationForm';

const PenaltyDashboard = () => {
    // STATE: Controls which "Portal" we are seeing
    const [viewMode, setViewMode] = useState('ADMIN'); // 'ADMIN' or 'USER'
    
    const [searchPlate, setSearchPlate] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const fetchProfile = async (plate) => {
        if (!plate) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/penalty/user/${plate}/full_profile`);
            if (!res.ok) throw new Error("Vehicle not registered yet.");
            const result = await res.json();
            setData(result);
            setError('');
        } catch (err) {
            setError(err.message);
            setData(null);
        }
    };

    // --- NEW: EMAIL SENDING FUNCTION ---
    const sendEmailNotification = (record) => {
        if (!record || !record.generated_email) return;

        // The data we are sending to EmailJS
        const templateParams = {
            violation_type: record.label, // Matches {{violation_type}} in template
            message: record.generated_email, // Matches {{message}} in template
            to_email: data.profile.email // Sends to the registered user's email
        };

        emailjs.send(
            'service_13e19ua',      // Service ID
            'template_mrx7rmt',     // Template ID
            templateParams,
            'BzEUIZa3dJ_2FvOSO'     // Public Key
        )
        .then((response) => {
           alert('✅ Email successfully sent to ' + data.profile.email);
        }, (err) => {
           alert('❌ Failed to send: ' + JSON.stringify(err));
        });
    };

    return (
        <div style={{ fontFamily: 'Arial', background: '#1a1a1a', minHeight: '100vh', color: '#fff' }}>
            
            {/* 1. TOP NAVIGATION (Role Switcher) */}
            <div style={{ background: '#000', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333' }}>
                <h2 style={{ margin: 0, color: '#fff' }}>GoodRoad <span style={{fontSize: '14px', color: '#888'}}>System V1.0</span></h2>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => setViewMode('ADMIN')}
                        style={{ 
                            padding: '10px 20px', 
                            background: viewMode === 'ADMIN' ? '#c0392b' : '#333', 
                            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
                        }}
                    >
                        👮 ADMIN PORTAL
                    </button>
                    <button 
                        onClick={() => setViewMode('USER')}
                        style={{ 
                            padding: '10px 20px', 
                            background: viewMode === 'USER' ? '#2980b9' : '#333', 
                            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
                        }}
                    >
                        🚗 DRIVER PORTAL
                    </button>
                </div>
            </div>

            <div style={{ padding: '30px' }}>
                
                {/* --- VIEW 1: ADMIN PORTAL --- */}
                {viewMode === 'ADMIN' && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <h1 style={{color: '#e74c3c'}}>TRAFFIC ENFORCEMENT CENTER</h1>
                            <p style={{color: '#aaa'}}>Authorized Access Only. Register vehicles and record manual violations.</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                            {/* Step 1: Register */}
                            <div style={{ flex: '1', maxWidth: '500px' }}>
                                <RegisterForm onRegisterSuccess={(plate) => {
                                    alert(`Vehicle ${plate} Registered! Now you can record violations.`);
                                }} />
                            </div>

                            {/* Step 2: Enforce */}
                            <div style={{ flex: '1', maxWidth: '500px' }}>
                                <ViolationForm activePlate={null} /> 
                                {/* Passed null so admin has to type the plate manually, mimicking real life */}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW 2: USER PORTAL --- */}
                {viewMode === 'USER' && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                         <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <h1 style={{color: '#3498db'}}>DRIVER DASHBOARD</h1>
                            <p style={{color: '#aaa'}}>Check your penalty points and risk status.</p>
                        </div>

                        {/* Search Bar */}
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <input 
                                style={{ padding: '15px', width: '350px', fontSize: '16px', borderRadius: '30px', border: 'none', outline: 'none' }}
                                placeholder="Enter Your Plate Number (e.g. WP-1111)" 
                                value={searchPlate}
                                onChange={(e) => setSearchPlate(e.target.value)}
                            />
                            <button 
                                onClick={() => fetchProfile(searchPlate)}
                                style={{ padding: '15px 30px', marginLeft: '10px', background: '#2980b9', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                            >
                                CHECK STATUS
                            </button>
                        </div>

                        {error && <div style={{ textAlign: 'center', color: '#ff4444' }}><h3>⚠️ {error}</h3></div>}

                        {/* Data Display */}
                        {data && (
                            <div>
                                {/* Header Card */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#333', padding: '30px', borderRadius: '15px', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
                                    <div>
                                        <h1 style={{ margin: 0, fontSize: '3em' }}>{data.profile.plate_no}</h1>
                                        <p style={{ color: '#aaa', margin: '5px 0' }}>Owner: {data.profile.name} | Type: {data.profile.vehicle_type}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ 
                                            fontSize: '24px', 
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            background: data.stats.risk_level === 'High' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)',
                                            color: data.stats.risk_level === 'High' ? '#e74c3c' : '#2ecc71',
                                            border: data.stats.risk_level === 'High' ? '1px solid #e74c3c' : '1px solid #2ecc71'
                                        }}>
                                            RISK: <strong>{data.stats.risk_level}</strong>
                                        </div>
                                        <div style={{marginTop: '10px', fontSize: '18px'}}>Active Points: <strong>{data.stats.active_points}</strong></div>
                                    </div>
                                </div>

                                {/* Charts Grid */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '40px', justifyContent: 'center' }}>
                                    
                                    <div style={{ width: '400px', background: '#252525', padding: '20px', borderRadius: '15px' }}>
                                        <h4 style={{textAlign: 'center', margin: '0 0 20px 0', color: '#bbb'}}>Violation History</h4>
                                        <div style={{ height: '250px' }}>
                                            <Bar data={{
                                                labels: data.charts.timeline.map(x => x.month),
                                                datasets: [{ label: 'Events', data: data.charts.timeline.map(x => x.count), backgroundColor: '#3498db' }]
                                            }} options={{ maintainAspectRatio: false }} />
                                        </div>
                                    </div>

                                    <div style={{ width: '300px', background: '#252525', padding: '20px', borderRadius: '15px' }}>
                                        <h4 style={{textAlign: 'center', margin: '0 0 20px 0', color: '#bbb'}}>Violation Types</h4>
                                        <div style={{ height: '250px' }}>
                                            <Pie data={{
                                                labels: data.charts.distribution.map(x => x.type),
                                                datasets: [{ data: data.charts.distribution.map(x => x.count), backgroundColor: ['#e74c3c', '#3498db', '#f1c40f', '#1abc9c', '#9b59b6'] }]
                                            }} options={{ maintainAspectRatio: false }} />
                                        </div>
                                    </div>

                                    <div style={{ width: '300px', background: '#252525', padding: '20px', borderRadius: '15px' }}>
                                        <h4 style={{textAlign: 'center', margin: '0 0 20px 0', color: '#bbb'}}>Points Status</h4>
                                        <div style={{ height: '250px' }}>
                                            <Doughnut data={{
                                                labels: ['Active', 'Expired'],
                                                datasets: [{ data: data.charts.points_split, backgroundColor: ['#e74c3c', '#555'] }]
                                            }} options={{ maintainAspectRatio: false }} />
                                        </div>
                                    </div>
                                </div>

                                {/* AI EMAIL NOTIFICATION CARD */}
                                <div style={{ marginTop: '30px', maxWidth: '800px', margin: '30px auto', background: '#fff', color: '#333', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ background: '#ea4335', padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0 }}>📩 Latest Violation Notification</h3>
                                        <span style={{ fontSize: '12px', background: 'rgba(0,0,0,0.2)', padding: '5px 10px', borderRadius: '15px' }}>
                                            Generated by Google Gemini AI
                                        </span>
                                    </div>
                                    
                                    <div style={{ padding: '25px', fontFamily: 'Georgia, serif', lineHeight: '1.6', fontSize: '16px' }}>
                                        {data.recent_history && data.recent_history.length > 0 && data.recent_history[data.recent_history.length - 1].generated_email ? (
                                            <div style={{ whiteSpace: 'pre-wrap' }}>
                                                {data.recent_history[data.recent_history.length - 1].generated_email}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                                                No recent notifications available.
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div style={{ background: '#f5f5f5', padding: '10px 25px', borderTop: '1px solid #ddd', textAlign: 'right' }}>
                                        {/* UPDATED BUTTON TO CALL EMAILJS */}
                                        <button 
                                            style={{ background: '#4285f4', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }} 
                                            onClick={() => sendEmailNotification(data.recent_history[data.recent_history.length - 1])}
                                        >
                                            Resend Email 🚀
                                        </button>
                                    </div>
                                </div>
                                {/* END OF AI CARD */}

                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default PenaltyDashboard;