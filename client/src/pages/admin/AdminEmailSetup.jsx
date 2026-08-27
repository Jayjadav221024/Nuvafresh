import React, { useState } from 'react';
import { 
  Mail, Send, Server, ShieldCheck, CheckCircle2, AlertCircle, Save, RefreshCw, Key, Globe, Eye
} from 'lucide-react';

const AdminEmailSetup = () => {
  const [smtpSettings, setSmtpSettings] = useState({
    host: 'smtp.gmail.com',
    port: '465',
    secure: true,
    senderName: 'Nuva Nutrition Support',
    senderEmail: 'support@thenuva.com',
    password: '••••••••••••••••'
  });

  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }, 600);
  };

  const handleSendTest = (e) => {
    e.preventDefault();
    if (!testEmail) return;
    setSendingTest(true);
    setTestStatus(null);
    setTimeout(() => {
      setSendingTest(false);
      setTestStatus({ success: true, message: `Test email successfully dispatched to ${testEmail}` });
    }, 1200);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 font-sans max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            SMTP & Email Setup
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure outgoing mail server parameters, authentication credentials, and test connectivity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: SMTP Server Parameters */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <Server className="h-4 w-4 text-[#2d472c] dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Outgoing Mail Server (SMTP)</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpSettings.host}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Port
                </label>
                <input
                  type="text"
                  value={smtpSettings.port}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Sender From Name
                </label>
                <input
                  type="text"
                  value={smtpSettings.senderName}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, senderName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Sender From Email
                </label>
                <input
                  type="email"
                  value={smtpSettings.senderEmail}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, senderEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                SMTP App Password / Secret
              </label>
              <input
                type="password"
                value={smtpSettings.password}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                required
              />
            </div>

            {/* SSL Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">Require SSL / TLS Encryption</span>
                <span className="text-[10px] text-neutral-400">Enforce secure TLS handshake over port 465/587</span>
              </div>
              <button
                type="button"
                onClick={() => setSmtpSettings({ ...smtpSettings, secure: !smtpSettings.secure })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smtpSettings.secure ? 'bg-[#2d472c]' : 'bg-neutral-300 dark:bg-neutral-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smtpSettings.secure ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="pt-3 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> SMTP Settings Saved
                </span>
              ) : <div />}

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Cols: Live Connection Tester */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <Mail className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Send Test Email</h2>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Verify your SMTP handshake and delivery routing by sending a simulated transactional notification.
            </p>

            <form onSubmit={handleSendTest} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin@thenuva.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sendingTest}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-black dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{sendingTest ? 'Sending Test...' : 'Send Test Notification'}</span>
              </button>
            </form>

            {testStatus && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{testStatus.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailSetup;
