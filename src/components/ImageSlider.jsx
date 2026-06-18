import React, { useState, useEffect, useCallback } from 'react';
import './ImageSlider.css';

const ImageSlider = ({ images: propImages }) => {
    const defaultImages = [
        '/logos/home-banner-1.jpg',
        '/logos/home-banner-2.jpg',
        '/logos/home-banner-3.jpg'
    ];

    const images = propImages || defaultImages;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Auto-scroll every 2.5 seconds - continuous
    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            setTimeout(() => setIsTransitioning(false), 800);
        }, 2500);

        return () => clearInterval(interval);
    }, [images.length]);

    const nextSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        setTimeout(() => setIsTransitioning(false), 800);
    }, [isTransitioning, images.length]);

    const prevSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
        setTimeout(() => setIsTransitioning(false), 800);
    }, [isTransitioning, images.length]);

    const goToSlide = (index) => {
        if (isTransitioning || index === currentIndex) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 800);
    };

    return (
        <div className="image-slider-container">
            <div className="image-slider">
                {/* Slider Track */}
                <div
                    className="slider-track"
                    style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                        transition: isTransitioning ? 'transform 0.8s ease' : 'none'
                    }}
                >
                    {images.map((image, index) => (
                        <div key={index} className="slider-slide">
                            <img
                                src={image}
                                alt={`Slide ${index + 1}`}
                                className="slider-image"
                            />
                        </div>
                    ))}
                </div>

                {/* Left Arrow */}
                <button
                    className="slider-arrow slider-arrow-left"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                {/* Right Arrow */}
                <button
                    className="slider-arrow slider-arrow-right"
                    onClick={nextSlide}
                    aria-label="Next slide"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>

                {/* Indicator Dots */}
                <div className="slider-indicators">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageSlider;
