'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import {
  Shield,
  Eye,
  Fingerprint,
  Network,
  Brain,
  CheckCircle,
  Scan,
  Activity,
  Layers,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  Maximize2,
  Minimize2,
  Compass,
  Video,
} from 'lucide-react';
import { soundManager } from '@/lib/soundFx';

type HolodeckMode = 'core' | 'biometric' | 'ela' | 'provenance' | 'threat';
type CameraPreset = 'orbit' | 'top' | 'macro' | 'cinematic';

interface SampleAttack {
  id: string;
  name: string;
  targetMode: HolodeckMode;
  filename: string;
  verdict: 'FORGERY CONFIRMED' | 'DEEPFAKE SYNTHETIC' | 'CONTRACT SPLICED';
  confidence: string;
  details: string;
  sha256: string;
}

export default function ForensicHolodeckHero({
  onQuickLogin,
  isLoggingIn,
}: {
  onQuickLogin?: () => void;
  isLoggingIn?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [activeMode, setActiveMode] = useState<HolodeckMode>('core');
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [mouseCoords, setMouseCoords] = useState({ x: 382.4, y: 194.2 });
  const [analyzingFile, setAnalyzingFile] = useState(false);
  const [inspectionVerdict, setInspectionVerdict] = useState<any | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('orbit');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeModeRef = useRef<HolodeckMode>(activeMode);
  activeModeRef.current = activeMode;

  const cameraPresetRef = useRef<CameraPreset>(cameraPreset);
  cameraPresetRef.current = cameraPreset;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const sampleAttacks: SampleAttack[] = [
    {
      id: 'passport',
      name: 'Counterfeit Passport MRZ',
      targetMode: 'biometric',
      filename: 'FRA_PASSPORT_EXP2028.IMG',
      verdict: 'FORGERY CONFIRMED',
      confidence: '99.98% Checksum Failure',
      details: 'ICAO 9303 modulo-10 checksum mismatch on document number check digit [8 vs 7].',
      sha256: '9a8b1c4d7e2f5a0b3c6d9e1f4a7b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7a0b3c',
    },
    {
      id: 'deepfake',
      name: 'Synthetic Voice Authorization',
      targetMode: 'ela',
      filename: 'CFO_WIRE_AUTHORIZATION.WAV',
      verdict: 'DEEPFAKE SYNTHETIC',
      confidence: '98.4% Spectral Anomaly',
      details: '16.4kHz pitch boundary diffusion artifact detected with 84.6 dB variance.',
      sha256: '4f7a2b9c1d6e8f0a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a',
    },
    {
      id: 'contract',
      name: 'Altered Liability Ceiling',
      targetMode: 'provenance',
      filename: 'MASTER_SERVICES_AGREEMENT.PDF',
      verdict: 'CONTRACT SPLICED',
      confidence: '100% XRef Stream Proof',
      details: 'Post-signature incremental trailer revision overwrite detected at byte offset 0x4F12.',
      sha256: 'e1d2c3b4a5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    },
  ];

  // 120-Second Judge Tour Scripts
  const tourScripts = [
    {
      mode: 'core' as HolodeckMode,
      title: '0:00 - 0:25 | The Fraud Problem & 7-Engine Architecture',
      script:
        'Judges, in 2026, AI can forge any passport in 3 seconds. Black-box percentage guesses fail in court. BEYONDPROOF delivers deterministic mathematical proof across 7 continuous forensic microservices.',
    },
    {
      mode: 'biometric' as HolodeckMode,
      title: '0:25 - 0:50 | Identity Guardian: Biometric & MRZ Forensics',
      script:
        'Here is the 3D biometric wireframe extracting 68 facial landmarks. We compute ICAO 9303 modulo-10 checksums with 7-3-1 weighting to mathematically isolate forged passports.',
    },
    {
      mode: 'ela' as HolodeckMode,
      title: '0:50 - 1:15 | Media Truth: Spectral Frequency & ELA Terrain',
      script:
        'This 3D topological heightmap reveals pixel compression discrepancies. Spliced generative AI regions form elevated red ridges, proving audio/video tampering with zero false assumptions.',
    },
    {
      mode: 'provenance' as HolodeckMode,
      title: '1:15 - 1:40 | Source Tracker: Cryptographic Ledger & pHash Laser',
      script:
        'Every verified asset is anchored to an immutable blockchain ring. Our perceptual hash laser comparator visually measures Hamming distance to identify unauthorized derivatives.',
    },
    {
      mode: 'threat' as HolodeckMode,
      title: '1:40 - 2:00 | AI Risk Analyzer: Explainable Bayesian Synthesis',
      script:
        'Finally, this 3D threat gyroscope synthesizes weighted evidence into a court-admissible PDF dossier. Trust should never be assumed. It must be mathematically proven.',
    },
  ];

  // Switch mode handler with sound
  const handleModeChange = (mode: HolodeckMode) => {
    setActiveMode(mode);
    soundManager.playModeSwitch();
  };

  const handleCameraChange = (preset: CameraPreset) => {
    setCameraPreset(preset);
    soundManager.playLaserScan();
  };

  const toggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    soundManager.playModeSwitch();
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 60);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  // Sample attack trigger
  const handleTriggerSample = (attack: SampleAttack) => {
    soundManager.playLaserScan();
    setActiveMode(attack.targetMode);
    setAnalyzingFile(true);
    setInspectionVerdict(null);

    setTimeout(() => {
      soundManager.playAlertBuzz();
      setAnalyzingFile(false);
      setInspectionVerdict(attack);
    }, 1200);
  };

  // 120-Second Tour Autopilot
  useEffect(() => {
    if (!isTourActive) return;

    const interval = setInterval(() => {
      setTourStep((prev) => {
        const next = (prev + 1) % tourScripts.length;
        setActiveMode(tourScripts[next].mode);
        soundManager.playModeSwitch();
        return next;
      });
    }, 6000); // cycle every 6s in demo preview

    return () => clearInterval(interval);
  }, [isTourActive, tourScripts]);

  // Main Three.js Scene Implementation
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Setup Scene & Camera
    const scene = new THREE.Scene();
    let width = container.clientWidth || 1000;
    let height = container.clientHeight || 580;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 11);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Ambient Volumetric Data Nebula (Particles)
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleCols = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color(0x00e5ff);
    const amber = new THREE.Color(0xff7a24);
    const violet = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 36;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 24;

      const pick = Math.random();
      const col = pick < 0.5 ? cyan : pick < 0.85 ? violet : amber;
      particleCols[i * 3] = col.r;
      particleCols[i * 3 + 1] = col.g;
      particleCols[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleCols, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particleMesh);

    // 4. Perspective Cyber Horizon Grid
    const grid = new THREE.GridHelper(50, 40, 0x00e5ff, 0x1e293b);
    grid.position.y = -3.5;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.25;
    scene.add(grid);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00e5ff, 2.0);
    dirLight1.position.set(6, 10, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff7a24, 1.5);
    dirLight2.position.set(-6, -6, -6);
    scene.add(dirLight2);

    // ==========================================
    // 5. FIVE INTERACTIVE FORENSIC 3D GROUPS
    // ==========================================

    // GROUP 1: CORE (Geodesic Nucleus + Orbiting Satellites)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const nucleusGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleusMesh);

    const ringGeo1 = new THREE.TorusGeometry(3.2, 0.02, 6, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.4 });
    const coreRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    coreRing1.rotation.x = Math.PI / 2.3;
    coreGroup.add(coreRing1);

    const ringGeo2 = new THREE.TorusGeometry(3.8, 0.02, 6, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xff7a24, transparent: true, opacity: 0.35 });
    const coreRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    coreRing2.rotation.y = Math.PI / 3;
    coreGroup.add(coreRing2);

    // 7 Satellite Nodes
    const satellites: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const satGeo = new THREE.SphereGeometry(0.32, 16, 16);
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x00e5ff : 0xff7a24,
        emissive: i % 2 === 0 ? 0x00e5ff : 0xff7a24,
        emissiveIntensity: 0.4,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.position.set(Math.cos(angle) * 4.4, Math.sin(angle * 2) * 0.4, Math.sin(angle) * 4.4);
      coreGroup.add(satMesh);
      satellites.push(satMesh);
    }

    // GROUP 2: BIOMETRIC MESH
    const biometricGroup = new THREE.Group();
    biometricGroup.visible = false;
    scene.add(biometricGroup);

    const faceCylGeo = new THREE.CylinderGeometry(1.4, 1.0, 3.2, 24, 16, true, -Math.PI / 2.2, Math.PI / 1.1);
    faceCylGeo.scale(1.2, 1.1, 1.0);
    const faceCylMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.35 });
    const faceCyl = new THREE.Mesh(faceCylGeo, faceCylMat);
    biometricGroup.add(faceCyl);

    // 68 Landmark Points
    const bioPtsGeo = new THREE.BufferGeometry();
    const bioPos = new Float32Array(68 * 3);
    for (let i = 0; i < 68; i++) {
      const u = (i / 68) * Math.PI * 2;
      bioPos[i * 3] = Math.cos(u) * (1.2 + Math.sin(i * 3) * 0.2);
      bioPos[i * 3 + 1] = (i / 68 - 0.5) * 2.8;
      bioPos[i * 3 + 2] = Math.sin(u) * 0.8 + 0.4;
    }
    bioPtsGeo.setAttribute('position', new THREE.BufferAttribute(bioPos, 3));
    const bioPtsMat = new THREE.PointsMaterial({ size: 0.14, color: 0xff7a24 });
    const bioPts = new THREE.Points(bioPtsGeo, bioPtsMat);
    biometricGroup.add(bioPts);

    // Scanning laser line
    const laserGeo = new THREE.BoxGeometry(4.2, 0.03, 0.03);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85 });
    const laserLine = new THREE.Mesh(laserGeo, laserMat);
    laserLine.position.z = 1.4;
    biometricGroup.add(laserLine);

    // GROUP 3: ELA TERRAIN
    const elaGroup = new THREE.Group();
    elaGroup.visible = false;
    scene.add(elaGroup);

    const terrainGeo = new THREE.PlaneGeometry(6, 6, 36, 36);
    terrainGeo.rotateX(-Math.PI / 2);
    const tPos = terrainGeo.attributes.position;
    for (let i = 0; i < tPos.count; i++) {
      const x = tPos.getX(i);
      const z = tPos.getZ(i);
      const elevation = Math.sin(x * 3) * Math.cos(z * 3) * 0.35 + Math.exp(-((x - 1) ** 2 + z ** 2) * 2) * 1.5;
      tPos.setY(i, elevation);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      roughness: 0.2,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.3,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    elaGroup.add(terrainMesh);

    // GROUP 4: PROVENANCE CHAIN
    const provenanceGroup = new THREE.Group();
    provenanceGroup.visible = false;
    scene.add(provenanceGroup);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const bGeo = new THREE.BoxGeometry(0.8, 0.5, 0.4);
      const bMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x00e5ff : 0xff7a24,
        emissive: i === 0 ? 0x00e5ff : 0xff7a24,
        emissiveIntensity: 0.4,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(Math.cos(angle) * 3.4, Math.sin(angle * 2) * 0.3, Math.sin(angle) * 3.4);
      bMesh.rotation.y = -angle;
      provenanceGroup.add(bMesh);
    }

    // GROUP 5: THREAT GYROSCOPE
    const threatGroup = new THREE.Group();
    threatGroup.visible = false;
    scene.add(threatGroup);

    const threatGeo = new THREE.IcosahedronGeometry(2.1, 1);
    const threatMat = new THREE.MeshStandardMaterial({
      color: 0xff7a24,
      wireframe: true,
      emissive: 0xff7a24,
      emissiveIntensity: 0.4,
    });
    const threatMesh = new THREE.Mesh(threatGeo, threatMat);
    threatGroup.add(threatMesh);

    // 6. Interactive Drag, Mouse Wheel Zoom & Mouse Parallax
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let normMouseX = 0;
    let normMouseY = 0;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      normMouseX = ((e.clientX - rect.left) / width) * 2 - 1;
      normMouseY = -(((e.clientY - rect.top) / height) * 2 - 1);

      setMouseCoords({
        x: parseFloat((e.clientX * 0.5).toFixed(1)),
        y: parseFloat((e.clientY * 0.5).toFixed(1)),
      });

      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      coreGroup.rotation.y += deltaX * 0.01;
      biometricGroup.rotation.y += deltaX * 0.01;
      elaGroup.rotation.y += deltaX * 0.01;
      provenanceGroup.rotation.y += deltaX * 0.01;
      threatGroup.rotation.y += deltaX * 0.01;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      camera.position.z += e.deltaY * 0.007;
      camera.position.z = Math.max(6.0, Math.min(22.0, camera.position.z));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: true });

    // Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight || 700;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Dynamic camera parallax with camera presets
      const preset = cameraPresetRef.current;
      let targetX = normMouseX * 2.2;
      let targetY = normMouseY * 1.2 + 2.5;
      let targetZ = 11;

      if (preset === 'top') {
        targetX = normMouseX * 1.5;
        targetY = 13.5;
        targetZ = normMouseY * 1.5 + 0.1;
      } else if (preset === 'macro') {
        targetX = normMouseX * 0.9;
        targetY = normMouseY * 0.6 + 0.6;
        targetZ = 4.8;
      } else if (preset === 'cinematic') {
        targetX = Math.sin(elapsed * 0.35) * 8.5;
        targetY = 3.6 + Math.cos(elapsed * 0.25) * 1.6;
        targetZ = Math.cos(elapsed * 0.35) * 8.5;
      }

      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.position.z += (targetZ - camera.position.z) * 0.05;
      camera.lookAt(0, 0, 0);

      // Mode toggling visibility
      const curMode = activeModeRef.current;
      coreGroup.visible = curMode === 'core';
      biometricGroup.visible = curMode === 'biometric';
      elaGroup.visible = curMode === 'ela';
      provenanceGroup.visible = curMode === 'provenance';
      threatGroup.visible = curMode === 'threat';

      // Rotations
      if (!isDragging) {
        particleMesh.rotation.y = elapsed * 0.02;
        grid.position.z = (elapsed * 1.5) % 2.5;

        if (curMode === 'core') {
          coreGroup.rotation.y += delta * 0.35;
          coreRing1.rotation.z += delta * 0.2;
          coreRing2.rotation.z -= delta * 0.25;
        } else if (curMode === 'biometric') {
          biometricGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.3;
          laserLine.position.y = Math.sin(elapsed * 2.4) * 1.8;
        } else if (curMode === 'ela') {
          elaGroup.rotation.y += delta * 0.3;
        } else if (curMode === 'provenance') {
          provenanceGroup.rotation.y += delta * 0.4;
        } else if (curMode === 'threat') {
          threatGroup.rotation.y += delta * 0.45;
          threatGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.2;
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
      particleGeo.dispose();
      particleMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
    };
  }, []);

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-between items-center bg-black overflow-hidden select-none border-b border-cyan-500/30">
      {/* Dynamic Scanline & Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,229,255,0.14)_0%,rgba(0,0,0,0.95)_75%,#000000_100%)] pointer-events-none" />

      {/* Top Floating Tactical HUD Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-6 z-30 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block shadow-sm shadow-cyan-400" />
            <span className="font-bold">3D FORENSIC COMMAND HOLODECK</span>
          </span>
          <span className="hidden md:inline text-gray-500">
            COORDS: X:{mouseCoords.x} Y:{mouseCoords.y} Z:0.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900 border border-gray-700 text-gray-300 hover:text-cyan-300 hover:border-cyan-500 transition-colors"
            title="Toggle Sci-Fi Audio Synthesizer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="text-[11px]">{isMuted ? 'AUDIO MUTED' : 'AUDIO SYNTH: ON'}</span>
          </button>

          <button
            onClick={() => {
              setIsTourActive(!isTourActive);
              soundManager.playModeSwitch();
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg ${
              isTourActive
                ? 'bg-orange-600 text-white border border-orange-400 shadow-orange-600/40 animate-pulse'
                : 'bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:brightness-110 shadow-orange-600/20'
            }`}
          >
            {isTourActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isTourActive ? 'PAUSE JUDGE TOUR' : 'START 120s JUDGE TOUR'}</span>
          </button>
        </div>
      </div>

      {/* Main Headline & Tactical Slogan */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 pt-6 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-950/40 border border-orange-500/40 text-xs text-orange-200 mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(255,122,36,0.3)]">
          <span className="bg-white text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
            HACKATHON BUILD
          </span>
          <span className="font-semibold tracking-wide">Autonomous AI Digital Forensics Suite</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-wide text-white mb-4 uppercase"
          style={{ fontFamily: "'Anta', sans-serif" }}
        >
          <span className="block opacity-95">BEYOND TRUST.</span>
          <span className="block font-medium bg-gradient-to-r from-amber-200 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,122,36,0.5)]">
            BEYOND DOUBT.
          </span>
        </h1>

        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6 font-mono">
          Continuous mathematical verification against deepfakes, synthetic identities, and document tampering.
        </p>

        {/* 5-Mode 3D Holodeck Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 font-mono text-xs">
          {[
            { id: 'core', label: '01. INTEGRITY CORE', icon: Activity },
            { id: 'biometric', label: '02. BIOMETRIC MESH', icon: Scan },
            { id: 'ela', label: '03. SPECTRAL ELA', icon: Layers },
            { id: 'provenance', label: '04. PROVENANCE CHAIN', icon: Fingerprint },
            { id: 'threat', label: '05. THREAT GYROSCOPE', icon: Brain },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleModeChange(tab.id as HolodeckMode)}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeMode === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/80 shadow-[0_0_15px_rgba(0,229,255,0.3)] font-bold scale-105'
                  : 'bg-gray-950/70 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Holodeck Canvas Viewport with Corner Crosshairs */}
      <div
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 bg-[#03060a]/98 backdrop-blur-3xl flex flex-col justify-between p-6 select-none'
            : 'relative w-full max-w-7xl h-[660px] lg:h-[740px] mx-auto flex items-center justify-center select-none overflow-hidden my-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0a121e]/90 via-[#060a12]/95 to-black shadow-[0_0_80px_rgba(0,229,255,0.18)]'
        }
      >
        {/* Floating Top Viewport Controls: Camera Presets & Maximize Button */}
        <div className="absolute top-4 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
          {/* Left: Reticle or Fullscreen Badge */}
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-mono text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{isFullscreen ? '[CYBERDECK FULLSCREEN ENGAGED]' : '[+] RETICLE: 3D_FORENSIC_TRACKER'}</span>
            </span>
          </div>

          {/* Center: Camera Presets Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md text-[11px] font-mono text-gray-400">
            <span className="px-2 text-gray-500 flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>CAM:</span>
            </span>
            {[
              { id: 'orbit', label: '360° ORBIT' },
              { id: 'top', label: 'TOP NADIR' },
              { id: 'macro', label: 'MACRO' },
              { id: 'cinematic', label: 'CINEMATIC' },
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => handleCameraChange(cam.id as CameraPreset)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  cameraPreset === cam.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-bold'
                    : 'hover:text-white'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Right: Maximize Cyberdeck Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]"
              title="Expand to Fullscreen Cyberdeck Viewport"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>RESTORE (ESC)</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>MAXIMIZE 3D CYBERDECK</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Tactical Info Overlay */}
        <div className="absolute bottom-4 left-6 pointer-events-none text-gray-400 font-mono text-[11px] flex items-center gap-3">
          <span>[+] DRAG MOUSE TO ROTATE 360° // SCROLL TO ZOOM</span>
        </div>
        <div className="absolute bottom-4 right-6 pointer-events-none text-cyan-400 font-mono text-[11px] text-right">
          LATENCY: 12ms // 60 FPS // SHA-256 VAULT [+]
        </div>

        {/* Real Three.js Canvas Container */}
        <div
          ref={mountRef}
          className="w-full h-full relative cursor-grab active:cursor-grabbing"
        />

        {/* Floating Holographic Telemetry Card if Autopilot is Active */}
        {isTourActive && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl p-4 rounded-2xl bg-gray-950/90 border border-orange-500/60 backdrop-blur-xl shadow-2xl shadow-orange-950/80 animate-fade-in z-30">
            <div className="text-[11px] font-mono text-orange-400 font-bold uppercase mb-1">
              {tourScripts[tourStep].title}
            </div>
            <p className="text-xs text-gray-200 italic leading-relaxed">
              &ldquo;{tourScripts[tourStep].script}&rdquo;
            </p>
          </div>
        )}

        {/* Floating Real-Time Attack Verdict Card if Active */}
        {inspectionVerdict && (
          <div className="absolute top-16 right-8 w-80 p-4 rounded-2xl bg-gray-950/95 border border-red-500/60 backdrop-blur-xl shadow-2xl shadow-red-950/80 animate-fade-in z-30 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2">
              <span className="text-red-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{inspectionVerdict.verdict}</span>
              </span>
              <button
                onClick={() => setInspectionVerdict(null)}
                className="text-gray-500 hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="text-gray-300 font-bold text-sm mb-1">{inspectionVerdict.filename}</div>
            <div className="text-[11px] text-emerald-400 mb-2">{inspectionVerdict.confidence}</div>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
              {inspectionVerdict.details}
            </p>
            <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 truncate max-w-[140px]">
                {inspectionVerdict.sha256}
              </span>
              <Link
                href="/app/history"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <span>DOSSIER</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sample Ingestion Bar & CTAs */}
      <div className="w-full max-w-6xl mx-auto px-6 pb-8 z-20 flex flex-col items-center gap-4">
        {/* Sample Attack Vector Quick Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
          <span className="text-gray-500 text-[11px] mr-1 hidden sm:inline">ADVERSARIAL ATTACK TEST SAMPLES:</span>
          {sampleAttacks.map((attack) => (
            <button
              key={attack.id}
              onClick={() => handleTriggerSample(attack)}
              className="px-3 py-1.5 rounded-lg bg-gray-900/80 hover:bg-red-950/40 border border-gray-800 hover:border-red-500/50 text-gray-300 hover:text-red-300 transition-all flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span>{attack.name}</span>
            </button>
          ))}
        </div>

        {/* Global CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          <Link
            href="/app/dashboard"
            className="btn-primary px-8 py-3.5 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/30 bg-gradient-to-r from-cyan-500 to-teal-400 text-black rounded-xl font-bold"
          >
            <span>LAUNCH FULL PLATFORM</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {onQuickLogin && (
            <button
              onClick={onQuickLogin}
              disabled={isLoggingIn}
              className="px-6 py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>{isLoggingIn ? 'AUTHENTICATING...' : '1-CLICK LEAD INVESTIGATOR LOGIN'}</span>
            </button>
          )}

          <a
            href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
            download
            className="px-6 py-3.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-mono font-semibold flex items-center gap-2 transition-colors"
          >
            <span>DOWNLOAD PITCH PDF</span>
          </a>
        </div>
      </div>
    </section>
  );
}
