import React, { useState, useEffect } from 'react';
import {
  Banknote, Save, CheckCircle2, AlertCircle, ShieldCheck, Zap, Percent, Lock
} from 'lucide-react';
import API from '../../../api/axiosInstance';
import { Card, PrimaryButton, SecondaryButton, Field, inputClass } from '../../../components/admin/ui';

const AdminGoKwikCOD = () => {
  const [codSettings, setCodSettings] = useState({
    enabled: true,
    verificationRequired: false,
    orderLimit: 10000,
    minCartValue: 199,
    maxCartValue: 5000,
    codFee: 0,
    prepaidDiscountPercent: 5,
    enableOtpVerification: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await API.get('/gokwik/config');
        if (res.data?.success && res.data.config?.cod) {
          setCodSettings(res.data.config.cod);
        }
      } catch (err) {
        setFeedback({
          type: 'error',
          message: 'Failed to load COD settings from database.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (field, value) => {
    setCodSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await API.put('/gokwik/config', { cod: codSettings });
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: 'Cash on Delivery (COD) settings saved to database successfully.'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update COD settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        Loading COD configurations...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Cash On Delivery (COD) Configuration
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure order value thresholds, COD convenience fees, OTP confirmation, and prepaid discount incentives.
          </p>
        </div>

        <PrimaryButton onClick={handleSave} disabled={saving}>
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? 'Saving...' : 'Save COD Settings'}</span>
        </PrimaryButton>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Switch */}
      <Card title="COD Availability">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div className="space-y-0.5 max-w-xl">
            <span className="text-xs font-bold text-neutral-900 dark:text-white">Enable Cash On Delivery (COD)</span>
            <p className="text-[11px] text-neutral-500">
              Allow customers to select Cash on Delivery at checkout for orders fulfilling the configured criteria.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={codSettings.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </Card>

      {/* Verification & Safeguards */}
      <Card title="COD Safeguards & Verification">
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">Enable OTP Verification</span>
              <p className="text-[11px] text-neutral-500">Sends instant SMS/WhatsApp OTP to verify buyer's phone number before confirming COD order.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={codSettings.enableOtpVerification}
                onChange={(e) => handleChange('enableOtpVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">Manual Staff Verification Required</span>
              <p className="text-[11px] text-neutral-500">Places COD orders in "Pending Confirmation" until verified by staff.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={codSettings.verificationRequired}
                onChange={(e) => handleChange('verificationRequired', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Cart Value Limits & Fees */}
      <Card title="Cart Value Limits & Pricing Rules">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <Field label="Minimum Cart Value for COD (₹)" hint="Orders below this amount cannot use COD.">
            <input
              type="number"
              min="0"
              value={codSettings.minCartValue}
              onChange={(e) => handleChange('minCartValue', Number(e.target.value))}
              className={inputClass}
            />
          </Field>

          <Field label="Maximum Cart Value for COD (₹)" hint="Orders above this amount must pay prepaid.">
            <input
              type="number"
              min="0"
              value={codSettings.maxCartValue}
              onChange={(e) => handleChange('maxCartValue', Number(e.target.value))}
              className={inputClass}
            />
          </Field>

          <Field label="COD Convenience Fee (₹)" hint="Additional handling charge added to COD orders (0 for free COD).">
            <input
              type="number"
              min="0"
              value={codSettings.codFee}
              onChange={(e) => handleChange('codFee', Number(e.target.value))}
              className={inputClass}
            />
          </Field>

          <Field label="Prepaid Discount Incentive (%)" hint="Instant discount offered at checkout to encourage UPI / Card payment over COD.">
            <input
              type="number"
              min="0"
              max="100"
              value={codSettings.prepaidDiscountPercent}
              onChange={(e) => handleChange('prepaidDiscountPercent', Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
};

export default AdminGoKwikCOD;
