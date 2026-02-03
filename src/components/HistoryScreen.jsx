import { useState } from 'react';
import { Icons } from './Icons';
import { CATEGORIES } from '../data/constants';
import { formatDuration, exportWorkoutJSON } from '../utils/helpers';

const HistoryScreen = ({ history }) => {
  const [showExport, setShowExport] = useState(false);

  // Calculate stats
  const totalWorkouts = history.length;
  const totalTime = history.reduce((acc, w) => acc + (w.duration || 0), 0);
  const totalVolume = history.reduce((acc, w) => {
    return acc + w.exercises.reduce((eAcc, ex) => {
      return eAcc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0);
    }, 0);
  }, 0);

  return (
    <div className="relative flex flex-col h-full bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/backgrounds/bg-10.jpg" alt="" className="w-full h-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
      </div>
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Stats */}
        <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">History</h2>
            {history.length > 0 && (
              <button onClick={() => setShowExport(true)} className="bg-white/10 backdrop-blur-sm text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 flex items-center gap-2 border border-white/20">
                <Icons.Export /> Export
              </button>
            )}
          </div>
          {/* Stats Row */}
          {history.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div className="text-2xl font-bold text-rose-400">{totalWorkouts}</div>
                <div className="text-xs text-gray-400">Workouts</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div className="text-2xl font-bold text-teal-400">{Math.round(totalTime / 3600000)}h</div>
                <div className="text-xs text-gray-400">Total Time</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div className="text-2xl font-bold text-blue-400">{totalVolume >= 1000 ? `${Math.round(totalVolume / 1000)}k` : totalVolume}</div>
                <div className="text-xs text-gray-400">Volume (lbs)</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-teal-500/50"><Icons.History /></span>
              <p className="mt-4">No workouts yet</p>
            </div>
          ) : (
            history.map((workout, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20 hover:border-teal-500/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{workout.name}</h3>
                    <div className="text-sm text-gray-400">{new Date(workout.startTime).toLocaleDateString()} • {Math.round(workout.duration / 60000)} min</div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-medium">{workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)} sets</div>
                    <div className="text-sm text-teal-400">{workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0), 0).toLocaleString()} lbs</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {workout.exercises.map((ex, j) => <span key={j} className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-xs border border-white/20">{ex.name}</span>)}
                </div>
              </div>
            ))
          )}
        </div>

        {showExport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Export History</h3>
                <button onClick={() => setShowExport(false)} className="text-gray-400 hover:text-white"><Icons.X /></button>
              </div>
              <pre className="bg-black/50 rounded-lg p-3 text-xs text-gray-300 overflow-auto max-h-64 mb-4 border border-white/10">
                {JSON.stringify({ workouts: history.map(w => JSON.parse(exportWorkoutJSON(w))) }, null, 2).slice(0, 1000)}...
              </pre>
              <button onClick={async () => { await navigator.clipboard.writeText(JSON.stringify({ workouts: history.map(w => JSON.parse(exportWorkoutJSON(w))) }, null, 2)); }}
                className="w-full bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800">Copy to Clipboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { HistoryScreen };
