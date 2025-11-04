// Audio utilities for lottery app
class AudioManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Play spinning sound effect
  async playSpinSound() {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Create accelerating pitch effect
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
    if (!this.audioContext) return;

    try {
      // Create triumphant chord progression
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext!.createOscillator();
          const gainNode = this.audioContext!.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext!.destination);

          oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.5);

          oscillator.start();
          oscillator.stop(this.audioContext!.currentTime + 0.5);
        }, index * 100);
      });
    } catch (error) {
      console.warn('Error playing win sound:', error);
    }
  }

  // Play click sound for buttons
  async playClickSound() {
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

  // Play background music (optional)
  async playBackgroundMusic() {
    // This would typically load an audio file
    // For now, we'll create a simple ambient sound
    if (!this.audioContext) return;

    try {
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator1.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
      oscillator2.frequency.setValueAtTime(277.18, this.audioContext.currentTime); // C#4

      oscillator1.type = 'sine';
      oscillator2.type = 'sine';

      gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);

      oscillator1.start();
      oscillator2.start();

      // Fade out after 30 seconds
      setTimeout(() => {
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 2);
        setTimeout(() => {
          oscillator1.stop();
          oscillator2.stop();
        }, 2000);
      }, 30000);

    } catch (error) {
      console.warn('Error playing background music:', error);
    }
  }
}

export const audioManager = new AudioManager();
