import { ReactNode, Suspense } from 'react';
import { AppSidebar } from './AppSidebar';
import SignOutButton from '@/components/Auth/SignOutButton';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 bg-card">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            <div className="ml-auto">
              <Suspense>
                {/* SignOutButton is a client component */}
                {/* @ts-ignore - dynamic import not required here */}
                <SignOutButton />
              </Suspense>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
