import React, { useState } from 'react';
import IndiaMap from '../../../components/maps/IndiaMap';
import DistrictMap from '../../../components/maps/DistrictMap';

const PublicHome = () => {
    const [selectedState, setSelectedState] = useState(null);

    const handleStateSelect = (stateName) => {
        setSelectedState(stateName);
    };

    const handleBackToNational = () => {
        setSelectedState(null);
    };

    return (
        <div className="dashboard-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title">
                    {selectedState ? `${selectedState} Overview` : 'National Overview'}
                </h2>
                {selectedState && (
                    <button onClick={handleBackToNational} className="btn btn-secondary">
                        ← Back to National View
                    </button>
                )}
            </div>

            <div className="kpi-row" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="stat-card">
                    <div className="stat-card-value">{selectedState ? '34' : '28'}</div>
                    <div className="stat-card-label">{selectedState ? 'Districts' : 'States Covered'}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value">{selectedState ? '2,450' : '12,450'}</div>
                    <div className="stat-card-label">Total Projects</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value">{selectedState ? '₹1,200 Cr' : '₹8,500 Cr'}</div>
                    <div className="stat-card-label">Funds Allocated</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value">{selectedState ? '78%' : '85%'}</div>
                    <div className="stat-card-label">Completion Rate</div>
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>
                    {selectedState ? `District-wise Status: ${selectedState}` : 'Project Distribution Map'}
                </h3>
                {selectedState ? (
                    <DistrictMap state={selectedState} />
                ) : (
                    <IndiaMap onStateSelect={handleStateSelect} />
                )}
            </div>
        </div>
    );
};

export default PublicHome;
