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
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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

export default function AuthFlow({ onComplete }) {
  const { login, setWorkspaceName } = useAuth();
  const [step, setStep] = useState('login');
  
  // NEW: Track if user is signing up or logging in
  const [isNewUser, setIsNewUser] = useState(false); 
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleSearch, setRoleSearch] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(60);

  const brandColor = '#2563EB';

  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const strength = useMemo(() => ({
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    length: password.length >= 8
  }), [password]);

  const filteredRoles = useMemo(() => ROLES.filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase())), [roleSearch]);

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
          
          {/* --- LOGIN --- */}
          {step === 'login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Welcome back</h2>
                <p className="text-sm text-[#6B7280] mt-2">Login to manage your workspace</p>
              </div>
              <div className="space-y-4">
                <button className="w-full h-14 border border-[#E1E1E1] rounded-xl flex items-center justify-center gap-3 font-bold hover:bg-[#FAFAFA] transition-all"><GoogleIcon /> Continue with Google</button>
                <div className="relative flex items-center py-4"><div className="flex-grow border-t border-[#E1E1E1]"></div><span className="flex-shrink mx-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">or</span><div className="flex-grow border-t border-[#E1E1E1]"></div></div>
                <div className="space-y-4">
                  <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-14 px-4 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-14 px-4 pr-12 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                </div>
                <div className="text-right">
                  <button onClick={() => setStep('forgot-password')} className="text-xs font-bold text-[#2563EB]">Forgot Password?</button>
                </div>
                <button onClick={() => { setIsNewUser(false); setTimer(60); setStep('otp'); }} style={{ backgroundColor: brandColor }} className="w-full h-14 rounded-xl text-white font-bold text-lg">Login</button>
                <p className="text-center text-sm text-[#6B7280] mt-4">Don't have an account? <button onClick={() => { setIsNewUser(true); setPassword(''); setStep('signup'); }} className="font-bold text-[#2563EB]">Sign Up</button></p>
              </div>
            </motion.div>
          )}

          {/* --- FORGOT PASSWORD --- */}
          {step === 'forgot-password' && (
            <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-8 relative">
                <button onClick={() => setStep('login')} className="absolute -left-2 top-0 p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
                <h2 className="text-3xl font-bold">Reset Password</h2>
                <p className="text-sm text-[#6B7280] mt-2">Enter your email to receive reset details</p>
              </div>
              <div className="space-y-6">
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-14 px-4 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" />
                <button onClick={() => alert('Reset link sent to ' + email)} style={{ backgroundColor: brandColor }} className="w-full h-14 rounded-xl text-white font-bold">Send Reset Link</button>
              </div>
            </motion.div>
          )}

          {/* --- SIGN UP --- */}
          {step === 'signup' && (
            <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-8 relative">
                <button onClick={() => setStep('login')} className="absolute -left-2 top-0 p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
                <h2 className="text-3xl font-bold">Create Account</h2>
                <p className="text-sm text-[#6B7280] mt-2">Enter your details to get started</p>
              </div>
              <div className="space-y-4">
                <button className="w-full h-14 border border-[#E1E1E1] rounded-xl flex items-center justify-center gap-3 font-bold hover:bg-[#FAFAFA] transition-all"><GoogleIcon /> Sign up with Google</button>
                <div className="relative flex items-center py-4"><div className="flex-grow border-t border-[#E1E1E1]"></div><span className="flex-shrink mx-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">or</span><div className="flex-grow border-t border-[#E1E1E1]"></div></div>
                <div className="space-y-4">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full h-14 px-4 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" />
                  <div className="space-y-3">
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-14 px-4 pr-12 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-1">
                      {[ { key: 'upper', label: 'One Uppercase' }, { key: 'lower', label: 'One Lowercase' }, { key: 'symbol', label: 'One Symbol' }, { key: 'length', label: '8+ Characters' }, ].map(req => (
                        <div key={req.key} className="flex items-center gap-2">
                          {strength[req.key] ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-gray-300" />}
                          <span className={`text-[10px] font-bold ${strength[req.key] ? 'text-green-600' : 'text-[#6B7280]'}`}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => { setIsNewUser(true); setTimer(60); setStep('otp'); }} disabled={!strength.upper || !strength.lower || !strength.symbol || !strength.length} style={{ backgroundColor: brandColor }} className="w-full h-14 rounded-xl text-white font-bold text-lg disabled:opacity-50">Continue</button>
                <p className="text-center text-sm text-[#6B7280] mt-4">Already have an account? <button onClick={() => setStep('login')} className="font-bold text-[#2563EB]">Login</button></p>
              </div>
            </motion.div>
          )}

          {/* --- OTP --- */}
          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-8"><h2 className="text-3xl font-bold">Verify Email</h2><p className="text-sm text-[#6B7280] mt-2">We have sent a 4 digit OTP to <span className="text-[#010101] font-bold">{email || 'your email'}</span></p></div>
              <div className="flex justify-center gap-4 mb-8">
                {otp.map((digit, idx) => (
                  <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} className="w-16 h-20 text-center text-3xl font-bold border-2 border-[#E1E1E1] rounded-2xl focus:border-[#2563EB] outline-none" />
                ))}
              </div>
              <button 
                onClick={() => {
                  // LOGIC: If existing user, skip everything and go to Dashboard
                  if (!isNewUser) {
                    login({ name: 'User' });
                    onComplete(false); // Tell parent to skip onboarding
                  } else {
                    setStep('onboarding-role');
                  }
                }} 
                style={{ backgroundColor: brandColor }} 
                className="w-full h-14 rounded-xl text-white font-bold text-lg"
              >
                Verify & Continue
              </button>
              <div className="text-center mt-8">{timer > 0 ? ( <p className="text-sm text-[#6B7280]">Resend OTP in 0:{timer < 10 ? `0${timer}` : timer}</p> ) : ( <button onClick={() => setTimer(60)} className="text-sm font-bold text-[#2563EB]">Resend OTP Now</button> )}</div>
            </motion.div>
          )}

          {/* --- ONBOARDING ROLE --- */}
          {step === 'onboarding-role' && (
            <motion.div key="role" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-8"><h2 className="text-3xl font-bold">Who are you?</h2><p className="text-sm text-[#6B7280] mt-2">Search and select your role</p></div>
              <div className="relative mb-6"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} /><input type="text" placeholder="Search roles..." className="w-full h-12 pl-12 pr-4 bg-[#FAFAFA] border border-[#E1E1E1] rounded-xl outline-none" onChange={(e) => setRoleSearch(e.target.value)} /></div>
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {filteredRoles.map((role) => (
                  <button key={role.id} onClick={() => setSelectedRole(role.id)} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedRole === role.id ? 'border-[#2563EB] bg-[#F0F4FF]' : 'border-[#E1E1E1]'}`} >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRole === role.id ? 'bg-[#2563EB] text-white' : 'bg-gray-100'}`}><role.icon size={20} /></div>
                    <div><p className="font-bold text-sm">{role.label}</p><p className="text-xs text-[#6B7280]">{role.desc}</p></div>
                  </button>
                ))}
              </div>
              <button disabled={!selectedRole} onClick={() => setStep('onboarding-plan')} style={{ backgroundColor: brandColor }} className="w-full h-14 rounded-xl text-white font-bold text-lg mt-8 disabled:opacity-50" >Next Step</button>
            </motion.div>
          )}

          {/* --- ONBOARDING PLAN --- */}
          {step === 'onboarding-plan' && (
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-8"><h2 className="text-3xl font-bold">Choose plan</h2><p className="text-sm text-[#6B7280] mt-2">Select a plan to continue</p></div>
              <div className="space-y-4">
                <div className="p-5 border-2 border-[#2563EB] bg-[#F0F4FF] rounded-2xl relative"><span className="absolute -top-3 right-4 bg-[#2563EB] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase">Popular</span><h4 className="font-bold text-[#010101]">Individual Plan</h4><p className="text-2xl font-bold mt-1">$12<span className="text-sm font-normal text-[#6B7280]">/mo</span></p></div>
                <div className="p-5 border border-[#E1E1E1] rounded-2xl"><h4 className="font-bold text-[#6B7280]">Free Plan</h4><p className="text-2xl font-bold mt-1">$0</p></div>
              </div>
              <button onClick={() => setStep('onboarding-brand')} style={{ backgroundColor: brandColor }} className="w-full h-14 rounded-xl text-white font-bold mt-8">Continue</button>
            </motion.div>
          )}

          {/* --- ONBOARDING BRAND --- */}
          {step === 'onboarding-brand' && (
            <motion.div key="brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-8"><h2 className="text-3xl font-bold">Branding</h2><p className="text-sm text-[#6B7280] mt-2">Last step! Name your workspace</p></div>
              <div className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Business Name</label><input type="text" placeholder="e.g. Modern Studio" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full h-14 px-4 rounded-xl border border-[#E1E1E1] outline-none focus:border-[#2563EB]" /></div>
                <button onClick={() => setStep('welcome-modal')} style={{ backgroundColor: brandColor }} className="w-full h-14 rounded-xl text-white font-bold text-lg" >Finish Setup</button>
              </div>
            </motion.div>
          )}

          {/* --- WELCOME MODAL --- */}
          {step === 'welcome-modal' && (
            <motion.div key="welcome" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-4">
              <div className="w-20 h-20 bg-[#F0F4FF] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-sm"><PartyPopper size={40} className="text-[#2563EB]" /></div>
              <h2 className="text-4xl font-extrabold text-[#010101] mb-3">Welcome to DanPay</h2>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-10 mx-auto max-w-[340px]">We are here to make sure your <span className="text-[#010101] font-bold">Client Dan(done) pay</span>.</p>
              <button onClick={() => { if (businessName) setWorkspaceName(businessName); login({ name: 'User' }); onComplete(true); }} style={{ backgroundColor: brandColor }} className="w-full h-16 rounded-2xl text-white font-bold text-lg" >Continue to Dashboard</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}