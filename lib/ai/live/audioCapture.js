/**
 * Browser microphone capture → 16-bit PCM @ 16kHz chunks.
 * Uses ScriptProcessor for broad browser support (no separate worklet file).
 */

function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return new Uint8Array(buffer);
}

function downsampleTo16k(float32Array, inputSampleRate) {
  if (inputSampleRate === 16000) return float32Array;
  const ratio = inputSampleRate / 16000;
  const newLength = Math.floor(float32Array.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i += 1) {
    result[i] = float32Array[Math.floor(i * ratio)] || 0;
  }
  return result;
}

export function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function startMicCapture(onPcmChunk) {
  if (!navigator?.mediaDevices?.getUserMedia) {
    const err = new Error('microphone_unavailable');
    err.code = 'microphone_unavailable';
    throw err;
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch (error) {
    const err = new Error('microphone_denied');
    err.code = error?.name === 'NotFoundError' ? 'microphone_unavailable' : 'microphone_denied';
    throw err;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const context = new AudioCtx();
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(4096, 1, 1);

  processor.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    const down = downsampleTo16k(input, context.sampleRate);
    const pcm = floatTo16BitPCM(down);
    onPcmChunk?.(pcm);
  };

  source.connect(processor);
  // Keep processor in the graph without audible monitor (avoids echo).
  const mute = context.createGain();
  mute.gain.value = 0;
  processor.connect(mute);
  mute.connect(context.destination);

  return {
    stream,
    context,
    async stop() {
      try {
        processor.disconnect();
        source.disconnect();
      } catch {
        /* ignore */
      }
      stream.getTracks().forEach((track) => track.stop());
      if (context.state !== 'closed') {
        await context.close().catch(() => {});
      }
    },
  };
}
