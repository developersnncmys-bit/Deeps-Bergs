import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { MenuProvider } from "@/components/layout/menu-context";
import { MenuDrawer } from "@/components/layout/MenuDrawer";
import { AskAiFab } from "@/components/layout/AskAiFab";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <AnnouncementBar />
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
      <MenuDrawer />
      <AskAiFab />
    </MenuProvider>
  );
}
