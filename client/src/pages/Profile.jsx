import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FiMail, FiCalendar, FiBriefcase, FiArrowLeft, FiEdit } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Profile = () => {
    const { userProfile, setUserProfile, theme } = useDashboard();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = React.useState(false);
    const [editData, setEditData] = React.useState({ ...userProfile });

    const handleSave = () => {
        setUserProfile(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({ ...userProfile });
        setIsEditing(false);
    };

    return (
        <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'} font-['Outfit'] overflow-hidden transition-colors duration-300`}>
            <Sidebar />

            <main className={`flex-1 flex flex-col min-w-0 ${theme === 'dark' ? 'bg-[#020617]/50' : 'bg-white'} relative z-10 overflow-y-auto p-8 custom-scrollbar`}>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-purple/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-neon-cyan transition-colors group`}
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
                    </button>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neon-cyan hover:text-midnight transition-all"
                        >
                            <FiEdit size={14} /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className={`px-6 py-2.5 ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'} text-xs font-bold uppercase tracking-widest transition-all`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 bg-gradient-to-r from-neon-cyan to-electric-purple text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_#00F2EA] transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                <div className="max-w-4xl mx-auto w-full">
                    <div className="relative mb-12">
                        <div className={`h-48 w-full ${theme === 'dark' ? 'bg-gradient-to-r from-electric-purple/20 via-neon-cyan/10 to-transparent border-white/5' : 'bg-gradient-to-r from-electric-purple/10 via-neon-cyan/5 to-slate-50 border-slate-200'} rounded-3xl border transition-all`}></div>
                        <div className="absolute -bottom-8 left-8 flex items-end gap-6">
                            <div className="relative group">
                                <img
                                    src={isEditing ? editData.avatar : userProfile.avatar}
                                    className={`w-32 h-32 rounded-3xl border-4 ${theme === 'dark' ? 'border-slate-950 shadow-2xl' : 'border-white shadow-xl'} relative z-10 transition-all`}
                                />
                                {isEditing && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-3xl cursor-pointer group-hover:bg-black/60 transition-all">
                                        <input
                                            type="text"
                                            className="w-full bg-transparent text-[10px] text-white text-center px-2 outline-none"
                                            value={editData.avatar}
                                            onChange={e => setEditData({ ...editData, avatar: e.target.value })}
                                            placeholder="Avatar URL"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mb-2">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            className={`text-2xl font-bold bg-transparent border-b border-neon-cyan/30 text-white outline-none focus:border-neon-cyan h-8`}
                                            value={editData.name}
                                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                                        />
                                        <input
                                            className={`text-neon-cyan text-sm block bg-transparent border-b border-neon-cyan/30 outline-none focus:border-neon-cyan w-full`}
                                            value={editData.role}
                                            onChange={e => setEditData({ ...editData, role: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-1`}>{userProfile.name}</h1>
                                        <p className="text-neon-cyan text-sm font-medium tracking-wide">{userProfile.role}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <div className={`${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border p-8 rounded-3xl backdrop-blur-sm transition-all`}>
                                <h3 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold mb-6 flex items-center gap-2`}>
                                    <div className="w-1 h-4 bg-neon-cyan rounded-full"></div>
                                    About Me
                                </h3>
                                {isEditing ? (
                                    <textarea
                                        className={`w-full bg-slate-950/30 border border-white/5 rounded-xl p-4 text-slate-300 outline-none focus:border-neon-cyan/30 resize-none h-32`}
                                        value={editData.bio}
                                        onChange={e => setEditData({ ...editData, bio: e.target.value })}
                                    />
                                ) : (
                                    <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
                                        {userProfile.bio}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className={`${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'} border p-6 rounded-2xl flex items-center gap-4 transition-all`}>
                                    <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'} border rounded-xl flex items-center justify-center text-neon-cyan shadow-purple-glow/10`}>
                                        <FiMail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Email</p>
                                        {isEditing ? (
                                            <input
                                                className="bg-transparent border-b border-white/10 text-white outline-none text-sm w-full"
                                                value={editData.email}
                                                onChange={e => setEditData({ ...editData, email: e.target.value })}
                                            />
                                        ) : (
                                            <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-medium truncate w-full`}>{userProfile.email}</p>
                                        )}
                                    </div>
                                </div>
                                <div className={`${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'} border p-6 rounded-2xl flex items-center gap-4 transition-all`}>
                                    <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'} border rounded-xl flex items-center justify-center text-electric-purple shadow-purple-glow/10`}>
                                        <FiCalendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Joined</p>
                                        <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-medium`}>{userProfile.joinedDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className={`${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border p-6 rounded-3xl transition-all`}>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Account Status</h4>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_10px_#00F2EA] animate-pulse"></div>
                                    <span className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold text-sm`}>Pro Member</span>
                                </div>
                                <button className={`w-full py-3 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'} border rounded-xl text-xs font-bold uppercase tracking-widest transition-all`}>
                                    Upgrade Account
                                </button>
                            </div>

                            <div className={`${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border p-6 rounded-3xl transition-all`}>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(isEditing ? editData.skills || [] : userProfile.skills || []).map((skill, idx) => (
                                        <span key={idx} className={`px-3 py-1 ${theme === 'dark' ? 'bg-slate-950 text-slate-400 border-white/5' : 'bg-slate-50 text-slate-600 border-slate-200'} text-[10px] font-bold rounded-lg border transition-all flex items-center gap-2`}>
                                            {skill}
                                            {isEditing && (
                                                <button
                                                    onClick={() => {
                                                        const newSkills = (editData.skills || []).filter((_, i) => i !== idx);
                                                        setEditData({ ...editData, skills: newSkills });
                                                    }}
                                                    className="text-rose-500 hover:text-rose-400"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {isEditing && (
                                        <button
                                            onClick={() => {
                                                const skill = prompt("Add skill:");
                                                if (skill) setEditData({ ...editData, skills: [...(editData.skills || []), skill] });
                                            }}
                                            className="px-3 py-1 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 text-[10px] font-bold rounded-lg"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
