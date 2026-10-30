'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeFingerprintSceneProps {
  className?: string;
  interactive?: boolean;
}

export function ThreeFingerprintScene({ className = '', interactive = true }: ThreeFingerprintSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Build 3D Fingerprint Geometry from Vector Curves
    const fingerprintGroup = new THREE.Group();
    scene.add(fingerprintGroup);

    // Parametric Fingerprint Ridge generation
    const particlePositions: number[] = [];
    const particleColors: number[] = [];
    const originalPositions: number[] = [];

    const cyanColor = new THREE.Color(0x00e5ff);
    const violetColor = new THREE.Color(0x8b5cf6);
    const amberColor = new THREE.Color(0xffb547);
    const whiteColor = new THREE.Color(0xffffff);

    // Generate concentric biometric loops and arch ridges
    const ridgeCount = 22;
    for (let r = 1; r <= ridgeCount; r++) {
      const radiusX = r * 0.22;
      const radiusY = r * 0.32 + Math.sin(r * 0.2) * 0.15;
      const pointsOnRidge = Math.floor(60 + r * 14);
      const isArch = r > 14;

      for (let i = 0; i <= pointsOnRidge; i++) {
        const angle = (i / pointsOnRidge) * Math.PI * (isArch ? 1.05 : 1.95) - (isArch ? 0.025 * Math.PI : 0);
        
        // Asymmetric fingerprint delta warping
        let x = Math.cos(angle) * radiusX;
        let y = Math.sin(angle) * radiusY;
        
        // Add delta whorl perturbation at lower-left & lower-right
        if (y < -0.5) {
          x += Math.sin(y * 3.0) * 0.2;
        }

        // Layered 3D curvature: bowl/lens depth
        const distFromCenter = Math.sqrt(x * x + y * y);
        const z = -Math.cos(distFromCenter * 0.6) * 0.8 + (Math.sin(r * 0.4) * 0.15);

        // Add fine jitter to emulate biological skin ridges
        const jitterX = (Math.random() - 0.5) * 0.04;
        const jitterY = (Math.random() - 0.5) * 0.04;
        const jitterZ = (Math.random() - 0.5) * 0.05;

        particlePositions.push(x + jitterX, y + jitterY, z + jitterZ);
        originalPositions.push(x, y, z);

        // Color based on height and radial position
        const t = (y + 4.0) / 8.0;
        let pColor = cyanColor.clone();
        if (t > 0.65) {
          pColor.lerp(amberColor, (t - 0.65) * 2.5);
        } else if (t < 0.35) {
          pColor.lerp(violetColor, (0.35 - t) * 2.5);
        } else if (Math.random() > 0.92) {
          pColor = whiteColor;
        }

        particleColors.push(pColor.r, pColor.g, pColor.b);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));

    // Particle Material with Soft Glow Sprite
    const createParticleTexture = () => {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 32;
      const ctx = c.getContext('2d');
      if (ctx) {
        const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.3, 'rgba(0,229,255,0.8)');
        g.addColorStop(0.7, 'rgba(139,92,246,0.3)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(c);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      map: createParticleTexture(),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    fingerprintGroup.add(particles);

    // 3. Animated Scanning Laser Plane Indicator
    const laserGeo = new THREE.PlaneGeometry(8, 0.08);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    fingerprintGroup.add(laserBeam);

    // Outer Concentric Reticle Rings
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xff7a24,
      transparent: true,
      opacity: 0.35,
    });

    [4.8, 5.4, 6.0].forEach((radius, i) => {
      const ringGeo = new THREE.BufferGeometry();
      const pts: number[] = [];
      const segments = 64;
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        pts.push(Math.cos(theta) * radius, Math.sin(theta) * radius, -0.3);
      }
      ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const ring = new THREE.Line(ringGeo, ringMat.clone());
      (ring.material as THREE.LineBasicMaterial).opacity = 0.4 - i * 0.1;
      fingerprintGroup.add(ring);
    });

    // 4. Mouse Interactive Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 2;
      mouseY = y * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 5. Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth damping to mouse position
      targetRotX = mouseY * 0.35;
      targetRotY = mouseX * 0.45;

      fingerprintGroup.rotation.x += (targetRotX - fingerprintGroup.rotation.x) * 0.05;
      fingerprintGroup.rotation.y += (targetRotY - fingerprintGroup.rotation.y) * 0.05;

      // Gentle continuous ambient breathing
      fingerprintGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12;

      // Animated scanning laser sweep
      const sweepY = Math.sin(elapsedTime * 1.5) * 3.2;
      laserBeam.position.y = sweepY;
      laserBeam.position.z = Math.cos(sweepY * 0.5) * 0.4 + 0.1;

      // Laser brightness pulse
      laserMat.opacity = 0.5 + Math.sin(elapsedTime * 6) * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      particleMaterial.dispose();
      laserGeo.dispose();
      laserMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  if (!webGLSupported) {
    // 2D SVG Fallback
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="w-64 h-64 rounded-full border border-cyan-500/30 flex items-center justify-center bg-black/60 shadow-[0_0_40px_rgba(0,229,255,0.2)]">
          <svg className="w-48 h-48 drop-shadow-[0_0_15px_#00E5FF]" viewBox="0 0 200 200" fill="none">
            <ellipse cx="100" cy="100" rx="14" ry="22" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M 100,70 C 85,70 75,85 75,100 C 75,120 90,135 100,145" stroke="#00E5FF" strokeWidth="1.8" />
            <path d="M 100,50 C 75,50 60,75 60,100 C 60,135 80,155 100,165" stroke="#8B5CF6" strokeWidth="1.8" />
            <path d="M 100,30 C 60,30 40,65 40,100 C 40,145 65,170 100,185" stroke="#FFB547" strokeWidth="1.8" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[380px] sm:min-h-[460px] flex items-center justify-center cursor-grab active:cursor-grabbing ${className}`}
    />
  );
}
