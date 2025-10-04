import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/Spinner';
import { CURRENCIES } from '../utils/constants';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Globe,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    mode: 'onChange'
  });

  const password = watch('password');
  const totalSteps = 3;

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ['companyName', 'currency'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['name', 'email'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    console.log('Submitting registration data:', data);
    try {
      const response = await authAPI.signup(data);
      console.log('Registration response:', response);
      setAuth(response.user, response.token);
      toast.success('🎉 Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, text: 'Instant setup in minutes' },
    { icon: Shield, text: 'Bank-level security' },
    { icon: Globe, text: 'Multi-currency support' },
    { icon: Sparkles, text: 'AI-powered OCR scanning' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Features */}
          <div className="hidden lg:block space-y-8 animate-fade-in-up">
            <div>
              <Link to="/" className="inline-flex items-center space-x-2 text-white mb-6 hover:opacity-80 transition-opacity">
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </Link>
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                Start Your Free Trial Today
              </h1>
              <p className="text-xl text-blue-100">
                Join thousands of companies managing their expenses smarter
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => {
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
              <div className="flex items-center space-x-2 text-white mb-2">
                <CheckCircle size={20} />
                <span className="font-semibold">No credit card required</span>
              </div>
              <p className="text-blue-100 text-sm">
                Start with our 14-day free trial. Cancel anytime, no questions asked.
              </p>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-right">
            {/* Progress Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep >= step 
                        ? 'bg-white text-blue-600 scale-110' 
                        : 'bg-white/30 text-white'
                    }`}>
                      {currentStep > step ? <CheckCircle size={20} /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                        currentStep > step ? 'bg-white' : 'bg-white/30'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-white">
                <p className="text-sm opacity-90">Step {currentStep} of {totalSteps}</p>
                <h2 className="text-2xl font-bold">
                  {currentStep === 1 && 'Company Details'}
                  {currentStep === 2 && 'Your Information'}
                  {currentStep === 3 && 'Secure Your Account'}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8">
              {/* Step 1: Company Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <label className="input-label flex items-center space-x-2">
                      <Building2 size={16} />
                      <span>Company Name *</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter your company name"
                      {...register('companyName', { required: 'Company name is required' })}
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠</span>
                        <span>{errors.companyName.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="input-label flex items-center space-x-2">
                      <Globe size={16} />
                      <span>Base Currency *</span>
                    </label>
                    <select
                      className="input-field"
                      {...register('currency', { required: 'Currency is required' })}
                    >
                      <option value="">Select your currency</option>
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.code} - {curr.name}
                        </option>
                      ))}
                    </select>
                    {errors.currency && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠</span>
                        <span>{errors.currency.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> This will be your default currency for expense reporting. You can add support for other currencies later.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Admin User Information */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <label className="input-label flex items-center space-x-2">
                      <User size={16} />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="John Doe"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠</span>
                        <span>{errors.name.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="input-label flex items-center space-x-2">
                      <Mail size={16} />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="admin@company.com"
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

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-800">
                      👤 <strong>Admin Account:</strong> You'll be set up as the company administrator with full access to all features.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Password */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <label className="input-label flex items-center space-x-2">
                      <Lock size={16} />
                      <span>Password *</span>
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="••••••••"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠</span>
                        <span>{errors.password.message}</span>
                      </p>
                    )}
                    <div className="mt-2 space-y-1">
                      <div className={`text-xs flex items-center space-x-2 ${password?.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={12} />
                        <span>At least 6 characters</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="input-label flex items-center space-x-2">
                      <Lock size={16} />
                      <span>Confirm Password *</span>
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="••••••••"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠</span>
                        <span>{errors.confirmPassword.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      🔒 <strong>Secure:</strong> Your password is encrypted and stored securely. We never share your credentials.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <ArrowLeft size={16} />
                    <span>Previous</span>
                  </button>
                ) : (
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                    Already have an account?
                  </Link>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2 min-w-[150px] justify-center"
                  >
                    {loading ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <Sparkles size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
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

export default Register;
