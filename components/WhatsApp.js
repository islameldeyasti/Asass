import {MessageCircle} from 'lucide-react';
import {company} from '@/data/company';

export default function WhatsApp() {
  return (
    <a
      className="whatsapp"
      href={`https://wa.me/${company.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ASAS"
    >
      <MessageCircle size={20} />
    </a>
  );
}
