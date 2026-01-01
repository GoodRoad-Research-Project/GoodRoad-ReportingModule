import React, { useState } from 'react';

const RegisterForm = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState({ plate_no: '', owner_name: '', vehicle_type: 'Car' });
    const [msg, setMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Extended Vehicle List
    const VEHICLE_TYPES = [
        "Car",
        "Motorcycle",
        "Three-Wheeler",
        "Dual Purpose (Van/Jeep)",
        "Lorry",
        "Bus",
        "Land Vehicle (Tractor)",
        "Other"
    ];

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
                setFormData({ plate_no: '', owner_name: '', vehicle_type: 'Car' }); // Reset form
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
        <div style={{ background: '#2c3e50', padding: '20px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '1px solid #34495e' }}>
            <div style={{ borderBottom: '1px solid #7f8c8d', marginBottom: '15px', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#ecf0f1' }}>📝 New Vehicle Registration</h3>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    placeholder="Plate No (e.g. WP CAB-1234)" 
                    value={formData.plate_no}
                    onChange={(e) => setFormData({...formData, plate_no: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '4px', border: 'none' }}
                />
                <input 
                    placeholder="Owner Name" 
                    value={formData.owner_name}
                    onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '4px', border: 'none' }}
                />
                
                {/* Enhanced Dropdown */}
                <select 
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                    style={{ padding: '10px', borderRadius: '4px', border: 'none', background: '#ecf0f1', color: '#2c3e50' }}
                >
                    {VEHICLE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <button type="submit" style={{ background: '#27ae60', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    REGISTER VEHICLE
                </button>
            </form>
            {msg && <p style={{ marginTop: '10px', textAlign: 'center', color: isSuccess ? '#4cd137' : '#e74c3c', fontWeight: 'bold' }}>{msg}</p>}
        </div>
    );
};

export default RegisterForm;