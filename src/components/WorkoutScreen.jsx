import { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { CATEGORIES, EXERCISE_TYPES, BAND_COLORS, EXERCISE_PHASES } from '../data/constants';
import { formatDuration, getDefaultSetForCategory } from '../utils/helpers';
import { NumberPad, DurationPad, SetInputRow, ExerciseSearchModal, RestTimerBanner } from './SharedComponents';

const WorkoutScreen = ({ activeWorkout, setActiveWorkout, onFinish, onCancel, exercises, history, onNumpadStateChange, onScroll }) => {
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [restTimer, setRestTimer] = useState({ active: false, time: 0, totalTime: 0, exerciseName: '' });
  const [editingRestTime, setEditingRestTime] = useState(null); // exercise index
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [numpadState, setNumpadState] = useState(null); // { exIndex, setIndex, field, fieldIndex }
  const [exerciseDetail, setExerciseDetail] = useState(null); // exercise to show detail modal for
  const [bandPickerState, setBandPickerState] = useState(null); // { exIndex, setIndex, currentColor }
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null); // exercise index pending deletion
  const [collapsedPhases, setCollapsedPhases] = useState({}); // which phases are collapsed
  const [addToPhase, setAddToPhase] = useState(null); // Bug #12: target phase for adding exercises
  // Bug #11: Drag to reorder state
  const [dragState, setDragState] = useState(null); // { exIndex, phase, touchY }
  const dragRefs = useRef({}); // refs for each exercise row
  const intervalRef = useRef(null);
  const restTimeRef = useRef(null);
  const wakeLockRef = useRef(null);

  const togglePhase = (phase) => {
    setCollapsedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  // Notify parent when numpad state changes
  useEffect(() => {
    onNumpadStateChange?.(numpadState !== null);
  }, [numpadState, onNumpadStateChange]);

  // Auto-scroll to rest time options when editing
  useEffect(() => {
    if (editingRestTime !== null && restTimeRef.current) {
      restTimeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editingRestTime]);

  // Bug #6: Keep screen awake during active workout using Wake Lock API
  useEffect(() => {
    const requestWakeLock = async () => {
      if (activeWorkout && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock activated');

          // Re-acquire wake lock if released (e.g., when tab becomes visible again)
          wakeLockRef.current.addEventListener('release', () => {
            console.log('Wake Lock released');
          });
        } catch (err) {
          console.log('Wake Lock error:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock manually released');
      }
    };

    if (activeWorkout) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Re-acquire wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeWorkout) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeWorkout]);

  // Get previous workout data for a specific exercise (returns full exercise with sets, restTime, notes, etc.)
  const getPreviousExerciseData = (exerciseName) => {
    if (!history || history.length === 0) return null;
    for (const workout of history) {
      const prevExercise = workout.exercises.find(ex => ex.name === exerciseName);
      if (prevExercise && prevExercise.sets.some(s => s.completed)) {
        return {
          sets: prevExercise.sets.filter(s => s.completed),
          restTime: prevExercise.restTime,
          notes: prevExercise.notes,
          phase: prevExercise.phase
        };
      }
    }
    return null;
  };

  useEffect(() => {
    if (restTimer.active && restTimer.time > 0) {
      intervalRef.current = setInterval(() => setRestTimer(prev => ({ ...prev, time: prev.time - 1 })), 1000);
    } else if (restTimer.time === 0 && restTimer.active) {
      // Vibrate instead of audio to avoid pausing music (Bug #3 fix)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300]); // Pattern: short-pause-short-pause-long
      }
      setRestTimer(prev => ({ ...prev, active: false }));
    }
    return () => clearInterval(intervalRef.current);
  }, [restTimer.active, restTimer.time]);

  const startRestTimer = (exerciseName, restTime) => {
    const time = restTime || 90;
    setRestTimer({ active: true, time, totalTime: time, exerciseName });
  };

  // Add exercises (individually or as superset) - pre-fill with previous workout data
  // Bug #12: Now supports adding to specific phases via addToPhase state
  const addExercises = (selectedExercises, asSuperset) => {
    const updated = { ...activeWorkout };
    const targetPhase = addToPhase || 'workout'; // Default to 'workout' phase

    if (asSuperset && selectedExercises.length >= 2) {
      const supersetId = `superset-${Date.now()}`;
      selectedExercises.forEach(ex => {
        const prevData = getPreviousExerciseData(ex.name);
        const sets = prevData?.sets?.length > 0
          ? prevData.sets.map(s => ({ ...s, completed: false, completedAt: undefined }))
          : [getDefaultSetForCategory(ex.category)];
        updated.exercises.push({
          ...ex,
          supersetId,
          phase: targetPhase, // Bug #12: Assign to target phase
          restTime: prevData?.restTime || 90,
          notes: prevData?.notes || '',
          sets,
          previousSets: prevData?.sets
        });
      });
    } else {
      selectedExercises.forEach(ex => {
        const prevData = getPreviousExerciseData(ex.name);
        const sets = prevData?.sets?.length > 0
          ? prevData.sets.map(s => ({ ...s, completed: false, completedAt: undefined }))
          : [getDefaultSetForCategory(ex.category)];
        updated.exercises.push({
          ...ex,
          phase: targetPhase, // Bug #12: Assign to target phase
          restTime: prevData?.restTime || 90,
          notes: prevData?.notes || '',
          sets,
          previousSets: prevData?.sets
        });
      });
    }
    setActiveWorkout(updated);
    setShowExerciseModal(false);
    setAddToPhase(null); // Reset target phase
  };

  const addSingleExercise = (exercise) => {
    addExercises([exercise], false);
  };

  const updateSet = (exIndex, setIndex, field, value, propagate = true) => {
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    const currentValue = exercise.sets[setIndex][field];

    // Update the current set
    exercise.sets[setIndex][field] = value;
    exercise.sets[setIndex].manuallyEdited = true;

    // Propagate to subsequent sets if enabled
    if (propagate && value && (field === 'weight' || field === 'reps' || field === 'duration' || field === 'distance' || field === 'assistedWeight')) {
      for (let i = setIndex + 1; i < exercise.sets.length; i++) {
        const set = exercise.sets[i];
        // Only propagate if: not completed, not manually edited, and value is empty or same as previous
        if (!set.completed && !set.manuallyEdited) {
          const setCurrentValue = set[field];
          // Propagate if empty or matches what we just changed from
          if (!setCurrentValue || setCurrentValue === '' || setCurrentValue === currentValue) {
            set[field] = value;
            set.proposed = true; // Mark as proposed/auto-filled
          }
        }
      }
    }

    setActiveWorkout(updated);
  };

  // Numpad handlers
  const openNumpad = (exIndex, setIndex, field, fieldIndex) => {
    const exercise = activeWorkout.exercises[exIndex];
    setNumpadState({ exIndex, setIndex, field, fieldIndex, category: exercise.category });
  };

  const closeNumpad = () => setNumpadState(null);

  const handleNumpadChange = (value) => {
    if (!numpadState) return;
    updateSet(numpadState.exIndex, numpadState.setIndex, numpadState.field, value);
  };

  const handleNumpadNext = () => {
    if (!numpadState) return;
    const exercise = activeWorkout.exercises[numpadState.exIndex];
    const fields = CATEGORIES[exercise.category]?.fields || ['weight', 'reps'];
    const nextFieldIndex = numpadState.fieldIndex + 1;

    if (nextFieldIndex < fields.length) {
      // Move to next field in same set
      setNumpadState({ ...numpadState, field: fields[nextFieldIndex], fieldIndex: nextFieldIndex });
    } else if (numpadState.setIndex + 1 < exercise.sets.length) {
      // Move to first field of next set
      setNumpadState({ ...numpadState, setIndex: numpadState.setIndex + 1, field: fields[0], fieldIndex: 0 });
    } else {
      // Done with all sets
      closeNumpad();
    }
  };

  const handleRPEChange = (rpe) => {
    if (!numpadState) return;
    const updated = { ...activeWorkout };
    updated.exercises[numpadState.exIndex].sets[numpadState.setIndex].rpe = rpe;
    setActiveWorkout(updated);
  };

  const updateExerciseRestTime = (exIndex, restTime) => {
    const updated = { ...activeWorkout };
    updated.exercises[exIndex].restTime = restTime;
    setActiveWorkout(updated);
    setEditingRestTime(null);
  };

  // Bug #10: Smart multi-set completion - detects rapid completions and distributes time evenly
  const RAPID_COMPLETION_THRESHOLD = 4000; // 4 seconds

  const toggleSetComplete = (exIndex, setIndex) => {
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    const set = exercise.sets[setIndex];
    set.completed = !set.completed;

    if (set.completed) {
      const now = Date.now();
      set.completedAt = now;

      // Bug #10: Check for rapid completions and redistribute time
      // Find all sets completed in the last RAPID_COMPLETION_THRESHOLD ms
      const recentCompletions = [];
      let anchorTime = null; // The completion time before the rapid batch

      updated.exercises.forEach((ex, eIdx) => {
        ex.sets?.forEach((s, sIdx) => {
          if (s.completed && s.completedAt) {
            const timeDiff = now - s.completedAt;
            if (timeDiff <= RAPID_COMPLETION_THRESHOLD && timeDiff > 0) {
              // This set was completed recently (within threshold)
              recentCompletions.push({ exIndex: eIdx, setIndex: sIdx, completedAt: s.completedAt });
            } else if (timeDiff > RAPID_COMPLETION_THRESHOLD) {
              // This is a potential anchor (completed before the rapid batch)
              if (!anchorTime || s.completedAt > anchorTime) {
                anchorTime = s.completedAt;
              }
            }
          }
        });
      });

      // If we have multiple rapid completions, redistribute the time
      if (recentCompletions.length >= 1 && anchorTime) {
        const totalTime = now - anchorTime;
        const numSets = recentCompletions.length + 1; // +1 for current set
        const timePerSet = Math.round(totalTime / numSets);

        // Redistribute timestamps evenly
        recentCompletions.sort((a, b) => a.completedAt - b.completedAt);
        recentCompletions.forEach((comp, idx) => {
          const newTime = anchorTime + (timePerSet * (idx + 1));
          updated.exercises[comp.exIndex].sets[comp.setIndex].completedAt = newTime;
        });
        // Set current completion to the final slot
        set.completedAt = anchorTime + (timePerSet * numSets);
      }

      startRestTimer(exercise.name, exercise.restTime || 90);
    }
    setActiveWorkout(updated);
  };

  const addSet = (exIndex) => {
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    const lastSet = exercise.sets.slice(-1)[0];
    const newSet = getDefaultSetForCategory(exercise.category);
    Object.keys(newSet).forEach(key => {
      if (lastSet[key] !== undefined && key !== 'completed' && key !== 'completedAt') newSet[key] = lastSet[key];
    });
    exercise.sets.push(newSet);
    setActiveWorkout(updated);
  };

  const removeSet = (exIndex, setIndex) => {
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    if (exercise.sets.length > 1) {
      exercise.sets.splice(setIndex, 1);
      setActiveWorkout(updated);
    }
  };

  // Bug #11: Drag to reorder exercises
  const startDrag = (exIndex) => {
    const exercise = activeWorkout.exercises[exIndex];
    setDragState({
      exIndex,
      phase: exercise.phase || 'workout',
      originalIndex: exIndex
    });
  };

  const cancelDrag = () => {
    setDragState(null);
  };

  const dropExercise = (targetIndex, targetPhase) => {
    if (!dragState) return;

    const updated = { ...activeWorkout };
    const [movedExercise] = updated.exercises.splice(dragState.exIndex, 1);

    // Update the phase if dropping to a different phase
    movedExercise.phase = targetPhase;

    // Adjust target index if we removed from before the target
    const adjustedTarget = dragState.exIndex < targetIndex ? targetIndex - 1 : targetIndex;
    updated.exercises.splice(adjustedTarget, 0, movedExercise);

    setActiveWorkout(updated);
    setDragState(null);
  };

  const moveExercise = (fromIndex, toIndex, newPhase) => {
    if (fromIndex === toIndex) return;

    const updated = { ...activeWorkout };
    const [movedExercise] = updated.exercises.splice(fromIndex, 1);
    movedExercise.phase = newPhase || movedExercise.phase;
    updated.exercises.splice(toIndex, 0, movedExercise);
    setActiveWorkout(updated);
  };

  const openBandPicker = (exIndex, setIndex, currentColor) => {
    setBandPickerState({ exIndex, setIndex, currentColor });
  };

  const selectBandColor = (color) => {
    if (bandPickerState) {
      updateSet(bandPickerState.exIndex, bandPickerState.setIndex, 'bandColor', color);
      setBandPickerState(null);
    }
  };

  const removeExercise = (index) => {
    const updated = { ...activeWorkout };
    updated.exercises.splice(index, 1);
    setActiveWorkout(updated);
    setDeleteConfirmIndex(null);
  };

  const unlinkSuperset = (exIndex) => {
    const updated = { ...activeWorkout };
    delete updated.exercises[exIndex].supersetId;
    setActiveWorkout(updated);
  };

  // Link exercise with the next one as a superset
  const linkWithNext = (exIndex) => {
    if (exIndex >= activeWorkout.exercises.length - 1) return; // No next exercise
    const updated = { ...activeWorkout };
    const currentEx = updated.exercises[exIndex];
    const nextEx = updated.exercises[exIndex + 1];

    // Create new superset ID or use existing one
    const supersetId = currentEx.supersetId || nextEx.supersetId || `superset-${Date.now()}`;
    currentEx.supersetId = supersetId;
    nextEx.supersetId = supersetId;

    setActiveWorkout(updated);
  };

  // Group exercises by phase, then by superset within each phase
  const getGroupedExercisesByPhase = () => {
    const phases = { warmup: [], workout: [], cooldown: [] };
    const used = new Set();

    // First pass: assign exercises to phases
    activeWorkout.exercises.forEach((ex, idx) => {
      const phase = ex.phase || 'workout';
      phases[phase].push({ exercise: ex, index: idx });
    });

    // Second pass: group by superset within each phase
    const result = {};
    Object.entries(phases).forEach(([phase, exerciseList]) => {
      const groups = [];
      const phaseUsed = new Set();

      exerciseList.forEach(({ exercise, index }) => {
        if (phaseUsed.has(index)) return;

        if (exercise.supersetId) {
          const supersetExercises = [];
          exerciseList.forEach(({ exercise: e, index: i }) => {
            if (e.supersetId === exercise.supersetId) {
              supersetExercises.push({ exercise: e, index: i });
              phaseUsed.add(i);
            }
          });
          groups.push({ type: 'superset', exercises: supersetExercises, supersetId: exercise.supersetId });
        } else {
          groups.push({ type: 'single', exercise, index });
          phaseUsed.add(index);
        }
      });

      result[phase] = groups;
    });

    return result;
  };

  // Check if any exercises have phases assigned
  const hasPhases = () => {
    return activeWorkout?.exercises?.some(ex => ex.phase && ex.phase !== 'workout');
  };

  // Calculate the most recent completed set timestamp across ALL exercises
  const getLastGlobalCompletion = () => {
    if (!activeWorkout?.exercises) return null;
    let lastCompletion = null;
    activeWorkout.exercises.forEach(ex => {
      ex.sets?.forEach(set => {
        if (set.completed && set.completedAt) {
          if (!lastCompletion || set.completedAt > lastCompletion) {
            lastCompletion = set.completedAt;
          }
        }
      });
    });
    return lastCompletion;
  };

  // Get the completion timestamp that was "current" when a specific set was completed
  // (i.e., the most recent completion BEFORE this set was completed)
  const getCompletionBeforeSet = (targetExIndex, targetSetIndex) => {
    if (!activeWorkout?.exercises) return null;
    const targetSet = activeWorkout.exercises[targetExIndex]?.sets?.[targetSetIndex];
    if (!targetSet?.completedAt) return getLastGlobalCompletion(); // For incomplete sets, use current last

    let lastBefore = null;
    activeWorkout.exercises.forEach((ex, exIdx) => {
      ex.sets?.forEach((set, setIdx) => {
        if (set.completed && set.completedAt && set.completedAt < targetSet.completedAt) {
          if (!lastBefore || set.completedAt > lastBefore) {
            lastBefore = set.completedAt;
          }
        }
      });
    });
    return lastBefore;
  };

  // Check if this is the first set in the entire workout (no sets before it)
  const isFirstSetInWorkout = (exIndex, setIndex) => {
    // Check all sets before this one
    for (let e = 0; e < activeWorkout.exercises.length; e++) {
      const maxSet = e === exIndex ? setIndex : activeWorkout.exercises[e].sets.length;
      for (let s = 0; s < maxSet; s++) {
        if (e < exIndex || (e === exIndex && s < setIndex)) {
          return false; // There's at least one set before this one
        }
      }
    }
    return setIndex === 0 && exIndex === 0;
  };

  // Bug #15: Calculate pace tracking
  const getPaceInfo = () => {
    if (!activeWorkout?.estimatedTime || !activeWorkout?.exercises?.length) return null;

    const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
    const completedSets = activeWorkout.exercises.reduce((sum, ex) =>
      sum + (ex.sets?.filter(s => s.completed)?.length || 0), 0);

    if (totalSets === 0) return null;

    const elapsedMinutes = (Date.now() - activeWorkout.startTime) / 60000;
    const estimatedMinutes = activeWorkout.estimatedTime;

    // Calculate expected progress (what percentage should be done by now)
    const expectedProgress = Math.min(1, elapsedMinutes / estimatedMinutes);
    // Calculate actual progress
    const actualProgress = completedSets / totalSets;

    // Calculate pace difference in minutes
    // Negative = ahead of schedule, Positive = behind schedule
    const expectedSetsCompleted = expectedProgress * totalSets;
    const setsAheadBehind = completedSets - expectedSetsCompleted;
    const minutesPerSet = estimatedMinutes / totalSets;
    const paceDiffMinutes = -setsAheadBehind * minutesPerSet;

    // Color coding: green (within 3 min), yellow (3-10 min behind), red (>10 min behind)
    let color = 'text-green-400';
    let emoji = '🟢';
    if (paceDiffMinutes > 10) {
      color = 'text-red-400';
      emoji = '🔴';
    } else if (paceDiffMinutes > 3) {
      color = 'text-yellow-400';
      emoji = '🟡';
    } else if (paceDiffMinutes < -3) {
      color = 'text-green-300';
      emoji = '🟢';
    }

    return {
      completedSets,
      totalSets,
      elapsedMinutes: Math.round(elapsedMinutes),
      estimatedMinutes,
      paceDiffMinutes: Math.round(paceDiffMinutes),
      color,
      emoji,
      isAhead: paceDiffMinutes < 0
    };
  };

  if (!activeWorkout) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black" style={{ touchAction: 'none' }}>
        {/* Background Image - fixed position */}
        <div className="fixed inset-0 z-0 bg-black">
          <img src="/backgrounds/bg-5.jpg" alt="" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>
        </div>
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center p-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-6xl mb-4 text-center">🏋️</div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Ready to Train?</h2>
            <p className="text-white/70 text-center mb-6 text-sm">Start a new workout or select a template</p>
            <button onClick={() => setActiveWorkout({ name: 'New Workout', exercises: [], startTime: Date.now() })}
              className="w-full bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 flex items-center justify-center gap-2 border border-white/30 transition-all">
              <Icons.Plus /> Start Empty Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const restTimePresets = [30, 45, 60, 90, 120, 180, 300];

  const renderExerciseCard = (exercise, exIndex, isSuperset = false, isFirst = true, isLast = true) => {
    const exerciseRestTime = exercise.restTime || 90;
    const typeInfo = exercise.exerciseType ? EXERCISE_TYPES[exercise.exerciseType] : null;
    const phaseInfo = exercise.phase && exercise.phase !== 'workout' ? EXERCISE_PHASES[exercise.phase] : null;

    // Determine active field for highlighting
    const activeField = numpadState && numpadState.exIndex === exIndex
      ? { setIndex: numpadState.setIndex, field: numpadState.field }
      : null;

    // Bug #11: If in drag mode, show compact view
    if (dragState && dragState.exIndex !== exIndex) {
      return (
        <div
          key={exIndex}
          className={`bg-white/5 border border-white/10 rounded-xl p-3 mb-2 cursor-pointer hover:bg-white/10 transition-colors ${dragState.exIndex === exIndex ? 'opacity-50' : ''}`}
          onClick={() => dropExercise(exIndex, exercise.phase || 'workout')}
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">↓ Drop here</span>
            <span className="text-white font-medium">{exercise.name}</span>
            <span className="text-gray-500 text-xs">({exercise.sets?.length || 0} sets)</span>
          </div>
        </div>
      );
    }

    return (
      <div key={exIndex} className={`${exercise.highlight ? 'ring-2 ring-rose-500' : ''} ${dragState?.exIndex === exIndex ? 'ring-2 ring-cyan-400 opacity-75' : ''} bg-white/10 backdrop-blur-md border border-white/20 p-4 ${isSuperset ? (isFirst ? 'rounded-t-2xl' : isLast ? 'rounded-b-2xl' : '') : 'rounded-2xl mb-4'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Bug #11: Drag handle */}
            {!isSuperset && (
              <button
                onClick={() => dragState ? cancelDrag() : startDrag(exIndex)}
                className={`p-1 rounded ${dragState?.exIndex === exIndex ? 'text-cyan-400 bg-cyan-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/10'}`}
                title={dragState ? 'Cancel reorder' : 'Reorder exercise'}
              >
                <Icons.GripVertical />
              </button>
            )}
            {isSuperset && (
              <div className="w-1 h-8 bg-teal-500 rounded-full" />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setExerciseDetail(exercise)} className="font-semibold text-white hover:text-cyan-400 transition-colors text-left">{exercise.name}</button>
                {typeInfo && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>{typeInfo.label}</span>
                )}
                {phaseInfo && !isSuperset && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${phaseInfo.textColor} bg-white/5`}>{phaseInfo.icon}</span>
                )}
              </div>
              <span className="text-xs text-gray-400">{exercise.bodyPart}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditingRestTime(editingRestTime === exIndex ? null : exIndex)} className="text-xs text-gray-400 px-2 py-1 rounded hover:bg-white/10">
              ⏱️ {formatDuration(exerciseRestTime)}
            </button>
            {/* Link button - show if there's a next exercise and this is the last in its group */}
            {exIndex < activeWorkout.exercises.length - 1 && (!isSuperset || isLast) && (
              <button
                onClick={() => linkWithNext(exIndex)}
                className="text-teal-400 hover:text-teal-300 p-1 hover:bg-white/10 rounded"
                title="Link with next exercise"
              >
                <Icons.Link />
              </button>
            )}
            {/* Unlink button - show if in a superset */}
            {isSuperset && (
              <button
                onClick={() => unlinkSuperset(exIndex)}
                className="text-orange-400 hover:text-orange-300 p-1 hover:bg-white/10 rounded"
                title="Unlink from superset"
              >
                <Icons.Unlink />
              </button>
            )}
            {/* Delete button with confirmation */}
            {deleteConfirmIndex === exIndex ? (
              <div className="flex items-center gap-1">
                <button onClick={() => removeExercise(exIndex)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                <button onClick={() => setDeleteConfirmIndex(null)} className="text-xs text-gray-400 px-1">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setDeleteConfirmIndex(exIndex)} className="text-red-400 hover:text-red-300 p-1"><Icons.X /></button>
            )}
          </div>
        </div>

        {/* Rest time presets - Bug #8: Added custom input */}
        {editingRestTime === exIndex && (
          <div ref={restTimeRef} className="mb-3 p-2 bg-gray-800/50 rounded-lg">
            <div className="flex flex-wrap gap-1 items-center">
              {restTimePresets.map(t => (
                <button key={t} onClick={() => updateExerciseRestTime(exIndex, t)}
                  className={`px-3 py-1 text-xs rounded-full ${exerciseRestTime === t ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  {formatDuration(t)}
                </button>
              ))}
              <button
                onClick={() => updateExerciseRestTime(exIndex, 0)}
                className={`px-3 py-1 text-xs rounded-full ${exerciseRestTime === 0 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                Off
              </button>
              <div className="flex items-center gap-1 ml-2">
                <input
                  type="number"
                  placeholder="sec"
                  min="0"
                  max="600"
                  className="w-16 px-2 py-1 text-xs bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt(e.target.value);
                      if (val >= 0 && val <= 600) {
                        updateExerciseRestTime(exIndex, val);
                        e.target.value = '';
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 0 && val <= 600) {
                      updateExerciseRestTime(exIndex, val);
                      e.target.value = '';
                    }
                  }}
                />
                <span className="text-xs text-gray-500">custom</span>
              </div>
            </div>
          </div>
        )}

        {/* Set headers */}
        <div className="grid grid-cols-[40px_50px_1fr_1fr_40px] gap-1 mb-1 text-xs text-gray-500 uppercase px-1">
          <span>Set</span>
          <span className="text-center">Prev</span>
          {CATEGORIES[exercise.category]?.fields.length < 2 && <span></span>}
          {CATEGORIES[exercise.category]?.fields.slice(0, 2).map(f => (
            <span key={f} className="text-center">{f === 'bandColor' ? 'Band' : f}</span>
          ))}
          <span></span>
        </div>

        {/* Sets */}
        {exercise.sets.map((set, setIndex) => (
          <SetInputRow key={setIndex} set={set} setIndex={setIndex} category={exercise.category}
            previousSet={setIndex > 0 ? exercise.sets[setIndex - 1] : null}
            previousWorkoutSet={exercise.previousSets?.[setIndex] || null}
            restTime={exerciseRestTime}
            onUpdate={(field, value) => updateSet(exIndex, setIndex, field, value)}
            onComplete={() => toggleSetComplete(exIndex, setIndex)}
            onRemove={exercise.sets.length > 1 ? () => removeSet(exIndex, setIndex) : null}
            onOpenNumpad={(sIdx, field, fIdx) => openNumpad(exIndex, sIdx, field, fIdx)}
            onOpenBandPicker={(color) => openBandPicker(exIndex, setIndex, color)}
            activeField={activeField && activeField.setIndex === setIndex ? activeField.field : null}
            lastGlobalCompletion={set.completed ? getCompletionBeforeSet(exIndex, setIndex) : getLastGlobalCompletion()}
            isFirstSetInWorkout={isFirstSetInWorkout(exIndex, setIndex)} />
        ))}
        <button onClick={() => addSet(exIndex)}
          className="w-full mt-2 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-teal-400 font-medium flex items-center justify-center gap-1 text-sm">
          <Icons.Plus /> Add Set ({formatDuration(exerciseRestTime)})
        </button>
      </div>
    );
  };

  const groupedByPhase = getGroupedExercisesByPhase();
  const showPhases = hasPhases();

  // Helper to render a group (superset or single)
  const renderGroup = (group, groupIdx) => {
    if (group.type === 'superset') {
      return (
        <div key={group.supersetId} className="mb-4">
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
    } else {
      return renderExerciseCard(group.exercise, group.index, false);
    }
  };

  // Calculate phase progress
  const getPhaseProgress = (groups) => {
    let completed = 0;
    let total = 0;
    groups.forEach(group => {
      if (group.type === 'superset') {
        group.exercises.forEach(({ exercise }) => {
          exercise.sets?.forEach(set => {
            total++;
            if (set.completed) completed++;
          });
        });
      } else {
        group.exercise?.sets?.forEach(set => {
          total++;
          if (set.completed) completed++;
        });
      }
    });
    return { completed, total };
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Background Image - fixed position */}
      <div className="fixed inset-0 z-0 bg-black">
        <img src="/backgrounds/bg-1.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
      </div>
      <div className="relative z-10 flex flex-col h-full overflow-hidden">
      <RestTimerBanner isActive={restTimer.active} timeRemaining={restTimer.time} totalTime={restTimer.totalTime}
        exerciseName={restTimer.exerciseName} onSkip={() => setRestTimer({ active: false, time: 0, totalTime: 0, exerciseName: '' })}
        onAddTime={(delta) => setRestTimer(prev => ({ ...prev, time: Math.max(0, prev.time + delta), totalTime: Math.max(prev.totalTime, prev.time + delta) }))} />

      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm flex-shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <input type="text" value={activeWorkout.name} onChange={e => setActiveWorkout({ ...activeWorkout, name: e.target.value })}
              className="text-xl font-bold text-white bg-transparent border-none focus:outline-none w-full" />
            {/* Bug #15: Pace tracking display */}
            {(() => {
              const pace = getPaceInfo();
              if (pace) {
                return (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">{pace.elapsedMinutes}/{pace.estimatedMinutes} min</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{pace.completedSets}/{pace.totalSets} sets</span>
                    <span className="text-gray-600">•</span>
                    <span className={pace.color}>
                      {pace.emoji} {pace.isAhead ? `${Math.abs(pace.paceDiffMinutes)}m ahead` : pace.paceDiffMinutes === 0 ? 'on pace' : `${pace.paceDiffMinutes}m behind`}
                    </span>
                  </div>
                );
              }
              return <div className="text-sm text-gray-400">{Math.floor((Date.now() - activeWorkout.startTime) / 60000)} min elapsed</div>;
            })()}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowCancelConfirm(true)} className="text-red-400 hover:text-red-300 px-3 py-2 text-sm whitespace-nowrap">Cancel</button>
            <button onClick={() => onFinish(activeWorkout)} className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 whitespace-nowrap">Finish</button>
          </div>
        </div>
        {activeWorkout.notes && (
          <div className="mt-3 bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
            <div className="text-sm text-amber-400 flex items-start gap-2">
              <span>📋</span> <span>{activeWorkout.notes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bug #11: Drag mode banner */}
      {dragState && (
        <div className="mx-4 mb-2 p-3 bg-cyan-900/50 border border-cyan-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300">
            <Icons.GripVertical />
            <span className="text-sm font-medium">Reordering: {activeWorkout.exercises[dragState.exIndex]?.name}</span>
          </div>
          <button onClick={cancelDrag} className="text-cyan-400 hover:text-cyan-300 text-sm px-3 py-1 bg-cyan-900/50 rounded-lg">
            Cancel
          </button>
        </div>
      )}

      <div
        className={`flex-1 overflow-y-auto p-4 ${restTimer.active ? 'pt-24' : ''} ${dragState ? 'pt-2' : ''}`}
        style={{
          paddingBottom: numpadState ? '18rem' : 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
          overscrollBehavior: 'contain'
        }}
        onScroll={(e) => onScroll?.(e.target.scrollTop)}
      >
        {showPhases ? (
          // Render with phase sections - Bug #12: Show all phases for adding exercises
          Object.entries(EXERCISE_PHASES).map(([phaseKey, phaseInfo]) => {
            const groups = groupedByPhase[phaseKey] || [];
            const isEmpty = groups.length === 0;

            const isCollapsed = collapsedPhases[phaseKey];
            const { completed, total } = getPhaseProgress(groups);
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={phaseKey} className="mb-4">
                <button
                  onClick={() => togglePhase(phaseKey)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl ${phaseInfo.color} mb-2`}
                >
                  <div className="flex items-center gap-2">
                    <span>{phaseInfo.icon}</span>
                    <span className="font-semibold text-white">{phaseInfo.label}</span>
                    <span className="text-white/70 text-sm">({groups.reduce((t, g) => t + (g.type === 'superset' ? g.exercises.length : 1), 0)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/90 text-sm font-medium">{completed}/{total} sets</span>
                    <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className={`border-l-4 ${phaseInfo.borderColor} pl-3`}>
                    {groups.map((group, idx) => renderGroup(group, idx))}
                    {/* Bug #11: Drop zone at end of phase when dragging */}
                    {dragState && (
                      <button
                        onClick={() => {
                          // Find the last exercise index in this phase
                          const lastInPhase = activeWorkout.exercises.reduce((last, ex, idx) =>
                            (ex.phase || 'workout') === phaseKey ? idx : last, -1);
                          dropExercise(lastInPhase + 1, phaseKey);
                        }}
                        className="w-full mt-2 bg-cyan-900/20 border-2 border-dashed border-cyan-500/50 rounded-xl py-4 text-cyan-400 hover:bg-cyan-900/30 flex items-center justify-center gap-2 text-sm"
                      >
                        ↓ Drop at end of {phaseInfo.label}
                      </button>
                    )}
                    {/* Bug #12: Add exercise button per phase */}
                    {!dragState && (
                      <button
                        onClick={() => { setAddToPhase(phaseKey); setShowExerciseModal(true); }}
                        className="w-full mt-2 bg-gray-900/50 border border-dashed border-gray-700 rounded-xl py-3 text-gray-500 hover:border-gray-600 hover:text-gray-400 flex items-center justify-center gap-2 text-sm"
                      >
                        <Icons.Plus /> Add to {phaseInfo.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Render without phases (flat list with superset grouping)
          Object.values(groupedByPhase).flat().map((group, idx) => renderGroup(group, idx))
        )}
        <button onClick={() => { setAddToPhase('workout'); setShowExerciseModal(true); }}
          className="w-full bg-gray-900 border-2 border-dashed border-gray-700 rounded-2xl p-6 text-gray-400 hover:border-teal-600 hover:text-teal-400 flex items-center justify-center gap-2">
          <Icons.Plus /> Add Exercise
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Cancel Workout?</h3>
            <p className="text-gray-400 text-sm mb-6">Your workout progress will be lost. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700">
                Keep Going
              </button>
              <button onClick={() => { setShowCancelConfirm(false); onCancel(); }} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600">
                Cancel Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {showExerciseModal && (
        <ExerciseSearchModal
          exercises={exercises}
          onSelect={addSingleExercise}
          onSelectMultiple={addExercises}
          onClose={() => setShowExerciseModal(false)}
        />
      )}

      {/* Exercise Detail Modal */}
      {exerciseDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setExerciseDetail(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-white/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{exerciseDetail.name}</h3>
              <button onClick={() => setExerciseDetail(null)} className="text-gray-400 hover:text-white p-1">
                <Icons.X />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-20">Body Part</span>
                <span className="text-white">{exerciseDetail.bodyPart}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-20">Category</span>
                <span className="text-white capitalize">{exerciseDetail.category?.replace('_', ' ')}</span>
              </div>
              {exerciseDetail.exerciseType && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-20">Type</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${EXERCISE_TYPES[exerciseDetail.exerciseType]?.color || 'bg-gray-700'}`}>
                    {EXERCISE_TYPES[exerciseDetail.exerciseType]?.label || exerciseDetail.exerciseType}
                  </span>
                </div>
              )}
              {/* Phase selector */}
              <div className="pt-3 border-t border-gray-800">
                <span className="text-gray-400 text-sm block mb-2">Phase</span>
                <div className="flex gap-1">
                  {Object.entries(EXERCISE_PHASES).map(([key, info]) => {
                    const exIndex = activeWorkout.exercises.findIndex(e => e.name === exerciseDetail.name && e.bodyPart === exerciseDetail.bodyPart);
                    const currentPhase = exerciseDetail.phase || 'workout';
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          if (exIndex >= 0) {
                            const updated = { ...activeWorkout };
                            updated.exercises[exIndex].phase = key;
                            setActiveWorkout(updated);
                            setExerciseDetail({ ...exerciseDetail, phase: key });
                          }
                        }}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                          currentPhase === key
                            ? `${info.color} text-white`
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {info.icon} {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {exerciseDetail.notes && (
                <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
                  <div className="text-sm text-amber-400">{exerciseDetail.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Band Color Picker Modal */}
      {bandPickerState && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setBandPickerState(null)} />
          <div className="fixed left-1/2 -translate-x-1/2 w-64 bg-gray-800 rounded-xl shadow-2xl z-[101] p-3 border border-gray-700" style={{ top: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="text-center text-white font-medium mb-3 pb-2 border-b border-gray-700">Select Band Color</div>
            <div className="flex flex-col gap-1.5">
              {Object.entries(BAND_COLORS).map(([color, info]) => (
                <button
                  key={color}
                  onClick={() => selectBandColor(color)}
                  className={`${info.bg} ${info.text} px-3 py-2 rounded-lg text-sm font-medium ${bandPickerState.currentColor === color ? 'ring-2 ring-white' : ''}`}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Number Pad / Duration Pad */}
      {numpadState && activeWorkout && (
        numpadState.field === 'duration' ? (
          <DurationPad
            value={String(activeWorkout.exercises[numpadState.exIndex]?.sets[numpadState.setIndex]?.[numpadState.field] || '')}
            onChange={handleNumpadChange}
            onClose={closeNumpad}
            onNext={handleNumpadNext}
            fieldLabel="Duration"
          />
        ) : (
          <NumberPad
            value={String(activeWorkout.exercises[numpadState.exIndex]?.sets[numpadState.setIndex]?.[numpadState.field] || '')}
            onChange={handleNumpadChange}
            onClose={closeNumpad}
            onNext={handleNumpadNext}
            showRPE={numpadState.field === 'reps'}
            rpeValue={activeWorkout.exercises[numpadState.exIndex]?.sets[numpadState.setIndex]?.rpe}
            onRPEChange={handleRPEChange}
            fieldLabel={numpadState.field === 'weight' ? 'Weight (lbs)' : numpadState.field === 'reps' ? 'Reps' : numpadState.field === 'distance' ? 'Distance (mi)' : numpadState.field}
          />
        )
      )}

      {/* Timer uses vibration instead of audio to avoid pausing music (Bug #3 fix) */}
      </div>
    </div>
  );
};


export { WorkoutScreen };
