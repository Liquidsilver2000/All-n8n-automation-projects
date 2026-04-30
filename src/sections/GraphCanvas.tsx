import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NODE_COUNT = 200;
const MAX_CONNECTIONS = 500;

const LAYOUT_TORUS = 0;
const LAYOUT_HELIX = 2;
const LAYOUT_CYLINDER = 4;

function getNodePosition(index: number, type: number): THREE.Vector3 {
  const t = index / NODE_COUNT;
  const angle = t * Math.PI * 2;
  const r = 1.2;

  switch (type) {
    case LAYOUT_TORUS:
      return new THREE.Vector3(
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        (Math.random() - 0.5) * 0.4
      );
    case LAYOUT_HELIX: {
      const y = (t - 0.5) * 2.5;
      const helixR = 0.7 + Math.sin(t * Math.PI * 4) * 0.15;
      return new THREE.Vector3(
        Math.cos(angle * 3) * helixR,
        y,
        Math.sin(angle * 3) * helixR
      );
    }
    case LAYOUT_CYLINDER: {
      const cylR = 0.8 + Math.random() * 0.3;
      return new THREE.Vector3(
        Math.cos(angle) * cylR,
        (t - 0.5) * 2.2,
        Math.sin(angle) * cylR
      );
    }
    default:
      return new THREE.Vector3();
  }
}

