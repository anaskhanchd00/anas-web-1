
import React from 'react';

export enum InsuranceType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  VAN = 'van',
  LIFE = 'life'
}

export type InquiryType = 'General' | 'Quote' | 'Payment' | 'Claim' | 'Technical' | 'Feedback';
export type UserStatus = 'Active' | 'Frozen' | 'Blocked' | 'Deleted';
export type KYCStatus = 'Verified' | 'Pending' | 'Failed';
export type RiskLevel = 'Standard' | 'High Risk' | 'Suspicious';
export type AdminRole = 'Super Admin' | 'Admin' | 'Support Staff';
export type PolicyStatus = 'Active' | 'Frozen' | 'Cancelled' | 'Terminated' | 'Expired' | 'Renewed';
export type ClaimStatus = 'Received' | 'Under Review' | 'Approved' | 'Rejected' | 'Documents Requested';
export type BillingStatus = 'Paid in Full' | 'Payment Successful' | 'Pending' | 'Failed' | 'Disputed' | 'Refunded' | 'Overdue' | 'Chargeback Alert';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  type: InquiryType;
  message: string;
  status: 'Unread' | 'Read' | 'Replied';
  timestamp: string;
  consent: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  adminRole?: AdminRole;
  status: UserStatus;
  kycStatus?: KYCStatus;
  riskLevel?: RiskLevel;
  createdAt: string;
  lastLogin?: string;
  lastIp?: string;
  failedLoginAttempts?: number;
  isLocked?: boolean;
}

export interface Claim {
  id: string;
  policyId: string;
  userId: string;
  customerName: string;
  dateReported: string;
  incidentDate: string;
  type: string;
  description: string;
  status: ClaimStatus;
  isSuspicious: boolean;
  internalNotes: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminId: string; 
  adminEmail: string;
  targetId: string;
  action: string;
  details: string;
  reason?: string;
  ipAddress: string;
}

export interface PolicyRecord {
  id: string;
  userId: string;
  customerName: string;
  type: string;
  premium: string;
  status: PolicyStatus;
  vrm: string;
  make: string;
  model: string;
  renewalDate: string;
  details: any;
  internalNotes?: string[];
}

export interface PaymentRecord {
  id: string;
  policyId: string;
  userId: string;
  customerName: string;
  date: string;
  description: string;
  amount: string;
  type: 'Full Payment' | 'Monthly Installment' | 'Refund';
  status: BillingStatus;
  method: string;
  reference: string;
  policyDetails: {
    vrm: string;
    make: string;
    model: string;
    coverLevel: string;
    insurer: string;
    renewalDate: string;
  };
  // Added planDetails to support monthly installment schedules and fix type errors
  planDetails?: {
    totalPremium: string;
    installmentsRemaining: number;
    nextPaymentDate: string;
    apr: string;
    schedule: {
      date: string;
      amount: string;
      status: string;
    }[];
  };
}

export interface QuoteData {
  vrm: string;
  make: string;
  model: string;
  year: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  engineSize: string;
  seats: string;
  isImported: boolean;
  annualMileage: string;
  usageType: string;
  ownership: string;
  isModified: boolean;
  modifications: string;
  securityFeatures: string[];
  overnightParking: string;
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  ukResident: boolean;
  yearsInUk: string;
  occupation: string;
  employmentStatus: string;
  industry: string;
  licenceType: string;
  licenceHeldYears: string;
  licenceDate: string;
  hasMedicalConditions: boolean;
  mainDriverHistory: {
    hasConvictions: boolean;
    convictions: any[];
    hasClaims: boolean;
    claims: any[];
  };
  ncbYears: string;
  isCurrentlyInsured: boolean;
  hasPreviousCancellations: boolean;
  additionalDrivers: any[];
  postcode: string;
  addressLine1: string;
  city: string;
  yearsAtAddress: string;
  homeOwnership: string;
  coverLevel: string;
  policyStartDate: string;
  voluntaryExcess: string;
  addons: {
    breakdown: boolean;
    legal: boolean;
    courtesyCar: boolean;
    windscreen: boolean;
    protectedNcb: boolean;
  };
  paymentFrequency: 'monthly' | 'annually';
  payerType: 'individual' | 'company';
  email: string;
  phone: string;
  contactTime: string;
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
  isAccurate: boolean;
  termsAccepted: boolean;
}
