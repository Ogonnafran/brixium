
import React, { useState, FormEvent, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, Currency } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Modal from '../../components/common/Modal';
import { Settings, Bell, LockKeyhole, DollarSign, AlertTriangle } from 'lucide-react';

const UserSettings: React.FC = () => {
  const { currentUser, updateUser, isLoading, setLoading, showToast, appSettings, changeAccountCurrency, getExchangeRate } = useAppContext();
  
  const user = currentUser as User;

  const [selectedAccountCurrency, setSelectedAccountCurrency] = useState<Currency>(user.currency);
  const [enableTransferPin, setEnableTransferPin] = useState<boolean>(!!user.transferPin);
  const [transferPin, setTransferPin] = useState<string>(user.transferPin || '');
  const [confirmTransferPin, setConfirmTransferPin] = useState<string>(user.transferPin || '');
  const [enableNotifications, setEnableNotifications] = useState<boolean>(true); 
  const [error, setError] = useState('');
  const [showCurrencyChangeModal, setShowCurrencyChangeModal] = useState(false);
  const [currencyChangeDetails, setCurrencyChangeDetails] = useState<{ from: Currency, to: Currency, fromAmount: number, toAmount: number} | null>(null);


  useEffect(() => {
    if (user) {
        setSelectedAccountCurrency(user.currency);
        setEnableTransferPin(!!user.transferPin);
        setTransferPin(user.transferPin || '');
        setConfirmTransferPin(user.transferPin || '');
    }
  }, [user]);

  const handleCurrencyChangeAttempt = (newCurrency: Currency) => {
    setSelectedAccountCurrency(newCurrency);
    if (newCurrency !== user.currency && user.balance > 0) {
        const rate = getExchangeRate(user.currency, newCurrency);
        if (rate > 0) {
            setCurrencyChangeDetails({
                from: user.currency,
                to: newCurrency,
                fromAmount: user.balance,
                toAmount: user.balance * rate
            });
            setShowCurrencyChangeModal(true);
        } else {
            showToast(`Exchange rate from ${user.currency} to ${newCurrency} is unavailable. Cannot change account currency.`, "error");
            setSelectedAccountCurrency(user.currency); // Revert selection
        }
    }
    // If balance is 0 or currency is the same, no modal needed, change will apply on save.
  };

  const confirmCurrencyChange = async () => {
    if (!currencyChangeDetails) return;
    setLoading(true);
    const success = await changeAccountCurrency(user.id, currencyChangeDetails.to);
    if (success) {
      showToast(`Account currency successfully changed to ${currencyChangeDetails.to}.`, 'success');
    } else {
      // Error toast is usually handled by changeAccountCurrency
      setSelectedAccountCurrency(user.currency); // Revert if failed
    }
    setShowCurrencyChangeModal(false);
    setCurrencyChangeDetails(null);
    setLoading(false);
  };

  const handleSettingsUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (enableTransferPin && (!transferPin || transferPin.length !== 4 || !/^\d{4}$/.test(transferPin))) {
      setError('Transfer PIN must be 4 digits.');
      return;
    }
    if (enableTransferPin && transferPin !== confirmTransferPin) {
      setError('Transfer PINs do not match.');
      return;
    }

    // If currency change was not pre-confirmed via modal (e.g. balance was 0, or same currency)
    // and selected currency is different now.
    if (selectedAccountCurrency !== user.currency && !showCurrencyChangeModal) {
        if (user.balance > 0) {
            // This case should ideally be caught by handleCurrencyChangeAttempt showing the modal
            // But as a fallback, trigger it again.
            handleCurrencyChangeAttempt(selectedAccountCurrency);
            return; // Stop form submission until modal is handled
        } else {
            // Balance is 0, proceed with currency change without conversion
            setLoading(true);
            await changeAccountCurrency(user.id, selectedAccountCurrency);
            setLoading(false);
        }
    }
    
    // Update other settings like PIN
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
    
    const updatedUserData: Partial<User> = {
        // currency is handled by changeAccountCurrency or already updated if balance was 0
        transferPin: enableTransferPin ? transferPin : undefined,
    };
    // Create a new user object for updateUser, ensuring it has all required fields
    const finalUpdatedUser: User = {
      ...user, // spread existing user data
      ...updatedUserData, // apply specific updates
      currency: selectedAccountCurrency // ensure currency reflects the final choice
    };

    updateUser(finalUpdatedUser); 
    showToast('Settings (PIN, Notifications) updated successfully!', 'success');
    setLoading(false);
  };

  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-lg mx-auto animate-slide-in-up">
      <div className="flex items-center mb-8">
        <Icon name={Settings} className="text-brixium-purple-light mr-3" size={32} />
        <h2 className="text-2xl font-semibold text-brixium-purple-light">Account Settings</h2>
      </div>
      <form onSubmit={handleSettingsUpdate} className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
            <Icon name={DollarSign} className="text-brixium-purple-light mr-2" size={20} /> Account Currency
          </h3>
          <p className="text-sm text-brixium-gray mb-3">This is your main account currency. Changing it will convert your entire balance.</p>
          <select
            id="accountCurrency"
            value={selectedAccountCurrency}
            onChange={(e) => handleCurrencyChangeAttempt(e.target.value as Currency)}
            className="w-full px-3 py-2.5 bg-brixium-bg border border-brixium-gray-dark focus:border-brixium-purple focus:ring-brixium-purple rounded-lg text-brixium-gray-light placeholder-brixium-gray focus:outline-none focus:ring-1 sm:text-sm"
          >
            {appSettings.supportedCurrencies.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
           <p className="text-xs text-brixium-gray mt-1">Current balance: {user.balance.toFixed(2)} {user.currency}.</p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
            <Icon name={LockKeyhole} className="text-brixium-purple-light mr-2" size={20} /> Transfer PIN
          </h3>
          <div className="flex items-center space-x-3 mb-3">
            <input
              type="checkbox" id="enableTransferPin" checked={enableTransferPin}
              onChange={(e) => {
                setEnableTransferPin(e.target.checked);
                if (!e.target.checked) { setTransferPin(''); setConfirmTransferPin('');}
              }}
              className="h-5 w-5 rounded text-brixium-purple bg-brixium-bg-light border-brixium-gray-dark focus:ring-brixium-purple focus:ring-offset-brixium-bg-light"
            />
            <label htmlFor="enableTransferPin" className="text-sm text-brixium-gray-light">Enable Transfer PIN</label>
          </div>
          {enableTransferPin && (
            <div className="space-y-4 pl-8 border-l-2 border-brixium-purple/30">
              <Input
                id="transferPin" label="Set 4-Digit PIN" type="password" value={transferPin}
                onChange={(e) => setTransferPin(e.target.value)} maxLength={4} placeholder="••••"
                pattern="\d{4}" title="PIN must be 4 digits"
              />
              <Input
                id="confirmTransferPin" label="Confirm 4-Digit PIN" type="password" value={confirmTransferPin}
                onChange={(e) => setConfirmTransferPin(e.target.value)} maxLength={4} placeholder="••••"
                pattern="\d{4}"
              />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
            <Icon name={Bell} className="text-brixium-purple-light mr-2" size={20} /> Notification Preferences
          </h3>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox" id="enableNotifications" checked={enableNotifications}
              onChange={(e) => setEnableNotifications(e.target.checked)}
              className="h-5 w-5 rounded text-brixium-purple bg-brixium-bg-light border-brixium-gray-dark focus:ring-brixium-purple focus:ring-offset-brixium-bg-light"
            />
            <label htmlFor="enableNotifications" className="text-sm text-brixium-gray-light">Receive real-time notifications</label>
          </div>
          <p className="text-xs text-brixium-gray mt-1 pl-8">Control alerts for KYC, withdrawals, etc.</p>
        </div>
        
        {error && <p className="text-sm text-red-400 mt-4 text-center">{error}</p>}

        <Button type="submit" variant="primary" className="w-full mt-8" isLoading={isLoading} disabled={isLoading || showCurrencyChangeModal} size="lg">
          Save Settings
        </Button>
      </form>

      <Modal isOpen={showCurrencyChangeModal} onClose={() => { setShowCurrencyChangeModal(false); setSelectedAccountCurrency(user.currency); /* Revert selection on cancel */ }} title="Confirm Account Currency Change">
        {currencyChangeDetails && (
          <div className="space-y-4 text-brixium-gray-light">
             <div className="flex items-center p-3 bg-yellow-500/10 border border-yellow-600/50 rounded-md">
                <Icon name={AlertTriangle} size={24} className="text-yellow-400 mr-3 shrink-0"/>
                <p>You are about to change your account's primary currency from <strong>{currencyChangeDetails.from}</strong> to <strong>{currencyChangeDetails.to}</strong>. 
                This will convert your entire balance.</p>
             </div>
            <p>Current Balance: <strong className="text-white">{currencyChangeDetails.fromAmount.toFixed(2)} {currencyChangeDetails.from}</strong></p>
            <p>Estimated New Balance: <strong className="text-white">{currencyChangeDetails.toAmount.toFixed(2)} {currencyChangeDetails.to}</strong></p>
            <p className="text-xs">Exchange rates are indicative and subject to change.</p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={() => { setShowCurrencyChangeModal(false); setSelectedAccountCurrency(user.currency); }}>Cancel</Button>
              <Button variant="primary" onClick={confirmCurrencyChange} isLoading={isLoading}>
                Confirm & Change Currency
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserSettings;
