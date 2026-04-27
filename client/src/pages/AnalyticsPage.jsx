import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart as PieIcon, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend } from 'recharts';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { analyticsAPI } from '../lib/api';

const COLORS = ['#00f0ff', '#a855f7', '#f472b6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-lg p-3 text-sm border border-white/10">
        <p className="text-nexura-text font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-nexura-text-dim">{p.name}: <span style={{ color: p.color }} className="font-semibold">{p.value}{p.name === 'Utilization' ? '%' : ''}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getAll()
      .then(r => setAnalytics(r.data.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageTransition><div className="min-h-screen pt-24"><LoadingSpinner text="Loading analytics..." /></div></PageTransition>;

  const workloadData = analytics?.facultyWorkload?.map(f => ({
    name: f.name.split(' ').pop(),
    hours: f.hoursPerWeek,
    maxHours: f.maxHours,
    utilization: f.utilization
  })) || [];

  const roomData = analytics?.roomUtilization?.map(r => ({
    name: r.room,
    utilization: r.utilization,
    capacity: r.capacity,
    type: r.type
  })) || [];

  const deptData = analytics?.departmentStats ? Object.entries(analytics.departmentStats).map(([dept, d]) => ({
    name: dept,
    students: d.students,
    faculty: d.faculty,
    courses: d.courses,
    avgCGPA: d.avgCGPA
  })) : [];

  const avgUtilization = workloadData.length > 0 ? Math.round(workloadData.reduce((s, w) => s + w.utilization, 0) / workloadData.length) : 0;

  const conflictData = [{ name: 'Resolution', value: 97, fill: '#10b981' }];

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold gradient-text mb-2">Analytics Dashboard</h1>
            <p className="text-nexura-text-dim">Faculty workload, room utilization, and conflict analysis</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Avg Faculty Load', value: `${avgUtilization}%`, icon: TrendingUp, color: 'text-cyan-400' },
              { label: 'Rooms Available', value: roomData.length, icon: PieIcon, color: 'text-purple-400' },
              { label: 'Departments', value: deptData.length, icon: BarChart3, color: 'text-pink-400' },
              { label: 'Conflict Resolution', value: '97%', icon: Activity, color: 'text-emerald-400' },
            ].map((item, i) => (
              <GlassCard key={i} delay={i * 0.1}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-nexura-text-muted">{item.label}</span>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className={`text-2xl font-bold font-display ${item.color}`}>{item.value}</div>
              </GlassCard>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Faculty Workload */}
            <GlassCard hover={false}>
              <h3 className="text-lg font-semibold text-nexura-text mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-nexura-cyan" /> Faculty Workload (hrs/week)
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="hours" name="Hours" radius={[6, 6, 0, 0]} fill="url(#cyanGradient)" />
                    <defs>
                      <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Room Utilization Pie */}
            <GlassCard hover={false}>
              <h3 className="text-lg font-semibold text-nexura-text mb-6 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-purple-400" /> Room Utilization
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roomData} dataKey="capacity" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3} label={({ name }) => name}>
                      {roomData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.7} stroke="rgba(255,255,255,0.1)" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Department Comparison + Conflict Gauge */}
          <div className="grid lg:grid-cols-2 gap-6">
            <GlassCard hover={false}>
              <h3 className="text-lg font-semibold text-nexura-text mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-400" /> Department Comparison
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="students" name="Students" fill="#00f0ff" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                    <Bar dataKey="faculty" name="Faculty" fill="#a855f7" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                    <Bar dataKey="courses" name="Courses" fill="#f472b6" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Conflict Resolution Gauge */}
            <GlassCard hover={false}>
              <h3 className="text-lg font-semibold text-nexura-text mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Conflict Resolution Rate
              </h3>
              <div className="h-72 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="80%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={conflictData} startAngle={180} endAngle={0}>
                    <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} fill="#10b981" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="text-center -mt-16">
                  <div className="text-4xl font-bold font-display text-emerald-400">97%</div>
                  <div className="text-sm text-nexura-text-dim mt-1">Conflicts Resolved by AI</div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Detailed Faculty Table */}
          <GlassCard hover={false} className="mt-8">
            <h3 className="text-lg font-semibold text-nexura-text mb-4">Faculty Workload Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-nexura-text-muted text-xs uppercase border-b border-white/5">
                    <th className="text-left pb-3 pr-4">Faculty</th>
                    <th className="text-left pb-3 pr-4">Department</th>
                    <th className="text-left pb-3 pr-4">Hours/Week</th>
                    <th className="text-left pb-3 pr-4">Max Hours</th>
                    <th className="text-left pb-3">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.facultyWorkload?.map((f, i) => (
                    <motion.tr key={f.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-white/3">
                      <td className="py-3 pr-4 text-nexura-text">{f.name}</td>
                      <td className="py-3 pr-4"><span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400">{f.department}</span></td>
                      <td className="py-3 pr-4 text-nexura-text">{f.hoursPerWeek}</td>
                      <td className="py-3 pr-4 text-nexura-text-dim">{f.maxHours}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${f.utilization}%` }} transition={{ duration: 1, delay: i * 0.1 }} className={`h-full rounded-full ${f.utilization > 80 ? 'bg-red-500' : f.utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          </div>
                          <span className="text-xs text-nexura-text-dim">{f.utilization}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
