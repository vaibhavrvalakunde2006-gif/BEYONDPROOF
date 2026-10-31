'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GlobalForensicBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.025);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 0, 0);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Dynamic Liquid Aurora Wave Plane
    const cols = 50;
    const rows = 35;
    const planeGeo = new THREE.PlaneGeometry(75, 45, cols, rows);
    planeGeo.rotateX(-Math.PI / 2.4);
    planeGeo.translate(0, -4, 0);

    // Generate Aurora vertex colors (cyan -> electric azure -> vibrant violet)
    const count = planeGeo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    const pos = planeGeo.attributes.position;

    for (let i = 0; i < count; i++) {
      const u = (pos.getX(i) + 37.5) / 75; // 0 to 1
      const v = (pos.getY(i) + 20) / 40;

      // Aurora blend: cyan (0, 242, 254) -> azure (56, 189, 248) -> violet (168, 85, 247)
      const r = THREE.MathUtils.lerp(0.0, 0.65, u * 0.7 + v * 0.3);
      const g = THREE.MathUtils.lerp(0.9, 0.35, u);
      const b = THREE.MathUtils.lerp(1.0, 0.95, v);

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Liquid wireframe material
    const waveMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    const waveMesh = new THREE.Mesh(planeGeo, waveMaterial);
    scene.add(waveMesh);

    // 4. Bioluminescent Floating Aurora Particles
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 25 + 2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const isCyan = Math.random() > 0.45;
      particleColors[i * 3] = isCyan ? 0.0 : 0.75;
      particleColors[i * 3 + 1] = isCyan ? 0.9 : 0.4;
      particleColors[i * 3 + 2] = isCyan ? 1.0 : 1.0;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Horizon Coordinate Lattice (Subtle Cryptographic Grid)
    const gridHelper = new THREE.GridHelper(90, 45, 0x0284c7, 0x1e1b4b);
    gridHelper.position.y = -4.2;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    scene.add(gridHelper);

    // 6. Interactive Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. Dynamic Liquid Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const origPos = (waveMesh.geometry.attributes.position.array as Float32Array).slice();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const t = clock.getElapsedTime();
        const positions = waveMesh.geometry.attributes.position.array as Float32Array;

        // Wave undulation
        for (let i = 0; i < count; i++) {
          const x = origPos[i * 3];
          const y = origPos[i * 3 + 1];
          const z =
            Math.sin(x * 0.12 + t * 0.9) * Math.cos(y * 0.15 + t * 0.7) * 1.8 +
            Math.sin((x + y) * 0.08 + t * 0.5) * 0.9;
          positions[i * 3 + 2] = z;
        }
        waveMesh.geometry.attributes.position.needsUpdate = true;

        // Parallax smooth interpolation
        targetX += (mouseX - targetX) * 0.035;
        targetY += (mouseY - targetY) * 0.035;

        camera.position.x = targetX * 3.5;
        camera.position.y = 8 - targetY * 2.0;
        camera.lookAt(0, 0, 0);

        particles.rotation.y = t * 0.02;
        gridHelper.position.z = (t * 0.6) % 2;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      planeGeo.dispose();
      waveMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      gridHelper.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-85"
      aria-hidden="true"
    />
  );
}
