// Mock data for PM-AJAY Portal

export const states = [
    { id: 1, name: 'Maharashtra', code: 'MH', districts: 36, projects: 245, fundAllocated: 15000000000 },
    { id: 2, name: 'Uttar Pradesh', code: 'UP', districts: 75, projects: 420, fundAllocated: 25000000000 },
    { id: 3, name: 'Karnataka', code: 'KA', districts: 31, projects: 189, fundAllocated: 12000000000 },
    { id: 4, name: 'Tamil Nadu', code: 'TN', districts: 38, projects: 210, fundAllocated: 13500000000 },
    { id: 5, name: 'Gujarat', code: 'GJ', districts: 33, projects: 198, fundAllocated: 11000000000 },
    { id: 6, name: 'Rajasthan', code: 'RJ', districts: 33, projects: 175, fundAllocated: 10500000000 },
    { id: 7, name: 'West Bengal', code: 'WB', districts: 23, projects: 156, fundAllocated: 9500000000 },
    { id: 8, name: 'Madhya Pradesh', code: 'MP', districts: 52, projects: 234, fundAllocated: 14000000000 },
    { id: 9, name: 'Telangana', code: 'TG', districts: 33, projects: 145, fundAllocated: 8500000000 },
    { id: 10, name: 'Andhra Pradesh', code: 'AP', districts: 26, projects: 167, fundAllocated: 9200000000 },
    { id: 11, name: 'Kerala', code: 'KL', districts: 14, projects: 112, fundAllocated: 7800000000 },
    { id: 12, name: 'Odisha', code: 'OD', districts: 30, projects: 134, fundAllocated: 8100000000 },
    { id: 13, name: 'Uttarakhand', code: 'UK', districts: 13, projects: 89, fundAllocated: 4500000000 },
    { id: 14, name: 'Bihar', code: 'BR', districts: 38, projects: 210, fundAllocated: 11500000000 },
    { id: 15, name: 'Jharkhand', code: 'JH', districts: 24, projects: 98, fundAllocated: 5600000000 },
    { id: 16, name: 'Chhattisgarh', code: 'CG', districts: 33, projects: 105, fundAllocated: 6200000000 },
    { id: 17, name: 'Haryana', code: 'HR', districts: 22, projects: 123, fundAllocated: 7100000000 },
    { id: 18, name: 'Punjab', code: 'PB', districts: 23, projects: 145, fundAllocated: 8900000000 },
    { id: 19, name: 'Delhi', code: 'DL', districts: 11, projects: 75, fundAllocated: 5500000000 }
];

