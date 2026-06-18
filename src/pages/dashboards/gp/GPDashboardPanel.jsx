import React from 'react';
import StatCard from '../../../components/StatCard';

const GPDashboardPanel = () => {
    return (
        <div className="dashboard-panel">
            {/* Key Metrics */}
            <div className="kpi-row">
                <StatCard icon="📝" value="12" label="Works Proposed" color="var(--color-primary)" />
                <StatCard icon="🚧" value="8" label="Works in Progress" color="var(--color-warning)" />
                <StatCard icon="✅" value="15" label="Works Completed" color="var(--color-success)" />
                <StatCard icon="💰" value="₹45 L" label="Funds Received" color="var(--color-info)" />
            </div>

            {/* Recent Activity / Summary */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Recent Activity</h2>
                </div>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Community Hall Construction</td>
                                <td><span className="badge badge-warning">Ongoing</span></td>
                                <td>2 days ago</td>
                            </tr>
                            <tr>
                                <td>Water Supply System</td>
                                <td><span className="badge badge-warning">Ongoing</span></td>
                                <td>5 days ago</td>
                            </tr>
                            <tr>
                                <td>Village Road Repair</td>
                                <td><span className="badge badge-success">Completed</span></td>
                                <td>1 week ago</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GPDashboardPanel;
