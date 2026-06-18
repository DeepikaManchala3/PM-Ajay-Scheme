import React from 'react';
import { NavLink } from 'react-router-dom';

const DashboardSidebar = ({ menuItems, user, isOpen = true }) => {
    // Fallback for user data if not provided
    const userData = user || {
        full_name: 'Admin',
        email: ''
    };

    return (
        <aside className={`dashboard-sidebar ${!isOpen ? 'closed' : ''}`}>
            <div className="dashboard-sidebar-profile">
                <div className="profile-avatar-container">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name)}&background=0D8ABC&color=fff`}
                        alt="Profile"
                        className="profile-avatar"
                    />
                </div>
                <div className="profile-info">
                    <h4 className="profile-name">{userData.full_name}</h4>
                    <p className="profile-email" title={userData.email}>{userData.email}</p>
                </div>
            </div>

            <nav className="dashboard-nav-container">
                <ul className="dashboard-sidebar-nav">
                    {menuItems.map((item, index) => (
                        <li key={index} className="dashboard-sidebar-item">
                            {
                                item.action ? (
                                    <button
                                        onClick={item.action}
                                        className={`dashboard-sidebar-link ${item.active ? 'active' : ''} ${item.isLogout ? 'logout-item' : ''}`}
                                    >
                                        <span className="sidebar-icon">{item.icon}</span>
                                        <span className="sidebar-label">{item.label}</span>
                                    </button>
                                ) : (
                                    <NavLink
                                        to={item.path || '#'}
                                        className={({ isActive }) =>
                                            `dashboard-sidebar-link ${isActive && item.path !== '#' ? 'active' : ''}`
                                        }
                                    >
                                        <span className="sidebar-icon">{item.icon}</span>
                                        <span className="sidebar-label">{item.label}</span>
                                    </NavLink>
                                )
                            }
                        </li >
                    ))}
                </ul >
            </nav >
        </aside >
    );
};

export default DashboardSidebar;
