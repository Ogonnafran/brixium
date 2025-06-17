import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User } from '../../types';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { Download, Copy, Check, Briefcase, User as UserIcon, Hash, LandmarkIcon } from 'lucide-react';
import { APP_NAME } from '../../constants';

const DetailRow: React.FC<{ label: string; value: string; onCopy: (value: string) => void; copiedValue: string | null }> = ({ label, value, onCopy, copiedValue }) => (
  <div className="py-3 sm:py-4 border-b border-brixium-gray-dark/30">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="mb-1 sm:mb-0">
        <p className="text-xs text-brixium-gray uppercase tracking-wider">{label}</p>
        <p className="text-md sm:text-lg font-semibold text-white break-all">{value}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onCopy(value)}
        className="!p-1.5 self-start sm:self-center"
        title={copiedValue === value ? "Copied!" : `Copy ${label}`}
      >
        {copiedValue === value ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-brixium-purple-light" />}
      </Button>
    </div>
  </div>
);

const ReceiveMoneyDetails: React.FC = () => {
  const { currentUser, showToast } = useAppContext();
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  if (!currentUser || !('balance' in currentUser)) { // Ensures currentUser is User type
    return <p className="text-center text-brixium-gray">Loading user data...</p>;
  }
  const user = currentUser as User;

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedValue(value);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedValue(null), 2000);
    }).catch(err => {
      showToast('Failed to copy.', 'error');
      console.error('Failed to copy: ', err);
    });
  };

  const accountDetails = [
    { label: "Account Holder", value: user.name, icon: UserIcon },
    { label: "Brixium Account Number", value: user.brixiumAccountNumber, icon: Hash },
    { label: "Bank Name", value: APP_NAME, icon: LandmarkIcon },
    { label: "Account Currency", value: user.currency, icon: Briefcase },
  ];

  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-xl mx-auto animate-slide-in-up">
      <div className="flex items-center mb-6">
        <Icon name={Download} className="text-brixium-purple-light mr-3" size={32} />
        <h2 className="text-2xl font-semibold text-brixium-purple-light">Receive Money</h2>
      </div>
      <p className="text-sm text-brixium-gray mb-6">
        Share these details with anyone wishing to send funds to your {APP_NAME} account.
      </p>

      <div className="space-y-1">
        {accountDetails.map(detail => (
          <DetailRow
            key={detail.label}
            label={detail.label}
            value={detail.value}
            onCopy={handleCopy}
            copiedValue={copiedValue}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-brixium-bg rounded-lg border border-brixium-gray-dark/50">
        <h4 className="text-md font-semibold text-brixium-purple-light mb-2">Instructions for Sender:</h4>
        <ul className="list-disc list-inside text-sm text-brixium-gray-light space-y-1">
          <li>Ensure the sender has your correct Brixium Account Number.</li>
          <li>Transfers are typically processed in your account currency ({user.currency}).</li>
          <li>For international transfers, the sender might need additional bank identifiers (not applicable for this internal demo).</li>
        </ul>
      </div>
    </div>
  );
};

export default ReceiveMoneyDetails;