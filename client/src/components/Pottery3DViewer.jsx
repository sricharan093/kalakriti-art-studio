import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, RefreshCw, Eye, Sparkles } from 'lucide-react';

// Authentic glaze visual configuration keyed to seed data glaze IDs
export const GLAZE_MATERIALS = {
  'g-01': {
    name: 'Kumkum Red',
    color: '#9E2424',
    roughness: 0.18,
    metalness: 0.05,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    description: 'Vibrant ritual vermilion with brilliant glossy depth'
  },
  'g-02': {
    name: 'Haldi Yellow',
    color: '#D49520',
    roughness: 0.22,
    metalness: 0.05,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15,
    description: 'Warm auspicious turmeric ochre with rich honeyed luster'
  },
  'g-03': {
    name: 'Mehendi Green',
    color: '#3B6344',
    roughness: 0.25,
    metalness: 0.04,
    clearcoat: 0.8,
    clearcoatRoughness: 0.18,
    description: 'Deep herbal botanical olive with earthy semi-satin sheen'
  },
  'g-04': {
    name: 'Indigo Blue',
    color: '#214275',
    roughness: 0.16,
    metalness: 0.08,
    clearcoat: 0.95,
    clearcoatRoughness: 0.1,
    description: 'Regal lapis lazuli indigo with deep mirror ceramic glaze'
  },
  'g-05': {
    name: 'Sandalwood Beige',
    color: '#C7AD8C',
    roughness: 0.32,
    metalness: 0.02,
    clearcoat: 0.65,
    clearcoatRoughness: 0.25,
    description: 'Natural soothing sandalwood bisque with tactile satin finish'
  },
  'g-06': {
    name: 'Charcoal Black',
    color: '#221E1C',
    roughness: 0.2,
    metalness: 0.12,
    clearcoat: 0.88,
    clearcoatRoughness: 0.14,
    description: 'Smokey kiln-fired black ceramic with metallic gunmetal reflections'
  }
};

// Procedural geometry builders for the 5 traditional Indian pottery forms
function createPotteryGeometry(itemId) {
  switch (itemId) {
    case 'i-01': {
      // Kulhad: traditional tapered chai cup with flared lip and ribbed grip
      const points = [
        new THREE.Vector2(0, -1.3),
        new THREE.Vector2(0.68, -1.3),
        new THREE.Vector2(0.72, -1.1),
        new THREE.Vector2(0.8, -0.5),
        new THREE.Vector2(0.92, 0.2),
        new THREE.Vector2(1.1, 0.9),
        new THREE.Vector2(1.2, 1.3),
        new THREE.Vector2(1.18, 1.36),
        new THREE.Vector2(1.08, 1.34),
        new THREE.Vector2(1.0, 0.9),
        new THREE.Vector2(0.82, 0.2),
        new THREE.Vector2(0.7, -0.4),
        new THREE.Vector2(0.58, -1.1),
        new THREE.Vector2(0, -1.1)
      ];
      return new THREE.LatheGeometry(points, 48);
    }

    case 'i-02': {
      // Surahi: classic rounded water vessel with tall slender neck and flared opening
      const points = [
        new THREE.Vector2(0, -1.45),
        new THREE.Vector2(0.75, -1.45),
        new THREE.Vector2(0.9, -1.3),
        new THREE.Vector2(1.4, -0.7),
        new THREE.Vector2(1.48, -0.1),
        new THREE.Vector2(1.25, 0.45),
        new THREE.Vector2(0.65, 0.82),
        new THREE.Vector2(0.35, 1.05),
        new THREE.Vector2(0.3, 1.55),
        new THREE.Vector2(0.48, 1.72),
        new THREE.Vector2(0.45, 1.78),
        new THREE.Vector2(0.34, 1.74),
        new THREE.Vector2(0.22, 1.55),
        new THREE.Vector2(0.24, 1.05),
        new THREE.Vector2(0.5, 0.78),
        new THREE.Vector2(1.1, 0.38),
        new THREE.Vector2(1.32, -0.1),
        new THREE.Vector2(1.25, -0.65),
        new THREE.Vector2(0.75, -1.25),
        new THREE.Vector2(0, -1.25)
      ];
      return new THREE.LatheGeometry(points, 56);
    }

    case 'i-03': {
      // Matka: spherical water pot with broad belly, short neck, and rolled rim
      const points = [
        new THREE.Vector2(0, -1.35),
        new THREE.Vector2(0.65, -1.35),
        new THREE.Vector2(1.15, -1.05),
        new THREE.Vector2(1.55, -0.45),
        new THREE.Vector2(1.62, 0.15),
        new THREE.Vector2(1.42, 0.72),
        new THREE.Vector2(0.95, 1.05),
        new THREE.Vector2(0.88, 1.25),
        new THREE.Vector2(1.08, 1.4),
        new THREE.Vector2(1.0, 1.46),
        new THREE.Vector2(0.8, 1.36),
        new THREE.Vector2(0.76, 1.15),
        new THREE.Vector2(0.82, 0.98),
        new THREE.Vector2(1.28, 0.65),
        new THREE.Vector2(1.48, 0.12),
        new THREE.Vector2(1.38, -0.45),
        new THREE.Vector2(1.0, -1.0),
        new THREE.Vector2(0.55, -1.22),
        new THREE.Vector2(0, -1.22)
      ];
      return new THREE.LatheGeometry(points, 56);
    }

    case 'i-04': {
      // Diya Set: multi-wick ceremonial lamp platter
      const points = [
        new THREE.Vector2(0, -0.6),
        new THREE.Vector2(1.8, -0.6),
        new THREE.Vector2(1.9, -0.4),
        new THREE.Vector2(1.95, -0.1),
        new THREE.Vector2(1.85, 0.15),
        new THREE.Vector2(1.6, 0.1),
        new THREE.Vector2(1.4, -0.2),
        new THREE.Vector2(0.6, -0.2),
        new THREE.Vector2(0.55, 0.4),
        new THREE.Vector2(0.7, 0.7),
        new THREE.Vector2(0.62, 0.75),
        new THREE.Vector2(0.45, 0.65),
        new THREE.Vector2(0.38, 0.35),
        new THREE.Vector2(0.3, -0.2),
        new THREE.Vector2(0, -0.2)
      ];
      return new THREE.LatheGeometry(points, 48);
    }

    case 'i-05':
    default: {
      // Gamla: sturdy tapered planter with decorative top collar
      const points = [
        new THREE.Vector2(0, -1.35),
        new THREE.Vector2(0.85, -1.35),
        new THREE.Vector2(0.95, -1.15),
        new THREE.Vector2(1.22, 0.55),
        new THREE.Vector2(1.3, 0.95),
        new THREE.Vector2(1.5, 1.02),
        new THREE.Vector2(1.52, 1.38),
        new THREE.Vector2(1.46, 1.44),
        new THREE.Vector2(1.3, 1.42),
        new THREE.Vector2(1.22, 0.98),
        new THREE.Vector2(1.1, 0.5),
        new THREE.Vector2(0.82, -1.1),
        new THREE.Vector2(0, -1.1)
      ];
      return new THREE.LatheGeometry(points, 48);
    }
  }
}

