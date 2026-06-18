import React, { useState } from 'react';
import { mockProjects } from '../../../data/mockData';

const PublicAllProjects = () => {
    const [filterState, setFilterState] = useState('');

    // Get unique states from mockProjects for filter
    const states = [...new Set(mockProjects.map(p => p.state || 'Maharashtra'))]; // Fallback as mockData might not have state

    const filteredProjects = filterState
        ? mockProjects.filter(p => (p.state || 'Maharashtra') === filterState)
        : mockProjects;

    return (
        <div className="dashboard-section">
            <div className="section-header">
                <h2 className="section-title">All Projects</h2>
                <select
                    className="form-control form-select"
                    style={{ width: '200px' }}
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                >
                    <option value="">All States</option>
                    {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>State</th>
                            <th>District</th>
                            <th>Component</th>
                            <th>Status</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => (
                            <tr key={project.id}>
                                <td style={{ fontWeight: 'bold' }}>{project.name}</td>
                                <td>{project.state || 'Maharashtra'}</td>
                                <td>{project.district}</td>
                                <td><span className="badge badge-info">{project.component}</span></td>
                                <td>
                                    <span className={`badge ${project.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="progress-bar" style={{ width: '100px', height: '6px' }}>
                                            <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                                        </div>
                                        <span style={{ fontSize: '12px' }}>{project.progress}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PublicAllProjects;
