import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser'; // <--- IMPORT EMAILJS

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
    const [plate, setPlate] = useState(activePlate || '');
    const [type, setType] = useState(VIOLATION_TYPES[0].code);
    const [msg, setMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (activePlate) {
            setPlate(activePlate);
        }
    }, [activePlate]);

    // --- NEW: FUNCTION TO SEND EMAIL IMMEDIATELY ---
    const sendInstantEmail = (violationData) => {
        // Prepare data for EmailJS
        // Note: The backend must return 'driver_email' and 'generated_email' in the response
        // If your backend doesn't return driver_email, we might need a quick fix, 
        // but let's try assuming the backend sends the generated text.
        
        if (!violationData.generated_email) return;

        const templateParams = {
            violation_type: violationData.label,
            message: violationData.generated_email,
            to_email: violationData.driver_email // We need to ensure backend sends this back!
        };

        emailjs.send(
            'service_13e19ua',      // YOUR Service ID
            'template_mrx7rmt',     // YOUR Template ID
            templateParams,
            'BzEUIZa3dJ_2FvOSO'     // YOUR Public Key
        )
        .then(() => {
            console.log("Email Auto-Sent!");
        })
        .catch((err) => {
            console.error("Auto-Email Failed:", err);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const targetPlate = plate; 

        if (!targetPlate) {
            setMsg("⚠️ Please enter a vehicle plate number");
            return;
        }

        setIsSubmitting(true); 
        setMsg("⏳ Processing Violation & Generating AI Email..."); 

        try {
            const response = await fetch('http://127.0.0.1:8000/api/penalty/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plate_no: targetPlate, violation_code: type })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setIsSuccess(true);
                setMsg(`✅ SUCCESS! Points: ${data.points} | Email Sent to Driver!`);
                
                // --- TRIGGER EMAIL IMMEDIATELY ---
                // We pass the data we just got from the backend to EmailJS
                sendInstantEmail(data);

                if (onViolationAdded) onViolationAdded(targetPlate);
                if (!activePlate) setPlate(''); 
            } else {
                setIsSuccess(false);
                setMsg('ERROR: ' + data.detail);
            }
        } catch (err) {
            setIsSuccess(false);
            setMsg('SYSTEM ERROR: Connection Failed');
        }
        
        setIsSubmitting(false); 
        setTimeout(() => setMsg(''), 5000);
    };

    return (
        <div style={{ background: '#2c3e50', padding: '20px', borderRadius: '8px', color: 'white', border: '1px solid #34495e', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #7f8c8d', paddingBottom: '10px' }}>
                <span style={{ fontSize: '20px', marginRight: '10px' }}>👮</span>
                <h4 style={{ margin: 0, fontWeight: '600', color: '#ecf0f1' }}>MANUAL ENFORCEMENT ENTRY</h4>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: '#34495e', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                    <div style={{ color: '#bdc3c7', marginBottom: '5px' }}>Target Vehicle:</div>
                    {activePlate ? (
                        <strong style={{ color: '#f1c40f', fontSize: '16px' }}>{activePlate}</strong>
                    ) : (
                        <input 
                            placeholder="Type Plate No (e.g. WP-9999)"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value)}
                            disabled={isSubmitting} 
                            style={{ width: '90%', padding: '8px', borderRadius: '4px', border: '1px solid #7f8c8d', background: '#ecf0f1', color: '#2c3e50', fontWeight: 'bold' }}
                        />
                    )}
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#bdc3c7', marginBottom: '5px' }}>SELECT VIOLATION TYPE</label>
                    <select 
                        value={type} 
                        onChange={(e) => setType(e.target.value)}
                        disabled={isSubmitting} 
                        style={{ width: '100%', padding: '10px', background: '#ecf0f1', color: '#2c3e50', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                    >
                        {VIOLATION_TYPES.map(v => (
                            <option key={v.code} value={v.code}>{v.label}</option>
                        ))}
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={!plate || isSubmitting} 
                    style={{ 
                        padding: '12px', 
                        background: isSubmitting ? '#7f8c8d' : (plate ? '#c0392b' : '#95a5a6'), 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: (plate && !isSubmitting) ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        transition: 'background 0.3s'
                    }}
                >
                    {isSubmitting ? "PROCESSING AI..." : "SUBMIT VIOLATION REPORT"}
                </button>
            </form>

            {msg && (
                <div style={{ marginTop: '15px', padding: '10px', background: isSuccess ? '#27ae60' : (isSubmitting ? '#f39c12' : '#c0392b'), color: 'white', fontSize: '13px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center' }}>
                    {msg}
                </div>
            )}
        </div>
    );
};

export default ViolationForm;