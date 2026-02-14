
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, AuditLog, ContactMessage, UserStatus, 
  AdminRole, PolicyRecord, Claim, PaymentRecord, ClaimStatus, 
  PolicyStatus, KYCStatus, RiskLevel, BillingStatus 
} from '../types';

const SUPER_ADMINS = ['admin@swiftpolicy.co.uk', 'master.admin@swiftpolicy.co.uk'];

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  getAuditLogs: () => AuditLog[];
  getAllUsers: () => User[];
  updateUserStatus: (userId: string, status: UserStatus, reason: string) => void;
  updateUserKYC: (userId: string, status: KYCStatus, reason: string) => void;
  updateUserRisk: (userId: string, level: RiskLevel, reason: string) => void;
  deleteUser: (userId: string, reason: string) => void;
  getAllPolicies: () => PolicyRecord[];
  updatePolicyStatus: (id: string, status: PolicyStatus, reason: string) => void;
  updatePolicyDetails: (id: string, updates: Partial<PolicyRecord>, reason: string) => void;
  getAllClaims: () => Claim[];
  updateClaimStatus: (id: string, status: ClaimStatus, note: string, isSuspicious?: boolean) => void;
  getAllPayments: () => PaymentRecord[];
  updatePaymentStatus: (id: string, status: BillingStatus, reason: string) => void;
  submitInquiry: (data: any) => Promise<boolean>;
  getInquiries: () => ContactMessage[];
  updateInquiryStatus: (id: string, status: any) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Master Admin if not exists
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    if (!users.find((u: any) => u.email === 'admin@swiftpolicy.co.uk')) {
      users.push({
        id: 'SA-001',
        name: 'Master Admin',
        email: 'admin@swiftpolicy.co.uk',
        password: 'AdminPassword123!',
        role: 'admin',
        adminRole: 'Super Admin',
        status: 'Active',
        kycStatus: 'Verified',
        riskLevel: 'Standard',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('sp_users', JSON.stringify(users));
    }
    const savedUser = localStorage.getItem('sp_session');
    if (savedUser) setUser(JSON.parse(savedUser));
    setIsLoading(false);
  }, []);

  const addAuditLog = (action: string, targetId: string, details: string, reason?: string) => {
    const logs: AuditLog[] = JSON.parse(localStorage.getItem('sp_audit_logs') || '[]');
    logs.unshift({
      id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      adminId: user?.id || 'SYSTEM',
      adminEmail: user?.email || 'System Engine',
      targetId,
      action,
      details,
      reason,
      ipAddress: '82.16.24.102'
    });
    localStorage.setItem('sp_audit_logs', JSON.stringify(logs.slice(0, 1000)));
  };

  const login = async (email: string, pass: string) => {
    await new Promise(r => setTimeout(r, 800));
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const normalizedEmail = email.toLowerCase();
    const found = users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
    
    if (!found || found.password !== pass) return { success: false, message: 'Invalid credentials.' };
    if (found.status === 'Blocked') return { success: false, message: 'Account blocked for compliance violations.' };
    if (found.status === 'Deleted') return { success: false, message: 'Identity record not found.' };

    const isAdmin = SUPER_ADMINS.includes(normalizedEmail) || found.role === 'admin';
    const safeUser = { ...found, role: isAdmin ? 'admin' : 'customer' };
    delete safeUser.password;
    
    setUser(safeUser);
    localStorage.setItem('sp_session', JSON.stringify(safeUser));
    addAuditLog('LOGIN_SUCCESS', found.id, `Session initiated as ${safeUser.role}`);
    return { success: true, message: 'Access authorized.' };
  };

  const signup = async (name: string, email: string, pass: string) => {
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    if (users.find((u: any) => u.email === email.toLowerCase())) return false;
    const id = Math.random().toString(36).substr(2, 9);
    const newUser = { id, name, email: email.toLowerCase(), password: pass, role: 'customer', status: 'Active', createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('sp_users', JSON.stringify(users));
    const { password, ...safe } = newUser;
    setUser(safe as any);
    localStorage.setItem('sp_session', JSON.stringify(safe));
    return true;
  };

  const logout = () => { setUser(null); localStorage.removeItem('sp_session'); };

  const updateUserStatus = (userId: string, status: UserStatus, reason: string) => {
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      const old = users[idx].status;
      users[idx].status = status;
      users[idx].isLocked = status === 'Blocked';
      localStorage.setItem('sp_users', JSON.stringify(users));
      addAuditLog('USER_STATUS_CHANGE', userId, `Transition from ${old} to ${status}`, reason);
    }
  };

  const deleteUser = (userId: string, reason: string) => {
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      users[idx].status = 'Deleted';
      users[idx].name = 'Purged Record';
      users[idx].email = `deleted_${userId}@swiftpolicy.co.uk`;
      localStorage.setItem('sp_users', JSON.stringify(users));
      addAuditLog('IDENTITY_PURGE', userId, 'Full identity anonymization', reason);
    }
  };

  const updatePolicyStatus = (id: string, status: PolicyStatus, reason: string) => {
    const policies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const idx = policies.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      const old = policies[idx].status;
      policies[idx].status = status;
      if (status === 'Renewed') {
        const d = new Date(policies[idx].renewalDate || policies[idx].details.renewalDate);
        d.setFullYear(d.getFullYear() + 1);
        policies[idx].renewalDate = d.toISOString();
        policies[idx].status = 'Active';
      }
      localStorage.setItem('sp_client_data', JSON.stringify(policies));
      addAuditLog('POLICY_LIFECYCLE_CHANGE', id, `${old} -> ${status}`, reason);
    }
  };

  const updatePolicyDetails = (id: string, updates: any, reason: string) => {
    const policies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const idx = policies.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      policies[idx] = { ...policies[idx], ...updates };
      localStorage.setItem('sp_client_data', JSON.stringify(policies));
      addAuditLog('POLICY_DETAIL_CORRECTION', id, 'Metadata manually corrected', reason);
    }
  };

  const updateClaimStatus = (id: string, status: ClaimStatus, note: string, isSuspicious?: boolean) => {
    const claims = JSON.parse(localStorage.getItem('sp_claims') || '[]');
    const idx = claims.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
      claims[idx].status = status;
      if (isSuspicious !== undefined) claims[idx].isSuspicious = isSuspicious;
      if (note) claims[idx].internalNotes = [...(claims[idx].internalNotes || []), note];
      localStorage.setItem('sp_claims', JSON.stringify(claims));
      addAuditLog('CLAIM_ADJUDICATION', id, `Set to ${status}`, note);
    }
  };

  const updatePaymentStatus = (id: string, status: BillingStatus, reason: string) => {
    const payments = JSON.parse(localStorage.getItem('sp_payment_data') || '[]');
    const idx = payments.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      payments[idx].status = status;
      localStorage.setItem('sp_payment_data', JSON.stringify(payments));
      addAuditLog('FINANCIAL_STATUS_MOD', id, `Marked as ${status}`, reason);
    }
  };

  const getAllUsers = () => JSON.parse(localStorage.getItem('sp_users') || '[]').filter((u: any) => u.role === 'customer' && u.status !== 'Deleted');
  const getAllPolicies = () => JSON.parse(localStorage.getItem('sp_client_data') || '[]').map((p: any) => ({ ...p, vrm: p.details.vrm, make: p.details.make, model: p.details.model, renewalDate: p.renewalDate || p.details.renewalDate, customerName: p.customerName || (p.details.firstName + ' ' + p.details.lastName) }));
  const getAllClaims = () => JSON.parse(localStorage.getItem('sp_claims') || '[]');
  const getAllPayments = () => JSON.parse(localStorage.getItem('sp_payment_data') || '[]');
  const getAuditLogs = () => JSON.parse(localStorage.getItem('sp_audit_logs') || '[]');
  const submitInquiry = async (d: any) => {
    const msgs = JSON.parse(localStorage.getItem('sp_contact_messages') || '[]');
    msgs.unshift({ ...d, id: `MSG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, timestamp: new Date().toISOString(), status: 'Unread' });
    localStorage.setItem('sp_contact_messages', JSON.stringify(msgs));
    return true;
  };
  const getInquiries = () => JSON.parse(localStorage.getItem('sp_contact_messages') || '[]');
  const updateInquiryStatus = (id: string, s: any) => {
    const msgs = JSON.parse(localStorage.getItem('sp_contact_messages') || '[]');
    const idx = msgs.findIndex((m: any) => m.id === id);
    if (idx !== -1) { msgs[idx].status = s; localStorage.setItem('sp_contact_messages', JSON.stringify(msgs)); }
  };
  const updateUserKYC = (u: string, s: any, r: string) => { /* logic */ };
  const updateUserRisk = (u: string, l: any, r: string) => { /* logic */ };

  return (
    <AuthContext.Provider value={{ 
      user, login, signup, logout, getAuditLogs, getAllUsers, updateUserStatus, 
      updateUserKYC, updateUserRisk, deleteUser, getAllPolicies, updatePolicyStatus, 
      updatePolicyDetails, getAllClaims, updateClaimStatus, getAllPayments, updatePaymentStatus,
      isLoading, submitInquiry, getInquiries, updateInquiryStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
