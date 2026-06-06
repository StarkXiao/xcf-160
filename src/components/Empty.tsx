import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

export default function Empty({ icon: Icon, title, description }: EmptyProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-6">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-white/30" />
        </div>
      )}
      {title && (
        <p className="text-white/60 mb-2 font-medium">{title}</p>
      )}
      {description && (
        <p className="text-sm text-white/40">{description}</p>
      )}
      {!Icon && !title && !description && (
        <p className="text-white/30">Empty</p>
      )}
    </div>
  );
}
