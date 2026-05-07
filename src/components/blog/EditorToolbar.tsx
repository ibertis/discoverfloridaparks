'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Minus,
  Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, Undo, Redo,
  Columns2, Plus, Trash2, X, Check, Code2,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
  sourceMode?: boolean;
  onToggleSource?: () => void;
}

const BTN = 'p-1.5 rounded transition-colors';
const ACTIVE = 'bg-[#ff7044]/15 text-[#ff7044]';
const INACTIVE = 'text-[#413734] hover:bg-[#eeeeee]';

function ToolBtn({ onClick, active, title, children, muted }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode; muted?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); if (!muted) onClick(); }}
      title={title}
      className={`${BTN} ${active ? ACTIVE : INACTIVE}`}
      style={muted ? { opacity: 0.3, cursor: 'default' } : undefined}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span style={{ width: 1, height: 20, background: '#e4e0dc', flexShrink: 0 }} />;
}

export default function EditorToolbar({ editor, sourceMode = false, onToggleSource }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [linkAffiliate, setLinkAffiliate] = useState(false);

  const disabled = sourceMode || !editor;
  const inTable = !disabled && editor!.isActive('table');

  function applyLink() {
    if (!editor) return;
    if (!linkUrl) { editor.chain().focus().unsetLink().run(); setLinkOpen(false); return; }
    const rel = linkAffiliate
      ? 'nofollow sponsored noopener noreferrer'
      : (linkNewTab ? 'noopener noreferrer' : undefined);
    editor.chain().focus().extendMarkRange('link').setLink({
      href: linkUrl,
      target: linkNewTab ? '_blank' : null,
      ...(rel ? { rel } : {}),
    }).run();
    setLinkOpen(false);
    setLinkUrl('');
    setLinkAffiliate(false);
  }

  function openLinkPopover() {
    if (disabled) return;
    const prev = editor?.getAttributes('link').href ?? '';
    setLinkUrl(prev);
    setLinkOpen(true);
  }

  function addImage() {
    if (disabled) return;
    const url = window.prompt('Image URL');
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div style={{ borderBottom: '1px solid #eeeeee', background: '#f9f7f5', padding: '6px 10px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative' }}>

      {/* Text formatting */}
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().toggleBold().run()} active={!disabled && editor!.isActive('bold')} title="Bold"><Bold size={15} /></ToolBtn>
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().toggleItalic().run()} active={!disabled && editor!.isActive('italic')} title="Italic"><Italic size={15} /></ToolBtn>
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().toggleUnderline().run()} active={!disabled && editor!.isActive('underline')} title="Underline"><UnderlineIcon size={15} /></ToolBtn>
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().toggleStrike().run()} active={!disabled && editor!.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></ToolBtn>
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().toggleCode().run()} active={!disabled && editor!.isActive('code')} title="Inline code"><Code size={15} /></ToolBtn>

      <Divider />

      {/* Headings */}
      {([2, 3, 4] as const).map(level => (
        <ToolBtn key={level} muted={disabled} onClick={() => editor?.chain().focus().toggleHeading({ level }).run()} active={!disabled && editor!.isActive('heading', { level })} title={`Heading ${level}`}>
          <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.72rem' }}>H{level}</span>
        </ToolBtn>
      ))}

      <Divider />

      {/* Alignment */}
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={!disabled && editor!.isActive({ textAlign: 'left' })} title="Align left"><AlignLeft size={15} /></ToolBtn>
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={!disabled && editor!.isActive({ textAlign: 'center' })} title="Align center"><AlignCenter size={15} /></ToolBtn>
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={!disabled && editor!.isActive({ textAlign: 'right' })} title="Align right"><AlignRight size={15} /></ToolBtn>

      <Divider />

      {/* Lists */}
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().toggleBulletList().run()} active={!disabled && editor!.isActive('bulletList')} title="Bullet list"><List size={15} /></ToolBtn>
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={!disabled && editor!.isActive('orderedList')} title="Ordered list"><ListOrdered size={15} /></ToolBtn>

      <Divider />

      {/* Blocks */}
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={!disabled && editor!.isActive('blockquote')} title="Blockquote"><Quote size={15} /></ToolBtn>
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={!disabled && editor!.isActive('codeBlock')} title="Code block">
        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 700 }}>```</span>
      </ToolBtn>
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal rule"><Minus size={15} /></ToolBtn>

      <Divider />

      {/* Insert */}
      <ToolBtn muted={disabled} onClick={openLinkPopover} active={!disabled && editor!.isActive('link')} title="Insert link"><LinkIcon size={15} /></ToolBtn>
      <ToolBtn muted={disabled} onClick={addImage} active={false} title="Insert image"><ImageIcon size={15} /></ToolBtn>
      <ToolBtn muted={disabled} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={false} title="Insert table"><TableIcon size={15} /></ToolBtn>

      {/* Table controls — only when cursor is inside a table */}
      {inTable && (
        <>
          <Divider />
          <ToolBtn onClick={() => editor!.chain().focus().addColumnBefore().run()} active={false} title="Add column before">
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>+Col←</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor!.chain().focus().addColumnAfter().run()} active={false} title="Add column after">
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>+Col→</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor!.chain().focus().deleteColumn().run()} active={false} title="Delete column">
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap', color: '#e85a2e' }}>−Col</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor!.chain().focus().addRowBefore().run()} active={false} title="Add row before">
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>+Row↑</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor!.chain().focus().addRowAfter().run()} active={false} title="Add row after">
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>+Row↓</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor!.chain().focus().deleteRow().run()} active={false} title="Delete row">
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap', color: '#e85a2e' }}>−Row</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor!.chain().focus().deleteTable().run()} active={false} title="Delete table">
            <Trash2 size={13} style={{ color: '#e85a2e' }} />
          </ToolBtn>
        </>
      )}

      <Divider />

      {/* History */}
      <ToolBtn muted={disabled && !sourceMode} onClick={() => editor?.chain().focus().undo().run()} active={false} title="Undo"><Undo size={15} /></ToolBtn>
      <ToolBtn muted={disabled && !sourceMode} onClick={() => editor?.chain().focus().redo().run()} active={false} title="Redo"><Redo size={15} /></ToolBtn>

      {/* Source / HTML toggle — always available */}
      {onToggleSource && (
        <>
          <Divider />
          <ToolBtn onClick={onToggleSource} active={sourceMode} title={sourceMode ? 'Switch to Visual editor' : 'Edit raw HTML'}>
            <Code2 size={15} />
          </ToolBtn>
        </>
      )}

      {/* Link popover */}
      {linkOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 50,
          background: '#fff', border: '1px solid #eeeeee', borderRadius: 12,
          padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          minWidth: 320, marginTop: 4,
        }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#726d6b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
            Insert Link
          </p>
          <input
            autoFocus
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setLinkOpen(false); }}
            placeholder="https://..."
            style={{ width: '100%', border: '1px solid #eeeeee', borderRadius: 8, padding: '8px 12px', fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#413734', cursor: 'pointer', marginBottom: 8 }}>
            <input type="checkbox" checked={linkNewTab} onChange={e => setLinkNewTab(e.target.checked)} />
            Open in new tab
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#413734', cursor: 'pointer', marginBottom: 14 }}>
            <input type="checkbox" checked={linkAffiliate} onChange={e => setLinkAffiliate(e.target.checked)} />
            Affiliate / sponsored link <span style={{ color: '#a6967c', fontSize: '0.72rem' }}>(adds nofollow)</span>
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={applyLink}
              style={{ flex: 1, background: '#ff7044', color: '#fff', border: 'none', borderRadius: '2.3em', padding: '8px 16px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setLinkOpen(false)}
              style={{ background: '#f0ede9', color: '#413734', border: 'none', borderRadius: '2.3em', padding: '8px 14px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
