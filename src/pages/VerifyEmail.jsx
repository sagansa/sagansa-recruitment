import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Mail, RefreshCw, LogOut, Globe } from 'lucide-react';
import Logo from '../components/Logo';

const VerifyEmail = ({ setAuth }) => {
    const { t, i18n } = useTranslation();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (user.email_verified_at) {
            navigate('/dashboard');
            return;
        }

        // Poll for verification status every 3 seconds
        const pollInterval = setInterval(async () => {
            try {
                const response = await api.get('/auth/user');
                if (response.data.user.email_verified_at) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    clearInterval(pollInterval);
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error("Polling failed", err);
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [user.email_verified_at, navigate]);

    const handleResend = async () => {
        setLoading(true);
        setStatus(null);
        try {
            await api.post('/auth/email/resend');
            setStatus('sent');
        } catch (err) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth(false);
        navigate('/login');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'id' ? 'en' : 'id';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0A0A] selection:bg-gold/30">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
            </div>

            <div className="absolute top-6 right-6">
                <button 
                    onClick={toggleLanguage}
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 transition-all font-medium"
                >
                    <Globe className="w-5 h-5 text-gold" />
                    {i18n.language === 'id' ? 'ID' : 'EN'}
                </button>
            </div>

            <div className="glass-card w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-500 relative">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mb-6 border border-gold/20">
                        <Mail className="w-10 h-10 text-gold" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                        {i18n.language === 'id' ? 'Verifikasi Email' : 'Verify Email'}
                    </h1>
                    <p className="text-slate-500 mt-4 font-medium leading-relaxed">
                        {i18n.language === 'id' 
                            ? 'Terima kasih telah mendaftar! Harap verifikasi alamat email Anda dengan mengeklik tautan yang baru saja kami kirimkan.' 
                            : 'Thanks for signing up! Please verify your email address by clicking on the link we just emailed to you.'}
                    </p>
                </div>

                {status === 'sent' && (
                    <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl text-sm text-center font-bold">
                        {i18n.language === 'id' 
                            ? 'Tautan verifikasi baru telah dikirim.' 
                            : 'A new verification link has been sent.'}
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm text-center font-bold">
                        {i18n.language === 'id' 
                            ? 'Gagal mengirim ulang tautan.' 
                            : 'Failed to resend verification link.'}
                    </div>
                )}

                <div className="space-y-4">
                    <button 
                        onClick={handleResend} 
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                        {i18n.language === 'id' ? 'Kirim Ulang Email' : 'Resend Email'}
                    </button>

                    <button 
                        onClick={handleLogout}
                        className="w-full py-4 text-slate-500 hover:text-white font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        {i18n.language === 'id' ? 'Keluar' : 'Logout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
