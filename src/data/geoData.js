// Simplified GeoJSON data for India states (coordinates are approximate)

import indiaStatesData from './india_states.json';
import indiaDistrictsData from './india_districts.json';

export const indiaGeoJSON = indiaStatesData;
export const indiaDistrictsGeoJSON = indiaDistrictsData;

// District boundaries for Maharashtra (simplified) - Keeping for reference or fallback
export const maharashtraDistrictsGeoJSON = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { name: "Pune", code: "PU" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [73.5, 18.2], [74.2, 18.2], [74.7, 18.5],
                    [74.7, 19.2], [74.2, 19.5], [73.5, 19.2], [73.5, 18.2]
                ]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Mumbai", code: "MU" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [72.7, 18.9], [73.0, 18.9], [73.2, 19.2],
                    [73.0, 19.4], [72.7, 19.3], [72.7, 18.9]
                ]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Nagpur", code: "NG" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [78.8, 20.8], [79.3, 20.8], [79.5, 21.2],
                    [79.3, 21.5], [78.8, 21.4], [78.8, 20.8]
                ]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Nashik", code: "NS" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [73.5, 19.5], [74.2, 19.5], [74.5, 20.0],
                    [74.2, 20.5], [73.5, 20.3], [73.5, 19.5]
                ]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Aurangabad", code: "AU" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [75.0, 19.5], [75.5, 19.5], [75.8, 19.9],
                    [75.5, 20.2], [75.0, 20.1], [75.0, 19.5]
                ]]
            }
        }
    ]
};
