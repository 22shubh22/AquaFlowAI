import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ZonesPage from "@/pages/ZonesPage";
import WaterSourcesPage from "@/pages/WaterSourcesPage";
import PumpSchedulePage from "@/pages/PumpSchedulePage";
import SettingsPage from "@/pages/SettingsPage";
import CitizenPortal from "@/pages/CitizenPortal";
import BlockchainVerificationPage from "@/pages/BlockchainVerificationPage";
import CitizenUsersPage from "@/pages/CitizenUsersPage";
import NotFound from "@/pages/not-found";
import { PipelineMonitor } from "@/components/PipelineMonitor";

function Router() {
  const { role, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return <Login />;
  }

  // Citizen users can only access citizen portal and schedule
  if (role === "citizen" && location !== "/reports" && location !== "/schedule") {
    return <CitizenPortal />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/zones" component={ZonesPage} />
      <Route path="/sources" component={WaterSourcesPage} />
      <Route path="/reports" component={CitizenPortal} />
      <Route path="/schedule" component={PumpSchedulePage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/blockchain" component={BlockchainVerificationPage} />
      <Route path="/citizen-users" component={CitizenUsersPage} />
      <Route path="/pipeline-monitor" component={PipelineMonitor} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { logout, role, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (!isAuthenticated) {
    return <Router />;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <span className="text-sm font-medium">
                {role === "admin" ? "Admin Dashboard" : "Citizen Portal"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-screen-2xl mx-auto">
              <Router />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <AppContent />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;