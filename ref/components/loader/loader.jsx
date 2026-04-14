import React, { useState, useEffect } from 'react';

const Loader = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots(prev => (prev === '...' ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  const dashKeyframes = `
    @keyframes dash {
      0% {
        stroke-dashoffset: 283;
      }
      50% {
        stroke-dashoffset: 0;
      }
      100% {
        stroke-dashoffset: -283;
      }
    }
  `;

  return (
    <div className="flex flex-col justify-center items-center">
      <style>{dashKeyframes}</style>

      <div className="relative mb-2">
        <svg className="w-16 h-16" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
              <stop offset="100%" stopColor="#60a5fa" /> {/* blue-400 */}
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="3"
          />

          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#circleGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="283"
            style={{ animation: "dash 2s ease-in-out infinite" }}
            filter="url(#glow)"
          />

          {[...Array(4)].map((_, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="3"
              fill="#3b82f6"
              className="animate-ping opacity-70"
              style={{
                transformOrigin: '50px 50px',
                transform: `rotate(${i * 90}deg) translateY(-30px)`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </svg>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full animate-pulse shadow-lg"></div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          Loading<span className="w-5 inline-block">{dots}</span>
        </p>
      </div>
    </div>
  );
};

export default Loader;
