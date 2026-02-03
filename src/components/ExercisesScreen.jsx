import { useState } from 'react';
import { Icons } from './Icons';
import { BODY_PARTS, CATEGORIES, BAND_COLORS, EXERCISE_TYPES } from '../data/constants';
import { formatDuration, getDefaultSetForCategory } from '../utils/helpers';
import { EditExerciseModal, ExerciseSearchModal } from './SharedComponents';

const ExercisesScreen = ({ exercises, onAddExercise, onUpdateExercise, onDeleteExercise, history = [] }) => {
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
    <div className="relative flex flex-col h-full bg-gray-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/backgrounds/bg-2.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>
      </div>
      <div className="relative z-10 flex flex-col h-full">
      <div className="px-4 pb-4 border-b border-white/10 bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
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
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['All', ...BODY_PARTS].map(bp => (
            <button key={bp} onClick={() => setSelectedBodyPart(bp)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${selectedBodyPart === bp ? 'bg-white/30 text-white border border-white/40' : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'}`}>
              {bp}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
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
    maxVolume: 0, // weight × reps
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
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Hero Header with Background Image */}
      <div className="relative h-48 flex-shrink-0">
        <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-gray-900"></div>
        <div className="relative z-10 h-full flex flex-col">
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
      <div className="flex-1 overflow-y-auto p-4">
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
                {/* Simple bar chart visualization for max weight over time */}
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

// Import Modal with error handling
const ImportModal = ({ folders, currentFolderId, onAddFolder, onBulkAddFolders, onImport, onBulkImport, onUpdateTemplate, onAddExercises, existingExercises, existingTemplates, onClose }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addNewExercises, setAddNewExercises] = useState(true);
  const [pendingImport, setPendingImport] = useState(null); // { duplicates, newTemplates, foldersToAdd, exercisesToAdd }

  // Helper to find or create folder by path
  const getOrCreateFolderByPath = (folderPath, allFolders, newFoldersToAdd) => {
    if (!folderPath) return currentFolderId;

    const parts = folderPath.split('/').filter(p => p.trim());
    let parentId = 'root';

    for (const part of parts) {
      const existing = allFolders.find(f => f.name === part.trim() && f.parentId === parentId);
      if (existing) {
        parentId = existing.id;
      } else {
        const newFolder = { id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: part.trim(), parentId };
        newFoldersToAdd.push(newFolder);
        allFolders.push(newFolder);
        parentId = newFolder.id;
      }
    }

    return parentId;
  };

  // Collect new exercises from templates
  const collectNewExercises = (templates) => {
    const newExercises = [];
    const existingNames = new Set(existingExercises.map(e => e.name.toLowerCase()));
    const addedNames = new Set();

    templates.forEach(t => {
      t.exercises?.forEach(ex => {
        const nameLower = ex.name.toLowerCase();
        if (!existingNames.has(nameLower) && !addedNames.has(nameLower)) {
          newExercises.push({
            id: Date.now() + Math.random(),
            name: ex.name,
            bodyPart: ex.bodyPart || 'Other',
            category: ex.category || 'machine'
          });
          addedNames.add(nameLower);
        }
      });
    });

    return newExercises;
  };

  // Get folder path for a folderId
  const getFolderPath = (folderId, allFolders) => {
    if (!folderId || folderId === 'root') return '';
    const parts = [];
    let current = allFolders.find(f => f.id === folderId);
    while (current) {
      parts.unshift(current.name);
      current = allFolders.find(f => f.id === current.parentId);
    }
    return parts.join('/');
  };

  const handleImport = () => {
    setError('');
    setSuccess('');
    setPendingImport(null);

    if (!text.trim()) {
      setError('Please paste JSON data');
      return;
    }

    try {
      const data = JSON.parse(text);
      let allFolders = [...folders];
      let newFoldersToAdd = [];

      const processTemplates = (templatesData) => {
        const duplicates = [];
        const newTemplates = [];

        templatesData.forEach(t => {
          if (t.name && t.exercises) {
            const folderId = getOrCreateFolderByPath(t.folder, allFolders, newFoldersToAdd);
            const templateData = { ...t, folderId, folder: undefined };

            // Check for existing template with same name in same folder
            const existing = existingTemplates.find(et =>
              et.name.toLowerCase() === t.name.toLowerCase() && et.folderId === folderId
            );

            if (existing) {
              duplicates.push({ existing, incoming: templateData, folder: t.folder || getFolderPath(folderId, allFolders) });
            } else {
              newTemplates.push({ ...templateData, id: Date.now() + Math.random() });
            }
          }
        });

        return { duplicates, newTemplates };
      };

      let templatesData = [];
      if (data.templates && Array.isArray(data.templates)) {
        templatesData = data.templates;
      } else if (data.name && data.exercises) {
        if (!Array.isArray(data.exercises)) {
          setError('"exercises" must be an array');
          return;
        }
        templatesData = [data];
      } else {
        setError('JSON must have "name" and "exercises" fields, or be a bulk import with "templates" array');
        return;
      }

      const { duplicates, newTemplates } = processTemplates(templatesData);
      const exercisesToAdd = addNewExercises ? collectNewExercises(templatesData) : [];

      if (duplicates.length > 0) {
        // Show confirmation dialog
        setPendingImport({ duplicates, newTemplates, foldersToAdd: newFoldersToAdd, exercisesToAdd });
      } else {
        // No duplicates, proceed directly
        executeImport(newTemplates, [], newFoldersToAdd, exercisesToAdd);
      }
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  const executeImport = (newTemplates, templatesToUpdate, foldersToAdd, exercisesToAdd) => {
    // Filter out folders that already exist (in case of re-import)
    const actualNewFolders = foldersToAdd.filter(newFolder =>
      !folders.some(existingFolder =>
        existingFolder.name === newFolder.name && existingFolder.parentId === newFolder.parentId
      )
    );

    // Add folders
    if (actualNewFolders.length > 0) {
      onBulkAddFolders(actualNewFolders);
    }

    // Filter out exercises that already exist
    const actualNewExercises = exercisesToAdd.filter(newEx =>
      !existingExercises.some(ex => ex.name.toLowerCase() === newEx.name.toLowerCase())
    );

    // Add exercises
    if (actualNewExercises.length > 0) {
      onAddExercises(actualNewExercises);
    }

    // Update existing templates
    templatesToUpdate.forEach(t => onUpdateTemplate(t));

    // Add new templates
    if (newTemplates.length > 0) {
      onBulkImport(newTemplates);
    }

    const total = newTemplates.length + templatesToUpdate.length;
    const updateInfo = templatesToUpdate.length > 0 ? ` (${templatesToUpdate.length} updated)` : '';
    setSuccess(`Imported ${total} template(s)${updateInfo}!`);
    setPendingImport(null);
    setTimeout(onClose, 1500);
  };

  const handleConfirmOverride = () => {
    if (!pendingImport) return;

    const templatesToUpdate = pendingImport.duplicates.map(d => ({
      ...d.incoming,
      id: d.existing.id // Keep existing ID for update
    }));

    executeImport(pendingImport.newTemplates, templatesToUpdate, pendingImport.foldersToAdd, pendingImport.exercisesToAdd);
  };

  const handleSkipDuplicates = () => {
    if (!pendingImport) return;
    executeImport(pendingImport.newTemplates, [], pendingImport.foldersToAdd, pendingImport.exercisesToAdd);
  };

  // Duplicate confirmation view
  if (pendingImport) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Duplicates Found</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
          </div>

          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 mb-4">
            <div className="text-sm text-amber-400">
              ⚠️ {pendingImport.duplicates.length} template(s) already exist with the same name and folder:
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {pendingImport.duplicates.map((d, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3">
                <div className="font-medium text-white">{d.incoming.name}</div>
                <div className="text-xs text-gray-400">{d.folder || 'Root'}</div>
              </div>
            ))}
          </div>

          {pendingImport.newTemplates.length > 0 && (
            <div className="text-sm text-gray-400 mb-4">
              + {pendingImport.newTemplates.length} new template(s) will be added regardless.
            </div>
          )}

          <div className="space-y-2">
            <button onClick={handleConfirmOverride} className="w-full bg-amber-600 text-white py-3 rounded-xl font-medium hover:bg-amber-700">
              Override Existing ({pendingImport.duplicates.length})
            </button>
            <button onClick={handleSkipDuplicates} className="w-full bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600">
              Skip Duplicates{pendingImport.newTemplates.length > 0 ? ` (Import ${pendingImport.newTemplates.length} New Only)` : ''}
            </button>
            <button onClick={() => setPendingImport(null)} className="w-full text-gray-400 py-2 text-sm hover:text-white">
              ← Back to Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Import Workouts</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Paste a single workout or bulk import with folders. Folder paths like "Phase 1/Week 1" auto-create nested folders.</p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-3">
            <div className="text-sm text-red-400">❌ {error}</div>
          </div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 mb-3">
            <div className="text-sm text-green-400">✅ {success}</div>
          </div>
        )}

        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setError(''); }}
          placeholder='{"name": "Push Day", "exercises": [...]}'
          className="flex-1 min-h-[200px] bg-gray-800 text-white p-3 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-600 resize-none mb-3"
        />

        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={addNewExercises}
            onChange={e => setAddNewExercises(e.target.checked)}
            className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-rose-600 focus:ring-rose-600"
          />
          <span className="text-sm text-gray-300">Add new exercises to database</span>
        </label>

        <button onClick={handleImport} className="w-full bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800">
          Import
        </button>
      </div>
    </div>
  );
};

