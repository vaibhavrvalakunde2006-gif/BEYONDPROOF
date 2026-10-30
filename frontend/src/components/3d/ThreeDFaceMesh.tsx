'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Shield, Eye, Scan, RefreshCw, Layers } from 'lucide-react';

type FaceMode = 'landmarks' | 'synthetic' | 'liveness';

interface ThreeDFaceMeshProps {
  confidence?: number;
  syntheticScore?: number;
  onModeChange?: (mode: FaceMode) => void;
}

export default function ThreeDFaceMesh({
  confidence = 94.2,
  syntheticScore = 12.4,
  onModeChange,
}: ThreeDFaceMeshProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<FaceMode>('landmarks');
  const [rotating, setRotating] = useState(true);

  const handleMode = (newMode: FaceMode) => {
    setMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Setup Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = 400;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Construct Parametric 3D Face Wireframe & Landmarks
    const faceGroup = new THREE.Group();
    scene.add(faceGroup);

    // Canonical 3D facial coordinate landmarks (~68 standard indices)
    const rawLandmarks: [number, number, number][] = [
      // Jawline (0 to 16)
      [-1.8, 1.2, -0.6], [-1.7, 0.6, -0.4], [-1.6, 0.0, -0.2], [-1.5, -0.6, 0.0],
      [-1.3, -1.2, 0.2], [-1.0, -1.7, 0.5], [-0.6, -2.1, 0.7], [-0.3, -2.4, 0.9],
      [0.0, -2.5, 1.0], [0.3, -2.4, 0.9], [0.6, -2.1, 0.7], [1.0, -1.7, 0.5],
      [1.3, -1.2, 0.2], [1.5, -0.6, 0.0], [1.6, 0.0, -0.2], [1.7, 0.6, -0.4], [1.8, 1.2, -0.6],
      // Eyebrows (17 to 26)
      [-1.3, 1.5, 0.5], [-1.0, 1.7, 0.7], [-0.6, 1.7, 0.8], [-0.3, 1.6, 0.8], [-0.1, 1.4, 0.7],
      [0.1, 1.4, 0.7], [0.3, 1.6, 0.8], [0.6, 1.7, 0.8], [1.0, 1.7, 0.7], [1.3, 1.5, 0.5],
      // Nose Bridge & Tip (27 to 35)
      [0.0, 1.2, 0.8], [0.0, 0.8, 1.0], [0.0, 0.4, 1.2], [0.0, 0.0, 1.4],
      [-0.4, -0.2, 1.1], [-0.2, -0.2, 1.2], [0.0, -0.2, 1.3], [0.2, -0.2, 1.2], [0.4, -0.2, 1.1],
      // Left Eye (36 to 41)
      [-1.0, 0.9, 0.6], [-0.7, 1.1, 0.7], [-0.4, 1.0, 0.7], [-0.3, 0.8, 0.6], [-0.5, 0.7, 0.6], [-0.8, 0.7, 0.6],
      // Right Eye (42 to 47)
      [0.3, 0.8, 0.6], [0.4, 1.0, 0.7], [0.7, 1.1, 0.7], [1.0, 0.9, 0.6], [0.8, 0.7, 0.6], [0.5, 0.7, 0.6],
      // Outer Lips (48 to 59)
      [-0.7, -0.8, 0.8], [-0.5, -0.6, 0.9], [-0.2, -0.6, 1.0], [0.0, -0.65, 1.05], [0.2, -0.6, 1.0], [0.5, -0.6, 0.9], [0.7, -0.8, 0.8],
      [0.5, -1.1, 0.9], [0.2, -1.2, 1.0], [0.0, -1.25, 1.05], [-0.2, -1.2, 1.0], [-0.5, -1.1, 0.9],
      // Forehead & Temple Shell
      [-1.4, 2.2, 0.0], [-0.7, 2.4, 0.3], [0.0, 2.5, 0.4], [0.7, 2.4, 0.3], [1.4, 2.2, 0.0],
    ];

    // Landmark Points (Mesh spheres)
    const pointsGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rawLandmarks.length * 3);
    const colors = new Float32Array(rawLandmarks.length * 3);

    rawLandmarks.forEach((pt, idx) => {
      positions[idx * 3] = pt[0];
      positions[idx * 3 + 1] = pt[1];
      positions[idx * 3 + 2] = pt[2];

      // Initial color Cyan
      colors[idx * 3] = 0.0;
      colors[idx * 3 + 1] = 0.9;
      colors[idx * 3 + 2] = 1.0;
    });

    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pointsMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const landmarkPoints = new THREE.Points(pointsGeo, pointsMat);
    faceGroup.add(landmarkPoints);

    // Wireframe Mesh Shell
    // Generate curved mesh surface for liveness / synthetic inspection
    const faceMeshGeo = new THREE.CylinderGeometry(1.5, 1.1, 3.4, 24, 16, true, -Math.PI / 2.2, Math.PI / 1.1);
    faceMeshGeo.scale(1.2, 1.1, 1.0);

    const faceMeshMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const faceMesh = new THREE.Mesh(faceMeshGeo, faceMeshMat);
    faceMesh.position.set(0, -0.2, 0.2);
    faceGroup.add(faceMesh);

    // Scanning Laser Beam Line
    const laserGeo = new THREE.BoxGeometry(4.5, 0.03, 0.03);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.8,
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.position.z = 1.6;
    faceGroup.add(laserBeam);

    // 4. Mode-based visual updates
    const updateModeVisuals = (currentMode: FaceMode) => {
      const colAttr = pointsGeo.getAttribute('color') as THREE.BufferAttribute;

      if (currentMode === 'landmarks') {
        faceMeshMat.color.setHex(0x00e5ff);
        faceMeshMat.opacity = 0.25;
        laserMat.color.setHex(0x00e5ff);

        for (let i = 0; i < rawLandmarks.length; i++) {
          colAttr.setXYZ(i, 0.0, 0.9, 1.0); // Cyan
        }
      } else if (currentMode === 'synthetic') {
        faceMeshMat.color.setHex(0x8b5cf6);
        faceMeshMat.opacity = 0.4;
        laserMat.color.setHex(0xff7a24);

        // Highlight eyes & lips in heat orange
        for (let i = 0; i < rawLandmarks.length; i++) {
          if ((i >= 36 && i <= 47) || (i >= 48 && i <= 59)) {
            colAttr.setXYZ(i, 1.0, 0.48, 0.14); // Molten orange
          } else {
            colAttr.setXYZ(i, 0.55, 0.36, 0.96); // Violet
          }
        }
      } else if (currentMode === 'liveness') {
        faceMeshMat.color.setHex(0x10b981);
        faceMeshMat.opacity = 0.5;
        laserMat.color.setHex(0x10b981);

        for (let i = 0; i < rawLandmarks.length; i++) {
          colAttr.setXYZ(i, 0.06, 0.72, 0.5); // Emerald
        }
      }
      colAttr.needsUpdate = true;
    };

    updateModeVisuals(mode);

    // 5. Interactive Orbit & Drag
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      faceGroup.rotation.y += deltaX * 0.01;
      faceGroup.rotation.x = Math.max(-0.6, Math.min(0.6, faceGroup.rotation.x + deltaY * 0.01));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // 6. Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle auto rotation if not dragging
      if (!isDragging && rotating) {
        faceGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.35;
      }

      // Laser scan sweep vertically
      laserBeam.position.y = Math.sin(elapsed * 2.2) * 2.4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('resize', handleResize);

      if (container.contains(dom)) {
        container.removeChild(dom);
      }

      renderer.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      faceMeshGeo.dispose();
      faceMeshMat.dispose();
      laserGeo.dispose();
      laserMat.dispose();
    };
  }, [mode, rotating]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border border-violet-500/30 p-4 overflow-hidden backdrop-blur-xl shadow-2xl shadow-violet-950/40">
      {/* Header and Telemetry */}
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-violet-400" />
          <span className="font-mono text-xs font-bold text-gray-200 tracking-wider">
            3D BIOMETRIC FACIAL MESH INSPECTOR
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRotating(!rotating)}
            className="p-1.5 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Toggle Auto Rotation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rotating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          onClick={() => handleMode('landmarks')}
          className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'landmarks'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
              : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
        >
          <Scan className="w-3.5 h-3.5 text-cyan-400" />
          <span>68 Landmarks</span>
        </button>

        <button
          onClick={() => handleMode('synthetic')}
          className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'synthetic'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-400/50 shadow-sm shadow-orange-500/20'
              : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-orange-400" />
          <span>Synthetic Heatmap</span>
        </button>

        <button
          onClick={() => handleMode('liveness')}
          className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'liveness'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-sm shadow-emerald-500/20'
              : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Liveness Depth</span>
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[380px] relative select-none cursor-grab active:cursor-grabbing"
      />

      {/* Telemetry Overlay Footer */}
      <div className="mt-2 pt-3 border-t border-gray-800/80 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">TRACKED POINTS</div>
          <div className="text-cyan-400 font-bold text-xs mt-0.5">68/68 CONVERGED</div>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">SYNTHETIC RISK</div>
          <div className="text-orange-400 font-bold text-xs mt-0.5">{syntheticScore}% DETECTED</div>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">BIOMETRIC LIVENESS</div>
          <div className="text-emerald-400 font-bold text-xs mt-0.5">{confidence}% REAL</div>
        </div>
      </div>
    </div>
  );
}
