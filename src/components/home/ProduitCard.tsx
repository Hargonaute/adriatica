import Image from "next/image";
import Link from "next/link";

export interface ProduitCardProps {
  title: string;
  image: string;
  /** When set, the whole card is a real link (<a href>). */
  href?: string;
}

export function ProduitCard({ title, image, href }: ProduitCardProps) {
  const card = (
    <div className="relative bg-[#fcfcfc] border border-slate-100 rounded-[1.25rem] p-6 pt-20 transition-all hover:shadow-md hover:border-slate-200">
      {/* Overlapping circular image */}
      <div className="absolute -top-12 left-6 w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-sm bg-white">
        {/* Decorative inside a link: the title already names the link. */}
        <Image src={image} alt={href ? "" : title} fill className="object-cover" />
      </div>
      {/* Card Title */}
      <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
        {title}
      </h3>
    </div>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      className="block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BC0D2A] focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}
