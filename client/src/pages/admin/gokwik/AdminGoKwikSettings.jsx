import React, { useState, useEffect } from 'react';
import {
  Zap, Save, RefreshCw, Key, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff, Radio, Lock
} from 'lucide-react';
import API from '../../../api/axiosInstance';
import { Card, PrimaryButton, SecondaryButton, Badge, Field, inputClass } from '../../../components/admin/ui';

const AdminGoKwikSettings = () => {
  const [formData, setFormData] = useState({
    merchantId: '',
    apiKey: '',
    apiSecret: '',
    environment: 'sandbox',
    isCheckoutEnabled: false,
    webhookSecret: ''
  });

  const [hasExistingSecret, setHasExistingSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await API.get('/gokwik/config');
        if (res.data?.success && res.data.config) {
          const cfg = res.data.config;
          setFormData({
            merchantId: cfg.merchantId || '',
            apiKey: cfg.apiKey || '',
            apiSecret: cfg.apiSecretMasked || '',
            environment: cfg.environment || 'sandbox',
            isCheckoutEnabled: Boolean(cfg.isCheckoutEnabled),
            webhookSecret: cfg.webhookSecret || ''
          });
          setHasExistingSecret(Boolean(cfg.hasApiSecret));
        }
      } catch (err) {
        setFeedback({
          type: 'error',
          message: 'Failed to load GoKwik settings from server.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setFeedback(null);
    setTestResult(null);

    try {
      const res = await API.put('/gokwik/config', formData);
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: 'GoKwik configuration saved successfully.'
        });
        if (res.data.config?.hasApiSecret) {
          setHasExistingSecret(true);
          setFormData(prev => ({
            ...prev,
            apiSecret: res.data.config.apiSecretMasked || '••••••••••••••••'
          }));
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save configuration.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setFeedback(null);

    try {
      const res = await API.post('/gokwik/test-connection', {
        merchantId: formData.merchantId,
        apiKey: formData.apiKey,
        apiSecret: formData.apiSecret,
        environment: formData.environment
      });

      if (res.data) {
        setTestResult(res.data);
      }
    } catch (err) {
      setTestResult({
        success: false,
        status: 'Error',
        message: err.response?.data?.message || 'Connection test failed to reach GoKwik.'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        Loading GoKwik configuration...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            GoKwik API Configuration
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure your merchant credentials, environment, and master checkout activation switch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SecondaryButton onClick={handleTestConnection} disabled={testing || !formData.merchantId}>
            <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </SecondaryButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </PrimaryButton>
        </div>
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

      {testResult && (
        <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
          testResult.success
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {testResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-amber-600" />}
            <span>Status: {testResult.status}</span>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 pl-6">{testResult.message}</p>
        </div>
      )}

      {/* Checkout Toggle Card */}
      <Card title="GoKwik Checkout Activation">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div className="space-y-0.5 max-w-xl">
            <span className="text-xs font-bold text-neutral-900 dark:text-white">Enable GoKwik Checkout</span>
            <p className="text-[11px] text-neutral-500">
              When ON, the storefront cart seamlessly launches the high-conversion GoKwik instant checkout. If GoKwik is disabled or not configured, the website automatically continues using the native Nuva checkout.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={formData.isCheckoutEnabled}
              onChange={(e) => handleInputChange('isCheckoutEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {!formData.merchantId && formData.isCheckoutEnabled && (
          <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>GoKwik is not configured yet. Native Nuva checkout will continue to be used until valid credentials are saved.</span>
          </div>
        )}
      </Card>

      {/* API Configuration Card */}
      <Card title="API Credentials & Environment">
        <div className="space-y-4 pt-1">
          {/* Environment */}
          <Field label="Environment" hint="Select Sandbox for testing or Production for live transactions.">
            <div className="grid grid-cols-2 gap-3 max-w-md pt-1">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  formData.environment === 'sandbox'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-neutral-900 dark:text-white font-bold'
                    : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="environment"
                  value="sandbox"
                  checked={formData.environment === 'sandbox'}
                  onChange={() => handleInputChange('environment', 'sandbox')}
                  className="accent-emerald-600"
                />
                <div className="text-xs">
                  <div>Sandbox</div>
                  <div className="text-[10px] text-neutral-500 font-normal">Test environment</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  formData.environment === 'production'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-neutral-900 dark:text-white font-bold'
                    : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="environment"
                  value="production"
                  checked={formData.environment === 'production'}
                  onChange={() => handleInputChange('environment', 'production')}
                  className="accent-emerald-600"
                />
                <div className="text-xs">
                  <div>Production</div>
                  <div className="text-[10px] text-neutral-500 font-normal">Live customers</div>
                </div>
              </label>
            </div>
          </Field>

          {/* Merchant ID */}
          <Field label="Merchant ID" required hint="Your unique GoKwik Merchant Identifier (MID).">
            <input
              type="text"
              value={formData.merchantId}
              onChange={(e) => handleInputChange('merchantId', e.target.value)}
              placeholder="e.g. gkw_mid_nuva_fresh_2026"
              className={inputClass}
            />
          </Field>

          {/* API Key */}
          <Field label="API Key (Public ID)" required hint="Public Application Identifier supplied in your GoKwik portal.">
            <input
              type="text"
              value={formData.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              placeholder="e.g. gkw_live_key_9823472093847"
              className={inputClass}
            />
          </Field>

          {/* API Secret (Secure Server-side) */}
          <Field
            label="API Secret"
            required
            hint="Private GoKwik Secret Key. Never exposed in frontend or client-side responses."
          >
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={formData.apiSecret}
                onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                placeholder={hasExistingSecret ? '••••••••••••••••' : 'Enter GoKwik Secret Key'}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          {/* Webhook Secret */}
          <Field label="Webhook Secret Key (Optional)" hint="Used to cryptographically verify HMAC-SHA256 signatures of inbound webhooks.">
            <input
              type="text"
              value={formData.webhookSecret}
              onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
              placeholder="e.g. whsec_73bdfa98124b87c1"
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      {/* Security Note Banner */}
      <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300 text-xs flex items-start gap-3">
        <Lock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-neutral-900 dark:text-white">Server-Side Security Enforcement</span>
          <p className="text-[11px] text-neutral-500">
            All API secret keys and GoKwik credentials are encrypted and stored strictly server-side. Sensitive parameters are masked in admin responses and will never be logged or exposed in client bundles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminGoKwikSettings;
