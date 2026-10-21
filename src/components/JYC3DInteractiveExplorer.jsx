import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './JYC3DInteractiveExplorer.css';

const HUBS = [
  { id: 'cicr', name: 'CICR', family: 'Technical', role: 'Robotics, IoT & Automation', color: '#38bdf8', icon: '🤖', x: -145, y: -55, z: 45, members: '120+ Active', highlight: 'National Robowars & Autonomous Drones' },
  { id: 'osdc', name: 'OSDC', family: 'Technical', role: 'Open Source & Dev Ecosystem', color: '#06b6d4', icon: '💻', x: -115, y: 75, z: -45, members: '250+ Devs', highlight: 'Open Source Hackathons & Git Workshops' },
  { id: 'dronotics', name: 'Dronotics', family: 'Technical', role: 'UAV & Aerial Robotics', color: '#0ea5e9', icon: '🛸', x: -175, y: 25, z: 25, members: '80+ Pilots', highlight: 'Dron-O-War Championship & Quad Racing' },
  { id: 'fortissimo', name: 'Fortissimo', family: 'Cultural', role: 'Music & Campus Live Bands', color: '#f43f5e', icon: '🎸', x: 135, y: -75, z: 55, members: '65+ Musicians', highlight: 'Battle of the Bands & Acoustic Jams' },
  { id: 'vamunique', name: 'VamUnique', family: 'Cultural', role: 'Western, Hip-Hop & Classical Dance', color: '#ec4899', icon: '💃', x: 165, y: 35, z: -35, members: '90+ Dancers', highlight: 'Inter-College Dance Trophies & Flashmobs' },
  { id: 'panache', name: 'Panache', family: 'Cultural', role: 'Fashion & Haute Couture Runway', color: '#fb7185', icon: '✨', x: 125, y: 95, z: 45, members: '50+ Models', highlight: 'Converge Runway Night & Style Showcases' },
  { id: 'abhivyakti', name: 'Abhivyakti', family: 'Cultural', role: 'Dramatics & Street Theatre', color: '#d946ef', icon: '🎭', x: 95, y: -25, z: -65, members: '70+ Actors', highlight: 'Award-winning Nukkad Natak & Stage Plays' },
  { id: 'aura', name: 'Aura', family: 'Creative', role: 'Photography & Visual Cinematography', color: '#f59e0b', icon: '📷', x: -25, y: -135, z: -45, members: '60+ Creators', highlight: 'Official Campus Media & Street Photo Walks' },
  { id: 'aakriti', name: 'Aakriti', family: 'Creative', role: 'Fine Arts & Stage Installations', color: '#eab308', icon: '🎨', x: 45, y: -125, z: 45, members: '85+ Artists', highlight: 'Fest Set Design, Live Murals & Craft Art' },
  { id: 'eloquence', name: 'Eloquence', family: 'Literary', role: 'Debate, MUN & Literary Arts', color: '#10b981', icon: '🖋️', x: -45, y: 135, z: 35, members: '75+ Orators', highlight: 'Grand Conclave MUN & Youth Parliamentary' },
  { id: 'jsa', name: 'JSA Sports', family: 'Sports', role: 'Athletics, Football, Cricket & Esports', color: '#84cc16', icon: '🏆', x: 35, y: 145, z: -45, members: '300+ Athletes', highlight: 'Kshitij Annual Sports Tournament' }
];

