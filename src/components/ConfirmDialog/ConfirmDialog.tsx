import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmType?: 'primary' | 'danger';
  showIcon?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  confirmType = 'primary',
  showIcon = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="bg-gallery-surface border border-gallery-border rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {showIcon && (
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
              <button
                onClick={onCancel}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              {typeof message === 'string' ? (
                <p className="text-sm text-white/70 leading-relaxed">{message}</p>
              ) : (
                message
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 btn-secondary"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 ${confirmType === 'danger' ? 'bg-red-500 hover:bg-red-400 text-white' : 'btn-primary'}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
