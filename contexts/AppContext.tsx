import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AdminUser, Transaction, KYCRequest, WithdrawalRequest, AppNotification, AppSettings, Currency, TransactionStatus, KYCStatus, NotificationType, TransactionType } from '../types';
import { INITIAL_USERS, INITIAL_ADMINS, INITIAL_TRANSACTIONS, INITIAL_KYC_REQUESTS, INITIAL_WITHDRAWAL_REQUESTS, INITIAL_NOTIFICATIONS, INITIAL_SETTINGS, ADMIN_EMAIL, ADMIN_PASSWORD, MOCK_EXCHANGE_RATES } from '../constants';

export interface AppContextType {
  // Auth
  currentUser: User | AdminUser | null;
  isAdmin: boolean;
  login: (email: string, pass: string, isAdminLogin: boolean) => Promise<boolean>;
  signup: (name: string, email: string, pass: string, currency: Currency) => Promise<boolean>;
  logout: () => void;

  // Data - Users
  users: User[];
  findUserById: (id: string) => User | undefined;
  findUserByEmail: (email: string) => User | undefined;
  updateUser: (updatedUser: User) => void;
  fundUserWallet: (userId: string, amount: number, currency: Currency) => boolean;
  deductUserBalance: (userId: string, amount: number, currency: Currency) => boolean;

  // Data - Transactions
  transactions: Transaction[];
  getUserTransactions: (userId: string) => Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Transaction;

  // Data - KYC
  kycRequests: KYCRequest[];
  getUserKYCRequest: (userId: string) => KYCRequest | undefined;
  submitKYC: (userId: string, documentUrls: string[]) => KYCRequest;
  updateKYCStatus: (requestId: string, status: KYCStatus, adminId: string) => boolean;
  
  // Data - Withdrawals
  withdrawalRequests: WithdrawalRequest[];
  getUserWithdrawalRequests: (userId: string) => WithdrawalRequest[];
  requestWithdrawal: (userId: string, amount: number, currency: Currency, walletAddress: string) => WithdrawalRequest;
  updateWithdrawalStatus: (requestId: string, status: TransactionStatus, adminId: string) => boolean;

  // Data - Exchange
  getExchangeRate: (from: Currency, to: Currency) => number;
  performExchange: (userId: string, fromCurrency: Currency, toCurrency: Currency, fromAmount: number) => Promise<boolean>;
  changeAccountCurrency: (userId: string, newCurrency: Currency) => Promise<boolean>;


  // Notifications
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getUserNotifications: (userId: string) => AppNotification[];
  getAdminNotifications: () => AppNotification[];
  
  // Settings
  appSettings: AppSettings;
  updateAppSettings: (newSettings: Partial<AppSettings>) => void;

