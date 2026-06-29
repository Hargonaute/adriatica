import Link from "next/link";

export interface NavLogoProps {}

export function NavLogo(_props: NavLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="flex items-center">
        <div className="bg-[#BC0D2A] rounded-l-sm w-12 h-8 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105">
          <span className="text-white font-bold text-sm italic z-10">TK</span>
          <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-2 w-4"></div>
        </div>
        <div className="flex flex-col ml-2 justify-center">
          <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
            <span className="text-[#328542]">A</span>driatica
          </span>
          <div className="flex h-0.5 mt-0.5">
            <div className="w-1/3 bg-[#BC0D2A]"></div>
            <div className="w-2/3 bg-[#328542]"></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
