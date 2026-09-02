import React, { useState, useEffect } from 'react';
import { Truck, Box, MessageSquare, Check, ArrowUp, CheckCircle2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const ContactPage = () => {
  const { getContent } = useContent();
  const processingUnit = getContent('contact.info', 'processingUnit', 'Kaival Society, Anand, Gujarat 388330');
  const mainOffice = getContent('contact.info', 'mainOffice', '4th Floor, Pancham Icon, Vasna Rd, beside D Mart Mall, Vadodara, Gujarat 390007');
  const offlineStore = getContent('contact.info', 'offlineStore', 'Shop No.184 Radhakrishna Flat , Productivity Road, Near Akota Garden, Vadodara, Gujarat 390020');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 600);
  };

  return (
    <div className="bg-white font-sans text-neutral-900 overflow-hidden pb-16">
      
      {/* 1. Questions? Send us an email Form Section matching screenshot */}
      <section data-section-key="contact.form" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2d472c] font-display tracking-tight">
            {getContent('contact.form', 'heading', 'Questions? Send us an email')}
          </h1>
          {isSuccess && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-center gap-2 animate-fadeIn max-w-xl mx-auto">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{getContent('contact.form', 'successMessage', 'Thank you! Your message has been sent successfully.')}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
          {/* Name Field */}
          <div>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-neutral-200/90 bg-[#fafafa] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2d472c] focus:border-[#2d472c] text-xs sm:text-sm text-neutral-800 transition-colors placeholder:text-neutral-500"
            />
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-neutral-200/90 bg-[#fafafa] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2d472c] focus:border-[#2d472c] text-xs sm:text-sm text-neutral-800 transition-colors placeholder:text-neutral-500"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <input
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-neutral-200/90 bg-[#fafafa] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2d472c] focus:border-[#2d472c] text-xs sm:text-sm text-neutral-800 transition-colors placeholder:text-neutral-500"
            />
          </div>

          {/* Message Field */}
          <div>
            <textarea
              rows={4}
              placeholder="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-neutral-200/90 bg-[#fafafa] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2d472c] focus:border-[#2d472c] text-xs sm:text-sm text-neutral-800 transition-colors placeholder:text-neutral-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-28 sm:w-32 py-2.5 rounded-full bg-[#222222] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'SENDING...' : 'SEND'}
            </button>
          </div>
        </form>
      </section>

      {/* 2. NuvaNutrition Pvt. Ltd Locations & Live Google Map Section matching screenshot */}
      <section data-section-key="contact.info" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl overflow-hidden border border-neutral-200/80 shadow-lg bg-[#f6f8f5] flex flex-col lg:flex-row items-stretch">

          {/* Left Column: Location Cards */}
          <div className="w-full lg:w-2/5 p-6 sm:p-10 space-y-6 flex flex-col justify-center">

            {/* Brand Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2d472c] font-display tracking-tight mb-2">
              {getContent('contact.info', 'companyName', 'NuvaNutrition Pvt. Ltd')}
            </h2>

            {/* Location Card 1: Processing Unit */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-sm border border-neutral-100 space-y-1.5 hover:shadow-md transition-shadow">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                Processing Unit
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {processingUnit}
              </p>
              <a
                href="https://maps.google.com/?q=Kaival+Society+Anand+Gujarat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-neutral-900 hover:text-[#2d472c] underline underline-offset-2 pt-1"
              >
                View details
              </a>
            </div>

            {/* Location Card 2: Main Office */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/70 hover:bg-white shadow-sm border border-neutral-100 space-y-1.5 hover:shadow-md transition-all">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                Main Office
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {mainOffice}
              </p>
              <a
                href="https://maps.google.com/?q=Pancham+Icon+Vasna+Rd+Vadodara"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-neutral-900 hover:text-[#2d472c] underline underline-offset-2 pt-1"
              >
                View details
              </a>
            </div>

            {/* Location Card 3: Offline Store */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/70 hover:bg-white shadow-sm border border-neutral-100 space-y-1.5 hover:shadow-md transition-all">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                Offline Store
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {offlineStore}
              </p>
              <a
                href="https://maps.google.com/?q=Radhakrishna+Flat+Productivity+Road+Akota+Vadodara"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-neutral-900 hover:text-[#2d472c] underline underline-offset-2 pt-1"
              >
                View details
              </a>
            </div>

          </div>

          {/* Right Column: Embedded Google Map matching Kaival Society Anand / Vadodara location */}
          <div className="w-full lg:w-3/5 min-h-[380px] lg:min-h-[500px] relative bg-neutral-200">
            <iframe
              title="Nuva Locations Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117935.29744122176!2d72.9329735!3d22.5645175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e4b77f98b6c4b%3A0x60cb3c2d431f450!2sAnand%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
          </div>

        </div>
      </section>

      {/* 3. 4-Feature Icons Strip (Free Shipping | Big Saving | Online Support | Flexible Payment) matching screenshot */}
      <section data-section-key="contact.features" className="mt-8 py-10 px-4 sm:px-6 lg:px-8 bg-neutral-50/70 border-t border-neutral-200/80">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
          
          {/* Item 1: Free Shipping */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left pt-3 md:pt-0">
            <Truck className="h-7 w-7 text-neutral-800 stroke-[1.8]" />
            <span className="text-xs sm:text-sm font-bold text-neutral-900">
              {getContent('contact.features', 'feature1', 'Free Shipping')}
            </span>
          </div>

          {/* Item 2: Big Saving */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left pt-3 md:pt-0">
            <Box className="h-7 w-7 text-neutral-800 stroke-[1.8]" />
            <span className="text-xs sm:text-sm font-bold text-neutral-900">
              {getContent('contact.features', 'feature2', 'Big Saving')}
            </span>
          </div>

          {/* Item 3: Online Support */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left pt-3 md:pt-0">
            <MessageSquare className="h-7 w-7 text-neutral-800 stroke-[1.8]" />
            <span className="text-xs sm:text-sm font-bold text-neutral-900">
              {getContent('contact.features', 'feature3', 'Online Support')}
            </span>
          </div>

          {/* Item 4: Flexible Payment */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left pt-3 md:pt-0">
            <Check className="h-7 w-7 text-neutral-800 stroke-[2.5]" />
            <span className="text-xs sm:text-sm font-bold text-neutral-900">
              {getContent('contact.features', 'feature4', 'Flexible Payment')}
            </span>
          </div>

        </div>
      </section>

      {/* Floating Scroll to Top Action Button on Bottom Right */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 flex items-center justify-center shadow-lg border border-neutral-200 transition-transform active:scale-95"
        title="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 stroke-[2]" />
      </button>

    </div>
  );
};

export default ContactPage;
