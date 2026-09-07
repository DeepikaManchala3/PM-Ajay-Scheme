import React, { useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import { indiaGeoJSON } from '../../data/geoData';
import { states, districts } from '../../data/mockData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const IndiaMap = ({ onStateSelect }) => {
  const [selectedState, setSelectedState] = useState(null);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [districtModalState, setDistrictModalState] = useState(null);

  const getStateColor = (stateName) => {
    const isImplemented = states.some(s => s.name === stateName);
    return isImplemented ? '#C7D2FE' : '#FFFFFF';
  };

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

  const mapStyle = (feature) => {
    const stateName = normalizeStateName(feature.properties.NAME_1);
    return {
      fillColor: getStateColor(stateName),
      weight: 1.5,
      opacity: 1,
      color: '#4338CA',
      fillOpacity: 1
    };
  };

  const onEachState = (feature, layer) => {
    const stateName = normalizeStateName(feature.properties.NAME_1);
    const stateData = states.find(s => s.name === stateName);
    const isImplemented = !!stateData;

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({
          weight: 2.5,
          color: '#312E81',
          fillOpacity: 0.9,
          fillColor: isImplemented ? '#C7D2FE' : '#F3F4F6'
        });
      },
      mouseout: (e) => {
        e.target.setStyle({
          weight: 1.5,
          color: '#4338CA',
          fillOpacity: 1,
          fillColor: getStateColor(stateName)
        });
      },
      click: () => {
        if (isImplemented) {
          setSelectedState(stateName);
          setDistrictModalState(stateName);
          setShowDistrictModal(true);
          if (onStateSelect) onStateSelect(stateName);
        }
      }
    });

    const container = document.createElement('div');
    container.style.fontFamily = 'var(--font-primary)';
    container.style.padding = '8px';
    container.style.minWidth = '200px';

    const title = document.createElement('h3');
    title.style.margin = '0 0 8px 0';
    title.style.color = 'var(--color-navy)';
    title.style.fontSize = '16px';
    title.textContent = stateName;
    container.appendChild(title);

    if (stateData) {
      const detailsDiv = document.createElement('div');
      detailsDiv.innerHTML = `
        <p style="margin: 4px 0; font-size: 14px;"><strong>Districts:</strong> ${stateData.districts}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Projects:</strong> ${stateData.projects}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Fund Allocated:</strong> ₹${(stateData.fundAllocated / 10000000).toFixed(2)} Cr</p>
      `;
      container.appendChild(detailsDiv);
    } else {
      const noData = document.createElement('p');
      noData.style.cssText = 'margin: 8px 0; font-size: 14px; color: #DC2626; font-weight: 600;';
      noData.textContent = 'This state has not implemented PM-AJAY components yet.';
      container.appendChild(noData);
    }

    layer.bindPopup(container);
    layer.bindTooltip(stateName, { permanent: true, direction: 'center', className: 'state-label', opacity: 1 });
  };

  const stateDistricts = districtModalState ? (districts[districtModalState] || []) : [];

  return (
    <>
      <div className="map-container" style={{ height: '800px', width: '100%', minHeight: '600px', position: 'relative' }}>
        <div className="map-legend" style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '15px', borderRadius: '8px', zIndex: 1000, border: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1f2937' }}>Scheme Status</h4>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ width: '20px', height: '20px', backgroundColor: '#C7D2FE', border: '1px solid #4338CA', marginRight: '10px', borderRadius: '4px' }}></span>
            <span style={{ fontSize: '13px', color: '#4b5563' }}>Implemented</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '20px', height: '20px', backgroundColor: '#FFFFFF', border: '1px solid #4338CA', marginRight: '10px', borderRadius: '4px' }}></span>
            <span style={{ fontSize: '13px', color: '#4b5563' }}>Non-Implemented</span>
          </div>
        </div>
        <MapContainer center={[22.5, 82.5]} zoom={5} style={{ height: '100%', width: '100%', backgroundColor: '#F3F4F6' }} scrollWheelZoom={false} doubleClickZoom={false} dragging={false} touchZoom={false} zoomControl={false} keyboard={false} minZoom={5} maxZoom={5}>
          <GeoJSON data={indiaGeoJSON} style={mapStyle} onEachFeature={onEachState} />
        </MapContainer>
      </div>

      {showDistrictModal && (
        <div className="modal-overlay" onClick={() => setShowDistrictModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ margin: 0, color: 'var(--color-navy)' }}>Districts in {districtModalState}</h2>
              <button onClick={() => setShowDistrictModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>×</button>
            </div>
            {stateDistricts.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>District Name</th>
                      <th>Projects</th>
                      <th>Progress</th>
                      <th>Fund Allocated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateDistricts.map((district, index) => (
                      <tr key={index}>
                        <td><strong>{district.name}</strong></td>
                        <td>{district.projects}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div className="progress-bar" style={{ flex: 1, height: '6px', minWidth: '80px' }}>
                              <div className="progress-fill" style={{ width: `${district.progress}%` }}></div>
                            </div>
                            <span style={{ fontSize: 'var(--text-sm)' }}>{district.progress}%</span>
                          </div>
                        </td>
                        <td>₹{(district.fundAllocated / 10000000).toFixed(2)} Cr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: 'var(--space-6)' }}>No district data available for {districtModalState}</p>
            )}
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowDistrictModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IndiaMap;
