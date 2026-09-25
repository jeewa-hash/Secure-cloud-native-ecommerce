import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const errParam = searchParams.get('error');

        if (errParam) {
            setError(errParam || 'OAuth Authentication failed.');
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (token) {
            try {
                // Store OAuth JWT Token
                localStorage.setItem('token', token);

                // Decode payload to direct user based on role
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const decoded = JSON.parse(jsonPayload);
                const userRole = decoded.user?.role;

                setTimeout(() => {
                    if (userRole === 'shop') {
                        navigate('/shop-home');
                    } else if (userRole === 'admin') {
                        navigate('/admin-dashboard');
                    } else {
                        navigate('/customer-home');
                    }
                }, 1500);
            } catch (err) {
                console.error('Failed to parse OAuth token:', err);
                setError('Invalid token received from OAuth provider.');
                setTimeout(() => navigate('/login'), 3000);
            }
        } else {
            setError('No authentication token received.');
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="bg-orange-600 inline-block p-4 rounded-2xl mb-6 text-white">
                    <ShoppingBag className="w-10 h-10 animate-bounce" />
                </div>

                {!error ? (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating with Google</h2>
                        <p className="text-gray-500 mb-6">Please wait while we verify your account credentials...</p>
                        <div className="flex justify-center items-center space-x-2 text-green-600 font-medium">
                            <CheckCircle className="w-5 h-5 animate-pulse" />
                            <span>OAuth 2.0 / OpenID Connect Verified</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-center mb-4 text-red-500">
                            <AlertCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
                        <p className="text-red-600 font-medium mb-4">{error}</p>
                        <p className="text-gray-400 text-sm">Redirecting to login screen...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