export function JYC3DInteractiveExplorer() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const nav = useNavigate();
  const [selectedHub, setSelectedHub] = useState(HUBS[0]);
  const [activeFamily, setActiveFamily] = useState('ALL');
  const [rotX, setRotX] = useState(0.22);
  const [rotY, setRotY] = useState(0.48);
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const filteredHubs = useMemo(() => {
    if (activeFamily === 'ALL') return HUBS;
    return HUBS.filter(h => h.family.toUpperCase() === activeFamily);
  }, [activeFamily]);

  // 3D Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let currentRotX = rotX;
    let currentRotY = rotY;
    let currentZoom = zoom;
    let time = 0;

    // Moving energy pulse packets along lines
    const pulses = Array.from({ length: 14 }, (_, i) => ({
      from: i % HUBS.length,
      to: (i + 3) % HUBS.length,
      progress: (i * 0.15) % 1,
      speed: 0.006 + Math.random() * 0.005
    }));

    // Orbiting satellite micro-particles
    const satellites = HUBS.map((_, i) => ({
      angle: (i * Math.PI) / 3,
      speed: 0.035 + (i % 3) * 0.015,
      dist: 18 + (i % 3) * 4
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = Math.round(rect.width * dpr);
      height = canvas.height = Math.round(rect.height * dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let isVisible = true;
    const handleVis = () => {
      isVisible = !document.hidden;
      if (isVisible && !animId) animId = requestAnimationFrame(render);
    };
    document.addEventListener('visibilitychange', handleVis);

    const render = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      time += 0.016;

      // Auto-rotation with momentum
      if (!isDragging) {
        setRotY(r => r + 0.0028);
      }
      currentRotX += (rotX - currentRotX) * 0.12;
      currentRotY += (rotY - currentRotY) * 0.12;
      currentZoom += (zoom - currentZoom) * 0.15;

      ctx.clearRect(0, 0, width, height);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cx = width / 2;
      const cy = height / 2;
      const fov = 420 * dpr * currentZoom;

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

      // 1. Draw 3D Space Background Aura & Radial Depth Grid
      const bgGrad = ctx.createRadialGradient(cx, cy, 20 * dpr, cx, cy, Math.max(width, height) * 0.55);
      if (isDark) {
        bgGrad.addColorStop(0, 'rgba(56, 189, 248, 0.07)');
        bgGrad.addColorStop(0.5, 'rgba(147, 51, 234, 0.035)');
        bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        bgGrad.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
        bgGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.04)');
        bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Transform nodes into 3D camera coordinates
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);
      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);

      // 2. Draw 3D Perspective Orbital Concentric Rings
      const ringRadii = [105, 165, 225];
      ringRadii.forEach((r, idx) => {
        ctx.beginPath();
        const steps = 48;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          const rx = Math.cos(theta) * r;
          const rz = Math.sin(theta) * r;
          const ry = Math.sin(theta * 2 + time * 0.5) * 6;

          let x1 = rx * cosY - rz * sinY;
          let z1 = rz * cosY + rx * sinY;
          let y2 = ry * cosX - z1 * sinX;
          let z2 = z1 * cosX + ry * sinX;

          const scale = fov / Math.max(80, z2 + 300);
          const px = cx + x1 * scale;
          const py = cy + y2 * scale;

          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = isDark
          ? `rgba(56, 189, 248, ${0.08 - idx * 0.02})`
          : `rgba(184, 134, 11, ${0.14 - idx * 0.03})`;
        ctx.lineWidth = 1 * dpr;
        ctx.setLineDash([4 * dpr, 6 * dpr]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 3. Project Hub Nodes
      const projected = filteredHubs.map((hub, idx) => {
        let x1 = hub.x * cosY - hub.z * sinY;
        let z1 = hub.z * cosY + hub.x * sinY;
        let y2 = hub.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + hub.y * sinX;

        const depth = z2 + 300;
        const scale = fov / Math.max(80, depth);
        const px = cx + x1 * scale * 0.95;
        const py = cy + y2 * scale * 0.95;

        return {
          ...hub,
          idx,
          px,
          py,
          depth,
          scale,
          isSelected: selectedHub?.id === hub.id
        };
      });

      // Sort back-to-front for proper 3D layering
      projected.sort((a, b) => b.depth - a.depth);

      // 4. Draw 3D Constellation Laser Beams with Travelling Energy Pulses
      ctx.lineWidth = 1.2 * dpr;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dist3D = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
          if (dist3D < 195) {
            const alpha = Math.max(0.06, (1 - dist3D / 195) * (isDark ? 0.38 : 0.45));
            const beamGrad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
            beamGrad.addColorStop(0, `${a.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
            beamGrad.addColorStop(1, `${b.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);

            ctx.strokeStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.stroke();
          }
        }
      }

      // 5. Draw Central Pulsar Core (JYC Sector 128 Sun)
      const sunPulse = Math.sin(time * 3) * 3 * dpr;
      const sunRadius = (10 * dpr) + sunPulse;
      const sunGlow = ctx.createRadialGradient(cx, cy, 2 * dpr, cx, cy, sunRadius * 3);
      sunGlow.addColorStop(0, isDark ? '#ffd700' : '#b8860b');
      sunGlow.addColorStop(0.4, isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(184, 134, 11, 0.4)');
      sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, sunRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isDark ? '#ffffff' : '#ffd700';
      ctx.beginPath();
      ctx.arc(cx, cy, sunRadius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Core Label
      ctx.fillStyle = isDark ? 'rgba(255, 215, 0, 0.9)' : 'rgba(153, 101, 21, 0.95)';
      ctx.font = `700 ${Math.max(9, 10 * dpr)}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('JYC · 128', cx, cy + sunRadius * 2.8);

      // 6. Draw Nodes with Atmospheric Planetary Glow & Orbiting Satellites
      projected.forEach(node => {
        const radius = (node.isSelected ? 13 : 8.5) * dpr;

        // Targeted Reticle for Selected Node
        if (node.isSelected) {
          const reticleRadius = radius * 2.4;
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath();
          ctx.arc(node.px, node.py, reticleRadius, time * 2, time * 2 + Math.PI * 1.5);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(node.px, node.py, reticleRadius + 4 * dpr, -time * 1.5, -time * 1.5 + Math.PI);
          ctx.stroke();
        }

        // Multi-layered Planetary Glow Halo
        const haloGrad = ctx.createRadialGradient(node.px, node.py, radius * 0.5, node.px, node.py, radius * 2.2);
        haloGrad.addColorStop(0, `${node.color}${node.isSelected ? '88' : '44'}`);
        haloGrad.addColorStop(1, `${node.color}00`);
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Node Sphere with Specular Highlight
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = (node.isSelected ? 24 : 12) * dpr;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Specular 3D Highlight
        ctx.beginPath();
        ctx.arc(node.px - radius * 0.3, node.py - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        // Orbiting Satellite Particle
        const sat = satellites[node.idx % satellites.length];
        sat.angle += sat.speed;
        const satX = node.px + Math.cos(sat.angle) * (sat.dist * dpr);
        const satY = node.py + Math.sin(sat.angle) * (sat.dist * 0.6 * dpr);

        ctx.beginPath();
        ctx.arc(satX, satY, 1.8 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#ffffff' : node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 6 * dpr;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Label Pill
        const fontSize = Math.max(9, (node.isSelected ? 12 : 10.5) * dpr);
        ctx.font = `${node.isSelected ? '700' : '600'} ${fontSize}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center';

        const labelText = node.name;
        const textWidth = ctx.measureText(labelText).width;
        const badgeY = node.py + radius + 15 * dpr;

        // Label pill background
        ctx.fillStyle = isDark
          ? (node.isSelected ? 'rgba(14, 21, 38, 0.95)' : 'rgba(10, 13, 22, 0.82)')
          : (node.isSelected ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 250, 240, 0.92)');
        ctx.strokeStyle = node.isSelected ? node.color : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(180,130,60,0.2)');
        ctx.lineWidth = 1 * dpr;

        ctx.beginPath();
        ctx.roundRect(node.px - textWidth / 2 - 8 * dpr, badgeY - fontSize * 0.85, textWidth + 16 * dpr, fontSize + 8 * dpr, 6 * dpr);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDark ? (node.isSelected ? '#ffffff' : '#cbd5e1') : (node.isSelected ? '#0f172a' : '#334155');
        ctx.fillText(labelText, node.px, badgeY);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [filteredHubs, rotX, rotY, zoom, selectedHub, isDragging]);

  // Pointer interactions for dragging in 3D
  const handlePointerDown = e => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = e => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotY(r => r + dx * 0.007);
    setRotX(r => Math.max(-0.85, Math.min(0.85, r - dy * 0.007)));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = e => {
    e.preventDefault();
    setZoom(z => Math.max(0.65, Math.min(1.6, z - e.deltaY * 0.001)));
  };

  // Click on Canvas to pick closest node
  const handleCanvasClick = e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const clickX = (e.clientX - rect.left) * dpr;
    const clickY = (e.clientY - rect.top) * dpr;

    let closest = null;
    let minDist = 42 * dpr;

    filteredHubs.forEach(hub => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      let x1 = hub.x * cosY - hub.z * sinY;
      let z1 = hub.z * cosY + hub.x * sinY;
      let y2 = hub.y * cosX - z1 * sinX;
      let z2 = z1 * cosX + hub.y * sinX;

      const fov = 420 * dpr * zoom;
      const scale = fov / Math.max(80, z2 + 300);
      const px = (canvas.width / 2) + x1 * scale * 0.95;
      const py = (canvas.height / 2) + y2 * scale * 0.95;

      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist < minDist) {
        minDist = dist;
        closest = hub;
      }
    });

    if (closest) {
      setSelectedHub(closest);
    }
  };

  const FAMILIES = ['ALL', 'TECHNICAL', 'CULTURAL', 'CREATIVE', 'LITERARY', 'SPORTS'];

  return (
    <section className="jyc-3d-explorer-section reveal" aria-labelledby="jyc-3d-title">
      <div className="jyc-3d-header">
        <div className="jyc-3d-title-group">
          <div className="jyc-3d-cyber-tag">
            <span className="cyber-pulse-dot" />
            <span>INTERACTIVE WEBGL TOPOLOGY · SECTOR 128 CLUSTERS</span>
          </div>
          <h2 id="jyc-3d-title">
            Explore the JYC Constellation.<br />
            <em className="title-gold-gradient">In 3D Digital Space.</em>
          </h2>
          <p>
            An interactive 3D digital topology of JIIT-128 student societies, technical hubs, cultural troops and athletic programs. Rotate the cluster, zoom, and inspect any community.
          </p>
        </div>

        {/* Family Filter Tabs */}
        <div className="jyc-3d-family-tabs" role="tablist">
          {FAMILIES.map(fam => (
            <button
              key={fam}
              type="button"
              className={`jyc-3d-tab ${activeFamily === fam ? 'active' : ''}`}
              onClick={() => setActiveFamily(fam)}
            >
              {fam}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="jyc-3d-stage-wrapper"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      >
        {/* WebGL Canvas */}
        <canvas ref={canvasRef} className="jyc-3d-canvas" />

        {/* Top Controls: Drag Hint & Zoom */}
        <div className="jyc-3d-top-controls">
          <div className="jyc-3d-drag-hint">
            <span>⤹ Drag to rotate · Scroll to zoom · Click node to lock</span>
          </div>
          <div className="jyc-3d-zoom-btns" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setZoom(z => Math.min(1.6, z + 0.15))} title="Zoom In">+</button>
            <button type="button" onClick={() => setZoom(z => Math.max(0.65, z - 0.15))} title="Zoom Out">−</button>
            <button type="button" onClick={() => { setZoom(1.0); setRotX(0.22); setRotY(0.48); }} title="Reset View">↺</button>
          </div>
        </div>

        {/* Active Node Holographic HUD Card */}
        {selectedHub && (
          <div className="jyc-3d-hud-card" onClick={e => e.stopPropagation()} style={{ '--hud-color': selectedHub.color }}>
            <div className="hud-card-accent-bar" />
            <div className="hud-header">
              <span className="hud-icon">{selectedHub.icon}</span>
              <div>
                <span className="hud-family">{selectedHub.family} FAMILY · {selectedHub.members}</span>
                <h3 className="hud-name">{selectedHub.name}</h3>
              </div>
            </div>
            <p className="hud-role">{selectedHub.role}</p>
            <div className="hud-highlight-tag">
              <span className="hud-tag-icon">⚡</span>
              <span>{selectedHub.highlight}</span>
            </div>
            <div className="hud-actions">
              <button
                type="button"
                className="hud-btn-primary"
                onClick={() => nav(`/clubs/${selectedHub.id}`)}
              >
                View Society Profile ↗
              </button>
              <button
                type="button"
                className="hud-btn-secondary"
                onClick={() => nav('/events')}
              >
                Events
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
