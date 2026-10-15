import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SeenLogo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  size = 'md', 
  className = '' 
}) => {
  const dimensions = {
    sm: { width: variant === 'full' ? 140 : 36, height: 36 },
    md: { width: variant === 'full' ? 180 : 48, height: 48 },
    lg: { width: variant === 'full' ? 240 : 64, height: 64 },
  };

  const { width, height } = dimensions[size];

  if (variant === 'icon') {
    return (
      <svg
        width={height}
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Book Base */}
        <path
          d="M20 75C20 75 35 68 50 75C65 68 80 75 80 75V25C80 25 65 18 50 25C35 18 20 25 20 25V75Z"
          stroke="#1B263B"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50 25V75"
          stroke="#1B263B"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* S Symbol with Arrow & Checkmark */}
        <path
          d="M38 52L47 61L68 35"
          stroke="#778D7A"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M62 30L72 32L70 42"
          stroke="#778D7A"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ width }}>
      <svg
        width={height}
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 78C15 78 32 70 50 78C68 70 85 78 85 78V22C85 22 68 14 50 22C32 14 15 22 15 22V78Z"
          stroke="#0D1B2A"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50 22V78"
          stroke="#0D1B2A"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M36 50L46 60L68 32"
          stroke="#778D7A"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M61 27L73 29L71 41"
          stroke="#778D7A"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex flex-col text-right">
        <span className="font-bold text-xl md:text-2xl leading-none text-slate-900 tracking-tight">
          Seen <span className="text-teal-600 font-normal">Platform</span>
        </span>
        <span className="text-sm md:text-base font-semibold text-slate-700 leading-tight mt-0.5">
          منصة سين
        </span>
      </div>
    </div>
  );
};