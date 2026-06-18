import React, { useState } from 'react';

const Communication = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'District Admin',
            role: 'DA',
            time: '2 hours ago',
            text: 'Your proposal for Community Hall has been approved. Please proceed with the survey.'
        },
        {
            id: 2,
            sender: 'You',
            role: 'GP',
            time: '1 day ago',
            text: 'Submitted proposal for Community Hall construction. Estimated cost: ₹50 Lakhs.'
        }
    ]);

    const [newMessage, setNewMessage] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const message = {
            id: Date.now(),
            sender: 'You',
            role: 'GP',
            time: 'Just now',
            text: newMessage
        };

        setMessages([message, ...messages]);
        setNewMessage('');
        showToast('Message sent successfully');
    };

    return (
        <div className="dashboard-panel">
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#00b894',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {toast}
                </div>
            )}

            <div className="communication-panel">
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Communication with District Admin</h3>

                <div className="message-list">
                    {messages.map(msg => (
                        <div key={msg.id} className="message-item">
                            <div className="message-avatar">{msg.role}</div>
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="message-sender">{msg.sender}</span>
                                    <span className="message-time">{msg.time}</span>
                                </div>
                                <p className="message-text">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-group">
                    <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    ></textarea>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                >
                    Send Message
                </button>
            </div>
        </div>
    );
};

export default Communication;
