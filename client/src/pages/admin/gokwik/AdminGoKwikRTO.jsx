import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Save, CheckCircle2, AlertCircle, Info, Lock
} from 'lucide-react';
import API from '../../../api/axiosInstance';
import { Card, PrimaryButton, Field, inputClass, controlBase } from '../../../components/admin/ui';

const RISK_ACTION_OPTIONS = [
  'Allow Order',
  'Require Verification',
  'Disable COD',
  'Allow Prepaid Only'
];

const AdminGoKwikRTO = () => {
  const [rtoSettings, setRtoSettings] = useState({
    protectionEnabled: true,
    codRiskCheck: true,
    highRiskAction: 'Allow Prepaid Only',
    mediumRiskAction: 'Require Verification',
    lowRiskAction: 'Allow Order'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await API.get('/gokwik/config');
        if (res.data?.success && res.data.config?.rto) {
          setRtoSettings(res.data.config.rto);
        }
      } catch (err) {
        setFeedback({
          type: 'error',
          message: 'Failed to load RTO configurations.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (field, value) => {
    setRtoSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await API.put('/gokwik/config', { rto: rtoSettings });
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: 'RTO and Fraud risk rules updated successfully.'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save RTO configuration.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        Loading RTO rules...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            RTO & Risk Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure return-to-origin (RTO) intelligence, buyer risk tiers, and automated COD gating.
          </p>
        </div>

        <PrimaryButton onClick={handleSave} disabled={saving}>
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? 'Saving...' : 'Save RTO Rules'}</span>
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

      {/* RTO Main Switch */}
      <Card title="RTO Intelligence & COD Risk Checking">
        <div className="space-y-4 py-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="space-y-0.5 max-w-xl">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">RTO Protection Engine</span>
              <p className="text-[11px] text-neutral-500">
                Leverage GoKwik AI risk scoring and buyer history to predict and prevent non-delivered COD parcels.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={rtoSettings.protectionEnabled}
                onChange={(e) => handleChange('protectionEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5 max-w-xl">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">Real-Time COD Risk Scoring</span>
              <p className="text-[11px] text-neutral-500">
                Evaluate high return probability before confirming checkout order.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={rtoSettings.codRiskCheck}
                onChange={(e) => handleChange('codRiskCheck', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Risk Tiers Action Setup */}
      <Card title="Risk Tier Action Rules">
        <div className="space-y-4 pt-1">
          <Field
            label="High-Risk Orders Action"
            hint="Action applied when customer has multiple prior RTOs or unverified address."
          >
            <select
              value={rtoSettings.highRiskAction}
              onChange={(e) => handleChange('highRiskAction', e.target.value)}
              className={inputClass}
            >
              {RISK_ACTION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>

          <Field
            label="Medium-Risk Orders Action"
            hint="Action applied for first-time shoppers or low confirmation confidence."
          >
            <select
              value={rtoSettings.mediumRiskAction}
              onChange={(e) => handleChange('mediumRiskAction', e.target.value)}
              className={inputClass}
            >
              {RISK_ACTION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>

          <Field
            label="Low-Risk Orders Action"
            hint="Action applied for high-trust repeat shoppers with clean delivery history."
          >
            <select
              value={rtoSettings.lowRiskAction}
              onChange={(e) => handleChange('lowRiskAction', e.target.value)}
              className={inputClass}
            >
              {RISK_ACTION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      {/* Official Capabilities Notice */}
      <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-xs flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-neutral-600 dark:text-neutral-400">
          <span className="font-bold text-neutral-900 dark:text-white">API Capability & Plan Requirement</span>
          <p className="text-[11px]">
            Advanced real-time RTO intelligence uses GoKwik KwikShield™ algorithms. Deep predictive insights <span className="font-semibold text-neutral-800 dark:text-neutral-200">require GoKwik account/product activation</span> on your merchant contract.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminGoKwikRTO;
