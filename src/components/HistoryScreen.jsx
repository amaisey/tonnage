import { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from './Icons';
import { useWorkoutHistory, useWorkoutCount } from '../hooks/useWorkoutDb';
import { workoutDb } from '../db/workoutDb';

const HistoryScreen = ({ onRefreshNeeded }) => {
  const [showExport, setShowExport] = useState(false);
  const [stats, setStats] = useState({ totalTime: 0, totalVolume: 0 });
  const scrollRef = useRef(null);

  // Use paginated history from IndexedDB
  const {
    workouts,
    loading,
    hasMore,
    loadMore,
    refresh,
    totalCount
  } = useWorkoutHistory(20);

  // Refresh when signaled (e.g., after completing a workout)
  useEffect(() => {
    if (onRefreshNeeded) {
      refresh();
    }
  }, [onRefreshNeeded, refresh]);

  // Calculate aggregate stats (async, samples recent workouts for performance)
  useEffect(() => {
    async function calcStats() {
      // For stats, we sample up to 1000 recent workouts to keep it fast
      const recentWorkouts = await workoutDb.getPage(0, 1000);
      const totalTime = recentWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0);
      const totalVolume = recentWorkouts.reduce((acc, w) => {
        return acc + (w.exercises || []).reduce((eAcc, ex) => {
          return eAcc + (ex.sets || []).filter(s => s.completed).reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0);
        }, 0);
      }, 0);
      setStats({ totalTime, totalVolume });
    }
    calcStats();
  }, [totalCount]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Load more when within 200px of bottom
    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  // Export all history
  const handleExport = async () => {
    const allWorkouts = await workoutDb.getAll();
    const exportData = {
      exportDate: new Date().toISOString(),
      totalWorkouts: allWorkouts.length,
      workouts: allWorkouts.map(w => ({
        name: w.name,
        date: new Date(w.date).toISOString(),
        duration: w.duration,
        exercises: w.exercises?.map(ex => ({
          name: ex.name,
          bodyPart: ex.bodyPart,
          category: ex.category,
          sets: ex.sets?.filter(s => s.completed).map(s => ({
            weight: s.weight,
            reps: s.reps,
            ...(s.duration && { duration: s.duration }),
            ...(s.distance && { distance: s.distance })
          }))
        }))
      }))
    };
    return JSON.stringify(exportData, null, 2);
  };

  return (
    <div className="relative flex flex-col h-full bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/backgrounds/bg-10.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
      </div>
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Stats */}
        <div className="px-4 pb-4 border-b border-white/10 bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">History</h2>
            {totalCount > 0 && (
              <button onClick={() => setShowExport(true)} className="bg-white/10 backdrop-blur-sm text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 flex items-center gap-2 border border-white/20">
                <Icons.Export /> Export
              </button>
            )}
          </div>
          {/* Stats Row */}
          {totalCount > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div className="text-2xl font-bold text-rose-400">{totalCount.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Workouts</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div className="text-2xl font-bold text-teal-400">{Math.round(stats.totalTime / 3600000)}h</div>
                <div className="text-xs text-gray-400">Total Time</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div className="text-2xl font-bold text-blue-400">{stats.totalVolume >= 1000000 ? `${(stats.totalVolume / 1000000).toFixed(1)}M` : stats.totalVolume >= 1000 ? `${Math.round(stats.totalVolume / 1000)}k` : stats.totalVolume}</div>
                <div className="text-xs text-gray-400">Volume (lbs)</div>
              </div>
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4"
        >
          {totalCount === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-teal-500/50"><Icons.History /></span>
              <p className="mt-4">No workouts yet</p>
            </div>
          ) : (
            <>
              {workouts.map((workout, i) => (
                <div key={workout.id || i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20 hover:border-teal-500/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{workout.name}</h3>
                      <div className="text-sm text-gray-400">
                        {new Date(workout.date || workout.startTime).toLocaleDateString()} • {Math.round((workout.duration || 0) / 60000)} min
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-400 font-medium">
                        {(workout.exercises || []).reduce((acc, ex) => acc + (ex.sets || []).filter(s => s.completed).length, 0)} sets
                      </div>
                      <div className="text-sm text-teal-400">
                        {(workout.exercises || []).reduce((acc, ex) => acc + (ex.sets || []).filter(s => s.completed).reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0), 0).toLocaleString()} lbs
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(workout.exercises || []).map((ex, j) => (
                      <span key={j} className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-xs border border-white/20">
                        {ex.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-center py-4">
                  <div className="text-gray-400 text-sm">Loading...</div>
                </div>
              )}

              {/* Load more button (fallback for infinite scroll) */}
              {hasMore && !loading && (
                <button
                  onClick={loadMore}
                  className="w-full py-3 text-cyan-400 text-sm font-medium hover:bg-white/5 rounded-lg"
                >
                  Load More
                </button>
              )}

              {/* End of list indicator */}
              {!hasMore && workouts.length > 0 && (
                <div className="text-center text-gray-500 text-xs py-4">
                  {totalCount.toLocaleString()} workouts total
                </div>
              )}
            </>
          )}
        </div>

        {showExport && (
          <ExportModal
            onClose={() => setShowExport(false)}
            onExport={handleExport}
          />
        )}
      </div>
    </div>
  );
};

// Export modal component
function ExportModal({ onClose, onExport }) {
  const [exportData, setExportData] = useState(null);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    onExport().then(setExportData);
  }, [onExport]);

  const handleCopy = async () => {
    if (!exportData) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Export History</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        </div>
        {exportData ? (
          <>
            <pre className="bg-black/50 rounded-lg p-3 text-xs text-gray-300 overflow-auto max-h-64 mb-4 border border-white/10">
              {exportData.slice(0, 1500)}...
            </pre>
            <button
              onClick={handleCopy}
              disabled={copying}
              className="w-full bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800 disabled:opacity-50"
            >
              {copied ? 'Copied!' : copying ? 'Copying...' : 'Copy to Clipboard'}
            </button>
          </>
        ) : (
          <div className="text-gray-400 text-center py-8">Loading export data...</div>
        )}
      </div>
    </div>
  );
}

export { HistoryScreen };