export const districts = {
    Maharashtra: [
        { id: 1, name: 'Pune', projects: 45, fundAllocated: 850000000, progress: 68 },
        { id: 2, name: 'Mumbai', projects: 38, fundAllocated: 920000000, progress: 72 },
        { id: 3, name: 'Nagpur', projects: 32, fundAllocated: 680000000, progress: 55 },
        { id: 4, name: 'Nashik', projects: 28, fundAllocated: 590000000, progress: 61 },
        { id: 5, name: 'Aurangabad', projects: 25, fundAllocated: 520000000, progress: 58 }
    ],
    Karnataka: [
        { id: 1, name: 'Bidar', projects: 12, fundAllocated: 250000000, progress: 45 },
        { id: 2, name: 'Gulbarga', projects: 18, fundAllocated: 320000000, progress: 52 },
        { id: 3, name: 'Bijapur', projects: 15, fundAllocated: 280000000, progress: 48 },
        { id: 4, name: 'Raichur', projects: 10, fundAllocated: 180000000, progress: 40 },
        { id: 5, name: 'Bellary', projects: 22, fundAllocated: 450000000, progress: 65 },
        { id: 6, name: 'Belgaum', projects: 25, fundAllocated: 500000000, progress: 70 },
        { id: 7, name: 'Dharwad', projects: 20, fundAllocated: 380000000, progress: 62 },
        { id: 8, name: 'Bangalore Urban', projects: 45, fundAllocated: 950000000, progress: 85 }
    ],
    'Uttar Pradesh': [
        { id: 1, name: 'Lucknow', projects: 55, fundAllocated: 950000000, progress: 75 },
        { id: 2, name: 'Kanpur Nagar', projects: 48, fundAllocated: 820000000, progress: 68 },
        { id: 3, name: 'Varanasi', projects: 62, fundAllocated: 1100000000, progress: 82 },
        { id: 4, name: 'Agra', projects: 40, fundAllocated: 750000000, progress: 60 },
        { id: 5, name: 'Prayagraj', projects: 50, fundAllocated: 880000000, progress: 70 },
        { id: 6, name: 'Gorakhpur', projects: 45, fundAllocated: 780000000, progress: 65 },
        { id: 7, name: 'Meerut', projects: 38, fundAllocated: 650000000, progress: 58 },
        { id: 8, name: 'Ghaziabad', projects: 42, fundAllocated: 720000000, progress: 62 }
    ],
    'Tamil Nadu': [
        { id: 1, name: 'Chennai', projects: 65, fundAllocated: 1200000000, progress: 88 },
        { id: 2, name: 'Coimbatore', projects: 52, fundAllocated: 950000000, progress: 78 },
        { id: 3, name: 'Madurai', projects: 45, fundAllocated: 820000000, progress: 72 },
        { id: 4, name: 'Tiruchirappalli', projects: 38, fundAllocated: 680000000, progress: 65 },
        { id: 5, name: 'Salem', projects: 35, fundAllocated: 620000000, progress: 60 },
        { id: 6, name: 'Tirunelveli', projects: 30, fundAllocated: 550000000, progress: 58 },
        { id: 7, name: 'Erode', projects: 28, fundAllocated: 480000000, progress: 55 }
    ],
    Gujarat: [
        { id: 1, name: 'Ahmedabad', projects: 58, fundAllocated: 1150000000, progress: 85 },
        { id: 2, name: 'Surat', projects: 55, fundAllocated: 1050000000, progress: 82 },
        { id: 3, name: 'Vadodara', projects: 42, fundAllocated: 850000000, progress: 75 },
        { id: 4, name: 'Rajkot', projects: 38, fundAllocated: 720000000, progress: 70 },
        { id: 5, name: 'Bhavnagar', projects: 30, fundAllocated: 580000000, progress: 65 },
        { id: 6, name: 'Jamnagar', projects: 28, fundAllocated: 520000000, progress: 62 }
    ],
    Rajasthan: [
        { id: 1, name: 'Jaipur', projects: 50, fundAllocated: 980000000, progress: 78 },
        { id: 2, name: 'Jodhpur', projects: 42, fundAllocated: 820000000, progress: 70 },
        { id: 3, name: 'Udaipur', projects: 35, fundAllocated: 680000000, progress: 65 },
        { id: 4, name: 'Kota', projects: 32, fundAllocated: 620000000, progress: 62 },
        { id: 5, name: 'Ajmer', projects: 28, fundAllocated: 550000000, progress: 58 },
        { id: 6, name: 'Bikaner', projects: 25, fundAllocated: 480000000, progress: 55 }
    ],
    'West Bengal': [
        { id: 1, name: 'Kolkata', projects: 60, fundAllocated: 1100000000, progress: 80 },
        { id: 2, name: 'North 24 Parganas', projects: 55, fundAllocated: 950000000, progress: 75 },
        { id: 3, name: 'South 24 Parganas', projects: 48, fundAllocated: 850000000, progress: 70 },
        { id: 4, name: 'Howrah', projects: 42, fundAllocated: 780000000, progress: 68 },
        { id: 5, name: 'Hooghly', projects: 38, fundAllocated: 650000000, progress: 62 },
        { id: 6, name: 'Darjeeling', projects: 30, fundAllocated: 550000000, progress: 58 }
    ],
    'Madhya Pradesh': [
        { id: 1, name: 'Indore', projects: 52, fundAllocated: 920000000, progress: 82 },
        { id: 2, name: 'Bhopal', projects: 48, fundAllocated: 880000000, progress: 78 },
        { id: 3, name: 'Jabalpur', projects: 40, fundAllocated: 720000000, progress: 70 },
        { id: 4, name: 'Gwalior', projects: 35, fundAllocated: 650000000, progress: 65 },
        { id: 5, name: 'Ujjain', projects: 30, fundAllocated: 550000000, progress: 60 }
    ],
    Telangana: [
        { id: 1, name: 'Hyderabad', projects: 62, fundAllocated: 1250000000, progress: 88 },
        { id: 2, name: 'Ranga Reddy', projects: 45, fundAllocated: 850000000, progress: 75 },
        { id: 3, name: 'Medchal Malkajgiri', projects: 38, fundAllocated: 720000000, progress: 70 },
        { id: 4, name: 'Warangal Urban', projects: 32, fundAllocated: 620000000, progress: 65 },
        { id: 5, name: 'Karimnagar', projects: 28, fundAllocated: 550000000, progress: 60 }
    ],
    'Andhra Pradesh': [
        { id: 1, name: 'Visakhapatnam', projects: 55, fundAllocated: 980000000, progress: 80 },
        { id: 2, name: 'Krishna', projects: 48, fundAllocated: 850000000, progress: 75 },
        { id: 3, name: 'Guntur', projects: 45, fundAllocated: 820000000, progress: 72 },
        { id: 4, name: 'East Godavari', projects: 40, fundAllocated: 750000000, progress: 68 },
        { id: 5, name: 'Chittoor', projects: 35, fundAllocated: 650000000, progress: 62 }
    ],
    Kerala: [
        { id: 1, name: 'Thiruvananthapuram', projects: 45, fundAllocated: 850000000, progress: 82 },
        { id: 2, name: 'Ernakulam', projects: 42, fundAllocated: 820000000, progress: 80 },
        { id: 3, name: 'Kozhikode', projects: 38, fundAllocated: 750000000, progress: 75 },
        { id: 4, name: 'Thrissur', projects: 35, fundAllocated: 680000000, progress: 72 },
        { id: 5, name: 'Kollam', projects: 30, fundAllocated: 580000000, progress: 68 }
    ],
    Odisha: [
        { id: 1, name: 'Khordha', projects: 40, fundAllocated: 750000000, progress: 72 },
        { id: 2, name: 'Cuttack', projects: 35, fundAllocated: 650000000, progress: 68 },
        { id: 3, name: 'Ganjam', projects: 32, fundAllocated: 580000000, progress: 62 },
        { id: 4, name: 'Sundargarh', projects: 28, fundAllocated: 520000000, progress: 58 },
        { id: 5, name: 'Puri', projects: 25, fundAllocated: 450000000, progress: 55 }
    ],
    Uttarakhand: [
        { id: 1, name: 'Dehradun', projects: 35, fundAllocated: 650000000, progress: 75 },
        { id: 2, name: 'Haridwar', projects: 30, fundAllocated: 550000000, progress: 70 },
        { id: 3, name: 'Nainital', projects: 25, fundAllocated: 450000000, progress: 65 },
        { id: 4, name: 'Udham Singh Nagar', projects: 22, fundAllocated: 400000000, progress: 60 }
    ],
    Bihar: [
        { id: 1, name: 'Patna', projects: 50, fundAllocated: 850000000, progress: 65 },
        { id: 2, name: 'Gaya', projects: 40, fundAllocated: 680000000, progress: 58 },
        { id: 3, name: 'Muzaffarpur', projects: 35, fundAllocated: 580000000, progress: 55 },
        { id: 4, name: 'Bhagalpur', projects: 30, fundAllocated: 520000000, progress: 52 },
        { id: 5, name: 'Nalanda', projects: 28, fundAllocated: 480000000, progress: 50 }
    ],
    Jharkhand: [
        { id: 1, name: 'Ranchi', projects: 42, fundAllocated: 720000000, progress: 62 },
        { id: 2, name: 'Dhanbad', projects: 38, fundAllocated: 650000000, progress: 58 },
        { id: 3, name: 'East Singhbhum', projects: 35, fundAllocated: 580000000, progress: 55 },
        { id: 4, name: 'Bokaro', projects: 30, fundAllocated: 520000000, progress: 52 }
    ],
    Chhattisgarh: [
        { id: 1, name: 'Raipur', projects: 40, fundAllocated: 680000000, progress: 65 },
        { id: 2, name: 'Durg', projects: 35, fundAllocated: 580000000, progress: 60 },
        { id: 3, name: 'Bilaspur', projects: 32, fundAllocated: 520000000, progress: 58 },
        { id: 4, name: 'Rajnandgaon', projects: 28, fundAllocated: 450000000, progress: 55 }
    ],
    Haryana: [
        { id: 1, name: 'Gurugram', projects: 48, fundAllocated: 950000000, progress: 85 },
        { id: 2, name: 'Faridabad', projects: 45, fundAllocated: 880000000, progress: 80 },
        { id: 3, name: 'Karnal', projects: 35, fundAllocated: 650000000, progress: 70 },
        { id: 4, name: 'Panipat', projects: 32, fundAllocated: 580000000, progress: 65 },
        { id: 5, name: 'Ambala', projects: 30, fundAllocated: 520000000, progress: 62 }
    ],
    Punjab: [
        { id: 1, name: 'Ludhiana', projects: 50, fundAllocated: 920000000, progress: 78 },
        { id: 2, name: 'Amritsar', projects: 45, fundAllocated: 850000000, progress: 75 },
        { id: 3, name: 'Jalandhar', projects: 40, fundAllocated: 750000000, progress: 72 },
        { id: 4, name: 'Patiala', projects: 35, fundAllocated: 650000000, progress: 68 },
        { id: 5, name: 'Bathinda', projects: 30, fundAllocated: 550000000, progress: 65 }
    ],
    'Himachal Pradesh': [
        { id: 1, name: 'Shimla', projects: 25, fundAllocated: 450000000, progress: 70 },
        { id: 2, name: 'Kangra', projects: 22, fundAllocated: 400000000, progress: 65 },
        { id: 3, name: 'Mandi', projects: 20, fundAllocated: 350000000, progress: 60 }
    ],
    'Jammu and Kashmir': [
        { id: 1, name: 'Srinagar', projects: 30, fundAllocated: 550000000, progress: 65 },
        { id: 2, name: 'Jammu', projects: 28, fundAllocated: 500000000, progress: 62 },
        { id: 3, name: 'Anantnag', projects: 25, fundAllocated: 450000000, progress: 60 }
    ],
    Goa: [
        { id: 1, name: 'North Goa', projects: 15, fundAllocated: 250000000, progress: 75 },
        { id: 2, name: 'South Goa', projects: 12, fundAllocated: 200000000, progress: 70 }
    ],
    Assam: [
        { id: 1, name: 'Kamrup Metropolitan', projects: 35, fundAllocated: 600000000, progress: 72 },
        { id: 2, name: 'Dibrugarh', projects: 30, fundAllocated: 500000000, progress: 68 },
        { id: 3, name: 'Cachar', projects: 25, fundAllocated: 450000000, progress: 65 }
    ],
    Manipur: [
        { id: 1, name: 'Imphal West', projects: 20, fundAllocated: 350000000, progress: 65 },
        { id: 2, name: 'Imphal East', projects: 18, fundAllocated: 300000000, progress: 60 }
    ],
    Meghalaya: [
        { id: 1, name: 'East Khasi Hills', projects: 22, fundAllocated: 400000000, progress: 68 },
        { id: 2, name: 'West Garo Hills', projects: 18, fundAllocated: 320000000, progress: 62 }
    ],
    Mizoram: [
        { id: 1, name: 'Aizawl', projects: 15, fundAllocated: 280000000, progress: 70 },
        { id: 2, name: 'Lunglei', projects: 12, fundAllocated: 220000000, progress: 65 }
    ],
    Nagaland: [
        { id: 1, name: 'Dimapur', projects: 18, fundAllocated: 320000000, progress: 65 },
        { id: 2, name: 'Kohima', projects: 15, fundAllocated: 280000000, progress: 60 }
    ],
    Sikkim: [
        { id: 1, name: 'East Sikkim', projects: 12, fundAllocated: 200000000, progress: 75 },
        { id: 2, name: 'South Sikkim', projects: 10, fundAllocated: 180000000, progress: 70 }
    ],
    Tripura: [
        { id: 1, name: 'West Tripura', projects: 20, fundAllocated: 350000000, progress: 72 },
        { id: 2, name: 'Gomati', projects: 15, fundAllocated: 280000000, progress: 68 }
    ],
    'Arunachal Pradesh': [
        { id: 1, name: 'Papum Pare', projects: 15, fundAllocated: 250000000, progress: 65 },
        { id: 2, name: 'Changlang', projects: 12, fundAllocated: 200000000, progress: 60 }
    ],
    'NCT of Delhi': [
        { id: 1, name: 'New Delhi', projects: 40, fundAllocated: 800000000, progress: 85 },
        { id: 2, name: 'North West Delhi', projects: 35, fundAllocated: 700000000, progress: 80 },
        { id: 3, name: 'North', projects: 32, fundAllocated: 650000000, progress: 78 },
        { id: 4, name: 'North East', projects: 30, fundAllocated: 620000000, progress: 75 },
        { id: 5, name: 'East', projects: 28, fundAllocated: 580000000, progress: 72 },
        { id: 6, name: 'West', projects: 25, fundAllocated: 520000000, progress: 70 },
        { id: 7, name: 'South', projects: 33, fundAllocated: 680000000, progress: 80 },
        { id: 8, name: 'South West', projects: 27, fundAllocated: 560000000, progress: 73 }
    ],
    Delhi: [
        { id: 1, name: 'New Delhi', projects: 40, fundAllocated: 800000000, progress: 85 },
        { id: 2, name: 'North West Delhi', projects: 35, fundAllocated: 700000000, progress: 80 },
        { id: 3, name: 'North', projects: 32, fundAllocated: 650000000, progress: 78 },
        { id: 4, name: 'North East', projects: 30, fundAllocated: 620000000, progress: 75 },
        { id: 5, name: 'East', projects: 28, fundAllocated: 580000000, progress: 72 },
        { id: 6, name: 'West', projects: 25, fundAllocated: 520000000, progress: 70 },
        { id: 7, name: 'South', projects: 33, fundAllocated: 680000000, progress: 80 },
        { id: 8, name: 'South West', projects: 27, fundAllocated: 560000000, progress: 73 }
    ],
    Puducherry: [
        { id: 1, name: 'Puducherry', projects: 15, fundAllocated: 250000000, progress: 75 },
        { id: 2, name: 'Karaikal', projects: 10, fundAllocated: 180000000, progress: 70 }
    ],
    Chandigarh: [
        { id: 1, name: 'Chandigarh', projects: 20, fundAllocated: 350000000, progress: 82 }
    ],
    'Dadra & Nagar Haveli and Daman & Diu': [
        { id: 1, name: 'Daman', projects: 12, fundAllocated: 200000000, progress: 70 },
        { id: 2, name: 'Dadra & Nagar Haveli', projects: 10, fundAllocated: 180000000, progress: 65 }
    ],
    'Andaman & Nicobar Islands': [
        { id: 1, name: 'South Andaman', projects: 15, fundAllocated: 250000000, progress: 72 },
        { id: 2, name: 'North & Middle Andaman', projects: 10, fundAllocated: 180000000, progress: 65 }
    ],
    Lakshadweep: [
        { id: 1, name: 'Lakshadweep', projects: 8, fundAllocated: 150000000, progress: 68 }
    ]
};

