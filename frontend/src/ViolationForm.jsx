import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

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
    const [penaltySplit, setPenaltySplit] = useState(null);
    const [emailStatus, setEmailStatus] = useState(null); // Track email sending status
    const [violationData, setViolationData] = useState(null); // Store violation data for email

    useEffect(() => {
        if (activePlate) {
            setPlate(activePlate);
        }
    }, [activePlate]);

    // Function to send email notification
    const sendInstantEmail = (violationData) => {
        if (!violationData.generated_email || !violationData.driver_email) {
            console.error("Missing email data from backend");
            setEmailStatus({ success: false, message: "Missing email data" });
            return Promise.reject("Missing email data");
        }

        const templateParams = {
            violation_type: violationData.label,
            message: violationData.generated_email,
            to_email: violationData.driver_email
        };

        return emailjs.send(
            'service_13e19ua',
            'template_mrx7rmt',
            templateParams,
            'BzEUIZa3dJ_2FvOSO'
        )
        .then(() => {
            console.log("Email sent successfully to: " + violationData.driver_email);
            setEmailStatus({ 
                success: true, 
                message: `Email successfully sent to ${violationData.driver_email}`,
                email: violationData.driver_email
            });
            return true;
        })
        .catch((err) => {
            console.error("Email sending failed:", err);
            setEmailStatus({ 
                success: false, 
                message: `Failed to send email: ${err.text || 'Unknown error'}`,
                email: violationData.driver_email
            });
            return false;
        });
    };

    // Calculate penalty split (Government 60%, Reward 25%, System 15%)
    const calculatePenaltySplit = (totalPenalty) => {
        return {
            government: (totalPenalty * 0.60).toFixed(2),
            reward: (totalPenalty * 0.25).toFixed(2),
            system: (totalPenalty * 0.15).toFixed(2),
            total: totalPenalty.toFixed(2)
        };
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
                setEmailStatus(null); // Reset email status
                
                // Calculate penalty split based on points
                const penaltyAmount = data.points * 500; // Base penalty calculation (500 LKR per point)
                const split = calculatePenaltySplit(penaltyAmount);
                setPenaltySplit(split);
                setViolationData(data); // Store data for email sending
                
                setMsg(`✅ SUCCESS! Points: ${data.points} | Sending email to: ${data.driver_email}...`);
                
                // Send email notification after a brief delay to show penalty split first
                setTimeout(() => {
                    sendInstantEmail(data);
                }, 500);

                if (onViolationAdded) onViolationAdded(targetPlate);
                // Keep the plate number visible - don't clear it
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
                <h4 style={{ margin: 0, fontWeight: '600', color: '#ecf0f1' }}>ENFORCEMENT ENTRY</h4>
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

            {/* Penalty Split Display */}
            {penaltySplit && isSuccess && (
                <div style={{ marginTop: '20px', background: '#34495e', padding: '15px', borderRadius: '8px' }}>
                    <h5 style={{ margin: '0 0 15px 0', color: '#ecf0f1', borderBottom: '1px solid #7f8c8d', paddingBottom: '10px' }}>💰 Penalty Distribution (LKR {penaltySplit.total})</h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2980b9', padding: '10px', borderRadius: '4px' }}>
                            <span>🏛️ Government (60%)</span>
                            <strong>LKR {penaltySplit.government}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#27ae60', padding: '10px', borderRadius: '4px' }}>
                            <span>🎁 Reward Pool (25%)</span>
                            <strong>LKR {penaltySplit.reward}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#8e44ad', padding: '10px', borderRadius: '4px' }}>
                            <span>⚙️ System (15%)</span>
                            <strong>LKR {penaltySplit.system}</strong>
                        </div>
                    </div>
                    
                    <p style={{ fontSize: '11px', color: '#bdc3c7', marginTop: '10px', textAlign: 'center' }}>
                        Penalty collected supports road safety initiatives
                    </p>
                </div>
            )}

            {/* Email Status Popup */}
            {emailStatus && (
                <div style={{ 
                    marginTop: '15px', 
                    padding: '15px', 
                    background: emailStatus.success ? '#27ae60' : '#e74c3c', 
                    borderRadius: '8px',
                    border: emailStatus.success ? '2px solid #2ecc71' : '2px solid #c0392b'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{emailStatus.success ? '📧✅' : '📧❌'}</span>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                {emailStatus.success ? 'EMAIL SENT SUCCESSFULLY!' : 'EMAIL SENDING FAILED'}
                            </div>
                            <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>
                                {emailStatus.message}
                            </div>
                        </div>
                    </div>
                    {emailStatus.success && violationData && (
                        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '12px' }}>
                            <div><strong>To:</strong> {violationData.driver_email}</div>
                            <div><strong>Subject:</strong> Traffic Violation Notice - {violationData.label}</div>
                            <div><strong>Status:</strong> Delivered ✓</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViolationForm;