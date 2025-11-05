"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/apiClient';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [honeypot, setHoneypot] = useState('');
    const [error, setError] = useState<string | null>(null);    
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const data = await apiClient<{ redirect: string; error?: string }>
            ('api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    honeypot,
                }),
            });

            const redirect = data.redirect;
            if (typeof redirect === 'string' && redirect.startsWith('/')) {
                await router.push(redirect);
            } else {
                await router.push('/error');
            }
        } catch (error: any) {
            setError(error.message || "Network error. Please try again.");
        }
    };

    return (
        <div
            className="relative flex flex-col lg:flex-row min-h-screen py-0 px-0 sm:px-0 lg:px-0 z-10"
            style={{
                background: "linear-gradient(120deg, #f8fafc 60%, #e0f7ef 100%)",
                backgroundImage: "url('/login-bg-pattern.svg'), linear-gradient(120deg, #f8fafc 60%, #e0f7ef 100%)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top right",
                backgroundSize: "40vw auto, cover"
            }}
        >
            {/* Left: Login Form */}
            <div className="flex flex-col items-center justify-center w-full lg:w-1/2 min-h-screen py-12 px-4 sm:px-6 lg:px-16 bg-transparent">
                <div className="max-w-md w-full space-y-8 bg-white bg-opacity-95 p-8 rounded-2xl shadow-xl">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Login to <a href='/' className="text-green-600 hover:text-green-500 transition-colors duration-200">Solopreneur</a>
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-medium text-gray-500 hover:text-gray-700">
                                Sign up for free
                            </Link>
                        </p>
                        {error && (<div className="mt-4 text-center text-sm text-red-600">{error}</div>)}
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md -space-y-px">
                            {/* Honeypot field (hidden from users) */}
                            <div style={{ display: 'none' }} aria-hidden="true">
                                <label htmlFor="website">Website</label>
                                <input
                                    id="website"
                                    name="website"
                                    type="text"
                                    autoComplete="off"
                                    tabIndex={-1}
                                    value={honeypot}
                                    onChange={e => setHoneypot(e.target.value)}
                                />
                            </div>
                            <div className="mb-5">
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm font-medium"
                                        placeholder="Email address"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm font-medium"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5 cursor-pointer"  /> : <Eye className="h-5 w-5 cursor-pointer" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="relative group overflow-hidden w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 cursor-pointer"
                            >
                                <span className="absolute inset-0 w-full h-full bg-green-700 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"></span>
                                <span className="relative">Sign in</span>
                            </button>
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <div>
                                    <a
                                        href="#"
                                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-300"
                                    >
                                        <span className="sr-only">Continue with GitHub</span>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.748-1.026 2.748-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.918.678 1.851 0 1.337-.012 2.413-.012 2.741 0 .267.18.578.688.48C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                </div>

                                <div>
                                    <a
                                        href="#"
                                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-300"
                                    >
                                        <span className="sr-only">Continue with Google</span>
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                                            </g>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {/* Right: Social Proof & Image */}
            <div className="hidden lg:flex flex-col justify-center items-center w-1/2 min-h-screen px-12 bg-transparent">
                <div className="max-w-lg w-full flex flex-col items-center">
                    <img
                        src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                        alt="Freelancer working"
                        className="rounded-2xl shadow-2xl w-full object-cover h-72 mb-8"
                    />
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Join thousands of successful freelancers</h3>
                        <p className="text-lg text-gray-600 mb-2">Solopreneur helps you organize, track, and grow your business.</p>
                        <p className="text-md text-gray-500">Your freelance journey deserves a powerful start.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;