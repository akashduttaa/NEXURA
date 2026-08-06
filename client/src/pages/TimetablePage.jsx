import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, AlertTriangle, CheckCircle, RefreshCw, UserX, Sparkles, Search, FileDown, Printer, History, Trash2 } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { timetableAPI, facultyAPI } from '../lib/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_LABELS = ['9:00-9:50', '10:00-10:50', '11:00-11:50', '12:00-12:50', '1:30-2:20', '2:30-3:20', '3:30-4:20', '4:30-5:20'];

const courseColors = {
  'CS301': 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300',
  'CS302': 'bg-purple-500/20 border-purple-500/30 text-purple-300',
  'CS303': 'bg-pink-500/20 border-pink-500/30 text-pink-300',
  'CS304': 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  'CS305': 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  'CS306': 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  'CS307': 'bg-rose-500/20 border-rose-500/30 text-rose-300',
  'EC301': 'bg-teal-500/20 border-teal-500/30 text-teal-300',
  'EC302': 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
  'EC303': 'bg-violet-500/20 border-violet-500/30 text-violet-300',
  'ME301': 'bg-orange-500/20 border-orange-500/30 text-orange-300',
  'ME302': 'bg-lime-500/20 border-lime-500/30 text-lime-300',
};

import { useAuthStore } from '../store/authStore';

