import React, { useState } from 'react';

const DeleteForm = ({ onDeleteSuccess }) => {
    const [plateNo, setPlateNo] = useState('');
    const [msg, setMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDelete = async (e) => {
        e.preventDefault();
        
        if (!confirmDelete) {
            setMsg('⚠️ Please confirm deletion by checking the box');
            setTimeout(() => setMsg(''), 3000);
            return;
        }

        if (!plateNo) {
            setMsg('⚠️ Please enter a plate number');
            setTimeout(() => setMsg(''), 3000);
            return;
        }

        setIsDeleting(true);
        setMsg('⏳ Deleting vehicle and all associated records...');

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/penalty/delete/${plateNo}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setIsSuccess(true);
                setMsg('✅ ' + data.msg);
                setPlateNo('');
                setConfirmDelete(false);
                if (onDeleteSuccess) onDeleteSuccess(plateNo);
            } else {
                setIsSuccess(false);
                setMsg('❌ Error: ' + data.detail);
            }
        } catch (err) {
            setIsSuccess(false);
            setMsg('❌ Connection Failed');
        } finally {
            setIsDeleting(false);
        }
        
        setTimeout(() => setMsg(''), 5000);
    };

    return (
        <div style={{ color: 'white' }}>
            <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#7d8590', fontWeight: '600' }}>
                        VEHICLE PLATE NUMBER *
                    </label>
                    <input 
                        placeholder="Enter Plate to Delete" 
                        value={plateNo}
                        onChange={(e) => setPlateNo(e.target.value)}
                        required
                        disabled={isDeleting}
                        style={{ 
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #30363d',
                            background: isDeleting ? '#6e7681' : '#0d1117',
                            color: isDeleting ? '#8b949e' : '#fff',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box',
                            cursor: isDeleting ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => !isDeleting && (e.target.style.borderColor = '#f85149')}
                        onBlur={(e) => e.target.style.borderColor = '#30363d'}
                    />
                </div>

                <div style={{ 
                    padding: '16px',
                    background: 'rgba(248, 81, 73, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(248, 81, 73, 0.3)'
                }}>
                    <label style={{ 
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        userSelect: 'none'
                    }}>
                        <input 
                            type="checkbox"
                            checked={confirmDelete}
                            onChange={(e) => setConfirmDelete(e.target.checked)}
                            disabled={isDeleting}
                            style={{ 
                                marginTop: '2px',
                                width: '18px',
                                height: '18px',
                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                accentColor: '#f85149'
                            }}
                        />
                        <span style={{ 
                            fontSize: '13px', 
                            color: '#f85149',
                            lineHeight: '1.5',
                            flex: 1
                        }}>
                            I understand this action will <strong>permanently delete</strong> the vehicle and all associated violations, rewards, and history records. This cannot be undone.
                        </span>
                    </label>
                </div>

                <button 
                    type="submit" 
                    disabled={isDeleting || !confirmDelete}
                    style={{ 
                        background: (!confirmDelete || isDeleting) ? '#6e7681' : 'linear-gradient(180deg, #ff4757 0%, #f85149 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: (!confirmDelete || isDeleting) ? 'not-allowed' : 'pointer',
                        marginTop: '10px',
                        transition: 'all 0.2s',
                        boxShadow: (!confirmDelete || isDeleting) ? 'none' : '0 2px 8px rgba(248, 81, 73, 0.3)',
                        opacity: (!confirmDelete || isDeleting) ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => { if(confirmDelete && !isDeleting) e.target.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { if(confirmDelete && !isDeleting) e.target.style.transform = 'translateY(0)'; }}
                >
                    {isDeleting ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                                <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"/>
                            </svg>
                            DELETING...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                            DELETE VEHICLE
                        </>
                    )}
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

export default DeleteForm;
