import { AuthProvider, useAuth } from "./AuthContext";
import AuthFlow from "./AuthFlow";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Receipt, Users, Settings, 
  Plus, Bell, Search, CreditCard, Clock, AlertCircle, 
  Inbox, UserPlus, FilePlus, Palette, Globe, 
  X, Trash2, ArrowLeft, CheckCircle2, Upload, 
  BarChart3, Mail, MapPin, ChevronRight, Eye,
  Shield, Users2, BellRing, Lock, Monitor, Share2, Download, ChevronDown, Send, PlusCircle,
  Link, Copy, Check, Landmark, BadgeCheck, Building2, Hash, RefreshCw, Wallet, AlertTriangle,
  ArrowDownLeft, ArrowUpRight, Star, Zap, Building, CircleCheck, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// ─────────────────────────────────────────────
// STYLING CONSTANTS — used throughout for consistency
// ─────────────────────────────────────────────
const COLORS = {
  border: '#E1E1E1',
  textMuted: '#6B7280',
  textPrimary: '#010101',
  bgSecondary: '#FAFAFA'
};

// ─────────────────────────────────────────────
// REUSABLE: Generic labeled input field (text, date, number, select)
// ─────────────────────────────────────────────
const InputField = ({ label, type = "text", placeholder, name, value, onChange, options }) => (
  <div className="space-y-2 w-full text-left">
    <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">{label}</label>
    {type === "select" ? (
      <select 
        name={name} value={value} onChange={onChange}
        className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors appearance-none cursor-pointer text-sm"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    ) : (
      <input 
        name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
      />
    )}
  </div>
);

// ─────────────────────────────────────────────
// REUSABLE: Empty state placeholder shown when a list has no data
// ─────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, description, actionText, onAction, brandColor }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed border-[#E1E1E1] rounded-xl bg-[#FAFAFA]"
  >
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-[#E1E1E1] mb-6">
      <Icon size={32} style={{ color: brandColor }} />
    </div>
    <h3 className="text-xl font-bold text-[#010101] mb-2">{title}</h3>
    <p className="text-[#6B7280] max-w-sm mb-8 text-sm leading-relaxed">{description}</p>
    <button 
      onClick={onAction} 
      style={{ backgroundColor: brandColor }}
      className="text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
    >
      <Plus size={18} /> {actionText}
    </button>
  </motion.div>
);

// ─────────────────────────────────────────────
// REUSABLE: Search + filter bar used on Invoices, Receipts, Clients pages
// ─────────────────────────────────────────────
const FilterBar = ({ searchValue, onSearchChange, searchPlaceholder, filters, activeFilter, onFilterChange, brandColor }) => (
  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
    <div className="relative flex-1 w-full sm:max-w-xs">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
      <input
        type="text"
        value={searchValue}
        onChange={e => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder || 'Search...'}
        className="w-full h-[40px] pl-9 pr-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
      />
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map(f => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className="h-[36px] px-4 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all"
          style={activeFilter === f.value
            ? { backgroundColor: brandColor, color: '#fff', borderColor: brandColor }
            : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E1E1E1' }
          }
        >
          {f.label}
        </button>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// SHARE DRAWER: Slide-in panel to share invoice/receipt via link or email
// ─────────────────────────────────────────────
const ShareDrawer = ({ isOpen, onClose, item, type, brandColor, currencySymbol }) => {
  const [emailInput, setEmailInput] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  // Generate a deterministic shareable link from item id
  const shareLink = item ? `https://danpay.app/view/${type === 'receipt' ? 'rct' : 'inv'}-${item.id?.toLowerCase?.() || item.id}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add email to recipient list after basic validation
  const addEmail = () => {
    const trimmed = emailInput.trim();
    if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && !emailList.includes(trimmed)) {
      setEmailList([...emailList, trimmed]);
      setEmailInput('');
    }
  };

  const removeEmail = (email) => setEmailList(emailList.filter(e => e !== email));

  // Simulate sending — shows success state then closes the drawer
  const handleSend = () => {
    if (emailList.length === 0) return;
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); setEmailList([]); }, 2000);
  };

  const handleClose = () => { onClose(); setEmailList([]); setEmailInput(''); setSent(false); setCopied(false); };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          {/* Backdrop overlay — clicking closes the drawer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[80]" />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white border-l border-[#E1E1E1] z-[90] flex flex-col"
          >
            {/* Drawer header with item reference */}
            <div className="flex justify-between items-center p-8 border-b border-[#E1E1E1]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Share {type === 'receipt' ? 'Receipt' : 'Invoice'}</p>
                <h2 className="text-xl font-bold">{type === 'receipt' ? `RCT-${item.id}` : item.id}</h2>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-[#FAFAFA] rounded-full border border-[#E1E1E1]"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Shareable link section — one-click copy */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Shareable Link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 h-[44px] px-4 rounded-[8px] border border-[#E1E1E1] bg-[#FAFAFA]">
                    <Link size={14} className="text-[#6B7280] flex-shrink-0" />
                    <span className="text-xs text-[#6B7280] truncate">{shareLink}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 flex items-center gap-1.5 h-[44px] px-4 rounded-[8px] border border-[#E1E1E1] text-xs font-bold transition-all hover:bg-[#FAFAFA]"
                    style={{ color: copied ? '#10B981' : '#6B7280', borderColor: copied ? '#10B981' : '#E1E1E1' }}
                  >
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
                <p className="text-[11px] text-[#6B7280]">Anyone with this link can view the {type === 'receipt' ? 'receipt' : 'invoice'}.</p>
              </div>

              {/* Send via email section — supports multiple recipients */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Send via Email</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }}
                    placeholder="Add email address..."
                    className="flex-1 h-[44px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                  />
                  <button onClick={addEmail} className="h-[44px] px-4 rounded-[8px] border border-[#E1E1E1] text-sm font-bold text-[#6B7280] hover:bg-[#FAFAFA] transition-colors">Add</button>
                </div>

                {/* Email recipient pill chips */}
                {emailList.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {emailList.map(email => (
                      <span key={email} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F4FF] text-xs font-bold" style={{ color: brandColor }}>
                        <Mail size={11} />{email}
                        <button onClick={() => removeEmail(email)} className="ml-1 hover:opacity-70"><X size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Message preview box shown when recipients are added */}
                {emailList.length > 0 && (
                  <div className="p-4 bg-[#FAFAFA] border border-[#E1E1E1] rounded-lg text-xs text-[#6B7280] space-y-1">
                    <p className="font-bold text-[#010101]">Message preview</p>
                    <p>Hi, please find the {type === 'receipt' ? 'payment receipt' : 'invoice'} {type === 'receipt' ? `RCT-${item.id}` : item.id} for <strong>{item.client}</strong> — {currencySymbol}{Number(item.amount).toLocaleString()}.</p>
                    <p className="text-[#2563EB] underline">{shareLink}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Send CTA — disabled until at least one recipient is added */}
            <div className="p-8 border-t border-[#E1E1E1]">
              <button
                onClick={handleSend}
                disabled={emailList.length === 0}
                className="w-full h-[52px] rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: sent ? '#10B981' : brandColor }}
              >
                {sent ? <><CheckCircle2 size={16} /> Sent successfully!</> : <><Send size={16} /> Send to {emailList.length > 0 ? `${emailList.length} recipient${emailList.length > 1 ? 's' : ''}` : 'recipients'}</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// FAB: Mobile floating action button to create invoice or add client
// Only visible on mobile (md:hidden) — expands to reveal sub-actions
// ─────────────────────────────────────────────
const FAB = ({ brandColor, onNewInvoice, onNewClient }) => {
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-[80px] right-4 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {fabOpen && (
          <>
            {/* Sub-action: Add new client */}
            <motion.button
              initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ delay: 0.05 }}
              onClick={() => { setFabOpen(false); onNewClient(); }}
              className="flex items-center gap-2 px-4 h-[44px] rounded-full text-white text-sm font-bold"
              style={{ backgroundColor: brandColor }}
            >
              <UserPlus size={16} /> New Client
            </motion.button>
            {/* Sub-action: Create new invoice */}
            <motion.button
              initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ delay: 0 }}
              onClick={() => { setFabOpen(false); onNewInvoice(); }}
              className="flex items-center gap-2 px-4 h-[44px] rounded-full text-white text-sm font-bold"
              style={{ backgroundColor: brandColor }}
            >
              <FilePlus size={16} /> New Invoice
            </motion.button>
          </>
        )}
      </AnimatePresence>
      {/* Main FAB button — rotates to X when open */}
      <motion.button
        onClick={() => setFabOpen(!fabOpen)}
        className="w-14 h-14 rounded-full text-white flex items-center justify-center"
        style={{ backgroundColor: brandColor }}
        animate={{ rotate: fabOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
};

// ─────────────────────────────────────────────
// ESCROW ACCOUNT GENERATOR: Creates a unique virtual receiving account per invoice
// Uses a deterministic seed from the invoice ID so the same account is reproducible
// ─────────────────────────────────────────────
const generateEscrowAccount = (invoiceId) => {
  const seed = invoiceId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const routing = `0${(seed * 7 + 110000000) % 900000000 + 100000000}`;
  const account = `${(seed * 13 + 1000000000) % 9000000000 + 1000000000}`;
  return {
    routingNumber: routing,
    accountNumber: account,
    bankName: 'DanPay Escrow Bank',
    accountName: 'DanPay Escrow Services LLC',
    reference: `ESC-${invoiceId}`,
    status: 'active', // possible states: active | funded | released
  };
};

// ─────────────────────────────────────────────
// ESCROW BADGE: Small pill shown on invoices that have escrow enabled
// ─────────────────────────────────────────────
const EscrowBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider border border-purple-100">
    <Landmark size={10} /> Escrow
  </span>
);

// ─────────────────────────────────────────────
// PRICING MODAL: Full-screen overlay showing Free / Individual / Organisation plans
// Triggered by clicking the free plan usage card or upgrade CTA in the sidebar
// ─────────────────────────────────────────────
const PricingModal = ({ isOpen, onClose, brandColor }) => {
  // Plan definitions — each has a label, price, description, feature list, and CTA text
  const plans = [
    {
      id: 'free',
      label: 'Free',
      price: '$0',
      period: 'forever',
      description: 'For freelancers just getting started.',
      features: [
        '10 invoices per month',
        '5 clients',
        'Basic receipts',
        'Shareable links',
        'Email support',
      ],
      cta: 'Current Plan',
      isCurrent: true,
      highlight: false,
    },
    {
      id: 'individual',
      label: 'Individual',
      price: '$12',
      period: 'per month',
      description: 'For active freelancers with growing client bases.',
      features: [
        'Unlimited invoices',
        'Unlimited clients',
        'Escrow payments',
        'Recurring invoices',
        'Analytics dashboard',
        'Priority email support',
      ],
      cta: 'Upgrade to Individual',
      isCurrent: false,
      highlight: true, // visually highlighted as the recommended plan
    },
    {
      id: 'organisation',
      label: 'Organisation',
      price: '$29',
      period: 'per month',
      description: 'For teams and agencies managing multiple clients.',
      features: [
        'Everything in Individual',
        'Unlimited team members',
        'Role-based access control',
        'Workspace management',
        'Priority phone support',
        'Custom branding',
        'API access',
      ],
      cta: 'Upgrade to Organisation',
      isCurrent: false,
      highlight: false,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-screen backdrop — clicking outside closes the modal */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
          />
          {/* Centered modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8"
            onClick={e => e.stopPropagation()} // prevent backdrop click from bubbling
          >
            <div className="bg-white rounded-2xl border border-[#E1E1E1] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal header */}
              <div className="flex items-center justify-between p-8 border-b border-[#E1E1E1]">
                <div>
                  <h2 className="text-2xl font-bold text-[#010101]">Choose your plan</h2>
                  <p className="text-sm text-[#6B7280] mt-1">Upgrade anytime. Cancel whenever you need to.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-[#FAFAFA] rounded-full border border-[#E1E1E1]">
                  <X size={20} />
                </button>
              </div>

              {/* Plan cards — responsive 1-col on mobile, 3-col on desktop */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border p-6 flex flex-col gap-5 transition-all ${
                      plan.highlight
                        ? 'border-[#2563EB] bg-[#F0F4FF]'
                        : 'border-[#E1E1E1] bg-white'
                    }`}
                  >
                    {/* Recommended badge — only on the highlighted plan */}
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white" style={{ backgroundColor: brandColor }}>
                          Recommended
                        </span>
                      </div>
                    )}

                    {/* Plan label and price */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280] mb-2">{plan.label}</p>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-[#010101]">{plan.price}</span>
                        <span className="text-sm text-[#6B7280] mb-1">/{plan.period}</span>
                      </div>
                      <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">{plan.description}</p>
                    </div>

                    {/* Feature list with checkmarks */}
                    <ul className="space-y-3 flex-1">
                      {plan.features.map(feat => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: plan.highlight ? brandColor : '#10B981' }} />
                          <span className="text-[#010101]">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Plan CTA button — disabled/greyed for current plan */}
                    <button
                      onClick={() => { if (!plan.isCurrent) alert(`Upgrade to ${plan.label} — payment flow coming soon!`); }}
                      disabled={plan.isCurrent}
                      className="w-full h-[48px] rounded-lg text-sm font-bold transition-all disabled:cursor-default"
                      style={
                        plan.isCurrent
                          ? { backgroundColor: '#F3F4F6', color: '#9CA3AF', border: '1px solid #E1E1E1' }
                          : plan.highlight
                            ? { backgroundColor: brandColor, color: '#fff' }
                            : { backgroundColor: '#fff', color: brandColor, border: `2px solid ${brandColor}` }
                      }
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer note */}
              <div className="px-8 pb-8 text-center">
                <p className="text-xs text-[#6B7280]">All paid plans include a 14-day free trial. No credit card required to start.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────
