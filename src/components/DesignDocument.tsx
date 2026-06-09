import React from 'react';
import { SHAPE_NAMES } from '../lib/shapes';

export function DesignDocument() {
  const dnaGeometries = SHAPE_NAMES.filter(s => s.startsWith('DNA'));
  const generativeGeometries = SHAPE_NAMES.filter(s => !s.startsWith('DNA'));

  return (
    <div className="min-h-screen bg-[#050608] text-slate-300 relative overflow-x-hidden pt-12 pb-24 font-sans selection:bg-cyan-500/30">
      {/* Ambient background blobs */}
      <div className="absolute pointer-events-none filter blur-[80px] opacity-40 bg-cyan-700 w-96 h-96 rounded-full -top-[100px] -left-[100px] -z-10"></div>
      <div className="absolute pointer-events-none filter blur-[80px] opacity-40 bg-fuchsia-800 w-96 h-96 rounded-full top-[40%] -right-[100px] -z-10"></div>

      <main className="max-w-5xl mx-auto px-6 lg:px-8">
        <header className="mb-16 border-b border-white/10 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            INTERNAL DESIGN DOCUMENT
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            AI Visualizer System <br />
            <span className="text-slate-400 text-3xl font-medium">Design & Implementation Guidelines</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
            A comprehensive guide for stakeholders to understand the AI Visualizer prototype, its underlying design logic, scalable motion frameworks, and aesthetic integration with the Amazon Music brand identity.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-16">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-cyan-500"></span> 1. Context & Overview
              </h2>
              <div className="bg-slate-800/40 border border-slate-400/10 backdrop-blur-xl p-6 md:p-8 rounded-2xl space-y-6">
                <div className="space-y-4 text-slate-300">
                  <p className="leading-relaxed">
                    The particle-based direction has the strongest potential as a scalable visual mode for Ambient and lean-back viewing experiences across large screens and devices.
                  </p>
                  <p className="leading-relaxed">
                    This framework and prototype were created to establish a more intentional, system-driven foundation for AI visualizer experiences by defining reusable motion principles, scalable visual behaviors, and data-informed aesthetic constraints rooted in the particle-based direction.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div>
                    <h4 className="text-cyan-400 font-mono text-sm mb-2">01 — What is this?</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      A visual exploration tool and motion framework for rapidly prototyping, testing, and evaluating scalable AI visualizer systems and motion behaviors.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-cyan-400 font-mono text-sm mb-2">02 — The Goal</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      To identify visual patterns and motion principles that can consistently scale across the broader Amazon Music ecosystem.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h4 className="text-cyan-400 font-mono text-sm mb-3">03 — What this prototype explores</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Core motion frameworks', 'Adaptive visual identities', 'Audio-reactive behaviors', 'Genre-based color systems', 'Scalable particle and geometry systems'].map(item => (
                      <span key={item} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-purple-500"></span> 2. Design Principles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/40 border border-slate-400/10 backdrop-blur-xl p-6 rounded-2xl">
                  <div className="h-32 mb-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex flex-col items-center justify-center gap-2 overflow-hidden">
                     <div className="flex gap-2 isolate">
                        <div className="w-12 h-12 bg-rose-500/80 rounded-full mix-blend-screen animate-pulse"></div>
                        <div className="w-12 h-12 bg-cyan-500/80 rounded-full mix-blend-screen -ml-6 saturate-150 animate-pulse delay-75"></div>
                     </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Adaptive Identity</h3>
                  <p className="text-sm text-slate-400">Each track generates its own unique <strong className="text-slate-200">AI-generated</strong> geometry and motion personality, meaning the visualizer behaves predictably given a specific audio signature.</p>
                </div>

                <div className="bg-slate-800/40 border border-slate-400/10 backdrop-blur-xl p-6 rounded-2xl">
                  <div className="h-32 mb-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-500 animate-[spin_10s_linear_infinite]"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Scalable Motion Language</h3>
                  <p className="text-sm text-slate-400">Establishing consistent, recognizable motion behaviors—rather than random noise—ensures the visualizer feels purposefully integrated into the Amazon Music brand identity.</p>
                </div>
                
                <div className="bg-slate-800/40 border border-slate-400/10 backdrop-blur-xl p-6 rounded-2xl">
                  <div className="h-32 mb-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden relative">
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
                     <div className="flex gap-1 items-end h-12 z-10">
                        {[40, 70, 30, 90, 50].map((h, i) => (
                           <div key={i} className="w-3 bg-purple-500/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                     </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Audio-Reactive Behaviors</h3>
                  <p className="text-sm text-slate-400">Visual attributes like bloom, particle speed, and scale physically respond to the track's real-time energy, rhythm, and structural dynamics.</p>
                </div>

                <div className="bg-slate-800/40 border border-slate-400/10 backdrop-blur-xl p-6 rounded-2xl">
                  <div className="h-32 mb-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center p-4">
                     <div className="w-full h-full rounded bg-gradient-to-r from-blue-600 to-indigo-900 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
                     </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Genre-driven Palettes</h3>
                  <p className="text-sm text-slate-400">To prevent visual chaos, palettes are structurally limited (max 2 distinct particle colors) and adapt intelligently to the mood and genre of the playing track.</p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-fuchsia-500"></span> 3. Interacting with the Prototype
              </h2>
              <div className="bg-slate-800/40 border border-slate-400/10 backdrop-blur-xl p-6 rounded-2xl">
                 <ul className="space-y-4 text-sm text-slate-300">
                   <li className="flex items-start gap-3">
                     <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">1</span>
                     <div>
                       <strong className="text-white">Track Upload & Playback:</strong> Users can upload MP3s or select default tracks. The audio engine (Web Audio API) analyzes the track immediately.
                     </div>
                   </li>
                   <li className="flex items-start gap-3">
                     <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">2</span>
                     <div>
                       <strong className="text-white">Geometry Menu:</strong> Located bottom right. Users can switch between fixed genetic shapes (DNA series) and reactive mathematical attractors (Lorenz, Menger, Identity, etc.).
                     </div>
                   </li>
                   <li className="flex items-start gap-3">
                     <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">3</span>
                     <div>
                       <strong className="text-white">Fine-Tuning Controls (GUI):</strong> Expandable "Controls" modal allows granular adjustments to Bloom, Beat Pulse, Noise Fields, and Rotation speed to test physical motion boundaries.
                     </div>
                   </li>
                 </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-amber-500"></span> 4. Visual Systems: Color & Backgrounds
              </h2>
              <p className="mb-4 text-slate-400 text-sm">To ensure readability and cohesiveness, the color philosophy strictly separates Structural Shapes (DNA) from Expressive Geometries, while utilizing specific visual modes to handle contrast.</p>
              
              <div className="space-y-6">
                
                {/* Logic 1 */}
                <div className="bg-slate-800/40 border border-slate-400/10 border-l-[4px] border-l-teal-500 backdrop-blur-xl p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-2">Category 1: DNA Series (Genetic Archetypes)</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Includes currently synced models: <br/>
                    {dnaGeometries.map(g => <em key={g} className="text-slate-300 mr-2">{g}</em>)}
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 mb-4">
                    <li><strong>Extraction Principle:</strong> Hashing & Seeding (<code>xorshift</code>).</li>
                    <li><strong>Logic:</strong> This series uses the audio file's intrinsic attributes (filename string, size) to generate a permanent mathematical seed.</li>
                    <li><strong>Effect:</strong> The color palette is physically tied to the specific file. It does <em>not</em> change based on the genre it sounds like; it represents the track's immutable "DNA footprint."</li>
                  </ul>
                  <div className="flex gap-2">
                     <div className="h-10 flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg"></div>
                     <div className="h-10 w-24 bg-teal-900 rounded-lg flex items-center justify-center text-[10px] font-mono text-teal-400 border border-teal-500/30">Fixed Hash</div>
                  </div>
                </div>

                {/* Logic 2 */}
                <div className="bg-slate-800/40 border border-slate-400/10 border-l-[4px] border-l-orange-500 backdrop-blur-xl p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-2">Category 2: Real-time Generative Series</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Includes currently synced models: <br/>
                    {generativeGeometries.map(g => <em key={g} className="text-slate-300 mr-2">{g}</em>)}
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 mb-4">
                    <li><strong>Extraction Principle:</strong> Genre-Based Palettes.</li>
                    <li><strong>Logic:</strong> Fully dynamic. Analyzes live feature vectors like Energy, Spectral Bias (Frequency pitch height), and Dynamics.</li>
                    <li><strong>Genre Mappings:</strong>
                      <ul className="ml-6 space-y-1 mt-2 text-slate-300">
                        <li><span className="text-blue-400 font-medium">Ambient:</span> Low energy/dynamics. Deep blue/cyan + soft purple.</li>
                        <li><span className="text-red-400 font-medium">Techno/Electronic:</span> Low bias (heavy sub/bass). Red + Gold/Orange.</li>
                        <li><span className="text-stone-300 font-medium">Classical/Piano:</span> High bias (treble), low energy. Champagne + Cyan.</li>
                        <li><span className="text-fuchsia-400 font-medium">Orchestral:</span> Extreme dynamics. Gold + intense Magenta clash.</li>
                        <li><span className="text-amber-500 font-medium">Jazz/Experimental:</span> Uses direct spectral bias for adjacent/analogous hues.</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                {/* Visual Modes */}
                <h3 className="text-xl font-bold text-white mt-8 mb-4">Color Allocation & Modes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black border border-slate-800 p-4 rounded-xl">
                    <div className="h-4 w-4 rounded-full bg-slate-100 mb-3"></div>
                    <h4 className="text-sm font-semibold text-white mb-1">Deep Space</h4>
                    <p className="text-xs text-slate-400">Zero ambient light background (Hex <code>#000000</code>). High contrast, maximizing the Bloom effect on the particles.</p>
                  </div>
                  <div className="bg-slate-900 border border-indigo-900 border-t-indigo-500 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute w-24 h-24 bg-indigo-500/20 blur-xl top-0 left-0"></div>
                    <div className="h-4 w-4 rounded-full bg-indigo-400 mb-3 relative"></div>
                    <h4 className="text-sm font-semibold text-white mb-1 relative">Atmospheric</h4>
                    <p className="text-xs text-slate-400 relative">Bold, neon contrasting schemes. Injects a deep saturated hue (based on main particle hue) into the center background gradient.</p>
                  </div>
                  <div className="bg-slate-900 border border-fuchsia-900 border-b-fuchsia-500 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute w-full h-1/2 bg-gradient-to-t from-fuchsia-900/40 to-transparent bottom-0 left-0"></div>
                    <div className="h-4 w-4 rounded-full bg-fuchsia-400 mb-3 relative"></div>
                    <h4 className="text-sm font-semibold text-white mb-1 relative">Dynamic</h4>
                    <p className="text-xs text-slate-400 relative">Intense, high-saturation gradients (hot center to deep outer edges) driving vivid, responsive and energetic visuals.</p>
                  </div>
                </div>

              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-green-500"></span> 5. Audio-Responsive Generation & Motion Logic
              </h2>
              <div className="bg-slate-800/40 border border-slate-400/10 backdrop-blur-xl p-6 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Audio Metric</th>
                      <th className="px-4 py-3">Influence on Motion / System</th>
                      <th className="px-4 py-3 rounded-tr-lg">Visual Output</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    <tr>
                      <td className="px-4 py-3 font-mono text-cyan-300">Energy (RMS / Avg)</td>
                      <td className="px-4 py-3">Drives global animation speed and turbulence fields.</td>
                      <td className="px-4 py-3 text-slate-400">High energy makes particles orbit faster (<code>rotationSpeed</code>) and pulse heavily.</td>
                    </tr>
                    <tr>
                       <td className="px-4 py-3 font-mono text-green-300">Beat / Bass Peak</td>
                       <td className="px-4 py-3">Controls the post-processing Bloom threshold/strength.</td>
                       <td className="px-4 py-3 text-slate-400">Heavy kick drums cause brief, intense blinding glows globally. smoothed interpolation used for organic decay.</td>
                    </tr>
                    <tr>
                       <td className="px-4 py-3 font-mono text-purple-300">Spectral Bias (Pitch)</td>
                       <td className="px-4 py-3">Determines <code>trebleSensitivity</code> and fractal dispersion.</td>
                       <td className="px-4 py-3 text-slate-400">Piano/high-hats cause outer edges of the geometry to scatter outward rapidly.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-slate-500"></span> 6. Tech Specs: Particle Engine Math
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/40 border border-slate-400/10 backdrop-blur-xl p-4 rounded-xl">
                   <h4 className="font-mono text-xs text-slate-500 mb-1">PARTICLE COUNT</h4>
                   <p className="text-2xl font-bold font-mono text-white">60,000</p>
                   <p className="text-xs text-slate-400 mt-2">Rendered efficiently using custom WebGL <code>ShaderMaterial</code> and <code>BufferGeometry</code>. Strict cap to maintain 60FPS.</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-400/10 backdrop-blur-xl p-4 rounded-xl">
                   <h4 className="font-mono text-xs text-slate-500 mb-1">DATA BUFFERS</h4>
                   <p className="text-2xl font-bold font-mono text-white">vec3 / float</p>
                   <p className="text-xs text-slate-400 mt-2"><code>position</code>, <code>targetPosition</code>, <code>color</code>, <code>aProgress</code> assigned per-vertex to allow GPU-level tweening.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
             <div className="bg-slate-800/40 border border-slate-400/10 backdrop-blur-xl p-6 rounded-2xl sticky top-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Document Info</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                   <li><strong className="text-slate-200">Stakeholders:</strong> Product, Design, AI Eng Team</li>
                   <li><strong className="text-slate-200">Framework:</strong> React + Three.js + Web Audio API</li>
                   <li><strong className="text-slate-200">Owner:</strong> Piper Xu (Product Designer)</li>
                   <li><strong className="text-slate-200">Live Sync:</strong> Active <span className="inline-block w-2 h-2 ml-1 rounded-full bg-green-500 animate-pulse"></span></li>
                </ul>

                <div className="mt-8 pt-6 border-t border-white/10">
                   <p className="text-xs text-slate-500 mb-3">Live Mathematical Modulators</p>
                   <div className="flex flex-wrap gap-2">
                     {generativeGeometries.map(m => (
                       <span key={m} className="px-2 py-1 bg-slate-800/80 text-slate-300 text-[10px] rounded">{m}</span>
                     ))}
                   </div>
                </div>
             </div>
          </aside>

        </div>
        
        <footer className="mt-24 pt-8 border-t border-white/10 text-center text-xs text-slate-600 font-mono">
          AMAZON MUSIC - GENERATIVE AI VISUALS - INTERNAL
        </footer>
      </main>
    </div>
  );
}
