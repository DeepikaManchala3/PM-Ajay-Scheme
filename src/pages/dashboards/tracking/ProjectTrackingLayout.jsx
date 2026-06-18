import React, { useState, useEffect } from 'react';
import { Calendar, IndianRupee, Landmark, Building2, ChevronDown, Network, UserCheck, TrendingUp, ArrowRight, Wallet, CheckCircle2, MapPin, Search } from 'lucide-react';

// API Base URL
const API_BASE = 'http://localhost:5000/api/tracking';

// Static Data for "State/Year" Selection (Standard View)
const STATIC_DATA = {
    '2024-2025': {
        ministry: { label: 'Ministry of Social Justice', role: 'Central Nodal Agency', allocated: 25000000, sent: 20000000 },
        state: { label: 'State Government', role: 'State Implementing Agency', received: 20000000, released: 15000000 },
        ia: { label: 'Implementing Agency', role: 'District/Block Level', received: 15000000, released: 12000000 },
        ea: { label: 'Executing Agency', role: 'Contractors/Agencies', received: 12000000, utilized: 5000000 }
    },
    '2023-2024': {
        ministry: { label: 'Ministry of Social Justice', role: 'Central Nodal Agency', allocated: 15000000, sent: 15000000 },
        state: { label: 'State Government', role: 'State Implementing Agency', received: 15000000, released: 15000000 },
        ia: { label: 'Implementing Agency', role: 'District/Block Level', received: 15000000, released: 15000000 },
        ea: { label: 'Executing Agency', role: 'Contractors/Agencies', received: 15000000, utilized: 14000000 }
    },
    '2022-2023': {
        ministry: { label: 'Ministry of Social Justice', role: 'Central Nodal Agency', allocated: 10000000, sent: 10000000 },
        state: { label: 'State Government', role: 'State Implementing Agency', received: 10000000, released: 10000000 },
        ia: { label: 'Implementing Agency', role: 'District/Block Level', received: 10000000, released: 10000000 },
        ea: { label: 'Executing Agency', role: 'Contractors/Agencies', received: 10000000, utilized: 10000000 }
    }
};

