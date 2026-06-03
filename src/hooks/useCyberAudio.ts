import { useEffect, useRef, useCallback } from 'react';

export function useCyberAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Only initialize once per component lifecycle
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    
    return () => {
      // Optional: Cleanup the audio context when unmounting if needed, 
      // but usually keeping it alive is fine for a global-like hook.
      // audioCtxRef.current?.close();
    };
  }, []);

  const ensureContext = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }, []);

  const playHover = useCallback(() => {
    const ctx = ensureContext();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, [ensureContext]);

  const playClick = useCallback(() => {
    const ctx = ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [ensureContext]);

  const playEvolutionDrone = useCallback(() => {
    const ctx = ensureContext();
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    
    // Low drone frequencies
    osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1
    osc2.frequency.setValueAtTime(55.5, ctx.currentTime); // Slight detune for phasing
    
    // Filter to sweep and give that "evolving" feel
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 2);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 4);

    // Gain envelope for drone
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1); // fade in
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime + 3); // hold
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 4); // fade out

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    
    osc1.stop(ctx.currentTime + 4);
    osc2.stop(ctx.currentTime + 4);
  }, [ensureContext]);

  return { playHover, playClick, playEvolutionDrone };
}
