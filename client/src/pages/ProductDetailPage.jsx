import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ShieldCheck, Sparkles, Check, ShoppingBag, Truck, Heart, 
  ChevronDown, ChevronUp, Share2, Plus, Minus, ArrowUp, ThumbsUp, Camera, MessageCircle, QrCode, Smartphone
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import API from '../api/axiosInstance';
import PaymentModal from '../components/common/PaymentModal';
import { ProductDetailPageSkeleton } from '../components/common/Skeleton';

const FAQ_DATA = [
  {
    q: 'How is this product purified before dispatch?',
    a: 'Every single batch passes through our medical-grade aqueous Ozone (O₃) micro-bubble chamber and RO wash. This eliminates 99.9% of surface pesticides, heavy metals, mold, and pathogens without any heat or chemicals.'
  },
  {
    q: 'How does the WELCOME10 coupon work?',
    a: 'Simply enter coupon code WELCOME10 in the checkout promo box. You will immediately receive 10% off your entire first purchase.'
  },
  {
    q: 'How long will this stay fresh at home?',
    a: 'Because our produce is cleaned thoroughly and packaged in breathable, zero-plastic bio-film, it stays crisp and nutritious for 3 to 5 days longer than standard market produce.'
  },
  {
    q: 'What is your freshness guarantee?',
    a: 'We offer a 100% money-back or instant replacement guarantee. If you are not satisfied with the crunch and quality, message us on WhatsApp within 24 hours.'
  }
];

