import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { LogIn, Globe } from 'lucide-react';
import Logo from '../components/Logo';

const Login = ({ setAuth }) => {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.dispatchEvent(new Event('storage'));
            setAuth(true);
            navigate('/dashboard');
        } catch (err) {
            setError(i18n.language === 'id' ? 'Kredensial tidak valid.' : 'Invalid credentials.');
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'id' ? 'en' : 'id';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0A0A] selection:bg-gold/30">
            {/* Background Accent */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
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
                <div className="flex flex-col items-center mb-10 text-center">
                    <Logo className="w-20 h-20 mb-6" showText={false} />
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                        Sagan<span className="text-gold">sa</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">{t('login.title')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm text-center font-bold">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{t('login.email')}</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">{t('login.password')}</label>
                            <Link to="/forgot-password" size="sm" className="text-xs text-gold hover:text-gold-hover font-bold transition-colors">
                                {t('login.forgot_password')}
                            </Link>
                        </div>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4">
                        <LogIn className="w-5 h-5" />
                        {t('login.button')}
                    </button>
                </form>

                <p className="mt-10 text-center text-slate-500 text-sm font-medium">
                    {t('login.no_account')}{' '}
                    <Link to="/register" className="text-gold hover:text-gold-hover font-bold underline underline-offset-4 transition-colors">
                        {t('login.register_link')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
