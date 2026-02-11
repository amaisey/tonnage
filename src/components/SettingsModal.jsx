import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { workoutDb, db } from '../db/workoutDb';
import { defaultExercises } from '../data/defaultExercises';

export function SettingsModal({ onClose, exercises, templates, folders, onRestoreData }) {
  const [reimporting, setReimporting] = useState(false);
  const [message, setMessage] = useState(null);
  const [workoutCount, setWorkoutCount] = useState(0);

  // Get workout count on mount
  useEffect(() => {
    workoutDb.count().then(setWorkoutCount);
  }, []);

  // Re-import Strong history from JSON file
  const handleReimportHistory = async () => {
    if (!confirm('This will clear your current workout history and re-import from the Strong export. Continue?')) {
      return;
    }

    setReimporting(true);
    setMessage(null);

    try {
      // Clear existing workouts
      await workoutDb.clear();

      // Reset the import flag
      await db.metadata.delete('strongHistoryImported');

      setMessage({ type: 'success', text: 'Database cleared. Reloading to import history...' });

      // Reload after a short delay to trigger migration
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error('Re-import error:', err);
      setMessage({ type: 'error', text: 'Re-import failed: ' + err.message });
      setReimporting(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <Icons.X />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Data Stats */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-3">Current Data</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-cyan-400 font-bold">{workoutCount.toLocaleString()}</div>
                <div className="text-gray-500 text-xs">Workouts</div>
              </div>
              <div>
                <div className="text-cyan-400 font-bold">{exercises.length}</div>
                <div className="text-gray-500 text-xs">Exercises</div>
              </div>
              <div>
                <div className="text-cyan-400 font-bold">{templates.length}</div>
                <div className="text-gray-500 text-xs">Templates</div>
              </div>
              <div>
                <div className="text-cyan-400 font-bold">{folders.length}</div>
                <div className="text-gray-500 text-xs">Folders</div>
              </div>
            </div>
          </div>

          {/* Bug #5: Export Custom Exercises */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-2">Custom Exercises</h3>
            <p className="text-gray-500 text-xs mb-3">
              Export exercises you've added or modified (excludes built-in defaults). Use this to feed back into the app's exercise database.
            </p>
            <button
              onClick={() => {
                const defaultNames = new Set(defaultExercises.map(e => e.name));
                const customExercises = exercises.filter(e => !defaultNames.has(e.name));
                if (customExercises.length === 0) {
                  setMessage({ type: 'error', text: 'No custom exercises found. All exercises are defaults.' });
                  return;
                }
                const blob = new Blob([JSON.stringify(customExercises, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `custom-exercises-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setMessage({ type: 'success', text: `Exported ${customExercises.length} custom exercises` });
              }}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              <Icons.Export />
              Export Custom Exercises
            </button>
          </div>

          {/* Re-import Strong History */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-2">Strong History Import</h3>
            <p className="text-gray-500 text-xs mb-3">
              If your workout history didn't import correctly, use this to re-import from the Strong export file.
            </p>
            <button
              onClick={handleReimportHistory}
              disabled={reimporting}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              <Icons.History />
              {reimporting ? 'Re-importing...' : 'Re-import Strong History'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
