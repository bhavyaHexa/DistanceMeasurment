import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: any}> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: any) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, color: 'red', background: '#fee' }}>
          <h2>Runtime Error:</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.stack || this.state.error?.message || String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
