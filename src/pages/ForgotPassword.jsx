import React, { useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../node_modules/react-i18next';
import Logo from '../components/Logo';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center p-6 selection:bg-gold/30">
            {/* Background Accent */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full opacity-50" />
            </div>

            <div className="w-full max-w-md relative">
                <div className="glass-card p-10 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                    <div className="absolute -top-6 -right-6 p-4 opacity-5">
                        <Logo className="w-48 h-48" showText={false} />
                    </div>

                    <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-gold mb-10 transition-all group font-bold text-sm uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {t('forgot_password.back_to_login')}
                    </Link>

                    <div className="mb-10">
                        <Logo className="w-12 h-12 mb-6" showText={false} />
                        <h1 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">{t('forgot_password.title')}</h1>
                        <p className="text-slate-500 font-medium leading-relaxed">{t('forgot_password.description')}</p>
                    </div>

                    {message ? (
                        <div className="bg-gold/10 border border-gold/20 p-6 rounded-2xl flex flex-col items-center text-center gap-4 text-gold animate-in fade-in zoom-in duration-300">
                            <div className="p-3 bg-gold/20 rounded-full">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <p className="font-bold text-lg">{message}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">
                                    {t('login.email')}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gold/50" />
                                    <input 
                                        type="email" 
                                        required 
                                        className="input-field pl-12"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('forgot_password.send_link')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
