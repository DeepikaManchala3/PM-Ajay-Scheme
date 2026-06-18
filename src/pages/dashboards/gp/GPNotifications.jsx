import React from 'react';

const GPNotifications = () => {
    return (
        <div className="dashboard-panel">
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Notifications</h2>
                </div>
                <div className="notification-list">
                    <div className="notification-item unread">
                        <div className="notification-icon">📢</div>
                        <div className="notification-content">
                            <h4>New Scheme Guidelines Released</h4>
                            <p>Ministry has released updated guidelines for PM-AJAY 2025.</p>
                            <span className="notification-time">2 hours ago</span>
                        </div>
                    </div>
                    <div className="notification-item">
                        <div className="notification-icon">💰</div>
                        <div className="notification-content">
                            <h4>Fund Release Approved</h4>
                            <p>District Admin approved fund release for Community Hall.</p>
                            <span className="notification-time">1 day ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GPNotifications;
