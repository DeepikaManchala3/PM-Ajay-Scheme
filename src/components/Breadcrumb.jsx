import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
    const location = useLocation();

    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            <div className="breadcrumb-item">
                <Link to="/">🏠 Home</Link>
            </div>
            {items && items.map((item, index) => (
                <div
                    key={index}
                    className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
                >
                    {index === items.length - 1 ? (
                        <span>{item.label}</span>
                    ) : (
                        <Link to={item.path}>{item.label}</Link>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumb;
