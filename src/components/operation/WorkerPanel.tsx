import { type ServiceWorker } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, MapPin, Briefcase, Phone, Clock } from 'lucide-react';

interface WorkerPanelProps {
  workers: ServiceWorker[];
  selectedWorker: ServiceWorker | null;
  onSelectWorker: (worker: ServiceWorker | null) => void;
}

export function WorkerPanel({ workers, selectedWorker, onSelectWorker }: WorkerPanelProps) {
  // Sort: available first
  const sortedWorkers = [...workers].sort((a, b) => {
    if (a.is_available && !b.is_available) return -1;
    if (!a.is_available && b.is_available) return 1;
    return b.rating - a.rating;
  });

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('mn-MN').format(amount) + '₮/цаг';
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {sortedWorkers.map((worker) => (
          <div
            key={worker.id}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              selectedWorker?.id === worker.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-muted/30 hover:bg-muted/50'
            }`}
            onClick={() => onSelectWorker(selectedWorker?.id === worker.id ? null : worker)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-foreground">{worker.profile_name}</h4>
                <p className="text-sm text-muted-foreground">{worker.specialty}</p>
              </div>
              <Badge variant={worker.is_available ? 'default' : 'secondary'}>
                {worker.is_available ? 'Боломжтой' : 'Завгүй'}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                <span>{worker.rating} үнэлгээ</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{worker.completed_jobs} ажил</span>
              </div>
            </div>

            {/* Rate */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Үнэ:</span>
              <span className="font-medium text-foreground">
                {formatCurrency(worker.hourly_rate)}
              </span>
            </div>

            {/* Current task */}
            {!worker.is_available && worker.current_task && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-yellow-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{worker.current_task}</span>
                </div>
              </div>
            )}

            {/* Badges */}
            {worker.badges.length > 0 && (
              <div className="mt-3 flex gap-1 flex-wrap">
                {worker.badges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}

        {workers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Ажилтан байхгүй байна</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
