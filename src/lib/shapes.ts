import { AudioFeatures } from './audio';

export const PARTICLE_COUNT = 60000;

export const SHAPE_NAMES = [
  'DNA_1_Orbits', 'DNA_2_Ribbons', 'DNA_3_FlowField', 'DNA_4_Resonance', 'DNA_5_Fibers', 
  'Identity', 'Signature', 'Mutation', 'Galaxy', 'Menger', 'Lorenz', 'Aizawa'
] as const;

export type ShapeName = typeof SHAPE_NAMES[number];

export interface ShapeData {
  positions: Float32Array;
  progresses: Float32Array;
}

export function getShapeData(shape: ShapeName, features?: AudioFeatures, seed: number = 42): ShapeData {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const progresses = new Float32Array(PARTICLE_COUNT);
  
  for(let i=0; i<PARTICLE_COUNT; i++) {
    progresses[i] = Math.random();
  }

  switch (shape) {
    case 'DNA_2_Ribbons':
      generateDNA(positions, seed, progresses);
      break;
    case 'DNA_3_FlowField':
      generateDNAv2(positions, seed, progresses);
      break;
    case 'DNA_4_Resonance':
      generateDNAv3(positions, seed, progresses);
      break;
    case 'DNA_5_Fibers':
      generateDNAv4(positions, seed, progresses);
      break;
    case 'DNA_1_Orbits':
      generateDNAv5(positions, seed, progresses);
      break;
    case 'Identity':
      generateIdentity(positions, features);
      break;
    case 'Signature':
      generateSignature(positions, features);
      break;
    case 'Mutation':
      generateMutation(positions, features);
      break;
    case 'Galaxy':
      generateGalaxy(positions);
      break;
    case 'Menger':
      generateMenger(positions);
      break;
    case 'Lorenz':
      generateLorenz(positions);
      break;
    case 'Aizawa':
      generateAizawa(positions);
      break;
  }

  return { positions, progresses };
}

function generateGalaxy(positions: Float32Array) {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const t = i / PARTICLE_COUNT;
    const r = 40 * Math.pow(Math.random(), 0.5); 
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.2; 
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
}

