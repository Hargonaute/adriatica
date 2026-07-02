import { Search, ChevronDown } from "lucide-react";

export interface NavActionsProps {}

export function NavActions(_props: NavActionsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        aria-label="Changer de langue"
        className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
      >
        FR <ChevronDown size={14} className="text-slate-400" />
      </button>
      <button
        aria-label="Rechercher"
        className="hidden sm:inline-flex bg-[#BC0D2A] p-2.5 rounded-md text-white hover:bg-[#9A0B22] transition-colors shadow-sm shadow-red-500/20"
      >
        <Search size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}
