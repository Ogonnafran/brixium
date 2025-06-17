
import React, { useState, FormEvent, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { AppSettings, Currency, FeeWallet } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Modal from '../../components/common/Modal';
import { Settings, DollarSign, List, ToggleLeft, ToggleRight, Server, PlusCircle, Edit3, Trash2 } from 'lucide-react';

const SystemSettingsForm: React.FC = () => {
  const { appSettings, updateAppSettings, isLoading, setLoading } = useAppContext();
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(appSettings);
  
  const [isFeeWalletModalOpen, setIsFeeWalletModalOpen] = useState(false);
  const [editingFeeWallet, setEditingFeeWallet] = useState<Partial<FeeWallet> | null>(null);
  const [feeWalletForm, setFeeWalletForm] = useState<Omit<FeeWallet, 'id'>>({ name: '', network_protocol: '', symbol: '', address: '' });

  useEffect(() => {
    setCurrentSettings(appSettings);
  }, [appSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setCurrentSettings(prev => ({ ...prev, [name]: checked }));
    } else if (name === "supportedCurrencies") {
        const options = (e.target as HTMLSelectElement).options;
        const selectedCurrencies: Currency[] = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedCurrencies.push(options[i].value as Currency);
            }
        }
        setCurrentSettings(prev => ({ ...prev, supportedCurrencies: selectedCurrencies }));
    } else if (name === "defaultNetworkFee") {
        setCurrentSettings(prev => ({ ...prev, defaultNetworkFee: parseFloat(value) || 0 }));
    }
    else {
        setCurrentSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFeeWalletFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFeeWalletForm(prev => ({ ...prev, [name]: value }));
  };

  const openFeeWalletModal = (wallet?: FeeWallet) => {
    if (wallet) {
        setEditingFeeWallet(wallet);
        setFeeWalletForm({ name: wallet.name, network_protocol: wallet.network_protocol, symbol: wallet.symbol, address: wallet.address });
    } else {
        setEditingFeeWallet(null);
        setFeeWalletForm({ name: '', network_protocol: '', symbol: '', address: '' });
    }
    setIsFeeWalletModalOpen(true);
  };

  const handleSaveFeeWallet = () => {
    if (editingFeeWallet && editingFeeWallet.id) { // Editing existing
        setCurrentSettings(prev => ({
            ...prev,
            withdrawalFeeWallets: prev.withdrawalFeeWallets.map(w => w.id === editingFeeWallet.id ? { ...w, ...feeWalletForm } : w)
        }));
    } else { // Adding new
        const newWallet: FeeWallet = { id: `feeWallet-${Date.now()}`, ...feeWalletForm };
        setCurrentSettings(prev => ({
            ...prev,
            withdrawalFeeWallets: [...prev.withdrawalFeeWallets, newWallet]
        }));
    }
    setIsFeeWalletModalOpen(false);
  };

  const handleDeleteFeeWallet = (walletId: string) => {
    setCurrentSettings(prev => ({
        ...prev,
        withdrawalFeeWallets: prev.withdrawalFeeWallets.filter(w => w.id !== walletId)
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    updateAppSettings(currentSettings);
    setLoading(false);
  };

  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-2xl mx-auto animate-slide-in-up">
      <div className="flex items-center mb-8">
        <Icon name={Settings} className="text-brixium-purple-light mr-3" size={32} />
        <h2 className="text-2xl font-semibold text-brixium-purple-light">System Settings</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="supportedCurrencies" className="block text-sm font-medium text-brixium-gray-light mb-1">
            Supported Currencies (Ctrl/Cmd + Click to select multiple)
          </label>
          <div className="relative">
            <Icon name={List} size={18} className="text-brixium-gray absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
            <select multiple id="supportedCurrencies" name="supportedCurrencies" value={currentSettings.supportedCurrencies}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 bg-brixium-bg border border-brixium-gray-dark focus:border-brixium-purple focus:ring-brixium-purple rounded-lg text-brixium-gray-light h-32">
                {Object.values(Currency).map(curr => (<option key={curr} value={curr}>{curr}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="defaultNetworkFee" name="defaultNetworkFee" label="Default Network Fee" type="number"
                value={currentSettings.defaultNetworkFee.toString()} onChange={handleChange}
                icon={<DollarSign size={18} className="text-brixium-gray"/>} step="0.01"/>
            <div>
                <label htmlFor="networkFeeType" className="block text-sm font-medium text-brixium-gray-light mb-1">Fee Type</label>
                 <select id="networkFeeType" name="networkFeeType" value={currentSettings.networkFeeType} onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-brixium-bg border border-brixium-gray-dark focus:border-brixium-purple focus:ring-brixium-purple rounded-lg text-brixium-gray-light focus:outline-none focus:ring-1 sm:text-sm">
                    <option value="fixed">Fixed</option> <option value="percentage">Percentage (%)</option>
                </select>
            </div>
        </div>
        
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-brixium-gray-light">
                    Withdrawal & Fee Collection Wallets
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={() => openFeeWalletModal()} className="!py-1 !px-2">
                    <PlusCircle size={18} className="mr-1"/> Add Wallet
                </Button>
            </div>
            {currentSettings.withdrawalFeeWallets.length === 0 ? (
                <p className="text-sm text-brixium-gray text-center py-3 border border-dashed border-brixium-gray-dark rounded-md">No fee wallets configured.</p>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border border-brixium-gray-dark p-3 rounded-md">
                    {currentSettings.withdrawalFeeWallets.map(wallet => (
                        <div key={wallet.id} className="p-2.5 bg-brixium-bg rounded-md flex justify-between items-center">
                            <div>
                                <p className="text-sm font-semibold text-white">{wallet.name} ({wallet.symbol})</p>
                                <p className="text-xs text-brixium-gray">Network: {wallet.network_protocol}</p>
                                <p className="text-xs font-mono text-brixium-purple-light/70 break-all">{wallet.address}</p>
                            </div>
                            <div className="flex space-x-1 shrink-0">
                                <Button type="button" variant="ghost" size="sm" onClick={() => openFeeWalletModal(wallet)} className="!p-1.5" title="Edit">
                                    <Edit3 size={16} className="text-blue-400"/>
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteFeeWallet(wallet.id)} className="!p-1.5" title="Delete">
                                    <Trash2 size={16} className="text-red-400"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        <div>
          <label htmlFor="defaultUserCurrency" className="block text-sm font-medium text-brixium-gray-light mb-1">Default Currency for New Users</label>
          <select id="defaultUserCurrency" name="defaultUserCurrency" value={currentSettings.defaultUserCurrency} onChange={handleChange}
            className="w-full px-3 py-2.5 bg-brixium-bg border border-brixium-gray-dark focus:border-brixium-purple focus:ring-brixium-purple rounded-lg text-brixium-gray-light focus:outline-none focus:ring-1 sm:text-sm">
            {currentSettings.supportedCurrencies.map(curr => (<option key={curr} value={curr}>{curr}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brixium-gray-light mb-2">Maintenance Mode</label>
          <button type="button" name="maintenanceMode" onClick={() => setCurrentSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brixium-purple focus:ring-offset-2 focus:ring-offset-brixium-bg-light ${currentSettings.maintenanceMode ? 'bg-brixium-purple' : 'bg-brixium-gray-dark'}`}>
            <span className="sr-only">Toggle Maintenance Mode</span>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${currentSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`}/>
          </button>
          <span className={`ml-3 text-sm font-medium ${currentSettings.maintenanceMode ? 'text-yellow-400' : 'text-green-400'}`}>
            {currentSettings.maintenanceMode ? 'ENABLED' : 'DISABLED'}
          </span>
          <p className="text-xs text-brixium-gray mt-1">When enabled, certain user-facing features may be restricted.</p>
        </div>

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} size="lg">
          Save System Settings
        </Button>
      </form>

      <Modal isOpen={isFeeWalletModalOpen} onClose={() => setIsFeeWalletModalOpen(false)} title={editingFeeWallet ? "Edit Fee Wallet" : "Add New Fee Wallet"}>
        <div className="space-y-4">
            <Input label="Wallet Name (e.g., Tether on Tron)" name="name" value={feeWalletForm.name} onChange={handleFeeWalletFormChange} required />
            <Input label="Network/Protocol (e.g., TRC20, Bitcoin)" name="network_protocol" value={feeWalletForm.network_protocol} onChange={handleFeeWalletFormChange} required />
            <Input label="Currency Symbol (e.g., USDT, BTC)" name="symbol" value={feeWalletForm.symbol} onChange={handleFeeWalletFormChange} required />
            <Input label="Wallet Address" name="address" value={feeWalletForm.address} onChange={handleFeeWalletFormChange} required />
            <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsFeeWalletModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveFeeWallet}>Save Wallet</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default SystemSettingsForm;
