/**
 * AI provider contract — swap Gemini without rewriting UI.
 */

export class AIProvider {
  get id() {
    return 'base';
  }

  async chat() {
    throw new Error('chat() not implemented');
  }

  async createLiveToken() {
    throw new Error('createLiveToken() not implemented');
  }

  isConfigured() {
    return false;
  }
}
