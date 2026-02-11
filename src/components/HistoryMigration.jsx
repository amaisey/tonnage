import { useState, useEffect } from 'react';
import { isHistoryImported, markHistoryImported, workoutDb } from '../db/workoutDb';

/**
 * Component that handles one-time import of Strong history into IndexedDB.
 * Shows a progress UI during import, then renders children when complete.
 */
export function HistoryMigration({ children }) {
  const [status, setStatus] = useState('checking'); // checking, importing, complete, error
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function checkAndImport() {
      try {
        // Check if already imported
        const imported = await isHistoryImported();
        if (imported) {
          if (mounted) setStatus('complete');
          return;
        }

        // Check if there's history data to import
        if (mounted) setStatus('importing');

        // Fetch the history JSON
        const response = await fetch('/strong-history.json');
        if (!response.ok) {
          // No history file - that's fine, just mark as complete
          await markHistoryImported();
          if (mounted) setStatus('complete');
          return;
        }

        const workouts = await response.json();
        if (!Array.isArray(workouts) || workouts.length === 0) {
          await markHistoryImported();
          if (mounted) setStatus('complete');
          return;
        }

        if (mounted) setProgress({ current: 0, total: workouts.length });

        // Import in batches
        const batchSize = 100;
        for (let i = 0; i < workouts.length; i += batchSize) {
          if (!mounted) break;

          const batch = workouts.slice(i, i + batchSize);
          await workoutDb.bulkAdd(batch);

          if (mounted) {
            setProgress({
              current: Math.min(i + batchSize, workouts.length),
              total: workouts.length
            });
          }

          // Small delay to allow UI updates
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        await markHistoryImported();
        if (mounted) setStatus('complete');

      } catch (err) {
        console.error('Migration error:', err);
        if (mounted) {
          setError(err.message);
          setStatus('error');
        }
      }
    }

    checkAndImport();
    return () => { mounted = false; };
  }, []);

  // Show loading/progress UI during import
  if (status === 'checking') {
    return (
      <div className="w-full h-[100dvh] bg-black flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    );
  }

  if (status === 'importing') {
    const percent = progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

    return (
      <div className="w-full h-[100dvh] bg-black flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-white text-lg font-medium">Importing Workout History</div>
        <div className="text-white/60 text-sm">
          {progress.current.toLocaleString()} / {progress.total.toLocaleString()} workouts
        </div>
        <div className="w-full max-w-xs bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-white/40 text-xs mt-2">
          This only happens once
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full h-[100dvh] bg-black flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-red-400 text-lg font-medium">Import Error</div>
        <div className="text-white/60 text-sm text-center">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Import complete - render the app
  return children;
}
