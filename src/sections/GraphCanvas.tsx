import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NODE_COUNT = 200;
const MAX_CONNECTIONS = 500;

const LAYOUT_TORUS = 0;
const LAYOUT_SPHERE = 1;
const LAYOUT_HELIX = 2;
const LAYOUT_RANDOM = 3;
const LAYOUT_CYLINDER = 4;
const LAYOUT_WAVE = 5;

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
    case LAYOUT_SPHERE: {
      const phi = Math.acos(-1 + 2 * t);
      const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi;
      return new THREE.Vector3(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi)
      );
    }
    case LAYOUT_HELIX: {
      const y = (t - 0.5) * 2.5;
      const helixR = 0.7 + Math.sin(t * Math.PI * 4) * 0.15;
      return new THREE.Vector3(
        Math.cos(angle * 3) * helixR,
        y,
        Math.sin(angle * 3) * helixR
      );
    }
    case LAYOUT_RANDOM:
      return new THREE.Vector3(
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 1.2
      );
    case LAYOUT_CYLINDER: {
      const cylR = 0.8 + Math.random() * 0.3;
      return new THREE.Vector3(
        Math.cos(angle) * cylR,
        (t - 0.5) * 2.2,
        Math.sin(angle) * cylR
      );
    }
    case LAYOUT_WAVE: {
      const waveX = (t - 0.5) * 3.5;
      const waveY = Math.sin(t * Math.PI * 6) * 0.6;
      const waveZ = Math.cos(t * Math.PI * 4) * 0.4;
      return new THREE.Vector3(waveX, waveY, waveZ);
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

    // WireframeNodeMaterial
    const wireframeVertexShader = `
      uniform float uTime;
      uniform float uActivePulseSpeed;
      uniform float uActivePulseIntensity;
      uniform vec3 uActiveNodePos;
      varying float vActiveMix;
      #define PI 3.14159265359
      void main() {
        vec3 pos = position;
        float pulse = sin(uTime * uActivePulseSpeed) * 0.5 + 0.5;
        float dist = distance(instanceMatrix[3].xyz, uActiveNodePos);
        float activeMix = 1.0 - smoothstep(0.0, 0.5, dist);
        float scale = 1.0 + pulse * uActivePulseIntensity * activeMix;
        vActiveMix = activeMix;
        pos *= scale;
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const wireframeFragmentShader = `
      uniform vec3 uBaseColor;
      uniform vec3 uActiveColor;
      varying float vActiveMix;
      void main() {
        vec3 color = mix(uBaseColor, uActiveColor, vActiveMix);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const materialUniforms = {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#4F4F4F') },
      uActiveColor: { value: new THREE.Color('#FF6D2E') },
      uActiveNodePos: { value: new THREE.Vector3(0, 0, 0) },
      uActivePulseSpeed: { value: 2.0 },
      uActivePulseIntensity: { value: 0.5 },
    };

    const nodeGeo = new THREE.IcosahedronGeometry(0.03, 1);
    const nodesMesh = new THREE.InstancedMesh(
      nodeGeo,
      new THREE.ShaderMaterial({
        vertexShader: wireframeVertexShader,
        fragmentShader: wireframeFragmentShader,
        uniforms: materialUniforms,
        transparent: false,
        depthWrite: true,
        depthTest: true,
      }),
      NODE_COUNT
    );
    graphGroup.add(nodesMesh);

    const dummy = new THREE.Object3D();
    const nodePositions: THREE.Vector3[] = [];

    // Line material
    const lineVertexShader = `
      attribute float opacity;
      varying float vOpacity;
      varying vec3 vColor;
      void main() {
        vOpacity = opacity;
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const lineFragmentShader = `
      uniform float uGlobalAlpha;
      varying float vOpacity;
      varying vec3 vColor;
      void main() {
        float alpha = vOpacity * uGlobalAlpha;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `;

    const lineUniforms = {
      uGlobalAlpha: { value: 1.0 },
    };

    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const lineColors = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const lineOpacities = new Float32Array(MAX_CONNECTIONS * 2);
    const lineIndices = new Uint16Array(MAX_CONNECTIONS * 2);

    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    lineGeo.setAttribute('opacity', new THREE.BufferAttribute(lineOpacities, 1));
    lineGeo.setIndex(new THREE.BufferAttribute(lineIndices, 1));

    const linesMesh = new THREE.LineSegments(
      lineGeo,
      new THREE.ShaderMaterial({
        vertexShader: lineVertexShader,
        fragmentShader: lineFragmentShader,
        uniforms: lineUniforms,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
        vertexColors: true,
      })
    );
    graphGroup.add(linesMesh);

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
    const lineColor = new THREE.Color('#4F4F4F');
    const activeColor = new THREE.Color('#FF6D2E');

    let targetLayoutType = 0;
    let rotationSpeed = 0.001;

    // Active node highlighting
    const activeNodeIndices: number[] = [];
    let lastActiveSwitchTime = 0;

    function updateActiveNodeGroup() {
      const now = performance.now() / 1000;
      if (now - lastActiveSwitchTime > 6.0) {
        lastActiveSwitchTime = now;
        const groupSize = Math.floor(Math.random() * 3) + 3;
        const centerIndex = Math.floor(Math.random() * NODE_COUNT);
        activeNodeIndices.length = 0;
        let centerPos = new THREE.Vector3();
        for (let j = 0; j < groupSize; j++) {
          const idx = (centerIndex + j) % NODE_COUNT;
          activeNodeIndices.push(idx);
          centerPos.add(nodePositions[idx]);
        }
        centerPos.divideScalar(groupSize);
        nodesMesh.material.uniforms.uActiveNodePos.value.copy(centerPos);
      }
    }

    function updateNodePosition(index: number) {
      const pos = nodePositions[index];
      dummy.position.copy(pos);
      dummy.updateMatrix();
      nodesMesh.setMatrixAt(index, dummy.matrix);
      nodesMesh.instanceMatrix.needsUpdate = true;
    }

    function updateLinePositions() {
      const positions = lineGeo.attributes.position.array as Float32Array;
      const opacities = lineGeo.attributes.opacity.array as Float32Array;
      const colors = lineGeo.attributes.color.array as Float32Array;
      const indices = lineGeo.index!.array as Uint16Array;

      positions.fill(0);
      opacities.fill(0);
      indices.fill(0);

      const useActiveColor = activeNodeIndices.length > 0;
      const activeCenter = nodesMesh.material.uniforms.uActiveNodePos.value as THREE.Vector3;

      for (let i = 0; i < connections.length; i++) {
        const conn = connections[i];
        const si = conn.startIndex;
        const ei = conn.endIndex;
        const s = nodePositions[si];
        const e = nodePositions[ei];

        if (!s || !e) continue;

        const baseIdx = i * 6;
        positions[baseIdx] = s.x;
        positions[baseIdx + 1] = s.y;
        positions[baseIdx + 2] = s.z;
        positions[baseIdx + 3] = e.x;
        positions[baseIdx + 4] = e.y;
        positions[baseIdx + 5] = e.z;

        const color = lineColor.clone();
        if (useActiveColor) {
          const dist = Math.min(
            s.distanceTo(activeCenter),
            e.distanceTo(activeCenter)
          );
          const t = Math.min(1.0, dist / 0.5);
          color.lerp(activeColor, 1.0 - t);
        }

        const baseIdxColor = i * 6;
        colors[baseIdxColor] = color.r;
        colors[baseIdxColor + 1] = color.g;
        colors[baseIdxColor + 2] = color.b;
        colors[baseIdxColor + 3] = color.r;
        colors[baseIdxColor + 4] = color.g;
        colors[baseIdxColor + 5] = color.b;

        const opacityBase = i * 2;
        opacities[opacityBase] = conn.currentOpacity;
        opacities[opacityBase + 1] = conn.currentOpacity;

        const idxBase = i * 2;
        indices[idxBase] = i * 2;
        indices[idxBase + 1] = i * 2 + 1;
      }

      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.opacity.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;
      if (lineGeo.index) lineGeo.index.needsUpdate = true;
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
          state: 'spawning',
          lifeDuration: Math.random() * 3 + 2,
          currentOpacity: 0,
        });
      }
      updateLinePositions();
    }

    function initNodes() {
      for (let i = 0; i < NODE_COUNT; i++) {
        const pos = getNodePosition(i, 0);
        nodePositions[i] = pos;
        dummy.position.copy(pos);
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

    // Post-processing
    const ditherFragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform sampler2D tDiffuse;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;
        vec2 pixel = uv * uResolution;
        vec2 grid = floor(pixel / 3.0) * 3.0;
        float rnd = random(grid + uTime) * 0.03;
        vec4 color = texture2D(tDiffuse, uv);
        float r = texture2D(tDiffuse, uv + vec2(rnd, 0.0)).r;
        float g = texture2D(tDiffuse, uv + vec2(-rnd, rnd)).g;
        float b = texture2D(tDiffuse, uv + vec2(0.0, -rnd)).b;
        gl_FragColor = vec4(r, g, b, color.a);
        vec2 ditherCoord = floor(vUv * uResolution / 3.0);
        float dither = random(ditherCoord + fract(uTime)) * 0.15;
        gl_FragColor.rgb += dither;
      }
    `;

    const ditherUniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    };

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          ...ditherUniforms,
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: ditherFragmentShader,
      })
    );

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
      gsap.fromTo(
        camera.position,
        { z: camera.position.z },
        {
          z: camera.position.z + 0.5,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        }
      );
    };
    window.addEventListener('click', handleClick);

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      ditherUniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    };
    window.addEventListener('resize', handleResize);

    // Scroll triggers
    const scrollTriggers: ScrollTrigger[] = [];

    // Hero → Introduction (20%–35%)
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
      },
    });
    scrollTriggers.push(st1);

    gsap.to(lineUniforms.uGlobalAlpha, {
      value: 1,
      scrollTrigger: {
        trigger: document.body,
        start: '20% top',
        end: '35% top',
        scrub: 1,
      },
    });

    // Feature Grid (35%–70%)
    gsap.to(lineColor, {
      r: new THREE.Color('#AEAEAE').r,
      g: new THREE.Color('#AEAEAE').g,
      b: new THREE.Color('#AEAEAE').b,
      scrollTrigger: {
        trigger: document.body,
        start: '35% top',
        end: '70% top',
        scrub: 1,
      },
    });

    const st2 = ScrollTrigger.create({
      trigger: document.body,
      start: '35% top',
      end: '70% top',
      scrub: 1,
      onUpdate: () => {
        rotationSpeed = 0.0005;
      },
    });
    scrollTriggers.push(st2);

    // Metrics (70%–85%)
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
      },
    });
    scrollTriggers.push(st3);

    gsap.to(lineColor, {
      r: new THREE.Color('#4F4F4F').r,
      g: new THREE.Color('#4F4F4F').g,
      b: new THREE.Color('#4F4F4F').b,
      scrollTrigger: {
        trigger: document.body,
        start: '70% top',
        end: '85% top',
        scrub: 1,
      },
    });

    // Footer (85%–100%)
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

      materialUniforms.uTime.value = time;
      ditherUniforms.uTime.value = time;

      graphGroup.rotation.y += rotationSpeed;

      updateActiveNodeGroup();

      // Mouse parallax
      const targetRotX = mouseY * 0.15;
      const targetRotY = mouseX * 0.15;
      graphGroup.rotation.x += (targetRotX - graphGroup.rotation.x) * 0.02;
      graphGroup.rotation.y += (targetRotY - graphGroup.rotation.y) * 0.02;

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
      composer.render();
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
      composer.dispose();
      nodeGeo.dispose();
      lineGeo.dispose();
      nodesMesh.material.dispose();
      linesMesh.material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />;
}
