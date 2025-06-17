import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  hashedPassword?: string; // Only for internal mock, not sent to client
  balance: number;
  currency: Currency;
  isVerifiedKYC: boolean;
  transferPin?: string; // Optional
  phone?: string;
  createdAt: string;
  brixiumAccountNumber: string; // Added for receiving money
}

export interface AdminUser {
  id: string;
  email: string;
  hashedPassword?: string; // Only for internal mock
}

export enum TransactionType {
  TRANSFER = 'Transfer',
  WITHDRAWAL = 'Withdrawal',
  DEPOSIT = 'Deposit', // For admin funding or receiving money
  FEE = 'Fee',
  EXCHANGE = 'Exchange'
}

export enum TransactionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected',
  FEE_PENDING = 'Fee Pending'
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  date: string;
  description: string;
  fromUserId?: string; // For transfers
  toUserId?: string;   // For transfers
  toAddress?: string; // For withdrawals
  networkFee?: number;
  relatedTransactionId?: string; // To link fee payment to transfer
}

export enum KYCStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  NOT_SUBMITTED = 'Not Submitted'
}

export interface KYCRequest {
  id: string;
  userId: string;
  documentUrls: string[]; // Mock URLs
  status: KYCStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string; // Admin ID
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  currency: Currency;
  walletAddress: string;
  status: TransactionStatus; // PENDING, APPROVED, REJECTED
  requestedAt: string;
  processedAt?: string;
  adminId?: string; // Admin who processed
}

export enum NotificationType {
  INFO = 'Info',
  SUCCESS = 'Success',
  ERROR = 'Error',
  KYC_APPROVED = 'KYC Approved',
  KYC_REJECTED = 'KYC Rejected',
  WITHDRAWAL_APPROVED = 'Withdrawal Approved',
  WITHDRAWAL_REJECTED = 'Withdrawal Rejected',
  NEW_KYC_SUBMISSION = 'New KYC Submission',
  NEW_WITHDRAWAL_REQUEST = 'New Withdrawal Request',
  ADMIN_MESSAGE = 'Admin Message',
  TRANSFER_SENT = 'Transfer Sent',
  TRANSFER_RECEIVED = 'Transfer Received',
  BALANCE_DEDUCTED = 'Balance Deducted',
  BALANCE_FUNDED = 'Balance Funded',
  ACCOUNT_CURRENCY_CHANGED = 'Account Currency Changed',
}

export interface AppNotification {
  id: string;
  userId?: string; // Target user, undefined for admin-wide notifications
  adminOnly: boolean; // True if only for admins
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  linkTo?: string; // Optional link for navigation
}

export enum Currency {
  USD = 'USD', // United States Dollar
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound
  NGN = 'NGN', // Nigerian Naira
  CAD = 'CAD', // Canadian Dollar
  AUD = 'AUD', // Australian Dollar
  JPY = 'JPY', // Japanese Yen
  CNY = 'CNY', // Chinese Yuan Renminbi
  INR = 'INR', // Indian Rupee
  BRL = 'BRL', // Brazilian Real
  ZAR = 'ZAR', // South African Rand
}

export interface FeeWallet {
  id: string;
  name: string; // e.g., "Bitcoin Fees", "Tether TRC20 Fees"
  network_protocol: string; // e.g., "Bitcoin", "TRC20", "ERC20"
  symbol: string; // e.g., "BTC", "USDT", "ETH"
  address: string;
}

export interface AppSettings {
  supportedCurrencies: Currency[];
  defaultNetworkFee: number; // Can be percentage or fixed, for simplicity fixed
  networkFeeType: 'fixed' | 'percentage';
  withdrawalFeeWallets: FeeWallet[]; // Changed from withdrawalWalletAddress: string
  maintenanceMode: boolean;
  defaultUserCurrency: Currency;
}

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}