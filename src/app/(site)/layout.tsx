import { Navbar } from '@/components/home/Navbar';
import { SiteFooter } from '@/components/home/SiteFooter';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <SiteFooter />
    </>
  );
}