// Create Template Modal with Superset Support
const CreateTemplateModal = ({ folderId, allExercises, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [templateExercises, setTemplateExercises] = useState([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const addExercises = (exercises, asSuperset) => {
    if (asSuperset && exercises.length >= 2) {
      const supersetId = `superset-${Date.now()}`;
      const newExercises = exercises.map(ex => ({
        ...ex,
        supersetId,
        restTime: 90,
        sets: [getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category)]
      }));
      setTemplateExercises([...templateExercises, ...newExercises]);
    } else {
      const newExercises = exercises.map(ex => ({
        ...ex,
        restTime: 90,
        sets: [getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category)]
      }));
      setTemplateExercises([...templateExercises, ...newExercises]);
    }
    setShowExercisePicker(false);
  };

  const addSingleExercise = (exercise) => addExercises([exercise], false);

  const updateSetCount = (exIndex, count) => {
    const updated = [...templateExercises];
    const exercise = updated[exIndex];
    const currentCount = exercise.sets.length;
    if (count > currentCount) {
      for (let i = 0; i < count - currentCount; i++) {
        exercise.sets.push(getDefaultSetForCategory(exercise.category));
      }
    } else {
      exercise.sets = exercise.sets.slice(0, count);
    }
    setTemplateExercises(updated);
  };

  const removeExercise = (index) => {
    setTemplateExercises(templateExercises.filter((_, i) => i !== index));
  };

  const unlinkSuperset = (index) => {
    const updated = [...templateExercises];
    delete updated[index].supersetId;
    setTemplateExercises(updated);
  };

  const updateRestTime = (exIndex, restTime) => {
    const updated = [...templateExercises];
    updated[exIndex].restTime = restTime;
    setTemplateExercises(updated);
  };

  const updateSetValue = (exIndex, setIndex, field, value) => {
    const updated = [...templateExercises];
    updated[exIndex].sets[setIndex][field] = value;
    setTemplateExercises(updated);
  };

  const handleSave = () => {
    if (!name.trim() || templateExercises.length === 0) return;
    onSave({
      id: Date.now(),
      name: name.trim(),
      folderId,
      exercises: templateExercises.map(ex => ({
        name: ex.name,
        bodyPart: ex.bodyPart,
        category: ex.category,
        supersetId: ex.supersetId,
        restTime: ex.restTime || 90,
        sets: ex.sets.map(s => {
          const newSet = {};
          Object.keys(s).forEach(k => { if (k !== 'completed') newSet[k] = s[k] || 0; });
          return newSet;
        })
      }))
    });
    onClose();
  };

  // Group exercises for display
  const getGroupedExercises = () => {
    const groups = [];
    const used = new Set();
    templateExercises.forEach((ex, idx) => {
      if (used.has(idx)) return;
      if (ex.supersetId) {
        const supersetExercises = [];
        templateExercises.forEach((e, i) => {
          if (e.supersetId === ex.supersetId) {
            supersetExercises.push({ exercise: e, index: i });
            used.add(i);
          }
        });
        groups.push({ type: 'superset', exercises: supersetExercises, supersetId: ex.supersetId });
      } else {
        groups.push({ type: 'single', exercise: ex, index: idx });
        used.add(idx);
      }
    });
    return groups;
  };

  const restTimePresets = [30, 60, 90, 120, 180];

  const renderExerciseItem = (ex, i, isSuperset = false) => {
    const fields = CATEGORIES[ex.category]?.fields || ['weight', 'reps'];
    const getFieldLabel = (f) => {
      if (f === 'weight') return 'lbs';
      if (f === 'reps') return 'reps';
      if (f === 'assistedWeight') return '-lbs';
      if (f === 'duration') return 'sec';
      if (f === 'distance') return 'km';
      if (f === 'bandColor') return 'band';
      return f;
    };

    return (
      <div key={i} className={`bg-gray-800/50 p-3 ${isSuperset ? 'border-l-4 border-teal-500' : 'rounded-xl'} mb-2`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isSuperset && <div className="w-1 h-6 bg-teal-500 rounded-full" />}
            <div>
              <div className="font-medium text-white text-sm">{ex.name}</div>
              <div className="text-xs text-gray-400">{ex.bodyPart} • {CATEGORIES[ex.category]?.label}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isSuperset && (
              <button onClick={() => unlinkSuperset(i)} className="text-teal-400 hover:text-teal-300 p-1" title="Unlink">
                <Icons.Link />
              </button>
            )}
            <button onClick={() => removeExercise(i)} className="text-red-400 hover:text-red-300 p-1"><Icons.Trash /></button>
          </div>
        </div>

        {/* Set count selector */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400">Sets:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => updateSetCount(i, n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${ex.sets.length === n ? 'bg-rose-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Editable set values */}
        <div className="mb-2 space-y-1">
          {ex.sets.map((set, setIdx) => (
            <div key={setIdx} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-6">{setIdx + 1}</span>
              {fields.map(field => (
                field === 'bandColor' ? (
                  <select key={field} value={set[field] || 'red'}
                    onChange={e => updateSetValue(i, setIdx, field, e.target.value)}
                    className="bg-gray-700 text-white text-sm px-2 py-1.5 rounded flex-1">
                    {Object.entries(BAND_COLORS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                ) : (
                  <div key={field} className="flex-1 flex items-center gap-1">
                    <input type="number" value={set[field] || ''}
                      onChange={e => updateSetValue(i, setIdx, field, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-gray-700 text-white text-sm px-2 py-1.5 rounded text-center"
                    />
                    <span className="text-xs text-gray-500">{getFieldLabel(field)}</span>
                  </div>
                )
              ))}
            </div>
          ))}
        </div>

        {/* Rest time selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Rest:</span>
          <div className="flex gap-1 flex-wrap">
            {restTimePresets.map(t => (
              <button key={t} onClick={() => updateRestTime(i, t)}
                className={`px-2 py-1 rounded text-xs font-medium ${(ex.restTime || 90) === t ? 'bg-rose-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                {formatDuration(t)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const groups = getGroupedExercises();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">New Template</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Template name"
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 mb-4" />

          <div className="text-sm text-gray-400 mb-2">Exercises ({templateExercises.length})</div>

          {groups.map((group, gIdx) => {
            if (group.type === 'superset') {
              return (
                <div key={group.supersetId} className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icons.Link />
                    <span className="text-xs font-medium text-teal-400 uppercase">Superset</span>
                  </div>
                  <div className="rounded-xl overflow-hidden">
                    {group.exercises.map(({ exercise, index }) => renderExerciseItem(exercise, index, true))}
                  </div>
                </div>
              );
            }
            return renderExerciseItem(group.exercise, group.index, false);
          })}

          <button onClick={() => setShowExercisePicker(true)}
            className="w-full bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl p-4 text-gray-400 hover:border-rose-700 hover:text-rose-400 flex items-center justify-center gap-2 text-sm">
            <Icons.Plus /> Add Exercise
          </button>
        </div>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleSave} disabled={!name.trim() || templateExercises.length === 0}
            className="w-full bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed">
            Create Template
          </button>
        </div>
      </div>

      {showExercisePicker && (
        <ExerciseSearchModal
          exercises={allExercises}
          onSelect={addSingleExercise}
          onSelectMultiple={addExercises}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
  );
};

// Templates Screen with Folders

export { ExercisesScreen, CreateTemplateModal, ImportModal };
