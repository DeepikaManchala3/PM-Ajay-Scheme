import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleName = (role) => {
        const roleNames = {
            [ROLES.MINISTRY]: 'Ministry Admin',
            [ROLES.STATE]: 'State Admin',
            [ROLES.DISTRICT]: 'District Admin',
            [ROLES.GP]: 'GP Officer',
            [ROLES.DEPARTMENT]: 'Department Officer',
            [ROLES.CONTRACTOR]: 'Contractor',
            [ROLES.PUBLIC]: 'Public User'
        };
        return roleNames[role] || 'User';
    };

    const getNavLinks = () => {
        if (!isAuthenticated) {
            return [
                { path: '/', label: 'Home' },

                { path: '/contact-us', label: 'Contact Us' },
                { path: '/register-agency', label: 'Register Agency' },

                { path: '/register-agency', label: 'Register as Agency' },
                { path: '/contact-us', label: 'Contact Us' }
            ];
        }

        const commonLinks = [
            { path: '/dashboard', label: 'Dashboard' }
        ];

        const roleSpecificLinks = {
            [ROLES.MINISTRY]: [
                // Reports and Fund Allocation removed - accessible via sidebar
            ],
            [ROLES.STATE]: [
                // Districts and Fund Release removed - accessible via sidebar
            ],
            [ROLES.DISTRICT]: [
                // Proposals and Works Management removed - accessible via sidebar
            ],
            [ROLES.GP]: [
                { path: '/my-projects', label: 'My Projects' },
                { path: '/new-proposal', label: 'New Proposal' }
            ],
            [ROLES.DEPARTMENT]: [
                // Work Orders and DPR Upload removed - accessible via sidebar
            ],
            [ROLES.CONTRACTOR]: [
                { path: '/assigned-works', label: 'Assigned Works' },
                { path: '/progress-update', label: 'Progress Update' }
            ]
        };

        return [...commonLinks, ...(roleSpecificLinks[user?.role] || [])];
    };

    // Hide green navigation bar for district users on dashboard page
    const shouldHideNavBar = location.pathname === '/dashboard' && user?.role === ROLES.DISTRICT;

    return (
        <>
            <div className="header-branding">
                {/* Top Bar */}
                <div className="header-top">
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <img src="/logos/emblem.png" alt="Government of India" className="logo-emblem" style={{ height: '40px' }} />
                                <span>भारत सरकार | Government of India</span>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
                                <a href="#" style={{ color: 'var(--text-inverse)' }}>हिंदी</a>
                                <a href="#" style={{ color: 'var(--text-inverse)' }}>Accessibility</a>
                                <a href="#" style={{ color: 'var(--text-inverse)' }}>Sitemap</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="header-main">
                    <div className="container">
                        <div className="header-content">
                            <div className="header-logos">

                                <img src="/logos/adarsh-gram.png" alt="Ministry of Social Justice & Empowerment" className="logo-emblem" />
                            </div>

                            <div className="header-title">
                                <h4>Pradhan Mantri Anusuchit Jaati Abhyuday Yojna<br />(PM-AJAY)</h4>
                                <p>Department of Social Justice & Empowerment,
                                    Ministry of Social Justice & Empowerment,
                                    Government of India</p>
                            </div>

                            <div className="header-logos">
                                <img src="logos/logo-amrit.png" alt="PM-AJAY" className="logo-emblem" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Navigation - Hide for district users on dashboard */}
            {!shouldHideNavBar && (
                <div className="header-nav sticky-header-nav">
                    <div className="container-fluid">
                        {/* Hamburger Menu Button */}
                        <button
                            className="hamburger-menu"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle navigation menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
                            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
                            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
                        </button>

                        <nav className={`nav-container ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                            <ul className="nav-menu">
                                {getNavLinks().map((link, index) => (
                                    <li key={link.path} className="nav-item">
                                        <Link
                                            to={link.path}
                                            className="nav-link"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}

                                {isAuthenticated ? (
                                    <li className="nav-item nav-user-info">
                                        <span className="nav-link" style={{ cursor: 'default' }}>
                                            {user?.name} ({getRoleName(user?.role)})
                                        </span>
                                    </li>
                                ) : (
                                    <li className="nav-item nav-login">
                                        <Link
                                            to="/login"
                                            className="nav-link"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
