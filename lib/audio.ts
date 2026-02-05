// Audio utilities for lottery app
class AudioManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private buffers: Map<string, AudioBuffer> = new Map();

  async init() {
    if (this.isInitialized && this.audioContext) {
      // Resume if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.isInitialized = true;
      
      // Resume immediately in case it starts suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Ensure audio is ready (call this on user interaction)
  async ensureReady() {
    await this.init();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Load a sound from URL
  async loadSound(name: string, url: string) {
    if (!this.audioContext) return;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.buffers.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Error loading sound ${name}:`, error);
    }
  }

  // Play a sound from buffer
  private playBuffer(name: string, volume: number = 0.5) {
    if (!this.audioContext || !this.isInitialized) return;
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }

  // Play spinning sound effect
  async playSpinSound() {
    if (this.buffers.has('spin')) {
      this.playBuffer('spin');
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

  // Play win sound effect
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

  // Play click sound for buttons
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
