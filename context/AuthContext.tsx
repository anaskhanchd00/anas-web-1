
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuditLog, DownloadRecord, ContactMessage, InquiryType, UserStatus } from '../types';

// Strict definition of authorized administrators
const AUTHORIZED_ADMINS = [
  'master.admin@swiftpolicy.co.uk',
  'security.lead@swiftpolicy.co.uk'
];

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPasswordWithToken: (token: string, newPass: string) => Promise<boolean>;
  updateProfile: (name: string, email: string, phone: string) => Promise<boolean>;
  updatePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  logDownload: (policyId: string, fileName: string) => void;
  submitInquiry: (data: Omit<ContactMessage, 'id' | 'timestamp' | 'status'>) => Promise<boolean>;
  updateInquiryStatus: (id: string, status: ContactMessage['status']) => void;
  getInquiries: () => ContactMessage[];
  getAuditLogs: () => AuditLog[];
  getDownloadHistory: () => DownloadRecord[];
  getAllUsers: () => User[];
  updateUserStatus: (userId: string, status: UserStatus) => void;
  deleteUser: (userId: string) => void;
  bulkUpdateUsers: (userIds: string[], action: 'Block' | 'Suspend' | 'Activate' | 'Delete') => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('sp_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const addAuditLog = (action: string, details: string, targetUserId?: string) => {
    const logs: AuditLog[] = JSON.parse(localStorage.getItem('sp_audit_logs') || '[]');
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: user?.id || 'SYSTEM',
      userEmail: user?.email || 'System Account',
      targetUserId,
      action,
      details,
      ipAddress: '82.16.24.102' // Simulated IP for local demonstration
    };
    logs.unshift(newLog);
    localStorage.setItem('sp_audit_logs', JSON.stringify(logs.slice(0, 100)));
  };

  const simulateNotification = (email: string, status: UserStatus) => {
    console.log(`%c[OUTGOING SMTP] Target: ${email}`, "color: #e91e8c; font-weight: bold;");
    console.log(`%c[OUTGOING SMTP] Subject: Important Update Regarding Your SwiftPolicy Account`, "color: #e91e8c;");
    console.log(`%c[OUTGOING SMTP] Body: Hello, your account status has been changed to ${status.toUpperCase()}.`, "color: #e91e8c;");
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      const targetUser = users[idx];
      const oldStatus = targetUser.status || 'Active';
      targetUser.status = status;
      targetUser.isLocked = status === 'Blocked';
      localStorage.setItem('sp_users', JSON.stringify(users));
      
      // Explicit Audit Logging with Admin ID and Target Client ID
      addAuditLog('ADMIN_OVERRIDE', `Status modification for ${targetUser.email} (Ref: ${targetUser.id}): ${oldStatus} -> ${status}`, userId);
      
      simulateNotification(targetUser.email, status);
      
      if (user?.id === userId && status !== 'Active') {
        logout();
      }
    }
  };

  const deleteUser = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const targetUser = users.find((u: any) => u.id === userId);
    if (!targetUser) return;

    const filtered = users.filter((u: any) => u.id !== userId);
    localStorage.setItem('sp_users', JSON.stringify(filtered));
    
    // Explicit Audit Logging for Account Purge
    addAuditLog('ADMIN_PURGE', `Permanent deletion of account record: ${targetUser.email} (Ref: ${targetUser.id})`, userId);

    const policies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    localStorage.setItem('sp_client_data', JSON.stringify(policies.filter((p: any) => p.userId !== userId)));
  };

  const bulkUpdateUsers = (userIds: string[], action: 'Block' | 'Suspend' | 'Activate' | 'Delete') => {
    userIds.forEach(id => {
      if (action === 'Delete') deleteUser(id);
      else updateUserStatus(id, action === 'Activate' ? 'Active' : action as UserStatus);
    });
    addAuditLog('ADMIN_BULK_ACTION', `Applied global ${action} command to ${userIds.length} target records`);
  };

  const login = async (email: string, pass: string) => {
    await new Promise(r => setTimeout(r, 1000));
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const normalizedEmail = email.toLowerCase();
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === normalizedEmail);
    
    if (userIndex === -1) {
      addAuditLog('AUTH_FAILURE', `Invalid identity login attempted: ${normalizedEmail}`);
      return { success: false, message: 'Invalid credentials.' };
    }
    
    const found = users[userIndex];

    if (found.status === 'Blocked' || found.isLocked) {
      addAuditLog('AUTH_BLOCKED', `Access denied for blacklisted entrant: ${normalizedEmail}`);
      return { success: false, message: 'This account has been administratively blocked.' };
    }

    if (found.password === pass) {
      const isAdmin = AUTHORIZED_ADMINS.includes(normalizedEmail);
      const now = new Date().toISOString();
      const loginIp = '82.16.24.102'; // Simulated

      // Update vehicle database with login metadata
      users[userIndex].lastLogin = now;
      users[userIndex].lastIp = loginIp;
      localStorage.setItem('sp_users', JSON.stringify(users));
      
      const sessionUser: User = { 
        id: found.id, 
        name: found.name, 
        email: found.email, 
        phone: found.phone,
        role: isAdmin ? 'admin' : 'customer',
        status: found.status || 'Active',
        createdAt: found.createdAt || now,
        lastLogin: now,
        lastIp: loginIp
      };
      
      setUser(sessionUser);
      localStorage.setItem('sp_session', JSON.stringify(sessionUser));
      addAuditLog('AUTH_SUCCESS', `Session initiated for ${normalizedEmail} (Role: ${sessionUser.role.toUpperCase()})`);
      return { success: true, message: 'Access granted.' };
    } else {
      addAuditLog('AUTH_FAILURE', `Incorrect access key submitted for: ${normalizedEmail}`);
      return { success: false, message: 'Invalid credentials.' };
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    await new Promise(r => setTimeout(r, 1000));
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const normalizedEmail = email.toLowerCase();
    if (users.find((u: any) => u.email.toLowerCase() === normalizedEmail)) return false;

    const newUser: User = { 
      id: Math.random().toString(36).substr(2, 9), 
      name, 
      email: normalizedEmail, 
      role: 'customer',
      status: 'Active',
      createdAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      isLocked: false
    };
    users.push({ ...newUser, password: pass });
    localStorage.setItem('sp_users', JSON.stringify(users));

    setUser(newUser);
    localStorage.setItem('sp_session', JSON.stringify(newUser));
    addAuditLog('REGISTRATION_SUCCESS', `New system enrollment: ${normalizedEmail}`);
    return true;
  };

  const logout = () => {
    addAuditLog('AUTH_LOGOUT', `Manual session termination`);
    setUser(null);
    localStorage.removeItem('sp_session');
  };

  // Remaining helper functions
  const requestPasswordReset = async (email: string) => { /* ... */ return true; };
  const resetPasswordWithToken = async (token: string, newPass: string) => { /* ... */ return true; };
  const updateProfile = async (name: string, email: string, phone: string) => { /* ... */ return true; };
  const updatePassword = async (oldPass: string, newPass: string) => { /* ... */ return {success: true, message: ''}; };
  const logDownload = (policyId: string, fileName: string) => { /* ... */ };
  const submitInquiry = async (data: any) => { /* ... */ return true; };
  const updateInquiryStatus = (id: string, status: any) => { /* ... */ };
  const getInquiries = () => JSON.parse(localStorage.getItem('sp_contact_messages') || '[]');
  const getAuditLogs = () => JSON.parse(localStorage.getItem('sp_audit_logs') || '[]');
  const getDownloadHistory = () => JSON.parse(localStorage.getItem('sp_download_history') || '[]');
  const getAllUsers = () => {
    const raw = JSON.parse(localStorage.getItem('sp_users') || '[]');
    return raw.map((u: any) => {
      const { password, ...safeUser } = u;
      return safeUser as User;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, signup, logout, requestPasswordReset, resetPasswordWithToken, 
      updateProfile, updatePassword, logDownload, getAuditLogs, 
      getDownloadHistory, getAllUsers, submitInquiry, getInquiries, updateInquiryStatus,
      updateUserStatus, deleteUser, bulkUpdateUsers, isLoading 
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
