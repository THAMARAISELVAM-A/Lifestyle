import React from 'react';
import { 
  CheckSquare, Plus, Clock, Play, Pause, 
  Trash2, BrainCircuit, Terminal, Cpu, Network, Zap, Server, Activity, Target
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
    let timer: ReturnType<typeof setInterval>;
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

  const columns: { id: Task['status']; name: string; icon: React.ReactNode; borderColor: string; textColor: string; bgColor: string }[] = [
    { id: 'todo', name: 'INIT_QUEUE', icon: <Server size={14} />, borderColor: 'border-cyber-cyan/30', textColor: 'text-cyber-cyan', bgColor: 'bg-black/60' },
    { id: 'progress', name: 'PROCESSING', icon: <Activity size={14} className="animate-pulse" />, borderColor: 'border-cyber-purple/30', textColor: 'text-cyber-purple', bgColor: 'bg-black/60' },
    { id: 'done', name: 'RESOLVED', icon: <Terminal size={14} />, borderColor: 'border-cyber-green/30', textColor: 'text-cyber-green', bgColor: 'bg-black/60' }
  ];

  return (
    <div className="font-mono space-y-6 max-w-7xl mx-auto p-4 bg-black/60 border border-cyber-cyan/20 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyber-cyan/30 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-cyber-cyan flex items-center gap-3 uppercase">
            <Cpu className="text-cyber-cyan" />
            Neural Net Queue
          </h2>
          <p className="text-cyber-cyan/50 text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
            <Network size={12} /> System Task Allocation Node
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={reorganizeSchedule}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-black/60 border border-cyber-purple/40 text-cyber-purple text-xs font-bold uppercase tracking-wider hover:bg-cyber-purple/10 hover:shadow-[0_0_10px_rgba(176,38,255,0.3)] transition-all cursor-pointer"
          >
            <BrainCircuit size={14} /> Optimize
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-black/60 border border-cyber-cyan/40 text-cyber-cyan text-xs font-bold uppercase tracking-wider hover:bg-cyber-cyan/10 hover:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all cursor-pointer"
          >
            <Plus size={14} /> Inject Node
          </button>
        </div>
      </div>

      {/* Project filtering list */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin border-b border-cyber-cyan/10">
        <span className="text-cyber-cyan/40 text-xs uppercase tracking-widest flex items-center gap-1 shrink-0">
          <Target size={12} /> Filters:
        </span>
        {projects.map(proj => (
          <button
            key={proj}
            onClick={() => setActiveProject(proj)}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shrink-0 ${
              activeProject === proj 
                ? 'bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan shadow-[0_0_8px_rgba(0,255,255,0.2)]' 
                : 'text-cyber-cyan/40 hover:text-cyber-cyan hover:bg-cyber-cyan/5 border border-cyber-cyan/20'
            }`}
          >
            [{proj}]
          </button>
        ))}
      </div>

      {/* Time Tracker Widget */}
      {trackingTaskId && (
        <div className="bg-black/80 border border-cyber-purple/50 p-3 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyber-purple/5 animate-pulse pointer-events-none" />
          <div className="flex items-center gap-3 z-10">
            <div className="text-cyber-purple animate-spin-slow">
              <Activity size={18} />
            </div>
            <div>
              <span className="text-[10px] text-cyber-purple/70 font-mono uppercase tracking-widest">Active Thread Processing</span>
              <p className="text-xs font-bold text-cyber-purple uppercase tracking-wider truncate max-w-[200px] sm:max-w-md">
                {'>'} {tasks.find(t => t.id === trackingTaskId)?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 z-10">
            <span className="text-sm font-bold text-cyber-purple tracking-widest bg-black border border-cyber-purple/30 px-3 py-1 shadow-[0_0_8px_rgba(176,38,255,0.2)]">
              {formatTime(trackingTime)}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsTrackingRunning(!isTrackingRunning)}
                className="p-1.5 bg-black border border-cyber-purple/30 text-cyber-purple hover:bg-cyber-purple/20 transition-all cursor-pointer"
              >
                {isTrackingRunning ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button 
                onClick={() => setTrackingTaskId(null)}
                className="p-1.5 bg-black border border-cyber-red/30 text-cyber-red hover:bg-cyber-red/20 transition-all uppercase text-[10px] tracking-widest font-bold px-3 cursor-pointer"
              >
                Term
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Form Dialog */}
      {showAddForm && (
        <div className="bg-black/90 border border-cyber-cyan shadow-[0_0_20px_rgba(0,255,255,0.15)] p-5 space-y-4 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-50" />
          <h3 className="font-bold text-sm tracking-widest text-cyber-cyan uppercase flex items-center gap-2">
            <Terminal size={14} /> Construct New Node
          </h3>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-cyber-cyan/60 uppercase tracking-widest">Node Designation</label>
              <input
                type="text"
                required
                placeholder="INPUT_TITLE..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-black/60 border border-cyber-cyan/30 text-cyber-cyan placeholder-cyber-cyan/30 focus:border-cyber-cyan focus:outline-none focus:shadow-[0_0_8px_rgba(0,255,255,0.2)] transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-cyber-cyan/60 uppercase tracking-widest">Namespace</label>
              <input
                type="text"
                placeholder="SYS_ENV..."
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-black/60 border border-cyber-cyan/30 text-cyber-cyan placeholder-cyber-cyan/30 focus:border-cyber-cyan focus:outline-none focus:shadow-[0_0_8px_rgba(0,255,255,0.2)] transition-all"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-cyber-cyan/60 uppercase tracking-widest">Payload Data</label>
              <textarea
                placeholder="ENTER_PAYLOAD_DETAILS..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-black/60 border border-cyber-cyan/30 text-cyber-cyan placeholder-cyber-cyan/30 focus:border-cyber-cyan focus:outline-none focus:shadow-[0_0_8px_rgba(0,255,255,0.2)] transition-all min-h-[80px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-cyber-cyan/60 uppercase tracking-widest">Execution Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full px-3 py-2 text-xs bg-black/60 border border-cyber-cyan/30 text-cyber-cyan focus:border-cyber-cyan focus:outline-none focus:shadow-[0_0_8px_rgba(0,255,255,0.2)] transition-all appearance-none cursor-pointer"
              >
                <option value="low">PRIORITY_LOW</option>
                <option value="medium">PRIORITY_MED</option>
                <option value="high">PRIORITY_HIGH</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-cyber-cyan/60 uppercase tracking-widest">Cycle Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-black/60 border border-cyber-cyan/30 text-cyber-cyan focus:border-cyber-cyan focus:outline-none focus:shadow-[0_0_8px_rgba(0,255,255,0.2)] transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-cyber-cyan/20">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-cyber-cyan/30 text-cyber-cyan/70 text-xs font-bold tracking-widest uppercase hover:bg-cyber-cyan/10 hover:text-cyber-cyan transition-all cursor-pointer"
              >
                Abort
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan text-xs font-bold tracking-widest uppercase hover:bg-cyber-cyan/20 hover:shadow-[0_0_12px_rgba(0,255,255,0.4)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Zap size={14} /> Execute
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
              className={`flex flex-col min-h-[450px] bg-black/80 border ${col.borderColor} relative`}
            >
              {/* Corner Accents */}
              <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${col.borderColor.replace('/30', '')}`} />
              <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${col.borderColor.replace('/30', '')}`} />
              <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${col.borderColor.replace('/30', '')}`} />
              <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${col.borderColor.replace('/30', '')}`} />

              {/* Column Header */}
              <div className={`flex justify-between items-center p-3 border-b ${col.borderColor} ${col.bgColor}`}>
                <span className={`font-bold text-xs tracking-widest uppercase flex items-center gap-2 ${col.textColor}`}>
                  {col.icon} {col.name}
                </span>
                <span className={`text-[10px] px-2 py-0.5 border ${col.borderColor} font-bold tracking-widest ${col.textColor}`}>
                  {colTasks.length.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Task Items */}
              <div className="space-y-3 p-3 flex-1 overflow-y-auto max-h-[500px] scrollbar-thin">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className={`bg-black border ${col.borderColor} p-3 hover:bg-black/40 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden`}
                  >
                    {/* Hover scanline effect */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 -translate-y-full group-hover:animate-[scanline_2s_linear_infinite]" />

                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className={`text-xs font-bold leading-normal uppercase tracking-wide flex items-start gap-2 ${col.textColor}`}>
                          <span className="opacity-50 mt-0.5">{'>'}</span>
                          {task.title}
                        </h4>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 border shrink-0 ${
                          task.priority === 'high' ? 'border-cyber-red/50 text-cyber-red bg-cyber-red/10' :
                          task.priority === 'medium' ? 'border-cyber-yellow/50 text-cyber-yellow bg-cyber-yellow/10' : 'border-cyber-cyan/50 text-cyber-cyan bg-cyber-cyan/10'
                        }`}>
                          {task.priority === 'high' ? 'P0' : task.priority === 'medium' ? 'P1' : 'P2'}
                        </span>
                      </div>
                      <p className={`text-[10px] ${col.textColor} opacity-60 leading-relaxed font-light line-clamp-3 ml-3`}>
                        {task.description}
                      </p>
                    </div>

                    <div className={`flex justify-between items-center pt-3 mt-2 border-t ${col.borderColor} text-[9px] tracking-widest`}>
                      <span className={`${col.textColor} opacity-50`}>DEADLINE: {task.dueDate}</span>
                      <div className="flex gap-2 items-center opacity-40 group-hover:opacity-100 transition-opacity">
                        {/* Status switcher dropdown actions */}
                        {col.id !== 'todo' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'todo')}
                            className="px-2 py-1 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 hover:shadow-[0_0_5px_rgba(0,255,255,0.4)] transition-all uppercase cursor-pointer"
                            title="Move to INIT"
                          >
                            INIT
                          </button>
                        )}
                        {col.id !== 'progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'progress')}
                            className="px-2 py-1 border border-cyber-purple/30 text-cyber-purple hover:bg-cyber-purple/20 hover:shadow-[0_0_5px_rgba(176,38,255,0.4)] transition-all uppercase cursor-pointer"
                            title="Move to PROC"
                          >
                            PROC
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'done')}
                            className="px-2 py-1 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/20 hover:shadow-[0_0_5px_rgba(0,255,0,0.4)] transition-all uppercase cursor-pointer"
                            title="Move to RSLV"
                          >
                            RSLV
                          </button>
                        )}
                        
                        {/* Time Tracker Play */}
                        <button
                          onClick={() => handleStartTracking(task.id)}
                          className={`p-1 border transition-all cursor-pointer ${
                            trackingTaskId === task.id && isTrackingRunning
                              ? 'border-cyber-purple text-cyber-purple bg-cyber-purple/20 shadow-[0_0_8px_rgba(176,38,255,0.4)]'
                              : 'border-cyber-cyan/30 text-cyber-cyan/60 hover:text-cyber-cyan hover:bg-cyber-cyan/20'
                          }`}
                        >
                          <Play size={10} />
                        </button>
                        
                        {/* Delete Task */}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 border border-cyber-red/30 text-cyber-red/60 hover:text-cyber-red hover:bg-cyber-red/20 transition-all cursor-pointer"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className={`border border-dashed ${col.borderColor} py-8 text-center text-[10px] tracking-widest uppercase ${col.textColor} opacity-30`}>
                    NULL_SET
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
