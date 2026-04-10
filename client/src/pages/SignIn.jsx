import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Heart, Stethoscope, ArrowRight } from 'lucide-react';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'remember') {
      setRememberMe(checked);
    }
    if (error) setError('');
  };

  const handleGoogleClick = async () => {
    try {
      setGoogleLoading(true);
      // Implement Google OAuth integration here
      console.log('Google Sign-In clicked');
      setGoogleLoading(false);
    } catch (err) {
      setError('Failed to initiate Google sign-in');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!email.trim() || !password) {
      setError('Please fill out all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      setTimeout(() => {
        console.log('Sign in attempt:', { email, password, rememberMe });
        setSuccess('Login successful! Redirecting...');
        
        // Store in sessionStorage
        sessionStorage.setItem('token', 'demo-token');
        sessionStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }));
        
        if (rememberMe) {
          localStorage.setItem('token', 'demo-token');
          localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }));
        }
        
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2, delay: 0.3 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"
      />

      {/* Left Brand Panel */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-1/2 px-12 py-16 text-white relative z-10"
      >
        {/* Logo and Brand */}
        <div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3 cursor-pointer group mb-16"
            onClick={() => navigate('/')}
          >
            <div className="bg-accent/20 p-3 rounded-xl group-hover:bg-accent/30 transition-all duration-300">
              <Stethoscope className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
              MediLink
            </h1>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-5xl font-black leading-tight mb-6">
              Welcome back to<br />
              <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
                your health
              </span>
            </h2>
            <p className="text-gray-300/80 text-lg leading-relaxed max-w-md">
              Manage appointments, consult doctors, and track your health journey with MediLink's intelligent healthcare platform.
            </p>
          </motion.div>
        </div>

        {/* Feature Pills */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          {[
            { icon: '👨‍⚕️', title: 'Expert Doctors', desc: 'Verified healthcare professionals' },
            { icon: '📅', title: '24/7 Available', desc: 'Book appointments anytime' },
            { icon: '🔒', title: 'Secure & Private', desc: 'HIPAA compliant platform' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
              className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-xl border border-white/10 hover:border-accent/50 transition-all duration-300"
            >
              <span className="text-3xl">{feature.icon}</span>
              <div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-400">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center w-full relative z-20">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="w-full h-full flex items-center justify-center px-8 py-16"
        >
          {/* Glass Card */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl p-8 lg:p-12 w-full max-w-lg">
            {/* Mobile Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2 mb-8 lg:hidden cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="bg-accent p-2.5 rounded-lg group-hover:bg-accent/80 transition-colors">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MediLink</span>
            </motion.div>

            {/* Form Header */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-gray-300/80 text-sm">
                Enter your credentials to access your healthcare dashboard
              </p>
            </motion.div>

            {/* Google Sign-In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleClick}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-medium py-3.5 rounded-xl text-sm transition-all duration-300 mb-6 disabled:opacity-60 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              {googleLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-4 h-4"
                  >
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  </motion.div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-200">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs text-accent hover:text-purple-300 font-medium transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me */}
              <motion.label
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={rememberMe}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded border border-white/30 bg-white/10 peer-checked:bg-accent peer-checked:border-accent transition-all duration-300 flex items-center justify-center">
                    {rememberMe && (
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 12 10"
                        fill="none"
                      >
                        <path
                          d="M1.5 5.5L4.5 8.5L10.5 1.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-300">Remember me for 30 days</span>
              </motion.label>

              {/* Messages */}
              <motion.div className="space-y-3">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm text-center backdrop-blur-sm"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-200 text-sm text-center backdrop-blur-sm"
                  >
                    {success}
                  </motion.div>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-4 h-4"
                    >
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    </motion.div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer Links */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center text-xs text-gray-400 mt-8"
            >
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-accent hover:text-purple-300 font-semibold transition-colors"
              >
                Create one
              </button>
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-white/10"
            >
              <Heart className="w-4 h-4 text-red-400" />
              <p className="text-xs text-gray-400">
                By signing in, you agree to our Terms & Privacy Policy
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
