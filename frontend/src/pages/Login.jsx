import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/Spinner';
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Sparkles, Shield, Zap } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.login(data);
      setAuth(response.user, response.token);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-5xl w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8 animate-fade-in-up">
            <div>
              <Link to="/" className="inline-flex items-center space-x-2 text-white mb-6 hover:opacity-80 transition-opacity">
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </Link>
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                Welcome Back!
              </h1>
              <p className="text-xl text-blue-100">
                Sign in to manage your expenses effortlessly
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Zap, text: 'Lightning-fast expense tracking' },
                { icon: Shield, text: 'Enterprise-grade security' },
                { icon: Sparkles, text: 'AI-powered insights' }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Icon className="text-white" size={24} />
                    </div>
                    <p className="text-white font-medium">{feature.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-white text-sm">
                "ExpenseHub has transformed how we manage expenses. The automation saves us hours every week!"
              </p>
              <div className="flex items-center space-x-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
                <div>
                  <p className="text-white font-semibold text-sm">Sarah Johnson</p>
                  <p className="text-blue-200 text-xs">CFO, TechCorp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-right">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <h2 className="text-3xl font-bold text-white">Sign In</h2>
              <p className="text-blue-100 mt-2">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div>
                <label className="input-label flex items-center space-x-2">
                  <Mail size={16} />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@company.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="input-label flex items-center space-x-2">
                  <Lock size={16} />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 text-lg py-3"
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to ExpenseHub?</span>
                </div>
              </div>

              <Link
                to="/register"
                className="w-full btn-secondary flex items-center justify-center space-x-2 text-lg py-3"
              >
                <Sparkles size={20} />
                <span>Create Free Account</span>
              </Link>
            </form>

            {/* Mobile - Back to Home Link */}
            <div className="lg:hidden p-6 bg-gray-50 border-t text-center">
              <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-2">
                <ArrowLeft size={16} />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
