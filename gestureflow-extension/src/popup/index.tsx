import React from 'react';
import ReactDOM from 'react-dom/client';
import '@shared/globals.css';
import { PopupApp } from './PopupApp';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-[360px] h-[500px] bg-dark-bg flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-error text-3xl mb-3">⚠</div>
            <h2 className="text-[#F8FAFC] text-sm font-semibold mb-1">
              Something went wrong
            </h2>
            <p className="text-text-muted text-xs">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              className="mt-3 px-3 py-1.5 bg-primary text-white text-xs rounded-button hover:bg-primary-dark transition-colors"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <PopupApp />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
