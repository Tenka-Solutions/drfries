import React, { useState, useEffect, useRef } from 'react';
import './Banner.css';

const Banner = ({ banners }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [direction, setDirection] = useState('');
  const bannerRef = useRef(null);
  const intervalRef = useRef(null);
  let startX = 0;
  let currentX = 0;

  useEffect(() => {
    setDirection('left'); // Set initial direction
    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  }, [banners.length]);

  const startAutoSlide = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
      setDirection('left'); // Reverse direction
    }, 5000);
  };

  const handlePrevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    setDirection('right'); // Reverse direction
    startAutoSlide();
  };

  const handleNextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
    setDirection('left'); // Reverse direction
    startAutoSlide();
  };

  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
    clearInterval(intervalRef.current);
    bannerRef.current.classList.add('dragging');
  };

  const handleTouchMove = (e) => {
    currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    bannerRef.current.style.transform = `translateX(${diffX}px)`;
  };

  const handleTouchEnd = () => {
    const diffX = currentX - startX;
    bannerRef.current.classList.remove('dragging');
    bannerRef.current.style.transform = '';
    if (diffX > 50) {
      handlePrevBanner();
    } else if (diffX < -50) {
      handleNextBanner();
    } else {
      startAutoSlide();
    }
  };

  return (
    <div
      className="banner-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={bannerRef}
    >
      {banners.map((banner, index) => (
        <img
          key={index}
          src={banner}
          alt={`Banner ${index + 1}`}
          className={`banner-image ${index === currentBanner ? 'active' : ''} ${direction === 'left' ? 'slide-left' : 'slide-right'}`}
          style={{ borderRadius: '0' }} // Ensure no rounded corners during transition
        />
      ))}
      <button className="banner-control prev" onClick={handlePrevBanner}>&#10094;</button>
      <button className="banner-control next" onClick={handleNextBanner}>&#10095;</button>
    </div>
  );
};

export default Banner;
