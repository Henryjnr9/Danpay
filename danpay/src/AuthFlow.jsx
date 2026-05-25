import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, ArrowRight, ChevronLeft, Search, 
  CheckCircle2, Building2, Briefcase, User, 
  Store, Laptop, Palette, ShieldCheck, Landmark, Globe,
  Eye, EyeOff, Check, X, PartyPopper, RefreshCw
} from 'lucide-react';
import { useAuth } from './AuthContext';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 2.18 2.18 5.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const ROLES = [
  { id: 'freelancer', label: 'Freelancer', icon: User, desc: 'Independent professional' },
  { id: 'contractor', label: 'Contractor', icon: Briefcase, desc: 'Project-based worker' },
  { id: 'salary', label: 'Salary Recipient', icon: Landmark, desc: 'Employee receiving pay' },
  { id: 'agency', label: 'Agency Owner', icon: Building2, desc: 'Managing a team' },
  { id: 'creator', label: 'Content Creator', icon: Palette, desc: 'Influencer or artist' },
  { id: 'ecommerce', label: 'E-commerce Seller', icon: Store, desc: 'Selling products online' },
  { id: 'consultant', label: 'Consultant', icon: ShieldCheck, desc: 'Expert advisor' },
  { id: 'remote', label: 'Remote Worker', icon: Laptop, desc: 'Distributed team member' },
];

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For freelancers just getting started.',
    features: ['10 invoices per month', '5 clients', 'Basic receipts', 'Shareable links'],
  },
  {
    id: 'individual',
    label: 'Individual',
    price: '$12',
    period: 'per month',
    description: 'For active freelancers with growing client bases.',
    features: ['Unlimited invoices', 'Unlimited clients', 'Escrow payments', 'Analytics dashboard'],
    highlight: true,
  },
  {
    id: 'organisation',
    label: 'Organisation',
    price: '$29',
    period: 'per month',
    description: 'For teams and agencies.',
    features: ['Everything in Individual', 'Unlimited team members', 'Custom branding', 'API access'],
  },
];

