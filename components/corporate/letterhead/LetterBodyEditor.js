'use client';

import {useEditor, EditorContent} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {TableKit} from '@tiptap/extension-table';
import {TextStyle, FontSize, LineHeight} from '@tiptap/extension-text-style';
import {useEffect} from 'react';
import {PageBreak} from './tiptap-extensions';

function normalizeHtml(html) {
  const value = String(html || '').trim();
  if (!value || value === '<p></p>') return '<p></p>';
  return value;
}

/**
 * TipTap Word-like body editor — lives only in the document body zone.
 */
export default function LetterBodyEditor({
  html,
  editable = true,
  dir = 'ltr',
  placeholder = 'Start writing your letter…',
  onChange,
  onFocus,
  onBlur,
  onSelectionUpdate,
  editorRef,
}) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: {levels: [1, 2, 3]},
        horizontalRule: true,
      }),
      Underline,
      TextStyle,
      FontSize,
      LineHeight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {rel: 'noopener noreferrer'},
      }),
      TableKit.configure({
        table: {
          resizable: true,
          HTMLAttributes: {class: 'lh-editor-table'},
        },
      }),
      Placeholder.configure({placeholder}),
      PageBreak,
    ],
    content: normalizeHtml(html),
    editorProps: {
      attributes: {
        class: 'lh-tiptap ProseMirror',
        dir,
        lang: dir === 'rtl' ? 'ar' : 'en',
      },
    },
    onUpdate: ({editor: ed}) => {
      onChange?.(ed.getHTML());
    },
    onSelectionUpdate: ({editor: ed}) => {
      onSelectionUpdate?.(ed);
    },
    onFocus: () => onFocus?.(),
    onBlur: () => onBlur?.(),
  });

  useEffect(() => {
    if (editorRef) editorRef.current = editor;
    return () => {
      if (editorRef) editorRef.current = null;
    };
  }, [editor, editorRef]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor) return;
    const next = normalizeHtml(html);
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next, {emitUpdate: false});
    }
  }, [html, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.view.dom.setAttribute('dir', dir);
  }, [editor, dir]);

  if (!editor) return <div className="lh-tiptap-skeleton" />;

  return (
    <div className={`lh-tiptap-wrap${editable ? ' is-editable' : ''}`} dir={dir}>
      <EditorContent editor={editor} />
    </div>
  );
}

export function StaticLetterBody({html, dir = 'ltr'}) {
  const value = normalizeHtml(html);
  const empty =
    !value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() &&
    !/<img\b/i.test(value) &&
    !/<table\b/i.test(value);

  if (empty) return null;

  return (
    <div
      className="lh-tiptap ProseMirror lh-body-static"
      dir={dir}
      dangerouslySetInnerHTML={{__html: value}}
    />
  );
}
