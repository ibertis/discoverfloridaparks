'use client';

import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExt from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import EditorToolbar from './EditorToolbar';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({ content, onChange, placeholder = 'Start writing...' }: TipTapEditorProps) {
  const [sourceMode, setSourceMode] = useState(false);
  // Uncontrolled ref — avoids re-rendering on every keystroke in source mode
  const sourceRef = useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {},
      }),
      ImageExt,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  function toggleSource() {
    if (!sourceMode) {
      // Visual → Source: snapshot current editor HTML
      sourceRef.current = editor?.getHTML() ?? sourceRef.current;
      setSourceMode(true);
    } else {
      // Source → Visual: parse raw HTML back into TipTap
      // TipTap will normalize unknown elements (iframes, scripts, etc.) on this transition
      editor?.commands.setContent(sourceRef.current);
      setSourceMode(false);
    }
  }

  return (
    <div className="tiptap-editor">
      <EditorToolbar editor={editor} sourceMode={sourceMode} onToggleSource={toggleSource} />
      {sourceMode ? (
        <textarea
          key="source"
          defaultValue={sourceRef.current}
          onChange={e => { sourceRef.current = e.target.value; onChange(e.target.value); }}
          style={{
            width: '100%',
            minHeight: 500,
            padding: '16px 20px',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            lineHeight: 1.7,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            color: '#413734',
            background: '#fafaf9',
            boxSizing: 'border-box',
          }}
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
