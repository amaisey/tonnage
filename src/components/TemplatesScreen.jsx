import { useState, Fragment } from 'react';
import { Icons } from './Icons';
import { BODY_PARTS, CATEGORIES, BAND_COLORS, EXERCISE_TYPES } from '../data/constants';
import { formatDuration, getDefaultSetForCategory } from '../utils/helpers';
import { ExerciseSearchModal, CreateFolderModal } from './SharedComponents';
import { CreateTemplateModal, ImportModal } from './ExercisesScreen';

// Edit Template Modal (simplified)
const EditTemplateModal = ({ template, onSave, onDelete, onClose, allExercises }) => {
  const [name, setName] = useState(template.name);
  const [notes, setNotes] = useState(template.notes || '');
  const [estimatedTime, setEstimatedTime] = useState(template.estimatedTime || '');
  const [exercises, setExercises] = useState(JSON.parse(JSON.stringify(template.exercises)));
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedForSuperset, setSelectedForSuperset] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  // Group exercises by superset
  const getGroupedExercises = () => {
    const groups = [];
    const used = new Set();
    exercises.forEach((ex, idx) => {
      if (used.has(idx)) return;
      if (ex.supersetId) {
        const supersetExercises = exercises
          .map((e, i) => ({ exercise: e, index: i }))
          .filter(({ exercise }) => exercise.supersetId === ex.supersetId);
        supersetExercises.forEach(({ index }) => used.add(index));
        groups.push({ type: 'superset', supersetId: ex.supersetId, exercises: supersetExercises });
      } else {
        groups.push({ type: 'single', exercise: ex, index: idx });
        used.add(idx);
      }
    });
    return groups;
  };

  const addExercises = (newExercises, asSuperset) => {
    if (asSuperset && newExercises.length >= 2) {
      const supersetId = `superset-${Date.now()}`;
      const toAdd = newExercises.map(ex => ({
        ...ex,
        supersetId,
        restTime: ex.restTime || 90,
        sets: ex.sets || [getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category)]
      }));
      setExercises([...exercises, ...toAdd]);
    } else {
      const toAdd = newExercises.map(ex => ({
        ...ex,
        restTime: ex.restTime || 90,
        sets: ex.sets || [getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category)]
      }));
      setExercises([...exercises, ...toAdd]);
    }
    setShowExercisePicker(false);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
    setSelectedForSuperset(selectedForSuperset.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const unlinkSuperset = (index) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], supersetId: undefined };
    setExercises(updated);
  };

  const toggleSelectForSuperset = (index) => {
    if (selectedForSuperset.includes(index)) {
      setSelectedForSuperset(selectedForSuperset.filter(i => i !== index));
    } else {
      setSelectedForSuperset([...selectedForSuperset, index]);
    }
  };

  const createSuperset = () => {
    if (selectedForSuperset.length >= 2) {
      const supersetId = `superset-${Date.now()}`;
      const updated = exercises.map((ex, i) =>
        selectedForSuperset.includes(i) ? { ...ex, supersetId } : ex
      );
      setExercises(updated);
      setSelectedForSuperset([]);
      setSelectMode(false);
    }
  };

  const groups = getGroupedExercises();

  const renderExerciseCard = (exercise, index, isSuperset = false, isFirst = true, isLast = true) => {
    const typeInfo = exercise.exerciseType ? EXERCISE_TYPES[exercise.exerciseType] : null;
    const isSelected = selectedForSuperset.includes(index);

    return (
      <div
        key={index}
        onClick={() => selectMode && toggleSelectForSuperset(index)}
        className={`${exercise.highlight ? 'ring-2 ring-rose-500' : ''} ${isSelected ? 'ring-2 ring-teal-500' : ''} bg-white/10 backdrop-blur-sm p-4 ${isSuperset ? (isFirst ? 'rounded-t-2xl' : isLast ? 'rounded-b-2xl' : '') : 'rounded-2xl mb-3'} ${selectMode ? 'cursor-pointer' : ''} border border-white/20`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isSuperset && <div className="w-1 h-8 bg-teal-500 rounded-full" />}
            {selectMode && (
              <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-600'} flex items-center justify-center`}>
                {isSelected && <Icons.Check />}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{exercise.name}</span>
                {typeInfo && (
                  <span className={`${typeInfo.color} text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                )}
                {exercise.highlight && <span className="text-rose-400">⭐</span>}
              </div>
              <div className="text-xs text-gray-400">
                {exercise.bodyPart} • {exercise.sets?.length || 3} sets • Rest {formatDuration(exercise.restTime || 90)}
              </div>
            </div>
          </div>
          {!selectMode && (
            <div className="flex items-center gap-1">
              {isSuperset && (
                <button onClick={() => unlinkSuperset(index)} className="text-teal-400 hover:text-teal-300 p-2" title="Unlink">
                  <Icons.Link />
                </button>
              )}
              <button onClick={() => removeExercise(index)} className="text-red-400 hover:text-red-300 p-2"><Icons.Trash /></button>
            </div>
          )}
        </div>

        {exercise.notes && (
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-2 mt-2">
            <div className="text-xs text-amber-400 flex items-center gap-1">
              <span>📝</span> {exercise.notes}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Fixed Header */}
      <div className="shrink-0 px-4 pb-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        <h3 className="text-lg font-semibold text-white">Edit Template</h3>
        <button onClick={() => { onSave({ ...template, name, notes, estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined, exercises }); onClose(); }} className="text-rose-400 hover:text-rose-300 font-medium">
          Save
        </button>
      </div>

      {/* Select mode bar */}
      {selectMode && (
        <div className="shrink-0 p-3 bg-teal-900/50 border-b border-teal-700 flex items-center justify-between">
          <span className="text-teal-300 text-sm">{selectedForSuperset.length} selected</span>
          <div className="flex gap-2">
            <button onClick={() => { setSelectMode(false); setSelectedForSuperset([]); }} className="text-gray-400 text-sm">Cancel</button>
            <button onClick={createSuperset} disabled={selectedForSuperset.length < 2}
              className="bg-teal-600 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50">
              Link as Superset
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Template name"
          className="w-full bg-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 mb-3 border border-white/20" />

        <div className="flex gap-2 mb-3">
          <input type="number" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} placeholder="Est. minutes"
            className="flex-1 bg-white/10 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm border border-white/20" />
          <button onClick={() => setSelectMode(!selectMode)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${selectMode ? 'bg-teal-600 text-white' : 'bg-white/10 text-teal-400 border border-white/20'}`}>
            <Icons.Link /> Superset
          </button>
        </div>

        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Workout notes (optional)"
          className="w-full bg-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 mb-4 text-sm resize-none h-20 border border-white/20" />

        <div className="text-sm text-gray-400 mb-3">{exercises.length} exercises</div>

        {groups.map((group, gIdx) => {
          if (group.type === 'superset') {
            return (
              <div key={group.supersetId} className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Link />
                  <span className="text-xs font-medium text-teal-400 uppercase tracking-wide">Superset</span>
                </div>
                <div className="border-l-4 border-teal-500 rounded-2xl overflow-hidden">
                  {group.exercises.map(({ exercise, index }, i) =>
                    renderExerciseCard(exercise, index, true, i === 0, i === group.exercises.length - 1)
                  )}
                </div>
              </div>
            );
          }
          return renderExerciseCard(group.exercise, group.index, false);
        })}

        <button onClick={() => setShowExercisePicker(true)}
          className="w-full bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-6 text-gray-400 hover:border-rose-700 hover:text-rose-400 flex items-center justify-center gap-2 mt-2">
          <Icons.Plus /> Add Exercise
        </button>
      </div>

      {/* Fixed Footer */}
      <div className="shrink-0 p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <button onClick={() => { onDelete(template.id); onClose(); }} className="w-full bg-white/10 text-red-400 py-3 rounded-xl font-medium hover:bg-white/20 border border-white/20">
          Delete Template
        </button>
      </div>

      {showExercisePicker && (
        <ExerciseSearchModal
          exercises={allExercises}
          onSelect={(ex) => addExercises([ex], false)}
          onSelectMultiple={addExercises}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
  );
};

const TemplatesScreen = ({ templates, folders, onStartTemplate, onImport, onBulkImport, onUpdateTemplate, onDeleteTemplate, onAddFolder, onBulkAddFolders, onDeleteFolder, onAddExercises, exercises, onScroll, navVisible = true }) => {
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [showImport, setShowImport] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState(null); // { folder, subfolderIds, templateCount, folderCount }

  // Helper to get all nested subfolder IDs
  const getAllSubfolderIds = (parentId) => {
    const ids = [];
    const recurse = (pid) => {
      folders.filter(f => f.parentId === pid).forEach(f => {
        ids.push(f.id);
        recurse(f.id);
      });
    };
    recurse(parentId);
    return ids;
  };

  // Execute folder deletion
  const executeDeleteFolder = (folder, subfolderIds) => {
    // Delete all templates in this folder and subfolders
    [...subfolderIds, folder.id].forEach(fid => {
      templates.filter(t => t.folderId === fid).forEach(t => onDeleteTemplate(t.id));
    });
    // Delete all subfolders then this folder
    subfolderIds.forEach(fid => onDeleteFolder(fid));
    onDeleteFolder(folder.id);
    setDeleteFolderConfirm(null);
  };

  const currentFolder = folders.find(f => f.id === currentFolderId);
  const childFolders = folders.filter(f => f.parentId === currentFolderId);
  const folderTemplates = templates.filter(t => (t.folderId || 'root') === currentFolderId);

  const getBreadcrumbs = () => {
    const crumbs = [];
    let folder = currentFolder;
    while (folder) {
      crumbs.unshift(folder);
      folder = folders.find(f => f.id === folder.parentId);
    }
    return crumbs;
  };

  return (
    <div className="relative flex flex-col h-full bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/backgrounds/bg-4.jpg" alt="" className="w-full h-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
      </div>
      <div className="relative z-10 flex flex-col h-full">
      <div className="px-4 pb-4 border-b border-white/10 bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">Templates</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowCreateFolder(true)} className="p-2 text-teal-400 hover:text-teal-300 rounded-lg bg-white/10 border border-white/20" title="New Folder">
              <Icons.Folder />
            </button>
            <button onClick={() => setShowImport(true)} className="p-2 text-cyan-400 hover:text-cyan-300 rounded-lg bg-white/10 border border-white/20" title="Import JSON">
              <Icons.Import />
            </button>
            <button onClick={() => setShowCreateTemplate(true)} className="bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-800 flex items-center gap-1">
              <Icons.Plus /> New
            </button>
          </div>
        </div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-sm overflow-x-auto">
          {getBreadcrumbs().map((crumb, i) => (
            <Fragment key={crumb.id}>
              {i > 0 && <Icons.ChevronRight />}
              <button onClick={() => setCurrentFolderId(crumb.id)}
                className={`px-2 py-1 rounded ${currentFolderId === crumb.id ? 'text-teal-400' : 'text-gray-400 hover:text-white'}`}>
                {crumb.name === 'Root' ? 'All Templates' : crumb.name}
              </button>
            </Fragment>
          ))}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 ${navVisible ? 'pb-24' : 'pb-4'}`} onScroll={e => onScroll && onScroll(e.target.scrollTop)}>
        {/* Subfolders */}
        {childFolders.map(folder => {
          const allSubfolderIds = getAllSubfolderIds(folder.id);
          const totalTemplateCount = templates.filter(t => t.folderId === folder.id || allSubfolderIds.includes(t.folderId)).length;
          const isEmpty = totalTemplateCount === 0 && allSubfolderIds.length === 0;

          return (
            <div key={folder.id} className="w-full flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl mb-2 hover:bg-white/15 group border border-white/20 hover:border-teal-500/50">
              <button onClick={() => setCurrentFolderId(folder.id)} className="flex-1 flex items-center gap-3 text-left">
                <span className="text-teal-400"><Icons.Folder /></span>
                <div>
                  <span className="font-medium text-white">{folder.name}</span>
                  <div className="text-xs text-gray-400">
                    {allSubfolderIds.length > 0 ? `${allSubfolderIds.length} folder${allSubfolderIds.length !== 1 ? 's' : ''}, ` : ''}{totalTemplateCount} template{totalTemplateCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isEmpty) {
                    // Delete immediately if empty
                    onDeleteFolder(folder.id);
                  } else {
                    // Show confirmation modal
                    setDeleteFolderConfirm({
                      folder,
                      subfolderIds: allSubfolderIds,
                      templateCount: totalTemplateCount,
                      folderCount: allSubfolderIds.length
                    });
                  }
                }}
                className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icons.Trash />
              </button>
              <button onClick={() => setCurrentFolderId(folder.id)} className="text-teal-400">
                <Icons.ChevronRight />
              </button>
            </div>
          );
        })}

        {/* Templates in current folder */}
        {folderTemplates.map(template => (
          <div key={template.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3 border border-white/20 hover:border-cyan-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className="text-cyan-400">{template.exercises.length} exercises</span>
                  {template.estimatedTime && (
                    <span className="flex items-center gap-1 text-teal-400">
                      <Icons.TimerSmall /> ~{template.estimatedTime} min
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingTemplate(template)} className="p-2 text-cyan-400 hover:text-cyan-300 rounded-lg bg-white/10 border border-white/20">
                  <Icons.Edit />
                </button>
                <button onClick={() => onStartTemplate(template)} className="bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-800">Start</button>
              </div>
            </div>
            {template.notes && (
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-2 mb-3">
                <div className="text-xs text-teal-300 flex items-center gap-1">
                  <span>📋</span> {template.notes}
                </div>
              </div>
            )}
            <div className="space-y-1">
              {template.exercises.slice(0, 4).map((ex, i) => (
                <div key={i} className="text-sm text-gray-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${ex.supersetId ? 'bg-teal-500' : 'bg-cyan-500'}`}></span>
                  {ex.name} - {ex.sets.length} sets
                </div>
              ))}
              {template.exercises.length > 4 && <div className="text-xs text-gray-500">+{template.exercises.length - 4} more exercises</div>}
            </div>
          </div>
        ))}

        {childFolders.length === 0 && folderTemplates.length === 0 && (
          <div className="text-center text-gray-400 py-8">No templates in this folder</div>
        )}
      </div>

      {showImport && (
        <ImportModal
          folders={folders}
          currentFolderId={currentFolderId}
          onAddFolder={onAddFolder}
          onBulkAddFolders={onBulkAddFolders}
          onImport={onImport}
          onBulkImport={onBulkImport}
          onUpdateTemplate={onUpdateTemplate}
          onAddExercises={onAddExercises}
          existingExercises={exercises}
          existingTemplates={templates}
          onClose={() => setShowImport(false)}
        />
      )}

      {showCreateFolder && <CreateFolderModal parentId={currentFolderId} onSave={onAddFolder} onClose={() => setShowCreateFolder(false)} />}

      {showCreateTemplate && (
        <CreateTemplateModal folderId={currentFolderId} allExercises={exercises}
          onSave={t => { onImport(t); setShowCreateTemplate(false); }}
          onClose={() => setShowCreateTemplate(false)} />
      )}

      {editingTemplate && (
        <EditTemplateModal template={editingTemplate} onSave={onUpdateTemplate} onDelete={onDeleteTemplate}
          onClose={() => setEditingTemplate(null)} allExercises={exercises} />
      )}

      {deleteFolderConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Folder?</h3>
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">
                This will permanently delete <span className="font-semibold">"{deleteFolderConfirm.folder.name}"</span> and all its contents:
              </p>
              <ul className="mt-2 text-sm text-red-300 space-y-1">
                {deleteFolderConfirm.folderCount > 0 && (
                  <li>• {deleteFolderConfirm.folderCount} subfolder{deleteFolderConfirm.folderCount !== 1 ? 's' : ''}</li>
                )}
                {deleteFolderConfirm.templateCount > 0 && (
                  <li>• {deleteFolderConfirm.templateCount} template{deleteFolderConfirm.templateCount !== 1 ? 's' : ''}</li>
                )}
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteFolderConfirm(null)}
                className="flex-1 bg-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/20 border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={() => executeDeleteFolder(deleteFolderConfirm.folder, deleteFolderConfirm.subfolderIds)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};


export { TemplatesScreen };
