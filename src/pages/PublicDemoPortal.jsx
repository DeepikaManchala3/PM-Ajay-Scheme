import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    Building2,
    ChevronRight,
    MapPin,
    Search,
    Users,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext, ROLES } from '../contexts/AuthContext';
import MinistryDashboard from './dashboards/MinistryDashboard';
import StateDashboard from './dashboards/StateDashboard';
import DepartmentDashboard from './dashboards/DepartmentDashboard';
import ContractorDashboard from './dashboards/ContractorDashboard';

const normalizeRows = (rows, type) => {
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => ({
        ...row,
        name: type === 'state' ? row.name : (row.agency_name || row.name),
    })).filter((row) => row.name);
};

const readPublicDirectory = async (table, type, select, orderColumn) => {
    try {
        const { data, error } = await supabase.from(table).select(select).order(orderColumn, { ascending: true }).limit(100);
        if (error) throw error;
        return normalizeRows(data, type);
    } catch (error) {
        console.error(`Public demo could not load ${table}.`, error);
        return [];
    }
};

const iconFor = (type) => {
    if (type === 'state') return <MapPin size={22} strokeWidth={1.8} />;
    if (type === 'ia') return <Building2 size={22} strokeWidth={1.8} />;
    return <Users size={22} strokeWidth={1.8} />;
};

