<<<<<<< HEAD
import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiFileText } from 'react-icons/fi';

const Notes = () => {
    const { notes, addNote, updateNote, deleteNote, theme } = useDashboard();
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [newNote, setNewNote] = useState({ title: '', content: '' });

    const handleAddNote = async () => {
        if (!newNote.title || !newNote.content) return;
        await addNote(newNote);
        setNewNote({ title: '', content: '' });
        setIsAdding(false);
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            await deleteNote(id);
        }
    };

    const handleUpdateNote = async (id, updates) => {
        await updateNote(id, updates);
        setIsEditing(null);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} flex items-center gap-3`}>
                    <FiFileText className="text-neon-cyan shadow-[0_0_10px_#00F2EA]" /> Personal Notes
                </h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-5 py-2.5 bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-bold rounded-xl text-sm hover:bg-neon-cyan hover:text-midnight transition-all flex items-center gap-2 group shadow-[0_0_15px_rgba(0,242,234,0.1)] hover:shadow-[0_0_20px_rgba(0,242,234,0.4)]"
                >
                    <FiPlus className="group-hover:rotate-90 transition-transform" /> Create Note
                </button>
            </div>

            {isAdding && (
                <div className={`mb-8 ${theme === 'dark' ? 'bg-slate-900/60 border-neon-cyan/30' : 'bg-white border-neon-cyan/20 shadow-lg'} border p-6 rounded-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-300`}>
                    <input
                        type="text"
                        placeholder="Note Title"
                        className={`w-full ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl p-3 mb-4 focus:outline-none focus:border-neon-cyan/50 transition-all`}
                        value={newNote.title}
                        onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Start typing your thoughts..."
                        rows="4"
                        className={`w-full ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl p-3 mb-4 focus:outline-none focus:border-neon-cyan/50 transition-all resize-none`}
                        value={newNote.content}
                        onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                    ></textarea>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-slate-500 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddNote}
                            className="px-6 py-2 bg-neon-cyan text-midnight font-bold rounded-lg text-xs uppercase tracking-widest hover:shadow-[0_0_15px_#00F2EA] transition-all"
                        >
                            Save Note
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(note => (
                    <div key={note._id} className={`${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border p-6 rounded-2xl hover:border-neon-cyan/30 transition-all group relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-neon-cyan/10 transition-all"></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            {isEditing === note._id ? (
                                <input
                                    type="text"
                                    className={`w-full bg-transparent border-b border-neon-cyan text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} focus:outline-none`}
                                    value={note.title}
                                    onChange={(e) => updateNote(note._id, { title: e.target.value })}
                                />
                            ) : (
                                <h4 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} group-hover:text-neon-cyan transition-colors`}>{note.title}</h4>
                            )}
                            <button
                                onClick={() => handleDeleteNote(note._id)}
                                className="text-slate-600 hover:text-rose-500 transition-colors p-1"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>

                        {isEditing === note._id ? (
                            <textarea
                                className={`w-full bg-transparent border border-white/5 p-2 rounded-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-sm leading-relaxed mb-6 relative z-10 resize-none focus:outline-none focus:border-neon-cyan/30`}
                                rows="4"
                                value={note.content}
                                onChange={(e) => updateNote(note._id, { content: e.target.value })}
                            />
                        ) : (
                            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-sm leading-relaxed mb-6 relative z-10 line-clamp-4`}>
                                {note.content}
                            </p>
                        )}

                        <div className={`flex items-center justify-between pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} relative z-10`}>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{note.date}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isEditing === note._id ? (
                                    <button
                                        onClick={() => handleUpdateNote(note._id, { title: note.title, content: note.content })}
                                        className="text-emerald-400 p-1.5 hover:bg-emerald-400/10 rounded-lg transition-all"
                                    >
                                        <FiSave size={14} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(note._id)}
                                        className="text-neon-cyan p-1.5 hover:bg-neon-cyan/10 rounded-lg transition-all"
                                    >
                                        <FiEdit2 size={14} />
                                    </button>
                                )}
                                {isEditing === note._id && (
                                    <button
                                        onClick={() => setIsEditing(null)}
                                        className="text-rose-400 p-1.5 hover:bg-rose-400/10 rounded-lg transition-all"
                                    >
                                        <FiX size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {notes.length === 0 && !isAdding && (
                    <div className={`col-span-full h-[300px] border-2 border-dashed ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} rounded-3xl flex flex-col items-center justify-center text-slate-600`}>
                        <FiFileText size={48} className="mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-sm">No notes yet</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="mt-4 text-neon-cyan hover:underline underline-offset-4 text-xs font-bold uppercase tracking-widest"
                        >
                            Create your first note
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;
=======
import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiFileText } from 'react-icons/fi';

const Notes = () => {
    const { notes, addNote, updateNote, deleteNote, theme } = useDashboard();
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [newNote, setNewNote] = useState({ title: '', content: '' });

    const handleAddNote = async () => {
        if (!newNote.title || !newNote.content) return;
        await addNote(newNote);
        setNewNote({ title: '', content: '' });
        setIsAdding(false);
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            await deleteNote(id);
        }
    };

    const handleUpdateNote = async (id, updates) => {
        await updateNote(id, updates);
        setIsEditing(null);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} flex items-center gap-3`}>
                    <FiFileText className="text-neon-cyan shadow-[0_0_10px_#00F2EA]" /> Personal Notes
                </h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-5 py-2.5 bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-bold rounded-xl text-sm hover:bg-neon-cyan hover:text-midnight transition-all flex items-center gap-2 group shadow-[0_0_15px_rgba(0,242,234,0.1)] hover:shadow-[0_0_20px_rgba(0,242,234,0.4)]"
                >
                    <FiPlus className="group-hover:rotate-90 transition-transform" /> Create Note
                </button>
            </div>

            {isAdding && (
                <div className={`mb-8 ${theme === 'dark' ? 'bg-slate-900/60 border-neon-cyan/30' : 'bg-white border-neon-cyan/20 shadow-lg'} border p-6 rounded-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-300`}>
                    <input
                        type="text"
                        placeholder="Note Title"
                        className={`w-full ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl p-3 mb-4 focus:outline-none focus:border-neon-cyan/50 transition-all`}
                        value={newNote.title}
                        onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Start typing your thoughts..."
                        rows="4"
                        className={`w-full ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl p-3 mb-4 focus:outline-none focus:border-neon-cyan/50 transition-all resize-none`}
                        value={newNote.content}
                        onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                    ></textarea>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-slate-500 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddNote}
                            className="px-6 py-2 bg-neon-cyan text-midnight font-bold rounded-lg text-xs uppercase tracking-widest hover:shadow-[0_0_15px_#00F2EA] transition-all"
                        >
                            Save Note
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(note => (
                    <div key={note._id} className={`${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border p-6 rounded-2xl hover:border-neon-cyan/30 transition-all group relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-neon-cyan/10 transition-all"></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            {isEditing === note._id ? (
                                <input
                                    type="text"
                                    className={`w-full bg-transparent border-b border-neon-cyan text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} focus:outline-none`}
                                    value={note.title}
                                    onChange={(e) => updateNote(note._id, { title: e.target.value })}
                                />
                            ) : (
                                <h4 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} group-hover:text-neon-cyan transition-colors`}>{note.title}</h4>
                            )}
                            <button
                                onClick={() => handleDeleteNote(note._id)}
                                className="text-slate-600 hover:text-rose-500 transition-colors p-1"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>

                        {isEditing === note._id ? (
                            <textarea
                                className={`w-full bg-transparent border border-white/5 p-2 rounded-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-sm leading-relaxed mb-6 relative z-10 resize-none focus:outline-none focus:border-neon-cyan/30`}
                                rows="4"
                                value={note.content}
                                onChange={(e) => updateNote(note._id, { content: e.target.value })}
                            />
                        ) : (
                            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-sm leading-relaxed mb-6 relative z-10 line-clamp-4`}>
                                {note.content}
                            </p>
                        )}

                        <div className={`flex items-center justify-between pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} relative z-10`}>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{note.date}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isEditing === note._id ? (
                                    <button
                                        onClick={() => handleUpdateNote(note._id, { title: note.title, content: note.content })}
                                        className="text-emerald-400 p-1.5 hover:bg-emerald-400/10 rounded-lg transition-all"
                                    >
                                        <FiSave size={14} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(note._id)}
                                        className="text-neon-cyan p-1.5 hover:bg-neon-cyan/10 rounded-lg transition-all"
                                    >
                                        <FiEdit2 size={14} />
                                    </button>
                                )}
                                {isEditing === note._id && (
                                    <button
                                        onClick={() => setIsEditing(null)}
                                        className="text-rose-400 p-1.5 hover:bg-rose-400/10 rounded-lg transition-all"
                                    >
                                        <FiX size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {notes.length === 0 && !isAdding && (
                    <div className={`col-span-full h-[300px] border-2 border-dashed ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} rounded-3xl flex flex-col items-center justify-center text-slate-600`}>
                        <FiFileText size={48} className="mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-sm">No notes yet</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="mt-4 text-neon-cyan hover:underline underline-offset-4 text-xs font-bold uppercase tracking-widest"
                        >
                            Create your first note
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
