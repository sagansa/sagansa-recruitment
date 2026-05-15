import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const VerifyEmailConfirm = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            const id = searchParams.get('id');
            const hash = searchParams.get('hash');
            const expires = searchParams.get('expires');
            const signature = searchParams.get('signature');

            if (!id || !hash || !signature) {
                setStatus('error');
                return;
            }

            try {
                // Construct the verify URL with signature and expiration
                const url = `/auth/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`;
                await api.get(url);
                setStatus('success');
                
                // Refresh user data in localStorage
                const userRes = await api.get('/auth/user');
                localStorage.setItem('user', JSON.stringify(userRes.data.user));
                window.dispatchEvent(new Event('storage'));

                setTimeout(() => navigate('/dashboard'), 3000);
            } catch (err) {
                setStatus('error');
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center p-6">
            <div className="glass-card max-w-md w-full p-10 text-center animate-in fade-in zoom-in duration-500">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-6">
                        <Loader2 className="w-16 h-16 text-gold animate-spin" />
                        <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Verifying Your Email...</h1>
                        <p className="text-slate-500">Please wait while we confirm your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-300">
                        <div className="p-4 bg-green-500/20 rounded-full">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Email Verified!</h1>
                        <p className="text-slate-500 font-medium">Thank you. Your email has been successfully verified. Redirecting you to the dashboard...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-300">
                        <div className="p-4 bg-red-500/20 rounded-full">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Verification Failed</h1>
                        <p className="text-slate-500 font-medium">The verification link is invalid or has expired. Please try resending the verification email.</p>
                        <button 
                            onClick={() => navigate('/verify-email')}
                            className="btn-primary px-8 mt-4"
                        >
                            Back to Verification
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailConfirm;
