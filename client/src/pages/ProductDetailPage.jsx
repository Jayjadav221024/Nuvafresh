import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ShieldCheck, Sparkles, Check, ShoppingBag, Truck, Heart, 
  ChevronDown, ChevronUp, Share2, Plus, Minus, ArrowUp, ThumbsUp, Camera, MessageCircle, QrCode
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
  const [selectedUnit, setSelectedUnit] = useState('500g');
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

  const handleBuyNowSuccess = (paymentResult) => {
    setIsBuyNowModalOpen(false);
    const finalPrice = (product.discountedPrice || product.price) * quantity;
    const finalAmount = Math.max(0, finalPrice + (finalPrice > 499 ? 0 : 40));

    const orderPayload = {
      _id: 'NUV-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      items: [
        {
          product: product._id,
          title: product.title,
          quantity: quantity,
          price: product.discountedPrice || product.price,
          unit: selectedUnit
        }
      ],
      totalAmount: finalAmount,
      discountApplied: 0,
      paymentMethod: paymentResult.paymentMethod || 'UPI QR Instant Pay',
      transactionId: paymentResult.transactionId,
      utrNumber: paymentResult.utrNumber,
      deliveryAddress: {
        name: 'Jay Jadav',
        street: '4th Floor, Pancham Icon, Vasna Rd',
        city: 'Vadodara',
        state: 'Gujarat',
        postalCode: '390007',
        phone: '+91 92277 25359'
      }
    };

    navigate('/order-success', {
      state: {
        order: orderPayload,
        totalAmount: finalAmount,
        discountApplied: 0,
        items: orderPayload.items
      }
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${id}`);
        if (data.success && data.product) {
          setProduct(data.product);
          setSelectedUnit(data.product.unit || '500g');
        }
      } catch (err) {
        // Fallback default mock
        setProduct({
          _id: id || 'p-1',
          title: 'Hydro-Cleaned Crisp Baby Spinach (O3 Washed)',
          price: 99,
          discountedPrice: 79,
          category: 'Ozone Washed Vegetables',
          unit: '250g',
          stock: 40,
          isOzoneWashed: true,
          ozoneBatchNumber: 'O3-882910',
          description: 'Triple-washed in micro-bubbled ozone water to eliminate 99.9% pesticides and contaminants without affecting natural crunch or chlorophyll.',
          images: [
            'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800',
            'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800'
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchRelated = async () => {
      try {
        const { data } = await API.get('/products?limit=4');
        if (data.success) {
          setRelatedProducts(data.products.slice(0, 4));
        }
      } catch (e) {}
    };

    const fetchFaqs = async () => {
      try {
        const { data } = await API.get('/admin/faqs');
        if (data.success && data.faqs && data.faqs.length > 0) {
          setFaqsList(data.faqs.filter(f => f.status === 'Published').map(f => ({
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
      images: []
    };
    setReviews([created, ...reviews]);
    setShowReviewForm(false);
    setNewReview({ author: '', email: '', rating: 5, title: '', body: '' });
    alert('Thank you! Your verified review has been published.');
  };

  if (loading || !product) {
    return <ProductDetailPageSkeleton />;
  }

  const currentPrice = product.discountedPrice || product.price;
  const originalPrice = product.price > currentPrice ? product.price : Math.round(currentPrice * 1.25);
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  return (
    <div className="bg-white font-sans text-neutral-900 pb-20">
      
      {/* Breadcrumbs Row */}
      <div className="bg-[#f7f6f2] py-2.5 px-4 sm:px-6 lg:px-8 border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-neutral-600 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#2d472c] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#2d472c] transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium truncate">{product.title}</span>
        </div>
      </div>

      {/* 1. HERO PRODUCT SECTION (Gallery Left, Conversion Box Right) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery (55%) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Active Image Box */}
            <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-[#f7f6f2] border border-neutral-200/80 shadow-md p-6 flex items-center justify-center group">
              <img
                src={product.images?.[selectedImage] || product.images?.[0]}
                alt={product.title}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Ozone Batch Tag */}
              {product.isOzoneWashed && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[#2d472c] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                  <span>O₃ Aqueous Washed</span>
                </div>
              )}

              {/* Discount Tag */}
              {discountPercent > 0 && (
                <div className="absolute top-4 right-4 z-10 bg-[#b91c1c] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  SAVE {discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnail Nav Row */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 w-20 rounded-xl overflow-hidden bg-[#f7f6f2] p-2 border-2 transition-all shrink-0 ${
                      selectedImage === idx ? 'border-[#2d472c] shadow-md scale-105' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Purchase Action Deck (45%) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title & Category */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2d472c] bg-[#e7e3d8] px-3 py-1 rounded-full">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2d472c] font-display tracking-tight mt-3 leading-snug">
                {product.title}
              </h1>
              
              {/* Star rating summary */}
              <div className="flex items-center gap-2 mt-2.5 text-xs text-neutral-600">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-neutral-900">4.9</span>
                <span>(1,248 verified customer ratings)</span>
              </div>
            </div>

            {/* Pricing Deck */}
            <div className="p-4 rounded-2xl bg-[#faf9f5] border border-neutral-200/90 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#2d472c]">
                  ₹{currentPrice.toFixed(2)}
                </span>
                <span className="text-sm text-neutral-500 line-through">
                  ₹{originalPrice.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              </div>

              {/* 10% Welcome Promo Callout Banner */}
              <div className="p-2.5 rounded-xl bg-[#e7f3e8] border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Use code <strong>WELCOME10</strong> for extra 10% OFF at checkout!</span>
              </div>
            </div>

            {/* Pack Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Select Pack Size / Quantity:
              </label>
              <div className="flex gap-2">
                {['250g', '500g', '1 Kg', '2 Kg'].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setSelectedUnit(unit)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedUnit === unit
                        ? 'bg-[#2d472c] text-white border-[#2d472c] shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-between sm:justify-center border border-neutral-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-neutral-600 hover:text-black transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 text-sm font-bold text-neutral-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-neutral-600 hover:text-black transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 flex-1">
                <button
                  onClick={(e) => {
                    addToCart({ ...product, unit: selectedUnit }, quantity, e);
                  }}
                  className="flex-1 py-3 px-3 sm:px-4 rounded-xl bg-white border-2 border-[#2d472c] text-[#2d472c] hover:bg-[#faf9f5] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4 shrink-0" />
                  <span className="truncate">Add to Basket</span>
                </button>

                <button
                  onClick={() => {
                    if (!user) {
                      openAuthModal('login');
                      return;
                    }
                    setIsBuyNowModalOpen(true);
                  }}
                  className="flex-1 py-3 px-3 sm:px-4 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <QrCode className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span className="truncate">Instant Buy</span>
                </button>
              </div>
            </div>

            {/* Micro-Trust Signals */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-neutral-700">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Under 12-hr farm harvest</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Zero chemical residue</span>
              </div>
            </div>

            {/* Brief Description */}
            <div className="pt-4 border-t border-neutral-200 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-2">
              <p className="font-semibold text-neutral-900">About this Harvest:</p>
              <p>{product.description}</p>
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
          {/* Accordion FAQ Items */}
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
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-neutral-900"
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
        
        {/* Review Header & Rating Summary */}
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
            className="px-6 py-3 rounded-full bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md transition-transform active:scale-95"
          >
            {showReviewForm ? 'Close Review Form' : 'Write a Verified Review'}
          </button>
        </div>

        {/* Modal / Inline Review Submission Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#2d472c]/30 shadow-xl space-y-4 mb-12 animate-fadeIn">
            <h3 className="text-lg font-bold text-[#2d472c] font-display">Share Your Freshness Experience</h3>
            
            {/* Rating Stars Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-700">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setNewReview({ ...newReview, rating: s })}
                    className="p-1"
                  >
                    <Star className={`h-5 w-5 ${s <= newReview.rating ? 'text-amber-500 fill-current' : 'text-neutral-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name *"
                value={newReview.author}
                onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
              />
              <input
                type="email"
                placeholder="Your Email *"
                value={newReview.email}
                onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
              />
            </div>

            <input
              type="text"
              placeholder="Review Title (e.g. Incredibly crisp and fresh!) *"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
            />

            <textarea
              rows={3}
              placeholder="Write your honest review on taste, crunch, and delivery..."
              value={newReview.body}
              onChange={(e) => setNewReview({ ...newReview, body: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c] resize-none"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#2d472c] text-white text-xs font-bold hover:bg-[#20341f]"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}

        {/* UGC Customer Photos Ribbon */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Customer Photos & Videos (UGC)
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80'
            ].map((img, i) => (
              <div key={i} className="h-28 w-28 rounded-2xl overflow-hidden border border-neutral-200 shrink-0 shadow-sm">
                <img src={img} alt="Customer UGC" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Individual Reviews Feed */}
        <div className="space-y-6 divide-y divide-neutral-200">
          {reviews.map((rev) => (
            <div key={rev.id} className="pt-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-neutral-900">{rev.author}</span>
                  {rev.verified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Verified Purchaser
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-500">{rev.date}</span>
              </div>

              <div className="flex text-amber-500">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>

              <h4 className="text-sm font-bold text-neutral-900">{rev.title}</h4>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{rev.body}</p>

              {rev.images?.length > 0 && (
                <div className="flex gap-2 pt-2">
                  {rev.images.map((img, idx) => (
                    <img key={idx} src={img} alt="rev-attachment" className="h-16 w-16 rounded-lg object-cover border border-neutral-200" />
                  ))}
                </div>
              )}

              <div className="pt-2 flex items-center gap-4 text-xs text-neutral-500">
                <button className="flex items-center gap-1 hover:text-neutral-800 transition-colors">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Helpful ({rev.helpful})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 6. FREQUENTLY BOUGHT TOGETHER / RELATED PRODUCE */}
      {relatedProducts.length > 0 && (
        <section className="bg-[#fbfaf6] py-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/80">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2d472c] font-display">
                Frequently Bought Together
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">Complete your organic kitchen with these staple pairings</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link key={p._id} to={`/products/${p._id || p.slug}`} className="group">
                  <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-xl transition-all">
                    <div className="aspect-square bg-neutral-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-2">
                      <img src={p.images?.[0]} alt={p.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <h3 className="text-xs font-bold text-[#2d472c] line-clamp-1">{p.title}</h3>
                    <p className="text-xs font-bold text-neutral-900 mt-1">₹{(p.discountedPrice || p.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Scroll to Top Action Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 flex items-center justify-center shadow-lg border border-neutral-200 transition-transform active:scale-95"
        title="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 stroke-[2]" />
      </button>

      {/* Buy Now QR Payment Modal */}
      {product && (
        <PaymentModal
          isOpen={isBuyNowModalOpen}
          onClose={() => setIsBuyNowModalOpen(false)}
          amount={Math.max(0, (product.discountedPrice || product.price) * quantity + (((product.discountedPrice || product.price) * quantity) > 499 ? 0 : 40))}
          cartItems={[{ ...product, quantity, unit: selectedUnit }]}
          onPaymentSuccess={handleBuyNowSuccess}
        />
      )}

    </div>
  );
};

export default ProductDetailPage;
