import React from 'react';
import ImageSlider from '../components/ImageSlider';
import MonitorableIndicators from '../components/MonitorableIndicators';
import Footer from '../components/Footer';

const AdarshGram = () => {
    const images = [
        '/logos/adarsh-banner-1.jpg',
        '/logos/adarsh-banner-2.jpg',
        '/logos/adarsh-banner-3.jpg',
    ];

    return (
        <div className="page-wrapper">
            <div style={{ marginTop: '20px' }}>
                <ImageSlider images={images} />
            </div>
            <div className="page-content">
                <MonitorableIndicators />
            </div>
            <Footer />
        </div>
    );
};

export default AdarshGram;