  // General
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | AdminUser | null>(() => {
    const storedUser = localStorage.getItem('brixiumUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
     const storedIsAdmin = localStorage.getItem('brixiumIsAdmin');
     return storedIsAdmin ? JSON.parse(storedIsAdmin) : false;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('brixiumUsers');
    return storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
  });
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const storedTx = localStorage.getItem('brixiumTransactions');
    return storedTx ? JSON.parse(storedTx) : INITIAL_TRANSACTIONS;
  });
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>(() => {
    const storedKyc = localStorage.getItem('brixiumKycRequests');
    return storedKyc ? JSON.parse(storedKyc) : INITIAL_KYC_REQUESTS;
  });
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const storedWithdrawals = localStorage.getItem('brixiumWithdrawalRequests');
    return storedWithdrawals ? JSON.parse(storedWithdrawals) : INITIAL_WITHDRAWAL_REQUESTS;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const storedNotifs = localStorage.getItem('brixiumNotifications');
    return storedNotifs ? JSON.parse(storedNotifs) : INITIAL_NOTIFICATIONS;
  });
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const storedSettings = localStorage.getItem('brixiumAppSettings');
    return storedSettings ? JSON.parse(storedSettings) : INITIAL_SETTINGS;
  });

  const [isLoading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info', id: number} | null>(null);


  useEffect(() => { localStorage.setItem('brixiumUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('brixiumIsAdmin', JSON.stringify(isAdmin)); }, [isAdmin]);
  useEffect(() => { localStorage.setItem('brixiumUsers', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('brixiumTransactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('brixiumKycRequests', JSON.stringify(kycRequests)); }, [kycRequests]);
  useEffect(() => { localStorage.setItem('brixiumWithdrawalRequests', JSON.stringify(withdrawalRequests)); }, [withdrawalRequests]);
  useEffect(() => { localStorage.setItem('brixiumNotifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('brixiumAppSettings', JSON.stringify(appSettings)); }, [appSettings]);
  

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const addNotification = useCallback((notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  }, []);

  const getUserNotifications = useCallback((userId: string) => {
    return notifications.filter(n => n.userId === userId && !n.adminOnly).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications]);

  const getAdminNotifications = useCallback(() => {
    return notifications.filter(n => n.adminOnly).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications]);

  const login = useCallback(async (email: string, pass: string, isAdminLogin: boolean): Promise<boolean> => {
    setLoading(true);
    await delay(500);
    if (isAdminLogin) {
      const admin = admins.find(a => a.email === email && a.hashedPassword === pass);
      if (admin) {
        setCurrentUser(admin);
        setIsAdmin(true);
        setLoading(false);
        showToast('Admin login successful!', 'success');
        return true;
      }
    } else {
      const user = users.find(u => u.email === email && u.hashedPassword === pass);
      if (user) {
        setCurrentUser(user);
        setIsAdmin(false);
        setLoading(false);
        showToast(`Welcome back, ${user.name}!`, 'success');
        return true;
      }
    }
    setLoading(false);
    showToast('Invalid credentials.', 'error');
    return false;
  }, [admins, users, showToast]);

  const signup = useCallback(async (name: string, email: string, pass: string, currency: Currency): Promise<boolean> => {
    setLoading(true);
    await delay(500);
    if (users.find(u => u.email === email)) {
      setLoading(false);
      showToast('Email already exists.', 'error');
      return false;
    }
    const userId = `user-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name,
      email,
      hashedPassword: pass,
      balance: 0,
      currency: currency || appSettings.defaultUserCurrency, // Use provided or default
      isVerifiedKYC: false,
      createdAt: new Date().toISOString(),
      brixiumAccountNumber: `BRIX-${userId.substring(5)}`, // Generate account number
    };
    setUsers(prev => [...prev, newUser]);
    setLoading(false);
    showToast('Signup successful! Please log in.', 'success');
    return true;
  }, [users, showToast, appSettings.defaultUserCurrency]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('brixiumUser');
    localStorage.removeItem('brixiumIsAdmin');
    showToast('Logged out successfully.', 'info');
  }, [showToast]);

  const findUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);
  const findUserByEmail = useCallback((email: string) => users.find(u => u.email === email), [users]);
  
  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id && !isAdmin) {
      setCurrentUser(updatedUser);
    }
  }, [currentUser, isAdmin]);

  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'date'>): Transaction => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `txn-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, []);
  
  const getUserTransactions = useCallback((userId: string) => {
    return transactions.filter(t => t.userId === userId || t.toUserId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const fundUserWallet = useCallback((userId: string, amount: number, currency: Currency): boolean => {
    const user = findUserById(userId);
    if (!user || amount <= 0) return false;
    if (user.currency !== currency) {
        showToast(`Cannot fund in ${currency}. User's currency is ${user.currency}. Exchange first.`, 'error');
        return false;
    }
    const updatedUser = { ...user, balance: user.balance + amount };
    updateUser(updatedUser);
    addTransaction({
        userId, type: TransactionType.DEPOSIT, status: TransactionStatus.COMPLETED,
        amount, currency, description: `Account funded by admin.`,
    });
    addNotification({userId, adminOnly:false, type: NotificationType.BALANCE_FUNDED, message: `Your account has been funded with ${amount} ${currency}.`});
    showToast(`Funded ${user.name}'s wallet with ${amount} ${currency}.`, 'success');
    return true;
  }, [findUserById, updateUser, addTransaction, addNotification, showToast]);

  const deductUserBalance = useCallback((userId: string, amount: number, currency: Currency): boolean => {
    const user = findUserById(userId);
    if (!user || amount <= 0) return false;
    if (user.currency !== currency) {
        showToast(`Cannot deduct in ${currency}. User's currency is ${user.currency}.`, 'error');
        return false;
    }
    if (user.balance < amount) {
        showToast(`Insufficient balance for ${user.name}.`, 'error');
        return false;
    }
    const updatedUser = { ...user, balance: user.balance - amount };
    updateUser(updatedUser);
    addTransaction({
        userId, type: TransactionType.WITHDRAWAL, status: TransactionStatus.COMPLETED,
        amount, currency, description: `Balance deducted by admin.`,
    });
    addNotification({userId, adminOnly: false, type: NotificationType.BALANCE_DEDUCTED, message: `An amount of ${amount} ${currency} has been deducted from your account by an admin.`});
    showToast(`Deducted ${amount} ${currency} from ${user.name}'s wallet.`, 'success');
    return true;
  }, [findUserById, updateUser, addTransaction, addNotification, showToast]);

  const getUserKYCRequest = useCallback((userId: string) => kycRequests.find(k => k.userId === userId), [kycRequests]);
  
  const submitKYC = useCallback((userId: string, documentUrls: string[]): KYCRequest => {
    const existingRequest = kycRequests.find(r => r.userId === userId);
    if (existingRequest && (existingRequest.status === KYCStatus.PENDING || existingRequest.status === KYCStatus.APPROVED)) {
      showToast('KYC request already pending or approved.', 'info');
      return existingRequest;
    }
    const newRequest: KYCRequest = {
      id: `kyc-${Date.now()}`, userId, documentUrls, status: KYCStatus.PENDING,
      submittedAt: new Date().toISOString(),
    };
    setKycRequests(prev => [newRequest, ...prev.filter(r => r.userId !== userId)]);
    const user = findUserById(userId);
    if (user) updateUser({...user, isVerifiedKYC: false});
    addNotification({ adminOnly: true, type: NotificationType.NEW_KYC_SUBMISSION, message: `New KYC submission from user ${userId} (${user?.name}).` });
    showToast('KYC documents submitted for review.', 'success');
    return newRequest;
  }, [kycRequests, addNotification, findUserById, updateUser, showToast]);

  const updateKYCStatus = useCallback((requestId: string, status: KYCStatus, adminId: string): boolean => {
    const request = kycRequests.find(r => r.id === requestId);
    if (!request) return false;
    setKycRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, reviewedAt: new Date().toISOString(), reviewerId: adminId } : r));
    const user = findUserById(request.userId);
    if (user) {
      updateUser({ ...user, isVerifiedKYC: status === KYCStatus.APPROVED });
      const notifType = status === KYCStatus.APPROVED ? NotificationType.KYC_APPROVED : NotificationType.KYC_REJECTED;
      const message = status === KYCStatus.APPROVED ? 'Your KYC has been approved.' : 'Your KYC has been rejected. Please contact support or resubmit.';
      addNotification({ userId: user.id, adminOnly: false, type: notifType, message });
    }
    showToast(`KYC request ${requestId} ${status.toLowerCase()}.`, 'success');
    return true;
  }, [kycRequests, findUserById, updateUser, addNotification, showToast]);

  const getUserWithdrawalRequests = useCallback((userId: string) => {
    return withdrawalRequests.filter(w => w.userId === userId).sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [withdrawalRequests]);

  const requestWithdrawal = useCallback((userId: string, amount: number, currency: Currency, walletAddress: string): WithdrawalRequest => {
    const user = findUserById(userId);
    if (!user) throw new Error("User not found for withdrawal");
    if (user.balance < amount) {
        showToast('Insufficient balance for withdrawal.', 'error');
        throw new Error("Insufficient balance");
    }
    if (user.currency !== currency) {
        showToast(`Withdrawal currency ${currency} must match account currency ${user.currency}.`, 'error');
        throw new Error("Currency mismatch");
    }
    const newWithdrawal: WithdrawalRequest = {
      id: `wd-${Date.now()}`, userId, amount, currency, walletAddress,
      status: TransactionStatus.PENDING, requestedAt: new Date().toISOString(),
    };
    setWithdrawalRequests(prev => [newWithdrawal, ...prev]);
    addNotification({ adminOnly: true, type: NotificationType.NEW_WITHDRAWAL_REQUEST, message: `New withdrawal request from ${user.name} for ${amount} ${currency}.` });
    showToast('Withdrawal request submitted.', 'success');
    return newWithdrawal;
  }, [findUserById, addNotification, showToast]);

  const updateWithdrawalStatus = useCallback((requestId: string, status: TransactionStatus, adminId: string): boolean => {
    const request = withdrawalRequests.find(r => r.id === requestId);
    if (!request || request.status !== TransactionStatus.PENDING) {
        showToast('Withdrawal request not found or already processed.', 'error');
        return false;
    }
    const user = findUserById(request.userId);
    if (!user) return false;

    if (status === TransactionStatus.COMPLETED) {
      if (user.balance < request.amount) {
        showToast(`User ${user.name} has insufficient balance.`, 'error');
        setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: TransactionStatus.REJECTED, processedAt: new Date().toISOString(), adminId } : r));
        addNotification({ userId: user.id, adminOnly: false, type: NotificationType.WITHDRAWAL_REJECTED, message: `Your withdrawal of ${request.amount} ${request.currency} was rejected due to insufficient funds.` });
        return false;
      }
      updateUser({ ...user, balance: user.balance - request.amount });
      addTransaction({
        userId: user.id, type: TransactionType.WITHDRAWAL, status: TransactionStatus.COMPLETED,
        amount: request.amount, currency: request.currency, description: `Withdrawal to ${request.walletAddress}`,
        toAddress: request.walletAddress, relatedTransactionId: request.id
      });
      addNotification({ userId: user.id, adminOnly: false, type: NotificationType.WITHDRAWAL_APPROVED, message: `Your withdrawal of ${request.amount} ${request.currency} has been approved.` });
      showToast(`Withdrawal ${requestId} approved.`, 'success');
    } else if (status === TransactionStatus.REJECTED) {
      addNotification({ userId: user.id, adminOnly: false, type: NotificationType.WITHDRAWAL_REJECTED, message: `Your withdrawal of ${request.amount} ${request.currency} has been rejected.` });
      showToast(`Withdrawal ${requestId} rejected.`, 'success');
    }
    setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, processedAt: new Date().toISOString(), adminId } : r));
    return true;
  }, [withdrawalRequests, findUserById, updateUser, addTransaction, addNotification, showToast]);

  const getExchangeRate = useCallback((from: Currency, to: Currency): number => {
    return MOCK_EXCHANGE_RATES[from]?.[to] || 0;
  }, []);

  const changeAccountCurrency = useCallback(async (userId: string, newCurrency: Currency): Promise<boolean> => {
    setLoading(true);
    await delay(300);
    const user = findUserById(userId);
    if(!user) {
        showToast("User not found.", "error");
        setLoading(false);
        return false;
    }
    if(user.currency === newCurrency) {
        showToast(`Account is already in ${newCurrency}.`, "info");
        setLoading(false);
        return true; // No change needed
    }

    const oldCurrency = user.currency;
    let newBalance = user.balance;

    if(user.balance > 0) {
        const rate = getExchangeRate(oldCurrency, newCurrency);
        if(rate <= 0) {
            showToast(`Exchange rate not available for ${oldCurrency} to ${newCurrency}. Cannot change account currency.`, "error");
            setLoading(false);
            return false;
        }
        newBalance = user.balance * rate;
    }
    
    const updatedUser: User = { ...user, balance: newBalance, currency: newCurrency };
    updateUser(updatedUser);

    addTransaction({
        userId, type: TransactionType.EXCHANGE, status: TransactionStatus.COMPLETED,
        amount: user.balance, // Log the original balance amount that was converted
        currency: oldCurrency, // Log the original currency
        description: `Account currency changed from ${oldCurrency} to ${newCurrency}. Balance converted: ${user.balance.toFixed(2)} ${oldCurrency} to ${newBalance.toFixed(2)} ${newCurrency}.`,
    });
    addNotification({userId, adminOnly: false, type: NotificationType.ACCOUNT_CURRENCY_CHANGED, message: `Your account currency has been changed to ${newCurrency}. New balance: ${newBalance.toFixed(2)} ${newCurrency}.`});
    showToast(`Account currency changed to ${newCurrency}.`, 'success');
    setLoading(false);
    return true;
  }, [findUserById, updateUser, addTransaction, getExchangeRate, showToast, addNotification, setLoading]);

  const performExchange = useCallback(async (userId: string, fromCurrency: Currency, toCurrency: Currency, fromAmount: number): Promise<boolean> => {
    // This function now primarily validates and then calls changeAccountCurrency,
    // as the requirement is to convert the entire balance.
    setLoading(true);
    await delay(300);
    const user = findUserById(userId);
    if(!user) {
        showToast("User not found.", "error");
        setLoading(false);
        return false;
    }
    if(user.currency !== fromCurrency) {
        showToast(`Account currency is ${user.currency}. Cannot exchange from ${fromCurrency}.`, "error");
        setLoading(false);
        return false;
    }
     if (isNaN(fromAmount) || fromAmount <= 0) {
      showToast('Invalid amount specified for exchange.', 'error');
      setLoading(false);
      return false;
    }
    if(user.balance < fromAmount) { // Check if they have at least the amount they want to "initiate" with
        showToast("Insufficient balance to initiate exchange.", "error");
        setLoading(false);
        return false;
    }
    // The actual amount used for conversion will be the total balance.
    return changeAccountCurrency(userId, toCurrency);
  }, [findUserById, changeAccountCurrency, showToast, setLoading]);


  const updateAppSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...newSettings }));
    showToast('System settings updated.', 'success');
  }, [showToast]);
  

  const contextValue: AppContextType = {
    currentUser, isAdmin, login, signup, logout,
    users, findUserById, findUserByEmail, updateUser, fundUserWallet, deductUserBalance,
    transactions, getUserTransactions, addTransaction,
    kycRequests, getUserKYCRequest, submitKYC, updateKYCStatus,
    withdrawalRequests, getUserWithdrawalRequests, requestWithdrawal, updateWithdrawalStatus,
    getExchangeRate, performExchange, changeAccountCurrency,
    notifications, addNotification, markNotificationAsRead, getUserNotifications, getAdminNotifications,
    appSettings, updateAppSettings,
    isLoading, setLoading, showToast
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      {toast && (
        <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-white animate-fade-in
          ${toast.type === 'success' ? 'bg-green-500' : ''}
          ${toast.type === 'error' ? 'bg-red-500' : ''}
          ${toast.type === 'info' ? 'bg-blue-500' : ''}
          z-[100]`}>
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
};