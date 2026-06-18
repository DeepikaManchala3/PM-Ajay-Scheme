import React from 'react';
import './PortalFeatures.css';

const features = [
    {
        title: "GIS Mapping",
        desc: "Interactive maps with project locations, progress tracking, and geo-tagged updates.",
        icon: "🗺️",
        color: "#121212"
    },
    {
        title: "Role-Based Access",
        desc: "Custom dashboards for Ministry, State, District, and other stakeholders.",
        icon: "👥",
        color: "#121212"
    },
    {
        title: "Fund Management",
        desc: "Tracks fund flow from Ministry down to execution level.",
        icon: "💸",
        color: "#121212"
    },
    {
        title: "Workflow Automation",
        desc: "Automated approval workflows for proposals, DPRs, and payments.",
        icon: "📋",
        color: "#121212"
    },
    {
        title: "Real-Time Reports",
        desc: "MIS reports, analytics, and export options.",
        icon: "📊",
        color: "#121212"
    },
    {
        title: "Notifications",
        desc: "Automatic alerts for approvals, deadlines, and fund releases in whatsapp .",
        icon: "🔔",
        color: "#121212"
    }
];

const PortalFeatures = () => {
    return (
        <div className="portal-features-card">
            <h2 className="portal-features-heading">Portal Features</h2>
            <div className="portal-features-timeline">
                {features.map((feature, index) => (
                    <div className="feature-item" key={index}>
                        {/* Feature Heading at the start */}
                        <div className="feature-heading-wrapper">
                            <h3 className="feature-title" style={{ color: feature.color }}>
                                <span className="feature-icon">{feature.icon}</span>
                                {feature.title}
                            </h3>
                        </div>

                        {/* Content Card with Description only */}
                        <div className="feature-content-card">
                            <p className="feature-desc">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PortalFeatures;