const SearchBar = ({ value, onChange, placeholder }) => (
    <label style={{ position: 'relative', display: 'block', maxWidth: '440px' }}>
        <Search size={18} aria-hidden="true" style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-tertiary)' }} />
        <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            style={{ width: '100%', padding: '11px 14px 11px 42px', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', background: 'var(--color-white)', color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}
        />
    </label>
);

const DirectoryCard = ({ name, category, entityId, description }) => (
    <Link
        to={`/public-demo/${category}/${encodeURIComponent(entityId)}`}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: '156px', padding: 'var(--space-5)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', background: 'var(--color-white)', boxShadow: 'var(--shadow-sm)', color: 'var(--text-primary)' }}
    >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: category === 'state' ? 'var(--color-accent)' : 'var(--color-secondary)' }}>
            {iconFor(category)}
            <ChevronRight size={18} aria-hidden="true" />
        </span>
        <span>
            <strong style={{ display: 'block', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>{name}</strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{description}</span>
        </span>
    </Link>
);

const Section = ({ title, eyebrow, children, search }) => (
    <section style={{ marginTop: 'var(--space-12)' }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 'var(--space-5)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
            <div>
                <p style={{ marginBottom: 'var(--space-1)', color: 'var(--color-secondary)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{eyebrow}</p>
                <h2 style={{ marginBottom: 0, fontSize: 'var(--text-2xl)' }}>{title}</h2>
            </div>
            {search}
        </div>
        {children}
    </section>
);

const PublicDemoPortal = () => {
    const [states, setStates] = useState([]);
    const [implementingAgencies, setImplementingAgencies] = useState([]);
    const [executingAgencies, setExecutingAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stateQuery, setStateQuery] = useState('');
    const [agencyQuery, setAgencyQuery] = useState('');

    useEffect(() => {
        let active = true;
        Promise.all([
            readPublicDirectory('states', 'state', 'id, name, code', 'name'),
            readPublicDirectory('implementing_agencies', 'ia', 'id, agency_name, agency_type, state_name, state_id', 'agency_name'),
            readPublicDirectory('executing_agencies', 'ea', 'id, agency_name, name, agency_type, state_name, implementing_agency_id', 'agency_name'),
        ]).then(([nextStates, nextImplementingAgencies, nextExecutingAgencies]) => {
            if (!active) return;
            setStates(nextStates);
            setImplementingAgencies(nextImplementingAgencies);
            setExecutingAgencies(nextExecutingAgencies);
            setLoading(false);
        });
        return () => { active = false; };
    }, []);

    const filteredStates = useMemo(() => states.filter((state) => state.name.toLowerCase().includes(stateQuery.toLowerCase())), [states, stateQuery]);
    const filteredImplementingAgencies = useMemo(() => implementingAgencies.filter((agency) => agency.name.toLowerCase().includes(agencyQuery.toLowerCase())), [implementingAgencies, agencyQuery]);
    const filteredExecutingAgencies = useMemo(() => executingAgencies.filter((agency) => agency.name.toLowerCase().includes(agencyQuery.toLowerCase())), [executingAgencies, agencyQuery]);

    const renderDirectory = (records, category, description) => {
        if (loading) return <p>Loading live records...</p>;
        if (records.length === 0) return <p>No public records are available.</p>;
        return records.map((record) => <DirectoryCard key={record.id} name={record.name} category={category} entityId={record.id} description={description} />);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <main className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-16)' }}>
                <Section title="Central Ministry Dashboard" eyebrow="Start here">
                    <DirectoryCard name="Ministry Dashboard" category="central" entityId="ministry" description="Live overview from Supabase programme records." />
                </Section>

                <Section title="State dashboards" eyebrow={`${filteredStates.length} available`} search={<SearchBar value={stateQuery} onChange={setStateQuery} placeholder="Search states" />}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 'var(--space-4)' }}>
                        {renderDirectory(filteredStates, 'state', 'Live state-level programme overview')}
                    </div>
                </Section>

                <Section title="Implementation agencies" eyebrow={`${filteredImplementingAgencies.length} available`} search={<SearchBar value={agencyQuery} onChange={setAgencyQuery} placeholder="Search agencies" />}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                        {renderDirectory(filteredImplementingAgencies, 'ia', 'Live implementation agency record')}
                    </div>
                </Section>

                <Section title="Executing agencies" eyebrow={`${filteredExecutingAgencies.length} available`}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                        {renderDirectory(filteredExecutingAgencies, 'ea', 'Live executing agency record')}
                    </div>
                </Section>
            </main>
        </div>
    );
};

export const PublicDemoDetail = () => {
    const { category, entityId } = useParams();
    const [entity, setEntity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                if (category === 'central') {
                    if (active) setEntity({ name: 'Ministry Dashboard' });
                } else if (category === 'state') {
                    const { data: state, error: stateError } = await supabase.from('states').select('id, name, code').eq('id', entityId).single();
                    if (stateError) throw stateError;
                    if (active) setEntity(state);
                } else if (category === 'ia' || category === 'ea') {
                    const table = category === 'ia' ? 'implementing_agencies' : 'executing_agencies';
                    const { data: agency, error: agencyError } = await supabase.from(table).select('*').eq('id', entityId).single();
                    if (agencyError) throw agencyError;
                    if (active) setEntity({ ...agency, name: agency.agency_name || agency.name });
                } else {
                    throw new Error('This public dashboard type is not available.');
                }

            } catch (loadError) {
                if (active) setError(loadError.message || 'Unable to load public dashboard data.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDashboard();
        return () => { active = false; };
    }, [category, entityId]);

    if (loading) {
        return <div className="container" style={{ padding: 'var(--space-12)' }}>Loading dashboard...</div>;
    }

    if (error || !entity) {
        return (
            <div className="container" style={{ padding: 'var(--space-12)' }}>
                <Link to="/public-demo" style={{ color: 'var(--color-accent)' }}>Back to Demo Portal</Link>
                <p style={{ color: 'var(--color-error)', marginTop: 'var(--space-6)' }}>{error || 'Dashboard record was not found.'}</p>
            </div>
        );
    }

    const demoUser = {
        id: category === 'ia' ? (entity.user_id || entity.id) : `public-demo-${category}`,
        email: entity.email || `public-${category}@pmajay.gov.in`,
        full_name: entity.name,
        role: category === 'central' ? ROLES.MINISTRY : category === 'state' ? ROLES.STATE : category === 'ia' ? ROLES.IMPLEMENTING_AGENCY : ROLES.EXECUTING_AGENCY,
        demoStateName: category === 'state' ? entity.name : undefined,
    };

    const authValue = {
        user: demoUser,
        loading: false,
        isAuthenticated: true,
        login: async () => { throw new Error('Login is unavailable in public dashboard mode.'); },
        logout: () => {},
        hasRole: (role) => demoUser.role === role,
        hasAnyRole: (roles) => roles.includes(demoUser.role),
    };

    const Dashboard = category === 'central'
        ? MinistryDashboard
        : category === 'state'
            ? StateDashboard
            : category === 'ia'
                ? DepartmentDashboard
                : ContractorDashboard;

    return (
        <AuthContext.Provider value={authValue}>
            <Dashboard />
        </AuthContext.Provider>
    );
};

export default PublicDemoPortal;