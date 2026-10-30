'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Fingerprint, GitCompare, RefreshCw, Database, ShieldCheck, ArrowRight } from 'lucide-react';

interface ThreeDProvenanceChainProps {
  mode?: 'chain' | 'compare';
  matchPercentage?: number;
  hammingDistance?: number;
}

export default function ThreeDProvenanceChain({
  mode: initialMode = 'chain',
  matchPercentage = 94.2,
  hammingDistance = 4,
}: ThreeDProvenanceChainProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<'chain' | 'compare'>(initialMode);
  const [autoRotate, setAutoRotate] = useState(true);

  const activeModeRef = useRef(activeMode);
  activeModeRef.current = activeMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = 400;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 9.5);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Chain Mode Root Group
    const chainGroup = new THREE.Group();
    scene.add(chainGroup);

    // Create 8 Cryptographic Blocks arranged in a 3D ring
    const blockCount = 8;
    const ringRadius = 3.6;
    const blocks: THREE.Mesh[] = [];

    const blockGeo = new THREE.BoxGeometry(0.9, 0.6, 0.4);

    for (let i = 0; i < blockCount; i++) {
      const angle = (i / blockCount) * Math.PI * 2;
      const blockMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x00e5ff : 0x8b5cf6,
        roughness: 0.3,
        metalness: 0.7,
        emissive: i === 0 ? 0x00e5ff : 0x8b5cf6,
        emissiveIntensity: 0.35,
      });

      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.set(Math.cos(angle) * ringRadius, Math.sin(angle * 2) * 0.4, Math.sin(angle) * ringRadius);
      block.rotation.y = -angle;

      chainGroup.add(block);
      blocks.push(block);
    }

    // Connecting laser line between blocks
    const lineCurvePoints: THREE.Vector3[] = blocks.map((b) => b.position);
    lineCurvePoints.push(blocks[0].position); // close loop

    const lineGeo = new THREE.BufferGeometry().setFromPoints(lineCurvePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.6,
    });
    const chainLine = new THREE.Line(lineGeo, lineMat);
    chainGroup.add(chainLine);

    // 4. Compare Mode Root Group (Dual-Token Comparator)
    const compareGroup = new THREE.Group();
    compareGroup.visible = false;
    scene.add(compareGroup);

    // Token A (Original Reference)
    const tokenGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 32);
    tokenGeo.rotateX(Math.PI / 2);

    const matA = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.4,
    });
    const tokenA = new THREE.Mesh(tokenGeo, matA);
    tokenA.position.set(-2.4, 0, 0);
    compareGroup.add(tokenA);

    // Token B (Suspect Comparison File)
    const matB = new THREE.MeshStandardMaterial({
      color: 0xff7a24,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xff7a24,
      emissiveIntensity: 0.4,
    });
    const tokenB = new THREE.Mesh(tokenGeo, matB);
    tokenB.position.set(2.4, 0, 0);
    compareGroup.add(tokenB);

    // Perceptual Hash Alignment Laser Rays between Token A & Token B
    const laserRayGroup = new THREE.Group();
    compareGroup.add(laserRayGroup);

    const laserCount = 9;
    for (let i = 0; i < laserCount; i++) {
      const yOffset = (i / (laserCount - 1) - 0.5) * 1.6;
      const zOffset = Math.sin(i * 1.5) * 0.4;
      const isMatch = i !== 3 && i !== 7; // simulate matching vs divergent pHash bits

      const rayPoints = [
        new THREE.Vector3(-2.2, yOffset, zOffset),
        new THREE.Vector3(2.2, yOffset, zOffset),
      ];
      const rayGeo = new THREE.BufferGeometry().setFromPoints(rayPoints);
      const rayMat = new THREE.LineBasicMaterial({
        color: isMatch ? 0x10b981 : 0xef4444, // Green for match, Red for mismatch
        linewidth: 2,
        transparent: true,
        opacity: 0.8,
      });
      const rayLine = new THREE.Line(rayGeo, rayMat);
      laserRayGroup.add(rayLine);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.8);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xff7a24, 1.2);
    dirLight2.position.set(-5, -4, -4);
    scene.add(dirLight2);

    // 5. Mouse Interaction
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
      chainGroup.rotation.y += deltaX * 0.01;
      compareGroup.rotation.y += deltaX * 0.01;
      camera.position.y = Math.max(1, Math.min(6, camera.position.y - deltaY * 0.02));
      camera.lookAt(0, 0, 0);
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

      // Mode visibility toggle
      const isChain = activeModeRef.current === 'chain';
      chainGroup.visible = isChain;
      compareGroup.visible = !isChain;

      if (autoRotate && !isDragging) {
        if (isChain) {
          chainGroup.rotation.y = elapsed * 0.25;
          chainGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.12;
        } else {
          tokenA.rotation.z = elapsed * 0.5;
          tokenB.rotation.z = -elapsed * 0.5;
          compareGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.2;
        }
      }

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
      blockGeo.dispose();
      tokenGeo.dispose();
      lineGeo.dispose();
    };
  }, [autoRotate]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border border-amber-500/30 p-4 overflow-hidden backdrop-blur-xl shadow-2xl shadow-amber-950/40">
      {/* Header and Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800/80 pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-xs font-bold text-gray-200 tracking-wider">
            3D CRYPTOGRAPHIC PROVENANCE & PERCEPTUAL COMPARATOR
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

      {/* Mode Controls */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={() => setActiveMode('chain')}
          className={`py-1.5 px-3 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'chain'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20'
              : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Provenance Ledger Ring</span>
        </button>

        <button
          onClick={() => setActiveMode('compare')}
          className={`py-1.5 px-3 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'compare'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
              : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dual Token pHash Laser</span>
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[380px] relative select-none cursor-grab active:cursor-grabbing"
      />

      {/* Telemetry Metrics Footer */}
      <div className="mt-2 pt-3 border-t border-gray-800/80 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">PERCEPTUAL MATCH</div>
          <div className="text-cyan-400 font-bold text-xs mt-0.5">{matchPercentage}% SIMILAR</div>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">HAMMING DISTANCE</div>
          <div className="text-amber-400 font-bold text-xs mt-0.5">{hammingDistance} BITS ALTERED</div>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">IMMUTABLE BLOCKS</div>
          <div className="text-emerald-400 font-bold text-xs mt-0.5">8 BLOCKS SECURED</div>
        </div>
      </div>
    </div>
  );
}
