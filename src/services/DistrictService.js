import { supabase } from '../lib/supabaseClient';

export const DistrictService = {
    // Get district statistics including fund utilization
    getDistrictStats: async (districtId) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/dashboard/district-stats/${districtId}`);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to fetch district stats:', errorData);
                throw new Error(errorData.error || 'Failed to fetch district stats');
            }

            const result = await response.json();
            console.log('✅ District stats fetched successfully:', result.data);
            return result.data;
        } catch (error) {
            console.error('Error fetching district stats:', error);
            return null;
        }
    },

    // Get district info by name
    getDistrictByName: async (districtName, stateName) => {
        try {
            // First get state ID
            const { data: stateData, error: stateError } = await supabase
                .from('states')
                .select('id')
                .eq('name', stateName)
                .single();

            if (stateError || !stateData) {
                console.error('Error fetching state:', stateError);
                return null;
            }

            // Then get district
            const { data: districtData, error: districtError } = await supabase
                .from('districts')
                .select('id, name')
                .eq('state_id', stateData.id)
                .eq('name', districtName)
                .single();

            if (districtError || !districtData) {
                console.error('Error fetching district:', districtError);
                return null;
            }

            return districtData;
        } catch (error) {
            console.error('Error in getDistrictByName:', error);
            return null;
        }
    }
};
