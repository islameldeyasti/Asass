'use client';

import {useEffect, useRef} from 'react';

function isBlank(value) {
  return !String(value ?? '').trim();
}

function InlineField({
  as: Tag = 'span',
  value,
  fieldKey,
  placeholder,
  multiline = false,
  onChange,
  onSelect,
  className = '',
}) {
  const ref = useRef(null);
  const focused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || focused.current) return;
    const next = String(value || '');
    if ((el.textContent || '') !== next) el.textContent = next;
    if (isBlank(next)) el.setAttribute('data-empty', '');
    else el.removeAttribute('data-empty');
  }, [value]);

  return (
    <Tag
      ref={ref}
      className={`lh-inline${className ? ` ${className}` : ''}`}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline ? 'true' : undefined}
      data-placeholder={placeholder}
      data-empty={isBlank(value) ? '' : undefined}
      onFocus={() => {
        focused.current = true;
        onSelect?.(fieldKey);
      }}
      onInput={(e) => {
        const text = multiline
          ? e.currentTarget.innerText.replace(/\n$/, '')
          : e.currentTarget.textContent || '';
        if (isBlank(text)) e.currentTarget.setAttribute('data-empty', '');
        else e.currentTarget.removeAttribute('data-empty');
        onChange?.(fieldKey, text);
      }}
      onBlur={(e) => {
        focused.current = false;
        const text = multiline
          ? e.currentTarget.innerText.replace(/\n$/, '')
          : e.currentTarget.textContent || '';
        onChange?.(fieldKey, text);
      }}
    />
  );
}

/**
 * Meta / recipient / subject / signature — inline on the page.
 */
