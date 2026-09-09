'use client';

import {ArrowUpRight, Mail} from 'lucide-react';
import {services} from '@/data/services';
import {company} from '@/data/company';

const REQUIRED_MSG = {
  en: 'Please fill out this field.',
  ar: 'يرجى تعبئة هذا الحقل.',
};

const EMAIL_MSG = {
  en: 'Please enter a valid email address.',
  ar: 'يرجى إدخال بريد إلكتروني صالح.',
};

export default function HomeContactForm({locale = 'en'}) {
  const ar = locale === 'ar';
  const requiredMsg = ar ? REQUIRED_MSG.ar : REQUIRED_MSG.en;
  const emailMsg = ar ? EMAIL_MSG.ar : EMAIL_MSG.en;

  function applyValidity(event) {
    const el = event.currentTarget;
    if (el.validity.valueMissing) {
      el.setCustomValidity(requiredMsg);
      return;
    }
    if (el.type === 'email' && el.validity.typeMismatch) {
      el.setCustomValidity(emailMsg);
      return;
    }
    el.setCustomValidity('');
  }

  function clearValidity(event) {
    event.currentTarget.setCustomValidity('');
  }

  return (
    <form
      className="home-contact-form"
      action={`mailto:${company.email}`}
      method="post"
      encType="text/plain"
      lang={ar ? 'ar' : 'en'}
    >
      <div className="home-contact-fields">
        <label>
          <span>{ar ? 'الاسم' : 'Your name'}</span>
          <input
            name="name"
            autoComplete="name"
            required
            onInvalid={applyValidity}
            onInput={clearValidity}
          />
        </label>
        <label>
          <span>{ar ? 'البريد الإلكتروني' : 'Your email'}</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            dir="ltr"
            onInvalid={applyValidity}
            onInput={clearValidity}
          />
        </label>
        <label>
          <span>{ar ? 'رقم الهاتف' : 'Phone number'}</span>
          <input name="phone" type="tel" autoComplete="tel" dir="ltr" />
        </label>
        <label>
          <span>{ar ? 'الخدمة المطلوبة' : 'Service'}</span>
          <select name="service" defaultValue="">
            <option value="" disabled>{ar ? 'اختر خدمة' : 'Select a service'}</option>
            {services.map((service) => (
              <option value={service.slug} key={service.slug}>
                {ar ? service.titleAr : service.title}
              </option>
            ))}
          </select>
        </label>
        <label className="home-contact-message">
          <span>{ar ? 'أخبرنا عن مشروعك' : 'Tell us about your project'}</span>
          <textarea
            name="message"
            rows={5}
            required
            onInvalid={applyValidity}
            onInput={clearValidity}
          />
        </label>
      </div>
      <button type="submit">
        <Mail size={17} aria-hidden="true" />
        {ar ? 'فتح البريد لإرسال الاستفسار' : 'Open email to send enquiry'}
        <ArrowUpRight size={17} aria-hidden="true" className={ar ? 'reverse-arrow' : ''} />
      </button>
      <p className="home-contact-note">
        {ar
          ? 'يفتح تطبيق البريد لديك برسالة جاهزة إلى فريق ASAS.'
          : 'Opens your email app with a message ready for the ASAS team.'}
      </p>
    </form>
  );
}
