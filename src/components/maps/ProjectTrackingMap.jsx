import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issues in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapUpdater = ({ projects }) => {
    const map = useMap();
    useEffect(() => {
        if (projects.length > 0) {
            const bounds = L.latLngBounds(projects.map(p => [p.latitude, p.longitude]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [projects, map]);
    return null;
};

const ProjectTrackingMap = ({ projects, loading }) => {
    return (
        <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%', borderRadius: '12px', zIndex: 0 }}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            <MapUpdater projects={projects} />

            {projects.map((project) => (
                <Marker
                    key={project.id}
                    position={[project.latitude, project.longitude]}
                >
                    <Popup>
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-navy-800 text-sm mb-2">{project.project_name}</h3>
                            <div className="space-y-1 text-xs">
                                <p><span className="text-gray-500">District:</span> {project.district_name}</p>
                                <p><span className="text-gray-500">Status:</span>
                                    <span className={`ml-1 px-2 py-0.5 rounded-full ${project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            project.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>{project.status}</span>
                                </p>
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <div className="flex justify-between mb-1">
                                        <span>Allocated:</span>
                                        <span className="font-semibold">₹{(project.allocated_amount / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Released:</span>
                                        <span className="font-semibold text-green-600">₹{(project.released_amount / 100000).toFixed(2)} L</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default ProjectTrackingMap;
