import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-8">
          <h1 className="text-2xl font-black text-white uppercase mb-4">Something went wrong</h1>
          <p className="text-zinc-400 mb-6 text-center max-w-md">
            The page hit an error. Try refreshing or going back to home.
          </p>
          <button
            type="button"
            onClick={() => { this.setState({ hasError: false }); window.location.hash = '/'; }}
            className="bg-amber-400 text-zinc-950 px-6 py-3 rounded-xl font-black uppercase"
          >
            Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
