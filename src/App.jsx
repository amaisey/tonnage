import { useState, useCallback } from 'react';
import { Icons } from './components/Icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { defaultExercises } from './data/defaultExercises';
import { defaultFolders, sampleTemplates } from './data/defaultTemplates';
import { WorkoutScreen } from './components/WorkoutScreen';
import { ExercisesScreen } from './components/ExercisesScreen';
import { TemplatesScreen } from './components/TemplatesScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { HistoryMigration } from './components/HistoryMigration';
import { SettingsModal } from './components/SettingsModal';
import { WorkoutCompleteModal } from './components/SharedComponents';
import { workoutDb } from './db/workoutDb';
import { usePreviousExerciseData } from './hooks/useWorkoutDb';

function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [exercises, setExercises] = useLocalStorage('workout-exercises', defaultExercises);
  const [templates, setTemplates] = useLocalStorage('workout-templates', sampleTemplates);
  const [folders, setFolders] = useLocalStorage('workout-folders', defaultFolders);
  const [completedWorkout, setCompletedWorkout] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Hook for getting previous exercise data from IndexedDB
  const { getPreviousData, clearCache } = usePreviousExerciseData();

  // Start a workout from a template
  const startTemplate = useCallback(async (template) => {
    // Fetch previous data for all exercises in parallel
    const exercisesWithPrevData = await Promise.all(
      template.exercises.map(async (ex) => {
        const prevData = await getPreviousData(ex.name);
        const sets = prevData && prevData.length > 0
          ? prevData.map(s => ({ ...s, completed: false, completedAt: undefined }))
          : ex.sets.map(s => ({ ...s, completed: false }));
        return {
          ...ex,
          restTime: ex.restTime || 90,
          sets,
          previousSets: prevData
        };
      })
    );

    setActiveWorkout({
      name: template.name,
      exercises: exercisesWithPrevData,
      startTime: Date.now()
    });
    setActiveTab('workout');
  }, [getPreviousData]);

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  // Finish workout and save to IndexedDB
  const finishWorkout = useCallback(async (workout) => {
    const completedWorkoutData = {
      ...workout,
      date: Date.now(),
      duration: Date.now() - workout.startTime,
    };

    try {
      // Save to IndexedDB
      await workoutDb.add(completedWorkoutData);
      // Clear the previous data cache so next workout gets fresh data
      clearCache();
      // Trigger history refresh
      setHistoryRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Error saving workout:', err);
    }

    setCompletedWorkout(completedWorkoutData);
    setActiveWorkout(null);
  }, [clearCache]);

  const saveAsTemplate = (workout, name, folderId) => {
    const newTemplate = {
      id: Date.now(),
      name: name || workout.name,
      folderId: folderId || 'root',
      exercises: workout.exercises.map(ex => ({
        name: ex.name,
        bodyPart: ex.bodyPart,
        category: ex.category,
        restTime: ex.restTime,
        exerciseType: ex.exerciseType,
        supersetId: ex.supersetId,
        sets: ex.sets.filter(s => s.completed).map(s => {
          const set = { ...s };
          delete set.completed;
          delete set.completedAt;
          return set;
        })
      }))
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  // Handle restoring data from backup
  const handleRestoreData = useCallback((data) => {
    if (data.exercises?.length > 0) setExercises(data.exercises);
    if (data.templates?.length > 0) setTemplates(data.templates);
    if (data.folders?.length > 0) setFolders(data.folders);
    // Refresh history view
    setHistoryRefreshKey(k => k + 1);
  }, [setExercises, setTemplates, setFolders]);

  const tabs = [
    { id: 'workout', icon: Icons.Dumbbell, label: 'Workout' },
    { id: 'exercises', icon: Icons.List, label: 'Exercises' },
    { id: 'templates', icon: Icons.Template, label: 'Templates' },
    { id: 'history', icon: Icons.History, label: 'History' },
    { id: 'settings', icon: Icons.Settings, label: 'Settings' },
  ];

  return (
    <HistoryMigration>
      <div className="w-full h-[100dvh] bg-black flex flex-col overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeTab === 'workout' && (
            <WorkoutScreen
              activeWorkout={activeWorkout}
              setActiveWorkout={setActiveWorkout}
              onFinish={finishWorkout}
              onCancel={cancelWorkout}
              exercises={exercises}
              getPreviousData={getPreviousData}
            />
          )}
          {activeTab === 'exercises' && (
            <ExercisesScreen
              exercises={exercises}
              onAddExercise={ex => setExercises([...exercises, ex])}
              onUpdateExercise={ex => setExercises(exercises.map(e => e.id === ex.id ? ex : e))}
              onDeleteExercise={id => setExercises(exercises.filter(e => e.id !== id))}
            />
          )}
          {activeTab === 'templates' && (
            <TemplatesScreen
              templates={templates}
              folders={folders}
              onStartTemplate={startTemplate}
              onImport={t => setTemplates(prev => [...prev, t])}
              onBulkImport={arr => setTemplates(prev => [...prev, ...arr])}
              onUpdateTemplate={t => setTemplates(prev => prev.map(x => x.id === t.id ? t : x))}
              onDeleteTemplate={id => setTemplates(prev => prev.filter(t => t.id !== id))}
              onAddFolder={f => setFolders(prev => [...prev, f])}
              onBulkAddFolders={arr => setFolders(prev => [...prev, ...arr])}
              onDeleteFolder={id => setFolders(prev => prev.filter(f => f.id !== id))}
              onAddExercises={arr => setExercises(prev => [...prev, ...arr])}
              exercises={exercises}
            />
          )}
          {activeTab === 'history' && (
            <HistoryScreen onRefreshNeeded={historyRefreshKey} />
          )}
        </div>

        <div className="bg-gray-900 border-t border-gray-800/50 px-4 py-2" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
          <div className="flex justify-around">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = tab.id === 'settings' ? showSettings : activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'settings') {
                      setShowSettings(true);
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Icon />
                  <span className={`text-xs mt-1 ${isActive ? 'text-cyan-400' : ''}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {completedWorkout && (
          <WorkoutCompleteModal
            workout={completedWorkout}
            onClose={() => setCompletedWorkout(null)}
            onSaveAsTemplate={saveAsTemplate}
          />
        )}

        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            exercises={exercises}
            templates={templates}
            folders={folders}
            onRestoreData={handleRestoreData}
          />
        )}
      </div>
    </HistoryMigration>
  );
}

export default App;
