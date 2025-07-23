import Footer from '@/components/ecommerce/Footer';
import TopNav from '@/components/ecommerce/TopNav';
import { CartProvider } from '@/providers/CartProvider';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <TopNav />
      {children}
      <Footer />
    </CartProvider>
  );
}