export default function TimetablePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [timetable, setTimetable] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedUnavailable, setSelectedUnavailable] = useState([]);
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCurrentTimetable = () => {
    timetableAPI.getCurrent().then(r => {
      if (r.data.success && r.data.data) {
        setTimetable(r.data.data);
      } else {
        setTimetable(null);
      }
    }).catch(() => setTimetable(null));
  };

  const loadHistory = () => {
    timetableAPI.getHistory().then(r => {
      if (r.data.success && r.data.data) {
        setHistory(r.data.data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    facultyAPI.getAll().then(r => setFaculty(r.data.data)).catch(() => {});
    loadCurrentTimetable();
    if (isAdmin) {
      loadHistory();
    }
  }, [isAdmin]);

  const handleGenerate = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const res = await timetableAPI.generate({});
      if (res.data.success) {
        setTimetable(res.data.data);
        loadHistory();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSimulate = async () => {
    if (selectedUnavailable.length === 0) return;
    setSimulating(true);
    try {
      const res = await timetableAPI.simulateChange(selectedUnavailable);
      if (res.data.success) {
        setTimetable(res.data.data);
        loadHistory();
      }
    } catch (e) { console.error(e); }
    setSimulating(false);
  };

  const toggleFaculty = (id) => {
    setSelectedUnavailable(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleActivateSchedule = async (id) => {
    try {
      const res = await timetableAPI.activate(id);
      if (res.data.success) {
        loadCurrentTimetable();
        loadHistory();
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      const res = await timetableAPI.delete(id);
      if (res.data.success) {
        loadHistory();
        loadCurrentTimetable();
      }
    } catch (e) { console.error(e); }
  };

  const handleExportCSV = () => {
    if (!timetable?.entries) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Day,Time Slot,Time,Course Code,Course Name,Faculty Name,Room Number,Type\n";
    
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedEntries = [...timetable.entries].sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.timeSlot - b.timeSlot;
    });
    
    sortedEntries.forEach(e => {
      const timeLabel = TIME_LABELS[e.timeSlot - 1] || '';
      const row = [
        e.day,
        e.timeSlot,
        `"${timeLabel}"`,
        e.courseCode,
        `"${e.courseName}"`,
        `"${e.facultyName}"`,
        e.roomNumber,
        e.type
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timetable_${timetable.department || 'all'}_sem${timetable.semester || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const getEntry = (day, slot) => {
    if (!timetable?.entries) return null;
    const entry = timetable.entries.find(e => e.day === day && e.timeSlot === slot);
    if (!entry) return null;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        entry.courseCode.toLowerCase().includes(q) ||
        (entry.courseName && entry.courseName.toLowerCase().includes(q)) ||
        (entry.facultyName && entry.facultyName.toLowerCase().includes(q)) ||
        (entry.roomNumber && entry.roomNumber.toLowerCase().includes(q));
      return match ? entry : null;
    }
    return entry;
  };

  const conflictPct = timetable?.conflictPercentage || 0;

  return (
    <PageTransition>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-timetable, #printable-timetable * {
            visibility: visible;
          }
          #printable-timetable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: black !important;
            color: white !important;
          }
          .glass {
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            background: rgba(255, 255, 255, 0.03) !important;
          }
        }
      `}</style>
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold gradient-text mb-2">AI Timetable Generator</h1>
              <p className="text-nexura-text-dim">Genetic Algorithm with 300 generations × 60 population size</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <>
                  <NeonButton onClick={handleGenerate} loading={loading} icon={Sparkles}>
                    Generate Timetable
                  </NeonButton>
                  <NeonButton onClick={() => setShowHistoryPanel(!showHistoryPanel)} variant="ghost" icon={History}>
                    History ({history.length})
                  </NeonButton>
                  <NeonButton onClick={() => setShowSimPanel(!showSimPanel)} variant="ghost" icon={RefreshCw}>
                    Simulate Change
                  </NeonButton>
                </>
              )}
              {timetable && (
                <>
                  <NeonButton onClick={handleExportCSV} variant="emerald" icon={FileDown}>
                    Export CSV
                  </NeonButton>
                  <NeonButton onClick={handlePrint} variant="purple" icon={Printer}>
                    Print / PDF
                  </NeonButton>
                </>
              )}
            </div>
          </div>

          {/* Simulate Change Panel */}
          <AnimatePresence>
            {showSimPanel && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <GlassCard hover={false} className="mb-6 border-amber-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <UserX className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-nexura-text">Simulate Faculty Unavailability</h3>
                  </div>
                  <p className="text-sm text-nexura-text-dim mb-4">Select faculty members to mark as unavailable, then regenerate the timetable.</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {faculty.map(f => {
                      const selected = selectedUnavailable.includes(f.employeeId);
                      return (
                        <button
                          key={f.employeeId}
                          onClick={() => toggleFaculty(f.employeeId)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selected ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-white/5 border border-white/10 text-nexura-text-dim hover:border-white/20'}`}
                        >
                          {selected && <UserX className="w-3.5 h-3.5 inline mr-1.5" />}
                          {f.name}
                        </button>
                      );
                    })}
                  </div>
                  <NeonButton onClick={handleSimulate} loading={simulating} variant="purple" icon={RefreshCw} disabled={selectedUnavailable.length === 0}>
                    Regenerate Timetable
                  </NeonButton>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && <LoadingSpinner text="Running Genetic Algorithm... Evolving 300 generations" />}

          {/* Main Layout containing Grid and History Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Content Area: Grid, Legend, and Empty State */}
            <div className="flex-1 w-full min-w-0" id="printable-timetable">
              {timetable && !loading && (
                <div className="space-y-6">
                  {/* Search grid filter */}
                  <GlassCard hover={false} className="py-2.5 px-4 border-white/5 flex items-center gap-3">
                    <Search className="w-4 h-4 text-nexura-cyan shrink-0" />
                    <input
                      type="text"
                      placeholder="Filter grid by Course (e.g. CS301), Instructor (e.g. Dr. Arjun), Room (e.g. LH-101)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-0 text-sm text-nexura-text placeholder-nexura-text-muted focus:ring-0 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-nexura-text-muted hover:text-white shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </GlassCard>

                  {/* Conflict Indicator */}
                  <GlassCard hover={false}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {conflictPct === 0 ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-amber-400" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-nexura-text">
                            {conflictPct === 0 ? 'No Conflicts Detected!' : `${timetable.conflictCount} Conflict(s) Found`}
                          </h3>
                          <p className="text-sm text-nexura-text-dim">{timetable.totalSlots} total slots · Fitness score: {timetable.fitness}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-nexura-text-muted">Conflict Rate</div>
                          <div className={`text-2xl font-bold font-display ${conflictPct === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{conflictPct}%</div>
                        </div>
                        <div className="w-24 h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${100 - conflictPct}%` }} transition={{ duration: 1 }} className={`h-full rounded-full ${conflictPct === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        </div>
                      </div>
                    </div>

                    {timetable.conflicts?.length > 0 && (
                      <div className="mt-4 space-y-1">
                        {timetable.conflicts.slice(0, 5).map((c, i) => (
                          <div key={i} className="text-xs text-amber-400/80 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 shrink-0" /> {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>

                  {/* Grid */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                      <div className="grid grid-cols-[100px_repeat(6,1fr)] gap-1">
                        {/* Header */}
                        <div className="p-2" />
                        {DAYS.map(day => (
                          <div key={day} className="p-3 text-center text-sm font-semibold text-nexura-cyan glass rounded-lg">
                            {day.slice(0, 3)}
                          </div>
                        ))}

                        {/* Time slots */}
                        {TIME_LABELS.map((label, slotIdx) => (
                          <div key={`row-${slotIdx}`} className="contents">
                            <div className="p-2 text-xs text-nexura-text-muted flex items-center justify-center">
                              {label}
                            </div>
                            {DAYS.map(day => {
                              const entry = getEntry(day, slotIdx + 1);
                              return (
                                <motion.div
                                  key={`${day}-${slotIdx}`}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: (slotIdx * 6 + DAYS.indexOf(day)) * 0.005 }}
                                  className={`p-2 rounded-lg min-h-[70px] border transition-all duration-200 ${entry ? `${courseColors[entry.courseCode] || 'bg-white/5 border-white/10 text-white'} hover:scale-[1.02]` : 'bg-white/2 border-white/5'}`}
                                >
                                  {entry && (
                                    <div className="text-xs">
                                      <div className="font-semibold truncate">{entry.courseCode}</div>
                                      <div className="opacity-70 truncate mt-0.5">{entry.courseName?.split(' ').slice(0, 2).join(' ')}</div>
                                      <div className="opacity-70 truncate font-mono text-[10px] mt-0.5 text-nexura-cyan">{entry.facultyName?.split(' ').pop()}</div>
                                      <div className="opacity-50 truncate mt-0.5">{entry.roomNumber}</div>
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <GlassCard hover={false}>
                    <h4 className="text-sm font-semibold text-nexura-text mb-3">Course Legend</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(courseColors).map(([code, cls]) => (
                        <span key={code} className={`px-3 py-1 rounded-lg text-xs border ${cls}`}>{code}</span>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* Empty state */}
              {!timetable && !loading && (
                <GlassCard hover={false} className="text-center py-16">
                  <Calendar className="w-16 h-16 text-nexura-cyan/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-nexura-text mb-2">No Timetable Generated Yet</h3>
                  <p className="text-nexura-text-dim mb-6">
                    {isAdmin ? 'Click "Generate Timetable" to run the AI optimization engine' : 'An administrator has not generated the timetable yet.'}
                  </p>
                  {isAdmin && <NeonButton onClick={handleGenerate} icon={Sparkles}>Generate Now</NeonButton>}
                </GlassCard>
              )}
            </div>

            {/* Right Content Area: Saved Versions Sidebar */}
            <AnimatePresence>
              {showHistoryPanel && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: 50, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: 50, width: 0 }}
                  className="w-full lg:w-80 shrink-0"
                >
                  <GlassCard hover={false} className="h-full border-cyan-500/20">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-nexura-text flex items-center gap-2">
                        <History className="w-5 h-5 text-nexura-cyan" /> Saved Versions
                      </h3>
                      <button onClick={() => setShowHistoryPanel(false)} className="text-nexura-text-muted hover:text-white text-xs">
                        Close
                      </button>
                    </div>
                    
                    {history.length === 0 ? (
                      <p className="text-sm text-nexura-text-dim text-center py-8">No saved configurations.</p>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                        {history.map((h) => (
                          <div
                            key={h._id}
                            className={`p-3 rounded-lg border text-left transition-all relative group ${
                              h.isActive 
                                ? 'bg-cyan-500/10 border-cyan-500/40 text-white' 
                                : 'bg-white/5 border-white/10 text-nexura-text-dim hover:border-white/20'
                            }`}
                          >
                            <div className="text-xs font-semibold text-nexura-cyan flex items-center justify-between">
                              <span>{h.department} · Sem {h.semester}</span>
                              {h.isActive && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[9px] font-semibold text-emerald-300 uppercase tracking-wider">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-nexura-text-muted mt-0.5">
                              {new Date(h.generatedAt).toLocaleString()}
                            </div>
                            <div className="text-[11px] mt-1.5 flex justify-between items-center text-nexura-text-dim">
                              <span>Fitness: {h.fitness}</span>
                              <span className={h.conflicts === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                                Conflicts: {h.conflicts}
                              </span>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center gap-2">
                              {!h.isActive && (
                                <button
                                  onClick={() => handleActivateSchedule(h._id)}
                                  className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/35 text-[10px] font-semibold text-cyan-300 transition-all cursor-pointer"
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteSchedule(h._id)}
                                className="p-1 rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 opacity-60 group-hover:opacity-100 transition-all ml-auto cursor-pointer"
                                title="Delete schedule"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
