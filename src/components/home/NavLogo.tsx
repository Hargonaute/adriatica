import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';

export function NavLogo({ locale }: { locale: Locale }) {
  return (
    <Link href={`/${locale}`} className="flex items-center group">
      <Image
        src="/images Adriatica/logo.png"
        alt="Maghreb Adriatica"
        width={222}
        height={32}
        priority
        className="h-8 w-auto transition-transform group-hover:scale-105"
      />
    </Link>
  );
}
