'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { soundManager } from '@/lib/soundFx';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
  href?: string;
  onClick?: () => void;
}

export default function ThreeDCard({
  children,
  className = '',
  glowColor = '#00e5ff',
  maxTilt = 12,
  href,
  onClick,
}: ThreeDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;

    setTilt({
      x: -normY * maxTilt * 2,
      y: normX * maxTilt * 2,
    });

    setSpotlight({
      x,
      y,
      opacity: 0.45,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    soundManager.playBlip();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const content = (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.025, 1.025, 1.025)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer select-none border transition-colors duration-300 ${
        isHovered
          ? 'border-cyan-400/80 shadow-[0_20px_45px_rgba(0,229,255,0.22)]'
          : 'border-white/[0.08] hover:border-white/20'
      } ${className}`}
    >
      {/* Specular Radial Spotlight Follower */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(350px circle at ${spotlight.x}px ${spotlight.y}px, ${glowColor}33, transparent 75%)`,
        }}
      />

      {/* Cyber Grid Texture Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Card Body with 3D Depth Layer */}
      <div className="relative z-20 h-full flex flex-col justify-between" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
