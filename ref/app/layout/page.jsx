import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { useNavigate } from "react-router-dom";

import { Breadcrumbs } from "@/components/new/breadcrumbs";

export default function Page({ children }) {
  const navigate = useNavigate();

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };
  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <SidebarInset>
        <header className="sticky  top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 hover:bg-blue-100" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 inline-block"
            />

            <Breadcrumbs onBack={handleBackClick} />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4  pt-0 ">
          <div className="min-h-[calc(100vh-8rem)] md:min-h-[100vh] flex-1 rounded-xl p-2">
            {children}
          </div>
        </main>
        <footer className="hidden sm:block sticky bottom-0 z-10  h-8 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
          <div className="flex items-center justify-between gap-2 p-2 text-xs rounded-md border-t-2 border-[var(--color-border)]">
            <span>© 2025-26 All Rights Reserved</span>
            <span>Crafted with ❤️ by AG Solutions</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