function generateMenger(positions: Float32Array) {
  const size = 30;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let x = 0, y = 0, z = 0;
    let valid = false;
    let attempts = 0;
    while(!valid && attempts < 50) {
       x = (Math.random() - 0.5) * size;
       y = (Math.random() - 0.5) * size;
       z = (Math.random() - 0.5) * size;
       valid = true;
       let ts = 1.0;
       for(let depth=0; depth<3; depth++) {
           let ax = Math.floor(Math.abs(x * ts / (size/3))) % 3;
           let ay = Math.floor(Math.abs(y * ts / (size/3))) % 3;
           let az = Math.floor(Math.abs(z * ts / (size/3))) % 3;
           let holes = (ax===1?1:0) + (ay===1?1:0) + (az===1?1:0);
           if (holes > 1) { valid = false; break; }
           ts *= 3.0;
       }
       attempts++;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
}

function generateLorenz(positions: Float32Array) {
  const sigma = 10;
  const rho = 28;
  const beta = 8/3;
  
  let x = 0.1, y = 0.0, z = 0.0;
  const dt = 0.005; // Finer stable dt for 100k particles

  // Warm-up phase to skip the dense initial transient state which causes a hotspot
  for (let w = 0; w < 5000; w++) {
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    x += dx; y += dy; z += dz;
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Single step per particle for a continuous, smooth filament look
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    x += dx; y += dy; z += dz;

    // Scale up slightly for clarity and to prevent central density mud
    const scale = 1.3;
    positions[i * 3] = x * scale;
    positions[i * 3 + 1] = y * scale;
    positions[i * 3 + 2] = (z - 25) * scale; 
  }
}

function generateMutation(positions: Float32Array, features?: AudioFeatures) {
  if (!features) {
    features = { energy: 0.5, dynamics: 0.5, spectralBias: 0.5 };
  }

  const total = PARTICLE_COUNT;
  
  // Allocate ratios based on audio features
  let lineRatio = 0.2 + features.dynamics * 0.5;
  let surfaceRatio = 0.2 + features.spectralBias * 0.5;
  let pointRatio = Math.max(0.1, 1.0 - lineRatio - surfaceRatio);
  
  const sum = lineRatio + surfaceRatio + pointRatio;
  lineRatio /= sum;
  surfaceRatio /= sum;
  pointRatio /= sum;

  const lineCount = Math.floor(total * lineRatio);
  const surfaceCount = Math.floor(total * surfaceRatio);
  const pointCount = total - lineCount - surfaceCount;
  
  let offset = 0;
  const scale = 25 + features.energy * 15;

  // 1. Lines Layer (Twisting inner strands)
  const numStrands = Math.floor(3 + features.dynamics * 12);
  for(let i=0; i<lineCount; i++) {
    const t = i / lineCount; 
    const strandIdx = i % numStrands;
    const strandPhase = (strandIdx / numStrands) * Math.PI * 2;
    
    const z = (t - 0.5) * scale * 2.0;
    const radius = scale * 0.4 * (1 + 0.5 * Math.sin(t * Math.PI * 6 * features.dynamics));
    const angle = t * Math.PI * 15 * features.energy + strandPhase;
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    const noise = (Math.random() - 0.5) * 0.8;
    
    positions[offset * 3]     = x + noise;
    positions[offset * 3 + 1] = y + noise;
    positions[offset * 3 + 2] = z + noise;
    offset++;
  }

  // 2. Surface Layer (Intersecting Disks / Geometric Planes)
  const numPlanes = Math.floor(4 + features.spectralBias * 8);
  for(let i=0; i<surfaceCount; i++) {
    const planeIdx = i % numPlanes;
    const planePhase1 = (planeIdx / numPlanes) * Math.PI;
    const planePhase2 = ((planeIdx * 2) / numPlanes) * Math.PI;
    
    const radius = scale * (0.3 + 0.7 * Math.sqrt(Math.random())); // Uniform disk scattering
    const theta = Math.random() * Math.PI * 2;
    
    const px = Math.cos(theta) * radius;
    const py = Math.sin(theta) * radius;
    const pz = (Math.random() - 0.5) * 1.5; // Thin plane thickness
    
    // 3D Rotation for the plane
    const rx = px * Math.cos(planePhase1) - pz * Math.sin(planePhase1);
    const rz = px * Math.sin(planePhase1) + pz * Math.cos(planePhase1);
    
    const ry = py * Math.cos(planePhase2) - rz * Math.sin(planePhase2);
    const finalZ = py * Math.sin(planePhase2) + rz * Math.cos(planePhase2);
    
    positions[offset * 3]     = rx;
    positions[offset * 3 + 1] = ry;
    positions[offset * 3 + 2] = finalZ;
    offset++;
  }

  // 3. Volume/Point Layer (Outer Nebula Cloud)
  for(let i=0; i<pointCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const w = Math.random();
    
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(w) * scale * 1.6; // Push volume outwards
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    positions[offset * 3]     = x;
    positions[offset * 3 + 1] = y;
    positions[offset * 3 + 2] = z;
    offset++;
  }
}

function generateAizawa(positions: Float32Array) {
  const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
  const dt = 0.01;

  let x = 0.1, y = 0.0, z = 0.0;

  // Warm-up to skip transient state
  for (let w = 0; w < 5000; w++) {
    const dx = ((z - b) * x - d * y) * dt;
    const dy = (d * x + (z - b) * y) * dt;
    const dz = (c + a * z - (z * z * z)/3 - (x * x + y * y) * (1 + e * z) + f * z * (x * x * x)) * dt;
    x += dx; y += dy; z += dz;
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    for (let step = 0; step < 2; step++) {
       const dx = ((z - b) * x - d * y) * dt;
       const dy = (d * x + (z - b) * y) * dt;
       const dz = (c + a * z - (z * z * z)/3 - (x * x + y * y) * (1 + e * z) + f * z * (x * x * x)) * dt;
       x += dx; y += dy; z += dz;
    }

    positions[i * 3] = x * 15;
    positions[i * 3 + 1] = y * 15;
    positions[i * 3 + 2] = z * 15;
  }
}

function xorshift32(state: { seed: number }) {
  let x = state.seed;
  if(x === 0) x = 1;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  state.seed = x;
  return (x >>> 0) / 4294967296.0;
}

function generateDNA(positions: Float32Array, seed: number, progresses?: Float32Array) {
  const state = { seed: seed !== 0 ? seed : 0x99999999 };
  const random = () => xorshift32(state);

  const archetypeSeed = random();
  const scale = 25 + random() * 20;

  if (archetypeSeed < 0.25) {
    // Type A: The Ribbons (Lissajous knots / 3D curves)
    const numRibbons = Math.floor(2 + random() * 8);
    const particlesPerRibbon = Math.floor(PARTICLE_COUNT / numRibbons);
    const mainA = 1 + Math.floor(random() * 7);
    const mainB = 1 + Math.floor(random() * 7);
    const mainC = 1 + Math.floor(random() * 7);
    const lineNoise = random() * 0.15; // Lower for crisp laser-like lines
    
    for (let r = 0; r < numRibbons; r++) {
       const a = mainA + Math.floor(random() * 3) - 1;
       const b = mainB + Math.floor(random() * 3) - 1;
       const c = mainC + Math.floor(random() * 3) - 1;
       const phaseA = random() * Math.PI * 2;
       const phaseB = random() * Math.PI * 2;
       const phaseC = random() * Math.PI * 2;
       
       for (let i = 0; i < particlesPerRibbon; i++) {
           const t = (i / particlesPerRibbon) * Math.PI * 2 * (5 + random() * 10); 
           const idx = r * particlesPerRibbon + i;
           if (idx >= PARTICLE_COUNT) break;
           
           const spread = random() * lineNoise;
           
           positions[idx * 3]     = scale * Math.sin(a * t + phaseA) + (random() - 0.5) * spread;
           positions[idx * 3 + 1] = scale * Math.sin(b * t + phaseB) + (random() - 0.5) * spread;
           positions[idx * 3 + 2] = scale * Math.cos(c * t + phaseC) + (random() - 0.5) * spread;
       }
    }
  } else if (archetypeSeed < 0.5) {
    // Type B: The Starburst / Nebula
    const rays = Math.floor(5 + random() * 40);
    const particlesPerRay = Math.floor(PARTICLE_COUNT / rays);
    const twist = random() > 0.5 ? random() * Math.PI * 5 : 0;
    let pIdx = 0;
    for(let r=0; r<rays; r++) {
        const theta = random() * Math.PI * 2;
        const phi = Math.acos(2 * random() - 1);
        
        for(let i=0; i<particlesPerRay; i++) {
            if (pIdx >= PARTICLE_COUNT) break;
            const normalizedDist = random();
            const dist = scale * 1.5 * Math.pow(normalizedDist, 0.5 + random() * 2.0); // Curve distribution
            
            // Add twist based on distance
            const currentTheta = theta + twist * normalizedDist;
            const currentPhi = phi + twist * 0.5 * normalizedDist;
            
            const dirX = Math.sin(currentPhi) * Math.cos(currentTheta);
            const dirY = Math.sin(currentPhi) * Math.sin(currentTheta);
            const dirZ = Math.cos(currentPhi);
            
            const spread = dist * (0.002 + random() * 0.015); // Much sharper lines
            positions[pIdx * 3]     = dirX * dist + (random()-0.5)*spread;
            positions[pIdx * 3 + 1] = dirY * dist + (random()-0.5)*spread;
            positions[pIdx * 3 + 2] = dirZ * dist + (random()-0.5)*spread;
            pIdx++;
        }
    }
    // Fill remaining
    while(pIdx < PARTICLE_COUNT) {
        positions[pIdx * 3] = (random()-0.5)*scale;
        positions[pIdx * 3+1] = (random()-0.5)*scale;
        positions[pIdx * 3+2] = (random()-0.5)*scale;
        pIdx++;
    }
  } else if (archetypeSeed < 0.75) {
    // Type C: The Organic Web (Nodes and Connections)
    const numNodes = Math.floor(10 + random() * 40);
    const connectivity = random();
    const nodes = [];
    for(let i=0; i<numNodes; i++) {
        // Use spherical distribution for more organic node placement
        const theta = random() * Math.PI * 2;
        const phi = Math.acos(2 * random() - 1);
        const r = scale * Math.pow(random(), 0.5); 
        nodes.push({
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi)
        });
    }
    
    let pIdx = 0;
    for(let i=0; i<numNodes; i++) {
        for(let j=i+1; j<numNodes; j++) {
            if (random() > 1.0 - connectivity) { 
                const edgeParticles = Math.floor(PARTICLE_COUNT / (numNodes * 3.0));
                
                // create a control point for bezier curve to make it flow organically
                const cpX = (nodes[i].x + nodes[j].x) / 2 + (random() - 0.5) * scale * 1.5;
                const cpY = (nodes[i].y + nodes[j].y) / 2 + (random() - 0.5) * scale * 1.5;
                const cpZ = (nodes[i].z + nodes[j].z) / 2 + (random() - 0.5) * scale * 1.5;

                for(let k=0; k<edgeParticles; k++) {
                    if(pIdx >= PARTICLE_COUNT) break;
                    // Use a slightly curved distribution for points along the edge
                    const rawT = random();
                    const t = rawT * rawT * (3 - 2 * rawT); // smoothstep distribution
                    const spread = scale * 0.005 * random(); // Tighter, crisper web
                    
                    // Quadratic bezier interpolation
                    const mt = 1 - t;
                    const bx = mt * mt * nodes[i].x + 2 * mt * t * cpX + t * t * nodes[j].x;
                    const by = mt * mt * nodes[i].y + 2 * mt * t * cpY + t * t * nodes[j].y;
                    const bz = mt * mt * nodes[i].z + 2 * mt * t * cpZ + t * t * nodes[j].z;
                    
                    positions[pIdx*3]     = bx + (random()-0.5)*spread;
                    positions[pIdx*3+1] = by + (random()-0.5)*spread;
                    positions[pIdx*3+2] = bz + (random()-0.5)*spread;
                    pIdx++;
                }
            }
        }
    }
    
    // Core node clusters
    for(let i=0; i<numNodes; i++) {
        const clusterSize = Math.floor(PARTICLE_COUNT * 0.15 / numNodes);
        for(let k=0; k<clusterSize; k++) {
            if(pIdx >= PARTICLE_COUNT) break;
            const r = random() * 4.0;
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            positions[pIdx*3] = nodes[i].x + r * Math.sin(phi) * Math.cos(theta);
            positions[pIdx*3+1] = nodes[i].y + r * Math.sin(phi) * Math.sin(theta);
            positions[pIdx*3+2] = nodes[i].z + r * Math.cos(phi);
            pIdx++;
        }
    }
    
    while(pIdx < PARTICLE_COUNT) {
        // Organic background dust
        const theta = random() * Math.PI * 2;
        const phi = Math.acos(2 * random() - 1);
        const r = scale * 1.2 * random(); 
        positions[pIdx * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[pIdx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[pIdx * 3 + 2] = r * Math.cos(phi);
        pIdx++;
    }
  } else {
    // Type D: Morphing Geometric Shells (New varied shape depending purely on harmonics)
    const shells = Math.floor(3 + random() * 8);
    const m1 = Math.floor(1 + random() * 10);
    const m2 = Math.floor(1 + random() * 10);
    const n1 = 0.5 + random() * 2.0;
    const n2 = 0.5 + random() * 2.0;
    const n3 = 0.5 + random() * 2.0;
    
    const superformula = (phi: number, m: number, n1: number, n2: number, n3: number) => {
        const a = 1, b = 1;
        const part1 = Math.pow(Math.abs(Math.cos(m * phi / 4) / a), n2);
        const part2 = Math.pow(Math.abs(Math.sin(m * phi / 4) / b), n3);
        const r = Math.pow(part1 + part2, -1 / n1);
        return isNaN(r) || !isFinite(r) ? 0 : r;
    };
    
    let pIdx = 0;
    for(let i=0; i<PARTICLE_COUNT; i++) {
        const shellIdx = Math.floor(random() * shells);
        const rScale = scale * (0.2 + (shellIdx / shells) * 0.8);
        
        const theta = random() * Math.PI * 2;
        const phi = random() * Math.PI - Math.PI/2;
        
        const r1 = superformula(theta, m1, n1, n2, n3);
        const r2 = superformula(phi, m2, n1, n2, n3);
        
        const x = rScale * r1 * Math.cos(theta) * r2 * Math.cos(phi);
        const y = rScale * r1 * Math.sin(theta) * r2 * Math.cos(phi);
        const z = rScale * r2 * Math.sin(phi);
        
        const spread = (random() - 0.5) * scale * 0.008 * (shellIdx + 1); // Reduced jitter
        
        positions[pIdx * 3]     = x + spread;
        positions[pIdx * 3 + 1] = y + spread;
        positions[pIdx * 3 + 2] = z + spread;
        pIdx++;
    }
  }
}

function generateDNAv2(positions: Float32Array, seed: number, progresses?: Float32Array) {
  const state = { seed: seed !== 0 ? seed : 0x11111111 };
  const random = () => xorshift32(state);

  const archetypeSeed = random();
  const scale = 35 + random() * 20;
  
  let pIdx = 0;

  if (archetypeSeed < 0.33) {
    // Type 1: Trig Flow Field Ribbons (Smooth, continuous glowing streams)
    const A = -1 + random() * 2;
    const B = -1 + random() * 2;
    const C = -1 + random() * 2;
    const numTrails = 3 + Math.floor(random() * 8);
    const pPerTrail = Math.floor((PARTICLE_COUNT * 0.85) / numTrails);
    
    for(let t=0; t<numTrails; t++) {
        let x = (random() - 0.5) * 5;
        let y = (random() - 0.5) * 5;
        let z = (random() - 0.5) * 5;
        const dt = 0.015;
        for(let i=0; i<pPerTrail; i++) {
             if (pIdx >= PARTICLE_COUNT) break;
             const dx = Math.sin(A * y) - z * Math.cos(B * x);
             const dy = Math.sin(B * z) - x * Math.cos(C * y);
             const dz = Math.sin(C * x) - y * Math.cos(A * z);
             
             // normalize to maintain smooth velocity
             const len = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.0001;
             x += (dx/len) * dt * 5;
             y += (dy/len) * dt * 5;
             z += (dz/len) * dt * 5;
             
             // Ribbon tiny thickness
             const w = scale * 0.005 * random();
             
             positions[pIdx * 3]     = x * scale * 0.25 + w;
             positions[pIdx * 3 + 1] = y * scale * 0.25 - w;
             positions[pIdx * 3 + 2] = z * scale * 0.25 + w;
             pIdx++;
        }
    }
  } else if (archetypeSeed < 0.66) {
    // Type 2: Liquid Blossom / Spherical Harmonics (Organic symmetry that bursts from center)
    const m = 1 + Math.floor(random() * 5);
    const n1 = 1 + Math.floor(random() * 7);
    const n2 = 1 + Math.floor(random() * 7);
    const pathCount = 80 + Math.floor(random() * 150);
    const pointsPerPath = Math.floor(PARTICLE_COUNT * 0.8 / pathCount);
    
    for(let i=0; i<pathCount; i++) {
        const twistTheta = random() * Math.PI * 2;
        const twistPhi = random() * Math.PI;
        const stretch = 0.5 + random();
        const twistAmount = 2.0 + random() * 5.0; // Gravity twisting
        
        for(let j=0; j<pointsPerPath; j++) {
            if(pIdx >= PARTICLE_COUNT) break;
            const t = (j / pointsPerPath) * Math.PI; // Creates natural arching loops
            
            // Base organic radius tied to harmonic frequency
            const r = scale * (0.4 + 0.6 * Math.abs(Math.sin(m * t))) * stretch;
            
            const theta = n1 * t + twistTheta + (t * twistAmount);
            const phi = n2 * t + twistPhi;
            
            // Jitter for organic particle trail look
            const jitter = scale * 0.003 * random();
            
            positions[pIdx * 3]     = r * Math.sin(phi) * Math.cos(theta) + jitter;
            positions[pIdx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) - jitter;
            positions[pIdx * 3 + 2] = r * Math.cos(phi) + jitter;
            pIdx++;
        }
    }
  } else {
    // Type 3: Torus Knot Silk (Elegantly wrapping geometric thread)
    const pNum = 1 + Math.floor(random() * 6);
    const qNum = 2 + Math.floor(random() * 5);
    const numKnots = 15 + Math.floor(random() * 30);
    const particlesPerKnot = Math.floor(PARTICLE_COUNT * 0.85 / numKnots);
    
    for(let r=0; r<numKnots; r++) {
        const R = scale * (0.3 + 0.7 * random()); // Main torus radius
        const r2 = scale * (0.1 + 0.4 * random()); // Tube radius
        const phasePhi = random() * Math.PI * 2;
        const width = scale * 0.005 * random(); 
        
        for(let i=0; i<particlesPerKnot; i++) {
            if (pIdx >= PARTICLE_COUNT) break;
            // Generate dense continuous trail mapping
            const t = (i / particlesPerKnot) * Math.PI * 2;
            const theta = pNum * t;
            const phi = qNum * t + phasePhi;
            
            const rawX = (R + r2 * Math.cos(theta)) * Math.cos(phi);
            const rawY = (R + r2 * Math.cos(theta)) * Math.sin(phi);
            const rawZ = r2 * Math.sin(theta);
            
            // Micro-variations so it feels like a physical silk thread composed of fine particle dust
            const w1 = width * Math.sin(t * 150);
            const w2 = width * Math.cos(t * 150);
            
            positions[pIdx * 3]     = rawX + w1;
            positions[pIdx * 3 + 1] = rawY + w2;
            positions[pIdx * 3 + 2] = rawZ + (w1-w2);
            pIdx++;
        }
    }
  }

  // 30% ambient/gravitational star dust (Mixed Topologies)
  while(pIdx < PARTICLE_COUNT) {
    const u = random();
    const v = random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    
    // Exponential falloff so dust gathers around the center of mass, but more diffuse
    const r = scale * 1.8 * Math.pow(random(), 0.8); 
    positions[pIdx * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[pIdx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[pIdx * 3 + 2] = r * Math.cos(phi);
    pIdx++;
  }
}

function generateDNAv3(positions: Float32Array, seed: number, progresses?: Float32Array) {
  const state = { seed: seed !== 0 ? seed : 0x22222222 };
  const random = () => xorshift32(state);

  const archetypeSeed = random();
  const scale = 30 + random() * 15;
  let pIdx = 0;

  if (archetypeSeed < 0.33) {
    // Type 1: Orbital Resonance (Elegant concentric rings with subtle organic warping)
    const numRings = 5 + Math.floor(random() * 12);
    const particlesPerRing = Math.floor((PARTICLE_COUNT * 0.9) / numRings);
    const ringBaseTilts = Array.from({length: numRings}, () => (random() - 0.5) * 0.5);
    const ringWarpFreq = Array.from({length: numRings}, () => Math.floor(1 + random() * 5));
    
    for (let r = 0; r < numRings; r++) {
      const radius = scale * (0.1 + 0.9 * Math.pow(r / numRings, 1.5));
      const tiltX = (random() - 0.5) * Math.PI * 0.5 * (r / numRings);
      const tiltZ = (random() - 0.5) * Math.PI * 0.5 * (r / numRings);
      const warp = ringWarpFreq[r];
      const warpAmp = radius * 0.05 * random();
      const thickness = scale * 0.002 * (1 + random() * 2);
      
      for (let i = 0; i < particlesPerRing; i++) {
        if (pIdx >= PARTICLE_COUNT) break;
        const t = (i / particlesPerRing) * Math.PI * 2;
        
        // Base ring
        let x = radius * Math.cos(t);
        let y = warpAmp * Math.sin(warp * t);
        let z = radius * Math.sin(t);
        
        // Tilt
        let tx = x;
        let ty = y * Math.cos(tiltX) - z * Math.sin(tiltX);
        let tz = y * Math.sin(tiltX) + z * Math.cos(tiltX);
        
        x = tx * Math.cos(tiltZ) - ty * Math.sin(tiltZ);
        y = tx * Math.sin(tiltZ) + ty * Math.cos(tiltZ);
        z = tz;
        
        // Crisp spread
        const u = random() * 2 * Math.PI;
        const v = random() * thickness;
        
        positions[pIdx * 3]     = x + Math.cos(u) * v;
        positions[pIdx * 3 + 1] = y + Math.sin(u) * v;
        positions[pIdx * 3 + 2] = z + (random()-0.5) * thickness;
        pIdx++;
      }
    }
  } else if (archetypeSeed < 0.66) {
    // Type 2: The Ethereal Lotus (Symmetrical overlapping parametric petals)
    const petals = 3 + Math.floor(random() * 6);
    const layers = 2 + Math.floor(random() * 4);
    const pointsPerLayer = Math.floor((PARTICLE_COUNT * 0.9) / layers);
    
    for (let l = 0; l < layers; l++) {
      const layerScale = scale * (0.3 + 0.7 * (l / layers));
      const layerOffset = (random() - 0.5) * Math.PI;
      const verticalCurve = 0.5 + random() * 1.5;
      
      for (let i = 0; i < pointsPerLayer; i++) {
        if (pIdx >= PARTICLE_COUNT) break;
        // Surface parameters u, v
        const u = random(); // radial distance
        const v = random() * Math.PI * 2; // angle
        
        // Petal shape function
        const petalShape = Math.abs(Math.sin((v + layerOffset) * petals / 2));
        // Soft curve mapping
        const r = layerScale * u * (0.2 + 0.8 * petalShape);
        const elevation = layerScale * 0.5 * Math.pow(u, verticalCurve) * Math.cos((v + layerOffset) * petals);
        
        const spread = scale * 0.003 * random();
        
        positions[pIdx * 3]     = r * Math.cos(v) + (random()-0.5)*spread;
        positions[pIdx * 3 + 1] = elevation + (random()-0.5)*spread;
        positions[pIdx * 3 + 2] = r * Math.sin(v) + (random()-0.5)*spread;
        pIdx++;
      }
    }
  } else {
    // Type 3: Radiant Star-Ribbons (Center-out flowing ribbons with mild rotational symmetry)
    const numArms = 4 + Math.floor(random() * 10);
    const linesPerArm = 5 + Math.floor(random() * 15);
    const pPerLine = Math.floor((PARTICLE_COUNT * 0.9) / (numArms * linesPerArm));
    const twist = (random() - 0.5) * 4.0;
    const droop = (random() - 0.5) * 2.0;
    
    for (let a = 0; a < numArms; a++) {
      const baseAngle = (a / numArms) * Math.PI * 2;
      
      for (let l = 0; l < linesPerArm; l++) {
        const lineOffsetAngle = baseAngle + (random() - 0.5) * 0.3; // Slight spread within the arm
        const lineLength = scale * (0.4 + 0.6 * random());
        const width = scale * 0.002 * random();
        
        for (let i = 0; i < pPerLine; i++) {
          if (pIdx >= PARTICLE_COUNT) break;
          const t = i / (pPerLine - 1);
          
          // Smooth easing outward
          const easedT = t * t * (3 - 2 * t);
          
          const currentRadius = lineLength * easedT;
          const currentAngle = lineOffsetAngle + twist * easedT;
          const currentY = droop * lineLength * Math.sin(easedT * Math.PI);
          
          positions[pIdx * 3]     = currentRadius * Math.cos(currentAngle) + (random()-0.5)*width;
          positions[pIdx * 3 + 1] = currentY + (random()-0.5)*width;
          positions[pIdx * 3 + 2] = currentRadius * Math.sin(currentAngle) + (random()-0.5)*width;
          pIdx++;
        }
      }
    }
  }

  // Common Core + Cosmic Dust for all of them
  const coreParticles = PARTICLE_COUNT - pIdx;
  for(let i=0; i < coreParticles; i++) {
    if (pIdx >= PARTICLE_COUNT) break;
    const u = random();
    const v = random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    
    // Less clumpy core
    const r = scale * 0.15 * Math.pow(random(), 0.8);
    positions[pIdx * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[pIdx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[pIdx * 3 + 2] = r * Math.cos(phi);
    pIdx++;
  }
}

function generateDNAv4(positions: Float32Array, seed: number, progresses?: Float32Array) {
  const state = { seed: seed !== 0 ? seed : 0x33333333 };
  const random = () => xorshift32(state);

  const scale = 40 + random() * 20;
  let pIdx = 0;

  // Type: Ethereal Fibers (Continuous smooth lines flowing outward from center)
  // We use very tight particle spacing to form crisp lines that light up to the music.

  const numFibers = 12 + Math.floor(random() * 25);
  const pPerFiber = Math.floor((PARTICLE_COUNT * 0.95) / numFibers);

  // Different fiber types for variation
  const fiberGroupType = random();

  for (let f = 0; f < numFibers; f++) {
    // Each fiber has a base direction
    const u = random() * Math.PI * 2;
    const v = Math.acos(2.0 * random() - 1.0);

    const dirX = Math.sin(v) * Math.cos(u);
    const dirY = Math.sin(v) * Math.sin(u);
    const dirZ = Math.cos(v);

    // Parametric properties for the fiber curve
    const flexAmplitude = scale * (0.1 + 0.3 * random());
    const flexFreqX = 1 + random() * 3;
    const flexFreqY = 1 + random() * 3;
    const flexFreqZ = 1 + random() * 3;
    const spiral = random() > 0.5 ? (random() > 0.5 ? 2.0 : -2.0) * random() : 0;
    const maxDist = scale * (0.8 + 0.5 * random());

    const width = scale * 0.001 * random(); // Extremely crisp lines

    for (let i = 0; i < pPerFiber; i++) {
      if (pIdx >= PARTICLE_COUNT) break;

      const t = i / (pPerFiber - 1);
      // t flows from 0 to 1
      if (progresses) {
        progresses[pIdx] = t; // we store the progression!
      }

      // Easing function so particles are denser near the center
      const r_t = t * t; 

      const currentDist = maxDist * r_t;

      // Base linear expansion
      let bx = dirX * currentDist;
      let by = dirY * currentDist;
      let bz = dirZ * currentDist;

      // Add organic curving and spiraling
      bx += flexAmplitude * Math.sin(flexFreqX * t * Math.PI) * r_t;
      by += flexAmplitude * Math.cos(flexFreqY * t * Math.PI) * r_t;
      bz += flexAmplitude * Math.sin(flexFreqZ * t * Math.PI + Math.PI/4) * r_t;

      // Optional spiral around the original axis
      if (spiral !== 0) {
        const spiralAngle = spiral * t * Math.PI * 2;
        // Simple rotation around Z axis just for some twist (or arbitrary axis)
        const tx = bx * Math.cos(spiralAngle) - by * Math.sin(spiralAngle);
        const ty = bx * Math.sin(spiralAngle) + by * Math.cos(spiralAngle);
        bx = tx;
        by = ty;
      }

      positions[pIdx * 3]     = bx + (random()-0.5) * width;
      positions[pIdx * 3 + 1] = by + (random()-0.5) * width;
      positions[pIdx * 3 + 2] = bz + (random()-0.5) * width;
      pIdx++;
    }
  }

  // Core dust glow to anchor the center
  while(pIdx < PARTICLE_COUNT) {
    if (progresses) progresses[pIdx] = 0.0; // The core stays lit at time 0
    const u = random() * Math.PI * 2;
    const v = Math.acos(2.0 * random() - 1.0);
    const r = scale * 0.15 * Math.pow(random(), 0.8); // Less clumped core
    positions[pIdx * 3]     = r * Math.sin(v) * Math.cos(u);
    positions[pIdx * 3 + 1] = r * Math.sin(v) * Math.sin(u);
    positions[pIdx * 3 + 2] = r * Math.cos(v);
    pIdx++;
  }
}

function generateDNAv5(positions: Float32Array, seed: number, progresses?: Float32Array) {
  const state = { seed: seed !== 0 ? seed : 0x55555555 };
  const random = () => xorshift32(state);

  const scale = 50 + random() * 20;
  let pIdx = 0;
  
  // Mixed topology elements: Lines (Orbits), Points (Starfield)
  // We want heavily line-dominant structures.
  const numOrbits = 6 + Math.floor(random() * 8); // more rings, elegant long petals
  const orbitParticles = Math.floor((PARTICLE_COUNT * 0.88) / numOrbits); 
  
  const starParticles = Math.floor(PARTICLE_COUNT * 0.10); // 10% background stars
  
  // 1. Orbits (Crisp, elegant intersecting ellipses/rings)
  for (let o = 0; o < numOrbits; o++) {
    // Elegant elongated ellipses passing closely to center
    const rx = scale * (0.8 + random() * 1.5);
    const ry = scale * (0.02 + random() * 0.15); // Very flat ovals (squashed rings)
    
    // Random rotation for the orbit plane
    const rotX = (random() - 0.5) * Math.PI * 2;
    const rotY = (random() - 0.5) * Math.PI * 2;
    const rotZ = (random() - 0.5) * Math.PI * 2;
    const width = scale * 0.0005 + random() * 0.001; // Extremely sharp lines

    const clusterFreq = 1 + Math.floor(random() * 4); // 1-4 high density points on ring
    const clusterStrength = 0.1 + random() * 0.15; // How strongly they cluster

    for (let i = 0; i < orbitParticles; i++) {
        if (pIdx >= PARTICLE_COUNT) break;
        
        const rawT = i / (orbitParticles - 1); 
        // Distortion for density variation (rhythmic clustering)
        const t = rawT + Math.sin(rawT * Math.PI * 2 * clusterFreq) * clusterStrength; 
        
        // To maintain flow, progresses needs a monotonic progression, or at least smooth.
        if (progresses) progresses[pIdx] = t; // Flows over time

        const angle = t * Math.PI * 2;
        let bx = Math.cos(angle) * rx;
        let by = Math.sin(angle) * ry;
        let bz = 0;
        
        // Appy rotations
        // X-axis
        let tx = bx;
        let ty = by * Math.cos(rotX) - bz * Math.sin(rotX);
        let tz = by * Math.sin(rotX) + bz * Math.cos(rotX);
        
        // Z-axis
        bx = tx * Math.cos(rotZ) - ty * Math.sin(rotZ);
        by = tx * Math.sin(rotZ) + ty * Math.cos(rotZ);
        bz = tz;

        // Y-axis
        tx = bx * Math.cos(rotY) + bz * Math.sin(rotY);
        tz = -bx * Math.sin(rotY) + bz * Math.cos(rotY);
        bx = tx;
        bz = tz;

        positions[pIdx * 3]     = bx + (random()-0.5) * width;
        positions[pIdx * 3 + 1] = by + (random()-0.5) * width;
        positions[pIdx * 3 + 2] = bz + (random()-0.5) * width;
        pIdx++;
    }
  }

  // 2. Distant Starfield (Points)
  for (let i = 0; i < starParticles; i++) {
    if (pIdx >= PARTICLE_COUNT) break;
    if (progresses) progresses[pIdx] = random(); // Firing randomly
    // Far-reaching stars scattered loosely
    const r = scale * (0.5 + random() * 4.0); 
    const u = random() * Math.PI * 2;
    const v = Math.acos(2 * random() - 1);
    
    positions[pIdx * 3]     = r * Math.sin(v) * Math.cos(u);
    positions[pIdx * 3 + 1] = r * Math.sin(v) * Math.sin(u);
    positions[pIdx * 3 + 2] = r * Math.cos(v);
    pIdx++;
  }

  // 3. Very subtle and minimal Core points
  while (pIdx < PARTICLE_COUNT) {
    if (progresses) progresses[pIdx] = random(); 
    // Just a clean tiny cluster
    const r = scale * 0.1 * Math.pow(random(), 1.5); 
    const u = random() * Math.PI * 2;
    const v = Math.acos(2 * random() - 1);
    
    positions[pIdx * 3]     = r * Math.sin(v) * Math.cos(u);
    positions[pIdx * 3 + 1] = r * Math.sin(v) * Math.sin(u);
    positions[pIdx * 3 + 2] = r * Math.cos(v);
    pIdx++;
  }
}

function generateIdentity(positions: Float32Array, features?: AudioFeatures) {
  if (!features) {
    features = { energy: 0.5, dynamics: 0.5, spectralBias: 0.5 };
  }

  const scale = 30 + features.energy * 20;

  // Decide archetype based on audio features
  let archetype = 0;
  if (features.energy < 0.4 && features.dynamics < 0.5) {
    archetype = 0; // Ambient: Nebula Flow Fields
  } else if (features.spectralBias < 0.4 && features.energy > 0.6) {
    archetype = 1; // Techno: Orbital Mechanics, heavy rings
  } else if (features.spectralBias > 0.6 && features.energy < 0.6) {
    archetype = 2; // Piano: Elegant minimal flowing splines
  } else if (features.dynamics > 0.7) {
    archetype = 3; // Orchestral/Epic: Expanding harmonic layers
  } else {
    archetype = 4; // Jazz/Fluid: Asymmetrical fluid ribbons
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let x = 0, y = 0, z = 0;

    switch (archetype) {
      case 0: { // Ambient: Nebula
        const phi = Math.acos(1 - 2 * Math.random());
        const theta = Math.random() * Math.PI * 2;
        const r = scale * Math.cbrt(Math.random()) * 1.5;
        const distortion = Math.sin(phi * 3) * Math.cos(theta * 3) * features.dynamics * 5.0;
        
        x = (r + distortion) * Math.sin(phi) * Math.cos(theta);
        y = (r + distortion) * Math.sin(phi) * Math.sin(theta);
        z = (r + distortion) * Math.cos(phi);
        break;
      }
      case 1: { // Techno: Orbital Mechanics
        const ringSegment = Math.floor(Math.random() * 5); 
        const rBase = scale * (0.3 + ringSegment * 0.2) + (Math.random() - 0.5) * 2.0;
        const theta = Math.random() * Math.PI * 2;
        const zThickness = (Math.random() - 0.5) * 5.0 * (ringSegment + 1) * features.dynamics;
        
        const tilt = (ringSegment % 2 === 0) ? features.spectralBias : 0;
        
        const px = rBase * Math.cos(theta);
        const py = rBase * Math.sin(theta);
        const pz = zThickness;
        
        x = px;
        y = py * Math.cos(tilt) - pz * Math.sin(tilt);
        z = py * Math.sin(tilt) + pz * Math.cos(tilt);
        break;
      }
      case 2: { // Piano: Flowing Splines
        const numSplines = Math.floor(5 + features.spectralBias * 5);
        const splineIdx = i % numSplines;
        const splineNorm = Math.floor(i / numSplines) / (PARTICLE_COUNT / numSplines);
        
        const tVal = splineNorm * Math.PI * 4;
        
        const rad = scale * 0.8 * (0.2 + 0.8 * Math.sin(tVal * 0.5));
        const px = Math.cos(tVal + splineIdx) * rad;
        const pz = Math.sin(tVal + splineIdx) * rad;
        const py = (tVal - Math.PI * 2) * scale * 0.3;
        
        const microAngle = Math.random() * Math.PI * 2;
        const microRad = Math.random() * scale * 0.05;
        
        x = px + Math.cos(microAngle) * microRad;
        y = py + Math.random() * scale * 0.1;
        z = pz + Math.sin(microAngle) * microRad;
        break;
      }
      case 3: { // Orchestral: Expanding harmonic layers
        const layers = Math.floor(4 + features.dynamics * 6);
        const layerIdx = i % layers;
        
        const layerScale = scale * (0.2 + (layerIdx / layers) * 1.2);
        
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        
        const snap = features.dynamics > 0.8 ? 8 : 16;
        const uSnapped = Math.round(u / (Math.PI / snap)) * (Math.PI / snap);
        const vSnapped = Math.round(v / (Math.PI / snap)) * (Math.PI / snap);
        
        const mix = layerIdx % 2 === 0 ? 0.9 : 0.1; 
        const finalU = u * (1 - mix) + uSnapped * mix;
        const finalV = v * (1 - mix) + vSnapped * mix;
        
        x = layerScale * Math.sin(finalV) * Math.cos(finalU);
        y = layerScale * Math.sin(finalV) * Math.sin(finalU);
        z = layerScale * Math.cos(finalV);
        break;
      }
      case 4: { // Jazz: Fluid ribbons
        const curves = Math.floor(3 + features.dynamics * 5);
        const curveIdx = i % curves;
        const norm = i / PARTICLE_COUNT;
        
        const p = 3 + curveIdx + features.spectralBias * 2;
        const q = 2 + features.energy * 3;
        
        const tVal = norm * Math.PI * 2 * 20; 
        
        const rMain = scale * Math.cos(q * tVal / p) + scale * 0.5;
        const xPos = rMain * Math.cos(tVal);
        const zPos = rMain * Math.sin(tVal);
        const yPos = -Math.sin(q * tVal / p) * scale;
        
        const thicknessAngle = Math.random() * Math.PI * 2;
        const thicknessRad = Math.random() * scale * 0.15;
        
        x = xPos + Math.cos(thicknessAngle) * thicknessRad;
        y = yPos + Math.random() * scale * 0.1;
        z = zPos + Math.sin(thicknessAngle) * thicknessRad;
        break;
      }
    }

    positions[i * 3]     = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
}

function generateSignature(positions: Float32Array, features?: AudioFeatures) {
  if (!features) {
    features = { energy: 0.5, dynamics: 0.5, spectralBias: 0.5 };
  }

  // mapping dynamics (0-1) to symmetry modes
  const m1 = Math.floor(1 + features.dynamics * 11);
  const m2 = Math.floor(1 + (1 - features.dynamics) * 11);

  // mapping spectralBias (0-1) to exponents
  const n1_1 = 0.5 + features.spectralBias * 5;
  const n2_1 = 1.0 + (1 - features.spectralBias) * 3;
  const n3_1 = 1.0 + features.spectralBias * 3;

  const n1_2 = 0.5 + (1 - features.spectralBias) * 5;
  const n2_2 = 1.0 + features.spectralBias * 3;
  const n3_2 = 1.0 + (1 - features.spectralBias) * 3;

  const scale = 20 + features.energy * 20;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = i / PARTICLE_COUNT;
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i; // golden angle

      // Superformula components
      const r1_t1 = Math.pow(Math.abs(Math.cos((m1 * theta) / 4)), n2_1);
      const r1_t2 = Math.pow(Math.abs(Math.sin((m1 * theta) / 4)), n3_1);
      const r1_val = r1_t1 + r1_t2;
      const r1 = r1_val === 0 ? 0 : Math.pow(r1_val, -1 / n1_1);

      const r2_t1 = Math.pow(Math.abs(Math.cos((m2 * (phi - Math.PI / 2)) / 4)), n2_2);
      const r2_t2 = Math.pow(Math.abs(Math.sin((m2 * (phi - Math.PI / 2)) / 4)), n3_2);
      const r2_val = r2_t1 + r2_t2;
      const r2 = r2_val === 0 ? 0 : Math.pow(r2_val, -1 / n1_2);

      const x = scale * r1 * Math.cos(theta) * r2 * Math.cos(phi - Math.PI/2);
      const y = scale * r1 * Math.sin(theta) * r2 * Math.cos(phi - Math.PI/2);
      const z = scale * r2 * Math.sin(phi - Math.PI/2);

      const noise = (Math.random() - 0.5) * features.energy * 4.0;

      positions[i * 3]     = x + noise;
      positions[i * 3 + 1] = y + noise;
      positions[i * 3 + 2] = z + noise;
  }
}

