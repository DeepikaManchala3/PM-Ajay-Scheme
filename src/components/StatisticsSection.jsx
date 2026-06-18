import React from 'react';
import { Link } from 'react-router-dom';
import {
    Home,
    Users,
    Construction,
    FileText,
    MapPin,
    ArrowRight
} from 'lucide-react';
import './StatisticsSection.css';

const Counter = ({ target }) => {
    const [count, setCount] = React.useState(0);
    const [hasAnimated, setHasAnimated] = React.useState(false);
    const elementRef = React.useRef(null);

    const parseNumber = (str) => {
        if (typeof str !== 'string') return 0;
        return parseFloat(str.replace(/,/g, ''));
    };

    const targetNumber = parseNumber(target);
    const isFloat = target.includes('.');
    const decimals = isFloat ? target.split('.')[1].length : 0;

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let start = 0;
                    const duration = 2000;
                    const startTime = performance.now();

                    const animate = (currentTime) => {
                        const elapsedTime = currentTime - startTime;
                        const progress = Math.min(elapsedTime / duration, 1);
                        const easeProgress = 1 - Math.pow(1 - progress, 4);

                        const currentCount = start + (targetNumber - start) * easeProgress;
                        setCount(currentCount);

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            setCount(targetNumber);
                        }
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [targetNumber, hasAnimated]);

    const formatNumber = (num) => {
        if (isNaN(num)) return target;
        return num.toLocaleString('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    if (isNaN(targetNumber)) return target;

    return (
        <span ref={elementRef}>
            {formatNumber(count)}
        </span>
    );
};

const StatisticsSection = () => {
    const statsData = [
        {
            id: 1,
            number: "47,438",
            label: "No. of Villages",
            icon: <img src="/logos/agy1.png" alt="Villages" className="stat-icon-img" />,
        },
        {
            id: 2,
            number: "46,01,531",
            label: "No. of Beneficiaries Covered",
            icon: <img src="/logos/agy2.png" alt="Beneficiaries" className="stat-icon-img" />,
        },
        {
            id: 3,
            number: "41,958",
            label: "No. of Works Completed",
            icon: <img src="/logos/agy3.png" alt="Works" className="stat-icon-img" />,
        },
        {
            id: 4,
            number: "20,021",
            label: "No. of VDP Generated",
            icon: <img src="/logos/agy4.png" alt="VDP" className="stat-icon-img" />,
        },
        {
            id: 5,
            number: "12,969",
            label: "Adarsh Gram Declared",
            icon: <img src="/logos/agy5.png" alt="Adarsh Gram" className="stat-icon-img" />,
        }
    ];

    return (
        <div className="statistics-section">
            <div className="container">
                <div className="stats-header-pill">
                    Adarsh Gram Under PM-AJAY
                </div>
                <div className="stats-grid">
                    {statsData.map((stat) => (
                        <div key={stat.id} className="stat-card-new">
                            <div className="stat-icon-box">{stat.icon}</div>
                            <div className="stat-content">
                                <div className="stat-number"><Counter target={stat.number} /></div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="stats-footer">
                    <Link to="/adarsh-gram" className="more-link">
                        More <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StatisticsSection;
