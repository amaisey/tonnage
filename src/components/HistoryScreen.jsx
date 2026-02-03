import { useState } from 'react';
import { Icons } from './Icons';
import { CATEGORIES } from '../data/constants';
import { formatDuration, exportWorkoutJSON } from '../utils/helpers';

const HistoryScreen = ({ history }) => {
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="relative flex flex-col h-full bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/backgrounds/bg-10.jpg" alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black"></div>
      </div>
      <div className="relative z-10 flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">History</h2>
        {history.length > 0 && (
          <button onClick={() => setShowExport(true)} className="bg-gray-900 text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2 border border-gray-800">
            <Icons.Export /> Export
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-teal-500/50"><Icons.History /></span>
            <p className="mt-4">No workouts yet</p>
          </div>
        ) : (
          history.map((workout, i) => (
            <div key={i} className="bg-gray-900/80 rounded-2xl p-4 mb-4 border border-gray-800/50 hover:border-teal-800/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{workout.name}</h3>
                  <div className="text-sm text-gray-400">{new Date(workout.startTime).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-medium">{workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)} sets</div>
                  <div className="text-sm text-teal-400/70">{Math.round(workout.duration / 60000)} min</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {workout.exercises.map((ex, j) => <span key={j} className="bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full text-xs border border-gray-700/50">{ex.name}</span>)}
              </div>
            </div>
          ))
        )}
      </div>

      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Export History</h3>
              <button onClick={() => setShowExport(false)} className="text-gray-400 hover:text-white"><Icons.X /></button>
            </div>
            <pre className="bg-black rounded-lg p-3 text-xs text-gray-300 overflow-auto max-h-64 mb-4">
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
