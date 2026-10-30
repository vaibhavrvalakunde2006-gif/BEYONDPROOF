'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Brain, ShieldAlert, RefreshCw, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ThreeDRiskPolyhedronProps {
  score?: number; // 0 - 100
  category?: 'low_risk' | 'suspicious' | 'high_risk' | string;
  vectors?: {
    tamper: number;
    synthetic: number;
    provenance: number;
    metadata: number;
    network: number;
  };
}

export default function ThreeDRiskPolyhedron({
  score = 42,
  category = 'suspicious',
  vectors = {
    tamper: 35,
    synthetic: 68,
    provenance: 25,
    metadata: 40,
    network: 30,
  },
}: ThreeDRiskPolyhedronProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedVector, setSelectedVector] = useState<string | null>(null);

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const vectorsRef = useRef(vectors);
  vectorsRef.current = vectors;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = 400;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 7.5);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Determine colors based on risk score
    let baseColorHex = 0x00e5ff;
    if (score > 70) baseColorHex = 0xef4444; // High risk red
    else if (score > 30) baseColorHex = 0xffb547; // Suspicious amber

    // Morphing Icosahedron Geometry
    const icosaGeo = new THREE.IcosahedronGeometry(2.0, 1);
    const originalPositions = icosaGeo.attributes.position.clone();

    const icosaMat = new THREE.MeshStandardMaterial({
      color: baseColorHex,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
      emissive: baseColorHex,
      emissiveIntensity: 0.4,
    });
    const icosaMesh = new THREE.Mesh(icosaGeo, icosaMat);
    rootGroup.add(icosaMesh);

    // Inner Glowing Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.9, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: baseColorHex,
      transparent: true,
      opacity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // 3 Concentric Gyroscope Rings
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.35 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.02, 6, 64), ringMat1);
    rootGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.35 });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.02, 6, 64), ringMat2);
    ring2.rotation.x = Math.PI / 2.5;
    rootGroup.add(ring2);

    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0xff7a24, wireframe: true, transparent: true, opacity: 0.25 });
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.02, 6, 64), ringMat3);
    ring3.rotation.y = Math.PI / 3;
    rootGroup.add(ring3);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.8);
    dirLight.position.set(5, 7, 5);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xff7a24, 1.2);
    dirLight2.position.set(-5, -5, -4);
    scene.add(dirLight2);

    // 4. Mouse Drag Interaction
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
      rootGroup.rotation.y += deltaX * 0.01;
      rootGroup.rotation.x += deltaY * 0.01;
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

    // 5. Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Gyroscopic Rotations
      if (autoRotate && !isDragging) {
        rootGroup.rotation.y += delta * 0.4;
        ring1.rotation.x += delta * 0.6;
        ring2.rotation.y -= delta * 0.5;
        ring3.rotation.z += delta * 0.45;
      }

      // Dynamic vertex deformation based on threat score and vectors
      const pos = icosaGeo.attributes.position;
      const orig = originalPositions;
      const count = pos.count;
      const currentScore = scoreRef.current;
      const vec = vectorsRef.current;

      const threatFactor = 1.0 + (currentScore / 100) * 0.4;

      for (let i = 0; i < count; i++) {
        const ox = orig.getX(i);
        const oy = orig.getY(i);
        const oz = orig.getZ(i);

        // Vector directional bias
        let bias = 1.0;
        if (oy > 0.5) bias += (vec.synthetic / 100) * 0.5; // Top pole = synthetic
        if (ox < -0.5) bias += (vec.tamper / 100) * 0.4; // Left = tamper
        if (oz > 0.5) bias += (vec.provenance / 100) * 0.3; // Front = provenance

        const pulse = Math.sin(elapsed * 3 + i) * (0.05 * (currentScore / 50));
        pos.setXYZ(i, ox * (threatFactor + pulse) * bias, oy * (threatFactor + pulse) * bias, oz * (threatFactor + pulse) * bias);
      }
      pos.needsUpdate = true;
      icosaGeo.computeVertexNormals();

      // Core pulse
      const coreScale = 1 + Math.sin(elapsed * 4) * (0.08 + (currentScore / 100) * 0.1);
      coreMesh.scale.set(coreScale, coreScale, coreScale);

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
      icosaGeo.dispose();
      icosaMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ring1.geometry.dispose();
      ring2.geometry.dispose();
      ring3.geometry.dispose();
    };
  }, [autoRotate, score]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border border-orange-500/30 p-4 overflow-hidden backdrop-blur-xl shadow-2xl shadow-orange-950/40">
      {/* Header and Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800/80 pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-orange-400" />
          <span className="font-mono text-xs font-bold text-gray-200 tracking-wider">
            3D FORENSIC RISK GYROSCOPE & THREAT POLYHEDRON
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            title="Toggle Gyro Spin"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5 Risk Vector Quick Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2 font-mono text-[11px]">
        <div className="p-2 rounded bg-gray-900/80 border border-orange-500/30 text-center">
          <span className="text-gray-400 block text-[10px]">SYNTHETIC</span>
          <span className="text-orange-400 font-bold">{vectors.synthetic}%</span>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-cyan-500/30 text-center">
          <span className="text-gray-400 block text-[10px]">TAMPER</span>
          <span className="text-cyan-400 font-bold">{vectors.tamper}%</span>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-violet-500/30 text-center">
          <span className="text-gray-400 block text-[10px]">METADATA</span>
          <span className="text-violet-400 font-bold">{vectors.metadata}%</span>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-amber-500/30 text-center">
          <span className="text-gray-400 block text-[10px]">PROVENANCE</span>
          <span className="text-amber-400 font-bold">{vectors.provenance}%</span>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-emerald-500/30 text-center col-span-2 sm:col-span-1">
          <span className="text-gray-400 block text-[10px]">NETWORK</span>
          <span className="text-emerald-400 font-bold">{vectors.network}%</span>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[380px] relative select-none cursor-grab active:cursor-grabbing"
      />

      {/* Overall Threat Meter Footer */}
      <div className="mt-2 pt-3 border-t border-gray-800/80 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">COMPOSITE THREAT</div>
          <div className="text-orange-400 font-bold text-xs mt-0.5">{score} / 100</div>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">CLASSIFICATION</div>
          <div className="text-cyan-400 font-bold text-xs mt-0.5 uppercase">{category.replace('_', ' ')}</div>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">STABILITY INDEX</div>
          <div className="text-emerald-400 font-bold text-xs mt-0.5">NOMINAL (99.8%)</div>
        </div>
      </div>
    </div>
  );
}
