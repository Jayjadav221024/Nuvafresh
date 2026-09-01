import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import API from '../api/axiosInstance';

/* ═══════════════════════════════════════════════════════════════════
   METAOBJECT ENTRY PAGE
   What "Publish entries as web pages" actually produces. The server only
   serves an entry here when its type has that option on, so turning it
   off in the admin makes this route 404 — the toggle is the gate, not a
   label.
═══════════════════════════════════════════════════════════════════ */
const isImage = (value) =>
  typeof value === 'string' && (/^data:image\//.test(value) || /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(value));

const isLink = (value) => typeof value === 'string' && /^https?:\/\//.test(value);

const FieldValue = ({ field, value }) => {
  if (value === '' || value === null || value === undefined) {
    return <span className="text-[#8a8a8a]">—</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-[#8a8a8a]">—</span>;
    return (
      <ul className="space-y-1">
        {value.map((v, i) => (
          <li key={i}>
            <FieldValue field={{ ...field, list: false }} value={v} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'boolean') return <span>{value ? 'Yes' : 'No'}</span>;

  if (field.type === 'rich_text' || field.type === 'multi_line_text') {
    return (
      <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: String(value) }} />
    );
  }

  if (isImage(value)) {
    return (
      <img
        src={value}
        alt={field.label}
        className="rounded-xl border border-[#e3e0d6] max-h-72 object-cover"
      />
    );
  }

  if (isLink(value)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#2d472c] underline break-all">
        {value}
      </a>
    );
  }

  if (field.type === 'date') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return <span>{d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>;
    }
  }

  return <span>{String(value)}</span>;
};

const MetaobjectEntryPage = () => {
  const { handle, entryHandle } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await API.get(`/content/metaobjects/${handle}/entries/${entryHandle}`);
        setData(res.data);
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [handle, entryHandle]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[#5c5f62]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 font-display">Page not found</h1>
        <p className="text-sm text-[#5c5f62] mt-2">
          This page isn't published, or it doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-[#2d472c] hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to the shop
        </Link>
      </div>
    );
  }

  const { definition, entry } = data;
  const displayKey = definition.displayField || definition.fields[0]?.key;
  const displayValue = entry.fields?.[displayKey];
  const title = String(Array.isArray(displayValue) ? displayValue[0] : displayValue || entry.handle);

  return (
    <div className="bg-[#f7f6f2] min-h-[70vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b7050]">
          {definition.name}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-display mt-1.5">
          {title}
        </h1>
        {definition.description && (
          <p className="text-sm text-[#5c5f62] mt-2">{definition.description}</p>
        )}

        <dl className="mt-8 space-y-6">
          {definition.fields
            .filter((f) => f.key !== displayKey)
            .map((f) => (
              <div key={f.key} className="border-t border-[#e3e0d6] pt-5">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#6b7050]">
                  {f.label}
                </dt>
                <dd className="text-sm text-neutral-800 mt-1.5">
                  <FieldValue field={f} value={entry.fields?.[f.key]} />
                </dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  );
};

export default MetaobjectEntryPage;
