import React, { useRef, useEffect, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Link2, Image as ImageIcon, Video,
  Table, Code2, ChevronDown, AlignLeft, AlignCenter, AlignRight, List,
  ListOrdered, Quote, Minus, RemoveFormatting, Sparkles
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   RICH TEXT EDITOR
   The product description editor from the Shopify admin: block format
   select, inline styles, colour, alignment, links, media, tables and a
   raw-HTML view. Built on contentEditable so it ships with no extra
   dependency and stores plain HTML — exactly what the storefront
   already renders for product descriptions.
═══════════════════════════════════════════════════════════════════ */

const BLOCK_FORMATS = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'blockquote', label: 'Quote' },
  { value: 'pre', label: 'Code block' }
];

const TEXT_COLORS = [
  '#1a1a1a', '#5c5f62', '#8c9196', '#2d472c', '#25d366',
  '#005bd3', '#b91c1c', '#b45309', '#7c3aed', '#0e7490'
];

const ToolbarButton = ({ title, onClick, active, children, disabled }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()} // keep the text selection alive
    onClick={onClick}
    className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      active
        ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />;

const RichTextEditor = ({ value, onChange, placeholder = 'Write a product description…', minHeight = 260 }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const [showSource, setShowSource] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // 'align' | 'color' | 'more' | 'table'
  const [tableSize, setTableSize] = useState({ rows: 3, cols: 3 });

  // Only write into the DOM when the incoming value genuinely differs,
  // otherwise every keystroke would reset the caret to the start.
  useEffect(() => {
    const el = editorRef.current;
    if (!el || showSource) return;
    if ((value || '') !== el.innerHTML) el.innerHTML = value || '';
  }, [value, showSource]);

  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const emit = () => onChange(editorRef.current?.innerHTML || '');

  const exec = (command, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emit();
    setOpenMenu(null);
  };

  const isActive = (command) => {
    try {
      return document.queryCommandState(command);
    } catch (e) {
      return false;
    }
  };

  const insertHTML = (html) => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    emit();
    setOpenMenu(null);
  };

  const handleLink = () => {
    const url = window.prompt('Link URL', 'https://');
    if (!url) return;
    const selection = window.getSelection()?.toString();
    if (selection) {
      exec('createLink', url);
    } else {
      insertHTML(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    }
  };

  const handleImageFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => insertHTML(`<img src="${reader.result}" alt="" style="max-width:100%;height:auto;" />`);
    reader.readAsDataURL(file);
  };

  const handleVideo = () => {
    const url = window.prompt('YouTube or video URL');
    if (!url) return;
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    const html = yt
      ? `<p><iframe width="100%" height="315" src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allowfullscreen></iframe></p>`
      : `<p><video src="${url}" controls style="max-width:100%"></video></p>`;
    insertHTML(html);
  };

  const insertTable = () => {
    const { rows, cols } = tableSize;
    const head = `<tr>${Array.from({ length: cols }, (_, c) => `<th style="border:1px solid #d0d0d0;padding:6px 10px;background:#f6f6f6;text-align:left;">Header ${c + 1}</th>`).join('')}</tr>`;
    const body = Array.from({ length: Math.max(0, rows - 1) }, () =>
      `<tr>${Array.from({ length: cols }, () => '<td style="border:1px solid #d0d0d0;padding:6px 10px;">&nbsp;</td>').join('')}</tr>`
    ).join('');
    insertHTML(`<table style="border-collapse:collapse;width:100%;margin:12px 0;">${head}${body}</table><p><br/></p>`);
  };

  const currentBlock = (() => {
    try {
      const v = document.queryCommandValue('formatBlock');
      return (v || 'p').toLowerCase().replace(/[<>]/g, '') || 'p';
    } catch (e) {
      return 'p';
    }
  })();

  return (
    <div className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] overflow-hidden focus-within:border-[#005bd3] focus-within:ring-1 focus-within:ring-[#005bd3] transition-colors">

      {/* ── Toolbar ── */}
      <div
        ref={menuRef}
        className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#242424] relative"
      >
        <ToolbarButton title="Formatting help" onClick={() => setShowSource(false)} disabled={showSource}>
          <Sparkles className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        <select
          value={BLOCK_FORMATS.some((b) => b.value === currentBlock) ? currentBlock : 'p'}
          disabled={showSource}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => exec('formatBlock', `<${e.target.value}>`)}
          className="text-xs font-semibold bg-transparent border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 rounded-md px-1.5 py-1 outline-none cursor-pointer disabled:opacity-40"
        >
          {BLOCK_FORMATS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>

        <Divider />

        <ToolbarButton title="Bold (Ctrl+B)" active={isActive('bold')} disabled={showSource} onClick={() => exec('bold')}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" active={isActive('italic')} disabled={showSource} onClick={() => exec('italic')}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Underline (Ctrl+U)" active={isActive('underline')} disabled={showSource} onClick={() => exec('underline')}>
          <Underline className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Text colour */}
        <div className="relative">
          <button
            type="button"
            title="Text colour"
            disabled={showSource}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpenMenu(openMenu === 'color' ? null : 'color')}
            className="flex items-center gap-0.5 p-1.5 rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 disabled:opacity-40"
          >
            <span className="text-xs font-bold leading-none">A</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {openMenu === 'color' && (
            <div className="absolute left-0 top-full mt-1 z-30 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#242424] shadow-xl grid grid-cols-5 gap-1.5 w-[132px]">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('foreColor', c)}
                  style={{ backgroundColor: c }}
                  className="h-5 w-5 rounded-full border border-black/10 hover:scale-110 transition-transform"
                />
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Alignment & lists */}
        <div className="relative">
          <button
            type="button"
            title="Alignment and lists"
            disabled={showSource}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpenMenu(openMenu === 'align' ? null : 'align')}
            className="flex items-center gap-0.5 p-1.5 rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 disabled:opacity-40"
          >
            <AlignLeft className="h-3.5 w-3.5" />
            <ChevronDown className="h-3 w-3" />
          </button>
          {openMenu === 'align' && (
            <div className="absolute left-0 top-full mt-1 z-30 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#242424] shadow-xl flex items-center gap-0.5">
              <ToolbarButton title="Align left" onClick={() => exec('justifyLeft')}><AlignLeft className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Align centre" onClick={() => exec('justifyCenter')}><AlignCenter className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Align right" onClick={() => exec('justifyRight')}><AlignRight className="h-3.5 w-3.5" /></ToolbarButton>
              <Divider />
              <ToolbarButton title="Bulleted list" onClick={() => exec('insertUnorderedList')}><List className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Numbered list" onClick={() => exec('insertOrderedList')}><ListOrdered className="h-3.5 w-3.5" /></ToolbarButton>
            </div>
          )}
        </div>

        <Divider />

        <ToolbarButton title="Insert link" disabled={showSource} onClick={handleLink}>
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Insert image" disabled={showSource} onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Insert video" disabled={showSource} onClick={handleVideo}>
          <Video className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Table */}
        <div className="relative">
          <button
            type="button"
            title="Insert table"
            disabled={showSource}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpenMenu(openMenu === 'table' ? null : 'table')}
            className="flex items-center gap-0.5 p-1.5 rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 disabled:opacity-40"
          >
            <Table className="h-3.5 w-3.5" />
            <ChevronDown className="h-3 w-3" />
          </button>
          {openMenu === 'table' && (
            <div className="absolute left-0 top-full mt-1 z-30 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#242424] shadow-xl space-y-2 w-48">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 w-10">Rows</label>
                <input
                  type="number" min="1" max="20" value={tableSize.rows}
                  onChange={(e) => setTableSize((s) => ({ ...s, rows: Number(e.target.value) }))}
                  className="w-full px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-600 bg-transparent text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 w-10">Cols</label>
                <input
                  type="number" min="1" max="8" value={tableSize.cols}
                  onChange={(e) => setTableSize((s) => ({ ...s, cols: Number(e.target.value) }))}
                  className="w-full px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-600 bg-transparent text-xs"
                />
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={insertTable}
                className="w-full py-1.5 rounded-md bg-[#1a1a1a] text-white text-[11px] font-bold hover:bg-neutral-800"
              >
                Insert table
              </button>
            </div>
          )}
        </div>

        {/* More */}
        <div className="relative">
          <button
            type="button"
            title="More formatting"
            disabled={showSource}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpenMenu(openMenu === 'more' ? null : 'more')}
            className="px-1.5 py-1 rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 text-sm font-bold leading-none disabled:opacity-40"
          >
            …
          </button>
          {openMenu === 'more' && (
            <div className="absolute left-0 top-full mt-1 z-30 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#242424] shadow-xl w-44">
              {[
                { label: 'Strikethrough', icon: Strikethrough, run: () => exec('strikeThrough') },
                { label: 'Quote', icon: Quote, run: () => exec('formatBlock', '<blockquote>') },
                { label: 'Horizontal rule', icon: Minus, run: () => exec('insertHorizontalRule') },
                { label: 'Clear formatting', icon: RemoveFormatting, run: () => exec('removeFormat') }
              ].map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={a.run}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <a.icon className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto">
          <ToolbarButton
            title={showSource ? 'Back to rich text' : 'Edit HTML'}
            active={showSource}
            onClick={() => setShowSource((v) => !v)}
          >
            <Code2 className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { handleImageFile(e.target.files?.[0]); e.target.value = ''; }}
        />
      </div>

      {/* ── Editing surface ── */}
      {showSource ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          style={{ minHeight }}
          className="w-full px-3 py-2.5 text-[11px] font-mono leading-relaxed bg-transparent outline-none resize-y text-neutral-800 dark:text-neutral-200"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          data-placeholder={placeholder}
          style={{ minHeight }}
          className="rte-surface w-full px-3 py-2.5 text-xs leading-relaxed outline-none overflow-y-auto max-h-[420px] custom-scrollbar text-neutral-800 dark:text-neutral-200"
        />
      )}
    </div>
  );
};

export default RichTextEditor;
