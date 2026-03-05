'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { roomsApi } from '@/lib/api';
import { Users, X, Plus, Loader2 } from 'lucide-react';

export function NewGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: (roomId: string) => void }) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleCreate() {
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const room = await roomsApi.create({ name: name.trim(), type: 'GROUP' });
      onCreated(room.id);
    } catch { setCreating(false); }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-muted-foreground" />
            <span className="font-semibold text-sm">Nouveau groupe de voyage</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Nom du groupe…"
            className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Créer le groupe
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
