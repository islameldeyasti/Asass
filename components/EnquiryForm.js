'use client';

import {useState} from 'react';
import {ArrowUpRight, CheckCircle2, Loader2, Mail} from 'lucide-react';
import {services} from '@/data/services';
import {company} from '@/data/company';

const EXTRA_OPTIONS = [
  {slug: 'other', title: 'Other', titleAr: 'أخرى'},
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initial = {
  name: '',
  email: '',
  phone: '',
  service: '',
  location: '',
  message: '',
};

export default function EnquiryForm({locale = 'en', id = 'project-enquiry-form'}) {
  const ar = locale === 'ar';
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const options = [...services, ...EXTRA_OPTIONS];

  const copy = ar
    ? {
        name: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        service: 'الخدمة المطلوبة',
        servicePlaceholder: 'اختر خدمة',
        location: 'موقع المشروع أو القطاع',
        locationHint: 'اختياري',
        message: 'تفاصيل المشروع',
        submit: 'إرسال الاستفسار',
        sending: 'جاري التحضير…',
        successTitle: 'شكراً لك',
        successBody: 'سيراجع فريق أساس للاستشارات الهندسية وإدارة المشاريع رسالتك ويتواصل معك قريباً.',
        reset: 'إرسال استفسار آخر',
        note: 'يفتح تطبيق البريد لديك برسالة جاهزة إلى فريق ASAS.',
        required: 'هذا الحقل مطلوب',
        emailInvalid: 'أدخل بريداً إلكترونياً صالحاً',
      }
    : {
        name: 'Full name',
        email: 'Email address',
        phone: 'Phone number',
        service: 'Service needed',
        servicePlaceholder: 'Select a service',
        location: 'Project location or sector',
        locationHint: 'Optional',
        message: 'Message / project details',
        submit: 'Submit Project Enquiry',
        sending: 'Preparing…',
        successTitle: 'Thanks — our team will be in touch shortly',
        successBody: 'Your enquiry is ready in your email app. Send it to reach the ASAS office in Abu Dhabi.',
        reset: 'Send another enquiry',
        note: 'Opens your email app with a message ready for the ASAS team.',
        required: 'This field is required',
        emailInvalid: 'Enter a valid email address',
      };

  function setField(key, value) {
    setValues((prev) => ({...prev, [key]: value}));
    if (errors[key]) setErrors((prev) => ({...prev, [key]: undefined}));
  }

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = copy.required;
    if (!values.email.trim()) next.email = copy.required;
    else if (!EMAIL_RE.test(values.email.trim())) next.email = copy.emailInvalid;
    if (!values.phone.trim()) next.phone = copy.required;
    if (!values.service) next.service = copy.required;
    if (!values.message.trim()) next.message = copy.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(event) {
    event.preventDefault();
    if (status === 'loading') return;
    if (!validate()) return;

    setStatus('loading');
    const serviceLabel =
      options.find((item) => item.slug === values.service)?.[ar ? 'titleAr' : 'title'] || values.service;

    const subject = ar
      ? `استفسار مشروع — ${values.name.trim()}`
      : `Project enquiry — ${values.name.trim()}`;

    const body = [
      ar ? `الاسم: ${values.name.trim()}` : `Name: ${values.name.trim()}`,
      ar ? `البريد: ${values.email.trim()}` : `Email: ${values.email.trim()}`,
      ar ? `الهاتف: ${values.phone.trim()}` : `Phone: ${values.phone.trim()}`,
      ar ? `الخدمة: ${serviceLabel}` : `Service: ${serviceLabel}`,
      values.location.trim()
        ? ar
          ? `الموقع / القطاع: ${values.location.trim()}`
          : `Location / sector: ${values.location.trim()}`
        : null,
      '',
      ar ? 'تفاصيل المشروع:' : 'Project details:',
      values.message.trim(),
    ]
      .filter(Boolean)
      .join('\n');

    window.setTimeout(() => {
      window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus('success');
    }, 450);
  }

  if (status === 'success') {
    return (
      <div className="enquiry-success" role="status">
        <CheckCircle2 size={28} aria-hidden="true" />
        <h3>{copy.successTitle}</h3>
        <p>{copy.successBody}</p>
        <button
          type="button"
          className="button enquiry-reset"
          onClick={() => {
            setValues(initial);
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
    <form className="enquiry-form" id={id} onSubmit={onSubmit} noValidate>
      <div className="enquiry-fields">
        <label className={errors.name ? 'has-error' : undefined}>
          <span>{copy.name}</span>
          <input
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
          />
          {errors.name && <em id={`${id}-name-error`}>{errors.name}</em>}
        </label>

        <label className={errors.email ? 'has-error' : undefined}>
          <span>{copy.email}</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
          />
          {errors.email && <em id={`${id}-email-error`}>{errors.email}</em>}
        </label>

        <label className={errors.phone ? 'has-error' : undefined}>
          <span>{copy.phone}</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            dir="ltr"
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
          />
          {errors.phone && <em id={`${id}-phone-error`}>{errors.phone}</em>}
        </label>

        <label className={errors.service ? 'has-error' : undefined}>
          <span>{copy.service}</span>
          <select
            name="service"
            value={values.service}
            onChange={(e) => setField('service', e.target.value)}
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? `${id}-service-error` : undefined}
          >
            <option value="" disabled>
              {copy.servicePlaceholder}
            </option>
            {options.map((service) => (
              <option value={service.slug} key={service.slug}>
                {ar ? service.titleAr : service.title}
              </option>
            ))}
          </select>
          {errors.service && <em id={`${id}-service-error`}>{errors.service}</em>}
        </label>

        <label className="enquiry-location">
          <span>
            {copy.location} <small>{copy.locationHint}</small>
          </span>
          <input
            name="location"
            autoComplete="off"
            value={values.location}
            onChange={(e) => setField('location', e.target.value)}
          />
        </label>

        <label className={`enquiry-message${errors.message ? ' has-error' : ''}`}>
          <span>{copy.message}</span>
          <textarea
            name="message"
            rows={5}
            value={values.message}
            onChange={(e) => setField('message', e.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? `${id}-message-error` : undefined}
          />
          {errors.message && <em id={`${id}-message-error`}>{errors.message}</em>}
        </label>
      </div>

      <button className="button enquiry-submit" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? (
          <>
            <Loader2 size={17} className="enquiry-spin" aria-hidden="true" />
            {copy.sending}
          </>
        ) : (
          <>
            <Mail size={17} aria-hidden="true" />
            {copy.submit}
            <ArrowUpRight size={17} aria-hidden="true" />
          </>
        )}
      </button>
      <p className="enquiry-note">{copy.note}</p>
    </form>
  );
}
