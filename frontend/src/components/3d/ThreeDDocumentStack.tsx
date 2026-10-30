'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, Eye, RefreshCw, ZoomIn, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ThreeDDocumentStackProps {
  tamperCount?: number;
  fontMismatchCount?: number;
  hasSignature?: boolean;
}

export default function ThreeDDocumentStack({
  tamperCount = 2,
  fontMismatchCount = 3,
  hasSignature = true,
}: ThreeDDocumentStackProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [explosion, setExplosion] = useState(1.4); // Separation distance
  const [activeLayers, setActiveLayers] = useState({
    crypto: true,
    content: true,
    tamper: true,
  });
  const [autoRotate, setAutoRotate] = useState(true);

  const explosionRef = useRef(explosion);
  explosionRef.current = explosion;

  const activeLayersRef = useRef(activeLayers);
  activeLayersRef.current = activeLayers;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = 420;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 3, 7);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Document Group
    const docGroup = new THREE.Group();
    scene.add(docGroup);

    // Create 3 Document Planes
    const planeWidth = 3.2;
    const planeHeight = 4.4;

    // Helper: Create a textured canvas plane
    const createLayerMesh = (
      bgColor: string,
      strokeColor: string,
      type: 'crypto' | 'content' | 'tamper'
    ) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 704;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 512, 704);

      // Border
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 492, 684);

      // Forensic content rendering based on layer type
      if (type === 'crypto') {
        ctx.fillStyle = '#8b5cf6';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('0x00: OBJECT STREAM // XREF TABLE', 30, 50);

        ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
        for (let y = 80; y < 650; y += 24) {
          ctx.fillRect(30, y, Math.random() * 300 + 100, 10);
        }

        // Digital Signature Stamp
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(320, 560, 160, 80);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('RSA-SHA256 SIGNED', 330, 590);
        ctx.fillText('VALID CERTIFICATE', 330, 615);
      } else if (type === 'content') {
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('FORENSIC DOSSIER SPECIFICATION', 30, 60);

        // Document Paragraph Simulation Lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let y = 100; y < 620; y += 22) {
          if (y % 88 === 0) continue; // paragraph gaps
          ctx.fillRect(30, y, 452, 6);
        }
      } else if (type === 'tamper') {
        // Transparent with red/orange spliced bounding boxes
        ctx.clearRect(0, 0, 512, 704);

        // Spliced bounding box 1 (Date alteration)
        ctx.strokeStyle = '#ff7a24';
        ctx.lineWidth = 4;
        ctx.strokeRect(60, 180, 220, 50);
        ctx.fillStyle = 'rgba(255, 122, 36, 0.25)';
        ctx.fillRect(60, 180, 220, 50);
        ctx.fillStyle = '#ff7a24';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('[!] FONT MISMATCH // TAMPER', 65, 170);

        // Spliced bounding box 2 (Amount alteration)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.strokeRect(220, 340, 240, 60);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.fillRect(220, 340, 240, 60);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('[!] VALUE OVERWRITE DETECTED', 225, 330);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: type === 'tamper' ? 0.9 : 0.85,
        side: THREE.DoubleSide,
      });

      const geo = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const mesh = new THREE.Mesh(geo, mat);
      return mesh;
    };

    const cryptoMesh = createLayerMesh('rgba(11, 15, 25, 0.88)', '#8b5cf6', 'crypto');
    const contentMesh = createLayerMesh('rgba(15, 23, 42, 0.88)', '#00e5ff', 'content');
    const tamperMesh = createLayerMesh('rgba(0, 0, 0, 0)', '#ff7a24', 'tamper');

    docGroup.add(cryptoMesh);
    docGroup.add(contentMesh);
    docGroup.add(tamperMesh);

    // Initial slight angle for 3D perspective
    docGroup.rotation.y = -Math.PI / 6;
    docGroup.rotation.x = Math.PI / 10;

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
      docGroup.rotation.y += deltaX * 0.01;
      docGroup.rotation.x += deltaY * 0.01;
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

    // 6. Animation
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (autoRotate && !isDragging) {
        docGroup.rotation.y = -Math.PI / 6 + Math.sin(elapsed * 0.5) * 0.2;
      }

      // Update layer separation dynamically
      const sep = explosionRef.current;
      cryptoMesh.position.z = -sep;
      contentMesh.position.z = 0;
      tamperMesh.position.z = sep;

      // Visibility toggles
      cryptoMesh.visible = activeLayersRef.current.crypto;
      contentMesh.visible = activeLayersRef.current.content;
      tamperMesh.visible = activeLayersRef.current.tamper;

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
      cryptoMesh.geometry.dispose();
      contentMesh.geometry.dispose();
      tamperMesh.geometry.dispose();
    };
  }, [autoRotate]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950 border border-cyan-500/30 p-4 overflow-hidden backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
      {/* Top Header & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800/80 pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold text-gray-200 tracking-wider">
            3D EXPLODED MULTI-LAYER FORENSIC DOCUMENT STACK
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-900 border border-gray-800"
          >
            <RefreshCw className={`w-3 h-3 ${autoRotate ? 'text-cyan-400' : ''}`} />
            <span>{autoRotate ? 'ORBIT ON' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Layer Visibility & Separation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Layer Separation:</span>
          <input
            type="range"
            min="0.1"
            max="2.5"
            step="0.05"
            value={explosion}
            onChange={(e) => setExplosion(parseFloat(e.target.value))}
            className="w-32 accent-cyan-400 cursor-pointer"
          />
          <span className="text-cyan-400 font-bold w-12 text-right">{explosion.toFixed(2)}x</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveLayers((p) => ({ ...p, tamper: !p.tamper }))}
            className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all ${
              activeLayers.tamper
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                : 'bg-gray-900 text-gray-500 border-gray-800'
            }`}
          >
            L3: Tamper Overlay ({tamperCount})
          </button>
          <button
            onClick={() => setActiveLayers((p) => ({ ...p, content: !p.content }))}
            className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all ${
              activeLayers.content
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-gray-900 text-gray-500 border-gray-800'
            }`}
          >
            L2: Font & Text
          </button>
          <button
            onClick={() => setActiveLayers((p) => ({ ...p, crypto: !p.crypto }))}
            className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all ${
              activeLayers.crypto
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                : 'bg-gray-900 text-gray-500 border-gray-800'
            }`}
          >
            L1: Cryptographic Ghost
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[400px] relative select-none cursor-grab active:cursor-grabbing"
      />

      {/* Forensic Telemetry Pills */}
      <div className="mt-2 pt-3 border-t border-gray-800/80 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">STRUCTURE ANOMALIES</div>
          <div className="text-orange-400 font-bold text-xs mt-0.5">{tamperCount} DETECTED</div>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">FONT HARMONIC DRIFT</div>
          <div className="text-cyan-400 font-bold text-xs mt-0.5">{fontMismatchCount} SUSPICIOUS</div>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">CRYPTO CERTIFICATE</div>
          <div className="text-emerald-400 font-bold text-xs mt-0.5">
            {hasSignature ? 'RSA-2048 VERIFIED' : 'UNSIGNED'}
          </div>
        </div>
      </div>
    </div>
  );
}
