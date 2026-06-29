import Image from "next/image";

export interface ProduitCardProps {
  title: string;
  image: string;
}

export function ProduitCard({ title, image }: ProduitCardProps) {
  return (
    <div className="relative bg-[#fcfcfc] border border-slate-100 rounded-[1.25rem] p-6 pt-20 transition-all hover:shadow-md hover:border-slate-200">
      {/* Overlapping circular image */}
      <div className="absolute -top-12 left-6 w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-sm bg-white">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      {/* Card Title */}
      <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
        {title}
      </h3>
    </div>
  );
}
