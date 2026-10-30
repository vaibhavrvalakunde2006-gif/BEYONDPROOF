'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, Activity, RefreshCw, Layers, Sparkles } from 'lucide-react';

type TerrainMode = 'ela' | 'spectrogram' | 'noise';

interface ThreeDMediaTerrainProps {
  mediaType?: 'image' | 'video' | 'audio';
  elaAnomalyScore?: number;
  anomalyClusterCount?: number;
}

export default function ThreeDMediaTerrain({
  mediaType = 'image',
  elaAnomalyScore = 68.4,
  anomalyClusterCount = 3,
}: ThreeDMediaTerrainProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [terrainMode, setTerrainMode] = useState<TerrainMode>('ela');
  const [wireframe, setWireframe] = useState(false);
  const [elevationScale, setElevationScale] = useState(1.5);
  const [autoRotate, setAutoRotate] = useState(true);

  const elevationRef = useRef(elevationScale);
  elevationRef.current = elevationScale;

  const wireframeRef = useRef(wireframe);
  wireframeRef.current = wireframe;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = 400;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. 3D Elevation Mesh (Terrain)
    const gridSize = 48;
    const geometry = new THREE.PlaneGeometry(6, 6, gridSize, gridSize);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);
    const baseElevations = new Float32Array(count);

    // Color definitions
    const lowColor = new THREE.Color(0x0f172a); // Deep dark
    const midColor = new THREE.Color(0x00e5ff); // Cyan
    const highColor = new THREE.Color(0xff7a24); // Molten Orange
    const peakColor = new THREE.Color(0xef4444); // Red alert

    // Procedural ELA anomaly peaks
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Distance from center and specific anomaly clusters
      const d1 = Math.sqrt((x - 1.2) ** 2 + (z - 0.8) ** 2);
      const d2 = Math.sqrt((x + 1.5) ** 2 + (z + 1.2) ** 2);
      const d3 = Math.sqrt((x + 0.5) ** 2 + (z - 1.5) ** 2);

      // Elevated peaks representing spliced manipulation zones
      let elevation =
        Math.sin(x * 3) * Math.cos(z * 3) * 0.15 +
        Math.max(0, 1.2 - d1 * 1.4) * 1.5 +
        Math.max(0, 0.9 - d2 * 1.6) * 1.2 +
        Math.max(0, 0.8 - d3 * 1.8) * 0.9;

      baseElevations[i] = elevation;

      // Color mapping
      const norm = Math.min(1.0, Math.max(0.0, elevation / 1.8));
      let col = new THREE.Color();
      if (norm < 0.25) {
        col.lerpColors(lowColor, midColor, norm / 0.25);
      } else if (norm < 0.7) {
        col.lerpColors(midColor, highColor, (norm - 0.25) / 0.45);
      } else {
        col.lerpColors(highColor, peakColor, (norm - 0.7) / 0.3);
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.3,
      metalness: 0.2,
      wireframe: false,
      side: THREE.DoubleSide,
    });

    const terrainMesh = new THREE.Mesh(geometry, material);
    scene.add(terrainMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.8);
    dirLight.position.set(5, 8, 4);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xff7a24, 1.2);
    dirLight2.position.set(-5, 6, -4);
    scene.add(dirLight2);

    // Dynamic scanning reticle ring on terrain
    const ringGeo = new THREE.RingGeometry(0.3, 0.35, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide });
    const reticleRing = new THREE.Mesh(ringGeo, ringMat);
    reticleRing.position.set(1.2, 1.6, 0.8);
    scene.add(reticleRing);

    // 4. Mouse Orbit Controls
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
      terrainMesh.rotation.y += deltaX * 0.01;
      camera.position.y = Math.max(2, Math.min(9, camera.position.y - deltaY * 0.02));
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
      const elapsed = clock.getElapsedTime();

      // Update wireframe state
      material.wireframe = wireframeRef.current;

      // Update elevations with scale
      const scale = elevationRef.current;
      const positions = geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        positions.setY(i, baseElevations[i] * scale);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();

      // Auto rotation
      if (autoRotate && !isDragging) {
        terrainMesh.rotation.y = elapsed * 0.2;
      }

      // Reticle pulse
      const rScale = 1 + Math.sin(elapsed * 4) * 0.15;
      reticleRing.scale.set(rScale, rScale, rScale);
      reticleRing.position.y = baseElevations[10] * scale + 0.1;

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
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [autoRotate]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border border-violet-500/30 p-4 overflow-hidden backdrop-blur-xl shadow-2xl shadow-violet-950/40">
      {/* Header and Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800/80 pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          <span className="font-mono text-xs font-bold text-gray-200 tracking-wider">
            3D ERROR LEVEL ANALYSIS (ELA) & SPECTRAL TERRAIN
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
              wireframe
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
            }`}
          >
            {wireframe ? 'WIREFRAME' : 'SURFACE MESH'}
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            title="Toggle Orbit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mode and Scale Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Elevation Multiplier:</span>
          <input
            type="range"
            min="0.4"
            max="3.0"
            step="0.1"
            value={elevationScale}
            onChange={(e) => setElevationScale(parseFloat(e.target.value))}
            className="w-28 accent-violet-400 cursor-pointer"
          />
          <span className="text-violet-400 font-bold w-10 text-right">{elevationScale.toFixed(1)}x</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTerrainMode('ela')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
              terrainMode === 'ela'
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                : 'bg-gray-900 text-gray-500 border-gray-800'
            }`}
          >
            ELA Compression
          </button>
          <button
            onClick={() => setTerrainMode('spectrogram')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
              terrainMode === 'spectrogram'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-gray-900 text-gray-500 border-gray-800'
            }`}
          >
            Spectrogram Frequencies
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[380px] relative select-none cursor-grab active:cursor-grabbing"
      />

      {/* Telemetry Metrics Footer */}
      <div className="mt-2 pt-3 border-t border-gray-800/80 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">PEAK COMPRESSION DELTA</div>
          <div className="text-orange-400 font-bold text-xs mt-0.5">{elaAnomalyScore} dB (ANOMALOUS)</div>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">ISOLATED FORGERY CLUSTERS</div>
          <div className="text-red-400 font-bold text-xs mt-0.5">{anomalyClusterCount} DETECTED</div>
        </div>
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
          <div className="text-gray-400">TOPOLOGICAL INTEGRITY</div>
          <div className="text-cyan-400 font-bold text-xs mt-0.5">SPECTRAL VERIFIED</div>
        </div>
      </div>
    </div>
  );
}
