import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
    FiMail, FiCalendar, FiArrowLeft, FiEdit, FiSave, FiX, FiPlus,
    FiMapPin, FiAlertCircle, FiShield
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const EMPTY_FORM = { name: '', title: '', bio: '', location: '', avatar: '', skills: [] };

const Profile = () => {
    const { userProfile, updateUserProfile, fetchUserProfile, projects, theme } = useDashboard();
    const navigate = useNavigate();
    const { identifier } = useParams();

    // /profile        -> my own profile (editable)
    // /profile/:id    -> someone else's profile (read-only), unless the id happens to be me
    const [profile, setProfile] = React.useState(null);
    const [loading, setLoading] = React.useState(!!identifier);
    const [loadError, setLoadError] = React.useState('');

    const isOwnProfile =
        !identifier ||
        identifier === userProfile?.id ||
        identifier === userProfile?._id ||
        identifier === userProfile?.email;

    // Whatever we already know about this person from the project team arrays.
    // Used to render instantly and as a fallback if the API lookup fails.
    const localMatch = React.useMemo(() => {
        if (!identifier) return null;
        const target = decodeURIComponent(identifier);
        for (const p of projects || []) {
            const m = (p.team || []).find(
                tm =>
                    String(tm.id) === target ||
                    String(tm._id) === target ||
                    (tm.email && tm.email.toLowerCase() === target.toLowerCase())
            );
            if (m) {
                return {
                    id: m.id || m._id,
                    _id: m._id || m.id,
                    name: m.name || (m.email ? m.email.split('@')[0] : 'Team member'),
                    email: m.email || '',
                    avatar:
                        m.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'User')}&background=random`,
                    title: '',
                    bio: '',
                    location: '',
                    skills: [],
                    joinedDate: '',
                };
            }
        }
        return null;
    }, [identifier, projects]);

    // --- Load the profile being viewed ---
    React.useEffect(() => {
        let cancelled = false;

        if (isOwnProfile) {
            setProfile(userProfile);
            setLoading(false);
            setLoadError('');
            return;
        }

        // Show what we already know immediately, then enrich from the server.
        if (localMatch) {
            setProfile(prev => prev || localMatch);
            setLoading(false);
        } else {
            setLoading(true);
        }
        setLoadError('');

        fetchUserProfile(identifier)
            .then(data => {
                if (cancelled) return;
                if (data) setProfile(data);
                else if (localMatch) setProfile(localMatch);
                else setLoadError('This user could not be found.');
            })
            .catch(err => {
                console.error('[Profile] lookup failed for', identifier, err);
                if (cancelled) return;
                // Fall back to the team-list data rather than showing an error.
                if (localMatch) setProfile(localMatch);
                else setLoadError("We couldn't load this profile. They may not have an account yet.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [identifier, isOwnProfile, userProfile, fetchUserProfile, localMatch]);

    // --- Edit form state (own profile only) ---
    const [isEditing, setIsEditing] = React.useState(false);
    const [form, setForm] = React.useState(EMPTY_FORM);
    const [skillInput, setSkillInput] = React.useState('');
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');

    const startEditing = () => {
        setForm({
            name: userProfile?.name || '',
            title: userProfile?.title || '',
            bio: userProfile?.bio || '',
            location: userProfile?.location || '',
            avatar: userProfile?.avatar || '',
            skills: [...(userProfile?.skills || [])],
        });
        setSkillInput('');
        setError('');
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setError('');
        setSkillInput('');
    };

    const setField = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const addSkill = () => {
        const value = skillInput.trim();
        if (!value) return;
        if (form.skills.some(s => s.toLowerCase() === value.toLowerCase())) {
            setSkillInput('');
            return;
        }
        setForm(prev => ({ ...prev, skills: [...prev.skills, value] }));
        setSkillInput('');
    };

    const removeSkill = (index) =>
        setForm(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('Name is required.');
            return;
        }

        setSaving(true);
        setError('');
        try {
            await updateUserProfile({
                name: form.name.trim(),
                title: form.title.trim(),
                bio: form.bio,
                location: form.location.trim(),
                avatar: form.avatar.trim(),
                skills: form.skills,
            });
            // Saving returns you straight back to the read-only profile view.
            setIsEditing(false);
        } catch (err) {
            setError(err?.response?.data?.message || 'Could not save your changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // --- Shared style helpers ---
    const dark = theme === 'dark';
    const card = `${dark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border rounded-3xl transition-all`;
    const label = 'block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2';
    const field = `w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all ${dark
        ? 'bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-neon-cyan/50'
        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-neon-cyan/50'
        }`;

    const shell = (children) => (
        <div className={`flex h-screen ${dark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'} font-['Outfit'] overflow-hidden transition-colors duration-300`}>
            <Sidebar />
            <main className={`flex-1 flex flex-col min-w-0 ${dark ? 'bg-[#020617]/50' : 'bg-white'} relative z-10 overflow-y-auto p-8 custom-scrollbar`}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-purple/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
                {children}
            </main>
        </div>
    );

    const backButton = (
        <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 ${dark ? 'text-slate-500' : 'text-slate-400'} hover:text-neon-cyan transition-colors group`}
        >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>
    );

    // --- Loading / error / empty states ---
    if (loading) {
        return shell(
            <div className="max-w-4xl mx-auto w-full pt-24 text-center">
                <div className="w-10 h-10 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading profile</p>
            </div>
        );
    }

    if (loadError || !profile) {
        return shell(
            <>
                <div className="mb-8">{backButton}</div>
                <div className={`max-w-md mx-auto w-full ${card} p-10 text-center`}>
                    <FiAlertCircle size={32} className="mx-auto mb-4 text-rose-500" />
                    <h2 className={`font-bold text-lg mb-2 ${dark ? 'text-white' : 'text-slate-800'}`}>Profile unavailable</h2>
                    <p className="text-sm text-slate-500">{loadError || 'This profile could not be loaded.'}</p>
                </div>
            </>
        );
    }

    // Shared projects + the role this person holds in each of them.
    const sharedProjects = (projects || [])
        .filter(p => (p.team || []).some(m => m.email === profile.email || m.id === profile.id))
        .map(p => ({
            id: p._id,
            name: p.name,
            role: p.user === profile.id ? 'Admin' : 'Collaborator',
        }));

    const displaySkills = profile.skills || [];

    /* ------------------------------------------------------------------ */
    /* EDIT MODE — a real form                                             */
    /* ------------------------------------------------------------------ */
    if (isEditing && isOwnProfile) {
        return shell(
            <>
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={cancelEditing}
                        className={`flex items-center gap-2 ${dark ? 'text-slate-500' : 'text-slate-400'} hover:text-neon-cyan transition-colors group`}
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Profile</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full pb-16">
                    <div className="mb-8">
                        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Edit Profile</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            This is what your teammates see when they open your profile.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                            <FiAlertCircle className="shrink-0" /> {error}
                        </div>
                    )}

                    {/* Photo */}
                    <section className={`${card} p-8 mb-6`}>
                        <h3 className={`font-bold mb-6 flex items-center gap-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                            <div className="w-1 h-4 bg-neon-cyan rounded-full"></div> Profile Photo
                        </h3>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <img
                                src={form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=7D00FF&color=fff`}
                                alt="Avatar preview"
                                className={`w-24 h-24 rounded-2xl object-cover border-4 ${dark ? 'border-slate-950' : 'border-white shadow-md'} shrink-0`}
                                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=7D00FF&color=fff`; }}
                            />
                            <div className="flex-1 w-full">
                                <label className={label} htmlFor="avatar">Image URL</label>
                                <input
                                    id="avatar"
                                    type="url"
                                    className={field}
                                    placeholder="https://example.com/photo.jpg"
                                    value={form.avatar}
                                    onChange={setField('avatar')}
                                />
                                <p className="text-[11px] text-slate-500 mt-2">
                                    Leave blank to use an automatically generated avatar with your initials.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Basic details */}
                    <section className={`${card} p-8 mb-6`}>
                        <h3 className={`font-bold mb-6 flex items-center gap-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                            <div className="w-1 h-4 bg-neon-cyan rounded-full"></div> Basic Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={label} htmlFor="name">Full Name <span className="text-rose-500">*</span></label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    className={field}
                                    placeholder="Jane Doe"
                                    value={form.name}
                                    onChange={setField('name')}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="title">Job Title</label>
                                <input
                                    id="title"
                                    type="text"
                                    className={field}
                                    placeholder="Product Designer"
                                    value={form.title}
                                    onChange={setField('title')}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={label} htmlFor="location">Location</label>
                                <input
                                    id="location"
                                    type="text"
                                    className={field}
                                    placeholder="Bengaluru, India"
                                    value={form.location}
                                    onChange={setField('location')}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={label} htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    disabled
                                    className={`${field} opacity-50 cursor-not-allowed`}
                                    value={profile.email || ''}
                                />
                                <p className="text-[11px] text-slate-500 mt-2">
                                    Your email is your sign-in identity and can't be changed here.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* About */}
                    <section className={`${card} p-8 mb-6`}>
                        <h3 className={`font-bold mb-6 flex items-center gap-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                            <div className="w-1 h-4 bg-neon-cyan rounded-full"></div> About Me
                        </h3>
                        <label className={label} htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            rows={5}
                            maxLength={600}
                            className={`${field} resize-none`}
                            placeholder="A short introduction for your teammates — what you work on, what you're good at."
                            value={form.bio}
                            onChange={setField('bio')}
                        />
                        <p className="text-[11px] text-slate-500 mt-2 text-right">{form.bio.length}/600</p>
                    </section>

                    {/* Skills */}
                    <section className={`${card} p-8 mb-8`}>
                        <h3 className={`font-bold mb-6 flex items-center gap-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                            <div className="w-1 h-4 bg-neon-cyan rounded-full"></div> Skills
                        </h3>

                        <label className={label} htmlFor="skill">Add a skill</label>
                        <div className="flex gap-2">
                            <input
                                id="skill"
                                type="text"
                                className={field}
                                placeholder="e.g. React, Figma, GST filings"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
                                }}
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="px-4 shrink-0 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-xl hover:bg-neon-cyan hover:text-midnight transition-all"
                                aria-label="Add skill"
                            >
                                <FiPlus />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-5">
                            {form.skills.length === 0 && (
                                <p className="text-[11px] text-slate-500 italic">No skills added yet.</p>
                            )}
                            {form.skills.map((skill, idx) => (
                                <span
                                    key={`${skill}-${idx}`}
                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border flex items-center gap-2 ${dark ? 'bg-slate-950 text-slate-300 border-white/10' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(idx)}
                                        className="text-slate-500 hover:text-rose-500 transition-colors"
                                        aria-label={`Remove ${skill}`}
                                    >
                                        <FiX size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Actions */}
                    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sticky bottom-0 py-4 ${dark ? 'bg-[#020617]/80' : 'bg-white/80'} backdrop-blur-sm`}>
                        <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={saving}
                            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all disabled:opacity-50 ${dark
                                ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                                : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-neon-cyan to-electric-purple text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] transition-all disabled:opacity-60"
                        >
                            <FiSave size={14} /> {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </>
        );
    }

    /* ------------------------------------------------------------------ */
    /* VIEW MODE                                                           */
    /* ------------------------------------------------------------------ */
    return shell(
        <>
            <div className="flex items-center justify-between mb-8">
                {backButton}

                {/* Editing is available on your own profile only. */}
                {isOwnProfile && (
                    <button
                        onClick={startEditing}
                        className="flex items-center gap-2 px-6 py-2.5 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neon-cyan hover:text-midnight transition-all"
                    >
                        <FiEdit size={14} /> Edit Profile
                    </button>
                )}
            </div>

            <div className="max-w-4xl mx-auto w-full pb-16">
                {/* Header banner */}
                <div className="relative mb-16">
                    <div className={`h-40 w-full rounded-3xl border transition-all ${dark
                        ? 'bg-gradient-to-r from-electric-purple/20 via-neon-cyan/10 to-transparent border-white/5'
                        : 'bg-gradient-to-r from-electric-purple/10 via-neon-cyan/5 to-slate-50 border-slate-200'}`}></div>

                    <div className="absolute -bottom-10 left-8 flex items-end gap-6">
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className={`w-28 h-28 rounded-3xl object-cover border-4 ${dark ? 'border-slate-950 shadow-2xl' : 'border-white shadow-xl'} relative z-10`}
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=7D00FF&color=fff`; }}
                        />
                        <div className="mb-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className={`text-3xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{profile.name}</h1>
                                {isOwnProfile && (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                                        You
                                    </span>
                                )}
                            </div>
                            <p className="text-neon-cyan text-sm font-medium tracking-wide mt-1">
                                {profile.title || (profile.pendingInvite ? 'Invited — has not signed up yet' : 'No job title yet')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        {/* About */}
                        <div className={`${card} p-8`}>
                            <h3 className={`font-bold mb-6 flex items-center gap-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                                <div className="w-1 h-4 bg-neon-cyan rounded-full"></div> About
                            </h3>
                            {profile.bio ? (
                                <p className={`${dark ? 'text-slate-400' : 'text-slate-500'} leading-relaxed whitespace-pre-line`}>
                                    {profile.bio}
                                </p>
                            ) : (
                                <p className="text-slate-500 italic text-sm">
                                    {isOwnProfile
                                        ? "You haven't written a bio yet — hit Edit Profile to add one."
                                        : `${profile.name} hasn't added a bio yet.`}
                                </p>
                            )}
                        </div>

                        {/* Contact details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className={`${card} p-6 flex items-center gap-4`}>
                                <div className={`w-12 h-12 shrink-0 ${dark ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'} border rounded-xl flex items-center justify-center text-neon-cyan`}>
                                    <FiMail size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Email</p>
                                    <p className={`${dark ? 'text-white' : 'text-slate-900'} font-medium truncate`}>{profile.email}</p>
                                </div>
                            </div>

                            <div className={`${card} p-6 flex items-center gap-4`}>
                                <div className={`w-12 h-12 shrink-0 ${dark ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'} border rounded-xl flex items-center justify-center text-electric-purple`}>
                                    <FiCalendar size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Joined</p>
                                    <p className={`${dark ? 'text-white' : 'text-slate-900'} font-medium`}>{profile.joinedDate || '—'}</p>
                                </div>
                            </div>

                            <div className={`${card} p-6 flex items-center gap-4 sm:col-span-2`}>
                                <div className={`w-12 h-12 shrink-0 ${dark ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'} border rounded-xl flex items-center justify-center text-neon-cyan`}>
                                    <FiMapPin size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Location</p>
                                    <p className={`${dark ? 'text-white' : 'text-slate-900'} font-medium truncate`}>
                                        {profile.location || 'Not specified'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Shared projects + role */}
                        <div className={`${card} p-6`}>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                                {isOwnProfile ? 'Your Projects' : 'Shared Projects'}
                            </h4>
                            {sharedProjects.length > 0 ? (
                                <div className="space-y-3">
                                    {sharedProjects.map(p => (
                                        <div key={p.id} className="flex items-center justify-between gap-2">
                                            <span className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-slate-800'}`}>{p.name}</span>
                                            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${p.role === 'Admin'
                                                ? 'bg-electric-purple/10 border-electric-purple/40 text-electric-purple'
                                                : 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan'}`}>
                                                {p.role === 'Admin' && <FiShield size={9} />}{p.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[11px] text-slate-500 italic">No shared projects.</p>
                            )}
                        </div>

                        {/* Skills */}
                        <div className={`${card} p-6`}>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Skills</h4>
                            {displaySkills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {displaySkills.map((skill, idx) => (
                                        <span
                                            key={`${skill}-${idx}`}
                                            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border ${dark ? 'bg-slate-950 text-slate-400 border-white/5' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[11px] text-slate-500 italic">
                                    {isOwnProfile ? 'Add skills from Edit Profile.' : 'No skills listed.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
