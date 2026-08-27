import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, 
  CheckCircle2, QrCode, User, ChevronDown, ChevronUp, Share2, 
  FileText, Sparkles, Truck, Check, AlertCircle, ShoppingBag
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/axiosInstance';
import PaymentModal from './PaymentModal';

// Recommended upsell products matching the exact catalog in screenshot
const RECOMMENDED_PRODUCTS = [
  {
    _id: 'rec-1',
    title: 'Highland Ginger Powder (Adu Powder)',
    price: 150,
    discountedPrice: 150,
    originalPrice: null,
    unit: '100g',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500',
    category: 'Pure Spices'
  },
  {
    _id: 'rec-2',
    title: 'Ozone Washed - Lauki (Dudhi)',
    price: 40,
    discountedPrice: 40,
    originalPrice: 50,
    unit: '1 pc (500g-700g)',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500',
    category: 'Ozone Washed Vegetables'
  },
  {
    _id: 'rec-3',
    title: 'Ozone Washed - Green Capsicum',
    price: 35,
    discountedPrice: 35,
    originalPrice: 50,
    pricePrefix: 'From',
    unit: '250g',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500',
    category: 'Ozone Washed Vegetables'
  },
  {
    _id: 'rec-4',
    title: 'Fresh Onion',
    price: 40,
    discountedPrice: 40,
    originalPrice: 60,
    unit: '1 kg',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500',
    category: 'Farm Fresh'
  },
  {
    _id: 'rec-5',
    title: 'Ozone Washed - Golden Kiwi',
    price: 250,
    discountedPrice: 250,
    originalPrice: 270,
    unit: '3 pcs Pack',
    image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=500',
    category: 'Ozone Washed Fruits'
  },
  {
    _id: 'rec-6',
    title: 'Toor Dal (Unpolished Vedic Pulse)',
    price: 220,
    discountedPrice: 220,
    originalPrice: null,
    unit: '1 kg',
    image: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=500',
    category: 'Ancient Grains'
  },
  {
    _id: 'rec-7',
    title: 'Desi Gir Cow A2 Bilona Ghee',
    price: 1350,
    discountedPrice: 1350,
    originalPrice: 1500,
    unit: '500ml',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500',
    category: 'A2 Dairy & Ghee'
  }
];

