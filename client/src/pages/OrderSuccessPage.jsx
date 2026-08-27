import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, CreditCard, ShieldCheck, Download, Sparkles, 
  Receipt, ArrowRight, Printer, RefreshCw, ShoppingBag, Truck, Check, Lock, ChevronRight, QrCode
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccessPage = () => {
  const location = useLocation();
  
  // Stages: 'printing' (continuous 60fps mechanical slide) -> 'completed'
  const [stage, setStage] = useState('printing'); 
  const [printProgress, setPrintProgress] = useState(0); // 0 to 100 smooth float

  // Retrieve order or fallback to simulated data
  const stateData = location.state || {};
  const orderDetails = stateData.order || {
    _id: 'NUV-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString(),
    totalAmount: stateData.totalAmount || 1240,
    discountApplied: stateData.discountApplied || 180,
    items: stateData.items || [
      { title: 'A2 Vedic Bilona Cow Ghee (Glass Jar)', quantity: 1, price: 950, unit: '500 ml', hsn: '040520' },
      { title: 'Ozone-Washed Shimla Royal Delicious Apples', quantity: 2, price: 235, unit: '1 kg', hsn: '080810' }
    ],
    deliveryAddress: stateData.deliveryAddress || {
      name: 'Jay Jadav',
      street: '4th Floor, Pancham Icon, Vasna Rd',
      city: 'Vadodara',
      state: 'Gujarat',
      postalCode: '390007',
      phone: '+91 92277 25359'
    },
    paymentMethod: stateData.paymentMethod || 'UPI Instant QR Pay',
    transactionId: stateData.transactionId || ('TXN_' + Math.random().toString(36).substring(2, 11).toUpperCase())
  };

  // Detailed realistic Indian retail tax charges breakdown
  const rawSubtotal = orderDetails.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const discountVal = orderDetails.discountApplied || 0;
  const taxableAmount = Math.max(0, rawSubtotal - discountVal);
  const cgst = Math.round(taxableAmount * 0.025 * 100) / 100; // 2.5% CGST
  const sgst = Math.round(taxableAmount * 0.025 * 100) / 100; // 2.5% SGST
  const ozoneDisinfectionFee = 25.00;
  const ecoInsulatedPackagingFee = 35.00;
  const packagingDiscount = -35.00; // Free eco packaging promo
  const deliveryCharges = rawSubtotal > 499 ? 0.00 : 40.00;
  const roundedTotal = Math.round(taxableAmount + cgst + sgst + ozoneDisinfectionFee + (deliveryCharges || 0));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Continuous 60fps mechanical paper rollout animation
  useEffect(() => {
    if (stage !== 'printing') return;

    let startTime = null;
    const duration = 3200; // 3.2 seconds mechanical rollout
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      
      setPrintProgress(progress);

      if (progress < 100) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setTimeout(() => setStage('completed'), 800);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [stage]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f1eee4] text-neutral-900 font-sans pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* STAGE 2: ULTRA REALISTIC 3D THERMAL PRINTER & CONTINUOUS MECHANICAL ROLLOUT */}
        {/* ========================================================================= */}
        {stage === 'printing' && (
          <div className="no-print bg-white rounded-3xl p-6 sm:p-10 text-center shadow-2xl border border-neutral-200/90 max-w-2xl mx-auto space-y-6 animate-fadeIn">
            
            {/* Top Status Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>3D POS Printer Dispensing Tax Invoice...</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#2d472c]">
                {Math.round(printProgress)}% EJECTED
              </span>
            </div>

            {/* Realistic 3D POS Mechanical Station with Perspective View */}
            <div className="relative mx-auto w-full max-w-md flex flex-col items-center py-4 select-none" style={{ perspective: '1000px' }}>
              
              {/* 3D Machine Chassis */}
              <div 
                className="w-80 sm:w-96 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] border-4 border-neutral-700 p-4 flex flex-col justify-between relative z-30 transform hover:rotate-x-2 transition-transform"
                style={{
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)'
                }}
              >
                {/* Machine Screen & LCD Status */}
                <div className="bg-neutral-950 rounded-xl p-2.5 border border-neutral-700/80 mb-3 flex items-center justify-between font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>FEEDING PAPER · INV-{orderDetails._id}</span>
                  </div>
                  <span className="text-neutral-400 text-[10px]">250 mm/s</span>
                </div>

                {/* Laser Cutter / Thermal Roller Output Slot */}
                <div className="relative w-full h-3.5 bg-neutral-950 rounded-full border-2 border-neutral-700 shadow-inner flex items-center justify-center overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_12px_#34d399]" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-2">
                  <span>NUVA-THERMAL 3D PRO</span>
                  <span className="text-emerald-400">● 100% PURE HARVEST</span>
                </div>
              </div>

              {/* SLIDING PAPER DISPENSE TRAY WITH 3D DROP SHADOW & PERFORATION */}
              <div 
                className="w-72 sm:w-84 -mt-3 bg-[#ffffff] border-x-2 border-b-2 border-dashed border-neutral-300 shadow-[0_25px_35px_rgba(0,0,0,0.18)] rounded-b-2xl overflow-hidden text-left text-neutral-800 z-20 font-mono transition-none relative"
                style={{
                  height: `${(printProgress / 100) * 520}px`,
                  maxHeight: '520px',
                }}
              >
                <div className="p-4 space-y-3 text-[10px] leading-tight">
                  <div className="text-center border-b border-dashed border-neutral-300 pb-2">
                    <h3 className="font-bold text-xs tracking-wider text-[#2d472c]">NUVA NUTRITION</h3>
                    <p className="text-[8px] text-neutral-400">FSSAI Lic: 10721024000189 · GSTIN: 24AAACN1234F1Z5</p>
                    <p className="text-[8.5px] font-bold text-neutral-600">INVOICE: INV-{orderDetails._id}</p>
                  </div>

                  <div className="space-y-1">
                    {orderDetails.items.map((it, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="truncate max-w-[140px]">{it.title}</span>
                        <span>{it.quantity}x ₹{it.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-neutral-300 pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold">₹{rawSubtotal}</span>
                    </div>
                    {discountVal > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Discount</span>
                        <span>-₹{discountVal}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-xs pt-1 border-t border-neutral-900">
                      <span>TOTAL PAID</span>
                      <span>₹{roundedTotal}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <p className="text-xs text-neutral-500 italic pt-1">
              Dispensing authentic thermal GST invoice slip...
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: ORDER SUCCESS + FULL 3D BILL RECEIPT DISPLAY */}
        {/* ========================================================================= */}
        {stage === 'completed' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top Success Banner */}
            <div className="no-print bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#2d472c] font-display">
                      Order Placed Successfully!
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                      Paid & Verified
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    Thank you! Your order <span className="font-mono font-bold text-neutral-800">#{orderDetails._id}</span> is confirmed and scheduled for sunrise harvest dispatch.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 shadow-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <Link
                  to="/shop"
                  className="px-5 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span>Explore More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 3D Realistic Bill / Invoice Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left 7 Columns: 3D Paper Thermal Tax Invoice (Print Target) */}
              <div className="lg:col-span-7 relative printable-invoice-container">
                
                {/* 3D Shadow Backdrop Card (Hidden on Print) */}
                <div className="no-print absolute inset-0 bg-neutral-800 rounded-3xl transform rotate-1 translate-y-2 opacity-10 blur-[2px]" />
                
                {/* The Paper Bill */}
                <div className="printable-invoice-card relative bg-[#ffffff] rounded-3xl p-6 sm:p-10 border border-neutral-300/80 shadow-xl space-y-6 text-xs sm:text-sm text-neutral-800">
                  
                  {/* Bill Top Header */}
                  <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-5">
                    <div>
                      <h2 className="text-2xl font-black text-[#2d472c] font-display tracking-tight">
                        NUVA NUTRITION
                      </h2>
                      <p className="text-[11px] text-neutral-500 font-sans">
                        Pvt. Ltd. · FSSAI Lic. No: 10721024000189
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        4th floor, Pancham Icon, Vasna Rd, Vadodara, Gujarat 390007
                      </p>
                    </div>

                    <div className="text-right font-mono space-y-0.5">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-neutral-900 text-white text-[10px] font-bold">
                        TAX INVOICE
                      </span>
                      <p className="text-[11px] font-bold text-neutral-800 pt-1">
                        INV-{orderDetails._id}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {new Date(orderDetails.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Billed To / Shipping Address Strip */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#faf9f5] border border-neutral-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Billed To
                      </span>
                      <p className="font-bold text-neutral-900">{orderDetails.deliveryAddress?.name || 'Customer'}</p>
                      <p className="text-neutral-600">{orderDetails.deliveryAddress?.street}</p>
                      <p className="text-neutral-600">{orderDetails.deliveryAddress?.city}, {orderDetails.deliveryAddress?.state} - {orderDetails.deliveryAddress?.postalCode}</p>
                      <p className="text-neutral-500 font-mono text-[11px]">{orderDetails.deliveryAddress?.phone}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Payment & Ozone Batch
                      </span>
                      <p className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {orderDetails.paymentMethod}
                      </p>
                      <p className="text-neutral-500 font-mono text-[10px] mt-0.5">
                        Txn ID: {orderDetails.transactionId}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3" /> Triple O₃ Ozone Disinfected
                      </div>
                    </div>
                  </div>

                  {/* Purchased Items Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 font-bold text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-200 pb-2">
                      <span className="col-span-6">Item Description</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-2 text-right">Price</span>
                      <span className="col-span-2 text-right">Total</span>
                    </div>

                    <div className="divide-y divide-neutral-100">
                      {orderDetails.items?.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 py-2.5 text-xs items-center">
                          <div className="col-span-6 pr-2">
                            <p className="font-bold text-neutral-900">{item.title}</p>
                            {item.unit && <p className="text-[10px] text-neutral-400">Unit: {item.unit}</p>}
                          </div>
                          <span className="col-span-2 text-center font-mono text-neutral-600">{item.quantity}</span>
                          <span className="col-span-2 text-right font-mono text-neutral-600">₹{item.price}</span>
                          <span className="col-span-2 text-right font-mono font-bold text-neutral-900">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complete List of Charges & Indian Tax Breakdown */}
                  <div className="border-t-2 border-dashed border-neutral-300 pt-4 space-y-2 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span>Item Subtotal</span>
                      <span className="font-mono font-medium">₹{rawSubtotal}</span>
                    </div>
                    {discountVal > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Purity Welcome Discount (WELCOME10)</span>
                        <span className="font-mono">-₹{discountVal}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Aqueous Ozone (O₃) Disinfection Batch Fee</span>
                      <span className="font-mono text-neutral-900 font-medium">₹{ozoneDisinfectionFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eco-Kraft Insulated Packaging</span>
                      <span className="font-mono text-emerald-700 font-bold">FREE (Promotional)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Central GST (CGST @ 2.5%)</span>
                      <span className="font-mono">₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State GST (SGST @ 2.5%)</span>
                      <span className="font-mono">₹{sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunrise Farm Express Logistics</span>
                      <span className="font-mono text-emerald-700 font-bold">{deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}</span>
                    </div>
                    
                    {/* Final Net Amount */}
                    <div className="flex justify-between text-base sm:text-lg font-black text-neutral-900 border-t-2 border-neutral-900 pt-3">
                      <span>Total Amount Paid</span>
                      <span className="font-mono text-[#2d472c]">₹{roundedTotal}</span>
                    </div>
                  </div>

                  {/* Stamp / Watermark Badge */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-neutral-900">Guaranteed Chemical-Free</p>
                        <p className="text-[9px] text-neutral-400">100% Living Soil Sourced</p>
                      </div>
                    </div>

                    <div className="border-2 border-emerald-600/40 rounded-lg px-3 py-1 text-emerald-700 font-black text-[10px] tracking-widest uppercase transform -rotate-3">
                      ORIGINAL INVOICE
                    </div>
                  </div>

                </div>
              </div>

              {/* Right 5 Columns: Live Delivery Tracker & Next Steps (Hidden on Print) */}
              <div className="no-print lg:col-span-5 space-y-6">
                
                {/* Live Delivery Timeline Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md space-y-6">
                  <h3 className="text-base font-bold text-[#2d472c] font-display flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Live Harvest & Delivery Stage</span>
                  </h3>

                  <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                    {/* Step 1 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </div>
                      <p className="text-xs font-bold text-neutral-900">Payment & Order Verified</p>
                      <p className="text-[11px] text-neutral-400">Transaction ID registered with farm logistics</p>
                    </div>

                    {/* Step 2 (Active) */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-100 border-2 border-emerald-600 text-emerald-700 flex items-center justify-center text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                      </div>
                      <p className="text-xs font-bold text-emerald-800">4-Stage O₃ Ozone Bath</p>
                      <p className="text-[11px] text-neutral-500">Scheduled for sunrise harvest micro-bubbling rinse</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center text-[10px]">
                        3
                      </div>
                      <p className="text-xs font-bold text-neutral-400">Eco-Kraft Temperature Packaging</p>
                      <p className="text-[11px] text-neutral-400">Packed in biodegradable insulated bags</p>
                    </div>

                    {/* Step 4 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center text-[10px]">
                        4
                      </div>
                      <p className="text-xs font-bold text-neutral-400">Dispatched to Doorstep</p>
                      <p className="text-[11px] text-neutral-400">Estimated delivery: Tomorrow morning before 10:00 AM</p>
                    </div>
                  </div>

                  {/* Primary Track Order Action Button */}
                  <div className="pt-2">
                    <Link
                      to={`/track-order/${orderDetails._id}`}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#2d472c] hover:bg-[#223821] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      <Truck className="h-4 w-4 text-emerald-300" />
                      <span>Track Order & Live Telemetry</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Need Help Card */}
                <div className="bg-[#f2efe9] rounded-3xl p-6 border border-neutral-200 text-xs space-y-3">
                  <h4 className="font-bold text-neutral-900">Have questions about your harvest?</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Our team in Vadodara is ready to help with delivery timing, special handling, or custom farm subscriptions.
                  </p>
                  <div className="pt-1 font-semibold text-[#2d472c] space-y-1">
                    <p>Hotline: <a href="tel:+919227725359" className="underline">+91 92277 25359</a></p>
                    <p>Email: <a href="mailto:support@thenuva.com" className="underline">support@thenuva.com</a></p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default OrderSuccessPage;
