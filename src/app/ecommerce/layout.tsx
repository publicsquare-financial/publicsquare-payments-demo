import Footer from '@/components/ecommerce/Footer'
import TopNav from '@/components/ecommerce/TopNav'

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <TopNav />
      {children}
      <Footer />
    </>
  )
}
