
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, ArrowRight, User as UserIcon, Lock, Mail, AlertCircle, Loader2,
  Edit3, Search as SearchIcon, Eye, Car, Bike, X, Terminal,
  MessageSquare, Inbox, Users, Trash2, Pause, Play, BarChart3, 
  Activity, AlertTriangle, Shield, Key, History, Phone, RefreshCcw, 
  ExternalLink, Plus, ShieldPlus, Link as LinkIcon, Copy, FileText, Banknote, 
  CreditCard, TrendingUp, Settings, LogOut, CheckCircle2, ChevronRight,
  Filter, Download, PieChart, Landmark, Gavel, FileCheck, Layers,
  Zap, Clock, Fingerprint, Snowflake, ShieldAlert, CheckCircle, Save, Info,
  RotateCw, Undo2, Target
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { 
  User, ContactMessage, UserStatus, AdminRole, PolicyRecord, 
  Claim, PaymentRecord, ClaimStatus, PolicyStatus, KYCStatus, 
  RiskLevel, BillingStatus 
} from '../types';

type AdminTab = 'dashboard' | 'customers' | 'policies' | 'claims' | 'payments' | 'logs';
type CustomerTab = 'policies' | 'security';

const CustomerCenterPage: React.FC = () => {
  const { 
    user, isLoading, logout, 
    getAuditLogs, getAllUsers, getInquiries, 
    updateUserStatus, deleteUser,
    getAllPolicies, updatePolicyStatus, updatePolicyDetails, getAllClaims, updateClaimStatus, 
    getAllPayments, updatePaymentStatus
  } = useAuth();
  
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [activeCustomerTab, setActiveCustomerTab] = useState<CustomerTab>('policies');
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allPolicies, setAllPolicies] = useState<PolicyRecord[]>([]);
  const [allClaims, setAllClaims] = useState<Claim[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<PolicyRecord | null>(null);
  const [viewingClaim, setViewingClaim] = useState<Claim | null>(null);
  const [viewingPayment, setViewingPayment] = useState<PaymentRecord | null>(null);
  
  const [showReasonModal, setShowReasonModal] = useState<{ type: string; id: string; nextStatus: string; extra?: any } | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const refreshData = () => {
    if (isAdmin) {
      setAllUsers(getAllUsers());
      setAllPolicies(getAllPolicies());
      setAllClaims(getAllClaims());
      setAllPayments(getAllPayments());
      setAuditLogs(getAuditLogs());
    }
  };

  useEffect(() => {
    if (user) refreshData();
  }, [user, activeAdminTab]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const handleActionWithReason = (type: string, id: string, nextStatus: string, extra?: any) => {
    setShowReasonModal({ type, id, nextStatus, extra });
    setReasonText('');
  };

  const commitAction = () => {
    if (!showReasonModal) return;
    const { type, id, nextStatus, extra } = showReasonModal;
    
    if (type === 'policy') updatePolicyStatus(id, nextStatus as PolicyStatus, reasonText);
    if (type === 'user') updateUserStatus(id, nextStatus as UserStatus, reasonText);
    if (type === 'delete') deleteUser(id, reasonText);
    if (type === 'claim') updateClaimStatus(id, nextStatus as ClaimStatus, reasonText, extra?.isSuspicious);
    if (type === 'payment') updatePaymentStatus(id, nextStatus as BillingStatus, reasonText);

    setSuccessMessage(`Database Updated: ${id}`);
    setShowReasonModal(null);
    refreshData();

    // Close overlays
    if (type === 'user') setViewingUser(null);
    if (type === 'policy') setViewingPolicy(null);
    if (type === 'claim') setViewingClaim(null);
    if (type === 'payment') setViewingPayment(null);
    if (type === 'delete') { setViewingUser(null); setShowDeleteConfirm(null); }
  };

  const stats = useMemo(() => {
    if (!isAdmin) return null;
    const totalPremium = allPayments.filter(p => p.status === 'Paid in Full' || p.status === 'Payment Successful').reduce((acc, p) => acc + parseFloat(p.amount.replace(/[£,]/g, '')), 0);
    return {
      activePolicies: allPolicies.filter(p => p.status === 'Active').length,
      claimsTotal: allClaims.filter(c => c.status === 'Under Review' || c.status === 'Received').length,
      revenue: `£${totalPremium.toLocaleString()}`,
      newUsers: allUsers.length
    };
  }, [isAdmin, allPolicies, allClaims, allUsers, allPayments]);

  if (isLoading) return null;
  if (!user) return <Navigate to="/auth" />;

  const renderAdminPortal = () => (
    <div className="min-h-screen bg-[#faf8fa] flex font-inter">
      <aside className="w-80 bg-[#2d1f2d] text-white flex flex-col fixed inset-y-0 shadow-2xl z-50">
        <div className="p-10 flex items-center gap-4">
          <div className="bg-[#e91e8c] p-2 rounded-xl shadow-lg">
             <ShieldCheck size={28} className="text-white" />
          </div>
          <span className="text-2xl font-black font-outfit tracking-tighter">SWIFT ADMIN</span>
        </div>
        
        <nav className="flex-1 px-6 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Operations</p>
          {[
            { id: 'dashboard', label: 'Command Center', icon: <BarChart3 size={20}/> },
            { id: 'customers', label: 'Client Registry', icon: <Users size={20}/> },
            { id: 'policies', label: 'Policy Ledger', icon: <Layers size={20}/> },
            { id: 'claims', label: 'Adjudication', icon: <Gavel size={20}/> },
            { id: 'payments', label: 'Financial Control', icon: <Banknote size={20}/> },
            { id: 'logs', label: 'Audit Records', icon: <Terminal size={20}/> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveAdminTab(tab.id as AdminTab); setSearchQuery(''); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeAdminTab === tab.id ? 'bg-[#e91e8c] text-white shadow-xl shadow-pink-900/10' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 bg-[#2d1f2d]/50 backdrop-blur-xl">
          <button onClick={logout} className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
            <LogOut size={16}/> Terminate Session
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-80 p-12 lg:p-16 relative">
        {successMessage && (
          <div className="fixed top-8 right-8 z-[300] bg-green-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-4">
             <CheckCircle size={20}/> {successMessage}
          </div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
           <div>
              <h1 className="text-5xl font-black font-outfit text-[#2d1f2d] tracking-tighter capitalize">
                {activeAdminTab === 'dashboard' ? 'Operational Health' : activeAdminTab.replace('-', ' ')}
              </h1>
              <p className="text-gray-400 font-medium mt-2 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <Shield size={14} className="text-[#e91e8c]"/> 
                Administrator: {user.name} ({user.adminRole})
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative group">
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#e91e8c] transition-colors" size={20} />
                <input 
                  className="bg-white border border-gray-100 rounded-[28px] pl-16 pr-8 py-5 text-sm font-bold outline-none focus:border-[#e91e8c] shadow-sm focus:shadow-xl transition-all w-80 lg:w-[400px]" 
                  placeholder={`Search registry...`} 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={refreshData} className="p-5 bg-white border border-gray-100 rounded-[28px] text-gray-400 hover:text-[#e91e8c] transition-all shadow-sm active:scale-95">
                 <RefreshCcw size={20}/>
              </button>
           </div>
        </header>

        {activeAdminTab === 'dashboard' && stats && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Active Policies', value: stats.activePolicies, icon: <FileCheck/>, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Claims Pending', value: stats.claimsTotal, icon: <AlertTriangle/>, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { label: 'Cleared Revenue', value: stats.revenue, icon: <Banknote/>, color: 'text-green-500', bg: 'bg-green-50' },
                  { label: 'Client Accounts', value: stats.newUsers, icon: <Users/>, color: 'text-purple-500', bg: 'bg-purple-50' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group">
                     <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                        {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 32 })}
                     </div>
                     <div className="text-4xl font-black font-outfit text-[#2d1f2d]">{stat.value}</div>
                     <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mt-2">{stat.label}</div>
                  </div>
                ))}
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 bg-white p-12 rounded-[56px] border border-gray-100 shadow-sm">
                   <h3 className="text-2xl font-bold font-outfit mb-10 flex justify-between items-center text-[#2d1f2d]">Critical Events</h3>
                   <div className="space-y-4">
                      {auditLogs.slice(0, 5).map(log => (
                        <div key={log.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                           <div className="flex items-center gap-5">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400"><Activity size={18}/></div>
                              <div>
                                <p className="text-sm font-black text-[#2d1f2d] uppercase tracking-tight">{log.action}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Admin: {log.adminEmail} • ID: {log.targetId}</p>
                              </div>
                           </div>
                           <p className="text-[10px] font-bold text-gray-300 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="bg-[#2d1f2d] p-12 rounded-[56px] text-white relative overflow-hidden shadow-2xl">
                   <div className="relative z-10">
                      <h3 className="text-2xl font-bold font-outfit mb-6">Integrity Feed</h3>
                      <div className="space-y-8">
                         <div className="flex items-center gap-5 p-6 bg-white/5 rounded-[32px] border border-white/5">
                            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400"><CheckCircle size={24}/></div>
                            <div><p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">MID Gateway</p><p className="text-base font-bold">Responsive</p></div>
                         </div>
                         <div className="flex items-center gap-5 p-6 bg-white/5 rounded-[32px] border border-white/5">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400"><Shield size={24}/></div>
                            <div><p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Fraud Engine</p><p className="text-base font-bold">Monitoring</p></div>
                         </div>
                         <div className="flex items-center gap-5 p-6 bg-white/5 rounded-[32px] border border-white/5">
                            <div className="w-12 h-12 bg-[#e91e8c]/20 rounded-2xl flex items-center justify-center text-[#e91e8c]"><Lock size={24}/></div>
                            <div><p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Audit Ledger</p><p className="text-base font-bold">Sealed</p></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeAdminTab === 'customers' && (
          <div className="bg-white rounded-[56px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50">
                   <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <th className="p-10">Identity</th>
                      <th className="p-10">Access Status</th>
                      <th className="p-10">Risk Profile</th>
                      <th className="p-10 text-right">Database Control</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {allUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                     <tr key={u.id} className="hover:bg-[#faf8fa] group transition-colors cursor-pointer" onClick={() => setViewingUser(u)}>
                        <td className="p-10">
                           <p className="text-xl font-black text-[#2d1f2d] group-hover:text-[#e91e8c] transition-colors">{u.name}</p>
                           <p className="text-xs text-gray-400 font-medium mt-1">{u.email}</p>
                        </td>
                        <td className="p-10">
                           <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${
                             u.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 
                             u.status === 'Frozen' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                             u.status === 'Blocked' ? 'bg-red-50 text-red-600 border-red-100' :
                             'bg-gray-50 text-gray-400 border-gray-100'
                           }`}>
                              {u.status === 'Frozen' && <Snowflake size={10}/>}
                              {u.status === 'Blocked' && <Lock size={10}/>}
                              {u.status}
                           </span>
                        </td>
                        <td className="p-10">
                           <div className="flex items-center gap-4">
                              <span title="KYC Status" className={`w-2 h-2 rounded-full ${u.kycStatus === 'Verified' ? 'bg-green-500' : 'bg-orange-500'}`}/>
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                u.riskLevel === 'Standard' ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-red-50 text-red-600 border-red-100'
                              }`}>{u.riskLevel}</span>
                           </div>
                        </td>
                        <td className="p-10 text-right">
                           <div className="p-4 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-[#e91e8c] group-hover:bg-white transition-all shadow-sm inline-block">
                              <Eye size={20}/>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeAdminTab === 'policies' && (
          <div className="bg-white rounded-[56px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50">
                   <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <th className="p-10">Contract ID</th>
                      <th className="p-10">Asset Protected</th>
                      <th className="p-10">Premium</th>
                      <th className="p-10">Current Status</th>
                      <th className="p-10 text-right">Manage</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {allPolicies.filter(p => p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.customerName.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                     <tr key={p.id} className="hover:bg-[#faf8fa] group transition-colors cursor-pointer" onClick={() => setViewingPolicy(p)}>
                        <td className="p-10">
                           <p className="text-lg font-black text-[#2d1f2d] font-mono tracking-tight">{p.id}</p>
                           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">{p.customerName}</p>
                        </td>
                        <td className="p-10">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#e91e8c]">{p.type === 'CAR' ? <Car size={20}/> : <Bike size={20}/>}</div>
                              <p className="text-sm font-bold text-[#2d1f2d] uppercase">{p.vrm} • {p.make}</p>
                           </div>
                        </td>
                        <td className="p-10 text-xl font-black text-[#e91e8c] font-outfit tracking-tighter">{p.premium}</td>
                        <td className="p-10">
                           <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 w-fit ${
                             p.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 
                             p.status === 'Frozen' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                             'bg-orange-50 text-orange-600 border-orange-100'
                           }`}>
                              {p.status}
                           </span>
                        </td>
                        <td className="p-10 text-right">
                           <button className="p-4 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-[#e91e8c] group-hover:bg-white transition-all shadow-sm">
                              <Edit3 size={20}/>
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeAdminTab === 'claims' && (
          <div className="bg-white rounded-[56px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50">
                   <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <th className="p-10">Claim ID</th>
                      <th className="p-10">Loss Type</th>
                      <th className="p-10">Risk Signal</th>
                      <th className="p-10">Adjudication Status</th>
                      <th className="p-10 text-right">Verify</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {allClaims.map(c => (
                     <tr key={c.id} className="hover:bg-[#faf8fa] group transition-colors cursor-pointer" onClick={() => setViewingClaim(c)}>
                        <td className="p-10">
                           <p className="text-lg font-black text-[#2d1f2d] font-mono">{c.id}</p>
                           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">{c.customerName}</p>
                        </td>
                        <td className="p-10 text-sm font-bold text-[#2d1f2d]">{c.type}</td>
                        <td className="p-10">
                           {c.isSuspicious ? (
                             <span className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                               <ShieldAlert size={14}/> Suspicious
                             </span>
                           ) : (
                             <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest">Normal</span>
                           )}
                        </td>
                        <td className="p-10">
                           <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             c.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' :
                             c.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                             'bg-orange-50 text-orange-600 border-orange-100'
                           }`}>
                              {c.status}
                           </span>
                        </td>
                        <td className="p-10 text-right">
                           <div className="p-4 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-[#e91e8c] group-hover:bg-white transition-all shadow-sm inline-block">
                              <Eye size={20}/>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeAdminTab === 'payments' && (
          <div className="bg-white rounded-[56px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50">
                   <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <th className="p-10">Reference</th>
                      <th className="p-10">Amount</th>
                      <th className="p-10">Billing Status</th>
                      <th className="p-10 text-right">Financial Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {allPayments.map(p => (
                     <tr key={p.id} className="hover:bg-[#faf8fa] group transition-colors cursor-pointer" onClick={() => setViewingPayment(p)}>
                        <td className="p-10">
                           <p className="text-lg font-black text-[#2d1f2d] font-mono">{p.reference}</p>
                           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">{p.customerName}</p>
                        </td>
                        <td className="p-10 text-xl font-black text-[#e91e8c] font-outfit">{p.amount}</td>
                        <td className="p-10">
                           <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             p.status === 'Paid in Full' || p.status === 'Payment Successful' ? 'bg-green-50 text-green-600 border-green-100' :
                             p.status === 'Refunded' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                             'bg-red-50 text-red-600 border-red-100'
                           }`}>
                              {p.status}
                           </span>
                        </td>
                        <td className="p-10 text-right">
                           <div className="p-4 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-[#e91e8c] group-hover:bg-white transition-all shadow-sm inline-block">
                              <Undo2 size={20}/>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeAdminTab === 'logs' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-sm">
                <h3 className="text-3xl font-black font-outfit text-[#2d1f2d] mb-12 flex items-center gap-5">
                   <Terminal className="text-[#e91e8c]" size={32}/>
                   Immutable Audit Registry
                </h3>
                <div className="space-y-4">
                   {auditLogs.map(log => (
                     <div key={log.id} className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 hover:bg-white hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                           <span className="px-5 py-2 bg-[#2d1f2d] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">{log.action}</span>
                           <span className="text-[10px] font-bold text-gray-300 font-mono">{log.timestamp}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div>
                              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Target Resource</p>
                              <p className="text-xl font-bold text-[#2d1f2d] leading-relaxed">{log.details}</p>
                              <div className="flex gap-4 mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                 <span>Admin: {log.adminEmail}</span>
                                 <span>•</span>
                                 <span>Resource ID: {log.targetId}</span>
                              </div>
                           </div>
                           <div className="p-6 bg-white rounded-3xl border border-gray-100">
                              <p className="text-[10px] font-black uppercase text-[#e91e8c] tracking-widest mb-2">Authorised Reason</p>
                              <p className="text-sm font-medium text-gray-500 italic">"{log.reason || 'Standard operation'}"</p>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </main>

      {/* OVERLAY: CLIENT IDENTITY MASTER */}
      {viewingUser && (
        <div className="fixed inset-0 z-[100] bg-[#2d1f2d]/98 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-6xl rounded-[64px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
              <button onClick={() => setViewingUser(null)} className="absolute top-10 right-10 p-5 bg-gray-50 rounded-[28px] hover:bg-red-50 text-gray-400 transition-all z-10"><X size={24} /></button>
              <div className="p-16 lg:p-24 max-h-[90vh] overflow-y-auto custom-scrollbar">
                 <div className="flex flex-col md:flex-row items-center gap-14 mb-20 pb-20 border-b border-gray-100">
                    <div className="w-48 h-48 bg-gray-50 rounded-[64px] flex items-center justify-center text-[#e91e8c] text-7xl font-black font-outfit shadow-inner border border-gray-50 uppercase">{viewingUser.name.charAt(0)}</div>
                    <div className="flex-1 text-center md:text-left">
                       <h2 className="text-7xl font-black font-outfit text-[#2d1f2d] tracking-tighter leading-none mb-4">{viewingUser.name}</h2>
                       <p className="text-2xl text-gray-400 font-medium mb-10">{viewingUser.email} • ID: {viewingUser.id}</p>
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-10">
                          <div className="flex items-center gap-3">
                             <div className={`w-3 h-3 rounded-full ${viewingUser.status === 'Active' ? 'bg-green-500' : viewingUser.status === 'Frozen' ? 'bg-blue-500' : 'bg-red-500'}`}/>
                             <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">{viewingUser.status} Account Status</span>
                          </div>
                          <span className="text-gray-200">|</span>
                          <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Enrolled: {new Date(viewingUser.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-gray-50 rounded-[56px] p-12 space-y-10 border border-gray-100">
                       <h3 className="text-2xl font-black font-outfit text-[#2d1f2d] flex items-center gap-3"><ShieldAlert className="text-[#e91e8c]"/> Access Control Registry</h3>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Master Overrides</p>
                             <div className="flex flex-col gap-3">
                                {viewingUser.status !== 'Active' && (
                                  <button onClick={() => handleActionWithReason('user', viewingUser.id, 'Active')} className="w-full flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:text-green-600 hover:border-green-200 transition-all group">
                                    Restore Active <Play size={16}/>
                                  </button>
                                )}
                                {viewingUser.status === 'Active' && (
                                  <button onClick={() => handleActionWithReason('user', viewingUser.id, 'Frozen')} className="w-full flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:text-blue-600 hover:border-blue-200 transition-all group">
                                    Freeze Access <Snowflake size={16}/>
                                  </button>
                                )}
                                {viewingUser.status !== 'Blocked' && (
                                  <button onClick={() => handleActionWithReason('user', viewingUser.id, 'Blocked')} className="w-full flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:text-red-600 hover:border-red-200 transition-all group">
                                    Block Login <Lock size={16}/>
                                  </button>
                                )}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Compliance Actions</p>
                             <div className="flex flex-col gap-3">
                                <button onClick={() => setShowDeleteConfirm(viewingUser)} className="w-full flex items-center justify-between px-6 py-4 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg">
                                  Purge Identity <Trash2 size={16}/>
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-[#2d1f2d] rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden">
                       <h3 className="text-2xl font-black font-outfit mb-8 flex items-center gap-3"><Terminal size={20}/> Internal Intelligence</h3>
                       <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-3">Risk Narrative</p>
                            <p className="text-sm font-medium text-white/60 leading-relaxed italic">"Risk assessed manually on {new Date(viewingUser.createdAt).toLocaleDateString()}. Identity verified through system gateway."</p>
                          </div>
                          <button onClick={() => handleActionWithReason('risk', viewingUser.id, 'High Risk')} className="px-6 py-3 bg-[#e91e8c] rounded-xl text-[10px] font-black uppercase tracking-widest">Mark as High Risk</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* OVERLAY: POLICY MASTER CONTROL */}
      {viewingPolicy && (
        <div className="fixed inset-0 z-[100] bg-[#2d1f2d]/98 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-5xl rounded-[64px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
              <button onClick={() => setViewingPolicy(null)} className="absolute top-10 right-10 p-6 bg-gray-50 rounded-[32px] hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all z-10 shadow-sm"><X size={28} /></button>
              <div className="p-16 lg:p-24 max-h-[90vh] overflow-y-auto custom-scrollbar">
                 <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16 pb-12 border-b border-gray-100">
                    <div>
                       <span className="px-5 py-2 bg-pink-50 text-[#e91e8c] rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block">Policy Ledger Node</span>
                       <h2 className="text-7xl font-black font-outfit text-[#2d1f2d] tracking-tighter leading-none mb-4">{viewingPolicy.id}</h2>
                       <p className="text-2xl text-gray-400 font-medium">Policyholder: <span className="text-[#2d1f2d] font-bold">{viewingPolicy.customerName}</span></p>
                    </div>
                    <div className="bg-[#2d1f2d] px-14 py-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                       <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em] mb-3">Premium Assessment</p>
                       <p className="text-6xl font-black font-outfit text-[#e91e8c] tracking-tighter">{viewingPolicy.premium}</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                    <div className="bg-gray-50 rounded-[56px] p-12 border border-gray-100 space-y-10">
                       <h3 className="text-2xl font-bold font-outfit text-[#2d1f2d] flex items-center gap-3"><Settings size={24}/> Lifecycle controls</h3>
                       <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: 'Active', label: 'Activate', color: 'bg-green-600', icon: <Play size={16}/> },
                            { id: 'Frozen', label: 'Freeze', color: 'bg-blue-600', icon: <Snowflake size={16}/> },
                            { id: 'Cancelled', label: 'Cancel', color: 'bg-red-600', icon: <X size={16}/> },
                            { id: 'Terminated', label: 'Terminate Early', color: 'bg-red-800', icon: <Lock size={16}/> },
                            { id: 'Expired', label: 'Mark Expired', color: 'bg-orange-500', icon: <Clock size={16}/> },
                            { id: 'Renewed', label: 'Manual Renew', color: 'bg-[#e91e8c]', icon: <RotateCw size={16}/> }
                          ].map(status => (
                            <button 
                              key={status.id}
                              onClick={() => handleActionWithReason('policy', viewingPolicy.id, status.id)} 
                              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all shadow-md ${
                                viewingPolicy.status === status.id ? `${status.color} text-white` : 'bg-white text-gray-400 border border-gray-100 hover:border-[#e91e8c] hover:text-[#e91e8c]'
                              }`}
                            >
                               {status.icon} {status.label}
                            </button>
                          ))}
                       </div>
                    </div>
                    
                    <div className="bg-[#faf8fa] rounded-[56px] p-12 border border-gray-100 space-y-8">
                       <h3 className="text-2xl font-bold font-outfit text-[#2d1f2d] flex items-center gap-3"><Edit3 size={24}/> Database Correction</h3>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Holder Name</p>
                             <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-[#e91e8c]" defaultValue={viewingPolicy.customerName} onBlur={(e) => updatePolicyDetails(viewingPolicy.id, { customerName: e.target.value }, 'Administrative name correction')} />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registry VRM</p>
                                <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-mono font-black text-sm uppercase outline-none focus:border-[#e91e8c]" defaultValue={viewingPolicy.vrm} onBlur={(e) => updatePolicyDetails(viewingPolicy.id, { vrm: e.target.value }, 'Technical record fix')} />
                             </div>
                             <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Renewal Date</p>
                                <input type="date" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-[#e91e8c]" defaultValue={new Date(viewingPolicy.renewalDate).toISOString().split('T')[0]} />
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* OVERLAY: CLAIM ADJUDICATION */}
      {viewingClaim && (
        <div className="fixed inset-0 z-[100] bg-[#2d1f2d]/98 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-4xl rounded-[64px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
              <button onClick={() => setViewingClaim(null)} className="absolute top-10 right-10 p-6 bg-gray-50 rounded-[32px] hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all z-10"><X size={28} /></button>
              <div className="p-16 lg:p-24 max-h-[90vh] overflow-y-auto custom-scrollbar">
                 <h2 className="text-5xl font-black font-outfit text-[#2d1f2d] mb-4 tracking-tighter">Case Registry: {viewingClaim.id}</h2>
                 <p className="text-xl text-gray-400 font-medium mb-12">Claimant: <span className="text-[#2d1f2d] font-bold">{viewingClaim.customerName}</span></p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-8">
                       <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100">
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Loss Narrative</p>
                          <p className="text-lg text-[#2d1f2d] leading-relaxed font-medium">"{viewingClaim.description}"</p>
                       </div>
                       <div className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-xl">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#e91e8c] mb-6">Internal Case Ledger</h4>
                          <div className="space-y-4">
                             {viewingClaim.internalNotes?.map((n, i) => (
                               <div key={i} className="text-xs text-gray-400 pb-3 border-b border-gray-50">• {n}</div>
                             ))}
                             {(!viewingClaim.internalNotes || viewingClaim.internalNotes.length === 0) && <p className="text-xs text-gray-300 italic">No notes recorded.</p>}
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-10 bg-[#2d1f2d] rounded-[48px] text-white flex flex-col justify-between">
                       <h3 className="text-2xl font-bold font-outfit mb-10">Adjudication Engine</h3>
                       <div className="space-y-4">
                          <button onClick={() => handleActionWithReason('claim', viewingClaim.id, 'Approved')} className="w-full py-4 bg-green-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 shadow-xl transition-all">Approve Liability</button>
                          <button onClick={() => handleActionWithReason('claim', viewingClaim.id, 'Rejected')} className="w-full py-4 bg-red-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 shadow-xl transition-all">Reject Liability</button>
                          <button onClick={() => handleActionWithReason('claim', viewingClaim.id, 'Documents Requested')} className="w-full py-4 bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all">Request Documents</button>
                          <button onClick={() => handleActionWithReason('claim', viewingClaim.id, viewingClaim.status, { isSuspicious: true })} className="w-full py-4 bg-orange-600/20 text-orange-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600/30 transition-all border border-orange-500/30">Flag Suspicious</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* OVERLAY: PAYMENT CONTROL */}
      {viewingPayment && (
        <div className="fixed inset-0 z-[100] bg-[#2d1f2d]/98 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-3xl rounded-[64px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
              <button onClick={() => setViewingPayment(null)} className="absolute top-10 right-10 p-6 bg-gray-50 rounded-[32px] hover:bg-red-50 text-gray-400 transition-all z-10"><X size={24} /></button>
              <div className="p-16 lg:p-24 text-center">
                 <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 text-green-500 shadow-xl"><Banknote size={48}/></div>
                 <h2 className="text-4xl font-black font-outfit text-[#2d1f2d] mb-4 tracking-tighter">Financial Intervention</h2>
                 <p className="text-xl text-gray-400 font-medium mb-12">Ref: <span className="text-[#e91e8c] font-bold">{viewingPayment.reference}</span></p>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <button onClick={() => handleActionWithReason('payment', viewingPayment.id, 'Refunded')} className="py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-widest text-xs hover:bg-black shadow-2xl transition-all flex items-center justify-center gap-3"><RotateCw size={16}/> Trigger Refund</button>
                    <button onClick={() => handleActionWithReason('payment', viewingPayment.id, 'Disputed')} className="py-6 bg-white border border-gray-200 text-red-500 rounded-[32px] font-black uppercase tracking-widest text-xs hover:border-red-500 transition-all flex items-center justify-center gap-3"><AlertTriangle size={16}/> Mark Dispute</button>
                    <button onClick={() => handleActionWithReason('payment', viewingPayment.id, 'Overdue')} className="py-6 bg-orange-50 text-orange-600 rounded-[32px] font-black uppercase tracking-widest text-xs hover:bg-orange-100 transition-all flex items-center justify-center gap-3"><Clock size={16}/> Set Overdue</button>
                    <button onClick={() => handleActionWithReason('payment', viewingPayment.id, 'Chargeback Alert')} className="py-6 bg-red-50 text-red-600 rounded-[32px] font-black uppercase tracking-widest text-xs hover:bg-red-100 transition-all flex items-center justify-center gap-3"><Lock size={16}/> Chargeback Lock</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* COMPLIANCE MODAL: REASON FOR ACTION */}
      {showReasonModal && (
        <div className="fixed inset-0 z-[200] bg-[#2d1f2d]/90 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[64px] p-16 text-center shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-pink-50 text-[#e91e8c] rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                 <ShieldAlert size={48} />
              </div>
              <h3 className="text-4xl font-black font-outfit text-[#2d1f2d] mb-6 tracking-tight leading-none">Authorisation Required</h3>
              <p className="text-gray-400 mb-10 text-lg font-medium leading-relaxed px-4">Provide a formal justification for updating <strong>{showReasonModal.id}</strong> to status <strong>{showReasonModal.nextStatus}</strong>.</p>
              
              <textarea 
                className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-8 py-6 text-sm font-medium outline-none focus:border-[#e91e8c] resize-none h-40 mb-10 transition-all focus:bg-white" 
                placeholder="Reason (e.g., Non-payment, fraud suspicion, customer request...)"
                value={reasonText}
                onChange={e => setReasonText(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-6">
                 <button onClick={() => setShowReasonModal(null)} className="py-7 bg-gray-50 rounded-[32px] font-black uppercase text-[11px] tracking-[0.3em] text-gray-400 hover:bg-gray-100 transition-all">Abort Task</button>
                 <button 
                   onClick={commitAction}
                   disabled={reasonText.length < 5}
                   className="py-7 bg-[#2d1f2d] rounded-[32px] font-black uppercase text-[11px] tracking-[0.3em] text-white shadow-2xl hover:bg-black transition-all disabled:opacity-20"
                 >
                   Commit to DB
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* COMPLIANCE MODAL: PURGE CONFIRMATION */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[250] bg-red-900/95 backdrop-blur-2xl flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-xl rounded-[64px] p-16 text-center shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-red-100">
                 <AlertTriangle size={56} />
              </div>
              <h3 className="text-5xl font-black font-outfit text-[#2d1f2d] mb-6 tracking-tighter leading-none">Execute Purge?</h3>
              <p className="text-gray-500 mb-10 text-lg font-medium leading-relaxed px-4">
                You are about to permanently remove <strong>{showDeleteConfirm.name}</strong> from the active registry. 
                Data will be anonymized for compliance. This is NOT reversible.
              </p>

              <div className="flex flex-col gap-4">
                 <button 
                   onClick={() => handleActionWithReason('delete', showDeleteConfirm.id, 'Deleted')}
                   className="w-full py-7 bg-red-600 text-white rounded-[32px] font-black uppercase text-[12px] tracking-[0.4em] shadow-2xl hover:bg-red-700 transition-all"
                 >
                   Verify & Purge Record
                 </button>
                 <button 
                   onClick={() => setShowDeleteConfirm(null)}
                   className="w-full py-7 bg-gray-100 text-gray-400 rounded-[32px] font-black uppercase text-[12px] tracking-[0.4em] hover:bg-gray-200 transition-all"
                 >
                   Cancel Purge
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );

  const renderCustomerPortal = () => (
    <div className="min-h-screen bg-[#faf8fa] pb-24 font-inter">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#2d1f2d] via-[#2d1f2d]/95 to-[#faf8fa] z-0" />
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-gradient-to-br from-[#e91e8c] to-[#ff4da6] rounded-[32px] flex items-center justify-center text-white text-4xl font-black font-outfit shadow-2xl relative overflow-hidden">
                {user.name.charAt(0)}
                {user.status === 'Frozen' && (
                  <div className="absolute inset-0 bg-blue-500/80 backdrop-blur-sm flex items-center justify-center">
                    <Snowflake className="text-white" size={40} />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold font-outfit tracking-tighter text-white">Member Hub</h1>
                <p className="text-white/50 text-xl font-medium mt-2 flex items-center gap-3">
                   {user.email} • ID: {user.id}
                   {user.status === 'Frozen' && (
                     <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       <Snowflake size={10}/> Account Frozen
                     </span>
                   )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={logout} className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[24px] font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white/10 transition-all active:scale-95">Terminate Session</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1 space-y-3">
              {[
                { id: 'policies', label: 'My Policies', icon: <Layers size={20} /> },
                { id: 'security', label: 'Security Controls', icon: <Lock size={20} /> },
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveCustomerTab(item.id as CustomerTab)} 
                  className={`w-full flex items-center gap-5 px-8 py-7 rounded-[32px] font-black text-sm transition-all text-left group ${
                    activeCustomerTab === item.id ? 'bg-[#e91e8c] text-white shadow-xl shadow-pink-900/10' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                  }`}
                >
                   <span className={`${activeCustomerTab === item.id ? 'text-white' : 'text-[#e91e8c]'}`}>{item.icon}</span> 
                   {item.label}
                </button>
              ))}
            </div>

            <div className="lg:col-span-3">
               <div className="bg-white p-12 md:p-20 rounded-[64px] border border-gray-100 shadow-xl min-h-[600px] animate-in fade-in duration-500">
                  {activeCustomerTab === 'policies' && (
                    <div className="space-y-12">
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                         <h2 className="text-4xl font-black font-outfit text-[#2d1f2d]">Active Protection</h2>
                         {user.status === 'Frozen' && (
                           <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex gap-4 max-w-md">
                              <AlertCircle className="text-blue-500 shrink-0" size={20}/>
                              <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                                SYSTEM NOTICE: Your account has been restricted by an administrator. Purchases and claims are suspended.
                              </p>
                           </div>
                         )}
                       </div>
                       
                       <div className="space-y-6">
                          {getAllPolicies().filter(p => p.userId === user.id).length === 0 ? (
                            <div className="p-32 text-center border-4 border-dashed border-gray-50 rounded-[48px] text-gray-200 uppercase font-black tracking-widest text-sm">No coverage records found.</div>
                          ) : getAllPolicies().filter(p => p.userId === user.id).map(p => (
                            <div key={p.id} className="p-10 bg-gray-50 rounded-[48px] border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-2xl transition-all">
                               <div className="flex items-center gap-10">
                                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-[#e91e8c] shadow-lg group-hover:scale-110 transition-transform">
                                    {p.type.toLowerCase() === 'motorcycle' ? <Bike size={40}/> : <Car size={40}/>}
                                  </div>
                                  <div>
                                     <p className="text-3xl font-black text-[#2d1f2d] font-outfit tracking-tight leading-none mb-3">{p.make} {p.model}</p>
                                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest font-mono">Plate: {p.vrm} • Policy: {p.id}</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className="text-5xl font-black font-outfit text-[#e91e8c] tracking-tighter">{p.premium}</p>
                                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-2">{p.status} Status</span>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {activeCustomerTab === 'security' && (
                    <div className="space-y-12">
                       <h2 className="text-4xl font-black font-outfit text-[#2d1f2d]">Security Hub</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="p-12 bg-gray-50 rounded-[56px] border border-gray-100 space-y-8 shadow-sm">
                             <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#e91e8c] shadow-sm"><Key size={28}/></div>
                                <h3 className="text-2xl font-bold text-[#2d1f2d] font-outfit">Access Keys</h3>
                             </div>
                             <p className="text-gray-500 font-medium leading-relaxed">Secure your identity hub with encrypted access tokens. Rotating your key terminates all active sessions.</p>
                             <button className="w-full px-8 py-5 bg-[#2d1f2d] text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all active:scale-95">Rotate System Key</button>
                          </div>
                          
                          <div className="p-12 bg-[#2d1f2d] rounded-[56px] text-white space-y-8 shadow-2xl relative overflow-hidden">
                             <div className="relative z-10">
                                <div className="flex items-center gap-5 mb-8">
                                   <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#e91e8c]"><Shield size={28}/></div>
                                   <h3 className="text-2xl font-bold font-outfit">Identity Trust</h3>
                                </div>
                                <p className="text-white/40 text-sm leading-relaxed mb-10 font-medium">Verified history impacts your automated risk scores.</p>
                                <div className="px-6 py-3 bg-white/10 rounded-full inline-block text-[10px] font-black uppercase tracking-[0.3em]">
                                  {user?.kycStatus === 'Verified' ? 'Fully Verified' : 'Pending Verification'}
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return isAdmin ? renderAdminPortal() : renderCustomerPortal();
};

export default CustomerCenterPage;
