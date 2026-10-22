// JYC Web Audio Ambient Cosmic Synthesizer & UI Sound FX
// Zero external audio files required — 100% synthesized in real-time via Web Audio API

class JYCAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.droneGain = null;
    this.filter = null;
    this.oscillators = [];
    this.hasInit = false;
  }

  init() {
    if (this.hasInit) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.hasInit = true;
    } catch {
      // AudioContext unavailable
    }
  }

  startAmbient() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.oscillators.length > 0) return; // already playing

    try {
      // Master drone gain
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.droneGain.gain.exponentialRampToValueAtTime(0.045, this.ctx.currentTime + 3);

      // Low pass filter for soft cosmic warmth
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      // Celestial Root Frequency: 55Hz (A1) + Harmony 110Hz (A2) + Shimmer 164.8Hz (E3)
      const freqs = [55, 55.4, 110, 164.81];
      this.oscillators = freqs.map((f, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);

        const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        if (panner) {
          panner.pan.setValueAtTime((i % 2 === 0 ? -1 : 1) * 0.35, this.ctx.currentTime);
          osc.connect(panner);
          panner.connect(this.filter);
        } else {
          osc.connect(this.filter);
        }
        osc.start();
        return osc;
      });

      this.filter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);
      this.isMuted = false;
    } catch (e) {
      console.warn('JYC Audio Engine start failed', e);
    }
  }

  stopAmbient() {
    if (!this.ctx || !this.droneGain) return;
    try {
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, this.ctx.currentTime);
      this.droneGain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 1.2);
      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch {}
        });
        this.oscillators = [];
        this.isMuted = true;
      }, 1300);
    } catch {
      this.isMuted = true;
    }
  }

  toggle() {
    if (this.isMuted) {
      this.startAmbient();
      return true;
    } else {
      this.stopAmbient();
      return false;
    }
  }

  // UI Sound: Soft Chime on Node Hover
  playNodeHover() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.23);
    } catch {}
  }

  // UI Sound: Celestial Theme Switch Whoosh
  playThemeWhoosh(isDark) {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isDark ? 'triangle' : 'sine';
      const startFreq = isDark ? 440 : 220;
      const endFreq = isDark ? 220 : 660;

      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {}
  }
}

export const jycAudio = new JYCAudioEngine();
