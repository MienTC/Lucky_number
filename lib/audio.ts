// Audio utilities for lottery app
class AudioManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private buffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();

  async init() {
    if (this.isInitialized && this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  async ensureReady() {
    await this.init();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async loadSound(name: string, url: string) {
    if (!this.audioContext) await this.init();
    if (!this.audioContext) return;
    try {
      const encodedUrl = encodeURI(url);
      const response = await fetch(encodedUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      await this.loadFromArrayBuffer(name, arrayBuffer);
      console.log(`Successfully loaded sound: ${name}`);
    } catch (error) {
      console.warn(`Error loading sound ${name}:`, error);
    }
  }

  async loadFromArrayBuffer(name: string, arrayBuffer: ArrayBuffer) {
    if (!this.audioContext) await this.init();
    if (!this.audioContext) return;
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
      this.buffers.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Error decoding audio buffer for ${name}:`, error);
    }
  }

  clearBuffer(name: string) {
    this.buffers.delete(name);
  }

  private playBuffer(name: string, volume: number = 0.5, loop: boolean = false) {
    if (!this.audioContext || !this.isInitialized) return;
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    this.stopSound(name);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.onended = () => {
      if (this.activeSources.get(name) === source) {
        this.activeSources.delete(name);
      }
    };

    this.activeSources.set(name, source);
    source.start(0);
  }

  stopSound(name: string) {
    const source = this.activeSources.get(name);
    if (source) {
      try {
        source.stop();
      } catch (e) {
        // Source might have already stopped
      }
      this.activeSources.delete(name);
    }
  }

  async playSpinSound() {
    if (this.buffers.has('spin')) {
      this.playBuffer('spin', 0.6, true); // Loop for long tracks
      return;
    }
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 2);
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 2);
    } catch (error) {
      console.warn('Error playing spin sound:', error);
    }
  }

  stopSpinSound() {
    this.stopSound('spin');
  }

  async playWinSound() {
    if (this.buffers.has('win')) {
      this.playBuffer('win', 0.8);
      return;
    }
    if (!this.audioContext) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        setTimeout(() => {
          if (!this.audioContext) return;
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.5);
        }, index * 100);
      });
    } catch (error) {
      console.warn('Error playing win sound:', error);
    }
  }

  async playClickSound() {
    if (this.buffers.has('click')) {
      this.playBuffer('click', 0.5);
      return;
    }
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Error playing click sound:', error);
    }
  }
}

export const audioManager = new AudioManager();
