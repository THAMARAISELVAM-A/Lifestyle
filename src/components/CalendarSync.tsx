import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, X, ChevronLeft, ChevronRight, MapPin, Users, Zap, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NeonDB } from '../services/db';

export const CalendarSync: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());


  interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    time: string;
    duration: string;
    type: 'work' | 'personal' | 'health' | 'finance';
    description: string;
    attendees: string;
    location: string;
  }

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'e1', title: 'Weekly Design Review', date: new Date(2026, 4, 21), time: '09:00', duration: '1h', type: 'work', description: 'Product Team sync — Present the new drop interface designs.', attendees: 'Product Team', location: 'Conference Room A' },
    { id: 'e2', title: 'Lunch with Sarah', date: new Date(2026, 4, 21), time: '13:30', duration: '1h', type: 'personal', description: 'Grand Bistro Cafe', attendees: 'Sarah Mercer', location: 'Grand Bistro' },
    { id: 'e3', title: 'Gym Cardio Session', date: new Date(2026, 4, 21), time: '18:00', duration: '1h', type: 'health', description: 'Cardio HIIT — 45 min interval. Mix: 10 min warm-up + 30 min circuit + 5 min cool-down.', attendees: 'Self', location: 'FitZone Gym' },
    { id: 'e4', title: 'Dev Sync with Devin', date: new Date(2026, 4, 22), time: '14:00', duration: '1.5h', type: 'work', description: 'LifeOS neural code architecture sync', attendees: 'Devin Vance', location: 'Google Meet' },
    { id: 'e5', title: 'Dentist Appointment', date: new Date(2026, 4, 23), time: '11:00', duration: '45m', type: 'personal', description: '6-month checkup + teeth cleaning.', location: 'Downtown Dental', attendees: '' },
    { id: 'e6', title: 'Pay Electricity & Internet', date: new Date(2026, 4, 22), time: '10:00', duration: '15m', type: 'finance', description: 'Automatic payment from savings vault.', attendees: 'AI Finance Copilot', location: '' },
  ]);

  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', duration: '1h', type: 'work', description: '', location: '' });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user } = useAuth();   // ← auth context

  // Load persisted events from Neon DB once on mount (authenticated users only)
  React.useEffect(() => {
    let cancelled = false;
    async function loadEvents() {
      if (!isAuthenticated || !user?.id) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = await NeonDB.getAll('calendar_events', user.id) as any[];
        if (cancelled) return;
        if (rows.length > 0) {
          const loaded: CalendarEvent[] = rows
            .filter((r): r is CalendarEvent => !!r.title && !!r.date)
            .map(r => ({
              ...r,
              date: r.date instanceof Date ? r.date : new Date(r.date as string),
            }));
          setEvents(loaded);
        }
      } catch {
        // Keep seed state silently
      }
    }
    loadEvents();
    return () => { cancelled = true; };

  }, [isAuthenticated, user?.id]);

  // Persist newly added events to Neon (debounced 2 s)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user?.id) return;
      events.forEach(ev => {
        NeonDB.insert('calendar_events', {
          user_id: user.id,
          id: ev.id,
          title: ev.title,
          description: ev.description,
          date: ev.date.toISOString(),
          time: ev.time,
          duration: ev.duration,
          type: ev.type,
          attendees: ev.attendees,
          location: ev.location,
        } as unknown as Record<string, unknown>) // Nelenwrap
        .catch(() => {});
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [events, isAuthenticated, user?.id]);

  // Helper functions
  const daysInMonth = (new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate());
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const getEventsForDay = (day: number) => events.filter(e => e.date.getDate() === day && e.date.getMonth() === currentMonth.getMonth() && e.date.getFullYear() === currentMonth.getFullYear());
  const isToday = (day: number) => day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const typeColorMap: Record<string, string> = {
    work: 'border-l-cyber-purple bg-cyber-purple/10 text-cyber-purple',
    personal: 'border-l-cyber-pink bg-cyber-pink/10 text-cyber-pink',
    health: 'border-l-cyber-green bg-cyber-green/10 text-cyber-green',
    finance: 'border-l-cyber-orange bg-cyber-orange/10 text-cyber-orange',
  };
  const typeDotMap: Record<string, string> = {
    work: 'bg-cyber-purple',
    personal: 'bg-cyber-pink',
    health: 'bg-cyber-green',
    finance: 'bg-cyber-orange',
  };

  // Filter events by search query and type (if we had a type filter, but we don't have state for type filter in the spec, so we'll just use search)
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validTypes = ['work', 'personal', 'health', 'finance'] as const;
  const isValidType = (t: string): t is CalendarEvent['type'] => validTypes.includes(t as CalendarEvent['type']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.time) return;
    const eventType = isValidType(eventForm.type) ? eventForm.type : 'work';
    const newEvent: CalendarEvent = {
      id: `e${Date.now()}`,
      title: eventForm.title,
      date: new Date(eventForm.date),
      time: eventForm.time,
      duration: eventForm.duration,
      type: eventType,
      description: eventForm.description,
      location: eventForm.location,
      attendees: '',
    };
    setEvents((prev: CalendarEvent[]) => [...prev, newEvent]);
    setEventForm({ title: '', date: '', time: '', duration: '1h', type: 'work', description: '', location: '' });
  };

  // Handle deleting an event
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    if (selectedEventId === id) {
      setSelectedEventId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/90 text-cyber-purple font-mono p-6 relative overflow-hidden">
      {/* Background Grid for tactical overlay effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Header Row */}
      <div className="relative z-10 flex items-center justify-between mb-6 border-b border-cyber-purple/40 pb-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 border border-cyber-purple/40 bg-cyber-purple/10 rounded-sm">
            <CalendarIcon className="h-6 w-6 text-cyber-pink animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-widest text-cyber-pink uppercase drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">Timeline Sync</h2>
            <p className="text-xs text-cyber-purple/70 tracking-widest">TACTICAL SCHEDULE OVERLAY [ACTIVE]</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 border border-cyber-purple/40 bg-black/80 px-4 py-2 rounded-sm shadow-[0_0_10px_rgba(168,85,247,0.2)]">
          <button onClick={prevMonth} className="p-1 hover:text-cyber-pink transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-lg tracking-widest uppercase">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button onClick={nextMonth} className="p-1 hover:text-cyber-pink transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search + Quick Filters */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Zap className="h-4 w-4 text-cyber-purple/60" />
            </div>
            <input
              type="text"
              placeholder="SEARCH PROTOCOLS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-cyber-purple/40 text-cyber-pink placeholder-cyber-purple/50 focus:outline-none focus:border-cyber-pink pl-10 pr-4 py-2 text-sm uppercase tracking-wider"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Work', 'Personal', 'Health', 'Finance'].map((filter) => (
            <button key={filter} className="px-4 py-1.5 text-xs uppercase tracking-wider border border-cyber-purple/40 bg-black/60 hover:bg-cyber-purple/20 hover:border-cyber-pink hover:text-cyber-pink transition-all">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-auto">
        {/* Left: Calendar and Events List */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Calendar Grid */}
          <div className="border border-cyber-purple/40 bg-black/80 shadow-[0_0_15px_rgba(168,85,247,0.15)] p-4 relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyber-pink"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyber-pink"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyber-pink"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyber-pink"></div>

            {/* Day names */}
            <div className="grid grid-cols-7 text-center text-xs tracking-widest text-cyber-purple/70 mb-2 border-b border-cyber-purple/30 pb-2 uppercase">
              {dayNames.map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>
            {/* Day slots */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for the first day offset */}
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={i} className="min-h-[80px] bg-cyber-purple/5 border border-cyber-purple/10"></div>
              ))}
              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const today = isToday(day);
                return (
                  <div
                    key={day}
                    className={`cursor-pointer min-h-[80px] p-2 border transition-all ${today ? 'border-cyber-pink bg-cyber-pink/10 shadow-[inset_0_0_10px_rgba(236,72,153,0.3)]' : 'border-cyber-purple/20 bg-black/40 hover:bg-cyber-purple/20 hover:border-cyber-purple/60'}`}
                  >
                    <div className="flex w-full h-full flex-col">
                      <div className={`flex items-center justify-between mb-2`}>
                        <span className={`text-sm ${today ? 'text-cyber-pink font-bold drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]' : 'text-cyber-purple/80'}`}>{day}</span>
                      </div>
                      {/* Event indicators */}
                      <div className="flex flex-col space-y-1 mt-auto">
                        {dayEvents.slice(0,3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-[9px] truncate px-1 rounded-sm border-l-2 uppercase tracking-tight ${typeColorMap[event.type] || 'border-l-cyber-purple bg-cyber-purple/20 text-cyber-purple'}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-cyber-purple/60 pl-1">+{dayEvents.length - 3} MORE</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events List */}
          <div className="border border-cyber-purple/40 bg-black/80 shadow-[0_0_15px_rgba(168,85,247,0.15)] p-4 relative flex-1">
            <h3 className="text-sm tracking-widest uppercase mb-4 flex items-center space-x-2 text-cyber-pink border-b border-cyber-purple/30 pb-2">
              <Clock className="h-4 w-4" />
              <span>Active Operations</span>
            </h3>
            {filteredEvents.length === 0 ? (
              <p className="text-cyber-purple/50 text-center py-8 text-sm uppercase tracking-widest">No active protocols detected</p>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-cyber-purple/30 bg-black hover:border-cyber-pink/60 transition-all p-3 cursor-pointer relative overflow-hidden group"
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${typeDotMap[event.type] || 'bg-cyber-purple'}`}></div>
                    <div className="pl-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200 group-hover:text-cyber-pink transition-colors uppercase tracking-wider">{event.title}</h4>
                          <div className="flex items-baseline space-x-4 mt-1">
                            <span className="text-xs text-cyber-purple">T-{event.time.replace(':','')}</span>
                            <span className="text-xs text-cyber-purple/70">{event.date.toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-3">
                            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest border border-current ${typeColorMap[event.type]}`}>
                              {event.type}
                            </span>
                            <span className="text-[10px] text-cyber-purple/80 uppercase tracking-widest border border-cyber-purple/30 px-2 py-0.5">
                              DUR: {event.duration}
                            </span>
                            {event.location && (
                              <span className="flex items-center text-[10px] space-x-1 text-cyber-purple/80 uppercase tracking-widest border border-cyber-purple/30 px-2 py-0.5">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Event Form, Selected Event Details, AI Suggestions */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Selected Event Details */}
          {selectedEventId ? (
            (() => {
              const event = events.find(e => e.id === selectedEventId);
              if (!event) return null;
              return (
                <div className="border border-cyber-pink/50 bg-black/90 shadow-[0_0_20px_rgba(236,72,153,0.15)] p-5 relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyber-pink/20 to-transparent pointer-events-none"></div>
                  
                  <h3 className="text-xs tracking-widest uppercase mb-4 flex items-center space-x-2 text-cyber-pink border-b border-cyber-pink/30 pb-2">
                    <Check className="h-4 w-4" />
                    <span>Protocol Details</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">ID: {event.id}</div>
                      <h2 className="text-lg font-bold text-white uppercase tracking-wider">{event.title}</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-cyber-purple/30 p-2 bg-black">
                        <div className="text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Schedule</div>
                        <div className="flex items-center space-x-2 text-sm text-cyber-purple">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                      <div className="border border-cyber-purple/30 p-2 bg-black">
                        <div className="text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Duration</div>
                        <div className="text-sm text-cyber-purple">{event.duration}</div>
                      </div>
                    </div>

                    {event.location && (
                      <div className="border border-cyber-purple/30 p-2 bg-black">
                        <div className="text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Location Vector</div>
                        <div className="flex items-center space-x-2 text-sm text-cyber-purple">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    )}
                    
                    {event.attendees && (
                      <div className="border border-cyber-purple/30 p-2 bg-black">
                        <div className="text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Personnel</div>
                        <div className="flex items-center space-x-2 text-sm text-cyber-purple">
                          <Users className="h-3 w-3" />
                          <span>{event.attendees}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="border border-cyber-purple/30 p-3 bg-black/50">
                      <div className="text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-2">Description</div>
                      <p className="text-cyber-purple/90 text-xs leading-relaxed">{event.description || 'NO ADDITIONAL DATA'}</p>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-cyber-purple/30">
                      <button
                        onClick={() => setSelectedEventId(null)}
                        className="text-xs uppercase tracking-widest text-cyber-purple hover:text-white transition-colors border border-cyber-purple/40 px-4 py-2"
                      >
                        <X className="h-3 w-3 inline mr-2" />
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-xs uppercase tracking-widest text-cyber-red hover:bg-cyber-red/20 transition-colors border border-cyber-red/40 px-4 py-2"
                      >
                        Terminate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
             <div className="border border-cyber-purple/30 bg-black/50 p-5 text-center text-cyber-purple/50 text-xs uppercase tracking-widest border-dashed">
              Awaiting protocol selection...
            </div>
          )}

          {/* Quick Event Form */}
          <div className="border border-cyber-purple/40 bg-black/80 shadow-[0_0_15px_rgba(168,85,247,0.15)] p-5 relative">
            <h3 className="text-xs tracking-widest uppercase mb-4 flex items-center space-x-2 text-cyber-purple border-b border-cyber-purple/30 pb-2">
              <Plus className="h-4 w-4" />
              <span>Initialize Protocol</span>
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="EVENT TITLE"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-black/60 border border-cyber-purple/40 text-cyber-pink focus:outline-none focus:border-cyber-pink px-3 py-2 text-sm uppercase tracking-wider"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Date Cycle</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full bg-black/60 border border-cyber-purple/40 text-cyber-pink focus:outline-none focus:border-cyber-pink px-3 py-2 text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Time Vector</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full bg-black/60 border border-cyber-purple/40 text-cyber-pink focus:outline-none focus:border-cyber-pink px-3 py-2 text-sm uppercase"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Classification</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'work' || val === 'personal' || val === 'health' || val === 'finance') {
                        setEventForm({ ...eventForm, type: val as 'work' | 'personal' | 'health' | 'finance' });
                      }
                    }}
                    className="w-full bg-black/60 border border-cyber-purple/40 text-cyber-pink focus:outline-none focus:border-cyber-pink px-3 py-2 text-sm uppercase"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Duration</label>
                  <select
                    value={eventForm.duration}
                    onChange={(e) => setEventForm({ ...eventForm, duration: e.target.value })}
                    className="w-full bg-black/60 border border-cyber-purple/40 text-cyber-pink focus:outline-none focus:border-cyber-pink px-3 py-2 text-sm uppercase"
                  >
                    <option value="15m">15m</option>
                    <option value="30m">30m</option>
                    <option value="45m">45m</option>
                    <option value="1h">1h</option>
                    <option value="1.5h">1.5h</option>
                    <option value="2h">2h</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Coordinates</label>
                <input
                  type="text"
                  placeholder="LOCATION"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full bg-black/60 border border-cyber-purple/40 text-cyber-pink focus:outline-none focus:border-cyber-pink px-3 py-2 text-sm uppercase tracking-wider"
                />
              </div>
              <div>
                <label className="block text-[10px] text-cyber-purple/70 uppercase tracking-widest mb-1">Parameters</label>
                <textarea
                  placeholder="DESCRIPTION"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full bg-black/60 border border-cyber-purple/40 text-cyber-pink focus:outline-none focus:border-cyber-pink px-3 py-2 text-sm uppercase tracking-wider"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cyber-purple/20 hover:bg-cyber-purple/40 border border-cyber-purple text-cyber-pink rounded-sm py-2 text-xs uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]"
              >
                Execute Initialization
              </button>
            </form>
          </div>

          {/* AI Suggestions */}
          <div className="border border-cyber-yellow/40 bg-black/80 shadow-[0_0_15px_rgba(234,179,8,0.1)] p-5 relative">
            <h3 className="text-xs tracking-widest uppercase mb-4 flex items-center space-x-2 text-cyber-yellow border-b border-cyber-yellow/30 pb-2">
              <Zap className="h-4 w-4" />
              <span>System Insights</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 bg-cyber-yellow/5 border border-cyber-yellow/20 p-2">
                <AlertCircle className="h-4 w-4 text-cyber-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-cyber-yellow/80 text-xs uppercase tracking-wider leading-relaxed">Schedule load suboptimal on May 22. Recommending injection of 2-hour deep-work focus node.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-cyber-yellow/5 border border-cyber-yellow/20 p-2">
                <AlertCircle className="h-4 w-4 text-cyber-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-cyber-yellow/80 text-xs uppercase tracking-wider leading-relaxed">Spatial conflict detected: 0900 meeting overlaps with transit from physical training facility. Adjustment required.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="relative z-10 mt-6 border-t border-cyber-purple/40 pt-4 text-[10px] uppercase tracking-widest flex justify-between items-center text-cyber-purple/70">
        <span className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-cyber-green animate-pulse"></span>
          <span>{events.length} Nodes Active · System Optimized</span>
        </span>
        <span className="flex items-center space-x-2">
          <Clock className="h-3 w-3" />
          <span>Local Sync: {new Date().toLocaleTimeString()}</span>
        </span>
      </div>
    </div>
  );
};