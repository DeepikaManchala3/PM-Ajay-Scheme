import React, { useRef, useEffect } from 'react';

/**
 * Interactive button component with hover and active ring states
 * Used across all Ministry Dashboard pages
 * 
 * @param {string} variant - Button color variant: 'primary', 'saffron', 'success', 'danger', 'info', 'warning', 'secondary'
 * @param {function} onClick - Click handler
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 * @param {boolean} disabled - Disabled state
 * @param {string} size - 'sm', 'md', 'lg'
 */
const InteractiveButton = ({
    variant = 'primary',
    onClick,
    children,
    className = '',
    style = {},
    disabled = false,
    size = 'md',
    ...props
}) => {
    const buttonRef = useRef(null);

    // Color configurations for each variant
    const variants = {
        primary: {
            normal: '#FF9900',
            hover: '#e68a00',
            ring: 'rgba(255, 153, 0, 0.3)'
        },
        saffron: {
            normal: '#FF9900',
            hover: '#d97706',
            ring: 'rgba(255, 153, 0, 0.3)'
        },
        success: {
            normal: '#14cf78ff',
            hover: 'rgba(8, 136, 57, 1)',
            ring: 'rgba(16, 185, 129, 0.3)'
        },
        danger: {
            normal: '#EF4444',
            hover: '#DC2626',
            ring: 'rgba(239, 68, 68, 0.3)'
        },
        info: {
            normal: '#3B82F6',
            hover: '#2563EB',
            ring: 'rgba(59, 130, 246, 0.3)'
        },
        warning: {
            normal: '#F59E0B',
            hover: '#D97706',
            ring: 'rgba(245, 158, 11, 0.3)'
        },
        secondary: {
            normal: '#202076ff',
            hover: '#02025eff',
            ring: '#9191f2ff'
        },
        outline: {
            normal: '#FFFFFF',
            hover: '#FFF5E6',
            ring: 'rgba(255, 153, 0, 0.3)',
            border: '#FF9900',
            textColor: '#FF9900'
        },
        inactive: {
            bg: '#6B7280',
            hover: '#4B5563',
            active: '#374151',
            ring: 'rgba(107, 114, 128, 0.3)',
            border: '#6B7280',
            textColor: '#FFFFFF'
        }
    };

    // Size configurations
    const sizes = {
        sm: {
            padding: '0.375rem 0.75rem',
            fontSize: '0.875rem'
        },
        md: {
            padding: '0.5rem 1.5rem',
            fontSize: '1rem'
        },
        lg: {
            padding: '0.75rem 2rem',
            fontSize: '1.125rem'
        }
    };

    const colorConfig = variants[variant] || variants.primary;
    const sizeConfig = sizes[size] || sizes.md;

    const baseStyle = {
        backgroundColor: colorConfig.normal,
        color: colorConfig.textColor || 'white',
        border: `2px solid ${colorConfig.border || colorConfig.normal}`,
        borderRadius: '0.375rem',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        ...sizeConfig,
        ...style
    };

    // Handle clicks outside the button to remove active state
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target)) {
                buttonRef.current.style.boxShadow = 'none';
                buttonRef.current.style.transform = 'scale(1)';
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMouseEnter = (e) => {
        if (!disabled) {
            e.currentTarget.style.backgroundColor = colorConfig.hover;
            e.currentTarget.style.borderColor = colorConfig.border || colorConfig.hover;
            e.currentTarget.style.color = colorConfig.textColor || 'white';
        }
    };

    const handleMouseLeave = (e) => {
        if (!disabled) {
            e.currentTarget.style.backgroundColor = colorConfig.normal;
            e.currentTarget.style.borderColor = colorConfig.border || colorConfig.normal;
            e.currentTarget.style.color = colorConfig.textColor || 'white';
        }
    };

    const handleFocus = (e) => {
        if (!disabled) {
            e.currentTarget.style.boxShadow = `0 0 0 6px ${colorConfig.ring}`;
            e.currentTarget.style.outline = 'none';
        }
    };

    const handleBlur = (e) => {
        if (!disabled) {
            e.currentTarget.style.boxShadow = 'none';
        }
    };

    const handleMouseDown = (e) => {
        if (!disabled) {
            e.currentTarget.style.boxShadow = `0 0 0 6px ${colorConfig.ring}`;
            e.currentTarget.style.transform = 'scale(0.98)';
        }
    };

    const handleMouseUp = (e) => {
        if (!disabled && !e.currentTarget.matches(':focus')) {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'scale(1)';
        }
    };

    return (
        <button
            ref={buttonRef}
            className={`interactive-btn ${className}`}
            onClick={disabled ? undefined : onClick}
            style={baseStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default InteractiveButton;
