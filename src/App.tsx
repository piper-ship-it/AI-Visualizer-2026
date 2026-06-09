import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SceneManager } from './lib/three-engine';
import { audioEngine } from './lib/audio';
import type { ShapeName } from './lib/shapes';
import { Music, Play, Pause, Layers, Settings2, ListMusic, Plus, ExternalLink } from 'lucide-react';
import { cn } from './lib/utils';

type Song = { title: string; url: string; isCustom?: boolean; seed?: number };

const defaultPlaylist: Song[] = [
  { title: 'Viper (Tech Synth) - MDN', url: 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3' },
  { title: 'Outfoxing (Acoustic) - MDN', url: 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-basics/outfoxing.mp3' },
  { title: 'Acoustic Sample - Rafael', url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3' },
  { title: 'Electronic Groove - Rafael', url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample2.mp3' }
];

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showGeometryMenu, setShowGeometryMenu] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeName>('DNA_1_Orbits');
  const [visualMode, setVisualModeState] = useState<'Deep Space' | 'Atmospheric' | 'Dynamic'>('Deep Space');
  const [currentGenre, setCurrentGenre] = useState<string>('Cosmic Ambient');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState(defaultPlaylist);
  const [isAutoCycle, setIsAutoCycle] = useState(false);
  const latestShapeRef = useRef(currentShape);

  useEffect(() => {
    latestShapeRef.current = currentShape;
  }, [currentShape]);

  useEffect(() => {
    let cycleInterval: NodeJS.Timeout;
    if (isAutoCycle) {
      cycleInterval = setInterval(() => {
        const cycleShapes: ShapeName[] = ['DNA_1_Orbits', 'DNA_2_Ribbons', 'DNA_3_FlowField', 'DNA_4_Resonance', 'DNA_5_Fibers', 'Identity', 'Signature', 'Lorenz', 'Aizawa', 'Mutation', 'Galaxy'];
        let currentIndex = cycleShapes.indexOf(latestShapeRef.current);
        const nextShape = cycleShapes[(currentIndex + 1) % cycleShapes.length];
        
        setCurrentShape(nextShape);
        sceneManagerRef.current?.setShape(nextShape);
        setTimeout(() => {
          if (sceneManagerRef.current) setCurrentGenre(sceneManagerRef.current.currentTrackGenre);
        }, 100);
      }, 10000);
    }
    return () => clearInterval(cycleInterval);
  }, [isAutoCycle]);

  useEffect(() => {
    if (canvasRef.current && !sceneManagerRef.current) {
      sceneManagerRef.current = new SceneManager(canvasRef.current);
    }
    
    audioEngine.setCallback((playing) => setIsPlaying(playing));

    const interval = setInterval(() => {
      setProgress(audioEngine.getCurrentTime());
      setDuration(audioEngine.getDuration());
    }, 100);

    return () => {
      clearInterval(interval);
      sceneManagerRef.current?.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneManagerRef.current) {
        sceneManagerRef.current.toggleControls(showControls);
    }
  }, [showControls]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (
        target.closest('.js-playlist-container') ||
        target.closest('.js-controls-container') ||
        target.closest('.js-geometry-container') ||
        target.closest('.lil-gui')
      ) {
        return;
      }
      
      setShowPlaylist(false);
      setShowControls(false);
      setShowGeometryMenu(false);
    };

    document.addEventListener('mousedown', handleGlobalClick);

    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, []);

  const syncGenre = () => {
    if (sceneManagerRef.current) {
        setCurrentGenre(sceneManagerRef.current.currentTrackGenre);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
        alert("Please upload an audio file.");
        return;
    }
    
    const url = URL.createObjectURL(file);
    
    setIsLoading(true);
    setFileName(file.name);
    setActiveUrl(url);
    await audioEngine.loadFile(file);
    
    const newSong = { title: file.name, url, isCustom: true, seed: audioEngine.currentSeed };
    
    setPlaylist(prev => {
        const customSongs = prev.filter(p => p.isCustom && p.title !== file.name);
        const defaultSongs = prev.filter(p => !p.isCustom);
        return [...customSongs, newSong, ...defaultSongs];
    });

    if (['DNA_1_Orbits', 'DNA_2_Ribbons', 'DNA_3_FlowField', 'DNA_4_Resonance', 'DNA_5_Fibers', 'Identity', 'Signature', 'Mutation'].includes(currentShape)) {
      sceneManagerRef.current?.setShape(currentShape);
    }
    syncGenre();
    setIsLoading(false);
  };

  const handlePlayUrl = async (song: Song) => {
    setIsLoading(true);
    setFileName(song.title);
    setActiveUrl(song.url);
    await audioEngine.loadUrl(song.url, song.title, song.seed);
    if (['DNA_1_Orbits', 'DNA_2_Ribbons', 'DNA_3_FlowField', 'DNA_4_Resonance', 'DNA_5_Fibers', 'Identity', 'Signature', 'Mutation'].includes(currentShape)) {
      sceneManagerRef.current?.setShape(currentShape);
    }
    syncGenre();
    setIsLoading(false);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleShapeSelect = (shape: ShapeName) => {
    setCurrentShape(shape);
    sceneManagerRef.current?.setShape(shape);
    syncGenre();
  };

  const shapes: ShapeName[] = ['DNA_1_Orbits', 'DNA_2_Ribbons', 'DNA_3_FlowField', 'DNA_4_Resonance', 'DNA_5_Fibers', 'Identity', 'Signature', 'Lorenz', 'Aizawa', 'Mutation', 'Galaxy', 'Menger'];

  const isDynamic = visualMode === 'Dynamic';
  
  const passiveBtnStr = isDynamic 
    ? "bg-fuchsia-500/5 border-fuchsia-500/20 text-fuchsia-200/60 hover:bg-fuchsia-500/10 hover:text-fuchsia-100"
    : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white";
    
  const activeBtnStr = isDynamic
    ? "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-100 shadow-[0_0_30px_rgba(217,70,239,0.3)]"
    : "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]";

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    audioEngine.seek(value);
    setProgress(value);
  };

  return (
    <div 
        className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
      {/* 3D Canvas Container */}
      <div ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-300">
            <div className="text-2xl font-light tracking-widest text-white/80">
                Drop audio file to visualize
            </div>
        </div>
      )}

      {/* Center Upload UI (Hide when playing or loaded) */}
      {!fileName && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
            <h1 className="text-4xl md:text-6xl font-light tracking-[0.2em] mb-4 text-white/90 drop-shadow-lg text-center">
                CHAOS HARMONICS
            </h1>
            <p className="text-white/50 tracking-widest text-sm mb-12 text-center">MATHEMATICAL AUDIO VISUALIZER</p>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center pointer-events-auto">
              <label className="cursor-pointer group flex flex-col items-center justify-center gap-4 w-48 h-48 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 transition-all duration-500">
                  <Music className="w-8 h-8 text-white/60 group-hover:text-white group-hover:scale-110 transition-all duration-500" strokeWidth={1} />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors duration-500">
                      Upload Audio
                  </span>
                  <input 
                      type="file" 
                      accept="audio/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
              </label>

              <button 
                  onClick={() => setShowPlaylist(true)}
                  className="cursor-pointer group flex flex-col items-center justify-center gap-4 w-48 h-48 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 transition-all duration-500"
              >
                  <ListMusic className="w-8 h-8 text-white/60 group-hover:text-white group-hover:scale-110 transition-all duration-500" strokeWidth={1} />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors duration-500">
                      View Playlists
                  </span>
              </button>
            </div>
        </div>
      )}

      {/* Top Right Controls Toggle */}
      <div className="absolute top-8 right-8 z-40 flex items-center gap-4">
            <button 
                onClick={() => {
                    const nextState = !isAutoCycle;
                    setIsAutoCycle(nextState);
                    if (nextState) {
                         setCurrentShape('DNA_1_Orbits');
                         sceneManagerRef.current?.setShape('DNA_1_Orbits');
                         setTimeout(() => {
                            if (sceneManagerRef.current) setCurrentGenre(sceneManagerRef.current.currentTrackGenre);
                         }, 100);
                    }
                }}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-700 ease-out backdrop-blur-xl",
                    isAutoCycle 
                        ? (isDynamic 
                            ? "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-100 shadow-[0_0_30px_rgba(217,70,239,0.3)]"
                            : "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]")
                        : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white"
                )}
            >
                <span className="text-[12px] tracking-[0.05em] font-medium transition-colors duration-500">
                   {isAutoCycle ? "Auto Cycle: ON" : "Auto Cycle: OFF"}
                </span>
            </button>

            <button 
                onClick={() => {
                    const modes: ('Deep Space' | 'Atmospheric' | 'Dynamic')[] = ['Deep Space', 'Atmospheric', 'Dynamic'];
                    const currentIndex = modes.indexOf(visualMode);
                    const newMode = modes[(currentIndex + 1) % modes.length];
                    setVisualModeState(newMode);
                    sceneManagerRef.current?.setVisualMode(newMode);
                }}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-700 ease-out backdrop-blur-xl",
                    visualMode === 'Atmospheric'
                        ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                        : visualMode === 'Dynamic'
                        ? "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-100 shadow-[0_0_30px_rgba(217,70,239,0.3)]"
                        : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white"
                )}
            >
                {/* Visual Mode Label */}
                <span className="text-[12px] tracking-[0.05em] font-medium transition-colors duration-500">{visualMode} Mode</span>
            </button>

        <div className="relative js-playlist-container">
          {showPlaylist && (
              <div className="absolute top-full mt-4 right-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-[24px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] animate-in slide-in-from-top-4 fade-in duration-500 w-[240px]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {playlist.map((song) => (
                          <button
                              key={song.url}
                              onClick={() => handlePlayUrl(song)}
                              className={cn(
                                  "block w-full text-left px-5 py-3 transition-all duration-300 rounded-xl",
                                  activeUrl === song.url 
                                      ? "bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                                      : "hover:bg-white/10"
                              )}
                          >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className={cn(
                                      "text-[12px] tracking-[0.05em] font-medium transition-colors line-clamp-2 text-ellipsis overflow-hidden break-words",
                                      activeUrl === song.url ? "text-white" : "text-white/60"
                                    )}>
                                      {song.title}
                                    </div>
                                    {song.isCustom && (
                                        <div className="text-[9px] text-fuchsia-300/60 mt-1.5 uppercase tracking-widest">
                                            User Upload
                                        </div>
                                    )}
                                </div>
                                {activeUrl === song.url && (
                                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 flex-shrink-0">Active</span>
                                )}
                              </div>
                          </button>
                      ))}
                      <div className="h-px bg-white/10 my-2 mx-2"></div>
                      <label className="cursor-pointer block w-full text-left px-5 py-3 text-[12px] tracking-[0.05em] text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl font-medium flex items-center gap-2">
                          <Plus className="w-3 h-3" />
                          Add Audio
                          <input 
                              type="file" 
                              accept="audio/*" 
                              className="hidden" 
                              onChange={(e) => {
                                  if(e.target.files?.[0]) handleFile(e.target.files[0]);
                                  setShowPlaylist(false);
                              }}
                          />
                      </label>
                  </div>
              </div>
          )}
          <button 
              onClick={() => {
                  setShowPlaylist(!showPlaylist);
                  if (!showPlaylist) {
                      setShowControls(false);
                      setShowGeometryMenu(false);
                  }
              }}
              className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-700 ease-out backdrop-blur-xl",
                  showPlaylist ? activeBtnStr : passiveBtnStr
              )}
          >
              <ListMusic className="w-4 h-4" />
              <span className="text-[12px] tracking-[0.05em] font-medium">Playlist</span>
          </button>
        </div>

        <button 
            onClick={() => {
                setShowControls(!showControls);
                if (!showControls) {
                    setShowPlaylist(false);
                    setShowGeometryMenu(false);
                }
            }}
            className={cn(
                "js-controls-container flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-700 ease-out backdrop-blur-xl",
                showControls ? activeBtnStr : passiveBtnStr
            )}
        >
                    <Settings2 className="w-4 h-4" />
            <span className="text-[12px] tracking-[0.05em] font-medium">Controls</span>
        </button>

        <a
          href="/design-document"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-full border border-transparent hover:border-white/20 opacity-20 hover:opacity-100 hover:bg-white/5 transition-all duration-500 ease-out text-white ml-2"
          title="Design Specs"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Bottom Right Geometry Menu - Ethereal Glass */}
      <div className="absolute bottom-8 right-8 z-40 flex flex-col items-end js-geometry-container">
        {showGeometryMenu && (
            <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-[24px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-[200px]">
                {/* Soft glow edge on top inside the menu */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div className="p-2 space-y-1">
                    {shapes.map((shape) => (
                        <button
                            key={shape}
                            onClick={() => handleShapeSelect(shape)}
                            className={cn(
                                "block w-full text-left px-5 py-3 text-[11px] uppercase tracking-[0.15em] transition-all duration-300 rounded-xl font-medium",
                                currentShape === shape 
                                    ? "bg-white/15 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                                    : "text-white/60 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {shape}
                        </button>
                    ))}
                </div>
            </div>
        )}
        
        <button 
            onClick={() => {
                setShowGeometryMenu(!showGeometryMenu);
                if (!showGeometryMenu) {
                    setShowPlaylist(false);
                    setShowControls(false);
                }
            }}
            className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-xl border transition-all duration-700 ease-out",
                showGeometryMenu ? activeBtnStr : passiveBtnStr
            )}
        >
            <Layers className="w-4 h-4" />
            <span className="text-[12px] tracking-[0.05em] font-medium">Geometry</span>
        </button>
      </div>

      {/* Bottom Left Play Controls */}
      {fileName && (
        <div className="absolute bottom-8 left-8 z-40 flex flex-col gap-4 w-[320px] max-w-[calc(100vw-4rem)]">
            {/* Title and Genre Info */}
            <div className="flex flex-col">
                <span className={cn("text-[10px] uppercase tracking-[0.2em] font-medium mb-1 flex items-center gap-2", isDynamic ? "text-fuchsia-300/60" : "text-white/40")}>
                  {isLoading ? 'LOADING...' : 'NOW PLAYING'}
                  {!isLoading && currentGenre && (
                    <>
                        <span className={cn("w-1 h-1 rounded-full", isDynamic ? "bg-fuchsia-500/50" : "bg-white/30")}></span>
                        <span className={cn("text-[9px] tracking-[0.1em]", isDynamic ? "text-fuchsia-200/70" : "text-white/60")}>{currentGenre}</span>
                    </>
                  )}
                </span>
                <span className={cn("text-base tracking-wider font-light drop-shadow-md truncate", isDynamic ? "text-fuchsia-100 font-semibold drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]" : "text-white font-medium drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]")}>
                  {isLoading ? 'Extracting signature...' : fileName}
                </span>
            </div>

            <div className="flex items-center gap-5 w-full">
                <button 
                    onClick={() => audioEngine.toggle()} 
                    className={cn("w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 group",
                      isDynamic ? "bg-fuchsia-500/10 border border-fuchsia-500/30 hover:bg-fuchsia-500/20" : "bg-white/5 border border-white/10 hover:bg-white/15"
                    )}
                >
                    {isPlaying ? 
                        <Pause className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" fill="currentColor"/> : 
                        <Play className="w-4 h-4 pl-1 text-white/90 group-hover:text-white transition-colors" fill="currentColor"/>
                    }
                </button>
                
                {/* Progress bar */}
                <div className="flex-grow flex flex-col justify-center gap-1.5 w-full min-w-0">
                   <div className="flex justify-between items-center text-[10px] tabular-nums tracking-widest leading-none">
                       <span className={cn(isDynamic ? "text-fuchsia-200/60" : "text-white/50")}>{formatTime(progress)}</span>
                       <span className={cn(isDynamic ? "text-fuchsia-200/60" : "text-white/50")}>{formatTime(duration)}</span>
                   </div>
                   <input
                       type="range"
                       min="0"
                       max={duration || 100}
                       value={progress}
                       onChange={handleSeek}
                       className={cn("w-full h-1 appearance-none rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125 focus:[&::-webkit-slider-thumb]:scale-125",
                          isDynamic 
                              ? "bg-fuchsia-500/20 [&::-webkit-slider-thumb]:bg-fuchsia-300 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(217,70,239,0.8)]"
                              : "bg-white/10 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                       )}
                       style={{
                           backgroundSize: `${duration > 0 ? (progress / duration) * 100 : 0}% 100%`,
                           backgroundImage: isDynamic ? 'linear-gradient(#f0abfc, #f0abfc)' : 'linear-gradient(white, white)',
                           backgroundRepeat: 'no-repeat'
                       }}
                   />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
