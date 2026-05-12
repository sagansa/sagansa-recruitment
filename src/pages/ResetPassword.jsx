import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../node_modules/react-i18next';
import Logo from '../components/Logo';

const ResetPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');

    const [form, setForm] = useState({
        email: emailFromUrl || '',
        password: '',
        password_confirmation: '',
        token: token || ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await api.post('/auth/reset-password', form);
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center p-6 selection:bg-gold/30">
            {/* Background Accent */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full opacity-50" />
            </div>

            <div className="w-full max-w-md relative">
                <div className="glass-card p-10 animate-in fade-in zoom-in duration-500">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <Logo className="w-16 h-16 mb-6" showText={false} />
                        <h1 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">{t('reset_password.title')}</h1>
                        <p className="text-slate-500 font-medium leading-relaxed">{t('reset_password.description')}</p>
                    </div>

                    {message ? (
                        <div className="bg-gold/10 border border-gold/20 p-8 rounded-2xl flex flex-col items-center gap-4 text-gold animate-in fade-in zoom-in duration-300">
                            <div className="p-3 bg-gold/20 rounded-full">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <p className="font-bold text-xl text-center">{message}</p>
                            <div className="flex items-center gap-2 mt-2 opacity-70">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <p className="text-sm">Redirecting to login...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input type="hidden" value={form.token} />
                            
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Email</label>
                                <input 
                                    type="email" 
                                    readOnly 
                                    className="input-field opacity-40 cursor-not-allowed grayscale" 
                                    value={form.email} 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">{t('reset_password.new_password')}</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gold/50" />
                                    <input 
                                        type="password" 
                                        required 
                                        className="input-field pl-12"
                                        value={form.password}
                                        onChange={(e) => setForm({...form, password: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">{t('reset_password.confirm_password')}</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gold/50" />
                                    <input 
                                        type="password" 
                                        required 
                                        className="input-field pl-12"
                                        value={form.password_confirmation}
                                        onChange={(e) => setForm({...form, password_confirmation: e.target.value})}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm text-center font-bold">
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full btn-primary"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('reset_password.submit')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
