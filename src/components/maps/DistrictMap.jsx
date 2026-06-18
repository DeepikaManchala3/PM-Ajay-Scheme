import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import { indiaDistrictsGeoJSON } from '../../data/geoData';
import { districts, mockProjects } from '../../data/mockData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle map bounds updates
const MapUpdater = ({ bounds }) => {
    const map = useMap();

    useEffect(() => {
        if (bounds && bounds.isValid()) {
            // Minimal top padding, more bottom padding to shift map upward
            map.fitBounds(bounds, {
                paddingTopLeft: [30, 10],      // Minimal top padding (10px)
                paddingBottomRight: [30, 100], // More bottom padding (100px)
                animate: true,
                maxZoom: 9,
                duration: 0.5
            });
        }
    }, [bounds, map]);

    return null;
};

const DistrictMap = ({ state = 'Maharashtra', district = null, highlightedDistrict = null, onDistrictSelect }) => {
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    const districtData = districts[state] || [];
    const stateProjects = mockProjects.filter(p => p.state === state && (!district || p.district === district));

    const normalizeStateName = (geoJsonName) => {
        const nameMapping = {
            'Orissa': 'Odisha',
            'Uttaranchal': 'Uttarakhand',
            'Andaman and Nicobar': 'Andaman & Nicobar Islands',
            'Pondicherry': 'Puducherry',
            'Dadra and Nagar Haveli': 'Dadra & Nagar Haveli and Daman & Diu',
            'Daman and Diu': 'Dadra & Nagar Haveli and Daman & Diu',
            'Telangana': 'Andhra Pradesh', // Mapping Telangana to AP for pre-2014 data
            'Andhra Pradesh': 'Andhra Pradesh'
        };
        return nameMapping[geoJsonName] || geoJsonName;
    };

    // Helper to map Prop State Name -> GeoJSON State Name
    const getGeoJSONStateName = (modernStateName) => {
        const mapping = {
            'Odisha': 'Orissa',
            'Uttarakhand': 'Uttaranchal',
            'Andaman & Nicobar Islands': 'Andaman and Nicobar',
            'Andaman and Nicobar Islands': 'Andaman and Nicobar',
            'Puducherry': 'Puducherry',
            'Telangana': 'Andhra Pradesh',
            'Andhra Pradesh': 'Andhra Pradesh',
            'Maharashtra': 'Maharashtra',
            'Karnataka': 'Karnataka',
            'Tamil Nadu': 'Tamil Nadu',
            'Gujarat': 'Gujarat',
            'Rajasthan': 'Rajasthan',
            'West Bengal': 'West Bengal',
            'Madhya Pradesh': 'Madhya Pradesh',
            'Uttar Pradesh': 'Uttar Pradesh',
            'Kerala': 'Kerala',
            'Bihar': 'Bihar',
            'Jharkhand': 'Jharkhand',
            'Chhattisgarh': 'Chhattisgarh',
            'Haryana': 'Haryana',
            'Punjab': 'Punjab',
            'Delhi': 'Delhi', // Changed from 'NCT of Delhi' to 'Delhi'
            'Goa': 'Goa',
            'Himachal Pradesh': 'Himachal Pradesh',
            'Jammu and Kashmir': 'Jammu and Kashmir',
            'Assam': 'Assam',
            'Manipur': 'Manipur',
            'Meghalaya': 'Meghalaya',
            'Mizoram': 'Mizoram',
            'Nagaland': 'Nagaland',
            'Sikkim': 'Sikkim',
        };
        return mapping[modernStateName] || modernStateName;
    };

    const normalizeDistrictName = (districtName) => {
        const mapping = {
            // Karnataka
            'Bengaluru Urban': 'Bangalore Urban',
            'Bengaluru Rural': 'Bangalore Rural',
            'Belagavi': 'Belgaum',
            'Kalaburagi': 'Gulbarga',
            'Shivamogga': 'Shimoga',
            'Ballari': 'Bellary',
            'Vijayapura': 'Bijapur',
            'Chikkamagaluru': 'Chikmagalur',
            'Dakshina Kannada': 'Dakshina Kannada',
            'Uttara Kannada': 'Uttara Kannada',
            'Mysuru': 'Mysore',
            'Tumakuru': 'Tumkur',

            // Odisha (Orissa)
            'Boudh': 'Baudh',
            'Debagarh': 'Deogarh',
            'Jajapur': 'Jajpur',
            'Kendujhar': 'Keonjhar',
            'Subarnapur': 'Sonepur',

            // Uttar Pradesh
            'Kanpur Nagar': 'Kanpur',
            'Sant Ravidas Nagar': 'Bhadohi',
            'Gautam Buddha Nagar': 'Gautam Budh Nagar',
            'Prayagraj': 'Allahabad',
            'Sambhal': 'Bhim Nagar',

            // Tamil Nadu
            'Kallakurichi': 'Viluppuram', // New district carved from Viluppuram
            'Chengalpattu': 'Kanchipuram',
            'Tenkasi': 'Tirunelveli',
            'Ranipet': 'Vellore',
            'Tirupathur': 'Vellore',

            // Maharashtra
            'Mumbai': 'Greater Bombay',
            'Ahmednagar': 'Ahmadnagar',
            'Beed': 'Bid',

            // Gujarat
            'Ahmedabad': 'Ahmadabad',
            'Mahesana': 'Mehsana',
            'Panchmahal': 'Panch Mahals',
            'Sabarkantha': 'Sabar Kantha',
            'Dang': 'The Dangs',

            // Madhya Pradesh
            'Alirajpur': 'Jhabua', // New district
            'Agar Malwa': 'Shajapur', // New district

            // Chhattisgarh
            'Balod': 'Durg',
            'Balrampur': 'Surguja',
            'Bemetara': 'Durg',
            'Gariaband': 'Raipur',

            // Rajasthan
            'Pratapgarh': 'Chittaurgarh', // New district

            // West Bengal
            'North 24 Parganas': 'Twenty Four Parganas North',
            'South 24 Parganas': 'Twenty Four Parganas South',
            'Paschim Bardhaman': 'Barddhaman',
            'Purba Bardhaman': 'Barddhaman',
            'Jhargram': 'Paschim Medinipur',
            'Kalimpong': 'Darjiling',

            // Andhra Pradesh
            'YSR': 'Kadapa',
            'Sri Potti Sriramulu Nellore': 'Nellore',

            // Telangana (all districts are new, carved from AP)
            'Hyderabad': 'Hyderabad',
            'Ranga Reddy': 'Rangareddi',
            'Medchal Malkajgiri': 'Ranga Reddy',

            // Bihar
            'Arwal': 'Jahanabad', // New district
            'Kaimur': 'Rohtas',
            'Sheikhpura': 'Munger',

            // Jharkhand
            'Ramgarh': 'Hazaribagh', // New district
            'Khunti': 'Ranchi',
            'Latehar': 'Palamau',

            // Uttarakhand
            'Dehradun': 'Dehra Dun',

            // Assam
            'Kamrup Metropolitan': 'Kamrup',
            'Baksa': 'Barpeta',
            'Chirang': 'Bongaigaon',
            'Udalguri': 'Darrang'
        };
        return mapping[districtName] || districtName;
    };

    // Filter GeoJSON for the selected state
    const stateDistrictsGeoJSON = useMemo(() => {
        if (!indiaDistrictsGeoJSON) return null;

        const targetGeoJSONName = getGeoJSONStateName(state);
        console.log(`🗺️ DistrictMap: State "${state}" mapped to GeoJSON name "${targetGeoJSONName}"`);

        let features = indiaDistrictsGeoJSON.features.filter(feature =>
            feature.properties.NAME_1 === targetGeoJSONName
        );

        console.log(`🗺️ Found ${features.length} districts for state "${targetGeoJSONName}"`);

        if (district) {
            const targetDistrictName = normalizeDistrictName(district);
            console.log(`DistrictMap: Mapping "${district}" -> "${targetDistrictName}"`);

            features = features.filter(feature =>
                (feature.properties.NAME_2 || feature.properties.name) === targetDistrictName
            );

            console.log(`🗺️ After filtering for district "${targetDistrictName}": ${features.length} features`);
        }

        const filtered = {
            ...indiaDistrictsGeoJSON,
            features: features
        };

        return filtered;
    }, [state, district]);

    // Calculate bounds
    const mapBounds = useMemo(() => {
        if (stateDistrictsGeoJSON && stateDistrictsGeoJSON.features.length > 0) {
            return L.geoJSON(stateDistrictsGeoJSON).getBounds();
        }
        return null;
    }, [stateDistrictsGeoJSON]);

    const getDistrictColor = (districtName) => {
        if (highlightedDistrict && districtName === highlightedDistrict) {
            return '#4F46E5'; // Highlight color (Indigo-600)
        }
        const isImplemented = districtData.some(d => d.name === districtName);

        return isImplemented ? '#C7D2FE' : '#FFFFFF';
    };

    const onEachDistrict = (feature, layer) => {
        const districtName = feature.properties.NAME_2 || feature.properties.name; // NAME_2 is usually district name in this dataset
        const district = districtData.find(d => d.name === districtName);

        const isImplemented = !!district;

        layer.setStyle({
            fillColor: getDistrictColor(districtName),
            weight: 1.5,
            opacity: 1,
            color: '#4338CA', // Indigo border
            fillOpacity: 1
        });

        layer.on({
            mouseover: (e) => {
                e.target.setStyle({
                    weight: 2.5,
                    color: '#312E81', // Darker Navy on hover
                    fillOpacity: 0.9,
                    fillColor: isImplemented ? '#C7D2FE' : '#F3F4F6'
                });
            },
            mouseout: (e) => {
                e.target.setStyle({
                    weight: 1.5,
                    color: '#4338CA',
                    fillOpacity: 1,
                    fillColor: getDistrictColor(districtName)
                });
            },
            click: (e) => {
                if (isImplemented) {
                    setSelectedDistrict(districtName);
                    if (onDistrictSelect) {
                        onDistrictSelect(districtName);
                    }
                }
            }
        });

        if (district) {
            const fundUtilized = district.fundAllocated * (district.progress / 100);
            const fundRemaining = district.fundAllocated - fundUtilized;

            layer.bindPopup(`
        <div style="font-family: var(--font-primary); padding: 12px; min-width: 280px;">
          <h3 style="margin: 0 0 12px 0; color: var(--color-navy); font-size: 16px; font-weight: 600;">
            ${districtName} District
          </h3>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 4px 0; font-size: 13px;">
              <strong>Total Projects:</strong> ${district.projects}
            </p>
            <p style="margin: 4px 0; font-size: 13px;">
              <strong>Completed Projects:</strong> ${Math.floor(district.projects * (district.progress / 100))}
            </p>
          </div>
          
          <div style="margin: 12px 0; padding: 10px; background: #F9FAFB; border-radius: 6px;">
            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #374151;">Fund Utilization</p>
            
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 12px; color: #6B7280;">Progress</span>
                <span style="font-size: 12px; font-weight: 600; color: #7C3AED;">${district.progress}%</span>
              </div>
              <div style="width: 100%; height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden;">
                <div style="width: ${district.progress}%; height: 100%; background: linear-gradient(90deg, #7C3AED, #A78BFA); transition: width 0.3s ease;"></div>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px;">
              <div>
                <span style="color: #6B7280;">Allocated:</span>
                <span style="font-weight: 600; color: #374151; margin-left: 4px;">₹${(district.fundAllocated / 10000000).toFixed(2)} Cr</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 12px;">
              <div>
                <span style="color: #6B7280;">Utilized:</span>
                <span style="font-weight: 600; color: #7C3AED; margin-left: 4px;">₹${(fundUtilized / 10000000).toFixed(2)} Cr</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 12px;">
              <div>
                <span style="color: #6B7280;">Remaining:</span>
                <span style="font-weight: 600; color: #9CA3AF; margin-left: 4px;">₹${(fundRemaining / 10000000).toFixed(2)} Cr</span>
              </div>
            </div>
          </div>
        </div>
      `);
        } else {
            layer.bindPopup(`
        <div style="font-family: var(--font-primary); padding: 8px;">
          <h3 style="margin: 0 0 8px 0; color: var(--color-navy); font-size: 16px;">
            ${districtName}
          </h3>
          <p style="margin: 8px 0; font-size: 14px; color: #DC2626; font-weight: 600;">
            This district has not implemented PM-AJAY components yet.
          </p>
        </div>
      `);
        }


        // Add Label using Tooltip
        layer.bindTooltip(districtName, {
            permanent: true,
            direction: 'center',
            className: 'district-label',
            opacity: 1
        });

    };

    // Create custom icons for different project types
    const getProjectIcon = (component) => {
        const colors = {
            'Adarsh Gram': '#FF9933',
            'GIA (Grant-in-Aid)': '#138808',
            'Hostel': '#000080'
        };

        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
        background-color: ${colors[component] || '#3B82F6'};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    };

    return (
        <div className="map-container">
            <MapContainer
                center={[22, 79]} // Default center
                zoom={6}
                style={{ height: '100%', width: '100%', backgroundColor: '#F3F4F6' }}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                dragging={false}
                touchZoom={false}
                zoomControl={false}
                keyboard={false}
            >
                {/* Update map bounds when state changes */}
                <MapUpdater bounds={mapBounds} />

                {/* TileLayer removed for clean vector map look */}

                {stateDistrictsGeoJSON && (
                    <GeoJSON
                        key={state} // Force re-mount when state changes
                        data={stateDistrictsGeoJSON}
                        onEachFeature={onEachDistrict}
                    />
                )}

                {/* Project Markers */}
                {stateProjects.map(project => (
                    <Marker
                        key={project.id}
                        position={project.coordinates}
                        icon={getProjectIcon(project.component)}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'var(--font-primary)', minWidth: '250px' }}>
                                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-navy)', fontSize: '14px' }}>
                                    {project.name}
                                </h3>
                                <div style={{ fontSize: '12px' }}>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Component:</strong> {project.component}
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Status:</strong>
                                        <span className={`badge badge-${project.status.toLowerCase()}`} style={{ marginLeft: '4px' }}>
                                            {project.status}
                                        </span>
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Progress:</strong> {project.progress}%
                                    </p>
                                    <div className="progress-bar" style={{ margin: '8px 0' }}>
                                        <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Fund Allocated:</strong> ₹{(project.fundAllocated / 100000).toFixed(2)} L
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Department:</strong> {project.department}
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Agency:</strong> {project.agency}
                                    </p>
                                    <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                        Last Updated: {project.lastUpdate}
                                    </p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>



            {/* Legend */}
            <div className="map-legend" style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 1000,
                border: '1px solid #e5e7eb'
            }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1f2937' }}>District Status</h4>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ width: '20px', height: '20px', backgroundColor: '#C7D2FE', border: '1px solid #4338CA', marginRight: '10px', borderRadius: '4px' }}></span>
                    <span style={{ fontSize: '13px', color: '#4b5563' }}>Implemented</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '20px', height: '20px', backgroundColor: '#FFFFFF', border: '1px solid #4338CA', marginRight: '10px', borderRadius: '4px' }}></span>
                    <span style={{ fontSize: '13px', color: '#4b5563' }}>Non-Implemented</span>
                </div>
            </div>

        </div>
    );
};

export default DistrictMap;