function DanPay() {

const { workspaceName } = useAuth();

  // ── Core navigation & UI state ──
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  // ── Data lists ──
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);

  // ── Detail drawer state for invoice, receipt, client ──
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [reminderSent, setReminderSent] = useState({});
  const [editClientDraft, setEditClientDraft] = useState(null);

  // ── Share drawer state (which item + its type) ──
  const [shareItem, setShareItem] = useState(null);
  const [shareType, setShareType] = useState('invoice');

  // ── Filter state for invoices list ──
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('all');

  // ── Filter state for receipts list ──
  const [receiptSearch, setReceiptSearch] = useState('');
  const [receiptDateFilter, setReceiptDateFilter] = useState('all');

  // ── Sub-tab within the Invoices view on mobile ('invoices' | 'receipts') ──
  const [invoiceMobileTab, setInvoiceMobileTab] = useState('invoices');

  // ── Filter state for clients list ──
  const [clientSearch, setClientSearch] = useState('');

  // ── Pricing modal visibility ──
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // ── Wallet state — balance, transactions, saved cards, active sub-tab ──
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletCards, setWalletCards] = useState([]);
  const [walletTab, setWalletTab] = useState('overview'); // overview | withdraw | add-card | pay
  const [walletCardDraft, setWalletCardDraft] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [walletPayDraft, setWalletPayDraft] = useState({ recipient: '', amount: '', note: '' });
  const [walletWithdrawDraft, setWalletWithdrawDraft] = useState({ amount: '', method: 'bank' });
  const [walletActionFeedback, setWalletActionFeedback] = useState('');

  // ── New invoice form draft state (reset after submission) ──
  const [invoiceDraft, setInvoiceDraft] = useState({ 
    client: '', 
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ id: 1, desc: '', qty: 1, rate: 0 }],
    discount: 0,
    tax: 0,
    notes: '',
    type: 'one-time',
    escrowEnabled: false, // when true, a unique virtual account is generated for this invoice
  });

  // ── Workspace settings (business name, currency, brand color, etc.) ──
   // UPDATED: Initializing with workspaceName from Context
  const [settings, setSettings] = useState({
    businessName: workspaceName || 'Modern Studio',
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    brandColor: '#2563EB',
    location: 'London, UK'
  });

  // ADDED: This ensures that if the workspace name is updated in the context 
  // (during onboarding), it reflects immediately in the settings state.
  useEffect(() => {
    if (workspaceName) {
      setSettings(prev => ({ ...prev, businessName: workspaceName }));
    }
  }, [workspaceName]);

  // ── Payout/bank settings used for Escrow withdrawals ──
  const [payoutSettings, setPayoutSettings] = useState({
    taxId: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    verified: false,
    verifying: false,
  });

  // ── Members list for workspace member management ──
  const [members, setMembers] = useState([
    { id: 1, name: 'You (Owner)', email: 'owner@modernstudio.com', role: 'Owner', status: 'active' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  // ─────────────────────────────────────────────
  // COMPUTED: Invoice line items subtotal, tax amount, and grand total
  // ─────────────────────────────────────────────
  const subtotal = useMemo(() => 
    invoiceDraft.items.reduce((acc, item) => acc + (item.qty * item.rate), 0)
  , [invoiceDraft.items]);

  const taxAmount = (subtotal * (invoiceDraft.tax / 100));
  const grandTotal = (subtotal + taxAmount - invoiceDraft.discount);

  // ─────────────────────────────────────────────
  // COMPUTED: Currency symbol based on settings.currency
  // ─────────────────────────────────────────────
  const currencySymbol = useMemo(() => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
    return symbols[settings.currency] || '$';
  }, [settings.currency]);

  // ─────────────────────────────────────────────
  // COMPUTED: Filtered invoice list applying search + status + type filters
  // ─────────────────────────────────────────────
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = !invoiceSearch || 
        inv.id.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        inv.client.toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchesStatus = invoiceStatusFilter === 'all' || inv.status === invoiceStatusFilter;
      const matchesType = invoiceTypeFilter === 'all' || inv.type === invoiceTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [invoices, invoiceSearch, invoiceStatusFilter, invoiceTypeFilter]);

  // ─────────────────────────────────────────────
  // COMPUTED: Only paid invoices are surfaced in the Receipts view
  // ─────────────────────────────────────────────
  const paidInvoices = useMemo(() => invoices.filter(i => i.status === 'Paid'), [invoices]);

  const filteredReceipts = useMemo(() => {
    return paidInvoices.filter(inv => {
      const matchesSearch = !receiptSearch ||
        inv.id.toLowerCase().includes(receiptSearch.toLowerCase()) ||
        inv.client.toLowerCase().includes(receiptSearch.toLowerCase());
      return matchesSearch;
    });
  }, [paidInvoices, receiptSearch]);

  // ─────────────────────────────────────────────
  // COMPUTED: Filtered clients list by name, email, or company
  // ─────────────────────────────────────────────
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      return !clientSearch ||
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.company || '').toLowerCase().includes(clientSearch.toLowerCase());
    });
  }, [clients, clientSearch]);

  // ─────────────────────────────────────────────
  // COMPUTED: Count invoices sent this month for the free plan usage indicator
  // Free plan is capped at 10 invoices per calendar month
  // ─────────────────────────────────────────────
  const invoicesThisMonth = useMemo(() => {
    const now = new Date();
    return invoices.filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [invoices]);

  const FREE_PLAN_LIMIT = 10;
  const invoicesRemaining = Math.max(0, FREE_PLAN_LIMIT - invoicesThisMonth);
  const usagePct = Math.min(100, (invoicesThisMonth / FREE_PLAN_LIMIT) * 100);

  // ─────────────────────────────────────────────
  // HANDLER: Add new client from the client drawer form
  // ─────────────────────────────────────────────
  const handleAddClient = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newClient = { 
      id: Date.now(), 
      name: formData.get('clientName'), 
      email: formData.get('clientEmail'), 
      location: formData.get('clientLocation') || settings.location,
      company: formData.get('clientCompany') || '',
      address: formData.get('clientAddress') || '',
    };
    if (!newClient.name) return;
    setClients([...clients, newClient]);
    setIsClientDrawerOpen(false);
    e.target.reset();
  };

  // ─────────────────────────────────────────────
  // HANDLER: Create invoice — optionally attaches an escrow account
  // Resets the draft form after a successful submission
  // ─────────────────────────────────────────────
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const newId = `INV-${1001 + invoices.length}`;
    const newInv = {
      id: newId,
      client: invoiceDraft.client,
      // Look up client email from the clients array for display in detail views
      clientEmail: clients.find(c => c.name === invoiceDraft.client)?.email || '',
      amount: grandTotal,
      date: invoiceDraft.issueDate,
      dueDate: invoiceDraft.dueDate,
      status: 'Pending',
      type: invoiceDraft.type,
      items: invoiceDraft.items,
      discount: invoiceDraft.discount,
      tax: invoiceDraft.tax,
      notes: invoiceDraft.notes,
      // Generate a unique escrow account if the toggle is enabled, otherwise null
      escrow: invoiceDraft.escrowEnabled ? generateEscrowAccount(newId) : null,
    };
    setInvoices([newInv, ...invoices]);
    setCurrentView('invoices');
    // Reset draft to clean defaults for the next invoice
    setInvoiceDraft({ client: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', items: [{ id: 1, desc: '', qty: 1, rate: 0 }], discount: 0, tax: 0, notes: '', type: 'one-time', escrowEnabled: false });
  };

  // ─────────────────────────────────────────────
  // HANDLER: Simulate bank account verification for payout settings
  // Shows a 2-second loading state then marks the account as verified
  // ─────────────────────────────────────────────
  const handleBankVerification = () => {
    setPayoutSettings(p => ({ ...p, verifying: true, verified: false }));
    setTimeout(() => {
      setPayoutSettings(p => ({ ...p, verifying: false, verified: true }));
    }, 2000);
  };

  // ─────────────────────────────────────────────
  // HANDLER: Send workspace invite (simulated — free plan users hit an upgrade gate)
  // ─────────────────────────────────────────────
  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => { setInviteSent(false); setInviteEmail(''); }, 2500);
  };

  // Add an empty line item row to the invoice draft
  const addLineItem = () => {
    setInvoiceDraft({
      ...invoiceDraft,
      items: [...invoiceDraft.items, { id: Date.now(), desc: '', qty: 1, rate: 0 }]
    });
  };

  // ─────────────────────────────────────────────
  // HANDLER: Wallet — save a new card to the wallet
  // Extracts the last 4 digits for display; stores brand as Visa placeholder
  // ─────────────────────────────────────────────
  const handleAddCard = () => {
    if (!walletCardDraft.number || !walletCardDraft.name || !walletCardDraft.expiry) return;
    const last4 = walletCardDraft.number.replace(/\s/g, '').slice(-4);
    setWalletCards([...walletCards, { id: Date.now(), last4, name: walletCardDraft.name, expiry: walletCardDraft.expiry, brand: 'Visa' }]);
    setWalletCardDraft({ number: '', name: '', expiry: '', cvv: '' });
    setWalletActionFeedback('Card added successfully!');
    setWalletTab('overview');
    setTimeout(() => setWalletActionFeedback(''), 3000);
  };

  // ─────────────────────────────────────────────
  // HANDLER: Wallet — withdraw funds to a linked bank account
  // Deducts amount from balance and logs a withdraw transaction
  // ─────────────────────────────────────────────
  const handleWithdraw = () => {
    const amt = Number(walletWithdrawDraft.amount);
    if (!amt || amt > walletBalance) return;
    setWalletBalance(b => b - amt);
    setWalletTransactions(t => [{ id: Date.now(), type: 'withdraw', label: 'Withdrawal to bank', amount: -amt, date: new Date().toLocaleDateString() }, ...t]);
    setWalletWithdrawDraft({ amount: '', method: 'bank' });
    setWalletActionFeedback('Withdrawal initiated!');
    setWalletTab('overview');
    setTimeout(() => setWalletActionFeedback(''), 3000);
  };

  // ─────────────────────────────────────────────
  // HANDLER: Wallet — send payment directly to a named recipient
  // Deducts amount from balance and logs a pay transaction
  // ─────────────────────────────────────────────
  const handleWalletPay = () => {
    const amt = Number(walletPayDraft.amount);
    if (!walletPayDraft.recipient || !amt || amt > walletBalance) return;
    setWalletBalance(b => b - amt);
    setWalletTransactions(t => [{ id: Date.now(), type: 'pay', label: `Payment to ${walletPayDraft.recipient}`, amount: -amt, date: new Date().toLocaleDateString() }, ...t]);
    setWalletPayDraft({ recipient: '', amount: '', note: '' });
    setWalletActionFeedback('Payment sent!');
    setWalletTab('overview');
    setTimeout(() => setWalletActionFeedback(''), 3000);
  };

  // ─────────────────────────────────────────────
  // HANDLER: When an escrow-linked invoice is marked as paid,
  // automatically credit the wallet balance and log an escrow release transaction
  // ─────────────────────────────────────────────
  const handleMarkEscrowPaid = (invoice) => {
    if (invoice.escrow) {
      setWalletBalance(b => b + Number(invoice.amount));
      setWalletTransactions(t => [{ id: Date.now(), type: 'escrow', label: `Escrow released — ${invoice.id}`, amount: Number(invoice.amount), date: new Date().toLocaleDateString() }, ...t]);
    }
  };

  // ─────────────────────────────────────────────
  // SIDEBAR NAVIGATION ITEMS — Desktop only (all pages including analytics)
  // ─────────────────────────────────────────────
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // ─────────────────────────────────────────────
  // MOBILE NAVIGATION ITEMS — Receipts is hidden (merged into Invoices),
  // Analytics is desktop-only and excluded from the mobile tab bar
  // ─────────────────────────────────────────────
  const mobileMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // ─────────────────────────────────────────────
  // STATUS STYLES: Tailwind badge class map for invoice status pills
  // ─────────────────────────────────────────────
  const statusStyles = {
    Pending: 'bg-yellow-50 text-yellow-600',
    Paid: 'bg-green-50 text-green-600',
    Overdue: 'bg-red-50 text-red-500',
    Sent: 'bg-blue-50 text-blue-600',
    Draft: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="flex min-h-screen bg-white text-[#010101] font-['Open_Sauce_Sans',sans-serif]">

      {/* ─────────────────────────────────────────────
          PRICING MODAL — rendered at the root level so it overlays everything
          Opened from: the free plan usage card, or the upgrade CTA in sidebar
          ───────────────────────────────────────────── */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        brandColor={settings.brandColor}
      />

      {/* ─────────────────────────────────────────────
          SIDEBAR — desktop only (hidden on mobile via md:flex)
          Contains: workspace switcher, nav links, free plan usage indicator
          ───────────────────────────────────────────── */}
      <aside className="w-64 border-r border-[#E1E1E1] p-6 hidden md:flex flex-col fixed h-full bg-white z-20">
        
        {/* WORKSPACE SWITCHER: Dropdown to switch workspace or create new one */}
        <div className="relative mb-10">
          <button 
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="flex items-center justify-between w-full p-2 rounded-lg border border-[#E1E1E1] hover:bg-[#FAFAFA] transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: settings.brandColor }} />
              <div className="text-left overflow-hidden">
                <p className="text-sm font-bold truncate">{settings.businessName}</p>
                <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Free Plan</p>
              </div>
            </div>
            <ChevronDown size={16} className={`text-[#6B7280] transition-transform ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Workspace dropdown menu */}
          <AnimatePresence>
            {isWorkspaceOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 w-full mt-2 bg-white border border-[#E1E1E1] rounded-lg z-50 overflow-hidden"
              >
                <div className="p-2 border-b border-[#E1E1E1] bg-[#FAFAFA] text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-4">Workspaces</div>
                <button className="flex items-center gap-3 w-full p-3 hover:bg-[#FAFAFA] text-sm font-bold border-b border-[#E1E1E1]">
                  <div className="w-6 h-6 rounded bg-gray-200" /> Personal Account
                </button>
                <button className="flex items-center gap-3 w-full p-3 hover:bg-[#FAFAFA] text-sm text-[#2563EB] font-bold">
                  <Plus size={16} /> New Workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NAV LINKS: Active page is highlighted with brand color background */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all duration-200 ${
                currentView === item.id 
                ? 'bg-[#F0F4FF]' 
                : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#010101]'
              }`}
              style={{ color: currentView === item.id ? settings.brandColor : '' }}
            >
              <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* FREE PLAN USAGE INDICATOR
            Progress bar color transitions to red as the monthly limit approaches.
            Clicking the card or the upgrade link opens the Pricing modal. */}
        <div
          className="mt-auto p-4 bg-[#FAFAFA] border border-[#E1E1E1] rounded-xl text-left cursor-pointer hover:bg-white transition-colors"
          onClick={() => setIsPricingModalOpen(true)}
          title="View pricing plans"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Free Plan Usage</p>
            {invoicesRemaining === 0 && (
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Limit reached</span>
            )}
          </div>
          {/* Progress fill turns red when >= 80% of monthly limit is consumed */}
          <div className="h-1.5 w-full bg-[#E1E1E1] rounded-full mb-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all" 
              style={{ 
                width: `${usagePct}%`, 
                backgroundColor: usagePct >= 80 ? '#EF4444' : settings.brandColor 
              }} 
            />
          </div>
          <p className="text-[10px] font-bold text-[#6B7280]">
            {invoicesThisMonth} of {FREE_PLAN_LIMIT} invoices used this month
          </p>
          {invoicesRemaining > 0 ? (
            <p className="text-[10px] text-[#6B7280] mt-0.5">{invoicesRemaining} remaining</p>
          ) : (
            // Upgrade CTA shown when the free limit is exhausted — opens pricing modal
            <button 
              onClick={(e) => { e.stopPropagation(); setIsPricingModalOpen(true); }}
              className="mt-2 text-[10px] font-bold underline"
              style={{ color: settings.brandColor }}
            >
              Upgrade to Organisation →
            </button>
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────
          MAIN CONTENT AREA — offset by sidebar width on desktop
          ───────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        
        {/* STICKY HEADER: Page title + notification bell + avatar */}
        <header className="h-20 border-b border-[#E1E1E1] flex items-center justify-between px-8 bg-white sticky top-0 z-10 text-left">
          <div className="flex items-center gap-4">
            {/* Back button — only shown on the create invoice view */}
            {currentView === 'create-invoice' && (
              <button onClick={() => setCurrentView('invoices')} className="p-2 hover:bg-[#FAFAFA] rounded-full border border-[#E1E1E1]"><ArrowLeft size={18} /></button>
            )}
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">{currentView.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification bell with unread indicator dot */}
            <button className="p-2 hover:bg-[#FAFAFA] rounded-full border border-[#E1E1E1] relative text-[#3A3A3A]">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full border-2 border-white" style={{ backgroundColor: settings.brandColor }} />
            </button>
            {/* User avatar placeholder */}
            <div className="w-10 h-10 rounded-full border border-[#E1E1E1] bg-gray-50 flex items-center justify-center">
              <Users size={18} className="text-gray-300"/>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT — animated transition between views */}
        <div className="p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentView} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>

              {/* ═══════════════════════════════════════
                  VIEW: DASHBOARD
                  Stats cards, recent invoices table, revenue bar, activity feed
                  ═══════════════════════════════════════ */}
              {currentView === 'dashboard' && (
                <div className="space-y-8 text-left">
                  <div className="flex justify-between items-end">
                    <div>
                      <h1 className="text-3xl font-bold">Workspace</h1>
                      <p className="text-[#6B7280] text-sm">Reviewing performance for {settings.businessName}.</p>
                    </div>
                    <button onClick={() => setCurrentView('create-invoice')} style={{ backgroundColor: settings.brandColor }} className="hidden md:flex text-white px-6 py-3 rounded-lg font-bold items-center gap-2 transition-all"><Plus size={20} /> New Invoice</button>
                  </div>

                  {/* STAT CARDS: Revenue collected, pending invoice count, client count */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Total Revenue', value: `${currencySymbol}${invoices.reduce((a,b)=>a+Number(b.amount),0).toLocaleString()}`, icon: CreditCard },
                      { label: 'Pending', value: invoices.length, icon: Clock },
                      { label: 'Clients', value: clients.length, icon: Users },
                    ].map((stat, i) => (
                      <div key={i} className="p-6 border border-[#E1E1E1] rounded-xl bg-white">
                        <stat.icon size={22} style={{ color: settings.brandColor }} className="mb-4" />
                        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Empty state shown when no invoices exist yet */}
                  {invoices.length === 0 ? (
                    <EmptyState brandColor={settings.brandColor} icon={Inbox} title="No activity yet" description="Send your first invoice to populate your workspace dashboard." actionText="Create Invoice" onAction={() => setCurrentView('create-invoice')} />
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                      {/* Recent invoices table — shows latest 6 */}
                      <div className="xl:col-span-2 border border-[#E1E1E1] rounded-xl bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E1E1E1]">
                          <h3 className="font-bold text-base">Recent invoices</h3>
                          <button onClick={() => setCurrentView('invoices')} style={{ color: settings.brandColor }} className="text-xs font-bold flex items-center gap-1 hover:underline">View all <ChevronRight size={14} /></button>
                        </div>
                        <table className="w-full text-left">
                          <thead className="bg-[#FAFAFA] border-b border-[#E1E1E1]">
                            <tr>
                              {['Invoice', 'Client', 'Status', 'Amount'].map(h => (
                                <th key={h} className="px-6 py-3 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E1E1E1]">
                            {invoices.slice(0, 6).map(inv => (
                              <tr key={inv.id} className="h-16 hover:bg-[#FAFAFA] transition-colors">
                                <td className="px-6 font-bold text-sm">
                                  <div className="flex items-center gap-2">
                                    {inv.id}
                                    {/* Inline escrow badge if this invoice has escrow enabled */}
                                    {inv.escrow && <EscrowBadge />}
                                  </div>
                                </td>
                                <td className="px-6 text-sm text-[#010101]">{inv.client}</td>
                                <td className="px-6">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyles[inv.status] || 'bg-gray-100 text-gray-500'}`}>{inv.status}</span>
                                </td>
                                <td className="px-6 font-bold text-sm">{currencySymbol}{Number(inv.amount).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Right column: revenue summary card + activity feed */}
                      <div className="xl:col-span-1 flex flex-col gap-6">
                        {/* Revenue collected vs outstanding progress */}
                        <div className="border border-[#E1E1E1] rounded-xl bg-white p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-base">Revenue</h3>
                            <BarChart3 size={16} className="text-[#6B7280]" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold">{currencySymbol}{invoices.filter(i=>i.status==='Paid').reduce((a,b)=>a+Number(b.amount),0).toLocaleString()}</p>
                            <p className="text-xs text-[#6B7280] mt-1">Collected to date</p>
                          </div>
                          {(() => {
                            const collected = invoices.filter(i=>i.status==='Paid').reduce((a,b)=>a+Number(b.amount),0);
                            const total = invoices.reduce((a,b)=>a+Number(b.amount),0);
                            const outstanding = total - collected;
                            const pct = total > 0 ? Math.round((collected / total) * 100) : 0;
                            return (
                              <div className="space-y-2">
                                <div className="h-2 w-full bg-[#E1E1E1] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: settings.brandColor }} />
                                </div>
                                <div className="flex justify-between text-[10px] text-[#6B7280] font-bold">
                                  <span>Collected</span>
                                  <span>Outstanding {currencySymbol}{outstanding.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Recent activity timeline — status-color coded dots */}
                        <div className="border border-[#E1E1E1] rounded-xl bg-white p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-base">Recent activity</h3>
                            <Clock size={16} className="text-[#6B7280]" />
                          </div>
                          <div className="space-y-4">
                            {invoices.slice(0, 5).map((inv, idx) => {
                              const dotColors = { Paid: '#10B981', Sent: settings.brandColor, Overdue: '#EF4444', Pending: '#F59E0B', Draft: '#6B7280' };
                              const messages = { Paid: `${inv.id} marked paid by ${inv.client}`, Sent: `${inv.id} sent to ${inv.client}`, Overdue: `${inv.id} became overdue`, Pending: `${inv.id} pending from ${inv.client}`, Draft: `Draft ${inv.id} created for ${inv.client}` };
                              const daysAgo = idx + 1;
                              return (
                                <div key={inv.id} className="flex items-start gap-3">
                                  <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColors[inv.status] || '#6B7280' }} />
                                  <div>
                                    <p className="text-xs font-medium text-[#010101] leading-snug">{messages[inv.status] || `${inv.id} updated`}</p>
                                    <p className="text-[10px] text-[#6B7280] mt-0.5">{daysAgo}d ago</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════
                  VIEW: CREATE INVOICE
                  Left: form — Right: live invoice preview
                  ═══════════════════════════════════════ */}
              {currentView === 'create-invoice' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start text-left pb-20">
                  <form onSubmit={handleCreateInvoice} className="p-10 border border-[#E1E1E1] rounded-xl bg-white space-y-10">
                    <h1 className="text-3xl font-bold">New Invoice</h1>

                    {/* Invoice type toggle: One-Time or Recurring */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Invoice Type</label>
                      <div className="flex gap-3">
                        {['one-time', 'recurring'].map(t => (
                          <button
                            key={t} type="button"
                            onClick={() => setInvoiceDraft({...invoiceDraft, type: t})}
                            className={`flex-1 h-[48px] rounded-[8px] border text-sm font-bold capitalize transition-all ${invoiceDraft.type === t ? 'border-transparent text-white' : 'border-[#E1E1E1] text-[#6B7280] bg-white hover:bg-[#FAFAFA]'}`}
                            style={invoiceDraft.type === t ? { backgroundColor: settings.brandColor } : {}}
                          >
                            {t === 'one-time' ? 'One-Time' : 'Recurring'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Client selector — links to the clients list; allows adding inline */}
                    <div className="p-8 border-2 border-dashed border-[#E1E1E1] rounded-xl bg-[#FAFAFA] space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Select Client</label>
                        <button type="button" onClick={() => setIsClientDrawerOpen(true)} style={{ color: settings.brandColor }} className="text-xs font-bold hover:underline">+ Add New Client</button>
                      </div>
                      <select className="w-full h-12 px-4 rounded-lg border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] text-sm appearance-none" onChange={(e)=>setInvoiceDraft({...invoiceDraft, client: e.target.value})}>
                        <option value="">Choose a client...</option>
                        {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>

                    {/* Date fields — issue date and due date */}
                    <div className="grid grid-cols-2 gap-6">
                      <InputField label="Issuance Date" type="date" value={invoiceDraft.issueDate} onChange={(e)=>setInvoiceDraft({...invoiceDraft, issueDate: e.target.value})} />
                      <InputField label="Due Date" type="date" onChange={(e)=>setInvoiceDraft({...invoiceDraft, dueDate: e.target.value})} />
                    </div>

                    {/* Line items table — description, qty, rate, computed amount, delete */}
                    <div className="space-y-4">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Line Items</label>
                      <div className="grid grid-cols-12 gap-3 pb-1">
                        <div className="col-span-5 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Description</div>
                        <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Qty</div>
                        <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Rate</div>
                        <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Amount</div>
                        <div className="col-span-1" />
                      </div>

                      {invoiceDraft.items.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-5">
                            <input type="text" placeholder="Item description" value={item.desc}
                              onChange={(e) => { const updatedItems = invoiceDraft.items.map(i => i.id === item.id ? {...i, desc: e.target.value} : i); setInvoiceDraft({...invoiceDraft, items: updatedItems}); }}
                              className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <input type="number" placeholder="Qty" value={item.qty}
                              onChange={(e) => { const updatedItems = invoiceDraft.items.map(i => i.id === item.id ? {...i, qty: Number(e.target.value)} : i); setInvoiceDraft({...invoiceDraft, items: updatedItems}); }}
                              className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <input type="number" placeholder="Rate" value={item.rate}
                              onChange={(e) => { const updatedItems = invoiceDraft.items.map(i => i.id === item.id ? {...i, rate: Number(e.target.value)} : i); setInvoiceDraft({...invoiceDraft, items: updatedItems}); }}
                              className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            {/* Read-only computed amount cell */}
                            <div className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-[#FAFAFA] flex items-center text-sm font-bold text-[#010101]">
                              {currencySymbol}{(item.qty * item.rate).toLocaleString()}
                            </div>
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button type="button" onClick={()=>setInvoiceDraft({...invoiceDraft, items: invoiceDraft.items.filter(i=>i.id !== item.id)})} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      ))}

                      {/* Add another line item row */}
                      <button type="button" onClick={addLineItem} style={{ color: settings.brandColor }} className="text-xs font-bold flex items-center gap-2 pt-2"><PlusCircle size={16}/> Add another line item</button>
                    </div>

                    {/* Discount & Tax percentage inputs */}
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#FAFAFA]">
                      <InputField label="Discount ($)" type="number" onChange={(e)=>setInvoiceDraft({...invoiceDraft, discount: Number(e.target.value)})} />
                      <InputField label="Tax (VAT %)" type="number" onChange={(e)=>setInvoiceDraft({...invoiceDraft, tax: Number(e.target.value)})} />
                    </div>

                    {/* Notes or summary textarea */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Summary / Notes</label>
                      <textarea className="w-full h-24 p-4 border border-[#E1E1E1] rounded-lg outline-none focus:border-[#2563EB] text-sm resize-none" placeholder="Add any extra notes..." onChange={(e)=>setInvoiceDraft({...invoiceDraft, notes: e.target.value})} />
                    </div>

                    {/* ── DANPAY ESCROW TOGGLE ──
                        Enabling this generates a unique virtual receiving account when the invoice is finalized.
                        Funds are held in escrow until manually released by the user. */}
                    <div className="p-6 border border-[#E1E1E1] rounded-xl bg-[#FAFAFA] space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
                            <Landmark size={18} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#010101]">Enable DanPay Escrow</p>
                            <p className="text-xs text-[#6B7280] mt-0.5">Generate a unique receiving account for this invoice. Funds are held in escrow until you release them.</p>
                          </div>
                        </div>
                        {/* Toggle switch — purple when enabled */}
                        <button
                          type="button"
                          onClick={() => setInvoiceDraft({...invoiceDraft, escrowEnabled: !invoiceDraft.escrowEnabled})}
                          className={`flex-shrink-0 w-12 h-6 rounded-full border-2 transition-all relative ${invoiceDraft.escrowEnabled ? 'border-purple-500 bg-purple-500' : 'border-[#E1E1E1] bg-[#E1E1E1]'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${invoiceDraft.escrowEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                      {/* Confirmation note shown after enabling escrow */}
                      {invoiceDraft.escrowEnabled && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-lg p-3">
                          <CheckCircle2 size={14} className="text-purple-500 flex-shrink-0" />
                          A unique bank receiving account will be generated when you finalize this invoice.
                        </motion.div>
                      )}
                    </div>

                    {/* Form submit CTA */}
                    <button type="submit" style={{ backgroundColor: settings.brandColor }} className="w-full text-white h-[56px] rounded-lg font-bold text-lg hover:opacity-90 transition-all">Finalize & Send Invoice</button>
                  </form>

                  {/* INVOICE PREVIEW — live preview card, sticky on desktop */}
                  <div className="sticky top-28 bg-white border border-[#E1E1E1] rounded-xl p-10 min-h-[700px] flex flex-col justify-between">
                    <div className="space-y-12">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: settings.brandColor }} />
                        <div className="text-right">
                          <h2 className="text-2xl font-light tracking-tighter text-gray-300 uppercase">Invoice</h2>
                          <p className="font-bold text-xs text-[#010101]">#INV-Draft</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2">Billed To</p>
                        <p className="text-xl font-bold">{invoiceDraft.client || 'Client Name'}</p>
                        {/* Display selected client's email beneath their name in the preview */}
                        {invoiceDraft.client && clients.find(c => c.name === invoiceDraft.client)?.email && (
                          <p className="text-sm text-[#6B7280] mt-0.5 flex items-center gap-1.5">
                            <Mail size={12} />
                            {clients.find(c => c.name === invoiceDraft.client).email}
                          </p>
                        )}
                      </div>
                      {/* Line items preview table */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 text-[9px] font-bold text-[#6B7280] uppercase border-b border-[#E1E1E1] pb-2 text-left"><div>Item</div><div className="text-right">Qty</div><div className="text-right">Rate</div><div className="text-right">Total</div></div>
                        {invoiceDraft.items.map(i => (
                          <div key={i.id} className="grid grid-cols-4 text-xs py-1">
                            <div className="truncate text-left pr-4">{i.desc || '—'}</div>
                            <div className="text-right">{i.qty}</div>
                            <div className="text-right">{i.rate}</div>
                            <div className="text-right font-bold">{currencySymbol}{(i.qty*i.rate).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right pt-10 border-t border-[#E1E1E1]">
                      {/* Escrow badge on preview card when toggle is on */}
                      {invoiceDraft.escrowEnabled && (
                        <div className="flex justify-end mb-3">
                          <EscrowBadge />
                        </div>
                      )}
                      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2">Total Amount Due</p>
                      <p className="text-4xl font-bold">{currencySymbol}{grandTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════
                  VIEW: INVOICES LIST
                  On desktop: standalone invoices list with filters.
                  On mobile: tab-switched view showing Invoices OR Receipts
                  (receipts are merged here on mobile since they're excluded from the mobile nav)
                  ═══════════════════════════════════════ */}
              {currentView === 'invoices' && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Invoices</h1>
                    <div className="flex items-center gap-3">
                      {/* CSV export button — desktop only */}
                      <button onClick={() => { const csv = ['ID,Client,Amount,Status,Type,Date,Escrow', ...invoices.map(i=>`${i.id},${i.client},${i.amount},${i.status},${i.type||''},${i.date},${i.escrow ? 'Yes' : 'No'}`)].join('\n'); const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='invoices.csv'; a.click(); }} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E1E1E1] text-sm font-bold text-[#6B7280] hover:bg-[#FAFAFA] transition-colors"><Download size={16}/> Export</button>
                      <button onClick={() => setCurrentView('create-invoice')} style={{ backgroundColor: settings.brandColor }} className="hidden md:flex text-white px-6 py-3 rounded-lg font-bold items-center gap-2"><Plus size={20} /> New Invoice</button>
                    </div>
                  </div>

                  {/* MOBILE-ONLY: Tab switcher to toggle between Invoices and Receipts
                      Receipts are not in the mobile nav so they live here as a sub-tab */}
                  <div className="flex md:hidden gap-1 p-1 bg-[#FAFAFA] border border-[#E1E1E1] rounded-lg w-fit">
                    {[
                      { id: 'invoices', label: 'Invoices', icon: FileText },
                      { id: 'receipts', label: 'Receipts', icon: Receipt },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setInvoiceMobileTab(tab.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all"
                        style={invoiceMobileTab === tab.id
                          ? { backgroundColor: settings.brandColor, color: '#fff' }
                          : { color: '#6B7280' }
                        }
                      >
                        <tab.icon size={14} /> {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* ── MOBILE: RECEIPTS SUB-TAB ── */}
                  {invoiceMobileTab === 'receipts' && (
                    <div className="md:hidden space-y-6">
                      {paidInvoices.length > 0 && (
                        <FilterBar
                          searchValue={receiptSearch}
                          onSearchChange={setReceiptSearch}
                          searchPlaceholder="Search receipts..."
                          filters={[{ value: 'all', label: 'All' }]}
                          activeFilter={receiptDateFilter}
                          onFilterChange={setReceiptDateFilter}
                          brandColor={settings.brandColor}
                        />
                      )}
                      {paidInvoices.length > 0 ? (
                        filteredReceipts.length > 0 ? (
                          <div className="border border-[#E1E1E1] rounded-xl overflow-hidden bg-white">
                            <table className="w-full text-left">
                              <thead className="bg-[#FAFAFA] border-b border-[#E1E1E1] h-12 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                                <tr><th className="px-4">Receipt</th><th className="px-4">Client</th><th className="px-4">Amount</th></tr>
                              </thead>
                              <tbody className="divide-y divide-[#E1E1E1]">
                                {filteredReceipts.map(inv => (
                                  <tr key={inv.id} onClick={() => setSelectedReceipt(inv)} className="h-14 cursor-pointer hover:bg-[#FAFAFA] transition-colors">
                                    <td className="px-4 font-bold text-sm">RCT-{inv.id}</td>
                                    <td className="px-4 text-sm">{inv.client}</td>
                                    <td className="px-4 font-bold text-sm">{currencySymbol}{Number(inv.amount).toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="py-16 text-center border border-dashed border-[#E1E1E1] rounded-xl bg-[#FAFAFA]">
                            <p className="font-bold text-[#010101]">No results found</p>
                          </div>
                        )
                      ) : (
                        <EmptyState brandColor={settings.brandColor} icon={Receipt} title="No receipts yet" description="Receipts appear when invoices are marked as Paid." actionText="View Invoices" onAction={() => setInvoiceMobileTab('invoices')} />
                      )}
                    </div>
                  )}

                  {/* ── INVOICES SUB-TAB (default) — shown on mobile and always on desktop ── */}
                  {(invoiceMobileTab === 'invoices') && (
                    <div className="space-y-4">
                      {/* Status filter bar */}
                      <FilterBar
                        searchValue={invoiceSearch}
                        onSearchChange={setInvoiceSearch}
                        searchPlaceholder="Search invoices..."
                        filters={[
                          { value: 'all', label: 'All' },
                          { value: 'Pending', label: 'Pending' },
                          { value: 'Paid', label: 'Paid' },
                          { value: 'Overdue', label: 'Overdue' },
                          { value: 'Draft', label: 'Draft' },
                        ]}
                        activeFilter={invoiceStatusFilter}
                        onFilterChange={setInvoiceStatusFilter}
                        brandColor={settings.brandColor}
                      />

                      {/* Type sub-filter: All / One-Time / Recurring */}
                      <div className="flex gap-2">
                        {[{ value: 'all', label: 'All Types' }, { value: 'one-time', label: 'One-Time' }, { value: 'recurring', label: 'Recurring' }].map(f => (
                          <button
                            key={f.value}
                            onClick={() => setInvoiceTypeFilter(f.value)}
                            className="h-[32px] px-3 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all"
                            style={invoiceTypeFilter === f.value
                              ? { backgroundColor: '#010101', color: '#fff', borderColor: '#010101' }
                              : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E1E1E1' }
                            }
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      {invoices.length > 0 ? (
                        filteredInvoices.length > 0 ? (
                          <div className="border border-[#E1E1E1] rounded-xl overflow-hidden bg-white">
                            <table className="w-full text-left">
                              <thead className="bg-[#FAFAFA] border-b border-[#E1E1E1] h-12 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                                <tr><th className="px-6">ID</th><th className="px-6">Client</th><th className="px-6 hidden md:table-cell">Type</th><th className="px-6">Amount</th><th className="px-6">Status</th></tr>
                              </thead>
                              <tbody className="divide-y divide-[#E1E1E1]">
                                {filteredInvoices.map(inv => (
                                  <tr key={inv.id} onClick={() => setSelectedInvoice(inv)} className="h-16 cursor-pointer hover:bg-[#FAFAFA] transition-colors">
                                    <td className="px-6 font-bold text-sm">
                                      <div className="flex items-center gap-2">
                                        {inv.id}
                                        {inv.escrow && <EscrowBadge />}
                                      </div>
                                    </td>
                                    <td className="px-6 text-sm">{inv.client}</td>
                                    <td className="px-6 text-sm hidden md:table-cell"><span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">{inv.type === 'recurring' ? '↻ Recurring' : '· One-Time'}</span></td>
                                    <td className="px-6 font-bold text-sm">{currencySymbol}{Number(inv.amount).toLocaleString()}</td>
                                    <td className="px-6"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyles[inv.status] || 'bg-gray-100 text-gray-500'}`}>{inv.status}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="py-16 text-center border border-dashed border-[#E1E1E1] rounded-xl bg-[#FAFAFA]">
                            <p className="font-bold text-[#010101]">No results found</p>
                            <p className="text-sm text-[#6B7280] mt-1">Try adjusting your search or filters.</p>
                          </div>
                        )
                      ) : <EmptyState brandColor={settings.brandColor} icon={FilePlus} title="No invoices created" description="Bill your clients professionally using our automated billing system." actionText="Create First Invoice" onAction={() => setCurrentView('create-invoice')} />}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════
                  VIEW: RECEIPTS — Desktop only (mobile uses sub-tab in Invoices view)
                  Shows paid invoices; searchable and exportable as CSV
                  ═══════════════════════════════════════ */}
              {currentView === 'receipts' && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Receipts</h1>
                    {paidInvoices.length > 0 && (
                      <button onClick={() => { const csv = ['Receipt,Client,Amount,Date', ...paidInvoices.map(i=>`RCT-${i.id},${i.client},${i.amount},${i.date}`)].join('\n'); const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='receipts.csv'; a.click(); }} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E1E1E1] text-sm font-bold text-[#6B7280] hover:bg-[#FAFAFA] transition-colors"><Download size={16}/> Export</button>
                    )}
                  </div>

                  {paidInvoices.length > 0 && (
                    <FilterBar
                      searchValue={receiptSearch}
                      onSearchChange={setReceiptSearch}
                      searchPlaceholder="Search receipts..."
                      filters={[{ value: 'all', label: 'All' }]}
                      activeFilter={receiptDateFilter}
                      onFilterChange={setReceiptDateFilter}
                      brandColor={settings.brandColor}
                    />
                  )}

                  {paidInvoices.length > 0 ? (
                    filteredReceipts.length > 0 ? (
                      <div className="border border-[#E1E1E1] rounded-xl overflow-hidden bg-white">
                        <table className="w-full text-left">
                          <thead className="bg-[#FAFAFA] border-b border-[#E1E1E1] h-12 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                            <tr><th className="px-6">Receipt</th><th className="px-6">Client</th><th className="px-6">Amount</th><th className="px-6">Date</th></tr>
                          </thead>
                          <tbody className="divide-y divide-[#E1E1E1]">
                            {filteredReceipts.map(inv => (
                              <tr key={inv.id} onClick={() => setSelectedReceipt(inv)} className="h-16 cursor-pointer hover:bg-[#FAFAFA] transition-colors">
                                <td className="px-6 font-bold text-sm">RCT-{inv.id}</td>
                                <td className="px-6 text-sm">{inv.client}</td>
                                <td className="px-6 font-bold text-sm">{currencySymbol}{Number(inv.amount).toLocaleString()}</td>
                                <td className="px-6 text-sm text-[#6B7280]">{inv.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-16 text-center border border-dashed border-[#E1E1E1] rounded-xl bg-[#FAFAFA]">
                        <p className="font-bold text-[#010101]">No results found</p>
                        <p className="text-sm text-[#6B7280] mt-1">Try adjusting your search.</p>
                      </div>
                    )
                  ) : <EmptyState brandColor={settings.brandColor} icon={Receipt} title="No receipts yet" description="Receipts will appear here when invoices are marked as Paid." actionText="View Invoices" onAction={() => setCurrentView('invoices')} />}
                </div>
              )}

              {/* ═══════════════════════════════════════
                  VIEW: CLIENTS
                  Grid of client cards; searchable; click to open edit drawer
                  ═══════════════════════════════════════ */}
              {currentView === 'clients' && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-left">Clients</h1>
                    <button onClick={() => setIsClientDrawerOpen(true)} style={{ backgroundColor: settings.brandColor }} className="hidden md:flex text-white px-6 py-3 rounded-lg font-bold items-center gap-2"><Plus size={20} /> Add Client</button>
                  </div>

                  {clients.length > 0 && (
                    <FilterBar
                      searchValue={clientSearch}
                      onSearchChange={setClientSearch}
                      searchPlaceholder="Search clients by name, email, company..."
                      filters={[{ value: 'all', label: 'All' }]}
                      activeFilter="all"
                      onFilterChange={() => {}}
                      brandColor={settings.brandColor}
                    />
                  )}

                  {clients.length > 0 ? (
                    filteredClients.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.map(client => (
                          <div key={client.id} onClick={() => { setSelectedClient(client); setEditClientDraft({...client}); }} className="p-6 border border-[#E1E1E1] rounded-xl bg-white flex justify-between items-start cursor-pointer hover:bg-[#FAFAFA] transition-all group">
                            <div>
                              <h3 className="font-bold text-lg">{client.name}</h3>
                              <p className="text-sm text-[#6B7280]">{client.email}</p>
                              {client.location && <p className="text-xs text-[#6B7280] mt-1">{client.location}</p>}
                            </div>
                            {/* Delete button — revealed on hover */}
                            <button onClick={(e)=>{e.stopPropagation(); setClients(clients.filter(c=>c.id !== client.id));}} className="opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} className="text-red-300 hover:text-red-500" /></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center border border-dashed border-[#E1E1E1] rounded-xl bg-[#FAFAFA]">
                        <p className="font-bold text-[#010101]">No clients match your search</p>
                        <p className="text-sm text-[#6B7280] mt-1">Try a different name, email, or company.</p>
                      </div>
                    )
                  ) : <EmptyState brandColor={settings.brandColor} icon={UserPlus} title="Your network is empty" description="Add your clients to save time when generating future invoices and receipts." actionText="Add New Client" onAction={() => setIsClientDrawerOpen(true)} />}
                </div>
              )}

              {/* ═══════════════════════════════════════
                  VIEW: WALLET
                  Shows balance, transaction history, and sub-tabs for:
                  Overview | Withdraw | Add Card | Pay
                  ═══════════════════════════════════════ */}
              {currentView === 'wallet' && (
                <div className="space-y-6 text-left">
                  <h1 className="text-3xl font-bold">Wallet</h1>

                  {/* Success feedback toast — shown briefly after wallet actions */}
                  {walletActionFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-100 rounded-xl"
                    >
                      <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                      <p className="text-sm font-bold text-green-700">{walletActionFeedback}</p>
                    </motion.div>
                  )}

                  {/* Balance card — shows current wallet balance prominently */}
                  <div className="p-8 rounded-xl border border-[#E1E1E1] bg-white">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280] mb-2">Available Balance</p>
                    <p className="text-4xl font-bold">{currencySymbol}{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-[#6B7280] mt-2">Includes escrow releases and available funds</p>
                  </div>

                  {/* Wallet action sub-tabs: Overview | Withdraw | Add Card | Pay */}
                  <div className="flex gap-1 p-1 bg-[#FAFAFA] border border-[#E1E1E1] rounded-lg w-fit overflow-x-auto">
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'withdraw', label: 'Withdraw' },
                      { id: 'add-card', label: 'Add Card' },
                      { id: 'pay', label: 'Pay' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setWalletTab(tab.id)}
                        className="px-5 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all"
                        style={walletTab === tab.id
                          ? { backgroundColor: settings.brandColor, color: '#fff' }
                          : { color: '#6B7280' }
                        }
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* ── WALLET: OVERVIEW TAB ──
                      Shows transaction history and saved cards */}
                  {walletTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Transaction history list */}
                      <div className="border border-[#E1E1E1] rounded-xl bg-white overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#E1E1E1]">
                          <h3 className="font-bold text-base">Transactions</h3>
                        </div>
                        {walletTransactions.length === 0 ? (
                          <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                            <Wallet size={28} className="text-[#E1E1E1] mb-3" />
                            <p className="text-sm font-bold text-[#010101]">No transactions yet</p>
                            <p className="text-xs text-[#6B7280] mt-1">Transactions appear after escrow releases, withdrawals, or payments.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-[#E1E1E1]">
                            {walletTransactions.map(tx => (
                              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {/* Icon changes based on transaction direction */}
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    {tx.amount > 0
                                      ? <ArrowDownLeft size={14} className="text-green-600" />
                                      : <ArrowUpRight size={14} className="text-red-500" />
                                    }
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-[#010101]">{tx.label}</p>
                                    <p className="text-[10px] text-[#6B7280]">{tx.date}</p>
                                  </div>
                                </div>
                                <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {tx.amount > 0 ? '+' : ''}{currencySymbol}{Math.abs(tx.amount).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Saved cards list */}
                      <div className="border border-[#E1E1E1] rounded-xl bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E1E1E1]">
                          <h3 className="font-bold text-base">Saved Cards</h3>
                          <button
                            onClick={() => setWalletTab('add-card')}
                            className="text-xs font-bold flex items-center gap-1"
                            style={{ color: settings.brandColor }}
                          >
                            <Plus size={14} /> Add Card
                          </button>
                        </div>
                        {walletCards.length === 0 ? (
                          <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                            <CreditCard size={28} className="text-[#E1E1E1] mb-3" />
                            <p className="text-sm font-bold text-[#010101]">No cards saved</p>
                            <p className="text-xs text-[#6B7280] mt-1">Add a card to fund your wallet or make payments.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-[#E1E1E1]">
                            {walletCards.map(card => (
                              <div key={card.id} className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-7 bg-[#010101] rounded flex items-center justify-center">
                                    <CreditCard size={14} className="text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold">{card.brand} ···· {card.last4}</p>
                                    <p className="text-[10px] text-[#6B7280]">Expires {card.expiry}</p>
                                  </div>
                                </div>
                                {/* Remove card button */}
                                <button onClick={() => setWalletCards(walletCards.filter(c => c.id !== card.id))} className="text-red-300 hover:text-red-500 transition-colors">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── WALLET: WITHDRAW TAB ──
                      Allows user to withdraw funds to their linked bank account */}
                  {walletTab === 'withdraw' && (
                    <div className="max-w-md space-y-6">
                      <div className="p-6 border border-[#E1E1E1] rounded-xl bg-white space-y-6">
                        <h3 className="font-bold text-base">Withdraw to Bank</h3>

                        {/* Available balance reminder */}
                        <div className="p-4 bg-[#FAFAFA] border border-[#E1E1E1] rounded-lg flex justify-between items-center">
                          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Available</span>
                          <span className="font-bold">{currencySymbol}{walletBalance.toLocaleString()}</span>
                        </div>

                        {/* Withdrawal amount input */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Amount</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={walletWithdrawDraft.amount}
                            onChange={e => setWalletWithdrawDraft({ ...walletWithdrawDraft, amount: e.target.value })}
                            className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                          />
                          {/* Validation: warn if amount exceeds balance */}
                          {Number(walletWithdrawDraft.amount) > walletBalance && (
                            <p className="text-xs text-red-500 font-bold">Amount exceeds available balance.</p>
                          )}
                        </div>

                        {/* Method selector — bank or card */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Withdraw to</label>
                          <div className="flex gap-3">
                            {[{ id: 'bank', label: 'Bank Account' }, { id: 'card', label: 'Debit Card' }].map(m => (
                              <button
                                key={m.id}
                                onClick={() => setWalletWithdrawDraft({ ...walletWithdrawDraft, method: m.id })}
                                className="flex-1 h-[44px] rounded-[8px] border text-sm font-bold transition-all"
                                style={walletWithdrawDraft.method === m.id
                                  ? { backgroundColor: settings.brandColor, color: '#fff', borderColor: settings.brandColor }
                                  : { borderColor: '#E1E1E1', color: '#6B7280' }
                                }
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Payout settings reminder — link to configure bank if not set */}
                        {!payoutSettings.verified && (
                          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">
                              No verified bank account.{' '}
                              <button onClick={() => { setCurrentView('settings'); setActiveSettingsTab('payout'); }} className="underline font-bold">Configure in Settings → Payout</button>
                            </p>
                          </div>
                        )}

                        <button
                          onClick={handleWithdraw}
                          disabled={!walletWithdrawDraft.amount || Number(walletWithdrawDraft.amount) > walletBalance || Number(walletWithdrawDraft.amount) <= 0}
                          className="w-full h-[52px] rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ backgroundColor: settings.brandColor }}
                        >
                          <ArrowUpRight size={16} /> Withdraw Funds
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── WALLET: ADD CARD TAB ──
                      Form to save a new payment card */}
                  {walletTab === 'add-card' && (
                    <div className="max-w-md space-y-6">
                      <div className="p-6 border border-[#E1E1E1] rounded-xl bg-white space-y-6">
                        <h3 className="font-bold text-base">Add Payment Card</h3>

                        {/* Card preview chip */}
                        <div className="h-[120px] rounded-xl bg-[#010101] p-5 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <p className="text-white text-xs font-bold opacity-60 uppercase tracking-widest">DanPay Wallet</p>
                            <CreditCard size={18} className="text-white opacity-60" />
                          </div>
                          <p className="text-white font-bold tracking-widest text-sm">
                            {walletCardDraft.number
                              ? walletCardDraft.number.replace(/\s/g,'').replace(/(.{4})/g,'$1 ').trim()
                              : '•••• •••• •••• ••••'
                            }
                          </p>
                        </div>

                        {/* Card number input */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            value={walletCardDraft.number}
                            onChange={e => {
                              // Auto-format with spaces every 4 digits
                              const raw = e.target.value.replace(/\D/g,'').slice(0,16);
                              const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
                              setWalletCardDraft({ ...walletCardDraft, number: formatted });
                            }}
                            className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm font-mono"
                          />
                        </div>

                        {/* Cardholder name */}
                        <InputField
                          label="Cardholder Name"
                          placeholder="Jane Doe"
                          value={walletCardDraft.name}
                          onChange={e => setWalletCardDraft({ ...walletCardDraft, name: e.target.value })}
                        />

                        {/* Expiry and CVV on the same row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Expiry</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={walletCardDraft.expiry}
                              onChange={e => {
                                // Auto-insert slash after 2 digits
                                let v = e.target.value.replace(/\D/g,'').slice(0,4);
                                if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
                                setWalletCardDraft({ ...walletCardDraft, expiry: v });
                              }}
                              className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">CVV</label>
                            <input
                              type="password"
                              placeholder="•••"
                              maxLength={4}
                              value={walletCardDraft.cvv}
                              onChange={e => setWalletCardDraft({ ...walletCardDraft, cvv: e.target.value.replace(/\D/g,'').slice(0,4) })}
                              className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                            />
                          </div>
                        </div>

                        {/* Save card CTA */}
                        <button
                          onClick={handleAddCard}
                          disabled={!walletCardDraft.number || !walletCardDraft.name || !walletCardDraft.expiry}
                          className="w-full h-[52px] rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ backgroundColor: settings.brandColor }}
                        >
                          <CreditCard size={16} /> Save Card
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── WALLET: PAY TAB ──
                      Send money directly to a named recipient from wallet balance */}
                  {walletTab === 'pay' && (
                    <div className="max-w-md space-y-6">
                      <div className="p-6 border border-[#E1E1E1] rounded-xl bg-white space-y-6">
                        <h3 className="font-bold text-base">Send Payment</h3>

                        {/* Balance reminder at the top */}
                        <div className="p-4 bg-[#FAFAFA] border border-[#E1E1E1] rounded-lg flex justify-between items-center">
                          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Balance</span>
                          <span className="font-bold">{currencySymbol}{walletBalance.toLocaleString()}</span>
                        </div>

                        {/* Recipient name or email */}
                        <InputField
                          label="Recipient"
                          placeholder="Name or email address"
                          value={walletPayDraft.recipient}
                          onChange={e => setWalletPayDraft({ ...walletPayDraft, recipient: e.target.value })}
                        />

                        {/* Payment amount */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Amount</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={walletPayDraft.amount}
                            onChange={e => setWalletPayDraft({ ...walletPayDraft, amount: e.target.value })}
                            className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                          />
                          {Number(walletPayDraft.amount) > walletBalance && (
                            <p className="text-xs text-red-500 font-bold">Amount exceeds available balance.</p>
                          )}
                        </div>

                        {/* Optional payment note */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Note (optional)</label>
                          <input
                            type="text"
                            placeholder="What's this payment for?"
                            value={walletPayDraft.note}
                            onChange={e => setWalletPayDraft({ ...walletPayDraft, note: e.target.value })}
                            className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                          />
                        </div>

                        <button
                          onClick={handleWalletPay}
                          disabled={!walletPayDraft.recipient || !walletPayDraft.amount || Number(walletPayDraft.amount) > walletBalance || Number(walletPayDraft.amount) <= 0}
                          className="w-full h-[52px] rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ backgroundColor: settings.brandColor }}
                        >
                          <Send size={16} /> Send Payment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics placeholder — desktop only (not in mobile nav) */}
              {currentView === 'analytics' && (
                <div className="space-y-6 text-left">
                  <h1 className="text-3xl font-bold text-left">Analytics</h1>
                  <EmptyState brandColor={settings.brandColor} icon={BarChart3} title="Insights pending" description="Revenue trends will appear here." actionText="Dashboard" onAction={() => setCurrentView('dashboard')} />
                </div>
              )}

              {/* ═══════════════════════════════════════
                  VIEW: SETTINGS
                  Tabs: General | Security | Notifications | Members | Payout
                  ═══════════════════════════════════════ */}
              {currentView === 'settings' && (
                <div className="max-w-4xl mx-auto space-y-10 text-left pb-20">
                  <h1 className="text-3xl font-bold">Settings</h1>

                  {/* Settings tab navigation bar */}
                  <div className="flex border-b border-[#E1E1E1] gap-8 overflow-x-auto">
                    {[
                      { id: 'general', label: 'General', icon: Palette },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'notifications', label: 'Notifications', icon: BellRing },
                      { id: 'members', label: 'Members', icon: Users2 },
                      { id: 'payout', label: 'Payout', icon: Wallet },
                    ].map(tab => (
                      <button key={tab.id} onClick={() => setActiveSettingsTab(tab.id)}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${activeSettingsTab === tab.id ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#6B7280]'}`}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* ── GENERAL TAB: Business name, logo upload, brand color, currency, location ── */}
                  {activeSettingsTab === 'general' && (
                    <div className="space-y-8">
                      <div className="p-8 border border-[#E1E1E1] rounded-xl bg-white space-y-10">
                        <section className="space-y-6">
                          <h3 className="font-bold text-sm text-[#6B7280] uppercase tracking-widest">Brand Identity</h3>
                          <div className="flex items-center gap-6">
                            {/* Logo upload placeholder */}
                            <div className="w-24 h-24 border-2 border-dashed border-[#E1E1E1] rounded-xl bg-[#FAFAFA] flex flex-col items-center justify-center text-[#6B7280] cursor-pointer hover:bg-white transition-colors">
                              <Upload size={20}/><span className="text-[9px] font-bold mt-1 uppercase tracking-widest">Logo</span>
                            </div>
                            <div className="flex-1 space-y-4">
                              <InputField label="Workspace Name" value={settings.businessName} onChange={(e)=>setSettings({...settings, businessName: e.target.value})} />
                              {/* Brand color swatches — clicking a swatch updates the accent color globally */}
                              <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Brand Accent Color</label>
                                <div className="flex gap-2">
                                  {['#2563EB', '#010101', '#7C3AED', '#DB2777', '#10B981'].map(c => (
                                    <button key={c} onClick={()=>setSettings({...settings, brandColor: c})} className={`w-8 h-8 rounded-full border-2 ${settings.brandColor === c ? 'border-blue-300' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#FAFAFA]">
                          <InputField label="Currency" type="select" value={settings.currency} onChange={(e)=>setSettings({...settings, currency: e.target.value})} options={[{label:'USD', value:'USD'},{label:'EUR', value:'EUR'}]} />
                          <InputField label="Location" value={settings.location} onChange={(e)=>setSettings({...settings, location: e.target.value})} />
                        </div>
                        <div className="pt-6 border-t border-[#FAFAFA] flex justify-end">
                          <button onClick={()=>setCurrentView('dashboard')} style={{ backgroundColor: settings.brandColor }} className="text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all">Save Changes</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── MEMBERS TAB ──
                      Shows current workspace members and an invite form.
                      The invite section is locked behind an Organisation plan upgrade gate on the free plan. */}
                  {activeSettingsTab === 'members' && (
                    <div className="space-y-6">
                      {/* Current members table */}
                      <div className="p-8 border border-[#E1E1E1] rounded-xl bg-white space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base">Workspace Members</h3>
                          <span className="px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#E1E1E1] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">{members.length} member{members.length !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="border border-[#E1E1E1] rounded-xl overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-[#FAFAFA] border-b border-[#E1E1E1]">
                              <tr>
                                <th className="px-6 py-3 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Member</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Role</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E1E1E1]">
                              {members.map(m => (
                                <tr key={m.id} className="h-14">
                                  <td className="px-6">
                                    <p className="text-sm font-bold">{m.name}</p>
                                    <p className="text-xs text-[#6B7280]">{m.email}</p>
                                  </td>
                                  <td className="px-6"><span className="text-xs font-bold text-[#6B7280]">{m.role}</span></td>
                                  <td className="px-6"><span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase">{m.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* INVITE SECTION — frosted lock overlay for free plan users
                          Clicking "Upgrade to Organisation" opens the pricing modal */}
                      <div className="relative p-8 border border-[#E1E1E1] rounded-xl bg-white space-y-6 overflow-hidden">
                        {/* Lock overlay — covers the invite form for free plan */}
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-xl">
                          <div className="w-12 h-12 rounded-full bg-[#F0F4FF] border border-[#E1E1E1] flex items-center justify-center mb-4">
                            <Lock size={20} style={{ color: settings.brandColor }} />
                          </div>
                          <p className="text-base font-bold text-[#010101] mb-1">Organisation Plan Required</p>
                          <p className="text-sm text-[#6B7280] text-center max-w-xs mb-5">Invite team members and collaborate on invoices with the Organisation plan.</p>
                          <div className="flex flex-col items-center gap-2">
                            {/* Opens the pricing modal to show all plan options */}
                            <button
                              style={{ backgroundColor: settings.brandColor }}
                              className="text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-all"
                              onClick={() => setIsPricingModalOpen(true)}
                            >
                              Upgrade to Organisation
                            </button>
                            <p className="text-[11px] text-[#6B7280]">From $29/month · Unlimited members</p>
                          </div>
                        </div>

                        {/* Background invite form (blurred by the overlay above) */}
                        <h3 className="font-bold text-base">Invite Members</h3>
                        <p className="text-sm text-[#6B7280]">Invite your team to collaborate on invoices and manage clients together.</p>
                        <div className="flex gap-3">
                          <input type="email" placeholder="colleague@company.com" className="flex-1 h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none text-sm" />
                          <button className="h-[48px] px-6 rounded-lg text-white font-bold text-sm" style={{ backgroundColor: settings.brandColor }}>Send Invite</button>
                        </div>
                        <div className="p-4 bg-[#FAFAFA] border border-[#E1E1E1] rounded-lg">
                          <p className="text-xs text-[#6B7280]">Members can view invoices, create drafts, and manage clients. Owners have full admin access.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── PAYOUT TAB ──
                      Tax ID, bank name, account details, and a verification flow for escrow payouts */}
                  {activeSettingsTab === 'payout' && (
                    <div className="space-y-6">
                      {/* Escrow payout explainer banner */}
                      <div className="p-6 border border-purple-100 bg-purple-50 rounded-xl flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white border border-purple-100 flex items-center justify-center flex-shrink-0">
                          <Landmark size={18} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-bold text-[#010101] text-sm">DanPay Escrow Payout</p>
                          <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">When a client pays into an escrow account, funds are held securely until you release them. Configure your bank details below to enable payouts to your account.</p>
                        </div>
                      </div>

                      <div className="p-8 border border-[#E1E1E1] rounded-xl bg-white space-y-6">
                        <h3 className="font-bold text-base">Tax & Identity</h3>

                        {/* Tax ID input — required for compliance */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Tax ID / EIN</label>
                          <div className="relative">
                            <Hash size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                            <input
                              type="text"
                              placeholder="XX-XXXXXXX"
                              value={payoutSettings.taxId}
                              onChange={e => setPayoutSettings(p => ({ ...p, taxId: e.target.value, verified: false }))}
                              className="w-full h-[48px] pl-10 pr-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                            />
                          </div>
                          <p className="text-[11px] text-[#6B7280]">Required for compliance and tax reporting on escrow payouts.</p>
                        </div>

                        <div className="pt-4 border-t border-[#E1E1E1] space-y-6">
                          <h3 className="font-bold text-base">Bank Account Details</h3>

                          {/* Bank name with icon prefix */}
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Bank Name</label>
                            <div className="relative">
                              <Building2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                              <input
                                type="text"
                                placeholder="e.g. Chase, Wells Fargo"
                                value={payoutSettings.bankName}
                                onChange={e => setPayoutSettings(p => ({ ...p, bankName: e.target.value, verified: false }))}
                                className="w-full h-[48px] pl-10 pr-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                              />
                            </div>
                          </div>

                          <InputField
                            label="Account Holder Name"
                            placeholder="Full name or business name"
                            value={payoutSettings.accountName}
                            onChange={e => setPayoutSettings(p => ({ ...p, accountName: e.target.value, verified: false }))}
                          />

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Account Number</label>
                            <input
                              type="text"
                              placeholder="Your bank account number"
                              value={payoutSettings.accountNumber}
                              onChange={e => setPayoutSettings(p => ({ ...p, accountNumber: e.target.value, verified: false }))}
                              className="w-full h-[48px] px-4 rounded-[8px] border border-[#E1E1E1] bg-white outline-none focus:border-[#2563EB] transition-colors text-sm"
                            />
                          </div>

                          {/* Verification state: success banner or verify CTA */}
                          {payoutSettings.verified ? (
                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg">
                              <BadgeCheck size={20} className="text-green-600 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-bold text-green-700">Bank account verified</p>
                                <p className="text-xs text-green-600">Escrow payouts will be sent to {payoutSettings.bankName} · ···{payoutSettings.accountNumber.slice(-4)}</p>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={handleBankVerification}
                              disabled={!payoutSettings.bankName || !payoutSettings.accountNumber || !payoutSettings.accountName || payoutSettings.verifying}
                              className="w-full h-[52px] rounded-lg border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ borderColor: settings.brandColor, color: settings.brandColor }}
                            >
                              {payoutSettings.verifying ? (
                                <><RefreshCw size={16} className="animate-spin" /> Verifying account...</>
                              ) : (
                                <><BadgeCheck size={16} /> Verify Bank Account</>
                              )}
                            </button>
                          )}

                          {/* Micro-deposit warning note */}
                          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 leading-relaxed">DanPay may send a small test deposit (under $1) to verify your account. This will be reflected in your next payout statement.</p>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-[#E1E1E1] flex justify-end">
                          <button
                            onClick={() => alert('Payout settings saved!')}
                            style={{ backgroundColor: settings.brandColor }}
                            className="text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all"
                          >
                            Save Payout Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security and Notifications tabs — placeholder content */}
                  {activeSettingsTab === 'security' && (
                    <div className="p-8 border border-[#E1E1E1] rounded-xl bg-white">
                      <p className="text-sm text-[#6B7280]">Security settings coming soon.</p>
                    </div>
                  )}
                  {activeSettingsTab === 'notifications' && (
                    <div className="p-8 border border-[#E1E1E1] rounded-xl bg-white">
                      <p className="text-sm text-[#6B7280]">Notification preferences coming soon.</p>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ─────────────────────────────────────────────
          MOBILE BOTTOM NAVIGATION
          Fixed tab bar on mobile — uses mobileMenuItems which excludes Receipts and Analytics.
          Receipts are accessible via the Invoices sub-tab on mobile.
          ───────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E1E1E1] z-30 flex items-center justify-around px-2 h-16 safe-area-bottom">
        {mobileMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id);
              // Reset the mobile sub-tab to invoices whenever the user navigates to Invoices
              if (item.id === 'invoices') setInvoiceMobileTab('invoices');
            }}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all"
            style={{ color: currentView === item.id ? settings.brandColor : '#6B7280' }}
          >
            <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 1.8} />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MOBILE FAB: Floating action button for quick invoice/client creation on mobile */}
      <FAB
        brandColor={settings.brandColor}
        onNewInvoice={() => setCurrentView('create-invoice')}
        onNewClient={() => setIsClientDrawerOpen(true)}
      />

      {/* ─────────────────────────────────────────────
          DRAWER: Add New Client
          Slides in from the right; contains a labeled form for client details
          ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isClientDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsClientDrawerOpen(false)} className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white border-l border-[#E1E1E1] z-[70] p-10 flex flex-col">
              <div className="flex justify-between items-center mb-10 text-left">
                <h2 className="text-2xl font-bold text-[#010101]">New Client Profile</h2>
                <button onClick={() => setIsClientDrawerOpen(false)} className="p-2 hover:bg-[#FAFAFA] rounded-full"><X size={24}/></button>
              </div>
              <form onSubmit={handleAddClient} className="flex-1 space-y-6 text-left">
                <InputField label="Name" name="clientName" placeholder="Jane Doe" />
                <InputField label="Email" name="clientEmail" type="email" placeholder="billing@client.com" />
                <InputField label="Company Name (optional)" name="clientCompany" placeholder="Acme Corp" />
                <InputField label="Address (optional)" name="clientAddress" placeholder="123 Main St, City" />
                <button type="submit" style={{ backgroundColor: settings.brandColor }} className="w-full h-[56px] text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all">Save Client Profile</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────
          DRAWER: Invoice Detail
          Full invoice breakdown with line items, escrow account block, payment actions
          ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedInvoice && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInvoice(null)} className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full md:max-w-[480px] bg-white border-l border-[#E1E1E1] z-[70] flex flex-col overflow-y-auto">
              
              {/* Drawer header with invoice ID */}
              <div className="flex justify-between items-center p-5 md:p-8 border-b border-[#E1E1E1] sticky top-0 bg-white z-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Invoice</p>
                  <h2 className="text-xl md:text-2xl font-bold">{selectedInvoice.id}</h2>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-[#FAFAFA] rounded-full border border-[#E1E1E1]"><X size={20}/></button>
              </div>

              <div className="p-5 md:p-8 space-y-6 md:space-y-8 flex-1">
                {/* Status, type, and escrow badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {(() => { const s={Pending:'bg-yellow-50 text-yellow-600',Paid:'bg-green-50 text-green-600',Overdue:'bg-red-50 text-red-500',Sent:'bg-blue-50 text-blue-600',Draft:'bg-gray-100 text-gray-500'}; return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${s[selectedInvoice.status]||'bg-gray-100 text-gray-500'}`}>{selectedInvoice.status}</span>; })()}
                  <span className="px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#E1E1E1] text-[10px] font-bold uppercase text-[#6B7280]">{selectedInvoice.type === 'recurring' ? '↻ Recurring' : '· One-Time'}</span>
                  {selectedInvoice.escrow && <EscrowBadge />}
                </div>

                {/* Client info row — name and email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Client</p>
                    <p className="font-bold text-sm">{selectedInvoice.client}</p>
                    {selectedInvoice.clientEmail && (
                      <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-1">
                        <Mail size={11} className="flex-shrink-0" />
                        {selectedInvoice.clientEmail}
                      </p>
                    )}
                  </div>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Issue Date</p><p className="font-bold text-sm">{selectedInvoice.date}</p></div>
                  {selectedInvoice.dueDate && <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Due Date</p><p className="font-bold text-sm">{selectedInvoice.dueDate}</p></div>}
                </div>

                {/* Line items breakdown */}
                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-3">Line Items</p>
                    <div className="border border-[#E1E1E1] rounded-lg overflow-hidden">
                      <div className="grid grid-cols-4 bg-[#FAFAFA] px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">
                        <div className="col-span-2">Description</div><div className="text-right">Qty</div><div className="text-right">Amount</div>
                      </div>
                      {selectedInvoice.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-4 px-4 py-3 text-sm border-t border-[#E1E1E1]">
                          <div className="col-span-2 text-[#010101] truncate pr-2">{item.desc || '—'}</div>
                          <div className="text-right text-[#6B7280]">{item.qty}</div>
                          <div className="text-right font-bold">{currencySymbol}{(item.qty * item.rate).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discount / Tax / Total summary block */}
                <div className="bg-[#FAFAFA] border border-[#E1E1E1] rounded-lg p-4 md:p-5 space-y-2">
                  {selectedInvoice.discount > 0 && <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Discount</span><span className="font-bold text-green-600">-{currencySymbol}{Number(selectedInvoice.discount).toLocaleString()}</span></div>}
                  {selectedInvoice.tax > 0 && <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Tax (VAT {selectedInvoice.tax}%)</span><span className="font-bold">{currencySymbol}{((selectedInvoice.items||[]).reduce((a,i)=>a+(i.qty*i.rate),0) * selectedInvoice.tax / 100).toLocaleString()}</span></div>}
                  <div className="flex justify-between text-base border-t border-[#E1E1E1] pt-2 mt-2"><span className="font-bold">Total</span><span className="font-bold text-xl">{currencySymbol}{Number(selectedInvoice.amount).toLocaleString()}</span></div>
                </div>

                {/* Notes section — only shown if notes were added */}
                {selectedInvoice.notes && (
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-2">Notes</p><p className="text-sm text-[#6B7280] bg-[#FAFAFA] border border-[#E1E1E1] rounded-lg p-4 leading-relaxed">{selectedInvoice.notes}</p></div>
                )}

                {/* ── ESCROW ACCOUNT DETAILS BLOCK ──
                    Displayed when the invoice was created with escrow enabled.
                    Each field is individually copyable via the clipboard icon. */}
                {selectedInvoice.escrow && (
                  <div className="border border-purple-100 rounded-xl overflow-hidden">
                    <div className="bg-purple-50 px-5 py-4 flex items-center gap-3 border-b border-purple-100">
                      <Landmark size={16} className="text-purple-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">DanPay Escrow Account</p>
                        <p className="text-[11px] text-purple-500 mt-0.5">Client pays to this account — funds held until you release</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-4 bg-white">
                      {[
                        { label: 'Bank Name', value: selectedInvoice.escrow.bankName },
                        { label: 'Account Name', value: selectedInvoice.escrow.accountName },
                        { label: 'Account Number', value: selectedInvoice.escrow.accountNumber },
                        { label: 'Routing Number', value: selectedInvoice.escrow.routingNumber },
                        { label: 'Payment Reference', value: selectedInvoice.escrow.reference },
                      ].map(field => (
                        <div key={field.label} className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{field.label}</p>
                            <p className="text-sm font-bold text-[#010101] mt-0.5">{field.value}</p>
                          </div>
                          {/* Copy-to-clipboard button for each field */}
                          <button
                            onClick={() => navigator.clipboard.writeText(field.value).catch(() => {})}
                            className="p-2 hover:bg-[#FAFAFA] rounded-lg border border-[#E1E1E1] text-[#6B7280] transition-colors"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Escrow status indicator */}
                    <div className="px-5 py-4 bg-purple-50 border-t border-purple-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Escrow Status</span>
                      <span className="px-3 py-1 rounded-full bg-white border border-purple-200 text-[10px] font-bold uppercase text-purple-700 capitalize">{selectedInvoice.escrow.status}</span>
                    </div>
                  </div>
                )}

                {/* Mark as paid button — only shown if not already paid */}
                {selectedInvoice.status !== 'Paid' && (
                  <div className="border border-[#E1E1E1] rounded-lg p-4 md:p-5 bg-[#FAFAFA] space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Payment Confirmation</p>
                    <button
                      onClick={() => {
                        // Mark invoice as paid in state; if escrow, credit wallet balance
                        const updated = invoices.map(i => i.id === selectedInvoice.id ? {...i, status: 'Paid'} : i);
                        setInvoices(updated);
                        const updatedInvoice = {...selectedInvoice, status: 'Paid'};
                        setSelectedInvoice(updatedInvoice);
                        handleMarkEscrowPaid(selectedInvoice);
                      }}
                      className="w-full flex items-center justify-center gap-2 h-[48px] rounded-lg text-white text-sm font-bold transition-all hover:opacity-90"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      <CheckCircle2 size={16}/> Confirm Payment Received
                    </button>
                  </div>
                )}

                {/* Paid confirmation banner */}
                {selectedInvoice.status === 'Paid' && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-green-700">Payment confirmed</p>
                      <p className="text-xs text-green-600">This invoice has been marked as paid.</p>
                    </div>
                  </div>
                )}

                {/* Payment reminder button for pending or overdue invoices */}
                {(selectedInvoice.status === 'Pending' || selectedInvoice.status === 'Overdue') && (
                  <div className="border border-[#E1E1E1] rounded-lg p-4 md:p-5 bg-[#FAFAFA]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-3">Payment Reminder</p>
                    {reminderSent[selectedInvoice.id] ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-bold"><CheckCircle2 size={16}/> Reminder sent to {selectedInvoice.client}</div>
                    ) : (
                      <button
                        onClick={() => setReminderSent({...reminderSent, [selectedInvoice.id]: true})}
                        className="flex items-center gap-2 w-full justify-center h-[44px] rounded-lg border-2 text-sm font-bold transition-all hover:opacity-90"
                        style={{ borderColor: settings.brandColor, color: settings.brandColor }}
                      >
                        <Send size={15}/> Send Payment Reminder
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer footer: Download txt + Share */}
              <div className="p-5 md:p-8 border-t border-[#E1E1E1] flex gap-3">
                <button
                  onClick={() => { const content = `INVOICE ${selectedInvoice.id}\nClient: ${selectedInvoice.client}\nEmail: ${selectedInvoice.clientEmail || 'N/A'}\nDate: ${selectedInvoice.date}\nAmount: ${currencySymbol}${Number(selectedInvoice.amount).toLocaleString()}\nStatus: ${selectedInvoice.status}${selectedInvoice.escrow ? `\n\nEscrow Account: ${selectedInvoice.escrow.accountNumber}\nRouting: ${selectedInvoice.escrow.routingNumber}\nRef: ${selectedInvoice.escrow.reference}` : ''}`; const a=document.createElement('a'); a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(content); a.download=`${selectedInvoice.id}.txt`; a.click(); }}
                  className="flex-1 flex items-center justify-center gap-2 h-[48px] rounded-lg border border-[#E1E1E1] text-sm font-bold text-[#6B7280] hover:bg-[#FAFAFA] transition-colors"
                >
                  <Download size={16}/> <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={() => { setShareItem(selectedInvoice); setShareType('invoice'); }}
                  className="flex-1 flex items-center justify-center gap-2 h-[48px] rounded-lg text-white text-sm font-bold hover:opacity-90 transition-all"
                  style={{ backgroundColor: settings.brandColor }}
                >
                  <Share2 size={16}/> <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────
          DRAWER: Receipt Detail
          Shows a paid invoice formatted as a receipt; includes line items and share/download
          ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedReceipt && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedReceipt(null)} className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full md:max-w-[480px] bg-white border-l border-[#E1E1E1] z-[70] flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center p-5 md:p-8 border-b border-[#E1E1E1] sticky top-0 bg-white z-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Receipt</p>
                  <h2 className="text-xl md:text-2xl font-bold">RCT-{selectedReceipt.id}</h2>
                </div>
                <button onClick={() => setSelectedReceipt(null)} className="p-2 hover:bg-[#FAFAFA] rounded-full border border-[#E1E1E1]"><X size={20}/></button>
              </div>
              <div className="p-5 md:p-8 space-y-6 md:space-y-8 flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase">Paid</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Client</p>
                    <p className="font-bold text-sm">{selectedReceipt.client}</p>
                    {selectedReceipt.clientEmail && (
                      <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-1"><Mail size={11} />{selectedReceipt.clientEmail}</p>
                    )}
                  </div>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Payment Date</p><p className="font-bold text-sm">{selectedReceipt.date}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Invoice Ref</p><p className="font-bold text-sm">{selectedReceipt.id}</p></div>
                </div>
                {/* Line items on receipt */}
                {selectedReceipt.items && selectedReceipt.items.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-3">Items</p>
                    <div className="border border-[#E1E1E1] rounded-lg overflow-hidden">
                      <div className="grid grid-cols-4 bg-[#FAFAFA] px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">
                        <div className="col-span-2">Description</div><div className="text-right">Qty</div><div className="text-right">Amount</div>
                      </div>
                      {selectedReceipt.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-4 px-4 py-3 text-sm border-t border-[#E1E1E1]">
                          <div className="col-span-2 truncate pr-2">{item.desc || '—'}</div>
                          <div className="text-right text-[#6B7280]">{item.qty}</div>
                          <div className="text-right font-bold">{currencySymbol}{(item.qty * item.rate).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Amount paid total */}
                <div className="bg-[#FAFAFA] border border-[#E1E1E1] rounded-lg p-4 md:p-5">
                  <div className="flex justify-between text-base"><span className="font-bold">Amount Paid</span><span className="font-bold text-xl text-green-600">{currencySymbol}{Number(selectedReceipt.amount).toLocaleString()}</span></div>
                </div>
                {selectedReceipt.notes && <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-2">Notes</p><p className="text-sm text-[#6B7280] bg-[#FAFAFA] border border-[#E1E1E1] rounded-lg p-4">{selectedReceipt.notes}</p></div>}
              </div>
              <div className="p-5 md:p-8 border-t border-[#E1E1E1] flex gap-3">
                <button
                  onClick={() => { const content = `RECEIPT RCT-${selectedReceipt.id}\nClient: ${selectedReceipt.client}\nDate: ${selectedReceipt.date}\nAmount Paid: ${currencySymbol}${Number(selectedReceipt.amount).toLocaleString()}`; const a=document.createElement('a'); a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(content); a.download=`RCT-${selectedReceipt.id}.txt`; a.click(); }}
                  className="flex-1 flex items-center justify-center gap-2 h-[48px] rounded-lg border border-[#E1E1E1] text-sm font-bold text-[#6B7280] hover:bg-[#FAFAFA] transition-colors"
                >
                  <Download size={16}/> <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={() => { setShareItem(selectedReceipt); setShareType('receipt'); }}
                  className="flex-1 flex items-center justify-center gap-2 h-[48px] rounded-lg text-white text-sm font-bold hover:opacity-90 transition-all"
                  style={{ backgroundColor: settings.brandColor }}
                >
                  <Share2 size={16}/> <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────
          DRAWER: Edit Client
          Slide-in panel with editable client fields and a delete option
          ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedClient && editClientDraft && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedClient(null); setEditClientDraft(null); }} className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white border-l border-[#E1E1E1] z-[70] p-10 flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Client Profile</p>
                  <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
                </div>
                <button onClick={() => { setSelectedClient(null); setEditClientDraft(null); }} className="p-2 hover:bg-[#FAFAFA] rounded-full border border-[#E1E1E1]"><X size={20}/></button>
              </div>
              <div className="flex-1 space-y-6 text-left">
                <InputField label="Name" value={editClientDraft.name} onChange={(e) => setEditClientDraft({...editClientDraft, name: e.target.value})} />
                <InputField label="Email" type="email" value={editClientDraft.email} onChange={(e) => setEditClientDraft({...editClientDraft, email: e.target.value})} />
                <InputField label="Company Name (optional)" value={editClientDraft.company || ''} onChange={(e) => setEditClientDraft({...editClientDraft, company: e.target.value})} />
                <InputField label="Address (optional)" value={editClientDraft.address || ''} onChange={(e) => setEditClientDraft({...editClientDraft, address: e.target.value})} />
                <InputField label="Location" value={editClientDraft.location || ''} onChange={(e) => setEditClientDraft({...editClientDraft, location: e.target.value})} />
                <div className="pt-4 space-y-3">
                  {/* Save edits to client — updates the clients array by id */}
                  <button
                    onClick={() => { setClients(clients.map(c => c.id === editClientDraft.id ? editClientDraft : c)); setSelectedClient(null); setEditClientDraft(null); }}
                    style={{ backgroundColor: settings.brandColor }}
                    className="w-full h-[56px] text-white rounded-lg font-bold text-base hover:opacity-90 transition-all"
                  >
                    Save Changes
                  </button>
                  {/* Delete client — removes from list and closes drawer */}
                  <button
                    onClick={() => { setClients(clients.filter(c => c.id !== selectedClient.id)); setSelectedClient(null); setEditClientDraft(null); }}
                    className="w-full h-[44px] rounded-lg border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={15}/> Delete Client
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────
          SHARE DRAWER — highest z-index so it slides over other drawers
          Allows sharing the selected invoice or receipt via link or email
          ───────────────────────────────────────────── */}
      <ShareDrawer
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
        item={shareItem}
        type={shareType}
        brandColor={settings.brandColor}
        currencySymbol={currencySymbol}
      />
    </div>
  );
  } // This closes the function DanPay()

// --- NEW WRAPPER LOGIC STARTS HERE ---

// This component handles the logic of what to show
function AppContent() {
  const { isAuthenticated } = useAuth();
  
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return localStorage.getItem('onboardingDone') === 'true';
  });

  const handleAuthFinished = (isNewUser) => {
    // Both login and signup should mark onboarding as "checked" for now
    // logic inside AuthFlow handles the branching
    setOnboardingComplete(true);
    localStorage.setItem('onboardingDone', 'true');
  };

  if (!isAuthenticated) {
    return <AuthFlow onComplete={handleAuthFinished} />; 
  }

  if (!onboardingComplete) {
    return <AuthFlow onComplete={handleAuthFinished} />;
  }

  return <DanPay />;
}

// THIS IS THE PART YOU ARE MISSING
// It must be named "App" and it must say "export default"
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}