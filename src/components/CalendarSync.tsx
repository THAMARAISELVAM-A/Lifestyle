import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, X, ChevronLeft, ChevronRight, MapPin, Users, Zap, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NeonDB } from '../services/db';

export const CalendarSync: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [_selectedDate, setSelectedDate] = useState<Date | null>(null); // setSelectedDate used for day-cell tap tracking

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
        const rows: any[] = await NeonDB.getAll('calendar_events', user.id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } as any) // Nelenwrap
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
    <div className="flex flex-col h-full bg-cyber-bg text-slate-100 p-6">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-5 w-5 text-cyber-blue" />
          <div>
            <h2 className="text-xl font-bold">Smart Calendar & Planner</h2>
            <p className="text-sm text-cyber-muted">AI-powered scheduling synced with Google Calendar</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={prevMonth} className="p-2 rounded hover:bg-white/10">
            <ChevronLeft className="h-4 w-4 text-cyber-blue" />
          </button>
          <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button onClick={nextMonth} className="p-2 rounded hover:bg-white/10">
            <ChevronRight className="h-4 w-4 text-cyber-blue" />
          </button>
        </div>
      </div>

      {/* Search + Quick Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full max-w-xs"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 rounded text-sm bg-white/5 hover:bg-white/10">All</button>
          <button className="px-3 py-1 rounded text-sm bg-white/5 hover:bg-white/10">Work</button>
          <button className="px-3 py-1 rounded text-sm bg-white/5 hover:bg-white/10">Personal</button>
          <button className="px-3 py-1 rounded text-sm bg-white/5 hover:bg-white/10">Health</button>
          <button className="px-3 py-1 rounded text-sm bg-white/5 hover:bg-white/10">Finance</button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Calendar and Events List */}
        <div className="lg:col-span-8">
          {/* Calendar Grid */}
          <div className="glass-panel rounded-xl p-4 mb-6">
            {/* Day names */}
            <div className="grid grid-cols-7 text-center text-sm text-cyber-muted mb-4">
              {dayNames.map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>
            {/* Day slots */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for the first day offset */}
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={i} className="h-12"></div>
              ))}
              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const today = isToday(day);
                return (
                  <div
                    key={day}
                    className={`cursor-pointer rounded-lg p-2 hover:bg-white/5 transition-colors ${today ? 'border border-cyber-purple' : ''}`}
                    onClick={() => {
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      setSelectedDate(date);
                    }}
                  >
                    <div className="flex w-full h-full flex-col">
                      <div className={`flex items-center justify-between mb-1 ${today ? 'font-semibold text-cyber-purple' : ''}`}>
                        <span className="text-xs">{day}</span>
                        {/* Mini event dots */}
                        <div className="flex space-x-1">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`h-2 w-2 rounded-full ${typeDotMap[event.type]} `}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events List */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              Upcoming Events
              <Clock className="h-4 w-4 text-cyber-blue" />
            </h3>
            {filteredEvents.length === 0 ? (
              <p className="text-cyber-muted text-center py-8">No events found</p>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="glass-panel bg-white/5 border-white/5 rounded-xl p-4 space-y-3 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`flex-1 ${typeColorMap[event.type]}`}>
                        <h4 className="font-semibold">{event.title}</h4>
                        <div className="flex items-baseline space-x-3 mt-1">
                          <span className="text-xs font-mono text-cyber-muted">{event.time}</span>
                          <span className="text-xs font-mono text-cyber-muted">{event.date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${typeDotMap[event.type]}`}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </span>
                          <span className="text-xs text-cyber-muted">{event.duration}</span>
                          {event.location && (
                            <span className="flex items-center text-xs space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </span>
                          )}
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
        <div className="lg:col-span-4">
          {/* Quick Event Form */}
          <div className="glass-panel rounded-2xl p-5 border-cyber-border shadow-glass mb-6">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              Schedule Event
              <Plus className="h-4 w-4 text-cyber-blue" />
            </h3>
            {/* In a real app, we would have toggles for Daily/Weekly/Monthly, but we'll just show them as buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button className="px-3 py-1 rounded text-sm bg-white/5 hover:bg-white/10">Daily</button>
              <button className="px-3 py-1 rounded text-sm bg-white/5 hover:bg-white/10">Weekly</button>
              <button className="px-3 py-1 rounded text-sm bg-white/5 hover:bg-white/10">Monthly</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Event title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="glass-input w-full"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="glass-input"
                />
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={eventForm.type}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'work' || val === 'personal' || val === 'health' || val === 'finance') {
                      setEventForm({ ...eventForm, type: val as 'work' | 'personal' | 'health' | 'finance' });
                    }
                  }}
                  className="glass-input"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                </select>
                <select
                  value={eventForm.duration}
                  onChange={(e) => setEventForm({ ...eventForm, duration: e.target.value })}
                  className="glass-input"
                >
                  <option value="15m">15m</option>
                  <option value="30m">30m</option>
                  <option value="45m">45m</option>
                  <option value="1h">1h</option>
                  <option value="1.5h">1.5h</option>
                  <option value="2h">2h</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Location"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="glass-input"
              />
              <textarea
                placeholder="Description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="glass-input"
                rows={3}
              />
              <button
                type="submit"
                className="w-full bg-cyber-blue/20 hover:bg-cyber-blue/30 border-cyber-blue/40 text-white rounded-xl py-2"
              >
                Save Event
              </button>
            </form>
          </div>

          {/* Selected Event Details */}
          {selectedEventId ? (
            (() => {
              const event = events.find(e => e.id === selectedEventId);
              if (!event) return null;
              return (
                <div className="glass-panel rounded-2xl p-5 border-cyber-border shadow-glass mb-6">
                  <h3 className="font-semibold mb-4 flex items-center space-x-2">
                    Event Details
                    <Check className="h-4 w-4 text-cyber-green" />
                  </h3>
                  <div className="space-y-4">
                    <div className={`flex items-start ${typeColorMap[event.type]}`}>
                      <h2 className="text-lg font-bold">{event.title}</h2>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-cyber-muted">
                      <Clock className="h-3 w-3" />
                      <span>{event.time} · {event.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-xs bg-cyber-yellow/20`}>
                        {event.duration}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-2 text-sm text-cyber-muted">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.attendees && (
                      <div className="flex items-center space-x-2 text-sm text-cyber-muted">
                        <Users className="h-3 w-3" />
                        <span>{event.attendees}</span>
                      </div>
                    )}
                    <p className="text-cyber-muted text-xs">{event.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => setSelectedEventId(null)}
                        className="text-sm text-cyber-cyan hover:text-cyber-cyan/80"
                      >
                        <X className="h-4 w-4" />
                        Close
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-sm text-cyber-red hover:text-cyber-red/80"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="glass-panel rounded-2xl p-5 border-cyber-border shadow-glass mb-6 text-center text-cyber-muted">
              Select an event from the calendar
            </div>
          )}

          {/* AI Suggestions */}
          <div className="glass-panel rounded-2xl p-5 border-cyber-border shadow-glass">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              AI Calendar Intelligence
              <Zap className="h-4 w-4 text-cyber-yellow" />
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 text-cyber-yellow/50 flex-shrink-0" />
                <div>
                  <p className="text-cyber-muted">Your schedule is light on May 22 — AI suggests adding a 2-hour focus deep-work block.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 text-cyber-yellow/50 flex-shrink-0" />
                <div>
                  <p className="text-cyber-muted">Meeting at 9:00 AM overlaps with commute time from gym. Consider rescheduling to 10:00 AM.</p>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4">
                <blockquote className="italic text-cyber-muted text-sm">
                  "Your time is your most valuable asset. Protect it wisely."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-6 glass-panel rounded-xl p-4 text-xs flex justify-between items-center">
        <span className="flex items-center space-x-2">
          <Zap className="h-3 w-3 text-cyber-yellow" />
          <span>3 events today · AI optimized timing applied</span>
        </span>
        <span className="flex items-center space-x-2">
          <Clock className="h-3 w-3 text-cyber-blue" />
          <span>Timezone: PST (UTC-7)</span>
        </span>
      </div>
    </div>
  );
};