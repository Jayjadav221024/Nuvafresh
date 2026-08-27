import React, { useState } from 'react';
import { 
  FileCode, Sparkles, Eye, Code, Save, CheckCircle2, Tag, Copy, Send, Check
} from 'lucide-react';

const INITIAL_TEMPLATES = [
  {
    id: 'order_confirmed',
    name: 'Order Confirmation & Receipt',
    trigger: 'On Order Placed (Success)',
    subject: 'Your Nuva Pure Harvest Order Confirmed! ({{orderId}})',
    bodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e5e5e5;">
  <h2 style="color: #2d472c; margin-top: 0;">Nuva Nutrition · Pure Harvest Confirmed</h2>
  <p>Hello <strong>{{customerName}}</strong>,</p>
  <p>Thank you for choosing chemical-free regenerative produce. Your order <strong>{{orderId}}</strong> has been verified and scheduled for sunrise dispatch.</p>
  <div style="background: #faf9f5; border: 1px solid #eee; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0; font-size: 14px; color: #666;">Total Amount Paid:</p>
    <h3 style="margin: 4px 0 0 0; color: #2d472c; font-size: 22px;">₹{{totalAmount}}</h3>
  </div>
  <p style="font-size: 13px; color: #888;">Delivery Address: {{shippingAddress}}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="font-size: 12px; color: #999; text-align: center;">4th Floor, Pancham Icon, Vasna Rd, Vadodara · FSSAI: 10721024000189</p>
</div>`
  },
  {
    id: 'new_inquiry',
    name: 'Customer Contact Inquiry Acknowledgment',
    trigger: 'On Contact Form Submission',
    subject: 'We received your inquiry, {{customerName}} - Nuva Support',
    bodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e5e5e5;">
  <h2 style="color: #2d472c;">Thank You For Reaching Out</h2>
  <p>Dear <strong>{{customerName}}</strong>,</p>
  <p>Our team has received your message regarding: <em>"{{inquirySubject}}"</em>.</p>
  <p>A representative from our Vadodara office will review your request and reply within 24 hours.</p>
  <p style="color: #666;">Warm regards,<br/>The Nuva Nutrition Team</p>
</div>`
  }
];

const VARIABLE_TAGS = ['{{customerName}}', '{{orderId}}', '{{totalAmount}}', '{{shippingAddress}}', '{{inquirySubject}}', '{{loginUrl}}'];

const AdminEmailTemplates = () => {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [selectedId, setSelectedId] = useState(INITIAL_TEMPLATES[0].id);
  const [activeView, setActiveView] = useState('editor'); // 'editor' | 'preview'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedTag, setCopiedTag] = useState('');

  const currentTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  const handleUpdate = (field, val) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, [field]: val } : t))
    );
  };

  const handleCopyTag = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(''), 2000);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 font-sans max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Transactional Email Templates
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Build and preview automated transactional customer notifications with dynamic variable tags.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          <span>Save Templates</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Email template saved successfully!</span>
        </div>
      )}

      {/* 2-Column Interface: Left Templates List | Right Editor / Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 4 Cols: Templates List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block px-1">
            Available Triggers
          </span>

          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setSelectedId(tpl.id)}
              className={`w-full p-4 rounded-2xl border text-left transition-all ${
                selectedId === tpl.id
                  ? 'bg-emerald-50 dark:bg-neutral-800 border-[#2d472c] dark:border-emerald-500 shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                {tpl.name}
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                {tpl.trigger}
              </p>
            </button>
          ))}

          {/* Dynamic Variable Tags Helper Box */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 space-y-2 mt-4">
            <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Available Dynamic Tags</span>
            </span>
            <p className="text-[10px] text-neutral-400">Click a tag to copy to clipboard:</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {VARIABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleCopyTag(tag)}
                  className="px-2 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[10px] font-mono text-neutral-800 dark:text-neutral-200 hover:border-[#2d472c] flex items-center gap-1 transition-colors"
                >
                  <span>{tag}</span>
                  {copiedTag === tag && <Check className="h-2.5 w-2.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Template Subject & Body Editor / Live HTML Preview */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          
          {/* Subject Field */}
          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              Email Subject Line
            </label>
            <input
              type="text"
              value={currentTemplate.subject}
              onChange={(e) => handleUpdate('subject', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs sm:text-sm font-medium"
            />
          </div>

          {/* Mode Tabs: Code Editor | Live HTML Preview */}
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeView === 'editor'
                    ? 'bg-[#2d472c] text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span>HTML Code Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeView === 'preview'
                    ? 'bg-[#2d472c] text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Live HTML Preview</span>
              </button>
            </div>
          </div>

          {/* Editor or Preview Frame */}
          {activeView === 'editor' ? (
            <textarea
              rows={14}
              value={currentTemplate.bodyHtml}
              onChange={(e) => handleUpdate('bodyHtml', e.target.value)}
              className="w-full p-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-950 text-emerald-400 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-[#2d472c]"
            />
          ) : (
            <div className="p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 overflow-y-auto max-h-[420px]">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: currentTemplate.bodyHtml
                    .replace(/{{customerName}}/g, 'Jay Jadav')
                    .replace(/{{orderId}}/g, 'NUV-849201')
                    .replace(/{{totalAmount}}/g, '1,240')
                    .replace(/{{shippingAddress}}/g, '4th Floor, Pancham Icon, Vadodara, Gujarat')
                    .replace(/{{inquirySubject}}/g, 'A2 Cow Ghee bulk subscription query')
                }} 
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminEmailTemplates;
