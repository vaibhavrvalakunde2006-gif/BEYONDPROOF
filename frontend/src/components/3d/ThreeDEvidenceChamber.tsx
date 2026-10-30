'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw, Lock, Sparkles, Hash } from 'lucide-react';

interface ThreeDEvidenceChamberProps {
  verdict?: 'low_risk' | 'suspicious' | 'high_risk' | string;
  sha256?: string;
  filename?: string;
  confidence?: number;
}

export default function ThreeDEvidenceChamber({
  verdict = 'low_risk',
  sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  filename = 'evidence_artifact.bin',
  confidence = 96.5,
}: ThreeDEvidenceChamberProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const isHighRisk = verdict === 'high_risk';
  const isSuspicious = verdict === 'suspicious';

  const primaryColorHex = isHighRisk ? 0xef4444 : isSuspicious ? 0xffb547 : 0x10b981;
  const secondaryColorHex = isHighRisk ? 0xff7a24 : isSuspicious ? 0x00e5ff : 0x00e5ff;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = 360;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 7.5);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Chamber Group
    const chamberGroup = new THREE.Group();
    scene.add(chamberGroup);

    // Outer Holographic Evidence Crystal (Octahedron/Dodecahedron cage)
    const cageGeo = new THREE.IcosahedronGeometry(2.2, 0);
    const cageMat = new THREE.MeshStandardMaterial({
      color: primaryColorHex,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.9,
      emissive: primaryColorHex,
      emissiveIntensity: 0.35,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    chamberGroup.add(cageMesh);

    // Inner Glowing Core (Evidence Medallion / Cylinder)
    const coreGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.3, 32);
    coreGeo.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: secondaryColorHex,
      metalness: 0.8,
      roughness: 0.2,
      emissive: secondaryColorHex,
      emissiveIntensity: 0.5,
    });
    const coreMedallion = new THREE.Mesh(coreGeo, coreMat);
    chamberGroup.add(coreMedallion);

    // Holographic Scanner Rings
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const scannerRing1 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.02, 6, 64), ringMat1);
    scannerRing1.rotation.x = Math.PI / 2;
    chamberGroup.add(scannerRing1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: primaryColorHex,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const scannerRing2 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.02, 6, 64), ringMat2);
    chamberGroup.add(scannerRing2);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00e5ff, 1.8);
    dirLight1.position.set(5, 7, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(primaryColorHex, 1.5);
    dirLight2.position.set(-5, -5, -4);
    scene.add(dirLight2);

    // 4. Mouse Drag to Rotate
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
      chamberGroup.rotation.y += deltaX * 0.01;
      chamberGroup.rotation.x += deltaY * 0.01;
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

      if (autoRotate && !isDragging) {
        chamberGroup.rotation.y += delta * 0.4;
        cageMesh.rotation.x += delta * 0.2;
        scannerRing2.rotation.y -= delta * 0.3;
      }

      // Vertical sweep of scanner ring 1
      scannerRing1.position.y = Math.sin(elapsed * 2.2) * 1.5;

      // Pulse core medallion
      const pulse = 1 + Math.sin(elapsed * 3.5) * 0.06;
      coreMedallion.scale.set(pulse, pulse, pulse);

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
      cageGeo.dispose();
      cageMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      scannerRing1.geometry.dispose();
      scannerRing2.geometry.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
    };
  }, [autoRotate, primaryColorHex, secondaryColorHex]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border border-cyan-500/30 p-4 overflow-hidden backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
      {/* Reticle Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800/80 pb-3 mb-2 gap-2">
        <div className="flex items-center gap-2">
          {isHighRisk ? (
            <ShieldAlert className="w-4 h-4 text-red-400" />
          ) : isSuspicious ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          )}
          <span className="font-mono text-xs font-bold text-gray-200 tracking-wider">
            3D HOLOGRAPHIC EVIDENCE CHAMBER // IMMUTABLE VAULT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            title="Toggle Spin"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[320px] relative select-none cursor-grab active:cursor-grabbing"
      />

      {/* Evidence Hash Ribbon Footer */}
      <div className="mt-2 pt-3 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-gray-400">
        <div className="flex items-center gap-2 truncate max-w-md">
          <Hash className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="text-gray-500 text-[11px]">SHA-256:</span>
          <span className="text-cyan-400 text-[11px] truncate">{sha256}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-gray-500">CONFIDENCE:</span>
          <span className="text-emerald-400 font-bold">{confidence}%</span>
        </div>
      </div>
    </div>
  );
}
