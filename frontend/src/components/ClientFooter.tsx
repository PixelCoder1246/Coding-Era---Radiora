'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

// Hides the global footer on app pages (doctor, admin) where it doesn't belong.
// Marketing pages (/, /features, /company/*) still get the footer.
export default function ClientFooter() {
  const pathname = usePathname();

  const noFooterRoutes = ['/doctor', '/admin'];
  const shouldHide = noFooterRoutes.some(route => pathname.startsWith(route));

  if (shouldHide) return null;
  return <Footer />;
}
