import { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { CATEGORIES, BAND_COLORS, EXERCISE_PHASES } from '../data/constants';
import { formatDuration, exportWorkoutJSON } from '../utils/helpers';
import { workoutDb } from '../db/workoutDb';

// Workout Detail Modal - shows full workout when clicking on history item
const WorkoutDetailModal = ({ workout, onClose, onDelete }) => {
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const togglePhase = (phase) => {
    setCollapsedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  // Group exercises by phase
  const getExercisesByPhase = () => {
    const phases = { warmup: [], workout: [], cooldown: [] };
    workout.exercises.forEach((ex, idx) => {
      const phase = ex.phase || 'workout';
      phases[phase].push({ exercise: ex, index: idx });
    });
    return phases;
  };

  const exercisesByPhase = getExercisesByPhase();

  // Calculate stats
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const totalVolume = workout.exercises.reduce((acc, ex) =>
    acc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.reps || 0), 0), 0);
  const duration = workout.duration ? Math.round(workout.duration / 60000) : 0;
  const workoutDate = new Date(workout.date || workout.startTime);

  // Get phase stats
  const getPhaseStats = (exercises) => {
    let sets = 0, volume = 0;
    exercises.forEach(({ exercise }) => {
      exercise.sets.filter(s => s.completed).forEach(s => {
        sets++;
        volume += (s.weight || 0) * (s.reps || 0);
      });
    });
    return { sets, volume };
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="shrink-0 p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
        <button onClick={() => setShowDeleteConfirm(true)} className="text-red-400 hover:text-red-300">
          <Icons.Trash />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-black" style={{ overscrollBehavior: 'contain' }}>
        {/* Date & Time */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-white">{workoutDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div className="text-gray-400">{workoutDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-cyan-400">{workout.exercises.length}</div>
            <div className="text-xs text-gray-400">Exercises</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-teal-400">{totalSets}</div>
            <div className="text-xs text-gray-400">Sets</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-rose-400">{totalVolume.toLocaleString()}</div>
            <div className="text-xs text-gray-400">lbs</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-amber-400">{duration}</div>
            <div className="text-xs text-gray-400">min</div>
          </div>
        </div>

        {workout.notes && (
          <div className="bg-teal-900/20 border border-teal-700/30 rounded-xl p-3 mb-4">
            <div className="text-sm text-teal-300 flex items-center gap-2">
              <span>📋</span> {workout.notes}
            </div>
          </div>
        )}

        {/* Exercises by Phase */}
        {Object.entries(EXERCISE_PHASES).map(([phaseKey, phaseInfo]) => {
          const phaseExercises = exercisesByPhase[phaseKey];
          if (phaseExercises.length === 0) return null;

          const isCollapsed = collapsedPhases[phaseKey];
          const { sets, volume } = getPhaseStats(phaseExercises);

          return (
            <div key={phaseKey} className="mb-4">
              <button onClick={() => togglePhase(phaseKey)} className={`w-full flex items-center justify-between p-3 rounded-xl ${phaseInfo.color} mb-2`}>
                <div className="flex items-center gap-2">
                  <span>{phaseInfo.icon}</span>
                  <span className="font-semibold text-white">{phaseInfo.label}</span>
                  <span className="text-white/70 text-sm">({phaseExercises.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">{sets} sets</span>
                  {volume > 0 && <span className="text-white/70 text-sm">• {volume.toLocaleString()} lbs</span>}
                  {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
                </div>
              </button>

              {!isCollapsed && (
                <div className={`border-l-4 ${phaseInfo.borderColor} pl-3 space-y-3`}>
                  {phaseExercises.map(({ exercise, index }) => {
                    const completedSets = exercise.sets.filter(s => s.completed);
                    const exVolume = completedSets.reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0);

                    return (
                      <div key={index} className="bg-gray-900 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-white">{exercise.name}</span>
                            {exercise.supersetId && <span className="ml-2 text-teal-400 text-xs">⚡ Superset</span>}
                          </div>
                          {exVolume > 0 && (
                            <span className="text-sm text-gray-400">{exVolume.toLocaleString()} lbs</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mb-3">
                          {exercise.bodyPart} • {completedSets.length}/{exercise.sets.length} sets completed
                        </div>

                        {/* Set details */}
                        <div className="space-y-1">
                          {exercise.sets.map((set, sIdx) => {
                            const fields = CATEGORIES[exercise.category]?.fields || ['weight', 'reps'];
                            return (
                              <div key={sIdx} className={`flex items-center gap-3 p-2 rounded-lg ${set.completed ? 'bg-gray-800' : 'bg-gray-800/30'}`}>
                                <span className={`w-6 text-center text-xs ${set.completed ? 'text-green-400' : 'text-gray-500'}`}>
                                  {set.completed ? '✓' : sIdx + 1}
                                </span>
                                <div className="flex-1 flex items-center gap-2 text-sm">
                                  {fields.includes('weight') && set.weight && (
                                    <span className={set.completed ? 'text-white' : 'text-gray-500'}>{set.weight} lbs</span>
                                  )}
                                  {fields.includes('reps') && set.reps && (
                                    <span className={set.completed ? 'text-white' : 'text-gray-500'}>× {set.reps}</span>
                                  )}
                                  {fields.includes('duration') && set.duration && (
                                    <span className={set.completed ? 'text-white' : 'text-gray-500'}>{formatDuration(set.duration)}</span>
                                  )}
                                  {fields.includes('distance') && set.distance && (
                                    <span className={set.completed ? 'text-white' : 'text-gray-500'}>{set.distance} mi</span>
                                  )}
                                  {fields.includes('bandColor') && set.bandColor && (
                                    <span className={`${BAND_COLORS[set.bandColor]?.bg} ${BAND_COLORS[set.bandColor]?.text} px-2 py-0.5 rounded text-xs`}>
                                      {set.bandColor}
                                    </span>
                                  )}
                                  {fields.includes('assistedWeight') && set.assistedWeight && (
                                    <span className={set.completed ? 'text-white' : 'text-gray-500'}>-{set.assistedWeight} lbs</span>
                                  )}
                                </div>
                                {set.rpe && (
                                  <span className="text-xs text-amber-400">RPE {set.rpe}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {exercise.notes && (
                          <div className="mt-2 text-xs text-amber-400">📝 {exercise.notes}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="shrink-0 p-4 border-t border-gray-800 bg-gray-900" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
        <button onClick={async () => {
          await navigator.clipboard.writeText(exportWorkoutJSON(workout));
        }} className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 flex items-center justify-center gap-2">
          <Icons.Export /> Copy Workout JSON
        </button>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Workout?</h3>
            <p className="text-gray-400 text-sm mb-6">This will permanently delete "{workout.name}" from your history. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600">Cancel</button>
              <button onClick={() => { onDelete(workout.id); onClose(); }} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryScreen = ({ onRefreshNeeded, onScroll, navVisible }) => {
  const [history, setHistory] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  // Load history from IndexedDB
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const workouts = await workoutDb.getAll();
        workouts.sort((a, b) => (b.date || b.startTime) - (a.date || a.startTime));
        setHistory(workouts);
      } catch (err) {
        console.error('Error loading history:', err);
      }
      setLoading(false);
    };
    loadHistory();
  }, [onRefreshNeeded]);

  // Import Strong history with phases
  const importStrongHistory = async (replace = false) => {
    setImporting(true);
    setImportStatus({ message: 'Loading history data...', progress: 0 });

    try {
      // Dynamically import the history with phases
      const { importedHistoryWithPhases } = await import('../data/importedHistoryWithPhases');

      if (replace) {
        setImportStatus({ message: 'Clearing existing history...', progress: 10 });
        const existing = await workoutDb.getAll();
        for (let i = 0; i < existing.length; i++) {
          await workoutDb.delete(existing[i].id);
          if (i % 100 === 0) {
            setImportStatus({ message: `Clearing... ${i}/${existing.length}`, progress: 10 + (i / existing.length) * 20 });
          }
        }
      }

      setImportStatus({ message: 'Importing workouts...', progress: 30 });

      let imported = 0;
      const total = importedHistoryWithPhases.length;

      for (let i = 0; i < total; i++) {
        try {
          await workoutDb.add(importedHistoryWithPhases[i]);
          imported++;
        } catch (err) {
          console.warn(`Failed to import workout ${i}:`, err);
        }

        if (i % 50 === 0 || i === total - 1) {
          setImportStatus({
            message: `Importing... ${imported}/${total}`,
            progress: 30 + (i / total) * 65
          });
        }
      }

      setImportStatus({ message: `Successfully imported ${imported} workouts!`, progress: 100, done: true });

      // Reload history
      const workouts = await workoutDb.getAll();
      workouts.sort((a, b) => (b.date || b.startTime) - (a.date || a.startTime));
      setHistory(workouts);

    } catch (err) {
      console.error('Import error:', err);
      setImportStatus({ message: `Error: ${err.message}`, error: true });
    }

    setImporting(false);
  };

  const deleteWorkout = async (id) => {
    try {
      await workoutDb.delete(id);
      setHistory(history.filter(w => w.id !== id));
    } catch (err) {
      console.error('Error deleting workout:', err);
    }
  };

  // Calculate stats
  const stats = {
    totalWorkouts: history.length,
    totalTime: history.reduce((acc, w) => acc + (w.duration || 0), 0),
    totalVolume: history.reduce((acc, w) =>
      acc + w.exercises.reduce((eAcc, ex) =>
        eAcc + ex.sets.filter(s => s.completed).reduce((sAcc, s) =>
          sAcc + (s.weight || 0) * (s.reps || 0), 0), 0), 0)
  };

  const formatTotalTime = (ms) => {
    const hours = Math.floor(ms / 3600000);
    return `${hours}h`;
  };

  const formatVolume = (lbs) => {
    if (lbs >= 1000000) return `${(lbs / 1000000).toFixed(1)}M`;
    if (lbs >= 1000) return `${(lbs / 1000).toFixed(0)}K`;
    return lbs.toLocaleString();
  };

  // Group workouts by month
  const groupByMonth = () => {
    const groups = {};
    history.forEach(workout => {
      const date = new Date(workout.date || workout.startTime);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = { label, workouts: [] };
      groups[key].workouts.push(workout);
    });
    return Object.values(groups);
  };

  const monthGroups = groupByMonth();

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <div className="fixed inset-0 z-0 bg-black">
        <img src="/backgrounds/bg-10.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-shrink-0 p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">History</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowImport(true)} className="bg-teal-500/20 backdrop-blur-sm text-teal-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-500/30 flex items-center gap-2 border border-teal-500/30">
                <Icons.Import /> Import
              </button>
              {history.length > 0 && (
                <button onClick={() => setShowExport(true)} className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 flex items-center gap-2 border border-white/20">
                  <Icons.Export /> Export
                </button>
              )}
            </div>
          </div>

          {history.length > 0 && (
            <div className="flex gap-2">
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-rose-400">{stats.totalWorkouts.toLocaleString()}</div>
                <div className="text-xs text-white/60">Workouts</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-teal-400">{formatTotalTime(stats.totalTime)}</div>
                <div className="text-xs text-white/60">Total Time</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-cyan-400">{formatVolume(stats.totalVolume)}</div>
                <div className="text-xs text-white/60">Volume (lbs)</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)', overscrollBehavior: 'contain' }} onScroll={(e) => onScroll?.(e.target.scrollTop)}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-white/50">Loading...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center">
                <span className="text-white/30 text-4xl"><Icons.History /></span>
                <p className="mt-4 text-white/60">No workouts yet</p>
                <p className="text-sm text-white/40">Complete a workout to see it here</p>
              </div>
            </div>
          ) : (
            monthGroups.map(({ label, workouts }) => (
              <div key={label} className="mb-6">
                <h3 className="text-sm font-semibold text-teal-400/80 mb-3 sticky top-0 bg-black/80 backdrop-blur-sm py-2 -mx-4 px-4">{label}</h3>
                {workouts.map((workout) => {
                  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
                  const totalVolume = workout.exercises.reduce((acc, ex) =>
                    acc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.reps || 0), 0), 0);
                  const workoutDate = new Date(workout.date || workout.startTime);
                  const duration = workout.duration ? Math.round(workout.duration / 60000) : 0;

                  // Count phases
                  const phaseCounts = { warmup: 0, workout: 0, cooldown: 0 };
                  workout.exercises.forEach(ex => { phaseCounts[ex.phase || 'workout']++; });

                  return (
                    <button key={workout.id} onClick={() => setSelectedWorkout(workout)}
                      className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3 border border-white/20 hover:bg-white/15 transition-colors text-left">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{workout.name}</h4>
                          <div className="text-sm text-white/60">
                            {workoutDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {duration > 0 && ` • ${duration} min`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-cyan-400 font-medium">{totalSets} sets</div>
                          {totalVolume > 0 && <div className="text-sm text-white/60">{totalVolume.toLocaleString()} lbs</div>}
                        </div>
                      </div>

                      {/* Phase indicators */}
                      <div className="flex gap-2 mb-2">
                        {phaseCounts.warmup > 0 && <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">🔥 {phaseCounts.warmup}</span>}
                        {phaseCounts.workout > 0 && <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full">💪 {phaseCounts.workout}</span>}
                        {phaseCounts.cooldown > 0 && <span className="bg-teal-500/20 text-teal-400 text-xs px-2 py-0.5 rounded-full">🧊 {phaseCounts.cooldown}</span>}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.slice(0, 5).map((ex, j) => (
                          <span key={j} className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs border border-white/20">
                            {ex.name}
                          </span>
                        ))}
                        {workout.exercises.length > 5 && (
                          <span className="text-white/50 text-xs py-1">+{workout.exercises.length - 5} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {showExport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Export History</h3>
              <button onClick={() => setShowExport(false)} className="text-white/60 hover:text-white"><Icons.X /></button>
            </div>
            <pre className="bg-black/50 rounded-lg p-3 text-xs text-white/70 overflow-auto max-h-64 mb-4 border border-white/10">
              {JSON.stringify({ workouts: history.slice(0, 5).map(w => JSON.parse(exportWorkoutJSON(w))) }, null, 2).slice(0, 1000)}...
            </pre>
            <button onClick={async () => { await navigator.clipboard.writeText(JSON.stringify({ workouts: history.map(w => JSON.parse(exportWorkoutJSON(w))) }, null, 2)); }}
              className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-medium hover:bg-white/30 border border-white/30">Copy to Clipboard</button>
          </div>
        </div>
      )}

      {selectedWorkout && (
        <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} onDelete={deleteWorkout} />
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Import Workout History</h3>
              {!importing && <button onClick={() => { setShowImport(false); setImportStatus(null); }} className="text-white/60 hover:text-white"><Icons.X /></button>}
            </div>

            {!importStatus ? (
              <>
                <p className="text-white/60 text-sm mb-6">
                  Import your workout history from Strong app. This includes {1453} workouts with exercise phases automatically inferred (warmup, workout, cooldown).
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => importStrongHistory(false)}
                    disabled={importing}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50"
                  >
                    Add to Existing History
                  </button>
                  <button
                    onClick={() => importStrongHistory(true)}
                    disabled={importing}
                    className="w-full bg-rose-600 text-white py-3 rounded-xl font-medium hover:bg-rose-700 disabled:opacity-50"
                  >
                    Replace All History
                  </button>
                  <button
                    onClick={() => setShowImport(false)}
                    disabled={importing}
                    className="w-full bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div>
                {!importStatus.done && !importStatus.error && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${importStatus.progress}%` }}></div>
                    </div>
                    <p className="text-white/60 text-sm text-center">{importStatus.message}</p>
                  </div>
                )}

                {importStatus.done && (
                  <div className="text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-teal-400 font-medium mb-4">{importStatus.message}</p>
                    <button
                      onClick={() => { setShowImport(false); setImportStatus(null); }}
                      className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700"
                    >
                      Done
                    </button>
                  </div>
                )}

                {importStatus.error && (
                  <div className="text-center">
                    <div className="text-4xl mb-2">❌</div>
                    <p className="text-rose-400 font-medium mb-4">{importStatus.message}</p>
                    <button
                      onClick={() => setImportStatus(null)}
                      className="w-full bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { HistoryScreen };
