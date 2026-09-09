/**
 * Queue and play raw PCM 16-bit mono audio (Gemini Live output is typically 24kHz).
 */

export function createPcmPlayer(sampleRate = 24000) {
  let audioContext = null;
  let nextTime = 0;
  let playing = false;

  function ensureContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx({sampleRate});
      nextTime = audioContext.currentTime;
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  }

  function base64ToInt16(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const view = new DataView(bytes.buffer);
    const samples = new Int16Array(bytes.length / 2);
    for (let i = 0; i < samples.length; i += 1) {
      samples[i] = view.getInt16(i * 2, true);
    }
    return samples;
  }

  return {
    playBase64Pcm(base64, rate = sampleRate) {
      const ctx = ensureContext();
      const int16 = base64ToInt16(base64);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i += 1) {
        float32[i] = int16[i] / 32768;
      }
      const buffer = ctx.createBuffer(1, float32.length, rate);
      buffer.copyToChannel(float32, 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      const startAt = Math.max(ctx.currentTime + 0.02, nextTime);
      source.start(startAt);
      nextTime = startAt + buffer.duration;
      playing = true;
      source.onended = () => {
        if (ctx.currentTime >= nextTime - 0.05) playing = false;
      };
    },
    interrupt() {
      if (audioContext) {
        audioContext.close().catch(() => {});
        audioContext = null;
        nextTime = 0;
        playing = false;
      }
    },
    isPlaying() {
      return playing;
    },
    async dispose() {
      this.interrupt();
    },
  };
}
