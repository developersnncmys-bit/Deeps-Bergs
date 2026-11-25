import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { MenuProvider } from "@/components/layout/menu-context";
import { MenuDrawer } from "@/components/layout/MenuDrawer";
import { AskAiFab } from "@/components/layout/AskAiFab";
import { AuthModal } from "@/components/account/AuthModal";
import { CartProvider } from "@/lib/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistProvider } from "@/lib/wishlist/WishlistContext";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>
        <MenuProvider>
          <AnnouncementBar />
          <TopNav />
          <main className="flex-1">{children}</main>
          <Footer />
          <MenuDrawer />
          <CartDrawer />
          <AskAiFab />
          <AuthModal />
        </MenuProvider>
      </CartProvider>
    </WishlistProvider>
  );
}
