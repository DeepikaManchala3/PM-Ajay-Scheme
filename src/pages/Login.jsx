import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabaseConfig';

const Login = () => {
    // Environment variables for Supabase
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('ministry'); // This is just for UI, actual role comes from DB
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [buttonActive, setButtonActive] = useState(false);
    const navigate = useNavigate();

    // Check connection on mount
    React.useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
                    method: 'GET',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY
                    }
                });
                if (response.ok || response.status === 200 || response.status === 404) {
                    setConnectionStatus('connected');
                } else {
                    setConnectionStatus('error');
                }
            } catch (err) {
                setConnectionStatus('error');
            }
        };
        checkConnection();
    }, []);

    const roles = [
        { id: 'ministry', label: 'Ministry Admin (Centre)' },
        { id: 'state', label: 'State Admin' },
        { id: 'district', label: 'District Admin' },
        { id: 'gram_panchayat', label: 'Gram Panchayat' },
        { id: 'implementing_agency', label: 'Implementing Agency' },
        { id: 'executing_agency', label: 'Executing Agency' }
    ];

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('=== LOGIN ATTEMPT ===');
            console.log('Email:', email);

            // HARDCODED BYPASS FOR GRAM PANCHAYAT DEMO
            if (email === 'gram@pmajay.gov.in' && password === 'Test123!') {
                console.log('✅ Hardcoded GP Login detected');

                const mockUser = {
                    id: 'gp-demo-id',
                    email: 'gram@pmajay.gov.in',
                    role: 'gp_admin',
                    app_metadata: { provider: 'email' },
                    user_metadata: {},
                    aud: 'authenticated',
                    created_at: new Date().toISOString()
                };

                const mockSession = {
                    access_token: 'mock-gp-token',
                    refresh_token: 'mock-gp-refresh',
                    user: mockUser
                };

                localStorage.removeItem('supabase.auth.token');
                localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));

                console.log('✅ Navigating to dashboard...');
                window.location.href = '/dashboard';
                return;
            }

            // Step 1: Authenticate
            const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error_description || 'Invalid credentials');
            }

            console.log('✅ Login successful! Fetching profile...');

            // Step 2: Fetch user profile to get role
            let userRole = null;

            try {
                const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${data.user.id}&select=*`, {
                    method: 'GET',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${data.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (profileResponse.ok) {
                    const profiles = await profileResponse.json();
                    console.log('Profile data:', profiles);
                    if (profiles && profiles.length > 0) {
                        userRole = profiles[0].role;
                    } else {
                        console.warn('No profile found for this user');
                    }
                } else {
                    console.warn('Profile fetch failed:', profileResponse.status);
                }
            } catch (profileError) {
                console.warn('Profile fetch error:', profileError);
            }

            // Check if user is implementing agency by email pattern
            // Pattern: {state-code}-{district-code}.district@pmajay.gov.in
            if (email.includes('.district@pmajay.gov.in')) {
                console.log('✅ Detected implementing agency by email pattern');
                userRole = 'implementing_agency';
            }

            if (!userRole) {
                throw new Error('Could not retrieve user role. Please contact support.');
            }

            console.log('✅ User role:', userRole);

            // Step 3: Clear old session and store new session with role
            localStorage.removeItem('supabase.auth.token');
            localStorage.setItem('supabase.auth.token', JSON.stringify({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                user: {
                    ...data.user,
                    role: userRole
                }
            }));

            console.log('✅ Navigating to dashboard...');
            // Force a reload to ensure AuthContext picks up the new localStorage session
            window.location.href = '/dashboard';

        } catch (err) {
            console.error('❌ LOGIN ERROR:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <>
            <div className="login-page" onClick={() => setButtonActive(false)}>
                <div className="login-card">
                    <div className="login-header">
                        <img
                            src="/logos/emblem.png"
                            alt="PM-AJAY"
                            className="login-logo"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZWRlZGVkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzU1NSI+UE0tQUpBWTwvdGV4dD48L3N2Zz4=';
                            }}
                        />
                        <h1 className="login-title">PM-AJAY Portal</h1>
                        <p className="login-subtitle">Ministry of Social Justice & Empowerment</p>
                    </div>

                    {error && <div className="alert alert-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    {connectionStatus === 'checking' && (
                        <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center' }}>
                            📡 Checking connection...
                        </div>
                    )}
                    {connectionStatus === 'error' && (
                        <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center', color: 'red' }}>
                            ❌ Server Unreachable
                        </div>
                    )}
                    {connectionStatus === 'connected' && (
                        <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center', color: 'green' }}>
                            ✅ Server Connected
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Select User Role</label>
                            <select
                                className="form-control"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{ backgroundImage: 'none' }}
                            >
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                defaultValue="PMajay@2024#Demo"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary login-button"
                            style={{
                                width: '100%',
                                marginTop: 'var(--space-4)',
                                borderRadius: '50px',
                                transition: 'all 0.3s ease',
                                boxShadow: buttonActive ? '0 0 0 3px white, 0 0 0 5px rgba(174, 91, 9, 1)' : 'none'
                            }}
                            disabled={loading}
                            onClick={(e) => {
                                e.stopPropagation();
                                setButtonActive(true);
                            }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            <a href="#" style={{ color: 'var(--color-primary)' }}>Forgot Password?</a>
                        </p>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                            Don't have an account? <a href="#" style={{ color: 'var(--color-primary)' }}>Contact Admin</a>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Login;
