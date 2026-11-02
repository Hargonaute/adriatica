import { legalMetadata } from '../legalMetadata';

export const generateMetadata = legalMetadata('terms');

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
