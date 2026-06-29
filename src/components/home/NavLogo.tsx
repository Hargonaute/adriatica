import Image from "next/image";
import Link from "next/link";

export interface NavLogoProps {}

export function NavLogo(_props: NavLogoProps) {
  return (
    <Link href="/" className="flex items-center group">
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
