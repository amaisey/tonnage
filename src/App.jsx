import { useState, useEffect } from 'react';
import { Icons } from './components/Icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { defaultExercises } from './data/defaultExercises';
import { defaultFolders, sampleTemplates } from './data/defaultTemplates';
import { WorkoutScreen } from './components/WorkoutScreen';
import { ExercisesScreen } from './components/ExercisesScreen';
import { TemplatesScreen } from './components/TemplatesScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { WorkoutCompleteModal } from './components/SharedComponents';

function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [exercises, setExercises] = useLocalStorage('workout-exercises', defaultExercises);
  const [templates, setTemplates] = useLocalStorage('workout-templates', sampleTemplates);
  const [folders, setFolders] = useLocalStorage('workout-folders', defaultFolders);
  const [history, setHistory] = useLocalStorage('workout-history', []);
  const [completedWorkout, setCompletedWorkout] = useState(null);

  // Helper to get previous workout data for an exercise
  const getPreviousExerciseData = (exerciseName) => {
    for (const workout of history) {
      const prevExercise = workout.exercises.find(ex => ex.name === exerciseName);
      if (prevExercise && prevExercise.sets.some(s => s.completed)) {
        return prevExercise.sets.filter(s => s.completed);
      }
    }
    return null;
  };

  const startTemplate = (template) => {
    setActiveWorkout({
      name: template.name,
      exercises: template.exercises.map(ex => {
        const prevData = getPreviousExerciseData(ex.name);
        const sets = prevData && prevData.length > 0
          ? prevData.map(s => ({ ...s, completed: false, completedAt: undefined }))
          : ex.sets.map(s => ({ ...s, completed: false }));
        return {
          ...ex,
          restTime: ex.restTime || 90,
          sets,
          previousSets: prevData
        };
      }),
      startTime: Date.now()
    });
    setActiveTab('workout');
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  const finishWorkout = (workout) => {
    const completedWorkoutData = {
      ...workout,
      date: Date.now(),
      duration: Date.now() - workout.startTime,
    };
    setHistory(prev => [completedWorkoutData, ...prev]);
    setCompletedWorkout(completedWorkoutData);
    setActiveWorkout(null);
  };

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

  const tabs = [
    { id: 'workout', icon: Icons.Dumbbell, label: 'Workout' },
    { id: 'exercises', icon: Icons.List, label: 'Exercises' },
    { id: 'templates', icon: Icons.Template, label: 'Templates' },
    { id: 'history', icon: Icons.History, label: 'History' },
  ];

  return (
    <div className="w-full h-[100dvh] bg-black flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {activeTab === 'workout' && (
          <WorkoutScreen activeWorkout={activeWorkout} setActiveWorkout={setActiveWorkout}
            onFinish={finishWorkout} onCancel={cancelWorkout} exercises={exercises} history={history} />
        )}
        {activeTab === 'exercises' && (
          <ExercisesScreen exercises={exercises} history={history}
            onAddExercise={ex => setExercises([...exercises, ex])}
            onUpdateExercise={ex => setExercises(exercises.map(e => e.id === ex.id ? ex : e))}
            onDeleteExercise={id => setExercises(exercises.filter(e => e.id !== id))} />
        )}
        {activeTab === 'templates' && (
          <TemplatesScreen templates={templates} folders={folders} onStartTemplate={startTemplate}
            onImport={t => setTemplates(prev => [...prev, t])}
            onBulkImport={arr => setTemplates(prev => [...prev, ...arr])}
            onUpdateTemplate={t => setTemplates(prev => prev.map(x => x.id === t.id ? t : x))}
            onDeleteTemplate={id => setTemplates(prev => prev.filter(t => t.id !== id))}
            onAddFolder={f => setFolders(prev => [...prev, f])}
            onBulkAddFolders={arr => setFolders(prev => [...prev, ...arr])}
            onDeleteFolder={id => setFolders(prev => prev.filter(f => f.id !== id))}
            onAddExercises={arr => setExercises(prev => [...prev, ...arr])}
            exercises={exercises} />
        )}
        {activeTab === 'history' && <HistoryScreen history={history} />}
      </div>

      <div className="bg-gray-900 border-t border-gray-800/50 px-4 py-2 pb-6">
        <div className="flex justify-around">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>
                <Icon /><span className={`text-xs mt-1 ${isActive ? 'text-cyan-400' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {completedWorkout && <WorkoutCompleteModal workout={completedWorkout} onClose={() => setCompletedWorkout(null)} onSaveAsTemplate={saveAsTemplate} />}
    </div>
  );
}

export default App;
