import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiUsers, FiArrowRight, FiCheckCircle, FiCopy, FiInfo } from 'react-icons/fi';
import { useDashboard } from '../context/DashboardContext';

const Onboarding = () => {
    const { joinProject, addProject, userProfile } = useDashboard();
    const [step, setStep] = useState('choice'); // 'choice', 'create', 'join'
    const [projectId, setProjectId] = useState('');
    const [projectName, setProjectName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleJoin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let finalId = projectId.trim();

        // If a URL was pasted, try to extract the 'join' parameter
        try {
            if (finalId.includes('?join=')) {
                const url = new URL(finalId);
                const joinParam = url.searchParams.get('join');
                if (joinParam) finalId = joinParam;
            } else if (finalId.includes('/signup/')) {
                // Handle possible REST-style links if any
                finalId = finalId.split('/').pop();
            }
        } catch (err) {
            // Not a valid URL, just use the string as is
        }

        try {
            await joinProject(finalId);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join project. Check the ID or link.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await addProject({ name: projectName, type: 'Team Space', status: 'Active' });
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to create project.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-['Outfit']">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-purple/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-cyan/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="w-full max-w-4xl relative z-10">
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-neon-cyan mx-auto mb-6 border border-white/5 shadow-inner">
                        <FiCheckCircle size={28} />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Welcome to <span className="bg-gradient-to-r from-neon-cyan to-electric-purple text-transparent bg-clip-text">ProSync</span></h1>
                    <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">Let's set up your workspace. Choose how you want to start collaborating today.</p>
                </div>

                {step === 'choice' && (
                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-500">
                        {/* Option 1: Create */}
                        <div
                            onClick={() => setStep('create')}
                            className="group p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] hover:border-electric-purple/50 transition-all cursor-pointer relative overflow-hidden active:scale-95"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-electric-purple/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 bg-electric-purple/10 rounded-2xl flex items-center justify-center text-electric-purple mb-6 group-hover:scale-110 transition-transform">
                                <FiPlus size={28} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">Start a New Project</h3>
                            <p className="text-slate-500 text-xs leading-relaxed mb-8 font-medium">Be the architect. Create a workspace, invite your squad, and lead the mission.</p>
                            <div className="flex items-center gap-2 text-electric-purple text-[10px] font-black uppercase tracking-widest">
                                Initialize Space <FiArrowRight />
                            </div>
                        </div>

                        {/* Option 2: Join */}
                        <div
                            onClick={() => setStep('join')}
                            className="group p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] hover:border-neon-cyan/50 transition-all cursor-pointer relative overflow-hidden active:scale-95"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 bg-neon-cyan/10 rounded-2xl flex items-center justify-center text-neon-cyan mb-6 group-hover:scale-110 transition-transform">
                                <FiUsers size={28} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">Join an Existing Force</h3>
                            <p className="text-slate-500 text-xs leading-relaxed mb-8 font-medium">Jump straight into action. Enter an Invite ID to join your team's ongoing projects.</p>
                            <div className="flex items-center gap-2 text-neon-cyan text-[10px] font-black uppercase tracking-widest">
                                Connect to Team <FiArrowRight />
                            </div>
                        </div>
                    </div>
                )}

                {step === 'create' && (
                    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <form onSubmit={handleCreate} className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                            <h3 className="text-xl font-black text-white mb-6">Naming your <span className="text-electric-purple">Empire</span></h3>
                            <div className="space-y-4 mb-8">
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Project Apex"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-electric-purple/50 transition-all text-sm font-medium"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                />
                                <div className="flex items-start gap-2 p-3 bg-white/5 rounded-xl text-[10px] text-slate-400 font-medium italic">
                                    <FiInfo size={14} className="text-electric-purple flex-shrink-0" />
                                    <span>You'll be the Admin and can invite team members once the project is created.</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep('choice')}
                                    className="flex-1 py-4 border border-white/10 text-white font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-gradient-to-r from-electric-purple to-pink-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(125,0,255,0.4)] transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Initializing...' : 'Launch Project'}
                                </button>
                            </div>
                            {error && <p className="text-rose-400 text-[10px] mt-4 font-bold text-center">{error}</p>}
                        </form>
                    </div>
                )}

                {step === 'join' && (
                    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <form onSubmit={handleJoin} className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                            <h3 className="text-xl font-black text-white mb-6">Enter <span className="text-neon-cyan">Invite ID</span></h3>
                            <div className="space-y-4 mb-8">
                                <input
                                    required
                                    type="text"
                                    placeholder="Paste Project ID or Invite Link"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-neon-cyan/50 transition-all text-sm font-medium"
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                />
                                <div className="flex items-start gap-2 p-3 bg-white/5 rounded-xl text-[10px] text-slate-400 font-medium italic">
                                    <FiInfo size={14} className="text-neon-cyan flex-shrink-0" />
                                    <span>You can paste the specific Project ID or the full invitation link shared with you.</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep('choice')}
                                    className="flex-1 py-4 border border-white/10 text-white font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-neon-cyan text-midnight font-black rounded-2xl text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Connecting...' : 'Join Space'}
                                </button>
                            </div>
                            {error && <p className="text-rose-400 text-[10px] mt-4 font-bold text-center">{error}</p>}
                        </form>
                    </div>
                )}
            </div>

            {/* Bottom Credits or Stats */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] z-10">
                Syncing with 2,491 Global Orgs
            </div>
        </div>
    );
};

export default Onboarding;
