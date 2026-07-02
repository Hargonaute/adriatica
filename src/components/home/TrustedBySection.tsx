import { Infinity, Hexagon, Link2, Blocks, CircleDashed } from "lucide-react";
import { TrustedByLogo, TrustedByLogoProps } from "./TrustedByLogo";

export interface TrustedBySectionProps {}

const LOGOS: TrustedByLogoProps[] = [
  { name: "StackEd Lab" },
  { name: "Magnolia", icon: Infinity },
  { name: "Powersurge", icon: Hexagon },
  { name: "Warpspeed", icon: Link2 },
  { name: "Leapyear", icon: Blocks },
  { name: "EasyTrack", icon: CircleDashed },
];

export function TrustedBySection(_props: TrustedBySectionProps) {
  return (
    <section className="bg-[#BC0D2A] w-full pt-24 pb-12 -mt-16 sm:pt-32 sm:pb-16 sm:-mt-24 relative z-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <p className="text-white/90 text-sm font-medium mb-12">
          Utilisé par les leaders de l&apos;industrie
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 md:gap-x-16 gap-y-10 opacity-90">
          {LOGOS.map((logo) => (
            <TrustedByLogo key={logo.name} {...logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
