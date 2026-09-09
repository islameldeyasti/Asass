'use client';

import {Component} from 'react';

export default class AIErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch() {
    /* swallow — do not break the host page */
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
