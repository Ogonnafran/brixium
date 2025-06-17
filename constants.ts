import { Currency, AppSettings, User, AdminUser, KYCStatus, TransactionStatus, TransactionType, KYCRequest, WithdrawalRequest, AppNotification, NotificationType, Transaction, NavItem, FeeWallet } from './types';
import { LayoutDashboard, Users, Repeat, Landmark, FileText, UserCircle, Settings as SettingsIcon, Bell, LogOut, ShieldCheck, CreditCard, Send, TrendingUp, AlertTriangle, MessageSquare, Download } from 'lucide-react';

export const APP_NAME = "Brixium Global Bank";
export const ADMIN_EMAIL = "brixiumglobalbank@gmail.com";
export const ADMIN_PASSWORD = "ogonna1@1"; // In a real app, this would be hashed and stored securely.

export const INITIAL_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    hashedPassword: 'password123',
    balance: 50000.75,
    currency: Currency.USD,
    isVerifiedKYC: true,
    transferPin: '1234',
    phone: '555-0101',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    brixiumAccountNumber: `BRIX-${'user-001'.substring(5)}`,
  },
  {
    id: 'user-002',
    name: 'Bob The Builder',
    email: 'bob@example.com',
    hashedPassword: 'password456',
    balance: 125000.00,
    currency: Currency.EUR,
    isVerifiedKYC: false,
    phone: '555-0102',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    brixiumAccountNumber: `BRIX-${'user-002'.substring(5)}`,
  },
  {
    id: 'user-003',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    hashedPassword: 'password789',
    balance: 7800.50,
    currency: Currency.NGN,
    isVerifiedKYC: true,
    transferPin: '5678',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    brixiumAccountNumber: `BRIX-${'user-003'.substring(5)}`,
  },
];

export const INITIAL_ADMINS: AdminUser[] = [
  { id: 'admin-001', email: ADMIN_EMAIL, hashedPassword: ADMIN_PASSWORD }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001',
    userId: 'user-001',
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.COMPLETED,
    amount: 50000.75,
    currency: Currency.USD,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    description: 'Initial account funding',
  },
  {
    id: 'txn-002',
    userId: 'user-001',
    type: TransactionType.TRANSFER,
    status: TransactionStatus.COMPLETED,
    amount: 200,
    currency: Currency.USD,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    description: 'Transfer to Bob The Builder',
    toUserId: 'user-002',
  },
  {
    id: 'txn-003',
    userId: 'user-002',
    type: TransactionType.WITHDRAWAL,
    status: TransactionStatus.PENDING,
    amount: 1000,
    currency: Currency.EUR,
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    description: 'Withdrawal to external account',
    toAddress: '0x1234...abcd',
  },
];

export const INITIAL_KYC_REQUESTS: KYCRequest[] = [
  {
    id: 'kyc-001',
    userId: 'user-001',
    documentUrls: ['/mock-doc-alice-1.pdf', '/mock-doc-alice-2.jpg'],
    status: KYCStatus.APPROVED,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    reviewerId: 'admin-001',
  },
  {
    id: 'kyc-002',
    userId: 'user-002',
    documentUrls: ['/mock-doc-bob-1.pdf'],
    status: KYCStatus.PENDING,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

export const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: 'wd-001',
    userId: 'user-002',
    amount: 1000,
    currency: Currency.EUR,
    walletAddress: '0x1234BobWalletAddress5678',
    status: TransactionStatus.PENDING,
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    userId: 'user-001',
    adminOnly: false,
    type: NotificationType.KYC_APPROVED,
    message: 'Your KYC verification has been approved!',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
  },
  {
    id: 'notif-002',
    adminOnly: true,
    type: NotificationType.NEW_KYC_SUBMISSION,
    message: 'New KYC submission from Bob The Builder (bob@example.com).',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    linkTo: '/admin/kyc' // Updated link
  },
  {
    id: 'notif-003',
    adminOnly: true,
    type: NotificationType.NEW_WITHDRAWAL_REQUEST,
    message: 'New withdrawal request from Bob The Builder (bob@example.com) for 1000 EUR.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    linkTo: '/admin/withdrawals'
  },
];

