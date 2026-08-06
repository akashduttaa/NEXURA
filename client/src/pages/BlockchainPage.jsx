import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Shield, CheckCircle, Copy, Plus, Hash, Clock, FileText, DollarSign, Award } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { transactionAPI } from '../lib/api';

const typeIcons = { academic_record: FileText, fee_payment: DollarSign, certificate: Award, genesis: Shield };
const typeColors = { academic_record: 'text-cyan-400', fee_payment: 'text-emerald-400', certificate: 'text-purple-400', genesis: 'text-amber-400' };

export default function BlockchainPage() {
  const [chain, setChain] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [copiedHash, setCopiedHash] = useState(null);
  const [newRecord, setNewRecord] = useState({ type: 'academic_record', studentName: 'Aarav Patel', studentRollNo: 'CSE2024001', details: { course: 'CS301', grade: 'A', semester: 3 } });

  const load = async () => {
    try {
      const res = await transactionAPI.getAll();
      setChain(res.data.data);
      setStats(res.data.stats);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await transactionAPI.create(newRecord);
      await load();
    } catch (e) { console.error(e); }
    setAdding(false);
  };

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (loading) return <PageTransition><div className="min-h-screen pt-24"><LoadingSpinner color="emerald" size="lg" variant="neon" text="Loading secure blockchain ledger..." /></div></PageTransition>;

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold gradient-text mb-2">Blockchain Records</h1>
              <p className="text-nexura-text-dim">SHA-256 hash-chained immutable academic ledger</p>
            </div>
            <NeonButton onClick={handleAdd} loading={adding} variant="emerald" icon={Plus}>
              Add Record
            </NeonButton>
          </div>

          {/* Chain Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <GlassCard delay={0}>
                <div className="text-sm text-nexura-text-dim mb-1">Total Blocks</div>
                <div className="text-3xl font-bold text-nexura-cyan font-display">{stats.totalBlocks}</div>
              </GlassCard>
              <GlassCard delay={0.1}>
                <div className="text-sm text-nexura-text-dim mb-1">Chain Status</div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={stats.isValid ? 'verified' : 'error'} label={stats.isValid ? 'Valid' : 'Tampered'} />
                </div>
              </GlassCard>
              <GlassCard delay={0.2}>
                <div className="text-sm text-nexura-text-dim mb-1">Difficulty</div>
                <div className="text-3xl font-bold text-purple-400 font-display">{stats.difficulty}</div>
              </GlassCard>
              <GlassCard delay={0.3}>
                <div className="text-sm text-nexura-text-dim mb-1">Latest Hash</div>
                <div className="text-xs font-mono text-nexura-text-muted truncate mt-2">{stats.latestHash?.slice(0, 24)}...</div>
              </GlassCard>
            </div>
          )}

          {/* Visual Chain */}
          <GlassCard hover={false} className="mb-8">
            <h3 className="text-lg font-semibold text-nexura-text mb-6 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-nexura-cyan" /> Block Chain Visualization
            </h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-4">
              {chain.slice(-8).map((block, i) => (
                <div key={block.blockIndex} className="flex items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="shrink-0 w-24 h-24 rounded-xl glass border border-nexura-cyan/20 flex flex-col items-center justify-center p-2 hover:glow-cyan transition-all"
                  >
                    <div className="text-xs text-nexura-cyan font-display font-bold">#{block.blockIndex}</div>
                    <div className="text-[10px] text-nexura-text-muted mt-1 truncate w-full text-center font-mono">{block.hash?.slice(0, 8)}</div>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-1" />
                  </motion.div>
                  {i < chain.slice(-8).length - 1 && (
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.1 + 0.05 }} className="w-8 h-0.5 bg-gradient-to-r from-nexura-cyan to-purple-500" />
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Transaction History */}
          <GlassCard hover={false}>
            <h3 className="text-lg font-semibold text-nexura-text mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-nexura-cyan" /> Transaction History
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {[...chain].reverse().map((tx, i) => {
                  const Icon = typeIcons[tx.data?.type] || FileText;
                  const color = typeColors[tx.data?.type] || 'text-white';
                  return (
                    <motion.div
                      key={tx.hash}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-nexura-cyan/20 transition-all group"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center ${color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-nexura-text capitalize">{tx.data?.type?.replace(/_/g, ' ')}</span>
                            <StatusBadge status="verified" label="Verified" />
                          </div>
                          {tx.data?.studentName && (
                            <div className="text-sm text-nexura-text-dim">{tx.data.studentName} ({tx.data.studentRollNo})</div>
                          )}
                          {tx.data?.details && tx.data.type !== 'genesis' && (
                            <div className="text-xs text-nexura-text-muted mt-1">
                              {tx.data.details.course && `Course: ${tx.data.details.course}`}
                              {tx.data.details.grade && ` · Grade: ${tx.data.details.grade}`}
                              {tx.data.details.amount && `Amount: ₹${tx.data.details.amount?.toLocaleString()}`}
                              {tx.data.details.certificateType && tx.data.details.certificateType}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Hash className="w-3 h-3 text-nexura-text-muted" />
                            <span className="text-xs font-mono text-nexura-text-muted truncate">{tx.hash}</span>
                            <button onClick={() => copyHash(tx.hash)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {copiedHash === tx.hash ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-nexura-text-muted hover:text-nexura-text" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="text-xs text-nexura-text-muted">Block #{tx.blockIndex}</div>
                        <div className="text-xs text-nexura-text-muted">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