const INITIAL_REVIEWS = [
  {
    id: 1,
    author: 'Aarav Mehta',
    verified: true,
    rating: 5,
    date: '2 days ago',
    title: 'Incredible aroma and absolute pure crunch!',
    body: 'The difference in purity is immediately noticeable. There is zero chemical smell or oily residue. Tastes like real food from my village days.',
    helpful: 38,
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 2,
    author: 'Pooja Sharma',
    verified: true,
    rating: 5,
    date: '5 days ago',
    title: 'Safe for my toddlers and family',
    body: 'Knowing this is triple ozone-washed and lab-tested gives me complete peace of mind. Very high standard of packaging as well.',
    helpful: 24,
    images: [
      'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 3,
    author: 'Vikramaditya Patel',
    verified: true,
    rating: 5,
    date: '1 week ago',
    title: 'Worth every rupee',
    body: 'The farm-to-table delivery was swift in Vadodara. The freshness is unbeatable. Will be subscribing for weekly orders!',
    helpful: 19,
    images: []
  }
];

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTab, setActiveTab] = useState('purity'); // 'purity' | 'nutrition' | 'reviews' | 'faq'
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [faqsList, setFaqsList] = useState(FAQ_DATA);
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    author: '',
    email: '',
    rating: 5,
    title: '',
    body: ''
  });

  const VARIANTS = [
    { title: '500ml jar', label: '500ml jar', multiplier: 0.55, rateText: '₹2090/L' },
    { title: '1L jar', label: '1L jar', multiplier: 1.0, rateText: '₹2025/L' },
    { title: '2.5L Dolchi', label: '2.5L Dolchi', multiplier: 2.4, rateText: '₹2232/L', discountTag: '7% off', originalMultiplier: 2.6 },
    { title: '5L Dolchi', label: '5L Dolchi', multiplier: 4.6, rateText: '₹2020/L' }
  ];

  const handleBuyNowSuccess = (paymentResult) => {
    setIsBuyNowModalOpen(false);
    const activeVar = VARIANTS[selectedVariantIndex];
    const unitPrice = Math.round((product.discountedPrice || product.price) * activeVar.multiplier);
    const finalPrice = unitPrice * quantity;
    const finalAmount = Math.max(0, finalPrice + (finalPrice > 499 ? 0 : 40));

    const orderPayload = {
      _id: 'NUV-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      items: [
        {
          product: product._id,
          title: product.title,
          quantity: quantity,
          price: unitPrice,
          unit: activeVar.title
        }
      ],
      totalAmount: finalAmount,
      discountApplied: 0,
      paymentMethod: paymentResult.paymentMethod || 'UPI QR Instant Pay',
      transactionId: paymentResult.transactionId,
      utrNumber: paymentResult.utrNumber,
      deliveryAddress: {
        street: 'Direct Dispatch Address',
        city: 'Vadodara',
        state: 'Gujarat',
        postalCode: '390007'
      },
      orderStatus: 'Order Placed',
      paymentStatus: 'Paid',
      currentStage: 1
    };

    try {
      const existing = JSON.parse(localStorage.getItem('nuva_local_orders') || '[]');
      existing.unshift(orderPayload);
      localStorage.setItem('nuva_local_orders', JSON.stringify(existing));
    } catch (e) {}

    navigate(`/order-success?orderId=${orderPayload._id}`);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/products/${id}`);
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          // Fallback load product
          const raw = localStorage.getItem('nuva_offline_products');
          if (raw) {
            const list = JSON.parse(raw);
            const found = list.find(p => p._id === id || p.slug === id || p.id === id);
            if (found) setProduct(found);
          }
        }
      } catch (e) {
        const raw = localStorage.getItem('nuva_offline_products');
        if (raw) {
          try {
            const list = JSON.parse(raw);
            const found = list.find(p => p._id === id || p.slug === id || p.id === id);
            if (found) setProduct(found);
          } catch (err) {}
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchRelated = async () => {
      try {
        const { data } = await API.get('/products?limit=4');
        if (data.success && data.products) {
          setRelatedProducts(data.products.filter(p => p._id !== id).slice(0, 4));
        }
      } catch (e) {}
    };

    const fetchFaqs = async () => {
      try {
        const { data } = await API.get('/admin/faqs/public');
        if (data.success && data.faqs && data.faqs.length > 0) {
          setFaqsList(data.faqs.map(f => ({
            q: f.question,
            a: f.answer
          })));
        }
      } catch (e) {}
    };

    fetchProduct();
    fetchRelated();
    fetchFaqs();
  }, [id]);

  const [uploadedReviewImages, setUploadedReviewImages] = useState([]);

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setUploadedReviewImages(prev => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (index) => {
    setUploadedReviewImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.author || !newReview.title || !newReview.body) {
      alert('Please fill out all required fields');
      return;
    }
    const created = {
      id: Date.now(),
      author: newReview.author,
      verified: true,
      rating: newReview.rating,
      date: 'Just now',
      title: newReview.title,
      body: newReview.body,
      helpful: 0,
      images: [...uploadedReviewImages]
    };
    setReviews([created, ...reviews]);
    setShowReviewForm(false);
    setNewReview({ author: '', email: '', rating: 5, title: '', body: '' });
    setUploadedReviewImages([]);
    alert('Thank you! Your verified review with photos has been published.');
  };

  if (loading || !product) {
    return <ProductDetailPageSkeleton />;
  }

  const basePrice = product.discountedPrice || product.price || 499;
  const activeVariant = VARIANTS[selectedVariantIndex];
  const variantPrice = Math.round(basePrice * activeVariant.multiplier);
  const variantOriginalPrice = activeVariant.originalMultiplier 
    ? Math.round(basePrice * activeVariant.originalMultiplier) 
    : Math.round(variantPrice * 1.2);
  const variantDiscount = Math.round(((variantOriginalPrice - variantPrice) / variantOriginalPrice) * 100);

  return (
    <div className="bg-white font-sans text-neutral-900 pb-20">
      
      {/* Breadcrumbs Row */}
      <div className="bg-[#f7f6f2] py-2.5 px-4 sm:px-6 lg:px-8 border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-neutral-600 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#2d472c] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#2d472c] transition-colors">{product.category || 'Catalog'}</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium truncate">{product.title}</span>
        </div>
      </div>

      {/* 1. HERO PRODUCT SECTION (Exact Structure of Provided Reference Image) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery with Big Preview & Bottom Horizontal Thumbnails */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Big Main Showcase Image Box */}
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-[#faf9f5] border border-neutral-200/80 p-8 flex items-center justify-center group shadow-sm">
              <img
                src={product.images?.[selectedImage] || product.images?.[0]}
                alt={product.title}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 select-none"
              />
              
              {/* Ozone Batch Tag */}
              {product.isOzoneWashed && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[#2d472c] text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-md">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                  <span>O₃ Aqueous Washed</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row Below Main Image */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {(product.images?.length > 0 ? product.images : [product.images?.[0]]).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-20 w-20 rounded-2xl overflow-hidden bg-[#faf9f5] p-2 border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === idx ? 'border-[#2d472c] shadow-md scale-105' : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}

              {/* Lab Test Certification Thumbnail Card */}
              <div 
                onClick={() => setSelectedImage(0)}
                className="h-20 w-24 rounded-2xl border border-neutral-200 bg-[#f4f7f4] p-1.5 flex flex-col items-center justify-center text-center shrink-0 cursor-pointer hover:border-[#2d472c]"
              >
                <ShieldCheck className="w-5 h-5 text-[#2d472c] mb-0.5" />
                <span className="text-[9px] font-black text-[#2d472c] leading-tight">70+ Quality Checks</span>
                <span className="text-[8px] text-neutral-500">0% Compromise</span>
              </div>
            </div>
          </div>

          {/* Right Column: Structured Buying Deck Matching Reference */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title & Headline */}
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2d472c] bg-[#e7e3d8] px-3 py-1 rounded-full">
                {product.category || 'Vedic Organic Essentials'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2d472c] font-display tracking-tight mt-2.5 leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Select Variant Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-800">
                  Select Variant
                </span>
              </div>

              {/* 4 Variant Cards in 1 Horizontal Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {VARIANTS.map((variant, idx) => {
                  const isSelected = selectedVariantIndex === idx;
                  const price = Math.round(basePrice * variant.multiplier);
                  const origPrice = variant.originalMultiplier 
                    ? Math.round(basePrice * variant.originalMultiplier) 
                    : null;

                  return (
                    <button
                      key={variant.title}
                      type="button"
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`relative p-3 rounded-2xl text-left border-2 transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? 'border-[#2d472c] bg-[#f4f7f4] shadow-sm' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      {/* Top Header Tag inside Button */}
                      <div className="w-full pb-1 mb-1 border-b border-neutral-100 flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-[#2d472c]' : 'text-neutral-700'}`}>
                          {variant.label}
                        </span>
                      </div>

                      {/* Pricing Block */}
                      <div className="space-y-0.5 mt-1">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-sm sm:text-base font-extrabold text-[#2d472c]">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          {origPrice && (
                            <span className="text-[10px] text-neutral-400 line-through">
                              ₹{origPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {variant.discountTag && (
                            <span className="text-[9px] font-bold text-rose-600">
                              {variant.discountTag}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-medium block">
                          {variant.rateText}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unlock 17% OFF App Promo Banner Box */}
            <div className="p-3.5 rounded-2xl bg-[#eef6f0] border border-emerald-300/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#2d472c] text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-[#2d472c] block">
                    Unlock 17% OFF (15% + 2% extra on APP-only)
                  </span>
                  <span className="text-[11px] text-neutral-600">
                    Use code: <strong className="text-emerald-900 font-mono">APP17</strong> or <strong className="text-emerald-900 font-mono">WELCOME10</strong>
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-bold uppercase shrink-0">
                ACTIVE
              </span>
            </div>

            {/* Quantity Selector, Add to Cart, and Buy Now (Exact 3-Block Row) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              
              {/* Stepper Quantity Counter */}
              <div className="flex items-center justify-between sm:justify-center border-2 border-neutral-200 rounded-2xl bg-neutral-50 px-3 py-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-neutral-600 hover:text-black transition-colors cursor-pointer"
                >
                  <Minus className="h-4 w-4 stroke-[2.5]" />
                </button>
                <span className="px-4 text-sm font-extrabold text-neutral-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 text-neutral-600 hover:text-black transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={(e) => {
                  addToCart({ 
                    ...product, 
                    price: variantPrice, 
                    unit: activeVariant.title 
                  }, quantity, e);
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#1e4b3e] hover:bg-[#15382e] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span>Add to cart</span>
              </button>

              {/* Buy Now Button (Bright Amber / Golden Accent Matching Reference) */}
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    openAuthModal('login');
                    return;
                  }
                  setIsBuyNowModalOpen(true);
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#e6ab09] hover:bg-[#d49d06] text-neutral-950 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* PRODUCT DESCRIPTION SECTION */}
            <div className="pt-6 border-t border-neutral-200 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                PRODUCT DESCRIPTION
              </h2>
              <div className="text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-3">
                <p>
                  {product.description || `This is the organic harvest your grandmother would trust. Our pure produce comes directly from verified smallholder partner farms in Gujarat, harvested at sunrise and never injected with artificial hormones or ripening chemicals.`}
                </p>
                <p>
                  Every batch is lab-tested through multi-stage gas chromatography, and every dispatch carries our medical-grade aqueous ozone purification guarantee. 0.00 PPM chemical residue, 100% peace of mind.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. VALUE PILLARS (4 Icons Grid) */}
      <section className="bg-[#fbfaf6] py-14 px-4 sm:px-6 lg:px-8 border-y border-neutral-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2d472c] font-display">
              The Nuva Purity Difference
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-sm space-y-2 text-center">
              <div className="h-12 w-12 rounded-full bg-[#eaf4ec] text-[#2d472c] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Aqueous O₃ Washed</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Neutralizes 99.9% of bacteria, mold spores, and pesticide residues without heat or wax.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-sm space-y-2 text-center">
              <div className="h-12 w-12 rounded-full bg-[#eaf4ec] text-[#2d472c] flex items-center justify-center mx-auto mb-3">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Direct From Soil</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Harvested directly from certified Gujarat partner farms to your home in under 12 hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-sm space-y-2 text-center">
              <div className="h-12 w-12 rounded-full bg-[#eaf4ec] text-[#2d472c] flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">HPLC Lab Tested</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Zero synthetic pesticides or artificial ripening agents verified by gas chromatography.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-sm space-y-2 text-center">
              <div className="h-12 w-12 rounded-full bg-[#eaf4ec] text-[#2d472c] flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-rose-500" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">₹1 To Agri-Tech</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Every order funds sustainable equipment and living soil education for smallholder farmers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIDE-BY-SIDE COMPARISON TABLE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2d472c] font-display">
            How Nuva Compares to Market Produce
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-md">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#2d472c] text-white">
                <th className="p-4 sm:p-5 font-bold">Purity Standard</th>
                <th className="p-4 sm:p-5 font-bold bg-[#233822]">Nuva Certified Harvest</th>
                <th className="p-4 sm:p-5 font-bold text-neutral-300">Standard Market Produce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              <tr>
                <td className="p-4 font-semibold text-neutral-800">Cleaning Method</td>
                <td className="p-4 bg-emerald-50/70 font-bold text-[#2d472c]">Triple Ozone (O₃) + RO Bubble Wash</td>
                <td className="p-4 text-neutral-600">Untreated tap water or chemical wax dip</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-neutral-800">Pesticide Residue</td>
                <td className="p-4 bg-emerald-50/70 font-bold text-[#2d472c]">0.00 ppm (HPLC Certified Clean)</td>
                <td className="p-4 text-neutral-600">Common allowable pesticide residue levels</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-neutral-800">Harvest to Doorstep</td>
                <td className="p-4 bg-emerald-50/70 font-bold text-[#2d472c]">Under 12 Hours Direct</td>
                <td className="p-4 text-neutral-600">3 to 7 days across middlemen & mandis</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-neutral-800">Packaging</td>
                <td className="p-4 bg-emerald-50/70 font-bold text-[#2d472c]">Zero-Plastic Breathable Bio-Film</td>
                <td className="p-4 text-neutral-600">Single-use plastic suffocation bags</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section className="bg-[#fbfaf6] py-16 px-4 sm:px-6 lg:px-8 border-y border-neutral-200/80">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2d472c] font-display">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqsList.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#fafcf9] border border-neutral-200/80 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-neutral-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-[#2d472c]" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE REVIEWS & UGC GALLERY */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 p-8 rounded-3xl bg-[#f6f8f5] border border-neutral-200/80">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-5xl font-black text-[#2d472c] font-display">4.9</span>
              <div className="flex text-amber-500 justify-center mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-1">1,248 Verified Ratings</p>
            </div>

            <div className="h-16 w-px bg-neutral-300 hidden sm:block" />

            <div className="space-y-1 text-xs text-neutral-600 hidden sm:block">
              <p>🌱 99% Verified Customer Satisfaction</p>
              <p>✨ 100% Pesticide-Free Guarantee</p>
              <p>🚚 12-Hour Cold Dispatch</p>
            </div>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-6 py-3 rounded-full bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            {showReviewForm ? 'Close Review Form' : 'Write a Verified Review'}
          </button>
        </div>

        {/* Modal / Inline Review Submission Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#2d472c]/30 shadow-xl space-y-4 mb-12 animate-fadeIn">
            <h3 className="text-lg font-bold text-[#2d472c] font-display">Share Your Freshness Experience</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-700">Your Rating:</span>
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="p-1 focus:outline-none cursor-pointer"
                  >
                    <Star className={`h-5 w-5 ${star <= newReview.rating ? 'fill-current' : 'stroke-current'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Patel"
                  value={newReview.author}
                  onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-[#2d472c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure crunch, incredible aroma!"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-[#2d472c] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Your Honest Feedback</label>
              <textarea
                rows={4}
                required
                placeholder="Describe the freshness, taste, and delivery experience..."
                value={newReview.body}
                onChange={(e) => setNewReview({ ...newReview, body: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-[#2d472c] focus:outline-none"
              />
            </div>

            {/* Photo / Image Upload Section for User Reviews */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-neutral-700">
                Upload Real Product Photos (Optional)
              </label>
              
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed border-[#2d472c]/40 hover:border-[#2d472c] bg-[#f4f7f4] flex items-center gap-2 text-xs font-bold text-[#2d472c] transition-all">
                  <Camera className="w-4 h-4" />
                  <span>Choose Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                
                {uploadedReviewImages.map((img, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-xl border border-neutral-200 overflow-hidden group/img">
                    <img src={img} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(idx)}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-[10px] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#2d472c] text-white text-xs font-bold shadow hover:bg-[#20341f] cursor-pointer mt-2"
            >
              Submit Review
            </button>
          </form>
        )}

        {/* Reviews Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-6 rounded-3xl bg-[#faf9f5] border border-neutral-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-400">{rev.date}</span>
                </div>
                <h4 className="text-sm font-bold text-neutral-900 leading-snug">{rev.title}</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">{rev.body}</p>
                
                {/* Display Uploaded User Review Photos */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pt-2">
                    {rev.images.map((pic, pIdx) => (
                      <img
                        key={pIdx}
                        src={pic}
                        alt="Customer upload"
                        className="w-14 h-14 rounded-xl object-cover border border-neutral-200 shadow-2xs"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-200/60 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#2d472c]">
                  <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                  <span>{rev.author}</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Buy Now Payment Modal */}
      {isBuyNowModalOpen && (
        <PaymentModal
          isOpen={isBuyNowModalOpen}
          onClose={() => setIsBuyNowModalOpen(false)}
          totalAmount={Math.max(0, variantPrice * quantity + (variantPrice * quantity > 499 ? 0 : 40))}
          onSuccess={handleBuyNowSuccess}
          customerDetails={{
            name: user?.name || 'Customer',
            email: user?.email || '',
            phone: user?.phone || '+91 98250 12345'
          }}
        />
      )}

    </div>
  );
};

export default ProductDetailPage;
