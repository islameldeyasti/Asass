'use client';

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Table,
  Underline,
  Undo2,
} from 'lucide-react';

function Btn({title, onClick, active, disabled, children}) {
  return (
    <button
      type="button"
      className={`lhs-tb-btn${active ? ' is-active' : ''}`}
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="lhs-tb-sep" aria-hidden />;
}

/**
 * Word-like TipTap toolbar — compact icons + tooltips.
 */
export default function LetterheadToolbar({editor, canWrite = false, dir = 'ltr'}) {
  if (!editor) return null;

  const disabled = !canWrite;

  function setLink() {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL', prev);
    if (url === null) return;
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({href: url}).run();
  }

  return (
    <div className="lhs-word-toolbar no-print" role="toolbar" aria-label="Formatting">
      <Btn title="Undo" disabled={disabled} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={15} />
      </Btn>
      <Btn title="Redo" disabled={disabled} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={15} />
      </Btn>
      <Sep />

      <select
        className="lhs-tb-select"
        disabled={disabled}
        title="Paragraph style"
        value={
          editor.isActive('heading', {level: 1})
            ? 'h1'
            : editor.isActive('heading', {level: 2})
              ? 'h2'
              : editor.isActive('heading', {level: 3})
                ? 'h3'
                : 'p'
        }
        onChange={(e) => {
          const v = e.target.value;
          if (v === 'p') editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({level: Number(v.slice(1))}).run();
        }}
      >
        <option value="p">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <select
        className="lhs-tb-select"
        disabled={disabled}
        title="Font size"
        defaultValue=""
        onChange={(e) => {
          const v = e.target.value;
          if (!v) editor.chain().focus().unsetFontSize?.().run();
          else editor.chain().focus().setFontSize(v).run();
        }}
      >
        <option value="">Size</option>
        <option value="10pt">10</option>
        <option value="11pt">11</option>
        <option value="12pt">12</option>
        <option value="14pt">14</option>
        <option value="16pt">16</option>
        <option value="18pt">18</option>
      </select>

      <select
        className="lhs-tb-select"
        disabled={disabled}
        title="Line spacing"
        defaultValue=""
        onChange={(e) => {
          const v = e.target.value;
          if (v) editor.chain().focus().setLineHeight(v).run();
        }}
      >
        <option value="">Spacing</option>
        <option value="1.15">1.15</option>
        <option value="1.5">1.5</option>
        <option value="1.75">1.75</option>
        <option value="2">2.0</option>
      </select>

      <Sep />

      <Btn
        title="Bold"
        disabled={disabled}
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </Btn>
      <Btn
        title="Italic"
        disabled={disabled}
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </Btn>
      <Btn
        title="Underline"
        disabled={disabled}
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={15} />
      </Btn>
      <Btn
        title="Strikethrough"
        disabled={disabled}
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={15} />
      </Btn>

      <Sep />

      <Btn
        title="Align left"
        disabled={disabled}
        active={editor.isActive({textAlign: 'left'})}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeft size={15} />
      </Btn>
      <Btn
        title="Align center"
        disabled={disabled}
        active={editor.isActive({textAlign: 'center'})}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenter size={15} />
      </Btn>
      <Btn
        title="Align right"
        disabled={disabled}
        active={editor.isActive({textAlign: 'right'})}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRight size={15} />
      </Btn>
      <Btn
        title="Justify"
        disabled={disabled}
        active={editor.isActive({textAlign: 'justify'})}
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <AlignJustify size={15} />
      </Btn>

      <Sep />

      <Btn
        title="Bullets"
        disabled={disabled}
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </Btn>
      <Btn
        title="Numbered list"
        disabled={disabled}
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </Btn>
      <Btn
        title="Indent"
        disabled={disabled}
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
      >
        <IndentIncrease size={15} />
      </Btn>
      <Btn
        title="Outdent"
        disabled={disabled}
        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
      >
        <IndentDecrease size={15} />
      </Btn>

      <Sep />

      <Btn title="Link" disabled={disabled} active={editor.isActive('link')} onClick={setLink}>
        <Link2 size={15} />
      </Btn>
      <Btn
        title="Insert table"
        disabled={disabled}
        onClick={() =>
          editor.chain().focus().insertTable({rows: 3, cols: 3, withHeaderRow: true}).run()
        }
      >
        <Table size={15} />
      </Btn>
      <Btn
        title="Horizontal rule"
        disabled={disabled}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        ―
      </Btn>
      <Btn
        title="Page break"
        disabled={disabled}
        onClick={() => editor.chain().focus().setPageBreak().run()}
      >
        ⤵
      </Btn>
      <Btn
        title="Clear formatting"
        disabled={disabled}
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        <RemoveFormatting size={15} />
      </Btn>

      <Sep />

      <Btn
        title="Paragraph"
        disabled={disabled}
        active={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow size={15} />
      </Btn>
      <Btn
        title="Heading 1"
        disabled={disabled}
        active={editor.isActive('heading', {level: 1})}
        onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
      >
        <Heading1 size={15} />
      </Btn>
      <Btn
        title="Heading 2"
        disabled={disabled}
        active={editor.isActive('heading', {level: 2})}
        onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
      >
        <Heading2 size={15} />
      </Btn>
      <Btn
        title="Heading 3"
        disabled={disabled}
        active={editor.isActive('heading', {level: 3})}
        onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
      >
        <Heading3 size={15} />
      </Btn>

      <span className="lhs-tb-dir">{dir === 'rtl' ? 'RTL' : 'LTR'}</span>
    </div>
  );
}
