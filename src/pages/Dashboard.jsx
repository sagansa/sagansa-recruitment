import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
    User, 
    Briefcase, 
    MapPin, 
    Phone, 
    Calendar, 
    Plus, 
    Trash2, 
    LogOut,
    Save,
    CheckCircle2,
    Building2,
    Clock,
    CreditCard,
    Camera,
    Users,
    GraduationCap,
    Heart,
    Baby,
    Home,
    AlertCircle,
    Map,
    Eye,
    Edit,
    X,
    DollarSign,
    UserCheck,
    Navigation,
    Sparkles,
    Check,
    Globe,
    Send,
    Lock,
    TriangleAlert,
    Loader2,
    MailWarning,
    RefreshCw
} from 'lucide-react';
import Logo from '../components/Logo';

const Dashboard = ({ setAuth }) => {
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState(null);
    const [details, setDetails] = useState({
        status: 'draft',
        nickname: '',
        is_experienced: true,
        phone: '',
        address: '',
        birth_place: '',
        birth_date: '',
        gender: 'male',
        nik: '',
        religion: '',
        marital_status: '',
        children_count: 0,
        education_level: '',
        education_major: '',
        father_name: '',
        mother_name: '',
        home_location: '',
        emergency_phone: '',
        emergency_name: '',
        driver_license: '',
    });
    const [files, setFiles] = useState({
        ktp_image: null,
        selfie_image: null
    });
    const [previews, setPreviews] = useState({
        ktp_image: null,
        selfie_image: null
    });
    const [experiences, setExperiences] = useState([]);
    
    // UI state
    const [isExpModalOpen, setIsExpModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    
    // Reusable Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        type: 'danger',
        onConfirm: () => {}
    });

    const [expForm, setExpForm] = useState({
        company_name: '',
        position: '',
        salary: '',
        supervisor_name: '',
        supervisor_phone: '',
        is_contactable: false,
        start_date: '',
        end_date: '',
        description: ''
    });

    const navigate = useNavigate();
    const isSubmitted = details.status === 'submitted';
    const isVerified = user?.email_verified_at !== null;

    useEffect(() => {
        fetchData();

        // Poll for verification status every 10 seconds if not verified
        let pollInterval;
        if (!isVerified) {
            pollInterval = setInterval(async () => {
                try {
                    const res = await api.get('/auth/user');
                    if (res.data.user.email_verified_at) {
                        setUser(res.data.user);
                        localStorage.setItem('user', JSON.stringify(res.data.user));
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error("Verification polling failed", err);
                }
            }, 10000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [isVerified]);

    const fetchData = async () => {
        try {
            const [userRes, profileRes] = await Promise.all([
                api.get('/auth/user'),
                api.get('/profile')
            ]);
            setUser(userRes.data.user);
            if (profileRes.data.details) {
                const cleanDetails = {};
                Object.keys(profileRes.data.details).forEach(key => {
                    if (key === 'is_experienced') {
                        cleanDetails[key] = !!profileRes.data.details[key];
                    } else {
                        cleanDetails[key] = profileRes.data.details[key] || '';
                    }
                });
                setDetails(prev => ({ ...prev, ...cleanDetails }));
                
                setPreviews({
                    ktp_image: profileRes.data.details.ktp_image_url,
                    selfie_image: profileRes.data.details.selfie_image_url,
                });
            }
            setExperiences(profileRes.data.experiences);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        try {
            const res = await api.post('/auth/email/resend');
            showNotification(t('verification.resend_success'));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to resend.');
        } finally {
            setResendLoading(false);
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'id' ? 'en' : 'id';
        i18n.changeLanguage(newLang);
    };

    const showNotification = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const resizeImage = (file, maxWidth = 1200, maxHeight = 1200) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const resizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(resizedFile);
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const autoSave = async (updatedDetails = details, updatedFiles = files) => {
        if (isSubmitted) return;
        setAutoSaving(true);
        try {
            const formData = new FormData();
            Object.keys(updatedDetails).forEach(key => {
                if (key === 'is_experienced') {
                    formData.append(key, updatedDetails[key] ? 1 : 0);
                } else if (key === 'children_count') {
                    const val = parseInt(updatedDetails[key]);
                    formData.append(key, isNaN(val) ? 0 : val);
                } else if (key === 'birth_date' && !updatedDetails[key]) {
                    // Skip
                } else if (key !== 'status' && key !== 'ktp_image' && key !== 'selfie_image') {
                    formData.append(key, updatedDetails[key] || '');
                }
            });
            
            let hasNewFiles = false;
            if (updatedFiles.ktp_image instanceof File) {
                formData.append('ktp_image', updatedFiles.ktp_image);
                hasNewFiles = true;
            }
            if (updatedFiles.selfie_image instanceof File) {
                formData.append('selfie_image', updatedFiles.selfie_image);
                hasNewFiles = true;
            }

            const res = await api.post('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (hasNewFiles) {
                setFiles({ ktp_image: null, selfie_image: null });
                if (res.data.details) {
                    setPreviews({
                        ktp_image: res.data.details.ktp_image_url,
                        selfie_image: res.data.details.selfie_image_url,
                    });
                }
            }
        } catch (err) {
            console.error("Auto-save failed", err.response?.data);
        } finally {
            setTimeout(() => setAutoSaving(false), 500);
        }
    };

    const handleBlur = () => {
        autoSave();
    };

    const handleExperienceLevelChange = (val) => {
        if (isSubmitted) return;
        const newDetails = { ...details, is_experienced: val };
        setDetails(newDetails);
        autoSave(newDetails);
    };

    const getCurrentLocation = () => {
        if (isSubmitted) return;
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const newDetails = { ...details, home_location: `${latitude}, ${longitude}` };
                setDetails(newDetails);
                autoSave(newDetails);
            }, (error) => {
                console.error("Error getting location:", error);
                alert("Could not get location. Please ensure location permissions are granted.");
            });
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const handleFileChange = async (e) => {
        if (isSubmitted) return;
        const file = e.target.files[0];
        const name = e.target.name;
        if (file) {
            setAutoSaving(true);
            const resizedFile = await resizeImage(file);
            const newFiles = { ...files, [name]: resizedFile };
            setFiles(newFiles);
            setPreviews({ ...previews, [name]: URL.createObjectURL(resizedFile) });
            autoSave(details, newFiles);
        }
    };

    const openConfirmModal = (config) => {
        setConfirmModal({
            isOpen: true,
            ...config
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleDeleteImage = (type) => {
        if (isSubmitted) return;
        openConfirmModal({
            title: i18n.language === 'id' ? 'Hapus Gambar' : 'Delete Image',
            message: i18n.language === 'id' ? 'Apakah Anda yakin ingin menghapus gambar ini?' : 'Are you sure you want to delete this image?',
            confirmText: i18n.language === 'id' ? 'Hapus' : 'Delete',
            type: 'danger',
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    await api.delete('/profile/image', { data: { type } });
                    setPreviews({ ...previews, [type]: null });
                    showNotification(i18n.language === 'id' ? 'Gambar berhasil dihapus' : 'Image deleted successfully');
                    closeConfirmModal();
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    const handleSubmitApplication = () => {
        if (isSubmitted) return;
        if (!isVerified) {
            alert(i18n.language === 'id' ? 'Harap verifikasi email Anda terlebih dahulu.' : 'Please verify your email first.');
            return;
        }
        openConfirmModal({
            title: t('dashboard.submit'),
            message: t('dashboard.confirm_submit'),
            confirmText: t('dashboard.submit'),
            type: 'success',
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    await api.post('/profile/submit');
                    setDetails(prev => ({ ...prev, status: 'submitted' }));
                    showNotification(t('dashboard.success_submit'));
                    closeConfirmModal();
                } catch (err) {
                    alert(err.response?.data?.message || 'Submission failed.');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    const handleDeleteExperience = (id) => {
        if (isSubmitted) return;
        openConfirmModal({
            title: i18n.language === 'id' ? 'Hapus Pengalaman' : 'Delete Experience',
            message: i18n.language === 'id' ? 'Apakah Anda yakin ingin menghapus pengalaman kerja ini?' : 'Are you sure you want to delete this work experience?',
            confirmText: i18n.language === 'id' ? 'Hapus' : 'Delete',
            type: 'danger',
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    await api.delete(`/profile/experience/${id}`);
                    setExperiences(experiences.filter(exp => exp.id !== id));
                    showNotification(t('dashboard.success_delete_exp'));
                    closeConfirmModal();
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    const handleLogout = () => {
        openConfirmModal({
            title: i18n.language === 'id' ? 'Konfirmasi Keluar' : 'Logout Confirmation',
            message: i18n.language === 'id' ? 'Apakah Anda yakin ingin keluar dari akun?' : 'Are you sure you want to log out of your account?',
            confirmText: i18n.language === 'id' ? 'Keluar' : 'Logout',
            type: 'danger',
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    await api.post('/logout');
                } catch (err) {}
                localStorage.removeItem('token');
                setAuth(false);
                navigate('/login');
                closeConfirmModal();
            }
        });
    };

    const handleSaveExperience = async (e) => {
        e.preventDefault();
        if (isSubmitted && modalMode !== 'view') return;
        try {
            if (modalMode === 'add') {
                const res = await api.post('/profile/experience', expForm);
                setExperiences([res.data.experience, ...experiences]);
                showNotification(t('dashboard.success_add_exp'));
            } else if (modalMode === 'edit') {
                const res = await api.put(`/profile/experience/${expForm.id}`, expForm);
                setExperiences(experiences.map(exp => exp.id === expForm.id ? res.data.experience : exp));
                showNotification(t('dashboard.success_update_exp'));
            }
            setIsExpModalOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    const openAddModal = () => {
        if (isSubmitted) return;
        setModalMode('add');
        setExpForm({
            company_name: '',
            position: '',
            salary: '',
            supervisor_name: '',
            supervisor_phone: '',
            is_contactable: false,
            start_date: '',
            end_date: '',
            description: ''
        });
        setIsExpModalOpen(true);
    };

    const openEditModal = (exp) => {
        if (isSubmitted) {
            openViewModal(exp);
            return;
        }
        setModalMode('edit');
        setExpForm(exp);
        setIsExpModalOpen(true);
    };

    const openViewModal = (exp) => {
        setModalMode('view');
        setExpForm(exp);
        setIsExpModalOpen(true);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-gold">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-slate-950 p-6 md:p-12 relative">
            <ConfirmationModal 
                {...confirmModal}
                onClose={closeConfirmModal}
                isLoading={isSubmitting}
            />

            {/* Global Notification Toast */}
            {message && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 text-emerald-400 bg-slate-900/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-emerald-500/20 shadow-2xl animate-in fade-in slide-in-from-top-8 duration-500">
                    <div className="bg-emerald-500/20 p-1 rounded-full">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="font-semibold tracking-wide">{message}</span>
                    <button onClick={() => setMessage('')} className="ml-2 hover:bg-white/5 rounded-lg p-1 transition-all">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            )}

            {/* Auto-save Indicator */}
            <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full border bg-slate-900/80 backdrop-blur-md transition-all duration-500 ${autoSaving ? 'opacity-100 translate-y-0 border-gold/30 text-gold' : 'opacity-0 translate-y-4 border-transparent text-slate-500'}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Auto Saving...</span>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
                    <div className="flex items-center gap-6">
                        <Logo className="w-14 h-14" showText={false} />
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight uppercase">Sagan<span className="text-gold">sa</span></h1>
                            <p className="text-slate-400 mt-2 flex items-center gap-2 text-lg">
                                {t('dashboard.welcome')} <span className="text-gold font-semibold">{user?.name}</span>
                            </p>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${isSubmitted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'}`}>
                            {isSubmitted ? t('dashboard.status_submitted') : t('dashboard.status_draft')}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={toggleLanguage}
                            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 transition-all font-medium"
                        >
                            <Globe className="w-5 h-5 text-gold" />
                            {i18n.language === 'id' ? 'ID' : 'EN'}
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-2 rounded-xl flex items-center gap-2 border border-red-500/20 transition-all font-medium"
                        >
                            <LogOut className="w-5 h-5" />
                            {t('dashboard.logout')}
                        </button>
                    </div>
                </div>

                {!isVerified && (
                    <div className="mb-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-4 text-orange-400">
                            <div className="p-3 bg-orange-500/20 rounded-xl">
                                <TriangleAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{t('verification.not_verified')}</h3>
                                <p className="text-sm opacity-70">{t('verification.check_email')}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleResendVerification}
                            disabled={resendLoading}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                        >
                            {resendLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            {t('verification.resend')}
                        </button>
                    </div>
                )}

                {isSubmitted && (
                    <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 font-medium animate-in slide-in-from-left duration-500">
                        <Lock className="w-5 h-5" />
                        Application submitted. Profile is locked for editing.
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Columns */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-8">
                            {/* Section: Documents */}
                            <div className="glass-card p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-gold/20 rounded-lg">
                                        <CreditCard className="w-6 h-6 text-gold" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{t('dashboard.sections.documents')}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold block">KTP Image</label>
                                        <div className="relative group">
                                            <div className="w-full h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center overflow-hidden transition-all group-hover:border-gold/50 relative">
                                                {previews.ktp_image ? (
                                                    <>
                                                        <img src={previews.ktp_image} className="w-full h-full object-cover" alt="KTP" />
                                                        {!isSubmitted && (
                                                            <button 
                                                                onClick={() => handleDeleteImage('ktp_image')}
                                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Camera className="w-12 h-12 text-slate-700" />
                                                        {!isSubmitted && <input type="file" name="ktp_image" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold block">Selfie Image</label>
                                        <div className="relative group">
                                            <div className="w-full h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center overflow-hidden transition-all group-hover:border-gold/50 relative">
                                                {previews.selfie_image ? (
                                                    <>
                                                        <img src={previews.selfie_image} className="w-full h-full object-cover" alt="Selfie" />
                                                        {!isSubmitted && (
                                                            <button 
                                                                onClick={() => handleDeleteImage('selfie_image')}
                                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <User className="w-12 h-12 text-slate-700" />
                                                        {!isSubmitted && <input type="file" name="selfie_image" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Identity */}
                            <div className="glass-card p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-gold/20 rounded-lg">
                                        <User className="w-6 h-6 text-gold" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{t('dashboard.sections.identity')}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.nik')}</label>
                                        <input onBlur={handleBlur} disabled={isSubmitted} className="input-field" value={details.nik} onChange={e => setDetails({...details, nik: e.target.value})} placeholder="321..." />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.nickname')}</label>
                                        <input onBlur={handleBlur} disabled={isSubmitted} className="input-field" value={details.nickname} onChange={e => setDetails({...details, nickname: e.target.value})} placeholder="Bobby" />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.phone')}</label>
                                        <input onBlur={handleBlur} disabled={isSubmitted} className="input-field" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} placeholder="+62..." />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.religion')}</label>
                                        <select onBlur={handleBlur} onChange={e => { setDetails({...details, religion: e.target.value}); autoSave({...details, religion: e.target.value}); }} disabled={isSubmitted} className="input-field" value={details.religion}>
                                            <option value="">-- Select --</option>
                                            <option value="islam">{t('dashboard.fields.religion_options.islam')}</option>
                                            <option value="kristen">{t('dashboard.fields.religion_options.kristen')}</option>
                                            <option value="katolik">{t('dashboard.fields.religion_options.katolik')}</option>
                                            <option value="hindu">{t('dashboard.fields.religion_options.hindu')}</option>
                                            <option value="buddha">{t('dashboard.fields.religion_options.buddha')}</option>
                                            <option value="khonghucu">{t('dashboard.fields.religion_options.khonghucu')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.gender')}</label>
                                        <select onBlur={handleBlur} onChange={e => { setDetails({...details, gender: e.target.value}); autoSave({...details, gender: e.target.value}); }} disabled={isSubmitted} className="input-field" value={details.gender}>
                                            <option value="male">{t('dashboard.fields.male')}</option>
                                            <option value="female">{t('dashboard.fields.female')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.sim')}</label>
                                        <select onBlur={handleBlur} onChange={e => { setDetails({...details, driver_license: e.target.value}); autoSave({...details, driver_license: e.target.value}); }} disabled={isSubmitted} className="input-field" value={details.driver_license}>
                                            <option value="none">{t('dashboard.fields.sim_options.none')}</option>
                                            <option value="sim_a">{t('dashboard.fields.sim_options.sim_a')}</option>
                                            <option value="sim_c">{t('dashboard.fields.sim_options.sim_c')}</option>
                                            <option value="sim_ac">{t('dashboard.fields.sim_options.sim_ac')}</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.birth_place')}</label>
                                            <input onBlur={handleBlur} disabled={isSubmitted} className="input-field" value={details.birth_place} onChange={e => setDetails({...details, birth_place: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.birth_date')}</label>
                                            <input onBlur={handleBlur} disabled={isSubmitted} type="date" className="input-field" value={details.birth_date} onChange={e => setDetails({...details, birth_date: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Education & Family */}
                            <div className="glass-card p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-gold/20 rounded-lg">
                                        <GraduationCap className="w-6 h-6 text-gold" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{t('dashboard.sections.education_family')}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.education_level')}</label>
                                        <input onBlur={handleBlur} disabled={isSubmitted} className="input-field" value={details.education_level} onChange={e => setDetails({...details, education_level: e.target.value})} placeholder="S1 / SMA" />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.education_major')}</label>
                                        <input onBlur={handleBlur} disabled={isSubmitted} className="input-field" value={details.education_major} onChange={e => setDetails({...details, education_major: e.target.value})} placeholder="Computer Science" />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.father_name')}</label>
                                        <input onBlur={handleBlur} disabled={isSubmitted} className="input-field" value={details.father_name} onChange={e => setDetails({...details, father_name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.mother_name')}</label>
                                        <input onBlur={handleBlur} disabled={isSubmitted} className="input-field" value={details.mother_name} onChange={e => setDetails({...details, mother_name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.marital_status')}</label>
                                        <select onBlur={handleBlur} onChange={e => { 
                                            const val = e.target.value;
                                            const newDetails = {
                                                ...details, 
                                                marital_status: val,
                                                children_count: val === 'single' ? 0 : details.children_count
                                            };
                                            setDetails(newDetails); 
                                            autoSave(newDetails); 
                                        }} disabled={isSubmitted} className="input-field" value={details.marital_status}>
                                            <option value="">-- Select --</option>
                                            <option value="single">{t('dashboard.fields.marital_options.single')}</option>
                                            <option value="married">{t('dashboard.fields.marital_options.married')}</option>
                                            <option value="divorce">{t('dashboard.fields.marital_options.divorce')}</option>
                                        </select>
                                    </div>
                                    {details.marital_status && details.marital_status !== 'single' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.children_count')}</label>
                                            <input onBlur={handleBlur} disabled={isSubmitted} type="number" className="input-field" value={details.children_count} onChange={e => setDetails({...details, children_count: e.target.value})} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section: Location */}
                            <div className="glass-card p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-gold/20 rounded-lg">
                                        <Home className="w-6 h-6 text-gold" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{t('dashboard.sections.location')}</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.fields.address')}</label>
                                        <textarea onBlur={handleBlur} disabled={isSubmitted} className="input-field h-24 pt-2" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block flex items-center justify-between">
                                            {t('dashboard.fields.home_location')}
                                            {!isSubmitted && (
                                                <button 
                                                    type="button" 
                                                    onClick={getCurrentLocation}
                                                    className="text-[10px] bg-gold/20 hover:bg-gold/30 text-gold px-2 py-1 rounded flex items-center gap-1 transition-all"
                                                >
                                                    <Navigation className="w-3 h-3" /> {t('dashboard.get_location')}
                                                </button>
                                            )}
                                        </label>
                                        <input onBlur={handleBlur} disabled={isSubmitted} className="input-field" value={details.home_location} onChange={e => setDetails({...details, home_location: e.target.value})} placeholder="Lat, Long" />
                                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 italic">
                                            <AlertCircle className="w-3 h-3" />
                                            {t('dashboard.fields.home_location_help')}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block text-orange-400">{t('dashboard.fields.emergency_name')}</label>
                                            <input onBlur={handleBlur} disabled={isSubmitted} className="input-field" value={details.emergency_name} onChange={e => setDetails({...details, emergency_name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block text-orange-400">{t('dashboard.fields.emergency_phone')}</label>
                                            <div className="relative">
                                                <AlertCircle className="absolute left-3 top-2.5 w-4 h-4 text-orange-500" />
                                                <input onBlur={handleBlur} disabled={isSubmitted} className="input-field pl-10 border-orange-500/20" value={details.emergency_phone} onChange={e => setDetails({...details, emergency_phone: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-6 z-10">
                                {!isSubmitted && (
                                    <button 
                                        type="button" 
                                        onClick={handleSubmitApplication}
                                        className={`w-full py-4 text-lg flex items-center justify-center gap-3 rounded-2xl transition-all shadow-2xl ${isVerified ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40' : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-white/5'}`}
                                    >
                                        <Send className="w-6 h-6" />
                                        {t('dashboard.submit')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="glass-card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Sparkles className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h2 className="text-xl font-bold text-white">{t('dashboard.sections.experience_level')}</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <button 
                                    disabled={isSubmitted}
                                    onClick={() => handleExperienceLevelChange(true)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${details.is_experienced ? 'bg-gold/20 border-gold text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'} ${isSubmitted ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-5 h-5" />
                                        <span className="font-semibold">{t('dashboard.fields.is_experienced')}</span>
                                    </div>
                                    {details.is_experienced && <Check className="w-5 h-5 text-gold" />}
                                </button>

                                <button 
                                    disabled={isSubmitted}
                                    onClick={() => handleExperienceLevelChange(false)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${!details.is_experienced ? 'bg-gold/20 border-gold text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'} ${isSubmitted ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="w-5 h-5" />
                                        <span className="font-semibold">{t('dashboard.fields.is_fresh')}</span>
                                    </div>
                                    {!details.is_experienced && <Check className="w-5 h-5 text-gold" />}
                                </button>
                            </div>

                            {details.is_experienced && !isSubmitted && (
                                <button 
                                    onClick={openAddModal}
                                    className="mt-6 w-full btn-primary flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                                >
                                    <Plus className="w-5 h-5" />
                                    {t('dashboard.experience.add')}
                                </button>
                            )}
                        </div>

                        {details.is_experienced && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-400 flex items-center gap-2 px-2">
                                    <Clock className="w-5 h-5" />
                                    {t('dashboard.sections.history')}
                                </h3>
                                
                                {experiences.length === 0 ? (
                                    <div className="glass-card p-12 flex flex-col items-center justify-center text-slate-500 text-center">
                                        <Briefcase className="w-12 h-12 mb-4 opacity-10" />
                                        <p>{t('dashboard.experience.empty')}</p>
                                    </div>
                                ) : (
                                    experiences.map(exp => (
                                        <div key={exp.id} className="glass-card p-5 flex justify-between items-start group hover:border-white/20 transition-all duration-300">
                                            <div className="flex gap-4 overflow-hidden">
                                                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-5 h-5 text-gold" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h4 className="text-lg font-bold text-white truncate">{exp.position}</h4>
                                                    <p className="text-gold text-sm truncate">{exp.company_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => openViewModal(exp)} className="p-1.5 text-slate-500 hover:text-gold hover:bg-gold/10 rounded-lg">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {!isSubmitted && (
                                                    <>
                                                        <button onClick={() => openEditModal(exp)} className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteExperience(exp.id)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Experience Modal */}
            {isExpModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {modalMode === 'view' ? <><Eye className="text-gold" /> {t('dashboard.experience.view')}</> : 
                                 modalMode === 'edit' ? <><Edit className="text-emerald-400" /> {t('dashboard.experience.edit')}</> : 
                                 <><Plus className="text-emerald-400" /> {t('dashboard.experience.add')}</>}
                            </h2>
                            <button onClick={() => setIsExpModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveExperience} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.experience.company')}</label>
                                    <input className="input-field" required disabled={modalMode === 'view'} value={expForm.company_name} onChange={e => setExpForm({...expForm, company_name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.experience.position')}</label>
                                    <input className="input-field" required disabled={modalMode === 'view'} value={expForm.position} onChange={e => setExpForm({...expForm, position: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.experience.salary')}</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                        <input type="number" className="input-field pl-10" disabled={modalMode === 'view'} value={expForm.salary} onChange={e => setExpForm({...expForm, salary: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.experience.supervisor')}</label>
                                    <div className="relative">
                                        <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                        <input className="input-field pl-10" disabled={modalMode === 'view'} value={expForm.supervisor_name} onChange={e => setExpForm({...expForm, supervisor_name: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.experience.supervisor_phone')}</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                        <input className="input-field pl-10" disabled={modalMode === 'view'} value={expForm.supervisor_phone} onChange={e => setExpForm({...expForm, supervisor_phone: e.target.value})} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <input type="checkbox" className="w-5 h-5 rounded border-white/10 bg-white/5 text-gold focus:ring-0 focus:ring-offset-0" disabled={modalMode === 'view'} checked={expForm.is_contactable} onChange={e => setExpForm({...expForm, is_contactable: e.target.checked})} />
                                    <label className="text-sm text-slate-300">{t('dashboard.experience.contactable')}</label>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.experience.start')}</label>
                                    <input type="date" className="input-field" required disabled={modalMode === 'view'} value={expForm.start_date} onChange={e => setExpForm({...expForm, start_date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.experience.end')}</label>
                                    <input type="date" className="input-field" disabled={modalMode === 'view'} value={expForm.end_date} onChange={e => setExpForm({...expForm, end_date: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">{t('dashboard.experience.description')}</label>
                                <textarea className="input-field h-32 pt-2" disabled={modalMode === 'view'} value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} />
                            </div>

                            {modalMode !== 'view' && (
                                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                                    {modalMode === 'add' ? <Plus className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                                    {modalMode === 'add' ? t('dashboard.experience.add_new') : t('dashboard.experience.save')}
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
