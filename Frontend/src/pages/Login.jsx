import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { AUTH_API } from '../apiConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Support message passed from Register form
    const successMsg = location.state?.message;

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const response = await axios.post(`${AUTH_API}/login`, {
                userName: email,
                password
            });

            if (response.data && response.data.token) {
                // Save token
                localStorage.setItem('token', response.data.token);

                // Extract role from token payload
                try {
                    const base64Url = response.data.token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const decoded = JSON.parse(jsonPayload);
                    const userRole = decoded.user?.role;

                    if (userRole === 'shop') {
                        navigate('/shop-home');
                    } else if (userRole === 'admin') {
                        navigate('/admin-dashboard');
                    }else if (userRole === 'delivery') {
                        navigate('/delivery-landing');
                    } else {
                        navigate('/customer-home');
                    }
                } catch (decodeError) {
                    console.error("Token decoding error:", decodeError);
                    setErrorMsg("Invalid token received from server.");
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMsg(error.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left side - Visual/Branding */}
            <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(234,88,12,0.15),transparent_50%)]"></div>
                <div className="z-10 p-16 max-w-lg text-white">
                    <div className="bg-orange-600 inline-block p-3 rounded-xl mb-8">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Welcome back to excellence.</h1>
                    <p className="text-gray-400 text-lg">Sign in to access your curated collections, track orders, and discover new arrivals.</p>

                    {/* Aesthetic dots */}
                    <div className="flex space-x-2 mt-16">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col px-8 md:px-16 lg:px-24 justify-center relative">
                <Link to="/" className="absolute top-8 left-8 flex items-center text-gray-500 hover:text-black transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back home
                </Link>

                <div className="w-full max-w-md mx-auto">
                    <h2 className="text-3xl font-bold mb-2">Sign in</h2>
                    <p className="text-gray-500 mb-8">Enter your details to access your account.</p>

                    {successMsg && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm border border-green-200 font-medium">
                            {successMsg}
                        </div>
                    )}

                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 font-medium flex items-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address / Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <a href="#" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input type="checkbox" id="remember" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                                Remember me for 30 days
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white font-bold py-3.5 px-4 rounded-xl hover:bg-orange-600 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-orange-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* OAuth 2.0 / OpenID Connect Integration (Member 2 Task) */}
                    <div className="mt-6">
                        <div className="relative flex py-3 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Or continue with</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:5002';
                                window.location.href = `${authServiceUrl}/api/auth/google`;
                            }}
                            className="w-full mt-2 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center space-x-3 shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                            </svg>
                            <span>Sign in with Google</span>
                        </button>
                    </div>

                    <p className="mt-8 text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-black hover:text-orange-600 transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;