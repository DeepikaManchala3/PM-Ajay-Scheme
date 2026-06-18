import React, { useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import { indiaGeoJSON } from '../../data/geoData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dummy fund release data for states
const stateFundData = {
    'Karnataka': { fundReleased: 15000000, projects: 3 },
    'Andhra Pradesh': { fundReleased: 10000000, projects: 2 },
    'Gujarat': { fundReleased: 4200000, projects: 1 },
    'Telangana': { fundReleased: 2800000, projects: 1 },
    'Maharashtra': { fundReleased: 10700000, projects: 2 },
    'Tamil Nadu': { fundReleased: 4000000, projects: 1 },
    'Kerala': { fundReleased: 3800000, projects: 1 },
    'West Bengal': { fundReleased: 3500000, projects: 1 },
    'Uttar Pradesh': { fundReleased: 8500000, projects: 2 },
    'Madhya Pradesh': { fundReleased: 6200000, projects: 1 },
    'Rajasthan': { fundReleased: 5500000, projects: 1 },
    'Bihar': { fundReleased: 7000000, projects: 2 },
    'Odisha': { fundReleased: 4500000, projects: 1 },
    'Punjab': { fundReleased: 3200000, projects: 1 },
    'Haryana': { fundReleased: 4800000, projects: 1 }
};

const FundReleaseMap = ({ onStateClick }) => {
    const [selectedState, setSelectedState] = useState(null);

    const normalizeStateName = (geoJsonName) => {
        const nameMapping = {
            'Orissa': 'Odisha',
            'Uttaranchal': 'Uttarakhand',
            'Andaman and Nicobar': 'Andaman & Nicobar Islands',
            'Pondicherry': 'Puducherry',
            'Dadra and Nagar Haveli': 'Dadra & Nagar Haveli and Daman & Diu',
            'Daman and Diu': 'Dadra & Nagar Haveli and Daman & Diu'
        };
        return nameMapping[geoJsonName] || geoJsonName;
    };

    const getColorByFundAmount = (amount) => {
        if (!amount) return '#F3F4F6'; // Light gray for no data
        if (amount >= 10000000) return '#1E40AF'; // Dark blue for high funds
        if (amount >= 5000000) return '#3B82F6'; // Medium blue
        if (amount >= 2000000) return '#60A5FA'; // Light blue
        return '#93C5FD'; // Very light blue for low funds
    };

    const mapStyle = (feature) => {
        const geoJsonName = feature.properties.NAME_1;
        const stateName = normalizeStateName(geoJsonName);
        const fundData = stateFundData[stateName];
        const fundAmount = fundData?.fundReleased || 0;

        return {
            fillColor: getColorByFundAmount(fundAmount),
            weight: 1.5,
            opacity: 1,
            color: '#1F2937',
            fillOpacity: 0.8
        };
    };

    const onEachState = (feature, layer) => {
        const geoJsonName = feature.properties.NAME_1;
        const stateName = normalizeStateName(geoJsonName);
        const fundData = stateFundData[stateName];

        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#111827',
                    fillOpacity: 1
                });
            },
            mouseout: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 1.5,
                    color: '#1F2937',
                    fillOpacity: 0.8
                });
            },
            click: (e) => {
                if (fundData) {
                    setSelectedState(stateName);
                    if (onStateClick) {
                        onStateClick(stateName);
                    }
                }
            }
        });

        // Create tooltip content
        const container = document.createElement('div');
        container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        container.style.padding = '8px';
        container.style.minWidth = '180px';

        const title = document.createElement('h3');
        title.style.margin = '0 0 8px 0';
        title.style.color = '#111827';
        title.style.fontSize = '15px';
        title.style.fontWeight = '600';
        title.textContent = stateName;
        container.appendChild(title);

        if (fundData) {
            const fundInCr = (fundData.fundReleased / 10000000).toFixed(2);
            const details = `
        <p style="margin: 4px 0; font-size: 13px; color: #374151;">
          <strong>Fund Released:</strong> ₹${fundInCr} Cr
        </p>
        <p style="margin: 4px 0; font-size: 13px; color: #374151;">
          <strong>Projects:</strong> ${fundData.projects}
        </p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #3B82F6; font-style: italic;">
          Click to view districts
        </p>
      `;
            const detailsDiv = document.createElement('div');
            detailsDiv.innerHTML = details;
            container.appendChild(detailsDiv);
        } else {
            const noData = document.createElement('p');
            noData.style.margin = '4px 0';
            noData.style.fontSize = '13px';
            noData.style.color = '#9CA3AF';
            noData.textContent = 'No fund data available';
            container.appendChild(noData);
        }

        layer.bindPopup(container);

        // Add state name label
        layer.bindTooltip(stateName, {
            permanent: false,
            direction: 'center',
            className: 'state-label-fund',
            opacity: 0.9
        });
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Legend */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '12px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1000,
                border: '1px solid #E5E7EB'
            }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#111827', fontWeight: '600' }}>Fund Released (₹ Cr)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '18px', height: '18px', backgroundColor: '#1E40AF', borderRadius: '3px' }}></span>
                        <span style={{ fontSize: '12px', color: '#4B5563' }}>≥ 10 Cr</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '18px', height: '18px', backgroundColor: '#3B82F6', borderRadius: '3px' }}></span>
                        <span style={{ fontSize: '12px', color: '#4B5563' }}>5-10 Cr</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '18px', height: '18px', backgroundColor: '#60A5FA', borderRadius: '3px' }}></span>
                        <span style={{ fontSize: '12px', color: '#4B5563' }}>2-5 Cr</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '18px', height: '18px', backgroundColor: '#93C5FD', borderRadius: '3px' }}></span>
                        <span style={{ fontSize: '12px', color: '#4B5563' }}>&lt; 2 Cr</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '18px', height: '18px', backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '3px' }}></span>
                        <span style={{ fontSize: '12px', color: '#4B5563' }}>No Data</span>
                    </div>
                </div>
            </div>

            {/* Map */}
            <MapContainer
                center={[22.5, 82.5]}
                zoom={5}
                style={{ height: '600px', width: '100%', backgroundColor: '#F9FAFB', borderRadius: '12px' }}
                scrollWheelZoom={true}
                zoomControl={true}
                minZoom={4}
                maxZoom={6}
            >
                <GeoJSON
                    data={indiaGeoJSON}
                    style={mapStyle}
                    onEachFeature={onEachState}
                />
            </MapContainer>

            <style>{`
        .state-label-fund {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #1F2937 !important;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
        }
      `}</style>
        </div>
    );
};

export default FundReleaseMap;