// ── AUTH TOAST ──
const AuthToast = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
    <AnimatePresence>
      {toasts.map(toast => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-black/10 bg-white"
          style={{
            borderColor: toast.type === 'error' ? '#FCA5A5' :
                         toast.type === 'success' ? '#6EE7B7' : '#E1E1E1'
          }}
        >
          <div className="flex-shrink-0">
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-green-500" />}
            {toast.type === 'error' && <X size={18} className="text-red-400" />}
            {toast.type === 'info' && <Mail size={18} className="text-blue-400" />}
          </div>
          <p className="text-sm font-bold text-[#010101] flex-1 leading-snug">{toast.message}</p>
          <button onClick={() => onDismiss(toast.id)} className="flex-shrink-0 text-[#6B7280] hover:text-[#010101]">
            <X size={15} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export default function AuthFlow({ onComplete }) {
  const { login, setWorkspaceName } = useAuth();
  const [step, setStep] = useState('login');
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [roleSearch, setRoleSearch] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isNewUser, setIsNewUser] = useState(false);

  // ── TOAST ──
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };
  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const brandColor = '#2563EB';

  // ── MOCK AUTH HANDLERS ──
  const handleLoginSubmit = () => {
    if (!email || !password) return showToast('Please enter your email and password.', 'error');
    showToast('Login successful! Welcome back.', 'success');
    login({ name: email });
    setTimeout(() => onComplete(false), 800);
  };

  const handleSignUpSubmit = () => {
    if (!email || !password) return showToast('Please enter your email and password.', 'error');
    showToast('Account created! Enter the OTP to continue.', 'success');
    setIsNewUser(true);
    setTimer(60);
    setStep('otp');
  };

  const handleForgotPassword = () => {
    if (!email) return showToast('Please enter your email address.', 'error');
    showToast(`Password reset link sent to ${email}`, 'success');
  };

  const handleVerifyOtp = () => {
    const code = otp.join('');
    if (code.length < 4) return showToast('Please enter the full 4-digit OTP.', 'error');
    showToast('Email verified successfully!', 'success');
    setStep('onboarding-role');
  };

  const handleFinishOnboarding = () => {
    if (!businessName.trim()) return showToast('Please enter your business name.', 'error');
    if (businessName) setWorkspaceName(businessName);
    showToast(`Welcome to DanPay, ${businessName}!`, 'success');
    login({ name: email });
    setTimeout(() => onComplete(true), 800);
  };

  // ── OTP TIMER ──
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // ── PASSWORD STRENGTH ──
  const strength = useMemo(() => ({
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    length: password.length >= 8
  }), [password]);

  const filteredRoles = useMemo(() =>
    ROLES.filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase())),
  [roleSearch]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-['Open_Sauce_Sans',sans-serif]">
      <div className="w-full max-w-[480px]">
        <AnimatePresence mode="wait">

          {/* ── LOGIN ── */}
          {step === 'login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Welcome back</h2>
                <p className="text-sm text-[#6B7280] mt-2">Login to manage your workspace</p>
              </div>
              <div className="space-y-4">
                <button className="w-full h-14 border border-[#E1E1E1] rounded-xl flex items-center justify-center gap-3 font-bold hover:bg-[#FAFAFA] transition-all">
                  <GoogleIcon /> Continue with Google
                </button>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-[#E1E1E1]" />
                  <span className="mx-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-[#E1E1E1]" />
                </div>
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-14 px-4 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" />
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-14 px-4 pr-12 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="text-right">
                  <button onClick={() => setStep('forgot-password')} className="text-xs font-bold text-[#2563EB]">Forgot Password?</button>
                </div>
                <button onClick={handleLoginSubmit} style={{ backgroundColor: brandColor }} className="w-full h-14 rounded-xl text-white font-bold text-lg">
                  Login
                </button>
                <p className="text-center text-sm text-[#6B7280]">
                  Don't have an account? <button onClick={() => { setIsNewUser(true); setPassword(''); setStep('signup'); }} className="font-bold text-[#2563EB]">Sign Up</button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {step === 'forgot-password' && (
            <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8 relative">
                <button onClick={() => setStep('login')} className="absolute -left-2 top-0 p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
                <h2 className="text-3xl font-bold">Reset Password</h2>
                <p className="text-sm text-[#6B7280] mt-2">Enter your email to receive reset details</p>
              </div>
              <div className="space-y-4">
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-14 px-4 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" />
                <button onClick={handleForgotPassword} style={{ backgroundColor: brandColor }} className="w-full h-14 rounded-xl text-white font-bold">
                  Send Reset Link
                </button>
                <button onClick={() => setStep('login')} className="w-full text-sm text-[#6B7280] font-bold hover:text-[#010101] transition-colors">
                  Back to Login
                </button>
              </div>
            </motion.div>
          )}

          {/* ── SIGN UP ── */}
          {step === 'signup' && (
            <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8 relative">
                <button onClick={() => setStep('login')} className="absolute -left-2 top-0 p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
                <h2 className="text-3xl font-bold">Create Account</h2>
                <p className="text-sm text-[#6B7280] mt-2">Enter your details to get started</p>
              </div>
              <div className="space-y-4">
                <button className="w-full h-14 border border-[#E1E1E1] rounded-xl flex items-center justify-center gap-3 font-bold hover:bg-[#FAFAFA] transition-all">
                  <GoogleIcon /> Sign up with Google
                </button>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-[#E1E1E1]" />
                  <span className="mx-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-[#E1E1E1]" />
                </div>
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-14 px-4 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" />
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-14 px-4 pr-12 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 px-1">
                  {[
                    { key: 'upper', label: 'One Uppercase' },
                    { key: 'lower', label: 'One Lowercase' },
                    { key: 'symbol', label: 'One Symbol' },
                    { key: 'length', label: '8+ Characters' },
                  ].map(req => (
                    <div key={req.key} className="flex items-center gap-2">
                      {strength[req.key] ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-gray-300" />}
                      <span className={`text-[10px] font-bold ${strength[req.key] ? 'text-green-600' : 'text-[#6B7280]'}`}>{req.label}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSignUpSubmit}
                  disabled={!strength.upper || !strength.lower || !strength.symbol || !strength.length}
                  style={{ backgroundColor: brandColor }}
                  className="w-full h-14 rounded-xl text-white font-bold text-lg disabled:opacity-50"
                >
                  Continue
                </button>
                <p className="text-center text-sm text-[#6B7280]">
                  Already have an account? <button onClick={() => setStep('login')} className="font-bold text-[#2563EB]">Login</button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── OTP ── */}
          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Verify Email</h2>
                <p className="text-sm text-[#6B7280] mt-2">We sent a 4-digit OTP to <span className="font-bold text-[#010101]">{email}</span></p>
              </div>
              <div className="flex justify-center gap-4 mb-8">
                {otp.map((digit, idx) => (
                  <input
                    key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    className="w-16 h-20 text-center text-3xl font-bold border-2 border-[#E1E1E1] rounded-2xl focus:border-[#2563EB] outline-none"
                  />
                ))}
              </div>
              <button onClick={handleVerifyOtp} style={{ backgroundColor: brandColor }} className="w-full h-14 rounded-xl text-white font-bold text-lg">
                Verify & Continue
              </button>
              <div className="text-center mt-6">
                {timer > 0 ? (
                  <p className="text-sm text-[#6B7280]">Resend OTP in 0:{timer < 10 ? `0${timer}` : timer}</p>
                ) : (
                  <button onClick={() => { setTimer(60); showToast('OTP resent to ' + email, 'info'); }} className="text-sm font-bold text-[#2563EB]">
                    Resend OTP Now
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── ROLE SELECTION ── */}
          {step === 'onboarding-role' && (
            <motion.div key="role" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Who are you?</h2>
                <p className="text-sm text-[#6B7280] mt-2">Select your role to personalise your experience</p>
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
                <input type="text" placeholder="Search roles..." className="w-full h-12 pl-12 pr-4 bg-[#FAFAFA] border border-[#E1E1E1] rounded-xl outline-none" onChange={e => setRoleSearch(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredRoles.map(role => (
                  <button
                    key={role.id} onClick={() => setSelectedRole(role.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedRole === role.id ? 'border-[#2563EB] bg-[#F0F4FF]' : 'border-[#E1E1E1]'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedRole === role.id ? 'bg-[#2563EB] text-white' : 'bg-gray-100'}`}>
                      <role.icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{role.label}</p>
                      <p className="text-xs text-[#6B7280]">{role.desc}</p>
                    </div>
                    {selectedRole === role.id && <CheckCircle2 size={16} className="text-[#2563EB] ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
              <button
                disabled={!selectedRole}
                onClick={() => setStep('onboarding-plan')}
                style={{ backgroundColor: brandColor }}
                className="w-full h-14 rounded-xl text-white font-bold text-lg mt-6 disabled:opacity-50"
              >
                Next Step
              </button>
            </motion.div>
          )}

          {/* ── PLAN SELECTION ── */}
          {step === 'onboarding-plan' && (
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Choose your plan</h2>
                <p className="text-sm text-[#6B7280] mt-2">You can upgrade anytime from settings</p>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all relative ${selectedPlan === plan.id ? 'border-[#2563EB] bg-[#F0F4FF]' : 'border-[#E1E1E1] bg-white'}`}
                  >
                    {plan.highlight && (
                      <span className="absolute -top-3 right-4 bg-[#2563EB] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase">Popular</span>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-[#010101]">{plan.label}</h4>
                      {selectedPlan === plan.id && <CheckCircle2 size={16} className="text-[#2563EB]" />}
                    </div>
                    <p className="text-2xl font-bold mb-1">
                      {plan.price}<span className="text-sm font-normal text-[#6B7280]">/{plan.period}</span>
                    </p>
                    <p className="text-xs text-[#6B7280] mb-3">{plan.description}</p>
                    <div className="space-y-1">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-2">
                          <Check size={11} className="text-green-500 flex-shrink-0" />
                          <span className="text-xs text-[#6B7280]">{f}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  showToast(`${PLANS.find(p => p.id === selectedPlan)?.label} plan selected!`, 'success');
                  setStep('onboarding-brand');
                }}
                style={{ backgroundColor: brandColor }}
                className="w-full h-14 rounded-xl text-white font-bold mt-6"
              >
                Continue with {PLANS.find(p => p.id === selectedPlan)?.label} Plan
              </button>
            </motion.div>
          )}

          {/* ── WORKSPACE SETUP ── */}
          {step === 'onboarding-brand' && (
            <motion.div key="brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Your Workspace</h2>
                <p className="text-sm text-[#6B7280] mt-2">Last step! Name your workspace</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Business / Workspace Name</label>
                  <input
                    type="text" placeholder="e.g. Modern Studio"
                    value={businessName} onChange={e => setBusinessName(e.target.value)}
                    className="w-full h-14 px-4 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div className="p-4 bg-[#FAFAFA] border border-[#E1E1E1] rounded-xl space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Your Setup Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Role</span>
                    <span className="font-bold text-[#010101] capitalize">{selectedRole}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Plan</span>
                    <span className="font-bold text-[#010101]">{PLANS.find(p => p.id === selectedPlan)?.label} — {PLANS.find(p => p.id === selectedPlan)?.price}/{PLANS.find(p => p.id === selectedPlan)?.period}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!businessName.trim()) return showToast('Please enter your business name.', 'error');
                    setStep('welcome-modal');
                  }}
                  style={{ backgroundColor: brandColor }}
                  className="w-full h-14 rounded-xl text-white font-bold text-lg"
                >
                  Finish Setup
                </button>
              </div>
            </motion.div>
          )}

          {/* ── WELCOME ── */}
          {step === 'welcome-modal' && (
            <motion.div key="welcome" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center p-4">
              <div className="w-20 h-20 bg-[#F0F4FF] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-sm">
                <PartyPopper size={40} className="text-[#2563EB]" />
              </div>
              <h2 className="text-4xl font-extrabold text-[#010101] mb-3">Welcome to DanPay</h2>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-6 mx-auto max-w-[340px]">
                We are here to make sure your <span className="text-[#010101] font-bold">Client Dan(done) pay</span>.
              </p>
              <div className="p-4 bg-[#F0F4FF] border border-[#2563EB]/20 rounded-xl mb-8 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280] font-bold">Workspace</span>
                  <span className="font-bold text-[#010101]">{businessName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280] font-bold">Plan</span>
                  <span className="font-bold text-[#010101]">{PLANS.find(p => p.id === selectedPlan)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280] font-bold">Role</span>
                  <span className="font-bold text-[#010101] capitalize">{selectedRole}</span>
                </div>
              </div>
              <button onClick={handleFinishOnboarding} style={{ backgroundColor: brandColor }} className="w-full h-16 rounded-2xl text-white font-bold text-lg">
                Continue to Dashboard →
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <AuthToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}