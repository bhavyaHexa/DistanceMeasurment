import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { NewProjectModal } from '../UI/NewProjectModal';
import './HistoryView.css';

export const HistoryView = observer(function HistoryView() {
  const { run, ui } = useStores();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    run.fetchHistory(0, searchTerm);
  }, [run]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    run.fetchHistory(0, searchTerm);
  };

  const handleOpenRun = async (runId: string) => {
    try {
      await run.openProjectFromHistory(runId);
    } catch (err) {
      console.error('Error opening project:', err);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const totalPages = Math.ceil(run.historyTotal / run.historyPageSize) || 1;

  return (
    <div className="history-view">
      <header className="history-header">
        <div className="history-header-left">
          <button className="btn-back" onClick={() => ui.goToStart()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Home</span>
          </button>
          <h2>Project History</h2>
          <span className="history-total-badge">{run.historyTotal} Saved</span>
        </div>

        <div className="history-header-right">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn-search">
              Search
            </button>
          </form>

          <button className="btn-create-project" onClick={() => setIsModalOpen(true)}>
            + New Project
          </button>
        </div>
      </header>

      {run.error && <div className="history-error-banner">{run.error}</div>}

      <main className="history-content">
        {run.historyLoading ? (
          <div className="history-loading">
            <div className="history-spinner" />
            <p>Loading projects from server…</p>
          </div>
        ) : run.historyRuns.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">📂</div>
            <h3>No Saved Projects Found</h3>
            <p>
              {searchTerm
                ? `No projects matched "${searchTerm}".`
                : 'You have not saved any projects yet. Start a new project to convert a model and save measurements.'}
            </p>
            <button className="btn-create-project" onClick={() => setIsModalOpen(true)}>
              Create First Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {run.historyRuns.map((item) => (
              <div key={item.run_id} className="project-card">
                <div className="project-card-header">
                  <div className="project-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                  </div>
                  <span className={`status-pill ${item.status}`}>{item.status}</span>
                </div>

                <h3 className="project-title" title={item.project_name}>
                  {item.project_name}
                </h3>

                <div className="project-metadata">
                  <div className="meta-row">
                    <span className="meta-label">Created:</span>
                    <span className="meta-val">{formatDate(item.created_at)}</span>
                  </div>
                  {item.saved_at && (
                    <div className="meta-row">
                      <span className="meta-label">Saved:</span>
                      <span className="meta-val">{formatDate(item.saved_at)}</span>
                    </div>
                  )}
                  <div className="meta-row">
                    <span className="meta-label">ID:</span>
                    <span className="meta-val id-code" title={item.run_id}>
                      {item.run_id.slice(0, 8)}…
                    </span>
                  </div>
                </div>

                <div className="project-card-footer">
                  <button
                    className="btn-open-project"
                    onClick={() => handleOpenRun(item.run_id)}
                  >
                    Open in Viewer →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {totalPages > 1 && (
        <footer className="history-pagination">
          <button
            disabled={run.historyPage === 0 || run.historyLoading}
            onClick={() => run.fetchHistory(run.historyPage - 1, searchTerm)}
          >
            ← Previous
          </button>
          <span>
            Page {run.historyPage + 1} of {totalPages}
          </span>
          <button
            disabled={run.historyPage + 1 >= totalPages || run.historyLoading}
            onClick={() => run.fetchHistory(run.historyPage + 1, searchTerm)}
          >
            Next →
          </button>
        </footer>
      )}

      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
});
