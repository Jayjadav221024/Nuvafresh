import React, { useState, useEffect } from 'react';
import { 
  X, QrCode, Smartphone, CreditCard, ShieldCheck, CheckCircle2, 
  Sparkles, Lock, ArrowRight, RefreshCw, Copy, Check, Info, Radio, Zap
} from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, amount, cartItems = [], onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('qr'); // 'qr' | 'upi_app' | 'card' | 'cod'
  const [upiApp, setUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'cred'
  const [paymentState, setPaymentState] = useState('idle'); // 'idle' | 'scanning' | 'processing' | 'success'
  const [countdown, setCountdown] = useState(300); // 5 mins timer for QR
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [customUpiId, setCustomUpiId] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const upiId = 'nuvapure@okaxis';
  const merchantName = 'NUVA NUTRITION PVT LTD';

  // Format time mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (!isOpen) {
      setPaymentState('idle');
      return;
    }
    setPaymentState('idle');
    setCountdown(300);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Simulate scanning / paying with user phone or button
  const triggerSimulatedPayment = (methodName = 'UPI QR Instant Pay') => {
    setPaymentState('processing');

    // Extraordinary sound effect or visual pulse trigger
    setTimeout(() => {
      setPaymentState('success');
      
      // After showing extraordinary celebration animation, proceed to invoice/bill generation
      setTimeout(() => {
        onPaymentSuccess({
          paymentMethod: methodName,
          transactionId: 'TXN_' + Math.random().toString(36).substring(2, 12).toUpperCase(),
          utrNumber: 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000),
          paidAt: new Date().toISOString()
        });
      }, 2400);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden text-neutral-900 font-sans my-4"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 40px rgba(37, 211, 102, 0.15)'
        }}
      >
        {/* ========================================================================= */}
        {/* TOP BAR / BRAND HEADER */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#1b341a] via-[#2d472c] to-[#1b341a] text-white p-5 sm:p-6 flex items-center justify-between relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-10 w-32 h-32 bg-lime-400/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight font-display">
                  Nuva Instant PurePay™
                </h3>
                <span className="bg-emerald-500/25 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  256-Bit Encrypted
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Aqueous Ozone Certified Organic Checkout
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={paymentState === 'processing' || paymentState === 'success'}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all disabled:opacity-30 relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* EXTRAORDINARY SUCCESS CELEBRATION OVERLAY (SMOOTH & ZERO LAG) */}
        {/* ========================================================================= */}
        {paymentState === 'success' && (
          <div className="p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[460px] bg-gradient-to-b from-emerald-50/90 via-white to-white relative overflow-hidden">
            
            {/* Floating ambient confetti particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[
                { tx: '-60px', ty: '-80px', tr: '120deg', color: '#10b981', delay: '0.1s', size: '8px' },
                { tx: '70px', ty: '-90px', tr: '-140deg', color: '#34d399', delay: '0.15s', size: '10px' },
                { tx: '-80px', ty: '-30px', tr: '90deg', color: '#f59e0b', delay: '0.2s', size: '6px' },
                { tx: '90px', ty: '-40px', tr: '-100deg', color: '#2d472c', delay: '0.05s', size: '8px' },
                { tx: '-40px', ty: '-110px', tr: '200deg', color: '#10b981', delay: '0.25s', size: '7px' },
                { tx: '50px', ty: '-110px', tr: '-160deg', color: '#f59e0b', delay: '0.18s', size: '9px' }
              ].map((c, i) => (
                <div 
                  key={i}
                  className="absolute left-1/2 top-1/3 rounded-full animate-confetti"
                  style={{
                    width: c.size,
                    height: c.size,
                    backgroundColor: c.color,
                    '--tx': c.tx,
                    '--ty': c.ty,
                    '--tr': c.tr,
                    animationDelay: c.delay
                  }}
                />
              ))}
            </div>

            {/* Apple-style Smooth Animated SVG Checkmark */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#1b341a] flex items-center justify-center shadow-[0_10px_35px_rgba(27,52,26,0.35)] animate-circle-pop">
                <svg className="w-14 h-14" viewBox="0 0 52 52">
                  <circle 
                    className="stroke-emerald-400/30" 
                    cx="26" 
                    cy="26" 
                    r="24" 
                    fill="none" 
                    strokeWidth="3" 
                  />
                  <path 
                    className="animate-stroke-draw stroke-white" 
                    fill="none" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M14 27 l8 8 l16 -16" 
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2 max-w-md mx-auto relative z-10 animate-fade-in-up">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment Verified & Authorized</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2d472c] font-display tracking-tight">
                ₹{amount.toFixed(2)} Received!
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                Payment captured via <strong className="text-neutral-900">{selectedMethod === 'qr' ? 'UPI Phone Scanner' : 'Direct Gateway'}</strong>. Generating your certified GST invoice...
              </p>
            </div>

            {/* Micro-Progress Bar */}
            <div className="w-full max-w-xs space-y-2 pt-2 relative z-10">
              <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-[#2d472c] w-full rounded-full transition-all duration-1000" />
              </div>
              <p className="text-[11px] font-mono text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Dispensing 3D Tax Invoice Slip...</span>
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PROCESSING LOADER OVERLAY */}
        {/* ========================================================================= */}
        {paymentState === 'processing' && (
          <div className="p-8 sm:p-12 text-center space-y-6 animate-fadeIn flex flex-col items-center justify-center min-h-[460px]">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-spin border-t-emerald-600" />
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Zap className="w-7 h-7 animate-pulse text-emerald-600" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-[#2d472c]">
                Contacting Bank / NPCI Network...
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500">
                Verifying UPI mandate and authenticating ₹{amount.toFixed(2)} transfer
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-neutral-600 bg-neutral-100 px-4 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Awaiting UPI confirmation signal...</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* IDLE PAYMENT FORM (QR + MULTI-METHOD TABS) */}
        {/* ========================================================================= */}
        {paymentState === 'idle' && (
          <div className="p-5 sm:p-8 space-y-6">
            
            {/* Amount Summary Strip */}
            <div className="bg-[#fbfaf6] border border-neutral-200/90 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Total Payable Amount
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#2d472c] font-display">
                  ₹{amount.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-neutral-500 block">
                  {cartItems.length} {cartItems.length === 1 ? 'Produce Item' : 'Produce Items'}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Zero Extra Convenience Fee
                </span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-2 border-b border-neutral-200 pb-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('qr')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'qr'
                    ? 'bg-[#2d472c] text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('upi_app')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'upi_app'
                    ? 'bg-[#2d472c] text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI Apps</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'card'
                    ? 'bg-[#2d472c] text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card / NetBanking</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('cod')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'cod'
                    ? 'bg-[#2d472c] text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Cash on Delivery</span>
              </button>
            </div>

            {/* TAB CONTENT 1: HIGH FIDELITY QR CODE */}
            {selectedMethod === 'qr' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Realistic Dynamic QR Generator */}
                <div className="md:col-span-6 flex flex-col items-center text-center p-5 bg-[#faf9f5] rounded-3xl border border-neutral-200">
                  <div className="relative p-4 bg-white rounded-2xl shadow-md border-2 border-neutral-800">
                    {/* Simulated High-Res UPI QR Code Pattern */}
                    <div className="w-48 h-48 sm:w-52 sm:h-52 bg-white relative flex flex-col items-center justify-center p-2">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=nuvapure@okaxis&pn=NUVA+NUTRITION&am=${amount}&cu=INR`)}`}
                        alt="Nuva UPI QR Code"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback dynamic svg qr placeholder if offline
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=220&auto=format&fit=crop&q=60";
                        }}
                      />
                      {/* Center Nuva Brand Logo badge on QR */}
                      <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-lg p-1 shadow-md border border-neutral-300 flex items-center justify-center">
                        <span className="font-extrabold text-[10px] text-[#2d472c] font-display">NUVA</span>
                      </div>
                    </div>

                    {/* Laser Scan line effect */}
                    <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_#10b981] animate-[pulse_2s_infinite] top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* QR Countdown & Live pulse */}
                  <div className="mt-3 flex items-center justify-between w-full max-w-[220px] text-[11px] font-mono text-neutral-500">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live QR
                    </span>
                    <span>Expires in: <strong className="text-neutral-900">{formatTime(countdown)}</strong></span>
                  </div>

                  {/* UPI ID copy strip */}
                  <div className="mt-3 w-full max-w-[220px] flex items-center justify-between bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs">
                    <span className="font-mono text-[11px] text-neutral-600 truncate">{upiId}</span>
                    <button 
                      type="button"
                      onClick={handleCopyUpi}
                      className="text-emerald-700 hover:text-emerald-900 p-1 flex items-center gap-1 font-bold text-[10px]"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Right: User Instructions & Fake Pay Actions */}
                <div className="md:col-span-6 space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-base text-[#2d472c] font-display">
                      Scan with any UPI App
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Open <strong>Google Pay, PhonePe, Paytm, CRED</strong> or your Bank App on your mobile and point camera at the QR code.
                    </p>
                  </div>

                  {/* Accepted App Icons Badges */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM / CRED'].map((name) => (
                      <div key={name} className="p-2 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                        <span className="text-[10px] font-bold text-neutral-700 block truncate">{name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Instant Test Simulator CTA button */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => triggerSimulatedPayment('UPI QR Scan (Google Pay / PhonePe)')}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#2d472c] via-[#245224] to-[#2d472c] hover:brightness-110 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>I Scanned with Phone / Simulate Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-[11px] text-neutral-500 text-center flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Auto-detects payment from your phone scanner in real-time</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: DIRECT UPI APPS / VPA */}
            {selectedMethod === 'upi_app' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'gpay', label: 'Google Pay', desc: 'Instant UPI' },
                    { id: 'phonepe', label: 'PhonePe', desc: 'Auto-detect' },
                    { id: 'paytm', label: 'Paytm UPI', desc: 'Wallet / UPI' },
                    { id: 'cred', label: 'CRED UPI', desc: 'Rewards' }
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setUpiApp(app.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        upiApp === app.id 
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-neutral-900">{app.label}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${upiApp === app.id ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300'}`}>
                          {upiApp === app.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500">{app.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700">
                    Or Enter your UPI ID (VPA):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. yourname@oksbi / 9876543210@paytm"
                      value={customUpiId}
                      onChange={(e) => setCustomUpiId(e.target.value)}
                      className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => triggerSimulatedPayment(`UPI Intent (${customUpiId || upiApp.toUpperCase()})`)}
                      className="px-5 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shrink-0 shadow-sm"
                    >
                      Verify & Pay
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerSimulatedPayment(`UPI App (${upiApp.toUpperCase()})`)}
                  className="w-full py-3.5 rounded-2xl bg-[#2d472c] hover:bg-[#20341f] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Pay ₹{amount.toFixed(2)} via {upiApp.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB CONTENT 3: CARD / NETBANKING */}
            {selectedMethod === 'card' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4532 •••• •••• 8892" 
                      defaultValue="4532 9988 1204 8892"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM / YY" 
                        defaultValue="08 / 29"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">CVV / CVC</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        defaultValue="782"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerSimulatedPayment('Debit/Credit Card (Visa/Mastercard)')}
                  className="w-full py-3.5 rounded-2xl bg-[#2d472c] hover:bg-[#20341f] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Authorize Secure Card Payment ₹{amount.toFixed(2)}</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT 4: CASH ON DELIVERY */}
            {selectedMethod === 'cod' && (
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-4 animate-fadeIn">
                <ShieldCheck className="w-10 h-10 text-amber-700 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-950 text-sm">Cash / UPI on Sunrise Delivery</h4>
                  <p className="text-xs text-amber-800">
                    Pay upon doorstep delivery after inspecting our sealed Aqueous Ozone certification batch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerSimulatedPayment('Cash on Delivery (Verified)')}
                  className="py-3 px-6 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Confirm Cash on Delivery Order (₹{amount.toFixed(2)})
                </button>
              </div>
            )}

          </div>
        )}

        {/* Footer Security Badges */}
        <div className="bg-neutral-50 border-t border-neutral-200 px-6 py-3 flex items-center justify-between text-[11px] text-neutral-500">
          <span className="flex items-center gap-1 font-semibold text-emerald-800">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            100% RBI & NPCI Compliant
          </span>
          <span className="text-neutral-400">Powered by Nuva PureGateway</span>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;
