import type { Metadata } from 'next';

// Admin UI is never indexed (A10); the X-Robots-Tag header is set in next.config.ts.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
