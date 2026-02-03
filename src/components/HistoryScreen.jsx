import { useState } from 'react';
import { Icons } from './Icons';
import { CATEGORIES } from '../data/constants';
import { formatDuration, exportWorkoutJSON } from '../utils/helpers';

const HistoryScreen = ({ history }) => {
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="relative flex flex-col h-full bg-gray-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/backgrounds/bg-10.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
      </div>
      <div className="relative z-10 flex flex-col h-full">
      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">History</h2>
        {history.length > 0 && (
          <button onClick={() => setShowExport(true)} className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 flex items-center gap-2 border border-white/20">
            <Icons.Export /> Export
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center">
              <span className="text-white/30 text-4xl"><Icons.History /></span>
              <p className="mt-4 text-white/60">No workouts yet</p>
              <p className="text-sm text-white/40">Complete a workout to see it here</p>
            </div>
          </div>
        ) : (
          history.map((workout, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{workout.name}</h3>
                  <div className="text-sm text-white/60">{new Date(workout.startTime).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)} sets</div>
                  <div className="text-sm text-white/60">{Math.round(workout.duration / 60000)} min</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {workout.exercises.map((ex, j) => <span key={j} className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs border border-white/20">{ex.name}</span>)}
              </div>
            </div>
          ))
        )}
      </div>

      {showExport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Export History</h3>
              <button onClick={() => setShowExport(false)} className="text-white/60 hover:text-white"><Icons.X /></button>
            </div>
            <pre className="bg-black/50 rounded-lg p-3 text-xs text-white/70 overflow-auto max-h-64 mb-4 border border-white/10">
              {JSON.stringify({ workouts: history.map(w => JSON.parse(exportWorkoutJSON(w))) }, null, 2).slice(0, 1000)}...
            </pre>
            <button onClick={async () => { await navigator.clipboard.writeText(JSON.stringify({ workouts: history.map(w => JSON.parse(exportWorkoutJSON(w))) }, null, 2)); }}
              className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-medium hover:bg-white/30 border border-white/30">Copy to Clipboard</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export { HistoryScreen };
