import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, GraduationCap, BookOpen, Building2,
  DollarSign, Award, Clock, TrendingUp
} from 'lucide-react';

import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import { studentAPI, facultyAPI, analyticsAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const role =
    user?.role === 'admin'
      ? 'Admin'
      : user?.role === 'faculty'
      ? 'Faculty'
      : 'Student';

  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [aRes, sRes, fRes] = await Promise.all([
          analyticsAPI.getAll(),
          studentAPI.getAll(),
          facultyAPI.getAll(),
        ]);

        setAnalytics(aRes.data.data);
        setStudents(sRes.data.data);
        setFaculty(fRes.data.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    load();
  }, []);

  // ✅ Improved Loading UI
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <LoadingSpinner size="lg" color="purple" />
          <p className="text-nexura-text-dim text-sm">
            Loading dashboard...
          </p>
        </div>
      </PageTransition>
    );
  }

  const overview = analytics?.overview || {};

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold gradient-text mb-2">
              {role} Dashboard
            </h1>
            <p className="text-nexura-text-dim">
              Welcome to the NEXURA control center, {user?.name}
            </p>
          </div>

          <AnimatePresence mode="wait">

            {/* ================= ADMIN ================= */}
            {role === 'Admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard label="Total Students" value={overview.totalStudents || 20} icon={GraduationCap} color="cyan" />
                  <StatCard label="Total Faculty" value={overview.totalFaculty || 8} icon={Users} color="purple" />
                  <StatCard label="Courses" value={overview.totalCourses || 12} icon={BookOpen} color="pink" />
                  <StatCard label="Rooms" value={overview.totalRooms || 6} icon={Building2} color="emerald" />
                </div>

                {/* Department + Fees */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-nexura-cyan" />
                      Department Overview
                    </h3>

                    <div className="space-y-4">
                      {analytics?.departmentStats &&
                        Object.entries(analytics.departmentStats).map(([dept, data]) => (
                          <div key={dept} className="flex justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5">
                            <div>
                              <span className="font-semibold">{dept}</span>
                              <div className="text-xs mt-1">
                                {data.students} students · {data.faculty} faculty
                              </div>
                            </div>
                            <span className="text-sm text-nexura-cyan">
                              CGPA: {data.avgCGPA}
                            </span>
                          </div>
                        ))}
                    </div>
                  </GlassCard>

                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      Fee Collection
                    </h3>

                    {analytics?.feeStats && (
                      <>
                        <div className="text-2xl font-bold text-emerald-400 mb-2">
                          {analytics.feeStats.collectionRate}%
                        </div>

                        <div className="w-full bg-white/5 h-3 rounded-full mb-4">
                          <div
                            className="h-3 bg-emerald-500 rounded-full"
                            style={{
                              width: `${analytics.feeStats.collectionRate}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* ================= STUDENT ================= */}
            {role === 'Student' && (
              <motion.div key="student" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlassCard>
                  <h2 className="text-xl font-bold mb-4">
                    Welcome {user?.name}
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <StatCard label="CGPA" value={8.7} icon={Award} />
                    <StatCard label="Courses" value={4} icon={BookOpen} />
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* ================= FACULTY ================= */}
            {role === 'Faculty' && (
              <motion.div key="faculty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlassCard>
                  <h2 className="text-xl font-bold mb-4">
                    Faculty Panel
                  </h2>

                  {faculty.map((f) => (
                    <div key={f.employeeId} className="p-3 border-b">
                      {f.name}
                    </div>
                  ))}
                </GlassCard>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}