export default function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current || cleanupRef.current) return;

    const container = containerRef.current;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050507);

      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      camera.position.z = 4.0;

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.position = 'fixed';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.zIndex = '0';
      renderer.domElement.style.pointerEvents = 'none';
      container.appendChild(renderer.domElement);

      const graphGroup = new THREE.Group();
      scene.add(graphGroup);

      // Nodes - use simple wireframe material
      const nodeGeo = new THREE.IcosahedronGeometry(0.03, 1);
      const baseMaterial = new THREE.MeshBasicMaterial({
        color: 0x4F4F4F,
        wireframe: true,
      });
      const nodesMesh = new THREE.InstancedMesh(
        nodeGeo,
        baseMaterial,
        NODE_COUNT
      );
      graphGroup.add(nodesMesh);

      const dummy = new THREE.Object3D();
      const nodePositions: THREE.Vector3[] = [];

      // Lines
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x4F4F4F,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const lineGeo = new THREE.BufferGeometry();
      const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const linesMesh = new THREE.LineSegments(lineGeo, lineMaterial);
      graphGroup.add(linesMesh);

      // Active nodes (highlighted group)
      const activeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF6D2E,
        wireframe: true,
      });
      const activeMesh = new THREE.InstancedMesh(
        nodeGeo,
        activeMaterial,
        6
      );
      graphGroup.add(activeMesh);

      // Connection pool
      interface Connection {
        startIndex: number;
        endIndex: number;
        maxOpacity: number;
        spawnTime: number;
        state: 'spawning' | 'alive' | 'dead';
        lifeDuration: number;
        currentOpacity: number;
      }

      const connections: Connection[] = [];
      let targetLayoutType = 0;
      let rotationSpeed = 0.001;

      let lastActiveSwitchTime = 0;
      let activeNodeIndices: number[] = [];

      function updateActiveNodeGroup(time: number) {
        if (time - lastActiveSwitchTime > 6.0) {
          lastActiveSwitchTime = time;
          const groupSize = Math.floor(Math.random() * 3) + 3;
          const centerIndex = Math.floor(Math.random() * NODE_COUNT);
          activeNodeIndices = [];
          let centerPos = new THREE.Vector3();
          for (let j = 0; j < groupSize; j++) {
            const idx = (centerIndex + j) % NODE_COUNT;
            activeNodeIndices.push(idx);
            centerPos.add(nodePositions[idx]);
          }
          centerPos.divideScalar(groupSize);

          // Update active mesh positions
          for (let j = 0; j < 6; j++) {
            if (j < activeNodeIndices.length) {
              const pos = nodePositions[activeNodeIndices[j]];
              dummy.position.copy(pos);
              dummy.updateMatrix();
              activeMesh.setMatrixAt(j, dummy.matrix);
            } else {
              dummy.position.set(0, 0, -1000); // Hide unused
              dummy.updateMatrix();
              activeMesh.setMatrixAt(j, dummy.matrix);
            }
          }
          activeMesh.instanceMatrix.needsUpdate = true;
          activeMesh.count = groupSize;
        } else {
          // Pulse active nodes
          const pulse = Math.sin(time * 2.0) * 0.15 + 1.0;
          for (let j = 0; j < activeNodeIndices.length; j++) {
            const pos = nodePositions[activeNodeIndices[j]];
            dummy.position.copy(pos);
            dummy.scale.setScalar(pulse);
            dummy.updateMatrix();
            activeMesh.setMatrixAt(j, dummy.matrix);
          }
          activeMesh.instanceMatrix.needsUpdate = true;
        }
      }

      function updateNodePosition(index: number) {
        const pos = nodePositions[index];
        dummy.position.copy(pos);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        nodesMesh.setMatrixAt(index, dummy.matrix);
        nodesMesh.instanceMatrix.needsUpdate = true;
      }

      function updateLinePositions() {
        const positions = lineGeo.attributes.position.array as Float32Array;
        positions.fill(0);

        let visibleCount = 0;
        for (let i = 0; i < connections.length; i++) {
          const conn = connections[i];
          if (conn.currentOpacity < 0.01) continue;

          const s = nodePositions[conn.startIndex];
          const e = nodePositions[conn.endIndex];
          if (!s || !e) continue;

          const baseIdx = visibleCount * 6;
          positions[baseIdx] = s.x;
          positions[baseIdx + 1] = s.y;
          positions[baseIdx + 2] = s.z;
          positions[baseIdx + 3] = e.x;
          positions[baseIdx + 4] = e.y;
          positions[baseIdx + 5] = e.z;
          visibleCount++;
          if (visibleCount >= MAX_CONNECTIONS) break;
        }

        lineGeo.attributes.position.needsUpdate = true;
        lineMaterial.opacity = 0.15;
      }

      function initConnections() {
        connections.length = 0;
        const time = performance.now() / 1000;
        for (let i = 0; i < MAX_CONNECTIONS; i++) {
          connections.push({
            startIndex: Math.floor(Math.random() * NODE_COUNT),
            endIndex: Math.floor(Math.random() * NODE_COUNT),
            maxOpacity: Math.random() * 0.8 + 0.2,
            spawnTime: time + Math.random() * 2,
            state: 'spawning' as const,
            lifeDuration: Math.random() * 3 + 2,
            currentOpacity: 0,
          });
        }
      }

      function initNodes() {
        for (let i = 0; i < NODE_COUNT; i++) {
          const pos = getNodePosition(i, 0);
          nodePositions[i] = pos;
          dummy.position.copy(pos);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          nodesMesh.setMatrixAt(i, dummy.matrix);
        }
        nodesMesh.instanceMatrix.needsUpdate = true;
        initConnections();
      }

      function morphToLayout(newType: number, duration = 2.0) {
        targetLayoutType = newType;
        for (let i = 0; i < NODE_COUNT; i++) {
          const currentPos = nodePositions[i];
          const targetPos = getNodePosition(i, newType);
          gsap.to(currentPos, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: duration,
            ease: 'power2.inOut',
            onUpdate: () => updateNodePosition(i),
          });
        }
      }

      initNodes();

      // Mouse parallax
      let mouseX = 0;
      let mouseY = 0;
      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Click to morph
      const handleClick = () => {
        const currentType = targetLayoutType;
        const nextType = (currentType + 1) % 6;
        morphToLayout(nextType, 1.5);
      };
      window.addEventListener('click', handleClick);

      // Resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      // Scroll triggers
      const scrollTriggers: ScrollTrigger[] = [];

      const st1 = ScrollTrigger.create({
        trigger: document.body,
        start: '20% top',
        end: '35% top',
        scrub: 1,
        onEnter: () => morphToLayout(2, 2.0),
        onUpdate: (self) => {
          const progress = self.progress;
          camera.fov = 60 - progress * 25;
          camera.updateProjectionMatrix();
          camera.position.z = 4.0 - progress * 1.5;
          lineMaterial.opacity = 0.15 + progress * 0.1;
        },
      });
      scrollTriggers.push(st1);

      const st3 = ScrollTrigger.create({
        trigger: document.body,
        start: '70% top',
        end: '85% top',
        scrub: 1,
        onEnter: () => morphToLayout(4, 2.0),
        onUpdate: (self) => {
          const progress = self.progress;
          camera.fov = 35 + progress * 15;
          camera.updateProjectionMatrix();
          camera.position.z = 2.5 + progress * 1.0;
          lineMaterial.opacity = 0.25 - progress * 0.15;
        },
      });
      scrollTriggers.push(st3);

      const st4 = ScrollTrigger.create({
        trigger: document.body,
        start: '85% top',
        end: '100% top',
        scrub: 1,
        onUpdate: () => {
          rotationSpeed = 0.0003;
        },
      });
      scrollTriggers.push(st4);

      // Animation loop
      let rafId: number;
      const animate = () => {
        rafId = requestAnimationFrame(animate);
        const now = performance.now();
        const time = now / 1000;

        graphGroup.rotation.y += rotationSpeed;

        // Mouse parallax
        const targetRotX = mouseY * 0.15;
        const targetRotY = mouseX * 0.15;
        graphGroup.rotation.x += (targetRotX - graphGroup.rotation.x) * 0.02;
        graphGroup.rotation.y += (targetRotY - graphGroup.rotation.y) * 0.02;

        updateActiveNodeGroup(time);

        // Update connections
        for (let i = 0; i < connections.length; i++) {
          const conn = connections[i];
          if (conn.state === 'spawning') {
            const age = time - conn.spawnTime;
            if (age >= 0) {
              conn.state = 'alive';
            } else {
              conn.currentOpacity = 0;
            }
          }
          if (conn.state === 'alive') {
            const age = time - conn.spawnTime;
            const fadeIn = Math.min(age / 1.5, 1.0);
            const holdProgress = Math.max(0, age - 1.5) / 2.0;
            conn.currentOpacity =
              conn.maxOpacity * fadeIn * (1.0 - Math.min(holdProgress, 1.0));
            if (age >= conn.lifeDuration) {
              conn.state = 'dead';
            }
          }
          if (conn.state === 'dead') {
            conn.spawnTime = time + Math.random() * 1.5;
            conn.startIndex = Math.floor(Math.random() * NODE_COUNT);
            conn.endIndex = Math.floor(Math.random() * NODE_COUNT);
            conn.maxOpacity = Math.random() * 0.8 + 0.2;
            conn.lifeDuration = Math.random() * 3 + 2;
            conn.currentOpacity = 0;
            conn.state = 'spawning';
          }
        }

        updateLinePositions();
        renderer.render(scene, camera);
      };

      animate();

      // Fade in canvas
      renderer.domElement.style.opacity = '0';
      gsap.to(renderer.domElement, { opacity: 1, duration: 1.0 });

      cleanupRef.current = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleClick);
        window.removeEventListener('resize', handleResize);
        scrollTriggers.forEach((st) => st.kill());
        renderer.dispose();
        nodeGeo.dispose();
        lineGeo.dispose();
        baseMaterial.dispose();
        lineMaterial.dispose();
        activeMaterial.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      console.error('GraphCanvas error:', err);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />;
}
