
import React, { useState, FormEvent } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, Currency, WithdrawalRequest, TransactionStatus, AppNotification, NotificationType } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { Landmark, DollarSign, ListChecks } from 'lucide-react';

const WithdrawalForm: React.FC = () => {
  const { currentUser, requestWithdrawal, getUserWithdrawalRequests, isLoading, setLoading, showToast, appSettings } = useAppContext();

  if (!currentUser || !('balance' in currentUser)) return <p>Loading...</p>;
  const user = currentUser as User;

  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');

  const userWithdrawals = getUserWithdrawalRequests(user.id);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const withdrawalAmount = parseFloat(amount);

    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (withdrawalAmount > user.balance) {
      setError('Insufficient balance for this withdrawal.');
      return;
    }
    if (!walletAddress.trim()) {
      setError('Please enter a destination wallet address.');
      return;
    }
     if (!user.isVerifiedKYC) {
      setError('KYC verification is required to make withdrawals. Please complete your KYC.');
      showToast('KYC verification required.', 'error');
      return;
    }
    if (appSettings.maintenanceMode) {
      setError('Withdrawals are temporarily disabled due to system maintenance.');
      showToast('Withdrawals disabled (Maintenance Mode).', 'error');
      return;
    }


    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 500)); // Simulate API call
      requestWithdrawal(user.id, withdrawalAmount, user.currency, walletAddress);
      setAmount('');
      setWalletAddress('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal request.');
      // Toast is handled by context usually
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10">
      <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-lg mx-auto animate-slide-in-up">
        <div className="flex items-center mb-6">
          <Icon name={Landmark} className="text-brixium-purple-light mr-3" size={32} />
          <h2 className="text-2xl font-semibold text-brixium-purple-light">Request Withdrawal</h2>
        </div>
        {!user.isVerifiedKYC && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-600 text-yellow-300 rounded-md text-sm">
            KYC verification is required to request withdrawals.
            </div>
        )}
        {appSettings.maintenanceMode && (
            <div className="mb-4 p-3 bg-orange-500/20 border border-orange-600 text-orange-300 rounded-md text-sm">
            Withdrawals are temporarily disabled due to system maintenance.
            </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="amount"
            label={`Amount to Withdraw (${user.currency})`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            icon={<DollarSign size={18} className="text-brixium-gray"/>}
            disabled={!user.isVerifiedKYC || isLoading || appSettings.maintenanceMode}
            required
          />
          <Input
            id="walletAddress"
            label="Destination Wallet Address"
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter your external wallet address"
            icon={<Landmark size={18} className="text-brixium-gray"/>}
            disabled={!user.isVerifiedKYC || isLoading || appSettings.maintenanceMode}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading || !user.isVerifiedKYC || appSettings.maintenanceMode} size="lg">
            Submit Withdrawal Request
          </Button>
        </form>
      </div>

      {userWithdrawals.length > 0 && (
        <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-xl mx-auto animate-slide-in-up">
          <div className="flex items-center mb-4">
            <Icon name={ListChecks} className="text-brixium-purple-light mr-3" size={28} />
            <h3 className="text-xl font-semibold text-brixium-purple-light">Your Withdrawal Requests</h3>
          </div>
          <ul className="divide-y divide-brixium-gray-dark/50 max-h-96 overflow-y-auto">
            {userWithdrawals.map(req => (
              <li key={req.id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {req.amount.toLocaleString()} {req.currency}
                    </p>
                    <p className="text-xs text-brixium-gray break-all">To: {req.walletAddress}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full
                    ${req.status === TransactionStatus.PENDING ? 'bg-yellow-500/20 text-yellow-300' : ''}
                    ${req.status === TransactionStatus.COMPLETED ? 'bg-green-500/20 text-green-400' : ''}
                    ${req.status === TransactionStatus.REJECTED ? 'bg-red-500/20 text-red-400' : ''}
                  `}>
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-brixium-gray mt-1">Requested: {new Date(req.requestedAt).toLocaleString()}</p>
                {req.processedAt && <p className="text-xs text-brixium-gray">Processed: {new Date(req.processedAt).toLocaleString()}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WithdrawalForm;
    