export const schemeComponents = [
    { id: 1, name: 'Adarsh Gram', code: 'AG', color: '#FF9933', icon: '🏘️' },
    { id: 2, name: 'GIA (Grant-in-Aid)', code: 'GIA', color: '#138808', icon: '💰' },
    { id: 3, name: 'Hostel', code: 'HOSTEL', color: '#000080', icon: '🏫' }
];

export const projectStatuses = [
    { id: 1, name: 'Proposed', code: 'PROPOSED', color: '#9CA3AF', icon: '📝' },
    { id: 2, name: 'Approved', code: 'APPROVED', color: '#3B82F6', icon: '✅' },
    { id: 3, name: 'Ongoing', code: 'ONGOING', color: '#F59E0B', icon: '🚧' },
    { id: 4, name: 'Completed', code: 'COMPLETED', color: '#10B981', icon: '✔️' },
    { id: 5, name: 'Delayed', code: 'DELAYED', color: '#EF4444', icon: '⚠️' }
];

export const implementingDepartments = [
    { id: 1, name: 'Public Works Department', code: 'PWD', icon: '🏗️' },
    { id: 2, name: 'Public Health Engineering Department', code: 'PHED', icon: '💧' },
    { id: 3, name: 'Education Department', code: 'EDU', icon: '📚' },
    { id: 4, name: 'Rural Development Department', code: 'RDD', icon: '🌾' },
    { id: 5, name: 'Social Welfare Department', code: 'SWD', icon: '🤝' }
];