const initialFeeWallets: FeeWallet[] = [
    { id: 'fee-wallet-001', name: 'Tether on Tron', network_protocol: 'TRC20', symbol: 'USDT', address: 'TEXAMPLEFeeWalletAddressUSDTTRC20ForBrixium' },
    { id: 'fee-wallet-002', name: 'Tron', network_protocol: 'TRC20', symbol: 'TRX', address: 'TEXAMPLEFeeWalletAddressTRXForBrixiumBANK' },
    { id: 'fee-wallet-003', name: 'Bitcoin', network_protocol: 'Bitcoin', symbol: 'BTC', address: 'bc1qexamplefeewalletaddressbtcforbrixium' },
    { id: 'fee-wallet-004', name: 'Ethereum', network_protocol: 'ERC20', symbol: 'ETH', address: '0xEXAMPLEFeeWalletAddressETHForBrixiumGlobal' },
];

export const INITIAL_SETTINGS: AppSettings = {
  supportedCurrencies: [
    Currency.USD, Currency.EUR, Currency.GBP, Currency.NGN, 
    Currency.CAD, Currency.AUD, Currency.JPY, Currency.CNY, 
    Currency.INR, Currency.BRL, Currency.ZAR
  ],
  defaultNetworkFee: 5, // Example: 5 USD fixed fee (or equivalent)
  networkFeeType: 'fixed',
  withdrawalFeeWallets: initialFeeWallets,
  maintenanceMode: false,
  defaultUserCurrency: Currency.USD, // Default for new users is USD
};

export const USER_NAV_ITEMS: NavItem[] = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/transfers', label: 'Transfers', icon: Send },
  { path: '/app/receive', label: 'Receive Money', icon: Download }, // Added
  { path: '/app/exchange', label: 'Exchange', icon: Repeat },
  { path: '/app/withdrawals', label: 'Withdrawals', icon: Landmark },
  { path: '/app/kyc', label: 'KYC', icon: FileText },
  { path: '/app/profile', label: 'Profile', icon: UserCircle },
  { path: '/app/settings', label: 'Settings', icon: SettingsIcon },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/transactions', label: 'Transactions', icon: CreditCard },
  { path: '/admin/kyc', label: 'KYC Requests', icon: ShieldCheck },
  { path: '/admin/withdrawals', label: 'Withdrawals', icon: TrendingUp },
  { path: '/admin/settings', label: 'System Settings', icon: SettingsIcon },
  { path: '/admin/notifications', label: 'Admin Alerts', icon: AlertTriangle},
];

