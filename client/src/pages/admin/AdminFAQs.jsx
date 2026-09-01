import React, { useState, useEffect, useMemo } from 'react';
import { HelpCircle, Plus, Search, Pencil, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';
import {
  PageHeader, PrimaryButton, SecondaryButton, IconButton, Badge, ErrorBanner,
  TabBar, TableCard, LoadingRow, EmptyRow, Pagination, Modal, Field,
  inputClass, controlBase
} from '../../components/admin/ui';

/* ═══════════════════════════════════════════════════════════════════
   FAQS
   The questions the FAQ page and the product-page accordion both read.
   Rows expand in place to show the answer, so checking the wording of
   something doesn't mean opening an editor.
═══════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 10;

const CATEGORIES = [
  'Ozone Wash & Purity',
  'Delivery & Packaging',
  'A2 Ghee & Staples',
  'Orders & Payments',
  'B2B & Commercial Supply'
];

const INITIAL_FAQS = [
  {
    _id: 'faq-1',
    category: 'Ozone Wash & Purity',
    question: 'What is aqueous ozone washing and how does it remove pesticides?',
    answer: 'Aqueous ozone (O₃) is an all-natural, medical-grade sanitizer produced by infusing pure oxygen and water with ozone gas. It is 3,000x faster than chlorine at neutralizing pesticide molecules, heavy metals, mold, and pathogens. Within minutes, it reverts back to pure oxygen and water leaving 0.00 PPM chemical residue.',
    status: 'Published',
    order: 1
  },
  {
    _id: 'faq-2',
    category: 'Delivery & Packaging',
    question: 'How fast is sunrise farm harvest to doorstep delivery in Gujarat?',
    answer: 'All our organic leafy greens, vegetables, and seasonal fruits are harvested at sunrise (5:00 AM - 7:00 AM), immediately triple-washed in our cold-water aqueous ozone tunnel, vacuum-packed in biodegradable kraft boxes, and delivered to your kitchen within 12 hours.',
    status: 'Published',
    order: 2
  },
  {
    _id: 'faq-3',
    category: 'A2 Ghee & Staples',
    question: 'How is Nuva A2 Gir Cow Ghee prepared?',
    answer: 'Our A2 Desi Cow Ghee is prepared using the authentic Vedic Bilona method. Whole A2 milk from grass-fed Gir cows is curdled in earthen pots, hand-churned bidirectionally with wooden churners to extract makkhan (butter), and slowly simmered over cow-dung flame for pure golden aroma and granular texture.',
    status: 'Published',
    order: 3
  },
  {
    _id: 'faq-4',
    category: 'Orders & Payments',
    question: 'What payment options and discounts are available?',
    answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), instant QR code scan & pay, credit/debit cards, net banking, and Cash on Delivery (COD). Use coupon code WELCOME10 for an extra 10% OFF your first order.',
    status: 'Published',
    order: 4
  },
  {
    _id: 'faq-5',
    category: 'B2B & Commercial Supply',
    question: 'Do you supply to restaurants, cafes, and bulk institutional kitchens?',
    answer: 'Yes! We supply custom graded, ozone-washed exotics, hydroponic herbs, and cold-pressed oils daily to leading restaurants, hotels, and cloud kitchens across Vadodara, Ahmedabad, and Anand. You can request a rate card directly from our /b2b portal or call +91 92277 25359.',
    status: 'Published',
    order: 5
  }
];

const blankForm = () => ({
  category: CATEGORIES[0],
  question: '',
  answer: '',
  status: 'Published'
});

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);

  const idOf = (faq) => faq._id || faq.id;

  const load = async () => {
    try {
      const { data } = await API.get('/admin/faqs');
      if (data.success && data.faqs?.length > 0) setFaqs(data.faqs);
      setError('');
    } catch (e) {
      // The seeded questions are what the FAQ page falls back to anyway.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [tab, search]);

  const open = (faq) => {
    setEditing(faq || 'new');
    setForm(faq ? { ...blankForm(), ...faq } : blankForm());
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setError('A question needs both a question and an answer.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      if (editing === 'new') {
        const payload = { ...form, order: faqs.length + 1 };
        const { data } = await API.post('/admin/faqs', payload);
        setFaqs([data?.faq || { _id: `faq-${Date.now()}`, ...payload }, ...faqs]);
      } else {
        const { data } = await API.put(`/admin/faqs/${idOf(editing)}`, form);
        setFaqs(faqs.map((f) => (idOf(f) === idOf(editing) ? (data?.faq || { ...f, ...form }) : f)));
      }
      // The FAQ page and the product-page accordion both read this.
      publishStoreChange(STORE_TOPICS.FAQS);
      setEditing(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save that question.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (faq) => {
    if (!window.confirm('Delete this question?')) return;
    const previous = faqs;
    setFaqs(faqs.filter((f) => idOf(f) !== idOf(faq)));
    try {
      await API.delete(`/admin/faqs/${idOf(faq)}`);
      publishStoreChange(STORE_TOPICS.FAQS);
    } catch (e) {
      setFaqs(previous);
      setError(e.response?.data?.message || 'Could not delete that question.');
    }
  };

  const toggleStatus = async (faq) => {
    const status = faq.status === 'Published' ? 'Draft' : 'Published';
    const previous = faqs;
    setFaqs(faqs.map((f) => (idOf(f) === idOf(faq) ? { ...f, status } : f)));
    try {
      await API.put(`/admin/faqs/${idOf(faq)}`, { status });
      publishStoreChange(STORE_TOPICS.FAQS);
    } catch (e) {
      setFaqs(previous);
      setError(e.response?.data?.message || 'Could not change visibility.');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return faqs
      .filter((f) => tab === 'All' || f.category === tab)
      .filter((f) =>
        !q || [f.question, f.answer, f.category].some((v) => String(v || '').toLowerCase().includes(q))
      );
  }, [faqs, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">
      <PageHeader icon={HelpCircle} title="FAQs" count={faqs.length}>
        <PrimaryButton onClick={() => open(null)}>
          <Plus className="h-3.5 w-3.5" />
          Add question
        </PrimaryButton>
      </PageHeader>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <TableCard>
        <TabBar tabs={['All', ...CATEGORIES]} active={tab} onChange={setTab}>
          {showSearch ? (
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => !search && setShowSearch(false)}
              placeholder="Search questions"
              className={`${controlBase} w-48 py-1`}
            />
          ) : (
            <IconButton onClick={() => setShowSearch(true)} title="Search">
              <Search className="h-3.5 w-3.5" />
            </IconButton>
          )}
        </TabBar>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                <th className="py-2.5 px-4 w-8" />
                <th className="py-2.5 px-3">Question</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Visibility</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {loading && <LoadingRow colSpan={5} label="Loading questions…" />}

              {!loading && rows.length === 0 && (
                <EmptyRow
                  colSpan={5}
                  icon={HelpCircle}
                  title={search || tab !== 'All' ? 'No questions match those filters' : 'No questions yet'}
                  hint="Questions added here appear on the FAQ page and the product accordion."
                  action={
                    !search && tab === 'All' && (
                      <PrimaryButton onClick={() => open(null)}>
                        <Plus className="h-3.5 w-3.5" />
                        Add question
                      </PrimaryButton>
                    )
                  }
                />
              )}

              {!loading && rows.map((faq) => {
                const id = idOf(faq);
                const isOpen = expanded === id;
                return (
                  <React.Fragment key={id}>
                    <tr
                      onClick={() => setExpanded(isOpen ? null : id)}
                      className="cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#1a1a1a] dark:text-white max-w-[460px]">
                        <span className="line-clamp-2">{faq.question}</span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge tone="info">{faq.category}</Badge>
                      </td>
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <Badge
                          tone={faq.status === 'Published' ? 'success' : 'neutral'}
                          onClick={() => toggleStatus(faq)}
                          title={faq.status === 'Published' ? 'Hide from the storefront' : 'Show on the storefront'}
                        >
                          {faq.status === 'Published' ? 'Visible' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <IconButton onClick={() => open(faq)} title="Edit"><Pencil className="h-3.5 w-3.5" /></IconButton>
                          <IconButton onClick={() => remove(faq)} title="Delete" danger><Trash2 className="h-3.5 w-3.5" /></IconButton>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-[#fbfbfa] dark:bg-[#161616]">
                        <td />
                        <td colSpan={4} className="py-3 pr-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {faq.answer}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
          unit="questions"
        />
      </TableCard>

      {editing && (
        <Modal
          title={editing === 'new' ? 'Add question' : 'Edit question'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <SecondaryButton onClick={() => setEditing(null)} disabled={saving}>Cancel</SecondaryButton>
              <PrimaryButton onClick={save} disabled={saving || !form.question.trim() || !form.answer.trim()}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving ? 'Saving…' : 'Save'}
              </PrimaryButton>
            </>
          }
        >
          <div className="space-y-3">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Question" required>
              <input
                type="text"
                autoFocus
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="What do customers ask?"
                className={inputClass}
              />
            </Field>

            <Field
              label="Answer"
              required
              counter={<span className="text-[11px] text-neutral-500">{form.answer.length} characters</span>}
            >
              <textarea
                rows={6}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="The answer shown on the storefront"
                className={inputClass}
              />
            </Field>

            <Field label="Visibility">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}
              >
                <option value="Published">Visible</option>
                <option value="Draft">Hidden</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminFAQs;