export const executingAgencies = [
    { id: 1, name: 'Self Help Groups (SHG)', code: 'SHG', type: 'Community' },
    { id: 2, name: 'NGO Partners', code: 'NGO', type: 'Non-Profit' },
    { id: 3, name: 'Common Service Centers', code: 'CSC', type: 'Government' },
    { id: 4, name: 'Private Contractors', code: 'PVT', type: 'Private' }
];

export const mockProjects = [
    {
        id: 1,
        name: 'Community Hall Construction - Shirur',
        component: 'Adarsh Gram',
        status: 'ONGOING',
        state: 'Maharashtra',
        district: 'Pune',
        gp: 'Shirur Gram Panchayat',
        department: 'Public Works Department',
        agency: 'ABC Construction Pvt Ltd',
        fundAllocated: 5000000,
        fundReleased: 3500000,
        fundUtilized: 2800000,
        progress: 65,
        startDate: '2024-01-15',
        expectedCompletion: '2025-06-30',
        coordinates: [18.6298, 74.3714],
        photos: 3,
        lastUpdate: '2025-11-20'
    },
    {
        id: 2,
        name: 'SC/ST Hostel - Pune City',
        component: 'Hostel',
        status: 'APPROVED',
        state: 'Maharashtra',
        district: 'Pune',
        gp: 'Pune Municipal Corporation',
        department: 'Education Department',
        agency: 'Pending Assignment',
        fundAllocated: 12000000,
        fundReleased: 6000000,
        fundUtilized: 0,
        progress: 0,
        startDate: '2025-01-01',
        expectedCompletion: '2026-12-31',
        coordinates: [18.5204, 73.8567],
        photos: 0,
        lastUpdate: '2025-11-15'
    },
    {
        id: 3,
        name: 'Water Supply System - Khed',
        component: 'Adarsh Gram',
        status: 'ONGOING',
        state: 'Maharashtra',
        district: 'Pune',
        gp: 'Khed Gram Panchayat',
        department: 'Public Health Engineering Department',
        agency: 'XYZ Infrastructure Ltd',
        fundAllocated: 8500000,
        fundReleased: 8500000,
        fundUtilized: 6200000,
        progress: 73,
        startDate: '2024-03-01',
        expectedCompletion: '2025-03-31',
        coordinates: [18.7186, 73.9514],
        photos: 8,
        lastUpdate: '2025-11-22'
    },
    {
        id: 4,
        name: 'Skill Development Center - Baramati',
        component: 'GIA',
        status: 'COMPLETED',
        state: 'Maharashtra',
        district: 'Pune',
        gp: 'Baramati Nagar Panchayat',
        department: 'Social Welfare Department',
        agency: 'Empowerment NGO',
        fundAllocated: 3500000,
        fundReleased: 3500000,
        fundUtilized: 3500000,
        progress: 100,
        startDate: '2023-06-01',
        expectedCompletion: '2024-05-31',
        coordinates: [18.1514, 74.5815],
        photos: 15,
        lastUpdate: '2024-06-05'
    },
    {
        id: 5,
        name: 'Road Construction - Junnar',
        component: 'Adarsh Gram',
        status: 'DELAYED',
        state: 'Maharashtra',
        district: 'Pune',
        gp: 'Junnar Gram Panchayat',
        department: 'Public Works Department',
        agency: 'Road Builders Co',
        fundAllocated: 6000000,
        fundReleased: 4500000,
        fundUtilized: 2100000,
        progress: 35,
        startDate: '2024-02-01',
        expectedCompletion: '2024-12-31',
        coordinates: [19.2088, 73.8758],
        photos: 4,
        lastUpdate: '2025-11-10'
    }
];

export const mockNotifications = [
    {
        id: 1,
        title: 'New Fund Release Approved',
        message: 'Rs. 50 Lakhs released for Shirur GP projects',
        type: 'success',
        date: '2025-11-24',
        read: false
    },
    {
        id: 2,
        title: 'Approval Pending',
        message: '3 new proposals awaiting your approval',
        type: 'warning',
        date: '2025-11-23',
        read: false
    },
    {
        id: 3,
        title: 'Project Delayed',
        message: 'Junnar Road Construction is behind schedule',
        type: 'error',
        date: '2025-11-22',
        read: true
    },
    {
        id: 4,
        title: 'UC Submission Due',
        message: 'Utilization Certificate due in 5 days',
        type: 'info',
        date: '2025-11-21',
        read: false
    }
];

export const nationalStats = {
    totalStates: 28,
    totalDistricts: 756,
    totalProjects: 2847,
    totalFundAllocated: 125000000000,
    totalFundReleased: 87500000000,
    totalFundUtilized: 65200000000,
    projectsCompleted: 1245,
    projectsOngoing: 1156,
    projectsApproved: 312,
    projectsProposed: 134,
    averageProgress: 62
};

export const stateStats = {
    Maharashtra: {
        districts: 36,
        projects: 245,
        fundAllocated: 15000000000,
        fundReleased: 10500000000,
        fundUtilized: 7800000000,
        projectsCompleted: 98,
        projectsOngoing: 112,
        projectsApproved: 25,
        projectsProposed: 10,
        averageProgress: 68
    }
};

export const districtStats = {
    Pune: {
        gps: 42,
        projects: 45,
        fundAllocated: 850000000,
        fundReleased: 680000000,
        fundUtilized: 520000000,
        projectsCompleted: 18,
        projectsOngoing: 20,
        projectsApproved: 5,
    }
};

