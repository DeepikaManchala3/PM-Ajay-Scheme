import React from 'react';

const StatCard = ({ icon, value, label, trend, trendValue, color = 'var(--color-primary)' }) => {
    return (
        <div className="stat-card" style={{ borderLeftColor: color }}>
            <div className="stat-card-header">
                <div className="stat-card-icon" style={{ color: color }}>
                    {icon}
                </div>
            </div>

            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label">{label}</div>

            {trend && (
                <div className={`stat-card-trend ${trend}`}>
                    <span>{trend === 'positive' ? '↑' : '↓'}</span>
                    <span>{trendValue}</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
