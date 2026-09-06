import Link from 'next/link';
import Image from 'next/image';

export default function Brand({locale='en',light=false,symbolOnly=false}){
  return <Link className={`brand ${light?'light':''} ${symbolOnly?'symbol-only':''}`} href={`/${locale}`} aria-label="ASAS home">
    <Image src="/brand/asas-mark-header.png" alt="ASAS" width={68} height={68} priority />
    {!symbolOnly&&<span className="brand-type"><b>ASAS ENGINEERING &amp; PROJECT</b><small>MANAGEMENT CONSULTANCY</small></span>}
  </Link>
}