export default function LetterDocumentFields({
  doc,
  language = 'en',
  editable = false,
  selectedBlock,
  onSelectBlock,
  onChangeField,
}) {
  const ar = language === 'ar';
  const labels = ar
    ? {
        date: 'التاريخ',
        ref: 'المرجع',
        subject: 'الموضوع',
        recipient: 'المستلم',
        company: 'الشركة',
        address: 'العنوان',
        closing: 'الختام',
        name: 'اسم الموقّع',
        title: 'المسمى',
        addSig: 'إضافة توقيع',
      }
    : {
        date: 'Date',
        ref: 'Reference',
        subject: 'Subject',
        recipient: 'Recipient',
        company: 'Company',
        address: 'Address',
        closing: 'Closing',
        name: 'Signatory name',
        title: 'Position',
        addSig: 'Add signature',
      };

  function formatDate(value) {
    if (!value) return '';
    try {
      const d = new Date(`${value}T00:00:00`);
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleDateString(ar ? 'ar-AE' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return value;
    }
  }

  const block = (id, className, children) => (
    <div
      className={`${className}${editable && selectedBlock === id ? ' is-selected' : ''}${editable ? ' lh-block' : ''}`}
      onClick={editable ? () => onSelectBlock?.(id) : undefined}
    >
      {children}
    </div>
  );

  const hasRecipient =
    !isBlank(doc.recipientName) ||
    !isBlank(doc.recipientCompany) ||
    !isBlank(doc.recipientAddress);

  return (
    <>
      {block(
        'meta',
        'lh-meta-grid',
        <>
          <div>
            <span className="lh-meta-label">{labels.date}</span>
            {editable ? (
              <input
                type="date"
                className="lh-inline lh-date-input"
                value={doc.date || ''}
                onChange={(e) => onChangeField?.('date', e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              formatDate(doc.date)
            )}
          </div>
          <div>
            <span className="lh-meta-label">{labels.ref}</span>
            {editable ? (
              <InlineField
                value={doc.reference}
                fieldKey="reference"
                placeholder={labels.ref}
                onChange={onChangeField}
                onSelect={() => onSelectBlock?.('meta')}
              />
            ) : (
              doc.reference || null
            )}
          </div>
        </>,
      )}

      {(editable || hasRecipient) &&
        block(
          'recipient',
          'lh-recipient',
          editable ? (
            <>
              <InlineField
                as="div"
                value={doc.recipientName}
                fieldKey="recipientName"
                placeholder={labels.recipient}
                onChange={onChangeField}
                onSelect={() => onSelectBlock?.('recipient')}
              />
              <InlineField
                as="div"
                value={doc.recipientCompany}
                fieldKey="recipientCompany"
                placeholder={labels.company}
                onChange={onChangeField}
                onSelect={() => onSelectBlock?.('recipient')}
              />
              <InlineField
                as="div"
                value={doc.recipientAddress}
                fieldKey="recipientAddress"
                placeholder={labels.address}
                multiline
                onChange={onChangeField}
                onSelect={() => onSelectBlock?.('recipient')}
              />
            </>
          ) : (
            <div className="lh-recipient-static">
              {[doc.recipientName, doc.recipientCompany, doc.recipientAddress]
                .filter((x) => !isBlank(x))
                .join('\n')}
            </div>
          ),
        )}

      {(editable || !isBlank(doc.subject)) &&
        block(
          'subject',
          'lh-subject',
          editable ? (
            <InlineField
              as="h1"
              value={doc.subject}
              fieldKey="subject"
              placeholder={labels.subject}
              className="lh-subject-text"
              onChange={onChangeField}
              onSelect={() => onSelectBlock?.('subject')}
            />
          ) : (
            <h1>{doc.subject}</h1>
          ),
        )}
    </>
  );
}

export function LetterSignatureFields({
  doc,
  language = 'en',
  editable = false,
  selectedBlock,
  onSelectBlock,
  onChangeField,
}) {
  const ar = language === 'ar';
  const labels = ar
    ? {closing: 'الختام', name: 'اسم الموقّع', title: 'المسمى', addSig: 'إضافة توقيع'}
    : {closing: 'Closing', name: 'Signatory name', title: 'Position', addSig: 'Add signature'};

  const hasAny =
    !isBlank(doc.closing) ||
    !isBlank(doc.signatoryName) ||
    !isBlank(doc.signatoryTitle) ||
    !isBlank(doc.signatureImage) ||
    !isBlank(doc.stampImage);

  if (!editable && !hasAny) return null;

  return (
    <div
      className={`lh-closing lh-block${selectedBlock === 'signature' ? ' is-selected' : ''}`}
      onClick={editable ? () => onSelectBlock?.('signature') : undefined}
    >
      {(editable || !isBlank(doc.closing)) &&
        (editable ? (
          <p>
            <InlineField
              value={doc.closing}
              fieldKey="closing"
              placeholder={labels.closing}
              onChange={onChangeField}
              onSelect={() => onSelectBlock?.('signature')}
            />
          </p>
        ) : (
          <p>{doc.closing}</p>
        ))}

      <div className="lh-sign-block">
        {(doc.signatureImage || doc.stampImage) && (
          <div className="lh-sign-images">
            {doc.signatureImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="lh-signature-img" src={doc.signatureImage} alt="" />
            ) : null}
            {doc.stampImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="lh-stamp-img" src={doc.stampImage} alt="" />
            ) : null}
          </div>
        )}
        {editable && !doc.signatureImage ? (
          <button
            type="button"
            className="lh-add-signature no-print"
            onClick={(e) => {
              e.stopPropagation();
              onSelectBlock?.('signature');
            }}
          >
            {labels.addSig}
          </button>
        ) : null}
        {(editable || !isBlank(doc.signatoryName)) &&
          (editable ? (
            <p className="lh-signatory-name">
              <InlineField
                value={doc.signatoryName}
                fieldKey="signatoryName"
                placeholder={labels.name}
                onChange={onChangeField}
                onSelect={() => onSelectBlock?.('signature')}
              />
            </p>
          ) : (
            <p className="lh-signatory-name">{doc.signatoryName}</p>
          ))}
        {(editable || !isBlank(doc.signatoryTitle)) &&
          (editable ? (
            <p className="lh-signatory-title">
              <InlineField
                value={doc.signatoryTitle}
                fieldKey="signatoryTitle"
                placeholder={labels.title}
                onChange={onChangeField}
                onSelect={() => onSelectBlock?.('signature')}
              />
            </p>
          ) : (
            <p className="lh-signatory-title">{doc.signatoryTitle}</p>
          ))}
      </div>
    </div>
  );
}
