
import React from 'react';

export enum InsuranceType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  VAN = 'van',
  LIFE = 'life'
}

export type InquiryType = 'General' | 'Quote' | 'Payment' | 'Claim' | 'Technical' | 'Feedback';
export type UserStatus = 'Active' | 'Blocked' | 'Suspended';

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
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  lastIp?: string;
  failedLoginAttempts?: number;
  isLocked?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string; // The person who performed the action
  userEmail: string;
  targetUserId?: string; // The person the action was performed on
  action: string;
  details: string;
  ipAddress: string;
}

export interface DownloadRecord {
  id: string;
  timestamp: string;
  userId: string;
  policyId: string;
  fileName: string;
}

export interface PaymentRecord {
  id: string;
  policyId: string;
  userId: string;
  date: string;
  description: string;
  amount: string;
  type: 'Full Payment' | 'Monthly Installment';
  status: 'Paid in Full' | 'Payment Successful' | 'Pending' | 'Direct Republic Set Up';
  method: string;
  reference: string;
  bankTransactionId?: string;
  planDetails?: {
    totalPremium: string;
    installmentsRemaining: number;
    nextPaymentDate: string;
    apr: string;
    schedule: Array<{ date: string; amount: string; status: string }>;
  };
  policyDetails: {
    vrm: string;
    make: string;
    model: string;
    coverLevel: string;
    insurer: string;
    renewalDate: string;
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
