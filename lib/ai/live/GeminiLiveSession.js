import {bytesToBase64, startMicCapture} from '@/lib/ai/live/audioCapture';
import {createPcmPlayer} from '@/lib/ai/live/audioPlayback';
import {requestLiveToken} from '@/lib/ai/client';

function liveWsUrl(token, apiVersion = 'v1beta') {
  const ver = apiVersion === 'v1alpha' ? 'v1alpha' : 'v1beta';
  const encoded = encodeURIComponent(token);
  return `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.${ver}.GenerativeService.BidiGenerateContentConstrained?access_token=${encoded}`;
}

/**
 * Real-time Gemini Live voice via raw WebSocket + ephemeral token.
 * Permanent API key never enters the browser.
 */
export class GeminiLiveSession {
  constructor({
    conversationId,
    siteLocale = 'en',
    history = [],
    maxSessionMinutes = 5,
    onState,
    onTranscript,
    onError,
    onLimit,
  }) {
    this.conversationId = conversationId;
    this.siteLocale = siteLocale;
    this.history = history;
    this.maxSessionMinutes = maxSessionMinutes;
    this.onState = onState;
    this.onTranscript = onTranscript;
    this.onError = onError;
    this.onLimit = onLimit;

    this.ws = null;
    this.mic = null;
    this.player = createPcmPlayer(24000);
    this.startedAt = 0;
    this.limitTimer = null;
    this.closed = false;
    this.ready = false;
    this.userBuf = '';
    this.modelBuf = '';
    this.sendErrors = 0;
  }

  setState(state) {
    if (!this.closed || state === 'disconnected' || state === 'error') {
      this.onState?.(state);
    }
  }

  emitTranscript(role, text, finalish = false) {
    if (!text) return;
    this.onTranscript?.({role, text, final: finalish});
  }

  canSend() {
    return !this.closed && this.ready && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  sendJson(payload) {
    if (!this.canSend()) return false;
    try {
      this.ws.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  handleMessage(raw) {
    let message;
    try {
      message = typeof raw === 'string' ? JSON.parse(raw) : JSON.parse(String(raw));
    } catch {
      return;
    }

    if ('setupComplete' in message) {
      this.setState('listening');
      return;
    }

    if (message.error) {
      this.onError?.(message.error?.message || 'voice_error');
      this.setState('error');
      void this.stop();
      return;
    }

    const sc = message.serverContent;
    if (!sc) return;

    if (sc.interrupted) {
      this.player.interrupt();
      this.setState('listening');
      return;
    }

    if (sc.inputTranscription?.text) {
      this.userBuf += sc.inputTranscription.text;
      this.emitTranscript('user', this.userBuf, false);
      this.setState('listening');
    }

    if (sc.outputTranscription?.text) {
      this.modelBuf += sc.outputTranscription.text;
      this.emitTranscript('assistant', this.modelBuf, false);
      this.setState('speaking');
    }

    const parts = sc.modelTurn?.parts || [];
    for (const part of parts) {
      const data = part.inlineData?.data;
      const mime = part.inlineData?.mimeType || '';
      if (data && (!mime || mime.includes('audio') || mime.includes('pcm'))) {
        this.setState('speaking');
        this.player.playBase64Pcm(data, 24000);
      }
    }

    if (sc.turnComplete) {
      if (this.userBuf) this.emitTranscript('user', this.userBuf, true);
      if (this.modelBuf) this.emitTranscript('assistant', this.modelBuf, true);
      this.userBuf = '';
      this.modelBuf = '';
      this.setState('listening');
    }
  }

  openSocket(tokenPayload, modelPath) {
    return new Promise((resolve, reject) => {
      const url = liveWsUrl(tokenPayload.token, tokenPayload.apiVersion || 'v1beta');
      const ws = new WebSocket(url);
      this.ws = ws;
      let settled = false;

      const settleOk = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      const settleErr = (err) => {
        if (settled) return;
        settled = true;
        reject(err instanceof Error ? err : new Error(String(err || 'voice_error')));
      };

      ws.onopen = () => {
        if (this.closed) {
          try {
            ws.close();
          } catch {
            /* ignore */
          }
          settleErr(new Error('voice_error'));
          return;
        }
        this.ready = true;
        const setup = {
          setup: {
            model: modelPath,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {voiceName: 'Aoede'},
                },
              },
            },
            systemInstruction: {
              parts: [
                {
                  text:
                    tokenPayload.systemInstruction ||
                    'You are a helpful bilingual Arabic/English assistant for the ASAS website. Keep spoken answers short.',
                },
              ],
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        };
        try {
          ws.send(JSON.stringify(setup));
          this.setState('listening');
          settleOk();
        } catch (error) {
          settleErr(error);
        }
      };

      ws.onmessage = async (event) => {
        try {
          let data = event.data;
          if (data instanceof Blob) data = await data.text();
          this.handleMessage(data);
        } catch {
          /* ignore */
        }
      };

      ws.onerror = () => {
        this.ready = false;
        if (!settled) settleErr(new Error('voice_error'));
        else {
          this.onError?.('voice_error');
          this.setState('error');
        }
      };

      ws.onclose = () => {
        this.ready = false;
        if (!settled) {
          settleErr(new Error('voice_error'));
          return;
        }
        if (!this.closed) {
          this.onError?.('voice_error');
          this.setState('disconnected');
          void this.stop();
        }
      };
    });
  }

  async start() {
    this.setState('connecting');
    const tokenPayload = await requestLiveToken({
      conversationId: this.conversationId,
      history: this.history,
      siteLocale: this.siteLocale,
    });

    if (this.closed) return;

    this.maxSessionMinutes = tokenPayload.maxSessionMinutes || this.maxSessionMinutes;
    const model = tokenPayload.model || 'gemini-2.5-flash-native-audio-preview-12-2025';
    const modelPath = model.startsWith('models/') ? model : `models/${model}`;

    await this.openSocket(tokenPayload, modelPath);
    if (this.closed) {
      await this.stop();
      return;
    }

    const seed = tokenPayload.seedHistory || [];
    if (seed.length) {
      this.sendJson({
        clientContent: {
          turns: seed,
          turnComplete: false,
        },
      });
    }

    this.mic = await startMicCapture((pcm) => {
      if (!this.canSend()) return;
      const ok = this.sendJson({
        realtimeInput: {
          audio: {
            data: bytesToBase64(pcm),
            mimeType: 'audio/pcm;rate=16000',
          },
        },
      });
      if (!ok) {
        this.sendErrors += 1;
        if (this.sendErrors > 5) void this.stop();
      } else {
        this.sendErrors = 0;
      }
    });

    this.startedAt = Date.now();
    this.limitTimer = window.setTimeout(() => {
      this.onLimit?.();
      void this.stop();
    }, Math.max(1, this.maxSessionMinutes) * 60 * 1000);

    this.setState('listening');
  }

  getElapsedSeconds() {
    if (!this.startedAt) return 0;
    return Math.floor((Date.now() - this.startedAt) / 1000);
  }

  async stop() {
    if (this.closed && !this.ws && !this.mic) return;
    this.closed = true;
    this.ready = false;

    if (this.limitTimer) clearTimeout(this.limitTimer);
    this.limitTimer = null;

    if (this.mic) {
      try {
        await this.mic.stop();
      } catch {
        /* ignore */
      }
      this.mic = null;
    }

    if (this.ws) {
      const ws = this.ws;
      this.ws = null;
      try {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      } catch {
        /* ignore */
      }
    }

    await this.player.dispose();
    this.setState('disconnected');
  }
}