const FLOW_STEPS = [
    { id: 'ministry', title: 'Ministry (Centre)', icon: Landmark, color: 'orange', gradient: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-200' },
    { id: 'state', title: 'State Government', icon: Building2, color: 'blue', gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-200' },
    { id: 'ia', title: 'Implementing Agency', icon: Network, color: 'purple', gradient: 'from-purple-500 to-fuchsia-500', shadow: 'shadow-purple-200' },
    { id: 'ea', title: 'Executing Agency', icon: UserCheck, color: 'emerald', gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-200' }
];

const StatBadge = ({ label, value, color, icon: Icon }) => (
    <div className={`relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 group-hover:border-${color}-200 transition-all shadow-sm group-hover:shadow-md`}>
        <div className={`absolute top-0 right-0 p-2 opacity-10`}>
            {Icon && <Icon className={`w-8 h-8 text-${color}-600`} />}
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 block">{label}</span>
        <div className={`flex items-center gap-1.5 font-black text-${color}-600 text-lg`}>
            <IndianRupee className="w-4 h-4 ml-[-2px]" />
            <span>{(value / 10000000).toFixed(2)} Cr</span>
        </div>
    </div>
);

const ProjectTrackingLayout = () => {
    const [selectedYear, setSelectedYear] = useState('2024-2025');
    const [selectedLevel, setSelectedLevel] = useState('ministry');

    // Filter States
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [projectsList, setProjectsList] = useState([]);

    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedVillage, setSelectedVillage] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [currentData, setCurrentData] = useState(STATIC_DATA['2024-2025']);

    // Initial Fetch: States
    useEffect(() => {
        fetch(`${API_BASE}/states`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setStates(data.data);
            })
            .catch(err => console.error(err));
    }, []);

    // Fetch Districts
    useEffect(() => {
        if (!selectedState) return;
        fetch(`${API_BASE}/districts?state=${selectedState}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setDistricts(data.data);
            });
    }, [selectedState]);

    // Fetch Villages
    useEffect(() => {
        if (!selectedDistrict) return;
        fetch(`${API_BASE}/villages?district=${selectedDistrict}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setVillages(data.data);
            });
    }, [selectedDistrict]);

    // Fetch Projects
    useEffect(() => {
        if (!selectedDistrict) return;
        fetch(`${API_BASE}/projects?state=${selectedState}&district=${selectedDistrict}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setProjectsList(data.data);
            });
    }, [selectedDistrict, selectedState]);

    // Handle Data Logic: Static vs Project Dynamic
    useEffect(() => {
        if (selectedProject) {
            // DYNAMIC MODE: Simulate specific project data
            const base = STATIC_DATA[selectedYear];
            setCurrentData({
                ministry: { ...base.ministry, allocated: 5000000, sent: 5000000 },
                state: { ...base.state, received: 5000000, released: 4000000 },
                ia: { ...base.ia, received: 4000000, released: 4000000 },
                ea: { ...base.ea, received: 4000000, utilized: 3500000 }
            });
        } else {
            // STATIC MODE: Default State/Year data
            setCurrentData(STATIC_DATA[selectedYear]);
        }
    }, [selectedProject, selectedYear]);

    return (
        <div className="flex flex-col items-center h-[calc(100vh-80px)] bg-gray-50/50 font-sans p-6 overflow-hidden relative">

            <style jsx>{`
                .hide-scroll::-webkit-scrollbar { display: none; }
                .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                .animate-blob { animation: blob 7s infinite; }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
            `}</style>

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            {/* HORIZONTAL FILTER BAR: Side-by-Side */}
            <div className="w-full max-w-7xl mb-6 z-20">
                <div className="bg-white/80 backdrop-blur-lg border border-white/60 rounded-2xl shadow-lg p-3 flex flex-wrap items-center gap-4 justify-between">

                    <div className="flex items-center gap-2 pl-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600">
                            <Search className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-700 hidden lg:block">Filters</span>
                    </div>

                    {/* Filter Group: Horizontal Flex */}
                    <div className="flex flex-1 items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {/* State */}
                        <div className="relative min-w-[160px]">
                            <select
                                value={selectedState}
                                onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedVillage(''); }}
                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select State</option>
                                {states.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* District */}
                        <div className="relative min-w-[160px]">
                            <select
                                value={selectedDistrict}
                                onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedVillage(''); }}
                                disabled={!selectedState}
                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="">Select District</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Village */}
                        <div className="relative min-w-[160px]">
                            <select
                                value={selectedVillage}
                                onChange={(e) => setSelectedVillage(e.target.value)}
                                disabled={!selectedDistrict}
                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="">Select Village</option>
                                {villages.map(v => <option key={v.village_code} value={v.village_code}>{v.village_name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Project */}
                        <div className="relative min-w-[200px] flex-1">
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                disabled={!selectedDistrict}
                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="">Select Project</option>
                                {projectsList.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Year */}
                        <div className="relative min-w-[140px]">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full pl-10 pr-8 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded-xl shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                            >
                                {Object.keys(STATIC_DATA).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-indigo-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Centered Card */}
            <div className="w-full max-w-5xl bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl shadow-gray-200/50 flex flex-col h-full max-h-[750px] overflow-hidden relative z-10 transition-all duration-300">

                {/* Header */}
                <div className="px-10 py-6 bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-100 z-20">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                                Fund Flow Hierarchy
                            </h2>
                            <p className="text-xs text-gray-500 font-medium pl-8">
                                {selectedProject
                                    ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Project Specific View</span>
                                    : 'Select a project to see real-time flow.'}
                            </p>
                        </div>

                        {/* Static/Dynamic Badge */}
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${selectedProject ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {selectedProject ? 'Dynamic Data' : 'Static View'}
                        </div>
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto px-12 py-8 relative hide-scroll">

                    {/* Connecting Line */}
                    <div className="absolute left-[70px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-orange-200 via-blue-200 to-emerald-200 opacity-60 rounded-full"></div>

                    <div className="space-y-6 relative">
                        {FLOW_STEPS.map((step, index) => {
                            const isActive = selectedLevel === step.id;
                            const Icon = step.icon;
                            // Uses currentData which switches between STATIC and DYNAMIC based on selection
                            const levelData = currentData[step.id];

                            return (
                                <div
                                    key={step.id}
                                    onClick={() => setSelectedLevel(step.id)}
                                    className={`group cursor-pointer relative pl-24 transition-all duration-300`}
                                >
                                    {/* Timeline Icon Node */}
                                    <div className={`absolute left-0 top-1 w-[44px] h-[44px] rounded-full flex items-center justify-center border-[3px] transition-all duration-300 z-10
                                        ${isActive
                                            ? `bg-gradient-to-br ${step.gradient} border-white shadow-xl ${step.shadow} scale-125`
                                            : 'bg-white border-gray-100 group-hover:border-gray-300'}`}>
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    </div>

                                    {isActive && <div className={`absolute left-[-4px] top-[-3px] w-[52px] h-[52px] rounded-full border-2 border-${step.color}-100 animate-ping opacity-75`}></div>}

                                    {/* Card Container */}
                                    <div className={`relative rounded-3xl transition-all duration-500 ease-out overflow-hidden
                                        ${isActive
                                            ? 'bg-white shadow-2xl ring-1 ring-black/5 p-6'
                                            : 'bg-transparent py-2 hover:bg-white/60 hover:pl-4 rounded-xl'}`}>

                                        <div className="flex justify-between items-center mb-1">
                                            <div>
                                                <h3 className={`text-lg font-bold transition-all ${isActive ? 'text-gray-800' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                                    {step.title}
                                                </h3>
                                                <p className={`text-[10px] font-semibold uppercase tracking-wider transition-all ${isActive ? `text-${step.color}-600` : 'text-gray-400'}`}>
                                                    {levelData.role}
                                                </p>
                                            </div>

                                            <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? `bg-${step.color}-50 text-${step.color}-600 rotate-90` : 'text-gray-300 opacity-0 group-hover:opacity-100'}`}>
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {/* Expanded Stats Area */}
                                        <div className={`grid grid-cols-2 gap-3 mt-4 overflow-hidden transition-all duration-500 ${isActive ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 mt-0'}`}>
                                            {step.id === 'ministry' && (
                                                <>
                                                    <StatBadge label="Total Allocated" value={levelData.allocated} color={step.color} icon={Wallet} />
                                                    <StatBadge label="Released to State" value={levelData.sent} color={step.color} icon={ArrowRight} />
                                                </>
                                            )}
                                            {step.id === 'state' && (
                                                <>
                                                    <StatBadge label="Received Funds" value={levelData.received} color={step.color} icon={Wallet} />
                                                    <StatBadge label="Disbursed to IA" value={levelData.released} color={step.color} icon={ArrowRight} />
                                                </>
                                            )}
                                            {step.id === 'ia' && (
                                                <>
                                                    <StatBadge label="Received Funds" value={levelData.received} color={step.color} icon={Wallet} />
                                                    <StatBadge label="Disbursed to EA" value={levelData.released} color={step.color} icon={ArrowRight} />
                                                </>
                                            )}
                                            {step.id === 'ea' && (
                                                <>
                                                    <StatBadge label="Received Funds" value={levelData.received} color={step.color} icon={Wallet} />
                                                    <StatBadge label="Utilized Funds" value={levelData.utilized} color={step.color} icon={CheckCircle2} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectTrackingLayout;
