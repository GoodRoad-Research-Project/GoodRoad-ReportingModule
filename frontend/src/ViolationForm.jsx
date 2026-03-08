import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const VIOLATION_TYPES = [
    { code: "OVER_SPEED", label: "Speeding" },
    { code: "NO_LICENSE", label: "No Driving License" },
    { code: "NO_INSURANCE", label: "No Insurance" },
    { code: "NO_REVENUE_LIC", label: "No Revenue License" },
    { code: "UNDERAGE_DRIVE", label: "Underage Driving" },
    { code: "RECKLESS_DRIVING", label: "Reckless Driving" },
    { code: "CARELESS_DRIVING", label: "Careless Driving" },
    { code: "MOBILE_PHONE", label: "Mobile Phone Use" },
    { code: "LEFT_OVERTAKE", label: "Left Overtake" },
    { code: "NO_SEATBELT", label: "No Seatbelt" },
    { code: "NO_HELMET", label: "No Helmet" },
    { code: "RED_LIGHT", label: "Red Light Violation" },
    { code: "DISOBEY_POLICE", label: "Disobey Police" },
    { code: "DISOBEY_SIGNS", label: "Disobey Road Signs" },
    { code: "WHITE_LINE", label: "White Line Crossing" },
    { code: "WRONG_PARKING", label: "Illegal Parking" },
    { code: "PEDESTRIAN_CROSS", label: "Pedestrian Crossing" },
    { code: "ONE_WAY", label: "Wrong Way (One Way)" },
    { code: "RAILWAY_CROSS", label: "Railway Crossing" },
    { code: "OVERLOAD_PASS", label: "Excess Passengers" },
    { code: "DANGEROUS_LOAD", label: "Dangerous Load" },
    { code: "EMISSION_FAIL", label: "Emission Violation" },
    { code: "SHRILL_HORN", label: "Illegal Horn" },
    { code: "DEFECTIVE_LIGHTS", label: "Defective Lights" },
    { code: "UNFIT_VEHICLE", label: "Unfit Vehicle" },
    { code: "OBSCURED_PLATES", label: "Obscured Number Plates" },
    { code: "ROAD_OBSTRUCT", label: "Road Obstruction" },
    { code: "ILLEGAL_REVERSE", label: "Illegal Reversing" },
    { code: "NO_FITNESS_CERT", label: "No Fitness Cert (Commercial)" },
    { code: "BLOCK_EMERGENCY", label: "Blocking Emergency Vehicle" }
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
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
            templateParams,
            process.env.REACT_APP_EMAILJS_PUBLIC_KEY
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
        <div style={{ color: 'white' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#7d8590', fontWeight: '600' }}>
                        TARGET VEHICLE PLATE *
                    </label>
                    {activePlate ? (
                        <div style={{ 
                            padding: '12px',
                            borderRadius: '8px',
                            border: '2px solid #da3633',
                            background: 'rgba(218, 54, 51, 0.1)',
                            color: '#da3633',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            {activePlate}
                        </div>
                    ) : (
                        <input 
                            placeholder="e.g. WP-9999"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value)}
                            disabled={isSubmitting} 
                            style={{ 
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #30363d',
                                background: '#0d1117',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#da3633'}
                            onBlur={(e) => e.target.style.borderColor = '#30363d'}
                        />
                    )}
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#7d8590', fontWeight: '600' }}>
                        VIOLATION TYPE *
                    </label>
                    <select 
                        value={type} 
                        onChange={(e) => setType(e.target.value)}
                        disabled={isSubmitting} 
                        style={{ 
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #30363d',
                            background: '#0d1117',
                            color: '#fff',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                        }}
                    >
                        {VIOLATION_TYPES.map(v => (
                            <option key={v.code} value={v.code} style={{ background: '#161b22' }}>{v.label}</option>
                        ))}
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={!plate || isSubmitting} 
                    style={{ 
                        background: isSubmitting ? '#6e7681' : (plate ? 'linear-gradient(180deg, #e34c26 0%, #da3633 100%)' : '#6e7681'),
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: (plate && !isSubmitting) ? 'pointer' : 'not-allowed',
                        marginTop: '10px',
                        transition: 'all 0.2s',
                        boxShadow: plate && !isSubmitting ? '0 2px 8px rgba(218, 54, 51, 0.3)' : 'none',
                        opacity: (plate && !isSubmitting) ? 1 : 0.6
                    }}
                    onMouseEnter={(e) => { if(plate && !isSubmitting) e.target.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { if(plate && !isSubmitting) e.target.style.transform = 'translateY(0)'; }}
                >
                    {isSubmitting ? "⏳ PROCESSING AI..." : "SUBMIT VIOLATION REPORT"}
                </button>
            </form>

            {msg && (
                <div style={{ 
                    marginTop: '20px',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    background: isSuccess ? 'rgba(35, 134, 54, 0.15)' : (isSubmitting ? 'rgba(187, 128, 9, 0.15)' : 'rgba(248, 81, 73, 0.15)'),
                    border: `1px solid ${isSuccess ? '#238636' : (isSubmitting ? '#bb8009' : '#f85149')}`,
                    color: isSuccess ? '#3fb950' : (isSubmitting ? '#e3b341' : '#f85149'),
                    fontWeight: '500',
                    fontSize: '14px'
                }}>
                    {msg}
                </div>
            )}

            {/* Penalty Split Display */}
            {penaltySplit && isSuccess && (
                <div style={{ marginTop: '25px', background: '#0d1117', padding: '20px', borderRadius: '8px', border: '1px solid #30363d' }}>
                    <h5 style={{ margin: '0 0 15px 0', color: '#e3b341', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
                        💰 PENALTY DISTRIBUTION • LKR {penaltySplit.total}
                    </h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            <span style={{ fontSize: '13px', color: '#7d8590' }}>🏛️ Government (60%)</span>
                            <strong style={{ color: '#58a6ff' }}>LKR {penaltySplit.government}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(35, 134, 54, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(35, 134, 54, 0.3)' }}>
                            <span style={{ fontSize: '13px', color: '#7d8590' }}>🎁 Reward Pool (25%)</span>
                            <strong style={{ color: '#3fb950' }}>LKR {penaltySplit.reward}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(163, 113, 247, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(163, 113, 247, 0.3)' }}>
                            <span style={{ fontSize: '13px', color: '#7d8590' }}>⚙️ System (15%)</span>
                            <strong style={{ color: '#a371f7' }}>LKR {penaltySplit.system}</strong>
                        </div>
                    </div>
                    
                    <p style={{ fontSize: '11px', color: '#7d8590', marginTop: '15px', textAlign: 'center', lineHeight: '1.5' }}>
                        Penalty revenue supports road safety initiatives
                    </p>
                </div>
            )}

            {/* Email Status */}
            {emailStatus && (
                <div style={{ 
                    marginTop: '20px',
                    padding: '16px',
                    background: emailStatus.success ? 'rgba(35, 134, 54, 0.15)' : 'rgba(248, 81, 73, 0.15)',
                    borderRadius: '8px',
                    border: `1px solid ${emailStatus.success ? '#238636' : '#f85149'}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>{emailStatus.success ? '📧✅' : '📧❌'}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '13px', color: emailStatus.success ? '#3fb950' : '#f85149', marginBottom: '4px' }}>
                                {emailStatus.success ? 'EMAIL SENT SUCCESSFULLY!' : 'EMAIL SENDING FAILED'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#7d8590' }}>
                                {emailStatus.message}
                            </div>
                        </div>
                    </div>
                    {emailStatus.success && violationData && (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '11px', color: '#7d8590' }}>
                            <div style={{ marginBottom: '4px' }}><strong style={{ color: '#8b949e' }}>To:</strong> {violationData.driver_email}</div>
                            <div style={{ marginBottom: '4px' }}><strong style={{ color: '#8b949e' }}>Subject:</strong> Traffic Violation Notice - {violationData.label}</div>
                            <div><strong style={{ color: '#8b949e' }}>Status:</strong> <span style={{ color: '#3fb950' }}>Delivered ✓</span></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViolationForm;