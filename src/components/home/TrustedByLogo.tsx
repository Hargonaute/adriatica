import { LucideIcon } from "lucide-react";

export interface TrustedByLogoProps {
  name: string;
  icon?: LucideIcon;
}

export function TrustedByLogo({ name, icon: Icon }: TrustedByLogoProps) {
  return (
    <div className="flex items-center gap-2 text-white">
      {Icon && <Icon size={32} strokeWidth={2.5} />}
      <span
        className={`font-bold text-xl md:text-2xl ${
          Icon ? "tracking-tight" : "tracking-tighter"
        }`}
      >
        {name}
      </span>
    </div>
  );
}
