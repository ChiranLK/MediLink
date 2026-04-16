import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Plus, Trash2, StickyNote, Save, Check, Edit3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useDoctorContext } from '../../context/DoctorContext';
import customFetch from '../../utils/customFetch';
import { toast } from 'react-hot-toast';

const NOTE_COLORS = [
  { card: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40', accent: 'text-amber-600' },
  { card: 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-700/40', accent: 'text-sky-600' },
  { card: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/40', accent: 'text-emerald-600' },
  { card: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/40', accent: 'text-rose-600' },
  { card: 'bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-700/40', accent: 'text-violet-600' },
  { card: 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-700/40', accent: 'text-teal-600' },
];

const Notes = () => {
  const { doctorId, doctorProfile } = useDoctorContext();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  // Track which notes have unsaved changes and which are actively saving
  const [dirty, setDirty] = useState(new Set());
  const [saved, setSaved] = useState(new Set());

  const resolvedDoctorId = doctorId || doctorProfile?.doctorId || null;
  const debounceTimers = useRef({});

  /* ── Fetch notes ── */
  useEffect(() => {
    if (!resolvedDoctorId) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await customFetch.get(`/api/doctors/${resolvedDoctorId}/notes`);
        setNotes(data?.success && Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        console.error('Failed to load notes', e);
        toast.error('Failed to load clinical notes');
      } finally {
        setLoading(false);
      }
    })();
  }, [resolvedDoctorId]);

  /* ── Add note ── */
  const handleAddNote = async () => {
    if (!resolvedDoctorId) {
      toast.error('Doctor profile not loaded yet.');
      return;
    }
    try {
      setCreating(true);
      const { data } = await customFetch.post(`/api/doctors/${resolvedDoctorId}/notes`, {
        title: 'New clinical note',
        content: '',
      });
      if (data?.success && data.data) {
        setNotes((prev) => [data.data, ...prev]);
        toast.success('Note created');
      }
    } catch (e) {
      console.error('Failed to create note', e);
      toast.error('Failed to create note');
    } finally {
      setCreating(false);
    }
  };

  /* ── Save note to server ── */
  const saveNote = useCallback(async (id, updates) => {
    if (!resolvedDoctorId) return;
    try {
      await customFetch.put(`/api/doctors/${resolvedDoctorId}/notes/${id}`, updates);
      setDirty((prev) => { const n = new Set(prev); n.delete(id); return n; });
      setSaved((prev) => new Set(prev).add(id));
      setTimeout(() => setSaved((prev) => { const n = new Set(prev); n.delete(id); return n; }), 2000);
    } catch (e) {
      console.error('Failed to save note', e);
      toast.error('Failed to save note');
    }
  }, [resolvedDoctorId]);

  /* ── Handle text change with debounced auto-save ── */
  const handleChange = (id, field, value) => {
    setNotes((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, [field]: value, updatedAt: new Date().toISOString() } : n
      )
    );
    setDirty((prev) => new Set(prev).add(id));

    // Debounce: auto-save after 1.5s of inactivity
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(() => {
      const note = notes.find((n) => n._id === id);
      // Use latest value — the state update above is batched, so use the value directly
      const updates = { [field]: value };
      if (note) {
        updates.title = field === 'title' ? value : note.title;
        updates.content = field === 'content' ? value : note.content;
      }
      saveNote(id, updates);
    }, 1500);
  };

  /* ── Manual save (button click) ── */
  const handleManualSave = (id) => {
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    const note = notes.find((n) => n._id === id);
    if (note) saveNote(id, { title: note.title, content: note.content });
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    if (!resolvedDoctorId) return;
    try {
      await customFetch.delete(`/api/doctors/${resolvedDoctorId}/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success('Note deleted');
    } catch (e) {
      console.error('Failed to delete note', e);
      toast.error('Failed to delete note');
    }
  };

  const formatDate = (iso) => {
    try {
      if (!iso) return '';
      return format(typeof iso === 'string' ? parseISO(iso) : iso, 'dd MMM yyyy, HH:mm');
    } catch (err) {
      return '';
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFB] dark:bg-slate-950 flex flex-col p-6 lg:p-8 transition-colors duration-300 font-inter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <StickyNote className="text-teal-600 dark:text-teal-400" size={26} />
            Clinical Notes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xl">
            Quick sticky notes for clinical reminders. Changes auto-save after you stop typing, or click Save.
          </p>
        </div>

        <button
          onClick={handleAddNote}
          disabled={creating || !resolvedDoctorId}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-sm transition disabled:opacity-50"
        >
          <Plus size={18} />
          {creating ? 'Creating…' : 'Add Note'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 text-sm">
          Loading clinical notes…
        </div>
      )}

      {/* Empty */}
      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <StickyNote size={44} className="text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No clinical notes yet.</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm text-center max-w-xs">
            Click "Add Note" to create your first sticky note for quick reminders.
          </p>
        </div>
      )}

      {/* Notes grid */}
      {!loading && notes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {notes.map((note, idx) => {
            const color = NOTE_COLORS[idx % NOTE_COLORS.length];
            const isDirty = dirty.has(note._id);
            const isSaved = saved.has(note._id);

            return (
              <div
                key={note._id}
                className={`relative rounded-2xl border shadow-sm flex flex-col transition-shadow hover:shadow-md ${color.card}`}
              >
                {/* Title */}
                <div className="flex items-center gap-2 px-4 pt-4 pb-1">
                  <input
                    value={note.title || ''}
                    onChange={(e) => handleChange(note._id, 'title', e.target.value)}
                    placeholder="Note title"
                    className="flex-1 bg-transparent border-none text-sm font-bold text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
                  />
                  <Edit3 size={14} className="text-slate-400 shrink-0" />
                </div>

                {/* Content */}
                <div className="px-4 pb-2 flex-1">
                  <textarea
                    rows={4}
                    value={note.content || ''}
                    onChange={(e) => handleChange(note._id, 'content', e.target.value)}
                    placeholder="Type your clinical note here…"
                    className="w-full bg-transparent border-none resize-none text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 leading-relaxed"
                  />
                </div>

              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  {note.updatedAt
                    ? `Updated ${formatDate(note.updatedAt)}`
                    : note.createdAt
                    ? `Created ${formatDate(note.createdAt)}`
                    : ''}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(note._id)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notes;
