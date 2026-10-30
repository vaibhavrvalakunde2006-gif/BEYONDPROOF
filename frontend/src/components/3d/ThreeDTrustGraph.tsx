'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GraphNode, GraphEdge } from '@/lib/types';
import { RotateCcw, ZoomIn, ZoomOut, Info } from 'lucide-react';

interface ThreeDTrustGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNode | null) => void;
  selectedNodeId?: string;
}

export function ThreeDTrustGraph({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
}: ThreeDTrustGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 550;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 5, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00e5ff, 2, 50);
    pointLight.position.set(10, 15, 15);
    scene.add(pointLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 2, 50);
    violetLight.position.set(-10, -10, 10);
    scene.add(violetLight);

    // 3. Node Position Layout in 3D Space
    const nodeMeshes = new Map<string, THREE.Mesh>();
    const nodeDataMap = new Map<string, GraphNode>();
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    // Color definitions
    const getNodeColor = (type: string) => {
      switch (type) {
        case 'file':
          return 0x8b5cf6; // Violet
        case 'user':
          return 0x00e5ff; // Cyan
        case 'verification':
          return 0x30d69a; // Emerald
        case 'fingerprint':
          return 0xffb547; // Amber
        case 'finding':
          return 0xff4560; // Red
        default:
          return 0x367bff; // Forensic Blue
      }
    };

    // Layout nodes in a spherical/force cluster
    const N = Math.max(nodes.length, 1);
    nodes.forEach((node, i) => {
      nodeDataMap.set(node.id, node);

      // Fibonacci sphere distribution for harmonious 3D positions
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const radius = 7.5 + (i % 3) * 1.5;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi) * 0.75;
      const z = radius * Math.sin(phi) * Math.sin(theta);

      // Sphere geometry
      const isSelected = node.id === selectedNodeId;
      const nodeRadius = isSelected ? 0.85 : 0.65;
      const geo = new THREE.SphereGeometry(nodeRadius, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: getNodeColor(node.node_type),
        emissive: getNodeColor(node.node_type),
        emissiveIntensity: isSelected ? 0.6 : 0.25,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { id: node.id };
      nodeGroup.add(mesh);
      nodeMeshes.set(node.id, mesh);

      // Outer glow aura
      const haloGeo = new THREE.SphereGeometry(nodeRadius * 1.35, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: getNodeColor(node.node_type),
        transparent: true,
        opacity: isSelected ? 0.35 : 0.15,
        wireframe: true,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      mesh.add(halo);
    });

    // 4. Edges and Connections
    const edgeGroup = new THREE.Group();
    scene.add(edgeGroup);
    const pulsePackets: Array<{ mesh: THREE.Mesh; start: THREE.Vector3; end: THREE.Vector3; progress: number }> = [];

    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x367bff,
      transparent: true,
      opacity: 0.35,
    });

    const activeEdgeLineMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.85,
    });

    edges.forEach((edge) => {
      const srcMesh = nodeMeshes.get(edge.source);
      const tgtMesh = nodeMeshes.get(edge.target);
      if (srcMesh && tgtMesh) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([srcMesh.position, tgtMesh.position]);
        const isConnected = edge.source === selectedNodeId || edge.target === selectedNodeId;
        const line = new THREE.Line(lineGeo, isConnected ? activeEdgeLineMat : edgeLineMat);
        edgeGroup.add(line);

        // Animated pulse packet traveling between nodes
        const packetGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const packetMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
        const packet = new THREE.Mesh(packetGeo, packetMat);
        edgeGroup.add(packet);
        pulsePackets.push({
          mesh: packet,
          start: srcMesh.position,
          end: tgtMesh.position,
          progress: Math.random(),
        });
      }
    });

    // 5. Camera Controls (Orbit & Drag)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetGroupRotY = 0;
    let targetGroupRotX = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetGroupRotY += deltaX * 0.005;
        targetGroupRotX += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }

      // Raycast for hover
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const id = hit.userData.id;
        const node = nodeDataMap.get(id);
        if (node) {
          setHoveredNode(node);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredNode(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const id = hit.userData.id;
        const node = nodeDataMap.get(id);
        if (node) {
          onSelectNode(node);
        }
      } else {
        onSelectNode(null);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.02, 10, 40);
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('click', handleClick);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 6. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth rotate
      if (!isDragging) {
        targetGroupRotY += 0.0015;
      }
      nodeGroup.rotation.y += (targetGroupRotY - nodeGroup.rotation.y) * 0.08;
      nodeGroup.rotation.x += (targetGroupRotX - nodeGroup.rotation.x) * 0.08;
      edgeGroup.rotation.y = nodeGroup.rotation.y;
      edgeGroup.rotation.x = nodeGroup.rotation.x;

      // Update pulse packets along edges
      pulsePackets.forEach((p) => {
        p.progress += delta * 0.45;
        if (p.progress > 1) p.progress = 0;
        p.mesh.position.lerpVectors(p.start, p.end, p.progress);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 550;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [nodes, edges, selectedNodeId, onSelectNode]);

  return (
    <div className="relative w-full h-[550px] bg-black/80 rounded-2xl border border-gray-800/80 overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Controls Overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-950/80 border border-gray-800 rounded-lg p-1.5 backdrop-blur-md">
        <div className="text-[10px] font-mono text-cyan-400 px-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>3D SPATIAL GRAPH</span>
        </div>
      </div>

      {/* Hover Info Tooltip Preview */}
      {hoveredNode && (
        <div className="absolute bottom-6 left-6 max-w-sm p-4 rounded-xl bg-gray-950/90 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(0,229,255,0.25)] pointer-events-none z-20">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">
              {hoveredNode.node_type} NODE
            </span>
          </div>
          <div className="text-sm font-bold text-white truncate">{hoveredNode.label}</div>
          {hoveredNode.properties && (
            <div className="mt-2 text-xs font-mono text-gray-400 space-y-0.5">
              {Object.entries(hoveredNode.properties).slice(0, 3).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-gray-500">{k}:</span>
                  <span className="text-gray-300 truncate max-w-[150px]">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 text-[10px] text-cyan-400/80 font-mono">
            Click node to view full forensic evidence
          </div>
        </div>
      )}
    </div>
  );
}
