import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { BODY_PARTS, CATEGORIES, BAND_COLORS, RPE_DESCRIPTIONS, EXERCISE_TYPES } from '../data/constants';
import { formatDuration, generateStravaDescription, getDefaultSetForCategory } from '../utils/helpers';

const NumberPad = ({ value, onChange, onClose, onNext, showRPE, rpeValue, onRPEChange, fieldLabel }) => {
  const [showRPEPicker, setShowRPEPicker] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  // Reset hasEdited when field changes (e.g., when Next is pressed)
  useEffect(() => {
    setHasEdited(false);
  }, [fieldLabel]);

  const handleDigit = (digit) => {
    if (!hasEdited) {
      // First keystroke - overwrite the existing value
      onChange(digit);
      setHasEdited(true);
    } else {
      // Subsequent keystrokes - append
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleDecimal = () => {
    if (!value.includes('.')) onChange(value + '.');
  };

  const handlePlusMinus = (delta) => {
    const num = parseFloat(value) || 0;
    const newVal = Math.max(0, num + delta);
    onChange(String(newVal));
  };

  const rpeOptions = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

  return (
    <div className="fixed inset-x-0 bottom-0 bg-gray-900 border-t border-gray-800 z-50 rounded-t-2xl">
      {showRPEPicker ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setShowRPEPicker(false)} className="text-gray-400 p-2">
              <Icons.Back />
            </button>
            <span className="text-white font-medium">Rate of Perceived Exertion</span>
            <div className="w-10"></div>
          </div>
          <div className="text-center text-gray-400 text-sm mb-4">
            {rpeValue ? RPE_DESCRIPTIONS[rpeValue] : 'How hard was this set?'}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {rpeOptions.map(rpe => (
              <button key={rpe} onClick={() => { onRPEChange(rpe); setShowRPEPicker(false); }}
                className={`w-12 h-12 rounded-lg font-bold text-lg ${rpeValue === rpe ? 'bg-rose-700 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                {rpe}
              </button>
            ))}
          </div>
          {rpeValue && (
            <button onClick={() => { onRPEChange(null); setShowRPEPicker(false); }}
              className="w-full py-2 text-red-400 text-sm">Clear RPE</button>
          )}
        </div>
      ) : (
        <div className="p-3">
          {/* Header with field label */}
          <div className="text-center text-gray-400 text-xs uppercase mb-2">{fieldLabel}</div>
          {/* Orange dismiss button - full width */}
          <button onClick={onClose} className="w-full h-10 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div className="grid grid-cols-4 gap-2">
            {['1', '2', '3'].map(d => (
              <button key={d} onClick={() => handleDigit(d)} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">{d}</button>
            ))}
            {showRPE ? (
              <button onClick={() => setShowRPEPicker(true)} className="bg-gray-700 text-white text-sm font-medium py-4 rounded-lg hover:bg-gray-600 flex flex-col items-center justify-center">
                <span>RPE</span>
                {rpeValue && <span className="text-rose-400 text-xs">{rpeValue}</span>}
              </button>
            ) : (
              <div></div>
            )}

            {['4', '5', '6'].map(d => (
              <button key={d} onClick={() => handleDigit(d)} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">{d}</button>
            ))}
            <div className="flex gap-1">
              <button onClick={() => handlePlusMinus(-1)} className="flex-1 bg-gray-700 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-600">−</button>
              <button onClick={() => handlePlusMinus(1)} className="flex-1 bg-gray-700 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-600">+</button>
            </div>

            {['7', '8', '9'].map(d => (
              <button key={d} onClick={() => handleDigit(d)} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">{d}</button>
            ))}
            <button onClick={handleBackspace} className="bg-red-500/20 text-red-400 text-xl font-medium py-4 rounded-lg hover:bg-red-500/30">⌫</button>

            {/* Bottom row: 0 (double wide), ., Next */}
            <button onClick={() => handleDigit('0')} className="col-span-2 bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">0</button>
            <button onClick={handleDecimal} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">.</button>
            <button onClick={onNext} className="bg-cyan-600 text-white text-base font-bold py-4 rounded-lg hover:bg-cyan-700">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Set Input Row Component with rest time display
const SetInputRow = ({ set, setIndex, category, onUpdate, onComplete, onRemove, restTime, previousSet, previousWorkoutSet, onOpenNumpad, activeField }) => {
  const fields = CATEGORIES[category]?.fields || ['weight', 'reps'];
  const [showBandPicker, setShowBandPicker] = useState(false);
  const rowRef = useRef(null);

  // Scroll into view when this row becomes active
  useEffect(() => {
    if (activeField && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeField]);

  const renderInput = (field, fieldIndex) => {
    const isActive = activeField === field;

    // Special handling for band color field
    if (field === 'bandColor') {
      const currentColor = set.bandColor || 'red';
      const colorInfo = BAND_COLORS[currentColor] || BAND_COLORS.red;
      return (
        <div key={field} className="flex-1 relative">
          <button
            onClick={() => setShowBandPicker(!showBandPicker)}
            className={`w-full ${colorInfo.bg} ${colorInfo.text} px-2 py-2 rounded-lg text-center text-xs font-medium focus:outline-none ${isActive ? 'ring-2 ring-cyan-400' : ''}`}
          >
            {currentColor.charAt(0).toUpperCase() + currentColor.slice(1)}
          </button>
          {showBandPicker && (
            <>
              {/* Backdrop to close on tap outside */}
              <div className="fixed inset-0 z-[100]" onClick={() => setShowBandPicker(false)} />
              {/* Band picker modal */}
              <div className="fixed left-4 right-4 bg-gray-800 rounded-xl shadow-2xl z-[101] p-2 border border-gray-700" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                <div className="text-center text-white font-medium mb-2 pb-2 border-b border-gray-700">Select Band Color</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(BAND_COLORS).map(([color, info]) => (
                    <button
                      key={color}
                      onClick={() => { onUpdate('bandColor', color); setShowBandPicker(false); }}
                      className={`${info.bg} ${info.text} px-3 py-3 rounded-lg text-sm font-medium`}
                    >
                      {info.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    const placeholders = { weight: '0', reps: '0', duration: '0', distance: '0', assistedWeight: '0' };
    const labels = { weight: 'lbs', reps: 'reps', duration: 'sec', distance: 'mi', assistedWeight: '-lbs' };
    return (
      <button
        key={field}
        onClick={() => onOpenNumpad(setIndex, field, fieldIndex)}
        className={`flex-1 px-2 py-2 rounded-lg text-center text-sm focus:outline-none min-w-0 ${isActive ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-gray-700 text-white'}`}
      >
        {set[field] || placeholders[field]}
      </button>
    );
  };

  // Format previous workout data for display
  const formatPrevious = () => {
    if (!previousWorkoutSet) return '-';
    if (category === 'cardio') {
      return `${previousWorkoutSet.distance || 0} mi`;
    } else if (category === 'duration') {
      return formatDuration(previousWorkoutSet.duration);
    } else if (category === 'reps_only') {
      return `${previousWorkoutSet.reps || 0} reps`;
    } else if (category === 'assisted_bodyweight') {
      return `-${previousWorkoutSet.assistedWeight || 0} × ${previousWorkoutSet.reps || 0}`;
    } else if (category === 'band') {
      const color = previousWorkoutSet.bandColor || 'red';
      return `${color.charAt(0).toUpperCase()} × ${previousWorkoutSet.reps || 0}`;
    } else {
      return `${previousWorkoutSet.weight || 0} × ${previousWorkoutSet.reps || 0}`;
    }
  };

  // Calculate rest time from previous set
  const getRestFromPrevious = () => {
    if (!previousSet?.completedAt || !set.completedAt) return null;
    const restSeconds = Math.round((set.completedAt - previousSet.completedAt) / 1000);
    return restSeconds > 0 ? restSeconds : null;
  };

  const actualRest = getRestFromPrevious();

  return (
    <>
      {/* Rest time indicator between sets */}
      {setIndex > 0 && previousSet?.completed && (
        <div className="flex items-center justify-center py-1">
          <div className="flex-1 h-px bg-rose-700/30"></div>
          <span className="text-xs text-rose-400 font-medium px-2">
            {actualRest ? formatDuration(actualRest) : formatDuration(restTime || 90)}
          </span>
          <div className="flex-1 h-px bg-rose-700/30"></div>
        </div>
      )}
      <div ref={rowRef} className={`flex items-center gap-2 p-2 rounded-lg ${set.completed ? 'bg-green-500/20' : 'bg-gray-800/50'}`}>
        <div className="w-7 text-gray-300 font-medium text-sm text-center">{setIndex + 1}</div>
        <div className="w-16 text-gray-400 text-xs text-center truncate">{formatPrevious()}</div>
        {fields.map((field, idx) => renderInput(field, idx))}
        {set.rpe && <span className="text-xs text-rose-400 font-medium w-6">{set.rpe}</span>}
        <button onClick={onComplete} className={`p-2 rounded-lg ${set.completed ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
          <Icons.Check />
        </button>
        {onRemove && (
          <button onClick={onRemove} className="p-1 text-gray-500 hover:text-red-400">
            <Icons.X />
          </button>
        )}
      </div>
    </>
  );
};

// Exercise Search Modal with Multi-Select and Superset Support
const ExerciseSearchModal = ({ exercises, onSelect, onSelectMultiple, onClose, allowMultiSelect = true }) => {
  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExercises, setSelectedExercises] = useState([]);

  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesBodyPart = selectedBodyPart === 'All' || ex.bodyPart === selectedBodyPart;
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesBodyPart && matchesCategory;
  });

  const toggleExercise = (ex) => {
    if (selectedExercises.find(e => e.id === ex.id)) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== ex.id));
    } else {
      setSelectedExercises([...selectedExercises, ex]);
    }
  };

  const handleAddIndividually = () => {
    if (onSelectMultiple) {
      onSelectMultiple(selectedExercises, false);
    } else {
      selectedExercises.forEach(ex => onSelect(ex));
    }
    onClose();
  };

  const handleAddAsSuperset = () => {
    if (onSelectMultiple) {
      onSelectMultiple(selectedExercises, true);
    }
    onClose();
  };

  const isSelected = (ex) => selectedExercises.some(e => e.id === ex.id);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-hidden">
      {/* Full screen modal with safe-area at top */}
      <div className="absolute inset-x-0 bottom-0 bg-gray-900 rounded-t-3xl flex flex-col" style={{ top: 'env(safe-area-inset-top)' }}>
        {/* Top Header Bar - Fixed */}
        <div className="p-3 border-b border-gray-800 bg-black rounded-t-3xl">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-rose-400 font-medium">
              Cancel
            </button>
            <span className="font-bold text-white">Add Exercises</span>
            <div className="w-14"></div>
          </div>
        </div>

        {/* Action Buttons - Fixed at top */}
        {allowMultiSelect && (
          <div className="p-3 bg-gray-800 border-b-2 border-rose-700 flex items-center justify-center gap-2 flex-wrap">
            {selectedExercises.length === 0 ? (
              <span className="text-white text-sm">👆 Tap to select, then use buttons above</span>
            ) : (
              <>
                {selectedExercises.length >= 2 && (
                  <button onClick={handleAddAsSuperset} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 flex items-center gap-1">
                    <Icons.Link /> Superset ({selectedExercises.length})
                  </button>
                )}
                <button onClick={handleAddIndividually} className="bg-rose-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">
                  Add ({selectedExercises.length})
                </button>
              </>
            )}
          </div>
        )}

        {/* Search & Filters - Fixed */}
        <div className="p-3 border-b border-gray-800 bg-gray-900">
          <div className="relative mb-2">
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-800 text-white pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-600" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icons.Search /></span>
          </div>
          <div className="flex gap-2">
            <select value={selectedBodyPart} onChange={e => setSelectedBodyPart(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-2 py-1.5 rounded-lg text-xs focus:outline-none">
              <option value="All">All Body Parts</option>
              {BODY_PARTS.map(bp => <option key={bp} value={bp}>{bp}</option>)}
            </select>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-2 py-1.5 rounded-lg text-xs focus:outline-none">
              <option value="All">All Categories</option>
              {Object.entries(CATEGORIES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </div>
        </div>

        {/* Exercise List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(ex => {
            const selected = isSelected(ex);
            return (
              <button key={ex.id} onClick={() => allowMultiSelect ? toggleExercise(ex) : onSelect(ex)}
                className={`w-full text-left p-4 flex items-center gap-3 border-b border-gray-800/50 ${selected ? 'bg-rose-700/10' : 'hover:bg-gray-800/50'}`}>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                  {ex.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{ex.name}</div>
                  <div className="text-sm text-gray-400">{ex.bodyPart}</div>
                </div>
                {allowMultiSelect && (
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'border-rose-700 bg-rose-700' : 'border-gray-600'}`}>
                    {selected && <Icons.Check />}
                  </div>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && <div className="text-center text-gray-400 py-8">No exercises found</div>}
        </div>
      </div>
    </div>
  );
};

// Workout Complete Modal
const WorkoutCompleteModal = ({ workout, onClose, onSaveAsTemplate }) => {
  const [copied, setCopied] = useState(false);
  const stravaText = generateStravaDescription(workout);
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(stravaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-white">Workout Complete!</h3>
          <p className="text-gray-400 text-sm mt-1">{workout.name} • {Math.round(workout.duration / 60000)} min</p>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white flex items-center gap-2"><Icons.Strava /> Strava Description</span>
              <button onClick={copyToClipboard} className={`text-xs px-3 py-1 rounded-lg flex items-center gap-1 ${copied ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                <Icons.Copy /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-black rounded-lg p-3 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-40">{stravaText}</pre>
          </div>
          <button onClick={() => onSaveAsTemplate(workout)} className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700">Save as Template</button>
          <button onClick={onClose} className="w-full bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800">Done</button>
        </div>
      </div>
    </div>
  );
};

// Create/Edit Exercise Modal
const EditExerciseModal = ({ exercise, onSave, onClose }) => {
  const [name, setName] = useState(exercise?.name || '');
  const [bodyPart, setBodyPart] = useState(exercise?.bodyPart || 'Other');
  const [category, setCategory] = useState(exercise?.category || 'barbell');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: exercise?.id || Date.now(), name: name.trim(), bodyPart, category });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">{exercise ? 'Edit' : 'New'} Exercise</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Exercise name"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Body Part</label>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map(bp => (
                <button key={bp} onClick={() => setBodyPart(bp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${bodyPart === bp ? 'bg-rose-700 text-white' : 'bg-gray-800 text-gray-300'}`}>
                  {bp}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES).map(([key, val]) => (
                <button key={key} onClick={() => setCategory(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${category === key ? 'bg-rose-700 text-white' : 'bg-gray-800 text-gray-300'}`}>
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleSave} disabled={!name.trim()} className="w-full mt-6 bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800 disabled:opacity-50">
          {exercise ? 'Save Changes' : 'Create Exercise'}
        </button>
      </div>
    </div>
  );
};

// Create Folder Modal
const CreateFolderModal = ({ parentId, onSave, onClose }) => {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">New Folder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        </div>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Folder name"
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 mb-4" />
        <button onClick={() => { if (name.trim()) { onSave({ id: `folder-${Date.now()}`, name: name.trim(), parentId }); onClose(); } }}
          disabled={!name.trim()} className="w-full bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800 disabled:opacity-50">
          Create Folder
        </button>
      </div>
    </div>
  );
};

// Timer Screen
const TimerScreen = () => {
  const [time, setTime] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [presetTime, setPresetTime] = useState(90);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0) setIsRunning(false);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, time]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-black to-gray-900 p-6">
      <h2 className="text-xl font-semibold text-white mb-8">Rest Timer</h2>
      <div className="relative w-64 h-64 mb-8">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="128" cy="128" r="120" fill="none" stroke="#1e293b" strokeWidth="12" />
          <circle cx="128" cy="128" r="120" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 120} strokeDashoffset={2 * Math.PI * 120 * (1 - time / presetTime)} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-white font-mono">{formatDuration(time)}</span>
        </div>
      </div>
      <div className="flex gap-4 mb-8">
        <button onClick={() => setIsRunning(!isRunning)} className="w-16 h-16 rounded-full bg-rose-700 flex items-center justify-center text-white hover:bg-rose-800">
          {isRunning ? <Icons.Pause /> : <Icons.Play />}
        </button>
        <button onClick={() => { setIsRunning(false); setTime(presetTime); }} className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700">
          <Icons.Reset />
        </button>
      </div>
      <div className="flex gap-2">
        {[30, 45, 60, 90, 120, 180].map(p => (
          <button key={p} onClick={() => { setPresetTime(p); setTime(p); setIsRunning(false); }}
            className={`px-4 py-2 rounded-full text-sm font-medium ${presetTime === p ? 'bg-rose-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            {p}s
          </button>
        ))}
      </div>
    </div>
  );
};

// Rest Timer Banner - shows during rest periods
const RestTimerBanner = ({ isActive, timeRemaining, totalTime, onSkip, onAddTime, exerciseName }) => {
  if (!isActive) return null;

  const progress = timeRemaining / totalTime;
  const isUrgent = timeRemaining <= 10;

  return (
    <div className="fixed left-0 right-0 mx-auto max-w-md z-40 px-4" style={{ top: 'calc(env(safe-area-inset-top) + 3rem)' }}>
      <div className={`rounded-2xl p-4 shadow-lg border ${isUrgent ? 'bg-orange-500/95 border-orange-400 animate-pulse' : 'bg-rose-700/95 border-rose-400'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-white">
            <Icons.TimerSmall />
            <span className="text-sm font-medium">Rest Timer</span>
          </div>
          <span className="text-white/80 text-xs">{exerciseName}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-3xl font-bold text-white font-mono">{formatDuration(timeRemaining)}</div>
            <div className="h-1.5 bg-white/30 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress * 100}%` }}></div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onAddTime} className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium">+30s</button>
            <button onClick={onSkip} className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium">Skip</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NumberPad, SetInputRow, ExerciseSearchModal, WorkoutCompleteModal, RestTimerBanner, CreateFolderModal, EditExerciseModal };
