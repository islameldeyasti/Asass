import {ArrowUpRight, Mail} from 'lucide-react';
import {services} from '@/data/services';
import {company} from '@/data/company';

export default function HomeContactForm({locale = 'en'}) {
  const ar = locale === 'ar';

  return (
    <form
      className="home-contact-form"
      action={`mailto:${company.email}`}
      method="post"
      encType="text/plain"
    >
      <div className="home-contact-fields">
        <label>
          <span>{ar ? 'الاسم' : 'Your name'}</span>
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          <span>{ar ? 'البريد الإلكتروني' : 'Your email'}</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>{ar ? 'رقم الهاتف' : 'Phone number'}</span>
          <input name="phone" type="tel" autoComplete="tel" />
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
          <textarea name="message" rows={5} required />
        </label>
      </div>
      <button type="submit">
        <Mail size={17} aria-hidden="true" />
        {ar ? 'فتح البريد لإرسال الاستفسار' : 'Open email to send enquiry'}
        <ArrowUpRight size={17} aria-hidden="true" />
      </button>
      <p className="home-contact-note">
        {ar
          ? 'يفتح تطبيق البريد لديك برسالة جاهزة إلى فريق ASAS.'
          : 'Opens your email app with a message ready for the ASAS team.'}
      </p>
    </form>
  );
}
