import React from 'react';
import { 
  CheckSquare, Plus, Clock, Play, Pause, 
  Trash2, BrainCircuit
} from 'lucide-react';
import type { Task } from '../types';


interface TaskManagerProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  deleteTask: (id: string) => void;
  reorganizeSchedule: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  addTask,
  updateTaskStatus,
  deleteTask,
  reorganizeSchedule
}) => {
  const [activeProject, setActiveProject] = React.useState<string>('all');
  const [showAddForm, setShowAddForm] = React.useState(false);

  // New task form fields
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<Task['priority']>('medium');
  const [project, setProject] = React.useState('Work');
  const [dueDate, setDueDate] = React.useState('');

  // Time Tracker State
  const [trackingTaskId, setTrackingTaskId] = React.useState<string | null>(null);
  const [trackingTime, setTrackingTime] = React.useState(0); // seconds
  const [isTrackingRunning, setIsTrackingRunning] = React.useState(false);

  React.useEffect(() => {
    let timer: any;
    if (isTrackingRunning && trackingTaskId) {
      timer = setInterval(() => {
        setTrackingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTrackingRunning, trackingTaskId]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartTracking = (id: string) => {
    if (trackingTaskId === id) {
      setIsTrackingRunning(!isTrackingRunning);
    } else {
      setTrackingTaskId(id);
      setTrackingTime(0);
      setIsTrackingRunning(true);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addTask({
      title,
      description: description || 'No description provided.',
      status: 'todo',
      priority,
      project,
      dueDate: dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
    });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setProject('Work');
    setDueDate('');
    setShowAddForm(false);
  };

  const projects = ['all', ...Array.from(new Set(tasks.map(t => t.project)))];
  
  const filteredTasks = tasks.filter(task => {
    return activeProject === 'all' || task.project === activeProject;
  });

  const columns: { id: Task['status']; name: string; color: string; hoverColor: string }[] = [
    { id: 'todo', name: 'To Do', color: 'border-t-cyber-blue text-cyber-blue bg-cyber-blue/5', hoverColor: 'hover:border-cyber-blue/40' },
    { id: 'progress', name: 'In Progress', color: 'border-t-cyber-purple text-cyber-purple bg-cyber-purple/5', hoverColor: 'hover:border-cyber-purple/40' },
    { id: 'done', name: 'Completed', color: 'border-t-cyber-green text-cyber-green bg-cyber-green/5', hoverColor: 'hover:border-cyber-green/40' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="text-cyber-green" />
            AI Task Manager
          </h2>
          <p className="text-cyber-muted text-xs">Kanban board, time tracking, and smart calendar prioritization.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={reorganizeSchedule}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-cyber-purple/20 border border-cyber-purple/30 text-cyber-purple text-xs font-semibold rounded-xl hover:bg-cyber-purple/30 cursor-pointer transition-all"
          >
            <BrainCircuit size={14} /> AI Prioritization
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-cyber-green/20 border border-cyber-green/30 text-cyber-green text-xs font-semibold rounded-xl hover:bg-cyber-green/30 cursor-pointer transition-all"
          >
            <Plus size={14} /> Add Task
          </button>
        </div>
      </div>

      {/* Project filtering list */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {projects.map(proj => (
          <button
            key={proj}
            onClick={() => setActiveProject(proj)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
              activeProject === proj 
                ? 'bg-white/15 border border-white/20 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {proj}
          </button>
        ))}
      </div>

      {/* Time Tracker Widget */}
      {trackingTaskId && (
        <div className="glass-panel border-glow-purple rounded-xl p-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-purple/10 text-cyber-purple animate-pulse">
              <Clock size={16} />
            </div>
            <div>
              <span className="text-[10px] text-cyber-purple font-mono uppercase tracking-wider">Active Time Tracker</span>
              <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                {tasks.find(t => t.id === trackingTaskId)?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span className="text-sm font-bold text-white tracking-widest bg-black/40 border border-white/5 rounded px-2.5 py-1">
              {formatTime(trackingTime)}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsTrackingRunning(!isTrackingRunning)}
                className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                {isTrackingRunning ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button 
                onClick={() => setTrackingTaskId(null)}
                className="p-2 rounded-lg bg-cyber-red/10 border border-cyber-red/20 text-cyber-red hover:bg-cyber-red/20 cursor-pointer"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Form Dialog */}
      {showAddForm && (
        <div className="glass-panel rounded-2xl p-6 border border-cyber-green/30 bg-cyber-bg/95 shadow-glass-lg space-y-4">
          <h3 className="font-semibold text-lg text-white">Create Workspace Task</h3>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-cyber-muted font-mono uppercase">Task Title</label>
              <input
                type="text"
                required
                placeholder="What needs doing?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-cyber-muted font-mono uppercase">Project Namespace</label>
              <input
                type="text"
                placeholder="e.g. Work, Personal, Life"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-cyber-muted font-mono uppercase">Detailed Description</label>
              <textarea
                placeholder="Add contextual details here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input min-h-[80px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-cyber-muted font-mono uppercase">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-cyber-muted font-mono uppercase">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/5 cursor-pointer text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyber-green/20 hover:bg-cyber-green/30 border border-cyber-green/40 hover:border-cyber-green/60 rounded-xl text-xs font-semibold text-white cursor-pointer"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id}
              className={`glass-panel rounded-2xl border-t-4 border border-cyber-border ${col.color} p-4 flex flex-col min-h-[450px] shadow-glass`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-sm tracking-wide">{col.name}</span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono font-bold">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Items */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="glass-panel border-glow-purple bg-cyber-bg/40 rounded-xl p-3.5 hover:bg-black/40 border border-cyber-border transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-white leading-normal line-clamp-2">{task.title}</h4>
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                          task.priority === 'high' ? 'bg-cyber-red/20 text-cyber-red' :
                          task.priority === 'medium' ? 'bg-cyber-yellow/20 text-cyber-yellow' : 'bg-cyber-blue/20 text-cyber-blue'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-cyber-muted mt-1.5 leading-relaxed line-clamp-3">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-[9px] font-mono">
                      <span className="text-cyber-muted">Due: {task.dueDate}</span>
                      <div className="flex gap-1.5 items-center opacity-80 group-hover:opacity-100 transition-opacity">
                        {/* Status switcher dropdown actions */}
                        {col.id !== 'todo' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'todo')}
                            className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-cyber-blue/20 hover:text-cyber-blue cursor-pointer"
                            title="Move to Todo"
                          >
                            Todo
                          </button>
                        )}
                        {col.id !== 'progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'progress')}
                            className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-cyber-purple/20 hover:text-cyber-purple cursor-pointer"
                            title="Move to Progress"
                          >
                            Active
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'done')}
                            className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-cyber-green/20 hover:text-cyber-green cursor-pointer"
                            title="Move to Done"
                          >
                            Done
                          </button>
                        )}
                        {/* Time Tracker Play */}
                        <button
                          onClick={() => handleStartTracking(task.id)}
                          className={`p-1 rounded cursor-pointer ${
                            trackingTaskId === task.id && isTrackingRunning
                              ? 'bg-cyber-purple/20 text-cyber-purple'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Play size={10} />
                        </button>
                        {/* Delete Task */}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 rounded bg-white/5 text-slate-400 hover:text-cyber-red hover:bg-cyber-red/10 cursor-pointer"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="border border-dashed border-white/5 rounded-xl py-12 text-center text-xs text-cyber-muted">
                    No tasks in this board
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
