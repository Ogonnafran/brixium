
import React, { useState, useEffect, FormEvent } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Currency, User } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { Repeat, DollarSign, ArrowRight } from 'lucide-react';

const CurrencyExchange: React.FC = () => {
  const { currentUser, appSettings, getExchangeRate, performExchange, isLoading, setLoading, showToast } = useAppContext();

  if (!currentUser || !('balance' in currentUser)) return <p>Loading...</p>;
  const user = currentUser as User;

  const [fromCurrency, setFromCurrency] = useState<Currency>(user.currency);
  const [toCurrency, setToCurrency] = useState<Currency>(appSettings.supportedCurrencies.find(c => c !== user.currency) || appSettings.supportedCurrencies[0]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState<number | null>(null);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ensure `fromCurrency` is always the user's current account currency
    setFromCurrency(user.currency);
    // If `toCurrency` becomes same as user's new currency, pick another one
    if (toCurrency === user.currency) {
      setToCurrency(appSettings.supportedCurrencies.find(c => c !== user.currency) || appSettings.supportedCurrencies[0]);
    }
  }, [user.currency, appSettings.supportedCurrencies, toCurrency]);


  useEffect(() => {
    if (fromCurrency && toCurrency) {
      const rate = getExchangeRate(fromCurrency, toCurrency);
      setCurrentRate(rate);
      if (fromAmount && rate > 0) {
        const numericFromAmount = parseFloat(fromAmount);
        if (!isNaN(numericFromAmount)) {
          setToAmount(numericFromAmount * rate);
        } else {
          setToAmount(null);
        }
      } else {
        setToAmount(null);
      }
    }
  }, [fromCurrency, toCurrency, fromAmount, getExchangeRate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
    setError('');
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && currentRate && currentRate > 0) {
      setToAmount(numericValue * currentRate);
    } else if (value === '') {
        setToAmount(null);
    } else {
      setToAmount(null);
    }
  };
  
  const handleSwapCurrencies = () => {
      // Swapping is complex if user's base currency must be 'from'.
      // For this UI, let's keep 'from' as user.currency. User can only convert *from* their main balance.
      // A more advanced system would allow selecting any 'from' if they had multi-currency balances.
      // So, swap will just change the 'to' currency if possible.
      const tempTo = toCurrency;
      // Find a new 'to' currency that isn't the current 'from' or the old 'to'
      const newTo = appSettings.supportedCurrencies.find(c => c !== fromCurrency && c !== tempTo) || appSettings.supportedCurrencies.find(c => c !== fromCurrency);
      if(newTo) setToCurrency(newTo);
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const numericFromAmount = parseFloat(fromAmount);

    if (isNaN(numericFromAmount) || numericFromAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (numericFromAmount > user.balance) {
      setError('Insufficient balance.');
      return;
    }
    if (fromCurrency === toCurrency) {
      setError('Cannot exchange to the same currency.');
      return;
    }
    if (!currentRate || currentRate <= 0) {
      setError('Exchange rate not available. Please try again later.');
      return;
    }
    if (!user.isVerifiedKYC) {
      setError('KYC verification is required for currency exchange.');
      showToast('KYC verification required.', 'error');
      return;
    }

    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    const success = performExchange(user.id, fromCurrency, toCurrency, numericFromAmount);
    if (success) {
      setFromAmount('');
      setToAmount(null);
      // The user.currency in context will update, triggering useEffect to reset form.
    } else {
      // Error is shown by toast in context
    }
    setLoading(false);
  };

  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-lg mx-auto animate-slide-in-up">
      <div className="flex items-center mb-6">
        <Icon name={Repeat} className="text-brixium-purple-light mr-3" size={32} />
        <h2 className="text-2xl font-semibold text-brixium-purple-light">Currency Exchange</h2>
      </div>
      <p className="mb-4 text-sm text-brixium-gray">Your current account currency is <strong className="text-white">{user.currency}</strong>.</p>
      
      {!user.isVerifiedKYC && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-600 text-yellow-300 rounded-md text-sm">
          KYC verification is required to use the exchange service.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* From Currency (Fixed to user's current account currency) */}
        <div>
            <label className="block text-sm font-medium text-brixium-gray-light mb-1">From Currency</label>
            <div className="p-3 bg-brixium-bg rounded-lg border border-brixium-gray-dark text-white">
                {user.currency} (Your account balance)
            </div>
        </div>

        <Input
          id="fromAmount"
          label={`Amount to Exchange (${user.currency})`}
          type="number"
          value={fromAmount}
          onChange={handleAmountChange}
          placeholder="0.00"
          icon={<DollarSign size={18} className="text-brixium-gray"/>}
          disabled={!user.isVerifiedKYC || isLoading}
          required
        />
        
        <div className="flex items-center justify-center my-2">
            <Button type="button" onClick={handleSwapCurrencies} variant="ghost" size="sm" className="p-2" disabled={!user.isVerifiedKYC || isLoading || appSettings.supportedCurrencies.length < 2}>
                <Repeat size={20} className="text-brixium-purple-light" />
            </Button>
        </div>

        {/* To Currency */}
        <div>
          <label htmlFor="toCurrency" className="block text-sm font-medium text-brixium-gray-light mb-1">
            To Currency
          </label>
          <select
            id="toCurrency"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value as Currency)}
            className="w-full px-3 py-2.5 bg-brixium-bg-light border border-brixium-gray-dark focus:border-brixium-purple focus:ring-brixium-purple rounded-lg text-brixium-gray-light placeholder-brixium-gray focus:outline-none focus:ring-1 sm:text-sm"
            disabled={!user.isVerifiedKYC || isLoading}
            required
          >
            {appSettings.supportedCurrencies.filter(c => c !== fromCurrency).map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>

        {currentRate && (
          <div className="p-3 bg-brixium-bg rounded-lg border border-brixium-gray-dark/50 text-sm">
            <p className="text-brixium-gray">Exchange Rate:</p>
            <p className="text-white font-semibold">1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}</p>
          </div>
        )}

        {toAmount !== null && (
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30 text-sm">
            <p className="text-brixium-gray">You will receive approximately:</p>
            <p className="text-xl font-bold text-green-400">{toAmount.toFixed(2)} {toCurrency}</p>
          </div>
        )}
        
        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading || !fromAmount || !toAmount || !user.isVerifiedKYC} size="lg">
          Exchange Now
        </Button>
      </form>
      <p className="mt-4 text-xs text-center text-brixium-gray">
        Note: Exchanging currency will change your account's primary currency and convert your entire balance. Rates are indicative.
      </p>
    </div>
  );
};

export default CurrencyExchange;
    