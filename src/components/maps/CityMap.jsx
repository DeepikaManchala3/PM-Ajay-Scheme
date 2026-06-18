import React, { useMemo } from 'react';
import { MapContainer, GeoJSON, Marker, Popup, Tooltip } from 'react-leaflet';
import { indiaDistrictsGeoJSON } from '../../data/geoData';
import { majorCities } from '../../data/mockData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CityMap = ({ district = 'Pune', state = 'Maharashtra' }) => {
    // Filter GeoJSON for the selected district
    const districtGeoJSON = useMemo(() => {
        if (!indiaDistrictsGeoJSON) return null;

        // Find the feature that matches the district name
        // Note: This relies on the GeoJSON having a property that matches the district name
        // In the provided mock data, we might need to be careful with matching
        return {
            ...indiaDistrictsGeoJSON,
            features: indiaDistrictsGeoJSON.features.filter(feature =>
                (feature.properties.NAME_2 === district || feature.properties.name === district)
            )
        };
    }, [district]);

    // Calculate bounds to center the map
    const mapBounds = useMemo(() => {
        if (districtGeoJSON && districtGeoJSON.features.length > 0) {
            return L.geoJSON(districtGeoJSON).getBounds();
        }
        return null;
    }, [districtGeoJSON]);

    const cities = majorCities[district] || [];

    const getCityIcon = () => {
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background-color: #EF4444;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
    };

    return (
        <div className="map-container">
            <MapContainer
                center={[18.5204, 73.8567]} // Default fallback
                zoom={9}
                style={{ height: '100%', width: '100%', backgroundColor: '#F3F4F6' }}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                dragging={false}
                touchZoom={false}
                zoomControl={false}
                keyboard={false}
                ref={(map) => {
                    if (map && mapBounds) {
                        map.fitBounds(mapBounds, { padding: [30, 30] });
                    }
                }}
            >
                {districtGeoJSON && (
                    <GeoJSON
                        data={districtGeoJSON}
                        style={{
                            fillColor: '#FCE7F3',
                            weight: 2,
                            opacity: 1,
                            color: '#DB2777',
                            fillOpacity: 0.5
                        }}
                    />
                )}

                {cities.map(city => (
                    <Marker
                        key={city.id}
                        position={city.coordinates}
                        icon={getCityIcon()}
                    >
                        <Tooltip permanent direction="right" offset={[10, 0]} className="city-label">
                            {city.name}
                        </Tooltip>
                        <Popup>
                            <div style={{ fontFamily: 'var(--font-primary)', padding: '4px' }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--color-navy)' }}>{city.name}</h3>
                                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{city.type}</p>
                                <p style={{ margin: '0', fontSize: '12px' }}>Pop: {city.population}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default CityMap;
