'use client';

import {useMemo, useState} from 'react';
import Link from 'next/link';
import {CheckCircle2, Loader2, Upload} from 'lucide-react';
import {
  GENERAL_APPLICATION,
  getOpenJobs,
} from '@/data/careers';
import {company} from '@/data/company';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];

const initial = {
  name: '',
  email: '',
  phone: '',
  position: '',
  portfolio: '',
  message: '',
  consent: false,
};

export default function ApplicationForm({
  locale = 'en',
  defaultPosition = 'general',
  lockedPosition = false,
}) {
  const ar = locale === 'ar';
  const openJobs = getOpenJobs();
  const [values, setValues] = useState({
    ...initial,
    position: defaultPosition || 'general',
  });
  const [cv, setCv] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');

  const positionOptions = useMemo(() => {
    const jobs = openJobs.map((job) => ({
      value: job.slug,
      label: ar ? job.titleAr : job.title,
    }));
    return [
      {
        value: GENERAL_APPLICATION.slug,
        label: ar ? GENERAL_APPLICATION.titleAr : GENERAL_APPLICATION.title,
      },
      ...jobs,
    ];
  }, [ar, openJobs]);

  const selectedLabel =
    positionOptions.find((opt) => opt.value === values.position)?.label ||
    (ar ? GENERAL_APPLICATION.titleAr : GENERAL_APPLICATION.title);

  const copy = ar
    ? {
        name: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        position: 'الوظيفة المتقدم لها',
        portfolio: 'رابط LinkedIn أو ملف الأعمال',
        portfolioHint: 'اختياري',
        cv: 'السيرة الذاتية',
        cvHint: 'PDF أو DOC/DOCX — بحد أقصى 5 ميجابايت',
        message: 'رسالة تعريفية',
        messageHint: 'اختياري',
        consent: `أوافق على معالجة بياناتي من قبل ASAS لغرض التوظيف، وفق سياسة الخصوصية.`,
        submit: 'إرسال الطلب',
        sending: 'جاري الإرسال…',
        successTitle: 'تم استلام طلبك',
        successBody: (role) =>
          `شكراً — استلمنا طلبك لوظيفة «${role}». سيراجعه الفريق ويتواصل معك عند وجود ملاءمة.`,
        reset: 'تقديم طلب آخر',
        required: 'هذا الحقل مطلوب',
        emailInvalid: 'أدخل بريداً إلكترونياً صالحاً',
        cvRequired: 'يرجى إرفاق السيرة الذاتية',
        cvType: 'يُقبل فقط PDF أو DOC أو DOCX',
        cvSize: 'حجم الملف يجب ألا يتجاوز 5 ميجابايت',
        consentRequired: 'يجب الموافقة على معالجة البيانات للمتابعة',
        privacy: 'سياسة الخصوصية',
      }
    : {
        name: 'Full name',
        email: 'Email address',
        phone: 'Phone number',
        position: 'Position applying for',
        portfolio: 'LinkedIn / portfolio URL',
        portfolioHint: 'Optional',
        cv: 'CV / Resume',
        cvHint: 'PDF or DOC/DOCX — max 5 MB',
        message: 'Cover letter / message',
        messageHint: 'Optional',
        consent: 'I agree to ASAS processing my data for recruitment purposes, in line with the privacy policy.',
        submit: 'Submit application',
        sending: 'Submitting…',
        successTitle: 'Application received',
        successBody: (role) =>
          `Thanks — we've received your application for ${role}. Our team will review it and reach out if there's a fit.`,
        reset: 'Submit another application',
        required: 'This field is required',
        emailInvalid: 'Enter a valid email address',
        cvRequired: 'Please attach your CV',
        cvType: 'Only PDF, DOC or DOCX files are accepted',
        cvSize: 'File must be 5 MB or smaller',
        consentRequired: 'Consent is required to continue',
        privacy: 'Privacy policy',
      };

  function setField(key, value) {
    setValues((prev) => ({...prev, [key]: value}));
    if (errors[key]) setErrors((prev) => ({...prev, [key]: undefined}));
  }

  function validateFile(file) {
    if (!file) return copy.cvRequired;
    const lower = file.name.toLowerCase();
    const extOk = ALLOWED_EXT.some((ext) => lower.endsWith(ext));
    const typeOk = !file.type || ALLOWED.includes(file.type) || extOk;
    if (!extOk || !typeOk) return copy.cvType;
    if (file.size > MAX_BYTES) return copy.cvSize;
    return '';
  }

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = copy.required;
    if (!values.email.trim()) next.email = copy.required;
    else if (!EMAIL_RE.test(values.email.trim())) next.email = copy.emailInvalid;
    if (!values.phone.trim()) next.phone = copy.required;
    if (!values.position) next.position = copy.required;
    const fileError = validateFile(cv);
    if (fileError) next.cv = fileError;
    if (!values.consent) next.consent = copy.consentRequired;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setServerError('');
    if (status === 'loading') return;
    if (!validate()) return;

    setStatus('loading');
    try {
      const body = new FormData();
      body.append('name', values.name.trim());
      body.append('email', values.email.trim());
      body.append('phone', values.phone.trim());
      body.append('position', values.position);
      body.append('positionLabel', selectedLabel);
      body.append('portfolio', values.portfolio.trim());
      body.append('message', values.message.trim());
      body.append('consent', values.consent ? 'yes' : 'no');
      body.append('locale', locale);
      body.append('cv', cv);

      const response = await fetch('/api/careers/apply', {
        method: 'POST',
        body,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || (ar ? 'تعذّر إرسال الطلب' : 'Could not submit application'));
      }
      setStatus('success');
    } catch (error) {
      setStatus('idle');
      setServerError(error.message || (ar ? 'حدث خطأ غير متوقع' : 'Unexpected error'));
    }
  }

  if (status === 'success') {
    return (
      <div className="careers-apply-success" role="status">
        <CheckCircle2 size={30} aria-hidden="true" />
        <h3>{copy.successTitle}</h3>
        <p>{copy.successBody(selectedLabel)}</p>
        <p className="careers-apply-success-note">
          {ar
            ? `للاستفسارات: ${company.email}`
            : `Questions: ${company.email}`}
        </p>
        <button
          type="button"
          className="button"
          onClick={() => {
            setValues({...initial, position: defaultPosition || 'general'});
            setCv(null);
            setErrors({});
            setStatus('idle');
          }}
        >
          {copy.reset}
        </button>
      </div>
    );
  }

  return (
    <form className="careers-apply-form" onSubmit={onSubmit} noValidate>
      <div className="careers-apply-fields">
        <label className={errors.name ? 'has-error' : undefined}>
          <span>{copy.name}</span>
          <input
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            autoComplete="name"
          />
          {errors.name && <em>{errors.name}</em>}
        </label>

        <label className={errors.email ? 'has-error' : undefined}>
          <span>{copy.email}</span>
          <input
            type="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            autoComplete="email"
          />
          {errors.email && <em>{errors.email}</em>}
        </label>

        <label className={errors.phone ? 'has-error' : undefined}>
          <span>{copy.phone}</span>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            autoComplete="tel"
          />
          {errors.phone && <em>{errors.phone}</em>}
        </label>

        <label className={errors.position ? 'has-error' : undefined}>
          <span>{copy.position}</span>
          <select
            value={values.position}
            onChange={(e) => setField('position', e.target.value)}
            disabled={lockedPosition}
          >
            {positionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.position && <em>{errors.position}</em>}
        </label>

        <label className="careers-apply-wide">
          <span>
            {copy.portfolio} <small>{copy.portfolioHint}</small>
          </span>
          <input
            type="url"
            placeholder="https://"
            value={values.portfolio}
            onChange={(e) => setField('portfolio', e.target.value)}
          />
        </label>

        <label className={`careers-apply-wide careers-apply-file${errors.cv ? ' has-error' : ''}`}>
          <span>
            {copy.cv} <small>{copy.cvHint}</small>
          </span>
          <div className="careers-file-box">
            <Upload size={18} aria-hidden="true" />
            <div>
              <strong>{cv ? cv.name : ar ? 'اختر ملفاً' : 'Choose a file'}</strong>
              <small>{cv ? `${Math.round(cv.size / 1024)} KB` : copy.cvHint}</small>
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setCv(file);
                if (errors.cv) setErrors((prev) => ({...prev, cv: undefined}));
              }}
            />
          </div>
          {errors.cv && <em>{errors.cv}</em>}
        </label>

        <label className="careers-apply-wide">
          <span>
            {copy.message} <small>{copy.messageHint}</small>
          </span>
          <textarea
            rows={4}
            value={values.message}
            onChange={(e) => setField('message', e.target.value)}
          />
        </label>

        <label className={`careers-apply-wide careers-consent${errors.consent ? ' has-error' : ''}`}>
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(e) => setField('consent', e.target.checked)}
          />
          <span>
            {copy.consent}{' '}
            <Link href={`/${locale}/privacy`}>{copy.privacy}</Link>
          </span>
          {errors.consent && <em>{errors.consent}</em>}
        </label>
      </div>

      {serverError && <p className="careers-apply-server-error">{serverError}</p>}

      <button className="button careers-apply-submit" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? (
          <>
            <Loader2 size={17} className="careers-spin" aria-hidden="true" />
            {copy.sending}
          </>
        ) : (
          copy.submit
        )}
      </button>

      <p className="careers-apply-note">
        {ar
          ? 'تُحفظ الطلبات داخلياً وتُوجَّه لبريد التوظيف في المكتب. لا حاجة لإرسال بريد يدوي مع المرفق.'
          : 'Applications are stored securely for the office hiring inbox. You do not need to email your CV separately.'}
      </p>
    </form>
  );
}