export const MOCK_EXCHANGE_RATES: Record<Currency, Partial<Record<Currency, number>>> = {
  [Currency.USD]: {
    [Currency.USD]: 1, [Currency.EUR]: 0.93, [Currency.GBP]: 0.80, [Currency.NGN]: 1500,
    [Currency.CAD]: 1.37, [Currency.AUD]: 1.52, [Currency.JPY]: 157, [Currency.CNY]: 7.25,
    [Currency.INR]: 83.5, [Currency.BRL]: 5.15, [Currency.ZAR]: 18.7
  },
  [Currency.EUR]: {
    [Currency.USD]: 1.08, [Currency.EUR]: 1, [Currency.GBP]: 0.86, [Currency.NGN]: 1610,
    [Currency.CAD]: 1.47, [Currency.AUD]: 1.63, [Currency.JPY]: 169, [Currency.CNY]: 7.80,
    [Currency.INR]: 90, [Currency.BRL]: 5.55, [Currency.ZAR]: 20.1
  },
  [Currency.GBP]: {
    [Currency.USD]: 1.25, [Currency.EUR]: 1.16, [Currency.GBP]: 1, [Currency.NGN]: 1875,
    [Currency.CAD]: 1.71, [Currency.AUD]: 1.90, [Currency.JPY]: 196, [Currency.CNY]: 9.05,
    [Currency.INR]: 104.5, [Currency.BRL]: 6.45, [Currency.ZAR]: 23.4
  },
  [Currency.NGN]: {
    [Currency.USD]: 0.00067, [Currency.EUR]: 0.00062, [Currency.GBP]: 0.00053, [Currency.NGN]: 1,
    [Currency.CAD]: 0.00091, [Currency.AUD]: 0.00101, [Currency.JPY]: 0.105, [Currency.CNY]: 0.0048,
    [Currency.INR]: 0.055, [Currency.BRL]: 0.0034, [Currency.ZAR]: 0.0125
  },
  [Currency.CAD]: {
    [Currency.USD]: 0.73, [Currency.EUR]: 0.68, [Currency.GBP]: 0.58, [Currency.NGN]: 1095,
    [Currency.CAD]: 1, [Currency.AUD]: 1.11, [Currency.JPY]: 114.5, [Currency.CNY]: 5.30,
    [Currency.INR]: 61, [Currency.BRL]: 3.76, [Currency.ZAR]: 13.65
  },
  [Currency.AUD]: {
    [Currency.USD]: 0.66, [Currency.EUR]: 0.61, [Currency.GBP]: 0.53, [Currency.NGN]: 988,
    [Currency.CAD]: 0.90, [Currency.AUD]: 1, [Currency.JPY]: 103, [Currency.CNY]: 4.77,
    [Currency.INR]: 55, [Currency.BRL]: 3.39, [Currency.ZAR]: 12.3
  },
  [Currency.JPY]: {
    [Currency.USD]: 0.0064, [Currency.EUR]: 0.0059, [Currency.GBP]: 0.0051, [Currency.NGN]: 9.55,
    [Currency.CAD]: 0.0087, [Currency.AUD]: 0.0097, [Currency.JPY]: 1, [Currency.CNY]: 0.046,
    [Currency.INR]: 0.53, [Currency.BRL]: 0.033, [Currency.ZAR]: 0.12
  },
  [Currency.CNY]: {
    [Currency.USD]: 0.138, [Currency.EUR]: 0.128, [Currency.GBP]: 0.110, [Currency.NGN]: 207,
    [Currency.CAD]: 0.189, [Currency.AUD]: 0.210, [Currency.JPY]: 21.6, [Currency.CNY]: 1,
    [Currency.INR]: 11.5, [Currency.BRL]: 0.71, [Currency.ZAR]: 2.58
  },
  [Currency.INR]: {
    [Currency.USD]: 0.0120, [Currency.EUR]: 0.0111, [Currency.GBP]: 0.0096, [Currency.NGN]: 18,
    [Currency.CAD]: 0.0164, [Currency.AUD]: 0.0182, [Currency.JPY]: 1.88, [Currency.CNY]: 0.087,
    [Currency.INR]: 1, [Currency.BRL]: 0.062, [Currency.ZAR]: 0.224
  },
  [Currency.BRL]: {
    [Currency.USD]: 0.194, [Currency.EUR]: 0.180, [Currency.GBP]: 0.155, [Currency.NGN]: 291,
    [Currency.CAD]: 0.266, [Currency.AUD]: 0.295, [Currency.JPY]: 30.4, [Currency.CNY]: 1.41,
    [Currency.INR]: 16.2, [Currency.BRL]: 1, [Currency.ZAR]: 3.63
  },
  [Currency.ZAR]: {
    [Currency.USD]: 0.0535, [Currency.EUR]: 0.0497, [Currency.GBP]: 0.0428, [Currency.NGN]: 80,
    [Currency.CAD]: 0.0733, [Currency.AUD]: 0.0813, [Currency.JPY]: 8.37, [Currency.CNY]: 0.388,
    [Currency.INR]: 4.46, [Currency.BRL]: 0.275, [Currency.ZAR]: 1
  }
};
// Ensure all currencies have their own entry for completeness, even if 1:1 with themselves
Object.values(Currency).forEach(curr => {
  if (!MOCK_EXCHANGE_RATES[curr]) {
    MOCK_EXCHANGE_RATES[curr] = { [curr]: 1 };
  } else if (!MOCK_EXCHANGE_RATES[curr]![curr]) {
    MOCK_EXCHANGE_RATES[curr]![curr] = 1;
  }
});