import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { audioEngine, AudioFeatures } from './audio';
import { getShapeData, PARTICLE_COUNT, ShapeName } from './shapes';

export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  
  private geometry!: THREE.BufferGeometry;
  private material!: THREE.ShaderMaterial;
  private points!: THREE.Points;
  
  private clock: THREE.Clock;
  private rafId: number = 0;
  
  private gui: GUI;
  private controls: OrbitControls;
  private currentRotationY: number = 0;
  private currentShape: ShapeName = 'DNA_1_Orbits';
  
  // Smoothing state for audio reactivity (Lerp)
  private smoothedBass: number = 0;
  private smoothedMid: number = 0;
  private smoothedTreble: number = 0;
  private smoothedAverage: number = 0;
  
  public settings = {
    animationSpeed: 1.0,
    noiseStrength: 0.0,
    beatPulse: 1.0,
    beatScaleLimit: 1.15,
    explosionIntensity: 1.0,
    particleSize: 0.2, // increased size based on user parameter testing
    rotationSpeed: 1.0,
    audioColorReactivity: 1.0,
    trebleSensitivity: 1.0,
    bloomStrengthBase: 0.0,
    bloomRadius: 0.0,
    maxBeatGlow: 0.0,
  };
  
  public visualMode: 'Deep Space' | 'Atmospheric' | 'Dynamic' = 'Deep Space';
  public targetBackgroundColor: THREE.Color = new THREE.Color(0x000000);
  public currentBackgroundColor: THREE.Color = new THREE.Color(0x000000);
  public currentTrackGenre: string = 'Cosmic Ambient';
  
  private defaultSettings = { ...this.settings };
  private bloomPass!: UnrealBloomPass;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 60;
    
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
    
    this.clock = new THREE.Clock();

    const renderScene = new RenderPass(this.scene, this.camera);
    // Adjusted bloom for tightly controlled, clear light beam effect
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.settings.bloomStrengthBase, this.settings.bloomRadius, 0.2);
    const outputPass = new OutputPass();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(outputPass);
    
    // Setup OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 150;
    
    this.setupParticles();
    this.setupGUI();
    
    window.addEventListener('resize', this.onWindowResize);
    
    this.animate();
  }

  private setupParticles() {
    this.geometry = new THREE.BufferGeometry();
    
    const shapeData = getShapeData(this.currentShape, audioEngine.features, audioEngine.currentSeed);
    const initialPositions = shapeData.positions;
    const initialProgresses = shapeData.progresses;
    
    const targetPositions = new Float32Array(initialPositions);
    const randomSeeds = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    
    // Low saturation, ethereal gradient (nearly white to very subtle champagne/gold)
    const color1 = new THREE.Color(0xfcfcfc); // Almost pure white
    const color2 = new THREE.Color(0xf0eed8); // Champagne/light gold

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        randomSeeds[i] = Math.random();
        
        const mixedColor = color1.clone().lerp(color2, Math.random());
        colors[i*3] = mixedColor.r;
        colors[i*3+1] = mixedColor.g;
        colors[i*3+2] = mixedColor.b;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
    this.geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
    this.geometry.setAttribute('randomSeed', new THREE.BufferAttribute(randomSeeds, 1));
    this.geometry.setAttribute('aProgress', new THREE.BufferAttribute(initialProgresses, 1));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.updateColors(this.currentShape);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uTreble: { value: 0 },
        uTransition: { value: 0 },
        uAnimationSpeed: { value: this.settings.animationSpeed },
        uNoiseStrength: { value: this.settings.noiseStrength },
        uBeatPulse: { value: this.settings.beatPulse },
        uBeatScaleLimit: { value: this.settings.beatScaleLimit },
        uExplosionIntensity: { value: this.settings.explosionIntensity },
        uParticleSize: { value: this.settings.particleSize },
        uAudioColorReactivity: { value: this.settings.audioColorReactivity },
        uTrebleSensitivity: { value: this.settings.trebleSensitivity },
        uPixelRatio: { value: window.devicePixelRatio },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uBass;
        uniform float uMid;
        uniform float uTreble;
        uniform float uTransition;
        
        uniform float uAnimationSpeed;
        uniform float uNoiseStrength;
        uniform float uBeatPulse;
        uniform float uBeatScaleLimit;
        uniform float uExplosionIntensity;
        uniform float uParticleSize;
        uniform float uTrebleSensitivity;
        uniform float uPixelRatio;

        attribute vec3 targetPosition;
        attribute float randomSeed;
        attribute float aProgress;
        attribute vec3 color;

        varying vec3 vColor;
        varying float vAudioReact;
        varying float vProgress;
        varying float vRandomSeed;

        vec3 hash(vec3 p) {
            p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
                     dot(p, vec3(269.5, 183.3, 246.1)),
                     dot(p, vec3(113.5, 271.9, 124.6)));
            return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }

        void main() {
            vec3 currentPos = mix(position, targetPosition, uTransition);
            vProgress = aProgress;
            vRandomSeed = randomSeed;

            // Mid frequency increases flow speed and spread (fluidity)
            float flowSpeed = 0.05 * uAnimationSpeed * (1.0 + uMid * 2.0);
            float t = uTime * flowSpeed + randomSeed * 100.0;
            
            // Base breath is very subtle; mid and treble make it scatter
            float dynamicNoise = 0.01 + (uTreble * 0.2 + uMid * 0.3) * uExplosionIntensity;
            vec3 breathingOffset = hash(currentPos * 0.2 + t) * dynamicNoise * uNoiseStrength;

            vec3 pos = currentPos + breathingOffset;
            
            // Bass creates dramatic pulses, limited by uBeatScaleLimit
            float maxExtraScale = uBeatScaleLimit - 1.0;
            float bassScale = 1.0 + clamp(uBass, 0.0, 1.0) * maxExtraScale * uBeatPulse;
            pos *= bassScale;

            // Jitter for treble (only active if uTreble or explosion is present, otherwise 0)
            float effectiveTreble = uTreble * uTrebleSensitivity;
            vec3 jitter = hash(pos * 5.0 + uTime * 10.0 * uAnimationSpeed) * (effectiveTreble * effectiveTreble) * 2.0 * uExplosionIntensity;
            pos += jitter;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            // Base size is strictly uParticleSize for crispness
            float size = uParticleSize + (effectiveTreble * effectiveTreble) * 20.0 * uParticleSize;
            gl_PointSize = min(size * uPixelRatio * (650.0 / -mvPosition.z), 4.8); // Adjust depth perspective with strict clamping

            vColor = color;
            vAudioReact = effectiveTreble * 1.5 + uBass * 1.0 + uMid * 0.5;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uAudioColorReactivity;
        varying vec3 vColor;
        varying float vAudioReact;
        varying float vProgress;
        varying float vRandomSeed;

        void main() {
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = dot(cxy, cxy);
            if (r > 1.0) discard;

            // Sharp core for distinct stars, extremely controlled tight halo for bloom
            float core = exp(-r * 15.0);
            float halo = exp(-r * 5.0) * 0.1;
            vec3 finalColor = vColor * (core + halo);

            // Audio color reaction - subdued to avoid blowout
            float react = clamp(vAudioReact, 0.0, 1.0);
            
            // Traveling light pulse along the line based on aProgress and time!
            // We use fract to loop it.
            float pulseWave = fract(vProgress * 1.0 - uTime * 0.3 + vRandomSeed * 0.2); // slight offset per fiber
            float glow = exp(-pulseWave * 8.0); // comet tail fading out
            
            // Add another layer of light that travels faster with the beat
            float beatWave = fract(vProgress * 2.0 - uTime * 1.2 + vRandomSeed * 0.5);
            float beatPulse = exp(-beatWave * 12.0) * react * 5.0; // bright flash

            finalColor *= 1.0 + (react * 0.5 * uAudioColorReactivity) + glow * 2.5 + beatPulse;

            gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  private setupGUI() {
    this.gui = new GUI();
    
    // Style the GUI to be more like the screenshot
    this.gui.domElement.style.position = 'absolute';
    this.gui.domElement.style.top = '10px';
    this.gui.domElement.style.right = '10px';
    this.gui.domElement.style.zIndex = '50';
    
    const updateUniforms = () => {
        this.material.uniforms.uAnimationSpeed.value = this.settings.animationSpeed;
        this.material.uniforms.uNoiseStrength.value = this.settings.noiseStrength;
        this.material.uniforms.uBeatPulse.value = this.settings.beatPulse;
        this.material.uniforms.uBeatScaleLimit.value = this.settings.beatScaleLimit;
        this.material.uniforms.uExplosionIntensity.value = this.settings.explosionIntensity;
        this.material.uniforms.uParticleSize.value = this.settings.particleSize;
        this.material.uniforms.uAudioColorReactivity.value = this.settings.audioColorReactivity;
        this.material.uniforms.uTrebleSensitivity.value = this.settings.trebleSensitivity;
    };

    this.gui.add(this.settings, 'animationSpeed', 0, 3).name('Animation Speed').onChange(updateUniforms);
    this.gui.add(this.settings, 'noiseStrength', 0, 3).name('Noise Strength').onChange(updateUniforms);
    this.gui.add(this.settings, 'beatPulse', 0, 3).name('Beat Pulse').onChange(updateUniforms);
    this.gui.add(this.settings, 'beatScaleLimit', 1.0, 2.0).name('Beat Scale Limit').onChange(updateUniforms);
    this.gui.add(this.settings, 'explosionIntensity', 0, 3).name('Explosion Intensity').onChange(updateUniforms);
    this.gui.add(this.settings, 'particleSize', 0.01, 0.4).name('Particle Size').onChange(updateUniforms);
    this.gui.add(this.settings, 'rotationSpeed', -3, 3).name('Rotation Speed');
    this.gui.add(this.settings, 'audioColorReactivity', 0, 3).name('Audio Color Reactivity').onChange(updateUniforms);
    this.gui.add(this.settings, 'trebleSensitivity', 0, 3).name('Treble Sensitivity').onChange(updateUniforms);
    this.gui.add(this.settings, 'bloomStrengthBase', 0, 1).name('Bloom Base Strength').onChange(() => {});
    this.gui.add(this.settings, 'maxBeatGlow', 0, 2).name('Max Beat Glow');
    this.gui.add(this.settings, 'bloomRadius', 0, 1).name('Bloom Radius').onChange((v: number) => this.bloomPass.radius = v);
    
    const actions = {
        resetToDefaults: () => {
            Object.assign(this.settings, this.defaultSettings);
            this.bloomPass.radius = this.settings.bloomRadius;
            this.gui.controllersRecursive().forEach(c => c.updateDisplay());
            updateUniforms();
        }
    };
    
    this.gui.add(actions, 'resetToDefaults').name('Reset to Defaults');
  }

  public setShape(shape: ShapeName) {
    this.currentShape = shape;
    const shapeData = getShapeData(shape, audioEngine.features, audioEngine.currentSeed);
    this.geometry.setAttribute('targetPosition', new THREE.BufferAttribute(shapeData.positions, 3));
    this.geometry.setAttribute('aProgress', new THREE.BufferAttribute(shapeData.progresses, 1));
    this.updateColors(shape);
    this.material.uniforms.uTransition.value = 0;

    gsap.killTweensOf(this.material.uniforms.uTransition);
    gsap.to(this.material.uniforms.uTransition, {
        value: 1,
        duration: 2.5,
        ease: "power2.inOut",
        onComplete: () => {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(shapeData.positions, 3));
            this.material.uniforms.uTransition.value = 0;
        }
    });
  }

  private determineGenre(features: AudioFeatures): string {
      if (!audioEngine.isPlaying && audioEngine.currentSeed === 42) {
          return "Cosmic Ambient";
      }
      if (features.energy < 0.35 && features.dynamics < 0.4) return "Ambient / Atmospheric";
      if (features.spectralBias < 0.4 && features.energy > 0.6) return "Techno / Electronic";
      if (features.spectralBias > 0.6 && features.energy < 0.6) return "Classical / Acoustic";
      if (features.dynamics > 0.7) return "Orchestral / Cinematic";
      if (features.energy > 0.7 && features.dynamics > 0.5) return "Rock / High Energy";
      return "Experimental / Jazz";
  }

  private updateColors(shape: ShapeName) {
    const colorsAttr = this.geometry.getAttribute('color') as THREE.BufferAttribute;
    const colors = colorsAttr.array as Float32Array;
    
    let color1 = new THREE.Color(0xfcfcfc);
    let color2 = new THREE.Color(0xf0eed8);

    if (shape.startsWith('DNA')) {
       const dnaState = { seed: audioEngine.currentSeed !== 0 ? audioEngine.currentSeed : 0x12345678 };
       const xorshift = () => {
         let x = dnaState.seed;
         x ^= x << 13; x ^= x >> 17; x ^= x << 5;
         dnaState.seed = x;
         return (x >>> 0) / 4294967296.0;
       };
       
       let hue1 = xorshift();
       let hue2 = (hue1 + 0.2 + xorshift() * 0.4) % 1.0;
       
       const sat = 0.6 + xorshift() * 0.4;
       const lit = 0.4 + xorshift() * 0.3;
       
       color1.setHSL(hue1, sat, lit);
       color2.setHSL(hue2, sat, lit);
       
       this.settings.noiseStrength = 0.0;
       this.settings.beatPulse = 0.5 + xorshift() * 2.0;
       this.settings.rotationSpeed = (xorshift() - 0.5) * 2.0;
       this.settings.audioColorReactivity = 0.6 + xorshift() * 1.5;
       this.settings.trebleSensitivity = 0.4 + xorshift() * 2.0;
       
       if (this.material) {
         this.material.uniforms.uNoiseStrength.value = this.settings.noiseStrength;
         this.material.uniforms.uBeatPulse.value = this.settings.beatPulse;
         this.material.uniforms.uAudioColorReactivity.value = this.settings.audioColorReactivity;
         this.material.uniforms.uTrebleSensitivity.value = this.settings.trebleSensitivity;
       }
       
       if (this.gui) {
         this.gui.controllersRecursive().forEach(c => c.updateDisplay());
       }
    } else if (shape === 'Signature') { const features = audioEngine.features; let hue1 = (1.0 - features.spectralBias) * 0.15 + features.spectralBias * 0.6; let hue2 = (hue1 + 0.15 + features.dynamics * 0.2) % 1.0; const sat = 0.6 + features.energy * 0.4; const lit = 0.4 + features.dynamics * 0.3; color1.setHSL(hue1, sat, lit); color2.setHSL(hue2, sat, lit); this.settings.noiseStrength = 0.0; this.settings.beatPulse = 0.5 + features.energy * 2.0; this.settings.rotationSpeed = 0.2 + features.energy * 1.5; this.settings.audioColorReactivity = 0.5 + features.dynamics * 2.0; this.settings.trebleSensitivity = 0.5 + features.spectralBias * 2.0; if (this.material) { this.material.uniforms.uNoiseStrength.value = this.settings.noiseStrength; this.material.uniforms.uBeatPulse.value = this.settings.beatPulse; this.material.uniforms.uAudioColorReactivity.value = this.settings.audioColorReactivity; this.material.uniforms.uTrebleSensitivity.value = this.settings.trebleSensitivity; } if (this.gui) { this.gui.controllersRecursive().forEach(c => c.updateDisplay()); } } else if (['Identity', 'Mutation', 'Galaxy', 'Lorenz', 'Menger', 'Aizawa'].includes(shape)) { const features = audioEngine.features; let hue1 = (1.0 - features.spectralBias) * 0.15 + features.spectralBias * 0.6; let hue2 = (hue1 + 0.15 + features.dynamics * 0.2) % 1.0; if (features.energy < 0.4 && features.dynamics < 0.5) { hue1 = 0.55; hue2 = 0.65; } else if (features.spectralBias < 0.4 && features.energy > 0.6) { hue1 = 0.0; hue2 = 0.1; } else if (features.spectralBias > 0.6 && features.energy < 0.6) { hue1 = 0.1; hue2 = 0.5; } else if (features.dynamics > 0.7) { hue1 = 0.15; hue2 = 0.8; } else { hue1 = features.spectralBias; hue2 = (hue1 + 0.3) % 1.0; } const sat = 0.6 + features.energy * 0.4;
       const lit = 0.4 + features.dynamics * 0.3;
       
       color1.setHSL(hue1, sat, lit);
       color2.setHSL(hue2, sat, lit);
       
       // Update settings based on Audio DNA
       this.settings.noiseStrength = 0.0;
       this.settings.beatPulse = 0.5 + features.energy * 2.0;
       this.settings.rotationSpeed = 0.2 + features.energy * 1.5;
       this.settings.audioColorReactivity = 0.5 + features.dynamics * 2.0;
       this.settings.trebleSensitivity = 0.5 + features.spectralBias * 2.0;
       
       // Update uniforms immediately
       if (this.material) {
         this.material.uniforms.uNoiseStrength.value = this.settings.noiseStrength;
         this.material.uniforms.uBeatPulse.value = this.settings.beatPulse;
         this.material.uniforms.uAudioColorReactivity.value = this.settings.audioColorReactivity;
         this.material.uniforms.uTrebleSensitivity.value = this.settings.trebleSensitivity;
       }
       
       // Refresh GUI if it exists
       if (this.gui) {
         this.gui.controllersRecursive().forEach(c => c.updateDisplay());
       }
    } else {
       const dnaState = { seed: audioEngine.currentSeed !== 0 ? audioEngine.currentSeed : 0x12345678 };
       const xorshift = () => {
         let x = dnaState.seed;
         x ^= x << 13; x ^= x >> 17; x ^= x << 5;
         dnaState.seed = x;
         return (x >>> 0) / 4294967296.0;
       };
       
       let hue1 = xorshift();
       let hue2 = (hue1 + 0.2 + xorshift() * 0.4) % 1.0;
       
       const features = audioEngine.features;
       hue1 = (hue1 + features.spectralBias * 0.2) % 1.0;
       hue2 = (hue2 + features.energy * 0.2) % 1.0;
       
       const sat = 0.6 + features.energy * 0.4;
       const lit = 0.4 + features.dynamics * 0.3;
       
       color1.setHSL(hue1, sat, lit);
       color2.setHSL(hue2, sat, lit);
    }

    let atmosphericBgHue = 0;

    // Atmospheric mode creates bold, neon, contrasting color schemes
    if (this.visualMode === 'Atmospheric') {
        const hsl1 = { h: 0, s: 0, l: 0 };
        const hsl2 = { h: 0, s: 0, l: 0 };
        color1.getHSL(hsl1);
        color2.getHSL(hsl2);
        
        atmosphericBgHue = hsl1.h;

        // Color Theory Fix: Apply a bold, contrasting accent hue (e.g. analogous + split complement or triadic)
        // Shift colors away from the background hue to ensure they "pop" and avoid "color lost"
        const accentHue1 = (hsl1.h + 0.35) % 1.0; 
        const accentHue2 = (hsl1.h + 0.65) % 1.0; 

        // Luminance Boost: Force particles to be brighter so they pierce the background
        color1.setHSL(accentHue1, 1.0, 0.85);
        color2.setHSL(accentHue2, 1.0, 0.85);
    } else if (this.visualMode === 'Dynamic') {
        const hsl1 = { h: 0, s: 0, l: 0 };
        color1.getHSL(hsl1);
        
        // High saturation, intense gradient from e.g., yellow to purple
        const centerHue = (hsl1.h + 0.15) % 1.0; 
        const edgeHue = (hsl1.h - 0.25 + 1.0) % 1.0;
        
        color2.setHSL(centerHue, 1.0, 0.7); // Bright hot center
        color1.setHSL(edgeHue, 1.0, 0.4);   // Deep outer edges
    }

    const positionsAttr = this.geometry.getAttribute('targetPosition') as THREE.BufferAttribute;
    const pos = positionsAttr ? (positionsAttr.array as Float32Array) : null;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let mix;
        if (this.visualMode === 'Dynamic' && pos) {
            const x = pos[i*3];
            const y = pos[i*3+1];
            const z = pos[i*3+2];
            const dist = Math.sqrt(x*x + y*y + z*z);
            // rawMix goes from 1 (center) to 0 (far edge)
            const rawMix = Math.max(0, Math.min(1, 1.0 - (dist / 60.0))); 
            mix = Math.pow(rawMix, 1.2); 
        } else {
            mix = Math.random();
        }
        const mixedColor = color1.clone().lerp(color2, mix);
        colors[i*3] = mixedColor.r;
        colors[i*3+1] = mixedColor.g;
        colors[i*3+2] = mixedColor.b;
    }
    colorsAttr.needsUpdate = true;

    this.currentTrackGenre = this.determineGenre(audioEngine.features);

    // Calculate and set target background color based on visual mode
    if (this.visualMode === 'Atmospheric') {
        // Deep saturation of dominant line color at the center
        this.targetBackgroundColor.setHSL(atmosphericBgHue, 1.0, 0.18);
    } else if (this.visualMode === 'Dynamic') {
        const hsl = { h: 0, s: 0, l: 0 };
        color1.getHSL(hsl);
        // Very deep, barely visible center glow
        this.targetBackgroundColor.setHSL(hsl.h, 0.9, 0.04);
    } else {
        this.targetBackgroundColor.setHex(0x000000);
    }
  }

  public toggleControls(show: boolean) {
    if (this.gui) {
        this.gui.domElement.style.display = show ? 'block' : 'none';
    }
  }

  public setVisualMode(mode: 'Deep Space' | 'Atmospheric' | 'Dynamic') {
    this.visualMode = mode;
    this.updateColors(this.currentShape);
  }

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate);
    
    const time = this.clock.getElapsedTime();
    this.material.uniforms.uTime.value = time;

    const { bass, mid, treble, average } = audioEngine.getFrequencies();
    
    // 1. Bass Smoothing (Fast attack, very slow decay for heavy breathing)
    // Thresholding for bass: only trigger if > 0.8 to represent a strong kick
    const effectiveBass = bass > 0.8 ? bass : 0.0;
    const bassFactor = effectiveBass > this.smoothedBass ? 0.2 : 0.05; // 0.2 attack, 0.05 release
    this.smoothedBass = THREE.MathUtils.lerp(this.smoothedBass, effectiveBass, bassFactor);

    // 2. Mid & Treble Smoothing
    const midFactor = mid > this.smoothedMid ? 0.1 : 0.05;
    this.smoothedMid = THREE.MathUtils.lerp(this.smoothedMid, mid, midFactor);
    
    const trebleFactor = treble > this.smoothedTreble ? 0.2 : 0.05;
    this.smoothedTreble = THREE.MathUtils.lerp(this.smoothedTreble, treble, trebleFactor);

    // 3. Average Smoothing for rotation
    const avgFactor = average > this.smoothedAverage ? 0.1 : 0.05;
    this.smoothedAverage = THREE.MathUtils.lerp(this.smoothedAverage, average, avgFactor);

    // Apply smoothed values to uniforms
    this.material.uniforms.uBass.value = this.smoothedBass;
    this.material.uniforms.uMid.value = this.smoothedMid;
    this.material.uniforms.uTreble.value = this.smoothedTreble;

    // Dynamic Bloom Strength based on smoothed bass peak
    const dynamicBloomAmplitude = 1.0;
    let targetBloom = this.settings.bloomStrengthBase + this.smoothedBass * dynamicBloomAmplitude;
    targetBloom = Math.min(targetBloom, this.settings.maxBeatGlow);
    // Bloom also needs smoothed interpolation
    const bloomFactor = targetBloom > this.bloomPass.strength ? 0.2 : 0.05;
    this.bloomPass.strength = THREE.MathUtils.lerp(this.bloomPass.strength, targetBloom, bloomFactor);

    // Map smoothed average energy to rotation increment
    // Music gets more intense -> rotation speeds up (0.002 is base speed)
    const rotationDelta = (this.settings.rotationSpeed * 0.002) * (1.0 + this.smoothedAverage * 25.0);
    this.currentRotationY += rotationDelta;
    
    this.points.rotation.y = this.currentRotationY;
    this.points.rotation.x = Math.sin(time * 0.1) * 0.2 * this.settings.rotationSpeed;
    this.points.rotation.z = Math.cos(time * 0.1) * 0.1 * this.settings.rotationSpeed;
    
    this.currentBackgroundColor.lerp(this.targetBackgroundColor, 0.02);
    if (this.visualMode === 'Atmospheric') {
        const centerHex = '#' + this.currentBackgroundColor.getHexString();
        this.container.style.background = `radial-gradient(circle farthest-corner at center, ${centerHex} 0%, #08090a 100%)`;
    } else if (this.visualMode === 'Dynamic') {
        const centerHex = '#' + this.currentBackgroundColor.getHexString();
        this.container.style.background = `radial-gradient(circle farthest-corner at center, ${centerHex} 0%, #030304 40%, #000000 100%)`;
    } else {
        const hex = '#' + this.currentBackgroundColor.getHexString();
        this.container.style.background = hex;
    }
    
    this.controls.update();

    this.composer.render();
  }

  public dispose() {
    window.removeEventListener('resize', this.onWindowResize);
    cancelAnimationFrame(this.rafId);
    this.gui.destroy();
    
    if (this.controls) {
        this.controls.dispose();
    }
    
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
