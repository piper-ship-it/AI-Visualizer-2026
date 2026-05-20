import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SceneManager } from './lib/three-engine';
import { audioEngine } from './lib/audio';
import type { ShapeName } from './lib/shapes';
import { Music, Play, Pause, Layers, Settings2, ListMusic, Plus } from 'lucide-react';
import { cn } from './lib/utils';

const defaultPlaylist = [
  { title: 'Cybernetic Horizon', url: '/audio/cybernetic-horizon.mp3' },
  { title: 'Abyssal Chants', url: '/audio/abyssal-chants.mp3' },
  { title: 'Neon Serenade', url: '/audio/neon-serenade.mp3' },
  { title: 'Quantum Fluctuations', url: '/audio/quantum-fluctuations.mp3' }
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
  const [currentShape, setCurrentShape] = useState<ShapeName>('DNA_v5');

  useEffect(() => {
    if (canvasRef.current && !sceneManagerRef.current) {
      sceneManagerRef.current = new SceneManager(canvasRef.current);
    }
    
    audioEngine.setCallback((playing) => setIsPlaying(playing));

    return () => {
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

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
        alert("Please upload an audio file.");
        return;
    }
    setIsLoading(true);
    setFileName(file.name);
    setActiveUrl(null);
    await audioEngine.loadFile(file);
    if (['DNA', 'DNA_v2', 'DNA_v3', 'DNA_v4', 'DNA_v5', 'Identity', 'Signature', 'Mutation'].includes(currentShape)) {
      sceneManagerRef.current?.setShape(currentShape);
    }
    setIsLoading(false);
  };

  const handlePlayUrl = async (url: string, title: string) => {
    setIsLoading(true);
    setFileName(title);
    setActiveUrl(url);
    await audioEngine.loadUrl(url, title);
    if (['DNA', 'DNA_v2', 'DNA_v3', 'DNA_v4', 'DNA_v5', 'Identity', 'Signature', 'Mutation'].includes(currentShape)) {
      sceneManagerRef.current?.setShape(currentShape);
    }
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
    // Menu remains open for preview, user must click the main button to close
  };

  const shapes: ShapeName[] = ['DNA', 'DNA_v2', 'DNA_v3', 'DNA_v4', 'DNA_v5', 'Identity', 'Signature', 'Mutation', 'Galaxy', 'Menger', 'Lorenz', 'Aizawa'];

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
            
            <label className="pointer-events-auto cursor-pointer group flex flex-col items-center gap-4 p-12 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 transition-all duration-500">
                <Music className="w-8 h-8 text-white/60 group-hover:text-white group-hover:scale-110 transition-all duration-500" strokeWidth={1} />
                <span className="text-xs uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors duration-500">
                    Upload Audio
                </span>
                <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
            </label>
        </div>
      )}

      {/* Top Right Controls Toggle */}
      <div className="absolute top-8 right-8 z-40 flex items-center gap-4">
        <div className="relative js-playlist-container">
          {showPlaylist && (
              <div className="absolute top-full mt-4 right-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-[24px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] animate-in slide-in-from-top-4 fade-in duration-500 w-[240px]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <div className="p-2 space-y-1">
                      {defaultPlaylist.map((song) => (
                          <button
                              key={song.url}
                              onClick={() => handlePlayUrl(song.url, song.title)}
                              className={cn(
                                  "block w-full text-left px-5 py-3 transition-all duration-300 rounded-xl",
                                  activeUrl === song.url 
                                      ? "bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                                      : "hover:bg-white/10"
                              )}
                          >
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-[12px] tracking-[0.05em] font-medium transition-colors",
                                  activeUrl === song.url ? "text-white" : "text-white/60"
                                )}>
                                  {song.title}
                                </span>
                                {activeUrl === song.url && (
                                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Active</span>
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
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-700 ease-out backdrop-blur-xl",
                  showPlaylist
                      ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                      : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white"
              )}
          >
              <ListMusic className="w-4 h-4" />
              <span className="text-[12px] tracking-[0.05em] font-medium">Playlist</span>
          </button>
        </div>

        <button 
            onClick={() => setShowControls(!showControls)}
            className={cn(
                "js-controls-container flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-700 ease-out backdrop-blur-xl",
                showControls 
                    ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                    : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white"
            )}
        >
            <Settings2 className="w-4 h-4" />
            <span className="text-[12px] tracking-[0.05em] font-medium">Controls</span>
        </button>
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
            onClick={() => setShowGeometryMenu(!showGeometryMenu)}
            className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-xl border transition-all duration-700 ease-out",
                showGeometryMenu 
                    ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                    : "bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:text-white"
            )}
        >
            <Layers className="w-4 h-4" />
            <span className="text-[12px] tracking-[0.05em] font-medium">Geometry</span>
        </button>
      </div>

      {/* Bottom Left Play Controls */}
      {fileName && (
        <div className="absolute bottom-8 left-8 z-40 flex items-center gap-6">
            <button 
                onClick={() => audioEngine.toggle()} 
                className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/15 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 group"
            >
                {isPlaying ? 
                    <Pause className="w-5 h-5 text-white/80 group-hover:text-white" fill="currentColor"/> : 
                    <Play className="w-5 h-5 pl-1 text-white/80 group-hover:text-white" fill="currentColor"/>
                }
            </button>
            <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium mb-1">
                  {isLoading ? 'LOADING...' : 'NOW PLAYING'}
                </span>
                <span className="text-xs text-white/90 tracking-wider font-light">
                  {isLoading ? 'Extracting signature...' : fileName}
                </span>
            </div>
        </div>
      )}
    </div>
  );
}
