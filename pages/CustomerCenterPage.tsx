
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, ChevronRight, Clock, ShieldCheck, ArrowRight,
  User as UserIcon, Lock, Mail, AlertCircle, Loader2,
  Download, Banknote, Edit3, Search as SearchIcon, Eye,
  Car, Bike, X, Landmark, Terminal,
  MessageSquare, Inbox, Filter, Users, Trash2, Ban, Pause, Play, CheckSquare, Square,
  BarChart3, Activity, TrendingUp, AlertTriangle, ArrowUpDown, MoreHorizontal,
  FileText, Shield, Sparkles, Globe, Key, History, Fingerprint, Phone
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { PaymentRecord, AuditLog, User, ContactMessage, InquiryType, UserStatus } from '../types';

type Tab = 'policies' | 'payments' | 'statements' | 'security' | 'admin' | 'inquiries' | 'users';
type SortKey = 'name' | 'createdAt' | 'email' | 'status';

const CustomerCenterPage: React.FC = () => {
  const { 
    user, isLoading, logout, 
    getAuditLogs, getAllUsers, getInquiries, 
    updateUserStatus, deleteUser, bulkUpdateUsers
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>(user?.role === 'admin' ? 'users' : 'policies');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'All' | UserStatus>('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
  
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setAllUsers(getAllUsers());
    }
  }, [user, activeTab]);

  const stats = useMemo(() => {
    if (user?.role !== 'admin') return null;
    return {
      total: allUsers.length,
      active: allUsers.filter(u => u.status === 'Active').length,
      blocked: allUsers.filter(u => u.status === 'Blocked').length,
      suspended: allUsers.filter(u => u.status === 'Suspended').length,
      inquiries: getInquiries().filter(i => i.status === 'Unread').length
    };
  }, [allUsers, user]);

  const filteredUsers = useMemo(() => {
    let list = [...allUsers];
    const q = searchQuery.toLowerCase();
    
    if (q) {
      list = list.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
      );
    }
    
    if (userStatusFilter !== 'All') {
      list = list.filter(u => u.status === userStatusFilter);
    }

    list.sort((a, b) => {
      let aVal: any = a[sortConfig.key] || '';
      let bVal: any = b[sortConfig.key] || '';
      
      if (sortConfig.key === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return list;
  }, [allUsers, searchQuery, userStatusFilter, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleBulkAction = (action: 'Block' | 'Suspend' | 'Activate' | 'Delete') => {
    if (selectedUsers.length === 0) return;
    bulkUpdateUsers(selectedUsers, action);
    setSelectedUsers([]);
    setAllUsers(getAllUsers());
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const getClientPolicies = (userId: string) => {
    const allPolicies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    return allPolicies.filter((p: any) => p.userId === userId);
  };

  if (isLoading) return null;
  if (!user) return <Navigate to="/auth" />;

  const menuItems = [
    { id: 'policies', label: 'My Policies', icon: <ShieldCheck size={20} /> },
    { id: 'security', label: 'Privacy Control', icon: <Lock size={20} /> },
    ...(user.role === 'admin' ? [
      { id: 'users', label: 'Client Hub', icon: <Users size={20} /> },
      { id: 'inquiries', label: 'Messages', icon: <Inbox size={20} /> },
      { id: 'admin', label: 'Audit Records', icon: <Terminal size={20} /> }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-[#faf8fa] pb-24 font-inter">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#2d1f2d] via-[#2d1f2d]/90 to-transparent z-0" />

      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-gradient-to-br from-[#e91e8c] to-[#ff4da6] rounded-[32px] flex items-center justify-center text-white text-4xl font-black font-outfit shadow-2xl shadow-pink-900/40 uppercase">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <h1 className="text-4xl md:text-6xl font-bold font-outfit tracking-tighter text-white">
                    {user.role === 'admin' ? 'Command Center' : 'Account Console'}
                  </h1>
                  {user.role === 'admin' && (
                    <span className="bg-[#e91e8c] text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-white/20">Authorized Admin</span>
                  )}
                </div>
                <p className="text-white/50 text-xl font-medium mt-2">{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all">Sign Out</button>
          </div>

          {user.role === 'admin' && stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16 animate-in slide-in-from-top-6 duration-1000 delay-100">
              {[
                { label: 'System Clients', value: stats.total, icon: <Users />, color: 'text-blue-400' },
                { label: 'Active Coverage', value: stats.active, icon: <TrendingUp />, color: 'text-green-400' },
                { label: 'Suspensions', value: stats.suspended, icon: <Pause />, color: 'text-yellow-400' },
                { label: 'Locked Accounts', value: stats.blocked, icon: <Ban />, color: 'text-red-400' },
                { label: 'Unread Tasks', value: stats.inquiries, icon: <MessageSquare />, color: 'text-[#e91e8c]' }
              ].map((s, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] text-white">
                  <div className={`mb-4 ${s.color}`}>{React.cloneElement(s.icon as React.ReactElement<any>, { size: 24 })}</div>
                  <div className="text-4xl font-black font-outfit tracking-tighter">{s.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-2">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1 space-y-3">
              {menuItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id as Tab)} 
                  className={`w-full flex items-center gap-5 px-8 py-7 rounded-[32px] font-black text-sm transition-all text-left ${
                    activeTab === item.id ? 'bg-[#e91e8c] text-white shadow-xl' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                  }`}
                >
                   {item.icon} {item.label}
                </button>
              ))}
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white p-8 md:p-16 rounded-[64px] border border-gray-100 shadow-xl min-h-[800px] relative overflow-hidden transition-all">
                
                {activeTab === 'users' && user.role === 'admin' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-16">
                      <div className="flex items-center gap-5">
                         <div className="p-5 bg-pink-50 rounded-3xl text-[#e91e8c]"><Users size={32} /></div>
                         <h2 className="text-4xl font-bold text-[#2d1f2d] font-outfit tracking-tight">System Registry</h2>
                      </div>
                      <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                        <div className="relative flex-grow">
                           <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                           <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none" placeholder="Search identities..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 bg-gray-50/50 border-b border-gray-50">
                            <th className="py-8 px-8">Client Identification</th>
                            <th className="py-8 px-4">Integrity Status</th>
                            <th className="py-8 px-4">Enrollment</th>
                            <th className="py-8 px-8 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredUsers.map(u => (
                            <tr key={u.id} className="group hover:bg-[#e91e8c]/[0.02] transition-colors cursor-pointer" onClick={() => setViewingUser(u)}>
                              <td className="py-6 px-8">
                                 <div>
                                    <p className="text-base font-bold text-[#2d1f2d]">{u.name}</p>
                                    <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                                 </div>
                              </td>
                              <td className="py-6 px-4">
                                 <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                   u.status === 'Active' ? 'bg-green-50 text-green-600' : u.status === 'Blocked' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                                 }`}>
                                   <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                   {u.status}
                                 </div>
                              </td>
                              <td className="py-6 px-4 text-xs font-bold text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="py-6 px-8 text-right"><Eye size={20} className="text-gray-300 group-hover:text-[#e91e8c] ml-auto" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'admin' && user.role === 'admin' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-4xl font-bold text-[#2d1f2d] font-outfit mb-12">Audit Registry</h2>
                    <div className="space-y-4">
                      {getAuditLogs().map((log: AuditLog) => (
                        <div key={log.id} className="p-10 bg-gray-50 rounded-[48px] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 group hover:bg-white hover:shadow-2xl transition-all">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                               <span className="px-3 py-1 bg-white border border-gray-100 rounded-full font-black uppercase text-[9px] tracking-[0.2em] text-[#e91e8c]">{log.action}</span>
                               <span className="text-[10px] text-gray-300 font-black tracking-widest uppercase">Target: {log.targetUserId || 'N/A'}</span>
                            </div>
                            <p className="text-lg font-bold text-[#2d1f2d] mb-2">{log.details}</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Operator: <span className="text-[#e91e8c]">{log.userEmail}</span></p>
                          </div>
                          <div className="text-right border-l border-gray-100 pl-8 shrink-0">
                            <p className="text-3xl font-black text-[#2d1f2d] font-outfit tracking-tighter">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">{new Date(log.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'policies' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-4xl font-bold text-[#2d1f2d] font-outfit mb-12">My Active Protection</h2>
                    <div className="space-y-6">
                      {getClientPolicies(user.id).map((p: any) => (
                        <div key={p.id} className="p-10 bg-gray-50 rounded-[48px] border border-gray-100 flex justify-between items-center group hover:shadow-2xl transition-all">
                          <div className="flex gap-8 items-center">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#e91e8c] shadow-lg">
                              {p.type === 'MOTORCYCLE' ? <Bike size={40} /> : <Car size={40} />}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-[#2d1f2d] font-outfit">{p.type}</h3>
                              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mt-1">Ref: {p.id} • REG: {p.details.vrm}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="text-4xl font-black text-[#e91e8c] font-outfit">{p.premium}</div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Yearly Premium</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE CLIENT MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-[100] bg-[#2d1f2d]/95 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-5xl rounded-[64px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
              <button onClick={() => setViewingUser(null)} className="absolute top-10 right-10 p-5 bg-gray-50 rounded-[28px] hover:bg-red-50 text-gray-400 transition-all"><X size={24} /></button>
              
              <div className="p-12 md:p-20 max-h-[90vh] overflow-y-auto">
                 <div className="flex flex-col md:flex-row items-center gap-10 mb-16 pb-16 border-b border-gray-50">
                    <div className="w-32 h-32 bg-gray-50 rounded-[48px] flex items-center justify-center text-[#e91e8c] text-5xl font-black font-outfit shadow-inner">
                       {viewingUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <h2 className="text-6xl font-black font-outfit text-[#2d1f2d] tracking-tighter">{viewingUser.name}</h2>
                       <p className="text-xl text-gray-400 font-medium">{viewingUser.email}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-gray-50 rounded-[48px] p-10 space-y-8 border border-gray-100">
                       <div className="flex items-center gap-4 text-[#e91e8c]">
                          <History size={24} />
                          <h3 className="text-xl font-bold font-outfit text-[#2d1f2d]">Login Activity</h3>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Timestamp</p>
                             <p className="text-sm font-bold text-[#2d1f2d]">{viewingUser.lastLogin ? new Date(viewingUser.lastLogin).toLocaleString() : 'No activity logged'}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Access Origin IP</p>
                             <p className="text-sm font-bold text-[#2d1f2d]">{viewingUser.lastIp || 'No data'}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Enrollment Date</p>
                             <p className="text-sm font-bold text-[#2d1f2d]">{new Date(viewingUser.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account ID</p>
                             <p className="text-sm font-bold text-[#e91e8c]">{viewingUser.id}</p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-[#2d1f2d] rounded-[48px] p-10 text-white space-y-6">
                       <h3 className="text-xl font-bold font-outfit mb-4">Command Overrides</h3>
                       <div className="grid grid-cols-1 gap-4">
                          {viewingUser.status !== 'Active' ? (
                            <button onClick={() => { updateUserStatus(viewingUser.id, 'Active'); setViewingUser({...viewingUser, status: 'Active'}); setAllUsers(getAllUsers()); }} className="w-full py-5 bg-white text-[#2d1f2d] rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
                               <Play size={16}/> Re-Authorize Account
                            </button>
                          ) : (
                            <button onClick={() => { updateUserStatus(viewingUser.id, 'Suspended'); setViewingUser({...viewingUser, status: 'Suspended'}); setAllUsers(getAllUsers()); }} className="w-full py-5 bg-yellow-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
                               <Pause size={16}/> Freeze Coverage
                            </button>
                          )}
                          <button onClick={() => { updateUserStatus(viewingUser.id, 'Blocked'); setViewingUser({...viewingUser, status: 'Blocked'}); setAllUsers(getAllUsers()); }} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
                             <Ban size={16}/> Permanent Blacklist
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <h3 className="text-3xl font-black font-outfit text-[#2d1f2d]">Policy Asset Ledger</h3>
                    {getClientPolicies(viewingUser.id).length === 0 ? (
                      <div className="p-16 text-center border-4 border-dashed border-gray-50 rounded-[48px] text-gray-200">
                         <ShieldAlert size={48} className="mx-auto mb-4 opacity-20" />
                         <p className="font-bold uppercase tracking-widest text-xs">No coverage records found for this identity.</p>
                      </div>
                    ) : (
                      getClientPolicies(viewingUser.id).map((p: any) => (
                        <div key={p.id} className="p-8 bg-gray-50 rounded-[40px] flex items-center justify-between border border-gray-100 hover:bg-white transition-all group">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#e91e8c] shadow-md group-hover:scale-110 transition-transform">
                                {p.type === 'MOTORCYCLE' ? <Bike size={24}/> : <Car size={24}/>}
                              </div>
                              <div>
                                 <p className="text-xl font-bold text-[#2d1f2d]">{p.type} Protection</p>
                                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-0.5">Ref: {p.id} • REG: {p.details.vrm}</p>
                              </div>
                           </div>
                           <p className="text-3xl font-black font-outfit text-[#e91e8c]">{p.premium}</p>
                        </div>
                      ))
                    )}
                 </div>

                 <div className="mt-20 pt-16 border-t border-gray-50 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                       <h4 className="text-xl font-bold text-[#2d1f2d] mb-1">Purge Identification Record</h4>
                       <p className="text-sm text-gray-400">Irreversibly remove all traces of this client from the central database.</p>
                    </div>
                    <button onClick={() => setShowDeleteConfirm(viewingUser.id)} className="w-full md:w-auto px-12 py-5 bg-red-50 text-red-500 rounded-[28px] font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all">Destroy Data Record</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] bg-[#2d1f2d]/98 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[64px] p-16 text-center shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-10 border border-red-100"><AlertTriangle size={40} /></div>
              <h3 className="text-4xl font-black font-outfit text-[#2d1f2d] mb-6">Confirm Purge?</h3>
              <p className="text-gray-400 mb-12 text-lg font-medium">You are deleting a master record. This cannot be undone.</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowDeleteConfirm(null)} className="py-6 bg-gray-50 rounded-[28px] font-black uppercase text-xs text-gray-400 hover:bg-gray-100">Cancel</button>
                 <button onClick={() => { deleteUser(showDeleteConfirm); setShowDeleteConfirm(null); setViewingUser(null); setAllUsers(getAllUsers()); }} className="py-6 bg-red-500 rounded-[28px] font-black uppercase text-xs text-white hover:bg-red-600">Delete Permanently</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCenterPage;
