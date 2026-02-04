import { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from './Icons';
import { useWorkoutHistory, useWorkoutCount } from '../hooks/useWorkoutDb';
import { workoutDb } from '../db/workoutDb';

const HistoryScreen = ({ onRefreshNeeded, onScroll }) => {
  const [showExport, setShowExport] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
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

  // Infinite scroll handler + nav hide/show
  const handleScrollEvent = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    // Notify parent for nav hide/show
    if (onScroll) onScroll(scrollTop);

    // Load more when within 200px of bottom
    if (!loading && hasMore && scrollHeight - scrollTop - clientHeight < 200) {
      loadMore();
    }
  }, [loading, hasMore, loadMore, onScroll]);

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
    <div className="relative flex-1 min-h-0 flex flex-col bg-gray-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/backgrounds/bg-10.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
      </div>
      <div className="relative z-10 flex-1 min-h-0 flex flex-col">
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
          onScroll={handleScrollEvent}
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
                <button key={workout.id || i} onClick={() => setSelectedWorkout(workout)}
                  className="w-full text-left bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20 hover:border-teal-500/50 transition-colors">
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
                </button>
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

        {selectedWorkout && (
          <WorkoutDetailModal
            workout={selectedWorkout}
            onClose={() => setSelectedWorkout(null)}
          />
        )}
      </div>
    </div>
  );
};

// Workout Detail Modal - shows all exercises with sets/reps/weights
function WorkoutDetailModal({ workout, onClose }) {
  const formatDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Calculate 1RM using Brzycki formula: 1RM = weight × (36 / (37 - reps))
  const calculate1RM = (weight, reps) => {
    if (!weight || !reps || reps <= 0) return null;
    if (reps === 1) return weight;
    if (reps > 12) return null; // Formula less accurate above 12 reps
    return Math.round(weight * (36 / (37 - reps)));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-white/20">
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
            <div className="text-sm text-gray-400">
              {formatTime(workout.date || workout.startTime)} • {formatDate(workout.date || workout.startTime)}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2"><Icons.X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Workout summary */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
              <div className="text-xl font-bold text-cyan-400">{Math.round((workout.duration || 0) / 60000)}</div>
              <div className="text-xs text-gray-400">Minutes</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
              <div className="text-xl font-bold text-teal-400">
                {(workout.exercises || []).reduce((acc, ex) => acc + (ex.sets || []).filter(s => s.completed).length, 0)}
              </div>
              <div className="text-xs text-gray-400">Sets</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
              <div className="text-xl font-bold text-rose-400">
                {((workout.exercises || []).reduce((acc, ex) => acc + (ex.sets || []).filter(s => s.completed).reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0), 0) / 1000).toFixed(1)}k
              </div>
              <div className="text-xs text-gray-400">Volume (lbs)</div>
            </div>
          </div>

          {/* Exercises */}
          {(workout.exercises || []).map((ex, exIdx) => {
            const completedSets = (ex.sets || []).filter(s => s.completed);
            if (completedSets.length === 0) return null;

            return (
              <div key={exIdx} className="mb-4 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-white">{ex.name}</h4>
                    <div className="text-xs text-gray-400">{ex.bodyPart}</div>
                  </div>
                  {ex.supersetId && (
                    <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full">Superset</span>
                  )}
                </div>

                {/* Set header */}
                <div className="flex gap-2 text-xs text-gray-500 mb-1 px-1">
                  <div className="w-8">SET</div>
                  <div className="flex-1 text-center">
                    {ex.category === 'cardio' ? 'DISTANCE' : ex.category === 'duration' ? 'TIME' : ex.category === 'band' ? 'BAND' : 'WEIGHT'}
                  </div>
                  <div className="flex-1 text-center">
                    {ex.category === 'cardio' ? 'TIME' : ex.category === 'duration' ? '' : 'REPS'}
                  </div>
                  {ex.category !== 'cardio' && ex.category !== 'duration' && ex.category !== 'reps_only' && (
                    <div className="w-12 text-center">1RM</div>
                  )}
                </div>

                {/* Sets */}
                {completedSets.map((set, setIdx) => {
                  const oneRM = calculate1RM(set.weight, set.reps);
                  return (
                    <div key={setIdx} className="flex gap-2 items-center py-1.5 border-t border-white/5">
                      <div className="w-8 text-sm text-gray-400">{setIdx + 1}</div>
                      <div className="flex-1 text-center text-white font-medium">
                        {set.bandColor ? (
                          <span className={`px-2 py-0.5 rounded text-xs ${set.bandColor === 'yellow' ? 'bg-yellow-400 text-black' : set.bandColor === 'red' ? 'bg-red-500' : set.bandColor === 'green' ? 'bg-green-500' : set.bandColor === 'blue' ? 'bg-blue-500' : set.bandColor === 'black' ? 'bg-gray-800' : set.bandColor === 'purple' ? 'bg-purple-500' : set.bandColor === 'orange' ? 'bg-orange-500' : 'bg-gray-500'}`}>
                            {set.bandColor}
                          </span>
                        ) : set.distance ? (
                          `${set.distance} km`
                        ) : set.weight !== undefined ? (
                          `${set.weight} lb`
                        ) : set.duration ? (
                          `${Math.floor(set.duration / 60)}:${String(set.duration % 60).padStart(2, '0')}`
                        ) : '-'}
                      </div>
                      <div className="flex-1 text-center text-white font-medium">
                        {set.reps !== undefined ? set.reps : set.duration && !set.distance ? `${Math.floor(set.duration / 60)}:${String(set.duration % 60).padStart(2, '0')}` : '-'}
                      </div>
                      {ex.category !== 'cardio' && ex.category !== 'duration' && ex.category !== 'reps_only' && (
                        <div className="w-12 text-center text-xs text-gray-400">
                          {oneRM || '-'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