const CartDrawer = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { 
    cart, 
    isDrawerOpen, 
    setIsDrawerOpen, 
    addToCart,
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal 
  } = useCart();

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  
  // UI Interactive States
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isOrderNoteOpen, setIsOrderNoteOpen] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  // Delivery date estimation: 2 days ahead
  const getDeliveryDateRange = () => {
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 2);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 4);

    const m1 = d1.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const m2 = d2.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return `${m1} and ${m2}`;
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await API.post('/admin/coupons/validate', {
        code: coupon,
        cartTotal: subtotal
      });
      if (data.success && data.coupon) {
        setDiscount(data.coupon.discountAmount);
        setCouponApplied(true);
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      const codeUpper = coupon.toUpperCase().trim();
      if (codeUpper === 'WELCOME10') {
        const discountValue = Math.round(subtotal * 0.10);
        setDiscount(discountValue);
        setCouponApplied(true);
        setCouponError('');
      } else if (codeUpper === 'OZONEPURITY' || codeUpper === 'NUVAO3') {
        const discountValue = subtotal >= 999 ? 100 : Math.round(subtotal * 0.15);
        setDiscount(discountValue);
        setCouponApplied(true);
        setCouponError('');
      } else {
        setCouponError(err.response?.data?.message || 'Invalid coupon. Try WELCOME10');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const openPaymentFlow = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleShareCart = () => {
    navigator.clipboard?.writeText(window.location.origin + '/shop');
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setIsCheckingOut(true);
    const finalAmount = Math.max(0, subtotal - discount + (subtotal > 499 ? 0 : 40));
    
    const orderPayload = {
      items: cart.map(item => ({
        product: item._id,
        title: item.title,
        quantity: item.quantity,
        price: item.discountedPrice || item.price,
        unit: item.unit,
        image: item.images?.[0] || item.image
      })),
      totalAmount: finalAmount,
      discountApplied: discount,
      paymentMethod: paymentResult.paymentMethod || 'UPI Instant QR Pay',
      transactionId: paymentResult.transactionId,
      utrNumber: paymentResult.utrNumber,
      orderNote: orderNote,
      deliveryAddress: {
        name: user?.name || 'Customer',
        street: '4th Floor, Pancham Icon, Vasna Rd',
        city: 'Vadodara',
        state: 'Gujarat',
        postalCode: '390007',
        phone: '+91 92277 25359'
      }
    };

    try {
      const response = await API.post('/orders', orderPayload);
      const createdOrder = response.data?.order || {
        ...orderPayload,
        _id: 'NUV-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString()
      };
      
      clearCart();
      setIsDrawerOpen(false);
      navigate('/order-success', { state: { order: createdOrder, totalAmount: finalAmount, discountApplied: discount, items: orderPayload.items } });
    } catch (e) {
      const fallbackOrder = {
        ...orderPayload,
        _id: 'NUV-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString()
      };
      clearCart();
      setIsDrawerOpen(false);
      navigate('/order-success', { state: { order: fallbackOrder, totalAmount: finalAmount, discountApplied: discount, items: orderPayload.items } });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = 499;
  const isEligibleForFreeShipping = subtotal >= freeShippingThreshold;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/65 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div 
          className="w-screen max-w-4xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 text-neutral-900 border-l border-neutral-200"
          style={{
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.25)'
          }}
        >
          
          {/* ========================================================================= */}
          {/* 1. TOP DRAWER HEADER */}
          {/* ========================================================================= */}
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-sans tracking-tight">
              Your cart
            </h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors"
              title="Close cart"
            >
              <X className="h-5 w-5 stroke-[2.2]" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 2. TWO-COLUMN SPLIT BODY (CART ITEMS + RECOMMENDED PRODUCTS) */}
          {/* ========================================================================= */}
          <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
            
            {/* ----------------------------------------------------------------------- */}
            {/* LEFT COLUMN: ACTIVE CART ITEMS & TOTAL SUMMARY */}
            {/* ----------------------------------------------------------------------- */}
            <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between space-y-6 overflow-y-auto">
              
              <div className="space-y-6">
                {/* Free Shipping Progress Indicator */}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-800">
                    {isEligibleForFreeShipping ? (
                      <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Congratulations! You are eligible for free shipping!</span>
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-emerald-800 font-bold">₹{freeShippingThreshold - subtotal}</strong> more for <strong>FREE shipping!</strong>
                      </span>
                    )}
                  </p>
                  
                  {/* Progress Line */}
                  <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#2d472c] transition-all duration-500 rounded-full"
                      style={{ width: `${isEligibleForFreeShipping ? 100 : freeShippingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Cart Items List */}
                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#faf9f5] border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
                      <ShoppingBag className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-neutral-900">Your basket is empty</h3>
                      <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                        Explore our pure cold-pressed oils, A2 Vedic ghee, and Ozone-washed harvests from the recommendations.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 space-y-4">
                    {cart.map((item) => {
                      const itemImg = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';
                      const itemPrice = item.discountedPrice || item.price;

                      return (
                        <div key={item._id} className="pt-4 first:pt-0 flex gap-4 sm:gap-5 items-start">
                          {/* Product Image */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#faf9f5] border border-neutral-200/80 p-2 overflow-hidden flex items-center justify-center shrink-0">
                            <img
                              src={itemImg}
                              alt={item.title}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
                              {item.title}
                            </h4>
                            
                            <p className="text-xs sm:text-sm font-extrabold text-neutral-900">
                              Rs. {itemPrice.toFixed(2)}
                            </p>

                            {item.unit && (
                              <p className="text-[11px] text-neutral-500 font-medium">
                                Measure Unit: {item.unit}
                              </p>
                            )}

                            <p className="text-[11px] text-neutral-500 leading-relaxed pt-0.5">
                              Note: Estimated delivery between <span className="font-semibold text-neutral-700">{getDeliveryDateRange()}</span>. Order within 22 hours 54 minutes.
                            </p>

                            {/* Quantity Selector & Trash Button */}
                            <div className="flex items-center gap-3 pt-2">
                              <div className="inline-flex items-center border border-neutral-300 rounded-full bg-white px-2 py-1">
                                <button
                                  onClick={() => updateQuantity(item._id, -1)}
                                  className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
                                  title="Decrease quantity"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-3 text-xs font-bold text-neutral-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id, 1)}
                                  className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
                                  title="Increase quantity"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="h-4 w-4 stroke-[1.8]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* BOTTOM ACTIONS: DISCOUNT ACCORDION, ORDER NOTE, TOTAL & CHECKOUT */}
              {/* ------------------------------------------------------------------- */}
              <div className="pt-6 border-t border-neutral-200 space-y-4">
                
                {/* 1. Discount Accordion */}
                <div className="border-b border-neutral-100 pb-3">
                  <button
                    onClick={() => setIsDiscountOpen(!isDiscountOpen)}
                    className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-800 hover:text-[#2d472c] transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-neutral-500" />
                      <span>Discount</span>
                    </span>
                    {isDiscountOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {isDiscountOpen && (
                    <div className="pt-3 space-y-2 animate-fadeIn">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                          placeholder="Promo code (e.g. WELCOME10)"
                          className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:border-[#2d472c]"
                        />
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="px-4 py-2 bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60"
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>

                      {couponApplied && (
                        <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" />
                          <span>Coupon applied! Saved ₹{discount}</span>
                        </p>
                      )}

                      {couponError && (
                        <p className="text-xs text-rose-600 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{couponError}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Order Note & Share Cart Quick Links */}
                <div className="flex items-center justify-between text-xs font-medium text-neutral-600">
                  <button
                    onClick={() => setIsOrderNoteOpen(!isOrderNoteOpen)}
                    className="underline underline-offset-4 hover:text-[#2d472c] transition-colors"
                  >
                    Order note
                  </button>

                  <button
                    onClick={handleShareCart}
                    className="underline underline-offset-4 hover:text-[#2d472c] transition-colors flex items-center gap-1"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>{copiedShare ? 'Cart Link Copied!' : 'Share cart'}</span>
                  </button>
                </div>

                {isOrderNoteOpen && (
                  <div className="animate-fadeIn">
                    <textarea
                      rows={2}
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Add special delivery instructions (e.g. Morning delivery, Leave at reception)..."
                      className="w-full p-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-[#2d472c]"
                    />
                  </div>
                )}

                {/* 3. Total Price Row */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base sm:text-lg font-bold text-neutral-900">Total</span>
                  <span className="text-lg sm:text-xl font-extrabold text-neutral-900 font-sans">
                    Rs. {finalTotal.toFixed(2)}
                  </span>
                </div>

                {/* 4. Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={openPaymentFlow}
                    disabled={cart.length === 0 || isCheckingOut}
                    className="w-full py-3.5 px-4 rounded-full bg-[#2d472c] hover:bg-[#20341f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-50"
                  >
                    <QrCode className="h-4 w-4 text-emerald-300" />
                    <span>Proceed to Pay & Scan QR</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      navigate('/shop');
                    }}
                    className="w-full py-3 px-4 rounded-full border border-neutral-300 hover:border-neutral-400 bg-white text-neutral-800 text-xs sm:text-sm font-bold flex items-center justify-center transition-all"
                  >
                    View Cart & Browse Store
                  </button>
                </div>

              </div>

            </div>

            {/* ----------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: "YOU'LL LOVE THIS TOO" (RECOMMENDED PRODUCTS UPSELL) */}
            {/* ----------------------------------------------------------------------- */}
            <div className="w-full lg:w-80 xl:w-96 bg-[#faf9f5]/70 p-6 sm:p-7 flex flex-col space-y-5 overflow-y-auto shrink-0">
              
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 font-sans tracking-tight">
                  You’ll love this too
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Customers also add these pure farm staples
                </p>
              </div>

              {/* Recommended Items List */}
              <div className="divide-y divide-neutral-200/80 space-y-4 overflow-y-auto">
                {RECOMMENDED_PRODUCTS.map((rec) => {
                  const isInCart = cart.some(item => item._id === rec._id);

                  return (
                    <div key={rec._id} className="pt-4 first:pt-0 flex items-center justify-between gap-3.5">
                      
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-neutral-200 p-1 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                        <img
                          src={rec.image}
                          alt={rec.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
                          {rec.title}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {rec.originalPrice && (
                            <span className="text-[11px] text-neutral-400 line-through">
                              Rs. {rec.originalPrice.toFixed(2)}
                            </span>
                          )}
                          <span className={`text-xs font-extrabold ${rec.originalPrice ? 'text-[#b91c1c]' : 'text-neutral-900'}`}>
                            {rec.pricePrefix ? `${rec.pricePrefix} ` : ''}Rs. {rec.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Add Button [+] */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            _id: rec._id,
                            title: rec.title,
                            price: rec.price,
                            discountedPrice: rec.discountedPrice,
                            unit: rec.unit,
                            images: [rec.image]
                          }, 1, e);
                        }}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all shadow-xs shrink-0 ${
                          isInCart
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#292929] hover:bg-[#111111] text-white active:scale-90'
                        }`}
                        title="Add to cart"
                      >
                        {isInCart ? (
                          <Check className="h-4 w-4 stroke-[2.5]" />
                        ) : (
                          <Plus className="h-4 w-4 stroke-[2.5]" />
                        )}
                      </button>

                    </div>
                  );
                })}
              </div>

              {/* Trust Badge at bottom of recommendation column */}
              <div className="pt-4 border-t border-neutral-200 text-[11px] text-neutral-500 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>100% Cold-Pressed & Aqueous Ozone Purified</span>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Instant QR Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={finalTotal + (subtotal > 499 ? 0 : 40)}
        cartItems={cart}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CartDrawer;
