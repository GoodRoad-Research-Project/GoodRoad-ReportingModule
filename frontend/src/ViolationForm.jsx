import React, { useState, useEffect } from 'react';

const VIOLATION_TYPES = [
    { code: "RED_LIGHT", label: "Red Light Violation (Medium)" },
    { code: "WHITE_LINE", label: "Crossing White Line (Medium)" },
    { code: "WRONG_OVERTAKE", label: "Wrong Side Overtake (High)" },
    { code: "PEDESTRIAN", label: "Pedestrian Crossing (High)" },
    { code: "MOTO_OVERLOAD", label: "Motorcycle Overload (Medium)" },
    { code: "NO_HELMET", label: "No Helmet (High)" },
    { code: "3WHEEL_OVERLOAD", label: "Three-Wheel Overload (Medium)" },
    { code: "NO_SIGNAL", label: "No Turn Signal (Low)" },
    { code: "RAILWAY", label: "Railway Violation (High)" },
    { code: "OBSTRUCTION", label: "Traffic Obstruction (Low)" }
];

const ViolationForm = ({ activePlate, onViolationAdded }) => {
    // If activePlate is provided (User View), use it. If not (Admin View), allow typing.
    const [plate, setPlate] = useState(activePlate || '');
    const [type, setType] = useState(VIOLATION_TYPES[0].code);
    const [msg, setMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Update state if the prop changes
    useEffect(() => {
        if (activePlate) {
            setPlate(activePlate);
        }
    }, [activePlate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Use the manually typed plate OR the active prop
        const targetPlate = plate; 

        if (!targetPlate) {
            setMsg("⚠️ Please enter a vehicle plate number");
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/penalty/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plate_no: targetPlate, violation_code: type })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setIsSuccess(true);
                setMsg(`VIOLATION RECORDED. Points: ${data.points} | Multiplier Applied: ${data.multiplier}x`);
                if (onViolationAdded) onViolationAdded(targetPlate);
                
                // If manual mode, optionally clear the field after success
                if (!activePlate) setPlate(''); 
            } else {
                setIsSuccess(false);
                setMsg('ERROR: ' + data.detail);
            }
        } catch (err) {
            setIsSuccess(false);
            setMsg('SYSTEM ERROR: Connection Failed');
        }
        
        setTimeout(() => setMsg(''), 4000);
    };

    return (
        <div style={{ background: '#2c3e50', padding: '20px', borderRadius: '8px', color: 'white', border: '1px solid #34495e', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #7f8c8d', paddingBottom: '10px' }}>
                <span style={{ fontSize: '20px', marginRight: '10px' }}>👮</span>
                <h4 style={{ margin: 0, fontWeight: '600', color: '#ecf0f1' }}>MANUAL ENFORCEMENT ENTRY</h4>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Context Info OR Input Field */}
                <div style={{ background: '#34495e', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                    <div style={{ color: '#bdc3c7', marginBottom: '5px' }}>Target Vehicle:</div>
                    
                    {activePlate ? (
                        // CASE 1: Locked (User/Context View)
                        <strong style={{ color: '#f1c40f', fontSize: '16px' }}>{activePlate}</strong>
                    ) : (
                        // CASE 2: Manual Input (Admin View) - THIS WAS MISSING
                        <input 
                            placeholder="Type Plate No (e.g. WP-9999)"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value)}
                            style={{ 
                                width: '90%', 
                                padding: '8px', 
                                borderRadius: '4px', 
                                border: '1px solid #7f8c8d',
                                background: '#ecf0f1',
                                color: '#2c3e50',
                                fontWeight: 'bold'
                            }}
                        />
                    )}
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#bdc3c7', marginBottom: '5px' }}>SELECT VIOLATION TYPE</label>
                    <select 
                        value={type} 
                        onChange={(e) => setType(e.target.value)}
                        style={{ width: '100%', padding: '10px', background: '#ecf0f1', color: '#2c3e50', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                    >
                        {VIOLATION_TYPES.map(v => (
                            <option key={v.code} value={v.code}>{v.label}</option>
                        ))}
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={!plate} // Now checks the local 'plate' variable
                    style={{ 
                        padding: '12px', 
                        background: plate ? '#c0392b' : '#95a5a6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: plate ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        transition: 'background 0.3s'
                    }}
                >
                    SUBMIT VIOLATION REPORT
                </button>
            </form>

            {/* Status Message Area */}
            {msg && (
                <div style={{ 
                    marginTop: '15px', 
                    padding: '10px', 
                    background: isSuccess ? '#27ae60' : '#c0392b', 
                    color: 'white', 
                    fontSize: '13px', 
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    {msg}
                </div>
            )}
        </div>
    );
};

export default ViolationForm;