export const majorCities = {
    // Maharashtra
    Pune: [
        { id: 1, name: 'Pune City', coordinates: [18.5204, 73.8567], population: '3.1M', type: 'Municipal Corp' },
        { id: 2, name: 'Pimpri-Chinchwad', coordinates: [18.6298, 73.7997], population: '1.7M', type: 'Municipal Corp' },
        { id: 3, name: 'Baramati', coordinates: [18.1514, 74.5815], population: '120K', type: 'Municipal Council' },
        { id: 4, name: 'Lonavala', coordinates: [18.7515, 73.4090], population: '60K', type: 'Municipal Council' },
        { id: 5, name: 'Shirur', coordinates: [18.8298, 74.3714], population: '45K', type: 'Municipal Council' },
        { id: 6, name: 'Daund', coordinates: [18.4601, 74.5836], population: '55K', type: 'Municipal Council' },
        { id: 7, name: 'Junnar', coordinates: [19.2088, 73.8758], population: '30K', type: 'Municipal Council' },
        { id: 8, name: 'Khed', coordinates: [18.7186, 73.9514], population: '28K', type: 'Municipal Council' },
        { id: 9, name: 'Maval', coordinates: [18.7447, 73.4329], population: '32K', type: 'Municipal Council' },
        { id: 10, name: 'Haveli', coordinates: [18.4574, 73.8544], population: '38K', type: 'Municipal Council' }
    ],
    Mumbai: [
        { id: 1, name: 'Mumbai Central', coordinates: [19.0176, 72.8561], population: '12.4M', type: 'Municipal Corp' },
        { id: 2, name: 'Thane', coordinates: [19.2183, 72.9781], population: '1.8M', type: 'Municipal Corp' },
        { id: 3, name: 'Navi Mumbai', coordinates: [19.0330, 73.0297], population: '1.1M', type: 'Municipal Corp' },
        { id: 4, name: 'Kalyan', coordinates: [19.2403, 73.1305], population: '1.2M', type: 'Municipal Corp' },
        { id: 5, name: 'Vasai', coordinates: [19.4612, 72.8133], population: '1.2M', type: 'Municipal Council' },
        { id: 6, name: 'Mira-Bhayandar', coordinates: [19.2952, 72.8544], population: '809K', type: 'Municipal Corp' },
        { id: 7, name: 'Bhiwandi', coordinates: [19.3009, 73.0629], population: '709K', type: 'Municipal Corp' },
        { id: 8, name: 'Ulhasnagar', coordinates: [19.2183, 73.1382], population: '506K', type: 'Municipal Corp' },
        { id: 9, name: 'Ambarnath', coordinates: [19.1944, 73.1986], population: '253K', type: 'Municipal Council' },
        { id: 10, name: 'Panvel', coordinates: [18.9894, 73.1102], population: '180K', type: 'Municipal Council' }
    ],
    Nagpur: [
        { id: 1, name: 'Nagpur City', coordinates: [21.1458, 79.0882], population: '2.4M', type: 'Municipal Corp' },
        { id: 2, name: 'Kamptee', coordinates: [21.2216, 79.1961], population: '80K', type: 'Municipal Council' },
        { id: 3, name: 'Ramtek', coordinates: [21.3958, 79.3234], population: '35K', type: 'Municipal Council' },
        { id: 4, name: 'Katol', coordinates: [21.2772, 78.5864], population: '50K', type: 'Municipal Council' },
        { id: 5, name: 'Umred', coordinates: [20.8545, 79.3244], population: '28K', type: 'Municipal Council' },
        { id: 6, name: 'Saoner', coordinates: [21.3858, 78.9208], population: '32K', type: 'Municipal Council' },
        { id: 7, name: 'Parseoni', coordinates: [21.2678, 79.3322], population: '22K', type: 'Municipal Council' }
    ],
    Nashik: [
        { id: 1, name: 'Nashik City', coordinates: [19.9975, 73.7898], population: '1.5M', type: 'Municipal Corp' },
        { id: 2, name: 'Malegaon', coordinates: [20.5579, 74.5287], population: '471K', type: 'Municipal Corp' },
        { id: 3, name: 'Sinnar', coordinates: [19.8447, 73.9977], population: '35K', type: 'Municipal Council' },
        { id: 4, name: 'Igatpuri', coordinates: [19.6950, 73.5631], population: '25K', type: 'Municipal Council' },
        { id: 5, name: 'Nandgaon', coordinates: [20.3043, 73.5502], population: '28K', type: 'Municipal Council' },
        { id: 6, name: 'Yeola', coordinates: [20.0425, 74.4892], population: '35K', type: 'Municipal Council' },
        { id: 7, name: 'Satana', coordinates: [20.5973, 74.2109], population: '30K', type: 'Municipal Council' },
        { id: 8, name: 'Chandwad', coordinates: [20.3324, 74.2431], population: '27K', type: 'Municipal Council' }
    ],
    Aurangabad: [
        { id: 1, name: 'Aurangabad City', coordinates: [19.8762, 75.3433], population: '1.2M', type: 'Municipal Corp' },
        { id: 2, name: 'Jalna', coordinates: [19.8414, 75.8840], population: '285K', type: 'Municipal Council' },
        { id: 3, name: 'Paithan', coordinates: [19.4810, 75.3846], population: '40K', type: 'Municipal Council' },
        { id: 4, name: 'Vaijapur', coordinates: [19.9268, 74.7277], population: '30K', type: 'Municipal Council' },
        { id: 5, name: 'Gangapur', coordinates: [19.6972, 75.0119], population: '28K', type: 'Municipal Council' },
        { id: 6, name: 'Khultabad', coordinates: [20.0054, 75.5763], population: '24K', type: 'Municipal Council' },
        { id: 7, name: 'Kannad', coordinates: [20.2568, 75.1380], population: '32K', type: 'Municipal Council' }
    ],
    // Uttar Pradesh
    Lucknow: [
        { id: 1, name: 'Lucknow City', coordinates: [26.8467, 80.9462], population: '2.8M', type: 'Municipal Corp' },
        { id: 2, name: 'Unnao', coordinates: [26.5464, 80.4880], population: '177K', type: 'Municipal Council' },
        { id: 3, name: 'Hardoi', coordinates: [27.3956, 80.1315], population: '128K', type: 'Municipal Council' },
        { id: 4, name: 'Lakhimpur', coordinates: [27.9479, 80.7782], population: '142K', type: 'Municipal Council' },
        { id: 5, name: 'Barabanki', coordinates: [26.9251, 81.1854], population: '156K', type: 'Municipal Council' },
        { id: 6, name: 'Sitapur', coordinates: [27.5669, 80.6830], population: '174K', type: 'Municipal Council' }
    ],
    Kanpur: [
        { id: 1, name: 'Kanpur City', coordinates: [26.4499, 80.3319], population: '2.7M', type: 'Municipal Corp' },
        { id: 2, name: 'Unnao', coordinates: [26.5464, 80.4880], population: '177K', type: 'Municipal Council' },
        { id: 3, name: 'Kanpur Dehat', coordinates: [26.4657, 79.9144], population: '89K', type: 'Municipal Council' },
        { id: 4, name: 'Farrukhabad', coordinates: [27.3883, 79.5817], population: '227K', type: 'Municipal Council' },
        { id: 5, name: 'Etawah', coordinates: [26.7756, 79.0242], population: '256K', type: 'Municipal Council' }
    ],
    Varanasi: [
        { id: 1, name: 'Varanasi City', coordinates: [25.3176, 82.9739], population: '1.2M', type: 'Municipal Corp' },
        { id: 2, name: 'Chandauli', coordinates: [25.2678, 83.2711], population: '41K', type: 'Municipal Council' },
        { id: 3, name: 'Ghazipur', coordinates: [25.5882, 83.5783], population: '121K', type: 'Municipal Council' },
        { id: 4, name: 'Jaunpur', coordinates: [25.7463, 82.6838], population: '199K', type: 'Municipal Council' },
        { id: 5, name: 'Mirzapur', coordinates: [25.1460, 82.5690], population: '233K', type: 'Municipal Council' }
    ],
    Agra: [
        { id: 1, name: 'Agra City', coordinates: [27.1767, 78.0081], population: '1.6M', type: 'Municipal Corp' },
        { id: 2, name: 'Firozabad', coordinates: [27.1591, 78.3957], population: '306K', type: 'Municipal Corp' },
        { id: 3, name: 'Fatehabad', coordinates: [27.0231, 78.3031], population: '35K', type: 'Municipal Council' },
        { id: 4, name: 'Etmadpur', coordinates: [27.1558, 78.2160], population: '28K', type: 'Municipal Council' },
        { id: 5, name: 'Kiraoli', coordinates: [27.1417, 77.7871], population: '24K', type: 'Municipal Council' }
    ],
    // Karnataka
    Bangalore: [
        { id: 1, name: 'Bengaluru City', coordinates: [12.9716, 77.5946], population: '8.4M', type: 'Municipal Corp' },
        { id: 2, name: 'Anekal', coordinates: [12.7107, 77.6953], population: '30K', type: 'Municipal Council' },
        { id: 3, name: 'Devanahalli', coordinates: [13.2423, 77.7122], population: '25K', type: 'Municipal Council' },
        { id: 4, name: 'Doddaballapura', coordinates: [13.2933, 77.5375], population: '38K', type: 'Municipal Council' },
        { id: 5, name: 'Hoskote', coordinates: [13.0705, 77.7989], population: '42K', type: 'Municipal Council' },
        { id: 6, name: 'Nelamangala', coordinates: [13.0993, 77.3936], population: '35K', type: 'Municipal Council' },
        { id: 7, name: 'Ramanagara', coordinates: [12.7200, 77.2800], population: '62K', type: 'Municipal Council' }
    ],
    Mysore: [
        { id: 1, name: 'Mysuru City', coordinates: [12.2958, 76.6394], population: '920K', type: 'Municipal Corp' },
        { id: 2, name: 'Mandya', coordinates: [12.5244, 76.8951], population: '137K', type: 'Municipal Council' },
        { id: 3, name: 'Srirangapatna', coordinates: [12.4222, 76.6947], population: '25K', type: 'Municipal Council' },
        { id: 4, name: 'Nanjangud', coordinates: [12.1199, 76.6836], population: '50K', type: 'Municipal Council' },
        { id: 5, name: 'T. Narasipura', coordinates: [12.2029, 76.9026], population: '32K', type: 'Municipal Council' }
    ],
    Hubli: [
        { id: 1, name: 'Hubballi', coordinates: [15.3647, 75.1240], population: '943K', type: 'Municipal Corp' },
        { id: 2, name: 'Dharwad', coordinates: [15.4589, 75.0078], population: '492K', type: 'Municipal Corp' },
        { id: 3, name: 'Gadag', coordinates: [15.4268, 75.6306], population: '154K', type: 'Municipal Council' },
        { id: 4, name: 'Haveri', coordinates: [14.7951, 75.3996], population: '92K', type: 'Municipal Council' },
        { id: 5, name: 'Ranebennur', coordinates: [14.6244, 75.6294], population: '101K', type: 'Municipal Council' }
    ],
    // Tamil Nadu
    Chennai: [
        { id: 1, name: 'Chennai City', coordinates: [13.0827, 80.2707], population: '7.1M', type: 'Municipal Corp' },
        { id: 2, name: 'Kanchipuram', coordinates: [12.8342, 79.7036], population: '164K', type: 'Municipal Corp' },
        { id: 3, name: 'Chengalpattu', coordinates: [12.6918, 79.9763], population: '62K', type: 'Municipal Council' },
        { id: 4, name: 'Tambaram', coordinates: [12.9229, 80.1275], population: '127K', type: 'Municipal Corp' },
        { id: 5, name: 'Avadi', coordinates: [13.1147, 80.1018], population: '345K', type: 'Municipal Corp' },
        { id: 6, name: 'Tiruvallur', coordinates: [13.1443, 79.9091], population: '57K', type: 'Municipal Council' },
        { id: 7, name: 'Mahabalipuram', coordinates: [12.6208, 80.1925], population: '12K', type: 'Municipal Council' }
    ],
    Coimbatore: [
        { id: 1, name: 'Coimbatore City', coordinates: [11.0168, 76.9558], population: '1.6M', type: 'Municipal Corp' },
        { id: 2, name: 'Tiruppur', coordinates: [11.1085, 77.3411], population: '877K', type: 'Municipal Corp' },
        { id: 3, name: 'Pollachi', coordinates: [10.6580, 77.0080], population: '90K', type: 'Municipal Council' },
        { id: 4, name: 'Mettupalayam', coordinates: [11.2986, 76.9500], population: '70K', type: 'Municipal Council' },
        { id: 5, name: 'Valparai', coordinates: [10.3270, 76.9550], population: '24K', type: 'Municipal Council' }
    ],
    Madurai: [
        { id: 1, name: 'Madurai City', coordinates: [9.9252, 78.1198], population: '1.0M', type: 'Municipal Corp' },
        { id: 2, name: 'Dindigul', coordinates: [10.3624, 77.9694], population: '207K', type: 'Municipal Corp' },
        { id: 3, name: 'Theni', coordinates: [10.0104, 77.4768], population: '72K', type: 'Municipal Council' },
        { id: 4, name: 'Sivaganga', coordinates: [9.8433, 78.4809], population: '40K', type: 'Municipal Council' },
        { id: 5, name: 'Usilampatti', coordinates: [9.9643, 77.7850], population: '48K', type: 'Municipal Council' }
    ],
    // Gujarat
    Ahmedabad: [
        { id: 1, name: 'Ahmedabad City', coordinates: [23.0225, 72.5714], population: '5.6M', type: 'Municipal Corp' },
        { id: 2, name: 'Gandhinagar', coordinates: [23.2156, 72.6369], population: '208K', type: 'Municipal Corp' },
        { id: 3, name: 'Sanand', coordinates: [22.9965, 72.3776], population: '35K', type: 'Municipal Council' },
        { id: 4, name: 'Dholka', coordinates: [22.7272, 72.4404], population: '55K', type: 'Municipal Council' },
        { id: 5, name: 'Viramgam', coordinates: [23.1213, 72.0394], population: '62K', type: 'Municipal Council' }
    ],
    Surat: [
        { id: 1, name: 'Surat City', coordinates: [21.1702, 72.8311], population: '4.5M', type: 'Municipal Corp' },
        { id: 2, name: 'Navsari', coordinates: [20.9508, 72.9233], population: '171K', type: 'Municipal Corp' },
        { id: 3, name: 'Bardoli', coordinates: [21.1248, 73.1118], population: '59K', type: 'Municipal Council' },
        { id: 4, name: 'Vyara', coordinates: [21.1095, 73.3938], population: '45K', type: 'Municipal Council' },
        { id: 5, name: 'Valsad', coordinates: [20.6091, 72.9342], population: '133K', type: 'Municipal Council' }
    ],
    Vadodara: [
        { id: 1, name: 'Vadodara City', coordinates: [22.3072, 73.1812], population: '1.7M', type: 'Municipal Corp' },
        { id: 2, name: 'Anand', coordinates: [22.5645, 72.9289], population: '138K', type: 'Municipal Corp' },
        { id: 3, name: 'Bharuch', coordinates: [21.7051, 72.9959], population: '174K', type: 'Municipal Corp' },
        { id: 4, name: 'Karjan', coordinates: [22.0526, 73.1246], population: '38K', type: 'Municipal Council' },
        { id: 5, name: 'Dabhoi', coordinates: [22.1829, 73.4287], population: '43K', type: 'Municipal Council' }
    ],
    // Add similar expansions for other states...
    Jaipur: [
        { id: 1, name: 'Jaipur City', coordinates: [26.9124, 75.7873], population: '3.1M', type: 'Municipal Corp' },
        { id: 2, name: 'Amber', coordinates: [26.9855, 75.8513], population: '8K', type: 'Municipal Council' },
        { id: 3, name: 'Chomu', coordinates: [27.1535, 75.7245], population: '35K', type: 'Municipal Council' },
        { id: 4, name: 'Sanganer', coordinates: [26.8069, 75.7967], population: '102K', type: 'Municipal Council' },
        { id: 5, name: 'Chaksu', coordinates: [26.6053, 75.9440], population: '28K', type: 'Municipal Council' }
    ],
    Jodhpur: [
        { id: 1, name: 'Jodhpur City', coordinates: [26.2389, 73.0243], population: '1.0M', type: 'Municipal Corp' },
        { id: 2, name: 'Pali', coordinates: [25.7711, 73.3234], population: '187K', type: 'Municipal Corp' }
    ],
    Udaipur: [
        { id: 1, name: 'Udaipur City', coordinates: [24.5854, 73.7125], population: '451K', type: 'Municipal Corp' },
        { id: 2, name: 'Chittorgarh', coordinates: [24.8887, 74.6269], population: '117K', type: 'Municipal Council' }
    ],
    // West Bengal
    Kolkata: [
        { id: 1, name: 'Kolkata City', coordinates: [22.5726, 88.3639], population: '4.5M', type: 'Municipal Corp' },
        { id: 2, name: 'Howrah', coordinates: [22.5958, 88.2636], population: '1.1M', type: 'Municipal Corp' },
        { id: 3, name: 'Salt Lake', coordinates: [22.6094, 88.4001], population: '403K', type: 'Municipal Corp' },
        { id: 4, name: 'Barrackpore', coordinates: [22.7636, 88.3787], population: '144K', type: 'Municipal Corp' },
        { id: 5, name: 'Dum Dum', coordinates: [22.6290, 88.4255], population: '114K', type: 'Municipal Corp' },
        { id: 6, name: 'Barasat', coordinates: [22.7240, 88.4840], population: '278K', type: 'Municipal Corp' }
    ],
    Darjeeling: [
        { id: 1, name: 'Darjeeling Town', coordinates: [27.0410, 88.2663], population: '118K', type: 'Municipal Council' },
        { id: 2, name: 'Siliguri', coordinates: [26.7271, 88.3953], population: '513K', type: 'Municipal Corp' }
    ],
    // Madhya Pradesh
    Bhopal: [
        { id: 1, name: 'Bhopal City', coordinates: [23.2599, 77.4126], population: '1.8M', type: 'Municipal Corp' },
        { id: 2, name: 'Sehore', coordinates: [23.2017, 77.0871], population: '52K', type: 'Municipal Council' }
    ],
    Indore: [
        { id: 1, name: 'Indore City', coordinates: [22.7196, 75.8577], population: '2.2M', type: 'Municipal Corp' },
        { id: 2, name: 'Dewas', coordinates: [22.9676, 76.0534], population: '289K', type: 'Municipal Corp' }
    ],
    // Telangana
    Hyderabad: [
        { id: 1, name: 'Hyderabad City', coordinates: [17.3850, 78.4867], population: '6.9M', type: 'Municipal Corp' },
        { id: 2, name: 'Secunderabad', coordinates: [17.4399, 78.4983], population: '220K', type: 'Municipal Corp' },
        { id: 3, name: 'Ranga Reddy', coordinates: [17.2403, 78.2827], population: '150K', type: 'Municipal Council' },
        { id: 4, name: 'Shamshabad', coordinates: [17.2493, 78.4009], population: '12K', type: 'Municipal Council' },
        { id: 5, name: 'Uppal', coordinates: [17.4065, 78.5591], population: '142K', type: 'Municipal Council' },
        { id: 6, name: 'Kukatpally', coordinates: [17.4948, 78.4106], population: '185K', type: 'Municipal Council' }
    ],
    // Andhra Pradesh
    Visakhapatnam: [
        { id: 1, name: 'Visakhapatnam City', coordinates: [17.6868, 83.2185], population: '2.0M', type: 'Municipal Corp' },
        { id: 2, name: 'Vizianagaram', coordinates: [18.1167, 83.4000], population: '228K', type: 'Municipal Corp' }
    ],
    Guntur: [
        { id: 1, name: 'Guntur City', coordinates: [16.3067, 80.4365], population: '743K', type: 'Municipal Corp' },
        { id: 2, name: 'Vijayawada', coordinates: [16.5062, 80.6480], population: '1.0M', type: 'Municipal Corp' }
    ],
    // Kerala
    Thiruvananthapuram: [
        { id: 1, name: 'Trivandrum City', coordinates: [8.5241, 76.9366], population: '957K', type: 'Municipal Corp' },
        { id: 2, name: 'Neyyattinkara', coordinates: [8.4016, 77.0884], population: '67K', type: 'Municipal Council' }
    ],
    Ernakulam: [
        { id: 1, name: 'Kochi City', coordinates: [9.9312, 76.2673], population: '677K', type: 'Municipal Corp' },
        { id: 2, name: 'Aluva', coordinates: [10.1080, 76.3528], population: '25K', type: 'Municipal Council' }
    ],
    // Odisha
    Khordha: [
        { id: 1, name: 'Bhubaneswar', coordinates: [20.2961, 85.8245], population: '837K', type: 'Municipal Corp' },
        { id: 2, name: 'Puri', coordinates: [19.8135, 85.8312], population: '201K', type: 'Municipal Corp' }
    ],
    Cuttack: [
        { id: 1, name: 'Cuttack City', coordinates: [20.4625, 85.8830], population: '606K', type: 'Municipal Corp' }
    ],
    // Bihar
    Patna: [
        { id: 1, name: 'Patna City', coordinates: [25.5941, 85.1376], population: '1.7M', type: 'Municipal Corp' },
        { id: 2, name: 'Danapur', coordinates: [25.6358, 85.0469], population: '182K', type: 'Municipal Council' }
    ],
    Gaya: [
        { id: 1, name: 'Gaya City', coordinates: [24.7955, 85.0002], population: '474K', type: 'Municipal Corp' },
        { id: 2, name: 'Bodh Gaya', coordinates: [24.6952, 84.9914], population: '36K', type: 'Municipal Council' }
    ],
    // Jharkhand
    Ranchi: [
        { id: 1, name: 'Ranchi City', coordinates: [23.3441, 85.3096], population: '1.1M', type: 'Municipal Corp' },
        { id: 2, name: 'Ramgarh', coordinates: [23.6311, 85.5192], population: '71K', type: 'Municipal Council' }
    ],
    Dhanbad: [
        { id: 1, name: 'Dhanbad City', coordinates: [23.7957, 86.4304], population: '1.2M', type: 'Municipal Corp' },
        { id: 2, name: 'Jharia', coordinates: [23.7401, 86.4154], population: '110K', type: 'Municipal Council' }
    ],
    // Chhattisgarh
    Raipur: [
        { id: 1, name: 'Raipur City', coordinates: [21.2514, 81.6296], population: '1.0M', type: 'Municipal Corp' },
        { id: 2, name: 'Durg', coordinates: [21.1959, 81.2809], population: '268K', type: 'Municipal Corp' }
    ],
    // Uttarakhand
    Dehradun: [
        { id: 1, name: 'Dehradun City', coordinates: [30.3165, 78.0322], population: '578K', type: 'Municipal Corp' },
        { id: 2, name: 'Mussoorie', coordinates: [30.4598, 78.0644], population: '30K', type: 'Municipal Council' }
    ],
    Haridwar: [
        { id: 1, name: 'Haridwar City', coordinates: [29.9457, 78.1642], population: '228K', type: 'Municipal Corp' },
        { id: 2, name: 'Rishikesh', coordinates: [30.0869, 78.2676], population: '102K', type: 'Municipal Council' }
    ],
    // Haryana
    Faridabad: [
        { id: 1, name: 'Faridabad City', coordinates: [28.4089, 77.3178], population: '1.4M', type: 'Municipal Corp' },
        { id: 2, name: 'Ballabgarh', coordinates: [28.3406, 77.3270], population: '54K', type: 'Municipal Council' }
    ],
    Gurgaon: [
        { id: 1, name: 'Gurugram City', coordinates: [28.4595, 77.0266], population: '876K', type: 'Municipal Corp' },
        { id: 2, name: 'Sohna', coordinates: [28.2500, 77.0656], population: '24K', type: 'Municipal Council' }
    ],
    // Punjab
    Ludhiana: [
        { id: 1, name: 'Ludhiana City', coordinates: [30.9010, 75.8573], population: '1.6M', type: 'Municipal Corp' },
        { id: 2, name: 'Jagraon', coordinates: [30.7876, 75.4737], population: '51K', type: 'Municipal Council' }
    ],
    Amritsar: [
        { id: 1, name: 'Amritsar City', coordinates: [31.6340, 74.8723], population: '1.1M', type: 'Municipal Corp' },
        { id: 2, name: 'Ajnala', coordinates: [31.8446, 74.7603], population: '16K', type: 'Municipal Council' }
    ],
    // Delhi
    Delhi: [
        { id: 1, name: 'New Delhi', coordinates: [28.6139, 77.2090], population: '257K', type: 'Municipal Council' },
        { id: 2, name: 'North West Delhi', coordinates: [28.7186, 77.0662], population: '3.6M', type: 'District' },
        { id: 3, name: 'North Delhi', coordinates: [28.7041, 77.1025], population: '887K', type: 'District' },
        { id: 4, name: 'North East Delhi', coordinates: [28.7126, 77.2706], population: '2.2M', type: 'District' },
        { id: 5, name: 'East Delhi', coordinates: [28.6276, 77.2965], population: '1.7M', type: 'District' },
        { id: 6, name: 'Central Delhi', coordinates: [28.6453, 77.2456], population: '582K', type: 'District' },
        { id: 7, name: 'West Delhi', coordinates: [28.6663, 77.0681], population: '2.5M', type: 'District' },
        { id: 8, name: 'South West Delhi', coordinates: [28.5921, 77.0276], population: '2.2M', type: 'District' },
        { id: 9, name: 'South Delhi', coordinates: [28.4817, 77.1873], population: '2.7M', type: 'District' },
        { id: 10, name: 'South East Delhi', coordinates: [28.5632, 77.2796], population: '1.8M', type: 'District' },
        { id: 11, name: 'Shahdara', coordinates: [28.6980, 77.2926], population: '3.2M', type: 'District' }
    ]
};
