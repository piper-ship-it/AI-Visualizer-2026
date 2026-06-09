export interface AudioFeatures {
  energy: number;
  spectralBias: number;
  dynamics: number;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private dataArray: Uint8Array | null = null;
  
  public isPlaying: boolean = false;
  public currentSeed: number = 42;
  public features: AudioFeatures = { energy: 0.5, spectralBias: 0.5, dynamics: 0.5 };
  private onPlayStatusChange: ((playing: boolean) => void) | null = null;

  setCallback(cb: (playing: boolean) => void) {
    this.onPlayStatusChange = cb;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
  }

  async loadUrl(url: string, title: string, seed?: number) {
    this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("AudioContext resume failed:", e));
    }
    
    if (seed !== undefined) {
      this.currentSeed = seed;
    } else {
      const text = `${title}-${url}`;
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
          hash = Math.imul(31, hash) + text.charCodeAt(i) | 0;
      }
      this.currentSeed = Math.abs(hash) || 42;
    }

    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.remove();
      this.source?.disconnect();
    }

    this.audioEl = new Audio();
    this.audioEl.loop = true;
    
    this.audioEl.onplay = () => { this.isPlaying = true; this.onPlayStatusChange?.(true); };
    this.audioEl.onpause = () => { this.isPlaying = false; this.onPlayStatusChange?.(false); };

    if (this.ctx && this.analyser) {
        this.source = this.ctx.createMediaElementSource(this.audioEl);
        this.source.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
    }

    if (!url.startsWith('blob:')) {
        this.audioEl.crossOrigin = "anonymous";
    }
    this.audioEl.src = url;
    this.play();

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
      this.extractFeatures(audioBuffer);
    } catch (e) {
      console.warn("Failed to fetch and extract offline.", e);
    }
  }

  async loadFile(file: File) {
    this.init();
    
    const text = `${file.name}-${file.size}-${file.type}`;
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = Math.imul(31, hash) + text.charCodeAt(i) | 0;
    }
    this.currentSeed = Math.abs(hash) || 42;

    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.remove();
      this.source?.disconnect();
    }

    const url = URL.createObjectURL(file);
    this.audioEl = new Audio(url);
    this.audioEl.loop = true;
    
    this.audioEl.onplay = () => { this.isPlaying = true; this.onPlayStatusChange?.(true); };
    this.audioEl.onpause = () => { this.isPlaying = false; this.onPlayStatusChange?.(false); };

    if (this.ctx && this.analyser) {
        this.source = this.ctx.createMediaElementSource(this.audioEl);
        this.source.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
    }
    
    this.play();

    // Analyze full buffer for signature
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Need a clone because decodeAudioData detaches the arrayBuffer
      const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer.slice(0));
      this.extractFeatures(audioBuffer);
    } catch (e) {
      console.warn("Failed to extract audio features", e);
    }
  }

  play() {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("AudioContext resume failed:", e));
    }
    if (this.audioEl) {
      const playPromise = this.audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Audio playback failed:", e);
          this.isPlaying = false;
          this.onPlayStatusChange?.(false);
        });
      }
    }
  }

  pause() {
    this.audioEl?.pause();
  }
  
  toggle() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  getCurrentTime(): number {
    return this.audioEl?.currentTime || 0;
  }

  getDuration(): number {
    return this.audioEl?.duration || 0;
  }

  seek(time: number) {
    if (this.audioEl) {
      this.audioEl.currentTime = time;
    }
  }

  getAudioElement(): HTMLAudioElement | null {
    return this.audioEl;
  }

  private extractFeatures(buffer: AudioBuffer) {
    const channelData = buffer.getChannelData(0);
    const length = channelData.length;
    
    let sumSquares = 0;
    let peak = 0;
    let zeroCrossings = 0;
    
    const stride = 4;
    
    for (let i = 0; i < length; i += stride) {
        const val = channelData[i];
        sumSquares += val * val;
        
        const absVal = Math.abs(val);
        if (absVal > peak) peak = absVal;
        
        if (i >= stride) {
           const prev = channelData[i - stride];
           if ((val >= 0 && prev < 0) || (val < 0 && prev >= 0)) {
               zeroCrossings++;
           }
        }
    }
    
    const rms = Math.sqrt(sumSquares / (length / stride));
    
    this.features.energy = Math.min(rms * 5.0, 1.0); 
    this.features.dynamics = peak > 0 ? Math.max(0, 1.0 - (rms / (peak + 0.001))) : 0;
    
    const zcrRate = zeroCrossings / (length / stride); 
    this.features.spectralBias = Math.min(Math.max((zcrRate - 0.02) * 8.0, 0), 1.0);
    
    console.log("Audio Signature Extracted:", this.features);
  }

  getFrequencies() {
    if (!this.analyser || !this.dataArray || !this.ctx) return { bass: 0, mid: 0, treble: 0, average: 0 };
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    const sampleRate = this.ctx.sampleRate || 44100;
    const nyquist = sampleRate / 2;
    const binSize = nyquist / this.analyser.frequencyBinCount;
    
    // Bass: 20Hz - 150Hz
    const bassEndBin = Math.floor(150 / binSize) || 2;
    let bassSum = 0;
    for (let i = 0; i <= bassEndBin; i++) {
        bassSum += this.dataArray[i];
    }
    const bass = (bassSum / (bassEndBin + 1)) / 255;
    
    // Mid: 150Hz - 4000Hz
    const midEndBin = Math.floor(4000 / binSize);
    let midSum = 0;
    for (let i = bassEndBin + 1; i <= midEndBin; i++) {
        midSum += this.dataArray[i];
    }
    const mid = (midSum / (midEndBin - bassEndBin)) / 255;

    // Treble: 4000Hz+
    let trebleSum = 0;
    for (let i = midEndBin + 1; i < this.analyser.frequencyBinCount; i++) {
        trebleSum += this.dataArray[i];
    }
    const treble = (trebleSum / (this.analyser.frequencyBinCount - midEndBin)) / 255;
    
    let totalSum = 0;
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
        totalSum += this.dataArray[i];
    }
    const average = (totalSum / this.analyser.frequencyBinCount) / 255;

    return { bass, mid, treble, average };
  }
}

export const audioEngine = new AudioEngine();