export const Pottery3DViewer = ({
  itemId = 'i-01',
  glazeId = 'g-01',
  itemName = 'Kulhad',
  glazeName = 'Kumkum Red'
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const vesselMeshRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [webGLAvailable, setWebGLAvailable] = useState(true);

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLAvailable(false);
      }
    } catch {
      setWebGLAvailable(false);
    }
  }, []);

  // Initialize Three.js Studio Scene
  useEffect(() => {
    if (!webGLAvailable || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 400;
    const height = mountRef.current.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 5.2);
    cameraRef.current = camera;

    // Renderer with antialiasing and tone mapping
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL initialization failed:', err);
      setWebGLAvailable(false);
      return;
    }

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.85);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
    mainKeyLight.position.set(4, 5, 4);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    scene.add(mainKeyLight);

    const coolFillLight = new THREE.DirectionalLight(0xddeeff, 0.7);
    coolFillLight.position.set(-4, 3, 2);
    scene.add(coolFillLight);

    const warmRimLight = new THREE.DirectionalLight(0xffd8b0, 1.1);
    warmRimLight.position.set(0, 4, -4);
    scene.add(warmRimLight);

    // Studio Floor Shadow Disc
    const shadowGeo = new THREE.PlaneGeometry(4.2, 4.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x15120e,
      transparent: true,
      opacity: 0.18
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.55;
    scene.add(shadowPlane);

    // Initial Pottery Mesh
    const geo = createPotteryGeometry(itemId);
    const glazeConfig = GLAZE_MATERIALS[glazeId] || GLAZE_MATERIALS['g-01'];
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(glazeConfig.color),
      roughness: glazeConfig.roughness,
      metalness: glazeConfig.metalness,
      clearcoat: glazeConfig.clearcoat,
      clearcoatRoughness: glazeConfig.clearcoatRoughness,
      reflectivity: 0.65
    });

    const vesselMesh = new THREE.Mesh(geo, mat);
    vesselMesh.position.y = 0;
    scene.add(vesselMesh);
    vesselMeshRef.current = vesselMesh;

    // Render loop
    let lastTime = 0;
    const animate = (time) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (autoRotate && vesselMeshRef.current && !isDraggingRef.current) {
        vesselMeshRef.current.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };
    animate(0);

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      geo.dispose();
      mat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
    };
  }, [webGLAvailable]);

  // Update Geometry when itemId changes
  useEffect(() => {
    if (!vesselMeshRef.current) return;
    const newGeo = createPotteryGeometry(itemId);
    const oldGeo = vesselMeshRef.current.geometry;
    vesselMeshRef.current.geometry = newGeo;
    if (oldGeo) oldGeo.dispose();
  }, [itemId]);

  // Update Material when glazeId changes
  useEffect(() => {
    if (!vesselMeshRef.current) return;
    const config = GLAZE_MATERIALS[glazeId] || GLAZE_MATERIALS['g-01'];
    vesselMeshRef.current.material.color.set(config.color);
    vesselMeshRef.current.material.roughness = config.roughness;
    vesselMeshRef.current.material.metalness = config.metalness;
    vesselMeshRef.current.material.clearcoat = config.clearcoat;
    vesselMeshRef.current.material.clearcoatRoughness = config.clearcoatRoughness;
    vesselMeshRef.current.material.needsUpdate = true;
  }, [glazeId]);

  // Mouse & Touch Controls
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = {
      x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
      y: e.clientY || (e.touches && e.touches[0].clientY) || 0
    };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !vesselMeshRef.current) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const deltaX = clientX - previousMousePositionRef.current.x;
    const deltaY = clientY - previousMousePositionRef.current.y;

    vesselMeshRef.current.rotation.y += deltaX * 0.008;
    vesselMeshRef.current.rotation.x = Math.max(
      -0.4,
      Math.min(0.5, vesselMeshRef.current.rotation.x + deltaY * 0.005)
    );

    previousMousePositionRef.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom controls
  const handleZoom = (direction) => {
    if (!cameraRef.current) return;
    const newZ = cameraRef.current.position.z + (direction === 'in' ? -0.5 : 0.5);
    if (newZ >= 2.8 && newZ <= 7.5) {
      cameraRef.current.position.z = newZ;
    }
  };

  // Reset view
  const handleResetView = () => {
    if (vesselMeshRef.current) {
      vesselMeshRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0.8, 5.2);
    }
  };

  const activeGlazeConfig = GLAZE_MATERIALS[glazeId] || GLAZE_MATERIALS['g-01'];

  // Graceful Fallback if WebGL unavailable
  if (!webGLAvailable) {
    return (
      <div className="pottery-3d-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: activeGlazeConfig.color, marginBottom: '1rem', border: '3px solid #FFFFFF', boxShadow: 'var(--shadow-md)' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{itemName}</h3>
        <span className="badge badge-available" style={{ marginBottom: '0.75rem' }}>
          Glaze: {glazeName}
        </span>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', maxWidth: '280px' }}>
          Interactive 3D preview is in static mode. Your pottery request and glaze selection remain fully functional.
        </p>
      </div>
    );
  }

  return (
    <div
      className="pottery-3d-wrapper"
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
      title="Click and drag to rotate the ceramic vessel in 3D"
    >
      {/* 3D Canvas Mounting Node */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Overlay Badge */}
      <div className="pottery-badge-overlay">
        <div style={{
          backgroundColor: 'rgba(36, 31, 26, 0.8)',
          backdropFilter: 'blur(6px)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 0.85rem',
          color: '#FAF6F0',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: activeGlazeConfig.color,
            border: '1.5px solid #FFFFFF'
          }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
            {itemName} &bull; {glazeName}
          </span>
        </div>
      </div>

      {/* Bottom Floating Viewer Controls */}
      <div className="pottery-3d-controls-overlay">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAutoRotate(!autoRotate);
          }}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: autoRotate ? 'var(--color-terracotta)' : 'var(--color-bg-card)',
            color: autoRotate ? '#FFFFFF' : 'var(--color-text-main)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
          title={autoRotate ? 'Pause 360° Turntable' : 'Play 360° Turntable'}
          aria-label="Toggle auto rotation"
        >
          <RotateCw size={14} /> {autoRotate ? 'Rotating' : 'Spin'}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleZoom('in');
          }}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-main)',
            border: '1px solid var(--color-border)'
          }}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn size={14} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleZoom('out');
          }}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-main)',
            border: '1px solid var(--color-border)'
          }}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut size={14} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleResetView();
          }}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-main)',
            border: '1px solid var(--color-border)'
          }}
          title="Reset 3D Perspective"
          aria-label="Reset view"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </div>
  );
};
