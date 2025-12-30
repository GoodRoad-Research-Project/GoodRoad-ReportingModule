import React, { useState } from 'react';

const RegisterForm = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState({ plate_no: '', owner_name: '', vehicle_type: 'Car' });
    const [msg, setMsg] = useState('');

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
                setMsg('Registration Successful!');
                onRegisterSuccess(formData.plate_no); // Auto-login
            } else {
                setMsg('Error: ' + data.detail);
            }
        } catch (err) {
            setMsg('Connection Failed');
        }
    };

    return (
        <div style={{ background: '#333', padding: '20px', borderRadius: '8px', color: 'white', marginBottom: '20px' }}>
            <h3>🚗 New Vehicle Registration</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                    placeholder="Plate No (e.g. ABC-1234)" 
                    value={formData.plate_no}
                    onChange={(e) => setFormData({...formData, plate_no: e.target.value})}
                    required
                />
                <input 
                    placeholder="Owner Name" 
                    value={formData.owner_name}
                    onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                    required
                />
                <select 
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Tuk">Three-Wheel</option>
                </select>
                <button type="submit" style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px 15px' }}>
                    Register
                </button>
            </form>
            {msg && <p style={{ marginTop: '10px', color: '#ffd700' }}>{msg}</p>}
        </div>
    );
};

export default RegisterForm;