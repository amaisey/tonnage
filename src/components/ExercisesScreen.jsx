import { useState } from 'react';
import { Icons } from './Icons';
import { BODY_PARTS, CATEGORIES, BAND_COLORS, EXERCISE_TYPES } from '../data/constants';
import { formatDuration } from '../utils/helpers';
import { EditExerciseModal, ExerciseSearchModal } from './SharedComponents';

const ExercisesScreen = ({ exercises, onAddExercise, onUpdateExercise, onDeleteExercise, history = [], onScroll, navVisible }) => {
  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('All');
  const [editingExercise, setEditingExercise] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesBodyPart = selectedBodyPart === 'All' || ex.bodyPart === selectedBodyPart;
    return matchesSearch && matchesBodyPart;
  });

  const grouped = filtered.reduce((acc, ex) => {
    if (!acc[ex.bodyPart]) acc[ex.bodyPart] = [];
    acc[ex.bodyPart].push(ex);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Background Image - fixed position */}
      <div className="fixed inset-0 z-0 bg-black">
        <img src="/backgrounds/bg-2.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Exercises</h2>
            <button onClick={() => setShowCreate(true)} className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 flex items-center gap-2 border border-white/30">
              <Icons.Plus /> New
            </button>
          </div>
          <div className="relative mb-3">
            <input type="text" placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 placeholder-white/50" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"><Icons.Search /></span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            {['All', ...BODY_PARTS].map(bp => (
              <button key={bp} onClick={() => setSelectedBodyPart(bp)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${selectedBodyPart === bp ? 'bg-white/30 text-white border border-white/40' : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'}`}>
                {bp}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
            overscrollBehavior: 'contain'
          }}
          onScroll={(e) => onScroll?.(e.target.scrollTop)}
        >
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([bodyPart, exs]) => (
            <div key={bodyPart} className="mb-6">
              <h3 className="text-sm font-semibold text-teal-400/80 mb-2">{bodyPart}</h3>
              {exs.map(ex => (
                <button key={ex.id} onClick={() => setSelectedExercise(ex)}
                  className="w-full flex items-center justify-between p-3 bg-gray-900/80 rounded-xl mb-2 hover:bg-gray-800 text-left border border-gray-800/50 hover:border-cyan-800/30">
                  <div>
                    <div className="font-medium text-white">{ex.name}</div>
                    <div className="text-xs text-gray-400">{CATEGORIES[ex.category]?.label}</div>
                  </div>
                  <span className="text-cyan-500/50"><Icons.ChevronRight /></span>
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center text-gray-400 py-8">No exercises found</div>}
        </div>
      </div>

      {showCreate && <EditExerciseModal onSave={onAddExercise} onClose={() => setShowCreate(false)} />}
      {editingExercise && <EditExerciseModal exercise={editingExercise} onSave={onUpdateExercise} onClose={() => setEditingExercise(null)} />}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          history={history}
          onEdit={() => { setEditingExercise(selectedExercise); setSelectedExercise(null); }}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};

// Background images mapped to exercise categories
const CATEGORY_BACKGROUNDS = {
  barbell: '/backgrounds/bg-1.jpg',
  dumbbell: '/backgrounds/bg-3.jpg',
  machine: '/backgrounds/bg-8.jpg',
  weighted_bodyweight: '/backgrounds/bg-6.jpg',
  assisted_bodyweight: '/backgrounds/bg-7.jpg',
  reps_only: '/backgrounds/bg-4.jpg',
  cardio: '/backgrounds/bg-5.jpg',
  duration: '/backgrounds/bg-4.jpg',
  band: '/backgrounds/bg-9.jpg',
};

// Exercise Detail Modal with About, History, Charts, Records tabs
const ExerciseDetailModal = ({ exercise, history, onEdit, onClose }) => {
  const [activeTab, setActiveTab] = useState('about');
  const backgroundImage = CATEGORY_BACKGROUNDS[exercise.category] || '/backgrounds/bg-1.jpg';

  // Get all instances of this exercise from history
  const exerciseHistory = history.flatMap(workout =>
    workout.exercises
      .filter(ex => ex.name === exercise.name)
      .map(ex => ({
        ...ex,
        workoutDate: workout.startTime,
        workoutName: workout.name
      }))
  ).sort((a, b) => b.workoutDate - a.workoutDate);

  // Calculate records
  const records = {
    maxWeight: 0,
    maxReps: 0,
    maxVolume: 0,
    maxDuration: 0,
    maxDistance: 0,
    totalSets: 0,
    totalVolume: 0,
  };

  exerciseHistory.forEach(ex => {
    ex.sets.filter(s => s.completed).forEach(set => {
      records.totalSets++;
      if (set.weight) {
        records.maxWeight = Math.max(records.maxWeight, set.weight);
        const volume = (set.weight || 0) * (set.reps || 0);
        records.maxVolume = Math.max(records.maxVolume, volume);
        records.totalVolume += volume;
      }
      if (set.reps) records.maxReps = Math.max(records.maxReps, set.reps);
      if (set.duration) records.maxDuration = Math.max(records.maxDuration, set.duration);
      if (set.distance) records.maxDistance = Math.max(records.maxDistance, set.distance);
    });
  });

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'history', label: 'History' },
    { id: 'charts', label: 'Charts' },
    { id: 'records', label: 'Records' },
  ];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Hero Header with Background Image */}
      <div className="relative h-48 flex-shrink-0">
        <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black"></div>
        <div className="relative z-10 h-full flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="px-4 py-3 flex items-center justify-between">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 border border-white/20"><Icons.X /></button>
            <button onClick={onEdit} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 border border-white/20">Edit</button>
          </div>
          <div className="flex-1 flex flex-col justify-end p-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{exercise.name}</h2>
            <p className="text-white/80 text-sm">{exercise.bodyPart} • {CATEGORIES[exercise.category]?.label}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 backdrop-blur-sm border-b border-white/10">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-white border-b-2 border-white' : 'text-white/50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-black" style={{ overscrollBehavior: 'contain' }}>
        {activeTab === 'about' && (
          <div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
              <h3 className="text-sm font-semibold text-white/60 mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{exerciseHistory.length}</div>
                  <div className="text-xs text-white/60">Times Performed</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{records.totalSets}</div>
                  <div className="text-xs text-white/60">Total Sets</div>
                </div>
                {records.maxWeight > 0 && (
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{records.maxWeight}</div>
                    <div className="text-xs text-white/60">Max Weight (lbs)</div>
                  </div>
                )}
                {records.maxReps > 0 && (
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{records.maxReps}</div>
                    <div className="text-xs text-white/60">Max Reps</div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-sm font-semibold text-white/60 mb-2">Instructions</h3>
              <p className="text-white/80 text-sm">
                {exercise.instructions || "No instructions added yet. Tap Edit to add instructions for this exercise."}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {exerciseHistory.length === 0 ? (
              <div className="text-center text-white/50 py-8">No history for this exercise yet</div>
            ) : (
              exerciseHistory.map((ex, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3 border border-white/20">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-white">{ex.workoutName}</div>
                    <div className="text-xs text-white/50">{new Date(ex.workoutDate).toLocaleDateString()}</div>
                  </div>
                  <div className="space-y-1">
                    {ex.sets.filter(s => s.completed).map((set, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <span className="text-white/40 w-6">{j + 1}</span>
                        {set.weight !== undefined && <span className="text-white">{set.weight} lbs</span>}
                        {set.reps !== undefined && <span className="text-white/60">× {set.reps}</span>}
                        {set.duration !== undefined && <span className="text-white">{formatDuration(set.duration)}</span>}
                        {set.distance !== undefined && <span className="text-white">{set.distance} km</span>}
                        {set.bandColor && <span className={`${BAND_COLORS[set.bandColor]?.bg} ${BAND_COLORS[set.bandColor]?.text} px-2 py-0.5 rounded text-xs`}>{set.bandColor}</span>}
                        {set.rpe && <span className="text-white/70 text-xs bg-white/10 px-2 py-0.5 rounded">RPE {set.rpe}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div>
            {exerciseHistory.length === 0 ? (
              <div className="text-center text-white/50 py-8">Complete this exercise to see charts</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="text-sm font-semibold text-white/60 mb-4">Max Weight Over Time</h3>
                  <div className="flex items-end gap-1 h-32">
                    {exerciseHistory.slice(0, 10).reverse().map((ex, i) => {
                      const maxW = Math.max(...ex.sets.filter(s => s.completed && s.weight).map(s => s.weight), 0);
                      const heightPct = records.maxWeight > 0 ? (maxW / records.maxWeight) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-rose-600 rounded-t" style={{ height: `${heightPct}%`, minHeight: maxW > 0 ? '4px' : '0' }}></div>
                          <span className="text-xs text-white/40">{new Date(ex.workoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="text-sm font-semibold text-white/60 mb-4">Volume Over Time</h3>
                  <div className="flex items-end gap-1 h-32">
                    {exerciseHistory.slice(0, 10).reverse().map((ex, i) => {
                      const vol = ex.sets.filter(s => s.completed).reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0);
                      const maxVol = Math.max(...exerciseHistory.map(e => e.sets.filter(s => s.completed).reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0)));
                      const heightPct = maxVol > 0 ? (vol / maxVol) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-teal-500 rounded-t" style={{ height: `${heightPct}%`, minHeight: vol > 0 ? '4px' : '0' }}></div>
                          <span className="text-xs text-white/40">{new Date(ex.workoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <div>
            {exerciseHistory.length === 0 ? (
              <div className="text-center text-white/50 py-8">Complete this exercise to see records</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {records.maxWeight > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{records.maxWeight}</div>
                    <div className="text-xs text-white/50 mt-1">Max Weight (lbs)</div>
                  </div>
                )}
                {records.maxReps > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{records.maxReps}</div>
                    <div className="text-xs text-white/50 mt-1">Max Reps</div>
                  </div>
                )}
                {records.maxVolume > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{records.maxVolume.toLocaleString()}</div>
                    <div className="text-xs text-white/50 mt-1">Max Volume (lbs)</div>
                  </div>
                )}
                {records.totalVolume > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{records.totalVolume.toLocaleString()}</div>
                    <div className="text-xs text-white/50 mt-1">Total Volume (lbs)</div>
                  </div>
                )}
                {records.maxDuration > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{formatDuration(records.maxDuration)}</div>
                    <div className="text-xs text-white/50 mt-1">Max Duration</div>
                  </div>
                )}
                {records.maxDistance > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{records.maxDistance}</div>
                    <div className="text-xs text-white/50 mt-1">Max Distance (km)</div>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-3xl font-bold text-white">{records.totalSets}</div>
                  <div className="text-xs text-white/50 mt-1">Total Sets</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-3xl font-bold text-white">{exerciseHistory.length}</div>
                  <div className="text-xs text-white/50 mt-1">Times Performed</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { ExercisesScreen };
