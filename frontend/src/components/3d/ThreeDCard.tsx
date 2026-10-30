'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}

export function ThreeDCard({
  children,
  className = '',
  glowColor = 'rgba(0, 229, 255, 0.3)',
  onClick,
}: ThreeDCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  // Dynamic light glare position
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{ perspective: 1200 }}
      className="relative flex w-full"
      tabIndex={0}
      onFocus={() => setIsHovered(true)}
      onBlur={() => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={`relative w-full rounded-2xl bg-[#0B0D12]/80 backdrop-blur-xl border border-gray-800/80 p-6 overflow-hidden transition-colors duration-300 ${
          isHovered ? 'border-cyan-500/50' : ''
        } ${className}`}
      >
        {/* Dynamic Glare Reflection */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.25 : 0,
            background: `radial-gradient(circle at ${glareX} ${glareY}, ${glowColor}, transparent 60%)`,
          }}
        />

        {/* Luminous Animated Corner Rim */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{
              boxShadow: `inset 0 0 15px ${glowColor}, 0 0 20px ${glowColor}`,
            }}
          />
        )}

        {/* Content with Depth */}
        <div style={{ transform: 'translateZ(30px)' }} className="relative z-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
