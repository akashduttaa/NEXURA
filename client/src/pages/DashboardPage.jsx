import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  DollarSign,
  Award,
  Clock,
  TrendingUp,
} from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import GlassCard from "../components/ui/GlassCard";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { studentAPI, facultyAPI, analyticsAPI } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "faculty"
        ? "Faculty"
        : "Student";
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

  if (loading)
    return (
      <PageTransition>
        <div className="min-h-screen pt-24">
          <LoadingSpinner text="Loading dashboard..." />
        </div>
      </PageTransition>
    );

  const overview = analytics?.overview || {};

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-display font-bold gradient-text mb-2">
              {role} Dashboard
            </h1>
            <p className="text-nexura-text-dim text-sm sm:text-base">
              Welcome to the NEXURA control center, {user?.name}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {role === "Admin" && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                  <StatCard
                    label="Total Students"
                    value={overview.totalStudents || 20}
                    icon={GraduationCap}
                    color="cyan"
                    delay={0}
                  />
                  <StatCard
                    label="Total Faculty"
                    value={overview.totalFaculty || 8}
                    icon={Users}
                    color="purple"
                    delay={0.1}
                  />
                  <StatCard
                    label="Courses"
                    value={overview.totalCourses || 12}
                    icon={BookOpen}
                    color="pink"
                    delay={0.2}
                  />
                  <StatCard
                    label="Rooms"
                    value={overview.totalRooms || 6}
                    icon={Building2}
                    color="emerald"
                    delay={0.3}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <GlassCard hover={false}>
                    <h3 className="text-base sm:text-lg font-semibold text-nexura-text mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-nexura-cyan" />{" "}
                      Department Overview
                    </h3>
                    <div className="space-y-3">
                      {analytics?.departmentStats &&
                        Object.entries(analytics.departmentStats).map(
                          ([dept, data]) => (
                            <div
                              key={dept}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors"
                            >
                              <div>
                                <span className="font-semibold text-nexura-text text-sm">
                                  {dept}
                                </span>
                                <div className="text-xs text-nexura-text-muted mt-0.5">
                                  {data.students} students · {data.faculty}{" "}
                                  faculty · {data.courses} courses
                                </div>
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-nexura-cyan shrink-0">
                                Avg CGPA: {data.avgCGPA}
                              </span>
                            </div>
                          ),
                        )}
                    </div>
                  </GlassCard>

                  <GlassCard hover={false}>
                    <h3 className="text-base sm:text-lg font-semibold text-nexura-text mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" /> Fee
                      Collection
                    </h3>
                    {analytics?.feeStats && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-nexura-text-dim text-sm">
                            Collection Rate
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-display">
                            {analytics.feeStats.collectionRate}%
                          </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${analytics.feeStats.collectionRate}%`,
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <div className="text-xs text-nexura-text-muted mb-1">
                              Paid
                            </div>
                            <div className="text-base sm:text-lg font-bold text-emerald-400">
                              {analytics.feeStats.paid}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                            <div className="text-xs text-nexura-text-muted mb-1">
                              Unpaid
                            </div>
                            <div className="text-base sm:text-lg font-bold text-red-400">
                              {analytics.feeStats.unpaid}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-nexura-text-dim">
                          Total Collected:{" "}
                          <span className="text-emerald-400 font-semibold">
                            ₹
                            {(
                              analytics.feeStats.totalCollected || 0
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </div>

                <GlassCard hover={false}>
                  <h3 className="text-base sm:text-lg font-semibold text-nexura-text mb-4">
                    Recent Students
                  </h3>

                  /* Mobile card list */
                  <div className="flex flex-col gap-3 sm:hidden">
                    {students.slice(0, 8).map((s, i) => (
                      <motion.div
                        key={s.rollNo}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-lg bg-white/3 border border-white/5"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-nexura-text font-medium text-sm">
                            {s.name}
                          </span>
                          <StatusBadge
                            status={s.feesPaid ? "verified" : "warning"}
                            label={s.feesPaid ? "Paid" : "Unpaid"}
                          />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-nexura-text-dim text-xs">
                            {s.rollNo}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-nexura-cyan/10 text-nexura-cyan">
                            {s.department}
                          </span>
                          <span className="text-xs text-nexura-text-muted">
                            CGPA: {s.cgpa}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  /* Desktop table */
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-nexura-text-muted text-xs uppercase border-b border-white/5">
                          <th className="text-left pb-3 pr-4">Name</th>
                          <th className="text-left pb-3 pr-4">Roll No</th>
                          <th className="text-left pb-3 pr-4">Dept</th>
                          <th className="text-left pb-3 pr-4">CGPA</th>
                          <th className="text-left pb-3">Fees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.slice(0, 8).map((s, i) => (
                          <motion.tr
                            key={s.rollNo}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-white/3 hover:bg-white/3 transition-colors"
                          >
                            <td className="py-3 pr-4 text-nexura-text">
                              {s.name}
                            </td>
                            <td className="py-3 pr-4 font-mono text-nexura-text-dim text-xs">
                              {s.rollNo}
                            </td>
                            <td className="py-3 pr-4">
                              <span className="px-2 py-1 rounded text-xs bg-nexura-cyan/10 text-nexura-cyan">
                                {s.department}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-nexura-text">
                              {s.cgpa}
                            </td>
                            <td className="py-3">
                              <StatusBadge
                                status={s.feesPaid ? "verified" : "warning"}
                                label={s.feesPaid ? "Paid" : "Unpaid"}
                              />
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {role === "Student" && (
              <motion.div
                key="student"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard hover={false} className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-nexura-text">
                        Aarav Patel
                      </h2>
                      <p className="text-nexura-text-dim text-xs sm:text-sm">
                        CSE2024001 · CSE · Semester 3
                      </p>
                    </div>
                    <StatusBadge
                      status="verified"
                      label="Active"
                      className="self-start sm:self-center"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                      label="CGPA"
                      value={8.7}
                      icon={Award}
                      color="cyan"
                    />
                    <StatCard
                      label="Courses"
                      value={4}
                      icon={BookOpen}
                      color="purple"
                      delay={0.1}
                    />
                    <StatCard
                      label="Semester"
                      value={3}
                      icon={Clock}
                      color="pink"
                      delay={0.2}
                    />
                    <StatCard
                      label="Fee Status"
                      value="Paid"
                      icon={DollarSign}
                      color="emerald"
                      delay={0.3}
                    />
                  </div>
                </GlassCard>
                <GlassCard hover={false}>
                  <h3 className="text-base sm:text-lg font-semibold mb-4">
                    Enrolled Courses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Data Structures & Algorithms",
                      "Operating Systems",
                      "Database Management Systems",
                      "Web Technologies Lab",
                    ].map((c, i) => (
                      <div
                        key={i}
                        className="p-3 sm:p-4 rounded-lg bg-white/3 border border-white/5 hover:border-nexura-cyan/20 transition-colors"
                      >
                        <div className="text-nexura-text font-medium text-sm">
                          {c}
                        </div>
                        <div className="text-xs text-nexura-text-muted mt-1">
                          CS30{i + 1} · {i === 3 ? 2 : i + 3} Credits
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {role === "Faculty" && (
              <motion.div
                key="faculty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard hover={false} className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-nexura-text">
                        Dr. Arjun Mehta
                      </h2>
                      <p className="text-nexura-text-dim text-xs sm:text-sm">
                        FAC001 · CSE Department
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <StatCard
                      label="Courses Assigned"
                      value={2}
                      icon={BookOpen}
                      color="purple"
                    />
                    <StatCard
                      label="Hours/Week"
                      value={8}
                      icon={Clock}
                      color="cyan"
                      delay={0.1}
                    />
                    <StatCard
                      label="Workload"
                      value={44}
                      suffix="%"
                      icon={TrendingUp}
                      color="emerald"
                      delay={0.2}
                    />
                  </div>
                </GlassCard>
                <GlassCard hover={false}>
                  <h3 className="text-base sm:text-lg font-semibold mb-4">
                    All Faculty
                  </h3>
                  <div className="space-y-3">
                    {faculty.map((f, i) => (
                      <motion.div
                        key={f.employeeId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg bg-white/3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                            {f.name[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-nexura-text font-medium text-sm truncate">
                              {f.name}
                            </div>
                            <div className="text-xs text-nexura-text-muted truncate">
                              {f.employeeId} · {f.department}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                          {f.courses?.length || 0} courses
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
