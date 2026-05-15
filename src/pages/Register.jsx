import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { ArrowRight, Globe } from 'lucide-react';
import Logo from '../components/Logo';

const Register = ({ setAuth }) => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'id' ? 'en' : 'id';
        i18n.changeLanguage(newLang);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/register', formData);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.dispatchEvent(new Event('storage'));
            setAuth(true);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || (i18n.language === 'id' ? 'Registrasi gagal.' : 'Registration failed.'));
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0A0A] selection:bg-gold/30">
            {/* Background Accent */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
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

            <div className="glass-card w-full max-w-md p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
                <div className="flex flex-col items-center mb-8 text-center">
                    <Logo className="w-16 h-16 mb-6" showText={false} />
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">{t('register.title')}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm text-center font-bold">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{t('register.name')}</label>
                        <input
                            name="name"
                            type="text"
                            className="input-field"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{t('register.email')}</label>
                        <input
                            name="email"
                            type="email"
                            className="input-field"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{t('register.password')}</label>
                        <input
                            name="password"
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{t('register.confirm_password')}</label>
                        <input
                            name="password_confirmation"
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full mt-6">
                        {t('register.button')}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>

                <p className="mt-10 text-center text-slate-500 text-sm font-medium">
                    {t('register.has_account')}{' '}
                    <Link to="/login" className="text-gold hover:text-gold-hover font-bold underline underline-offset-4 transition-colors">
                        {t('register.login_link')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
