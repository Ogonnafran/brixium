
import React, { useState, FormEvent } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, Currency, TransactionType, TransactionStatus, AppNotification, NotificationType, FeeWallet } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Icon from '../../components/common/Icon';
import { Mail, Landmark, DollarSign, Send, Info, Copy, Check } from 'lucide-react';

const FeeWalletDisplay: React.FC<{ wallet: FeeWallet, onCopy: (address: string) => void, copiedAddress: string | null }> = ({ wallet, onCopy, copiedAddress }) => (
    <div className="p-3 bg-brixium-bg rounded-lg border border-brixium-gray-dark/70 mb-3">
        <p className="text-sm font-semibold text-brixium-purple-light">{wallet.name} ({wallet.symbol})</p>
        <p className="text-xs text-brixium-gray">Network: {wallet.network_protocol}</p>
        <div className="flex items-center justify-between mt-1">
            <p className="text-xs font-mono break-all text-white mr-2" title={wallet.address}>{wallet.address}</p>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(wallet.address)}
                className="!p-1.5"
                title={copiedAddress === wallet.address ? "Copied!" : "Copy Address"}
            >
                {copiedAddress === wallet.address ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-brixium-purple-light" />}
            </Button>
        </div>
    </div>
);


const TransferForm: React.FC = () => {
  const { currentUser, findUserByEmail, updateUser, addTransaction, appSettings, isLoading, setLoading, showToast, addNotification } = useAppContext();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [recipientFound, setRecipientFound] = useState<User | null>(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [transferDetails, setTransferDetails] = useState<{ recipient: User, amount: number } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  if (!currentUser || !('balance' in currentUser)) return <p>Loading...</p>;
  const sender = currentUser as User;

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address).then(() => {
        setCopiedAddress(address);
        showToast('Address copied to clipboard!', 'success');
        setTimeout(() => setCopiedAddress(null), 2000);
    }).catch(err => {
        showToast('Failed to copy address.', 'error');
        console.error('Failed to copy: ', err);
    });
  };

  const handleRecipientCheck = async () => {
    if (!recipientEmail) {
      setError('Please enter recipient email.');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 300)); 
    const found = findUserByEmail(recipientEmail);
    if (found && found.id !== sender.id) {
      setRecipientFound(found);
      showToast(`Recipient ${found.name} found.`, 'success');
    } else if (found && found.id === sender.id) {
      setError('Cannot transfer to yourself.');
      setRecipientFound(null);
    }
    else {
      setError('Recipient not found or invalid.');
      setRecipientFound(null);
    }
    setLoading(false);
  };

  const handleInitiateTransfer = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const transferAmount = parseFloat(amount);

    if (!recipientFound) {
      setError('Please verify recipient first.');
      return;
    }
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (transferAmount > sender.balance) {
      setError('Insufficient balance.');
      return;
    }
    if (sender.transferPin && !pin) {
        setError('Transfer PIN is required.');
        return;
    }
    if (sender.transferPin && pin !== sender.transferPin) {
        setError('Invalid Transfer PIN.');
        return;
    }
    if (!sender.isVerifiedKYC) {
      setError('KYC verification is required to make transfers. Please complete your KYC.');
      showToast('KYC verification required for transfers.', 'error');
      return;
    }

    setTransferDetails({ recipient: recipientFound, amount: transferAmount });
    setShowFeeModal(true);
  };
  
  const confirmTransferAfterFee = () => {
    if (!transferDetails || !recipientFound) return;
    setLoading(true);

    const updatedSender = { ...sender, balance: sender.balance - transferDetails.amount };
    updateUser(updatedSender);

    if(recipientFound.currency !== sender.currency){
        showToast(`Recipient currency is ${recipientFound.currency}. Transfer will be in ${sender.currency}. Recipient may need to exchange.`, 'info');
    }
    const updatedRecipient = { ...recipientFound, balance: recipientFound.balance + transferDetails.amount }; 
    updateUser(updatedRecipient);

    addTransaction({
      userId: sender.id, type: TransactionType.TRANSFER, status: TransactionStatus.COMPLETED,
      amount: transferDetails.amount, currency: sender.currency,
      description: `Transfer to ${recipientFound.name} (${recipientFound.email})`,
      toUserId: recipientFound.id, networkFee: appSettings.defaultNetworkFee 
    });
    
     addTransaction({
      userId: recipientFound.id, type: TransactionType.TRANSFER, status: TransactionStatus.COMPLETED,
      amount: transferDetails.amount, currency: sender.currency, 
      description: `Received from ${sender.name} (${sender.email})`,
      fromUserId: sender.id,
    });
    
    addNotification({userId: sender.id, adminOnly: false, type: NotificationType.TRANSFER_SENT, message: `You sent ${transferDetails.amount} ${sender.currency} to ${recipientFound.name}.`});
    addNotification({userId: recipientFound.id, adminOnly: false, type: NotificationType.TRANSFER_RECEIVED, message: `You received ${transferDetails.amount} ${sender.currency} from ${sender.name}.`});

    showToast('Transfer successful!', 'success');
    setLoading(false);
    setShowFeeModal(false);
    setRecipientEmail('');
    setAmount('');
    setPin('');
    setRecipientFound(null);
    setTransferDetails(null);
  };


  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-lg mx-auto animate-slide-in-up">
      <div className="flex items-center mb-6">
        <Icon name={Send} className="text-brixium-purple-light mr-3" size={32} />
        <h2 className="text-2xl font-semibold text-brixium-purple-light">Send Money</h2>
      </div>
      
      {!sender.isVerifiedKYC && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-600 text-yellow-300 rounded-md text-sm">
          <Icon name={Info} className="inline mr-2" size={16}/>
          Your account is not KYC verified. Please complete KYC to enable transfers.
        </div>
      )}

      <form onSubmit={handleInitiateTransfer} className="space-y-5">
        <div>
          <Input
            id="recipientEmail" label="Recipient's Email" type="email" value={recipientEmail}
            onChange={(e) => { setRecipientEmail(e.target.value); setRecipientFound(null); }}
            placeholder="recipient@example.com" icon={<Mail size={18} className="text-brixium-gray"/>}
            disabled={!sender.isVerifiedKYC} required
          />
          <Button type="button" variant="ghost" onClick={handleRecipientCheck} isLoading={isLoading} className="mt-2 text-sm" disabled={isLoading || !recipientEmail || !sender.isVerifiedKYC}>
            Verify Recipient
          </Button>
          {recipientFound && <p className="mt-1 text-sm text-green-400">Recipient: {recipientFound.name} (Verified)</p>}
        </div>

        <Input
          id="amount" label={`Amount (${sender.currency})`} type="number" value={amount}
          onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
          icon={<DollarSign size={18} className="text-brixium-gray"/>}
          disabled={!sender.isVerifiedKYC || !recipientFound} required
        />

        {sender.transferPin && (
          <Input
            id="pin" label="Transfer PIN" type="password" value={pin}
            onChange={(e) => setPin(e.target.value)} placeholder="Enter your 4-digit PIN"
            maxLength={4} disabled={!sender.isVerifiedKYC || !recipientFound} required
          />
        )}
        
        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading || !recipientFound || !amount || (sender.transferPin && !pin) || !sender.isVerifiedKYC} size="lg">
          Proceed to Transfer
        </Button>
      </form>

      <Modal isOpen={showFeeModal} onClose={() => setShowFeeModal(false)} title="Network Fee & Confirmation" size="lg">
        {transferDetails && (
          <div className="space-y-4 text-brixium-gray-light">
            <p>You are about to transfer <strong className="text-white">{transferDetails.amount.toLocaleString()} {sender.currency}</strong> to <strong className="text-white">{transferDetails.recipient.name}</strong>.</p>
            
            <div className="p-4 bg-brixium-bg rounded-lg border border-brixium-gray-dark">
              <p className="text-sm">A network fee is required to process this transaction:</p>
              <p className="text-2xl font-bold text-brixium-purple-light my-1">{appSettings.defaultNetworkFee.toLocaleString()} {appSettings.supportedCurrencies[0]}</p>
              <p className="text-xs mb-3">Please send the fee to one of the following addresses. For this demo, confirming will simulate fee payment.</p>
              
              <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                {appSettings.withdrawalFeeWallets.length > 0 ? (
                    appSettings.withdrawalFeeWallets.map(wallet => (
                        <FeeWalletDisplay key={wallet.id} wallet={wallet} onCopy={handleCopyAddress} copiedAddress={copiedAddress} />
                    ))
                ) : (
                    <p className="text-center text-sm text-yellow-400">No fee collection wallets configured by admin.</p>
                )}
              </div>
            </div>
            
            <p className="text-sm">Upon confirmation, the transfer amount will be deducted from your balance.</p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={() => setShowFeeModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={confirmTransferAfterFee} isLoading={isLoading}>
                Confirm Transfer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransferForm;
