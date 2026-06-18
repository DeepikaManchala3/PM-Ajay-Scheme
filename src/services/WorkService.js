import { supabase } from '../lib/supabaseClient';

export const WorkService = {
    getAllWorks: async () => {
        try {
            // 1. Fetch Work Orders from Supabase
            const { data: workOrders, error: workError } = await supabase
                .from('work_orders')
                .select('*')
                .order('id', { ascending: true });


            if (workError) {
                console.error('Error fetching work orders:', workError);
                return [];
            }

            // 2. Get the latest progress for each work order from Supabase
            const { data: progressData, error: progressError } = await supabase
                .from('work_progress')
                .select('*')
                .order('created_at', { ascending: false });

            if (progressError) {
                console.error('Error fetching progress:', progressError);
                // Return work orders as is if progress fetch fails
                return workOrders;
            }

            // 3. Merge with latest progress
            const mergedWorks = workOrders.map(work => {
                // Find the most recent entry for this work_order_id
                const latestUpdate = progressData.find(p => p.work_order_id === work.id);

                if (latestUpdate) {
                    return {
                        ...work,
                        progress: latestUpdate.progress_percentage,
                        fundsReleased: latestUpdate.funds_released,
                        fundsUsed: latestUpdate.funds_used,
                        fundsRemaining: latestUpdate.funds_remaining,
                        remarks: latestUpdate.remarks,
                        lastUpdated: new Date(latestUpdate.created_at).toISOString().split('T')[0],
                        // Add officer details and viewed status
                        officerName: latestUpdate.officer_name,
                        officerPhone: latestUpdate.officer_phone,
                        viewedByAgency: latestUpdate.viewed_by_agency,
                        viewedAt: latestUpdate.viewed_at
                    };
                }
                return {
                    ...work,
                    // Ensure defaults if no progress yet
                    progress: work.progress || 0,
                    fundsReleased: work.funds_released || 0,
                    fundsUsed: work.funds_used || 0,
                    fundsRemaining: work.funds_remaining || 0,
                    remarks: work.remarks || '',
                    lastUpdated: null
                };
            });

            return mergedWorks;
        } catch (err) {
            console.error('WorkService Error:', err);
            return [];
        }
    },

    getWorksByAgency: async (agencyId) => {
        try {
            // 1. Fetch Work Orders for specific agency
            const { data: workOrders, error: workError } = await supabase
                .from('work_orders')
                .select('*')
                .eq('implementing_agency_id', agencyId)
                .order('id', { ascending: true });


            if (workError) {
                console.error('Error fetching work orders:', workError);
                return [];
            }

            // 2. Get the latest progress for each work order
            // Note: We could optimize this to only fetch progress for these work orders, 
            // but for now fetching all progress is simpler as we filter in memory.
            // Or better, fetch progress where work_order_id is in the list.
            const workOrderIds = workOrders.map(w => w.id);

            if (workOrderIds.length === 0) return [];

            const { data: progressData, error: progressError } = await supabase
                .from('work_progress')
                .select('*')
                .in('work_order_id', workOrderIds)
                .order('created_at', { ascending: false });

            if (progressError) {
                console.error('Error fetching progress:', progressError);
                return workOrders;
            }

            // 3. Merge with latest progress
            const mergedWorks = workOrders.map(work => {
                const latestUpdate = progressData.find(p => p.work_order_id === work.id);

                if (latestUpdate) {
                    return {
                        ...work,
                        progress: latestUpdate.progress_percentage,
                        fundsReleased: latestUpdate.funds_released,
                        fundsUsed: latestUpdate.funds_used,
                        fundsRemaining: latestUpdate.funds_remaining,
                        remarks: latestUpdate.remarks,
                        lastUpdated: new Date(latestUpdate.created_at).toISOString().split('T')[0],
                        officerName: latestUpdate.officer_name,
                        officerPhone: latestUpdate.officer_phone,
                        viewedByAgency: latestUpdate.viewed_by_agency,
                        viewedAt: latestUpdate.viewed_at
                    };
                }
                return {
                    ...work,
                    progress: work.progress || 0,
                    fundsReleased: work.funds_released || 0,
                    fundsUsed: work.funds_used || 0,
                    fundsRemaining: work.funds_remaining || 0,
                    remarks: work.remarks || '',
                    lastUpdated: null
                };
            });

            return mergedWorks;
        } catch (err) {
            console.error('WorkService Error:', err);
            return [];
        }
    },

    updateWork: async (updatedWork, officerDetails) => {
        try {
            // 1. Upload Photos to Storage (if any)
            let photoUrls = [];
            if (updatedWork.photos && updatedWork.photos.length > 0) {
                for (const file of updatedWork.photos) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${updatedWork.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('work-photos')
                        .upload(filePath, file);

                    if (uploadError) {
                        console.error('Error uploading photo:', uploadError);
                        continue; // Skip failed uploads but continue with others
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('work-photos')
                        .getPublicUrl(filePath);

                    photoUrls.push(publicUrl);
                }
            }

            // 2. Insert new progress record into Supabase
            const { data, error } = await supabase
                .from('work_progress')
                .insert([
                    {
                        work_order_id: updatedWork.id,
                        executing_agency_id: (await (async () => {
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user) throw new Error("User not authenticated");
                            return user.id;
                        })()),
                        officer_name: officerDetails.name,
                        officer_phone: officerDetails.phone,
                        progress_percentage: updatedWork.progress,
                        funds_released: updatedWork.fundsReleased,
                        funds_used: updatedWork.fundsUsed,
                        funds_remaining: updatedWork.fundsRemaining,
                        remarks: updatedWork.remarks,
                        photos: photoUrls, // Save the array of URLs
                        viewed_by_agency: false
                    }
                ])
                .select();

            if (error) {
                // Check for "relation does not exist" error (Postgres code 42P01) or 404
                if (error.code === '42P01' || error.code === '404' || error.message?.includes('does not exist')) {
                    throw new Error("The 'work_progress' table does not exist. Please run the SQL script in Supabase.");
                }
                throw error;
            }

            // 1.5 Update the main work_orders table with the latest status and progress snapshot
            // This ensures the main table reflects the current state
            const { error: updateError } = await supabase
                .from('work_orders')
                .update({
                    status: updatedWork.status, // e.g., 'Work in Progress'
                    progress: updatedWork.progress,
                    funds_released: updatedWork.fundsReleased,
                    funds_used: updatedWork.fundsUsed,
                    funds_remaining: updatedWork.fundsRemaining,
                    remarks: updatedWork.remarks
                })
                .eq('id', updatedWork.id);

            if (updateError) {
                console.error('Error updating work_orders snapshot:', updateError);
                // We don't throw here because the progress log was successful, 
                // but we should probably warn or log it.
            }

            // 2. Return updated list (optimistic or re-fetch)
            return await WorkService.getAllWorks();

        } catch (err) {
            console.error('Error updating work:', err);
            throw err;
        }
    },

    getProgressHistory: async (workId) => {
        try {
            const { data, error } = await supabase
                .from('work_progress')
                .select('*')
                .eq('work_order_id', workId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error fetching progress history:', err);
            return [];
        }
    },

    markAsViewed: async (workId) => {
        try {
            // Find the latest progress record for this work ID
            const { data: latestRecord, error: fetchError } = await supabase
                .from('work_progress')
                .select('id')
                .eq('work_order_id', workId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (fetchError || !latestRecord) return;

            // Update the viewed status
            const { error: updateError } = await supabase
                .from('work_progress')
                .update({
                    viewed_by_agency: true,
                    viewed_at: new Date().toISOString()
                })
                .eq('id', latestRecord.id);

            if (updateError) throw updateError;

            return await WorkService.getAllWorks();
        } catch (err) {
            console.error('Error marking as viewed:', err);
            throw err;
        }
    },

    getWorkById: async (id) => {
        const works = await WorkService.getAllWorks();
        return works.find(w => w.id === id);
    }
};
