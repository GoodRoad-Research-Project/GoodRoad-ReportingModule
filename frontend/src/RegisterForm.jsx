import React, { useState } from 'react';

const RegisterForm = ({ onRegisterSuccess }) => {
    // Added 'email' to state
    const [formData, setFormData] = useState({ plate_no: '', owner_name: '', email: '', vehicle_type: 'Car' });
    const [msg, setMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const VEHICLE_TYPES = ["Car", "Motorcycle", "Three-Wheeler", "Dual Purpose (Van/Jeep)", "Lorry", "Bus", "Land Vehicle (Tractor)", "Other"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/api/penalty/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                setIsSuccess(true);
                setMsg('✅ Vehicle Registered Successfully!');
                onRegisterSuccess(formData.plate_no);
                setFormData({ plate_no: '', owner_name: '', email: '', vehicle_type: 'Car' }); 
            } else {
                setIsSuccess(false);
                setMsg('❌ Error: ' + data.detail);
            }
        } catch (err) {
            setIsSuccess(false);
            setMsg('❌ Connection Failed');
        }
        setTimeout(() => setMsg(''), 3000);
    };

    return (
        <div style={{ color: 'white' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#7d8590', fontWeight: '600' }}>
                        VEHICLE PLATE NUMBER *
                    </label>
                    <input 
                        placeholder="e.g. WP CAB-1234" 
                        value={formData.plate_no}
                        onChange={(e) => setFormData({...formData, plate_no: e.target.value})}
                        required
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
                        onFocus={(e) => e.target.style.borderColor = '#238636'}
                        onBlur={(e) => e.target.style.borderColor = '#30363d'}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#7d8590', fontWeight: '600' }}>
                        OWNER NAME *
                    </label>
                    <input 
                        placeholder="Full Name" 
                        value={formData.owner_name}
                        onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                        required
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
                        onFocus={(e) => e.target.style.borderColor = '#238636'}
                        onBlur={(e) => e.target.style.borderColor = '#30363d'}
                    />
                </div>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#7d8590', fontWeight: '600' }}>
                        OWNER EMAIL *
                    </label>
                    <input 
                        type="email"
                        placeholder="driver@example.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
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
                        onFocus={(e) => e.target.style.borderColor = '#238636'}
                        onBlur={(e) => e.target.style.borderColor = '#30363d'}
                    />
                </div>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#7d8590', fontWeight: '600' }}>
                        VEHICLE TYPE *
                    </label>
                    <select 
                        value={formData.vehicle_type}
                        onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
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
                        {VEHICLE_TYPES.map(type => (
                            <option key={type} value={type} style={{ background: '#161b22' }}>{type}</option>
                        ))}
                    </select>
                </div>

                <button 
                    type="submit" 
                    style={{ 
                        background: 'linear-gradient(180deg, #2ea043 0%, #238636 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginTop: '10px',
                        transition: 'transform 0.2s',
                        boxShadow: '0 2px 8px rgba(35, 134, 54, 0.3)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    REGISTER VEHICLE
                </button>
            </form>
            {msg && (
                <div style={{ 
                    marginTop: '20px',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    background: isSuccess ? 'rgba(35, 134, 54, 0.15)' : 'rgba(248, 81, 73, 0.15)',
                    border: `1px solid ${isSuccess ? '#238636' : '#f85149'}`,
                    color: isSuccess ? '#3fb950' : '#f85149',
                    fontWeight: '500',
                    fontSize: '14px'
                }}>
                    {msg}
                </div>
            )}
        </div>
    );
};

export default RegisterForm;