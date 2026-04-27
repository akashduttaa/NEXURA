import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

const statusConfig = {
  verified: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Verified' },
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Pending' },
  warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Warning' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Error' },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Success' },
};

export default function StatusBadge({ status = 'verified', label, className = '' }) {
  const config = statusConfig[status] || statusConfig.verified;
  const Icon = config.icon;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label || config.label}
    </motion.span>
  );
}
