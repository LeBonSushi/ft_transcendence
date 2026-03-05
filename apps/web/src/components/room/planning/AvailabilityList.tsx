'use client';

import { motion, AnimatePresence } from 'motion/react';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { X } from 'lucide-react';

interface Availability {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  notes?: string | null;
  user: {
    id: string;
    username: string;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  };
}

interface AvailabilityListProps {
  availabilities: Availability[];
  currentUserId: string | undefined;
  showForm: boolean;
  form: {
    startDate: string;
    endDate: string;
    notes: string;
  };
  onFormChange: (form: any) => void;
  onCreate: () => void;
  onCancelForm: () => void;
  onDelete: (id: string) => void;
}

export function AvailabilityList({
  availabilities,
  currentUserId,
  showForm,
  form,
  onFormChange,
  onCreate,
  onCancelForm,
  onDelete,
}: AvailabilityListProps) {
  const myAvailabilities = availabilities.filter(a => a.userId === currentUserId);
  const othersAvailabilities = availabilities.filter(a => a.userId !== currentUserId);

  return (
    <>
      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 p-3 rounded-xl border border-border bg-card">
              <DateRangePicker
                startDate={form.startDate}
                endDate={form.endDate}
                onChangeStart={v => onFormChange({ ...form, startDate: v })}
                onChangeEnd={v => onFormChange({ ...form, endDate: v })}
                placeholderStart="Début disponibilité"
                placeholderEnd="Fin disponibilité"
              />
              <input
                placeholder="Notes (optionnel)"
                value={form.notes}
                onChange={e => onFormChange({ ...form, notes: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded-md bg-muted border border-border outline-none focus:border-primary/60"
              />
              <div className="flex gap-2">
                <button
                  onClick={onCreate}
                  className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg"
                >
                  Ajouter
                </button>
                <button
                  onClick={onCancelForm}
                  className="flex-1 py-1.5 bg-muted text-muted-foreground text-xs font-medium rounded-lg hover:text-foreground"
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My availabilities */}
      {myAvailabilities.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Mes disponibilités</p>
          <div className="space-y-1.5">
            {myAvailabilities.map(av => (
              <div key={av.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                <div className="min-w-0">
                  <p className="text-xs font-medium">
                    {new Date(av.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} → {new Date(av.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {av.notes && <p className="text-[11px] text-muted-foreground truncate">{av.notes}</p>}
                </div>
                <button
                  onClick={() => onDelete(av.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other members' availabilities */}
      {othersAvailabilities.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Membres</p>
          <div className="space-y-1.5">
            {othersAvailabilities.map(av => (
              <div key={av.id} className="p-2 rounded-lg bg-muted border border-border">
                <p className="text-xs font-medium">
                  {av.user.profile?.firstName ?? av.user.username}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(av.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} → {new Date(av.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                {av.notes && <p className="text-[11px] text-muted-foreground italic">{av.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {availabilities.length === 0 && (
        <p className="text-xs text-center text-muted-foreground py-4 italic">Aucune disponibilité renseignée</p>
      )}
    </>
  );
}
