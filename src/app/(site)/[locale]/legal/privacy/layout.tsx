import { legalMetadata } from '../legalMetadata';

export const generateMetadata = legalMetadata('privacy');

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
