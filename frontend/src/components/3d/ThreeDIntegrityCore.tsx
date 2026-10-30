'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { Shield, Activity, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface EngineSatellite {
  id: string;
  name: string;
  tag: string;
  route: string;
  color: number;
  status: 'OPTIMAL' | 'ACTIVE' | 'EVALUATING';
  angle: number;
  radius: number;
  speed: number;
  mesh?: THREE.Mesh;
}

export default function ThreeDIntegrityCore() {
  const mountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hoveredEngine, setHoveredEngine] = useState<EngineSatellite | null>(null);
  const [activeRotSpeed, setActiveRotSpeed] = useState(1);

  const enginesRef = useRef<EngineSatellite[]>([
    { id: 'identity', name: 'Identity Guardian', tag: 'BIOMETRIC & MRZ', route: '/app/engines/identity', color: 0x00e5ff, status: 'OPTIMAL', angle: 0, radius: 4.8, speed: 0.4 },
    { id: 'document', name: 'Document Verifier', tag: 'PDF & METADATA', route: '/app/engines/document', color: 0x10b981, status: 'OPTIMAL', angle: (Math.PI * 2 * 1) / 7, radius: 4.8, speed: 0.35 },
    { id: 'media', name: 'Media Truth', tag: 'AFTERIMAGE ELA', route: '/app/engines/media', color: 0x8b5cf6, status: 'ACTIVE', angle: (Math.PI * 2 * 2) / 7, radius: 4.8, speed: 0.45 },
    { id: 'source', name: 'Source Tracker', tag: 'pHash & PROVENANCE', route: '/app/engines/source', color: 0xffb547, status: 'OPTIMAL', angle: (Math.PI * 2 * 3) / 7, radius: 4.8, speed: 0.38 },
    { id: 'trust-graph', name: 'Trust Graph', tag: 'SYNDICATE NETWORK', route: '/app/trust-graph', color: 0x38bdf8, status: 'OPTIMAL', angle: (Math.PI * 2 * 4) / 7, radius: 4.8, speed: 0.42 },
    { id: 'risk', name: 'Risk Analyzer', tag: 'BAYESIAN THREAT', route: '/app/engines/risk', color: 0xff7a24, status: 'OPTIMAL', angle: (Math.PI * 2 * 5) / 7, radius: 4.8, speed: 0.32 },
    { id: 'verification', name: 'Investigation History', tag: 'MASTER DOSSIER', route: '/app/history', color: 0x06b6d4, status: 'OPTIMAL', angle: (Math.PI * 2 * 6) / 7, radius: 4.8, speed: 0.4 },
  ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 800;
    const height = 460;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 11);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Central Core Geodesic Sphere
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner glowing sphere
    const innerGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // Solid inner nucleus
    const nucGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const nucMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.45,
    });
    const nucleus = new THREE.Mesh(nucGeo, nucMat);
    coreGroup.add(nucleus);

    // Outer concentric rings
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.3 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.02, 8, 64), ringMat1);
    ring1.rotation.x = Math.PI / 2.3;
    scene.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.25 });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.02, 8, 64), ringMat2);
    ring2.rotation.y = Math.PI / 3;
    scene.add(ring2);

    // 4. Orbiting Engine Satellites
    const satelliteGroup = new THREE.Group();
    scene.add(satelliteGroup);

    const satelliteMeshes: { [key: string]: THREE.Mesh } = {};
    const raycastTargets: THREE.Mesh[] = [];

    enginesRef.current.forEach((eng) => {
      const satGeo = new THREE.SphereGeometry(0.38, 16, 16);
      const satMat = new THREE.MeshStandardMaterial({
        color: eng.color,
        roughness: 0.2,
        metalness: 0.8,
        emissive: eng.color,
        emissiveIntensity: 0.4,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.userData = { engine: eng };

      // Halo ring around each satellite
      const haloGeo = new THREE.RingGeometry(0.48, 0.54, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: eng.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      satMesh.add(halo);

      satelliteGroup.add(satMesh);
      satelliteMeshes[eng.id] = satMesh;
      raycastTargets.push(satMesh);
    });

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xff7a24, 0.8);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 6. Raycasting & Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouseX = 0;
    let rotationVelocity = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        rotationVelocity = deltaX * 0.005;
        satelliteGroup.rotation.y += rotationVelocity;
        coreGroup.rotation.y += rotationVelocity;
        prevMouseX = e.clientX;
      }

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastTargets);
      if (intersects.length > 0) {
        const target = intersects[0].object as THREE.Mesh;
        const eng = target.userData.engine as EngineSatellite;
        setHoveredEngine(eng);
        container.style.cursor = 'pointer';
      } else {
        setHoveredEngine(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastTargets);
      if (intersects.length > 0) {
        const target = intersects[0].object as THREE.Mesh;
        const eng = target.userData.engine as EngineSatellite;
        if (eng && eng.route) {
          router.push(eng.route);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousemove', onPointerMove);
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('click', onClick);

    // 7. Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Inertial spin
      if (!isDragging) {
        rotationVelocity *= 0.95;
        satelliteGroup.rotation.y += 0.003 * activeRotSpeed + rotationVelocity;
      }

      // Rotate core & rings
      coreGroup.rotation.y += delta * 0.4;
      coreGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.15;
      ring1.rotation.z += delta * 0.2;
      ring2.rotation.z -= delta * 0.25;

      // Pulse nucleus
      const scale = 1 + Math.sin(elapsed * 3) * 0.08;
      nucleus.scale.set(scale, scale, scale);

      // Position satellites along orbital plane with slight undulating elevation
      enginesRef.current.forEach((eng) => {
        const mesh = satelliteMeshes[eng.id];
        if (mesh) {
          const currentAngle = eng.angle + elapsed * 0.2 * eng.speed;
          mesh.position.x = Math.cos(currentAngle) * eng.radius;
          mesh.position.z = Math.sin(currentAngle) * eng.radius;
          mesh.position.y = Math.sin(elapsed * 1.5 + eng.angle) * 0.6;
          mesh.rotation.y += delta;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousemove', onPointerMove);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);

      if (container.contains(dom)) {
        container.removeChild(dom);
      }

      renderer.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      nucGeo.dispose();
      nucMat.dispose();
    };
  }, [router, activeRotSpeed]);

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-gray-950/80 via-gray-900/40 to-gray-950/90 border border-cyan-500/30 p-4 overflow-hidden backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
      {/* Reticle & Tech Grid Accents */}
      <div className="absolute top-3 left-4 flex items-center gap-2 font-mono text-xs text-cyan-400">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping inline-block" />
        <span className="tracking-widest font-bold">3D FORENSIC INTEGRITY CORE // ORBITAL TELEMETRY</span>
      </div>

      <div className="absolute top-3 right-4 flex items-center gap-2">
        <button
          onClick={() => setActiveRotSpeed((s) => (s === 1 ? 2.5 : 1))}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-900/80 border border-gray-700/60 hover:border-cyan-500 text-[11px] font-mono text-gray-300 hover:text-cyan-300 transition-colors"
          title="Toggle Rotation Speed"
        >
          <RefreshCw className="w-3 h-3 text-cyan-400" />
          <span>{activeRotSpeed > 1 ? 'FAST' : 'NORMAL'}</span>
        </button>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-[460px] relative select-none"
        style={{ cursor: 'grab' }}
      />

      {/* Floating Dynamic Satellite Tooltip */}
      {hoveredEngine && (
        <div className="absolute bottom-6 left-6 pointer-events-none z-20 flex items-center gap-3 p-3.5 rounded-xl bg-gray-950/90 border border-cyan-400/50 shadow-xl shadow-cyan-950/80 backdrop-blur-md animate-fade-in">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0 animate-pulse"
            style={{ backgroundColor: `#${hoveredEngine.color.toString(16).padStart(6, '0')}` }}
          />
          <div>
            <div className="text-xs font-mono text-cyan-400 font-bold tracking-wider">
              {hoveredEngine.tag}
            </div>
            <div className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>{hoveredEngine.name}</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                {hoveredEngine.status}
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
              <span>Click satellite node to inspect engine</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </div>
          </div>
        </div>
      )}

      {/* Control Help Bar */}
      <div className="absolute bottom-4 right-4 pointer-events-none hidden sm:flex items-center gap-3 text-[11px] font-mono text-gray-400 bg-gray-900/60 px-3 py-1.5 rounded-lg border border-gray-800">
        <span>Click & drag to rotate orbital field</span>
        <span className="text-gray-600">|</span>
        <span className="text-cyan-400">Click node to launch engine</span>
      </div>
    </div>
  );
}
