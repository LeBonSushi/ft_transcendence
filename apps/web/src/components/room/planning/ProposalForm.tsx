'use client';

import { motion, AnimatePresence } from 'motion/react';
import { LocationInput } from '@/components/ui/LocationInput';
import { DateRangePicker } from '@/components/ui/DateRangePicker';

interface ProposalFormProps {
  show: boolean;
  form: {
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
    budgetEstimate: string;
  };
  onFormChange: (form: any) => void;
  onCreate: () => void;
  onCancel: () => void;
}

export function ProposalForm({ show, form, onFormChange, onCreate, onCancel }: ProposalFormProps) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="space-y-2 p-3 rounded-xl border border-border bg-card">
            <LocationInput
              autoFocus
              placeholder="Destination *"
              value={form.destination}
              onChange={v => onFormChange({ ...form, destination: v })}
            />
            <DateRangePicker
              startDate={form.startDate}
              endDate={form.endDate}
              onChangeStart={v => onFormChange({ ...form, startDate: v })}
              onChangeEnd={v => onFormChange({ ...form, endDate: v })}
              placeholderStart="Date de départ *"
              placeholderEnd="Date de retour *"
            />
            <input
              placeholder="Budget estimé (€)"
              type="number"
              value={form.budgetEstimate}
              onChange={e => onFormChange({ ...form, budgetEstimate: e.target.value })}
              className="w-full text-xs px-2.5 py-1.5 rounded-md bg-muted border border-border outline-none focus:border-primary/60"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => onFormChange({ ...form, description: e.target.value })}
              rows={2}
              className="w-full text-xs px-2.5 py-1.5 rounded-md bg-muted border border-border outline-none focus:border-primary/60 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={onCreate}
                disabled={!form.destination || !form.startDate || !form.endDate}
                className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create
              </button>
              <button
                onClick={onCancel}
                className="flex-1 py-1.5 bg-muted text-muted-foreground text-xs font-medium rounded-lg hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
