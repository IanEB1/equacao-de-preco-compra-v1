import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import DataEntryChoicePage from "./pages/DataEntryChoicePage";
import CalculatorPage from "./pages/CalculatorPage";
import SavedAnalysesPage from "./pages/SavedAnalysesPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-background to-muted">
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/data-entry-choice" element={<DataEntryChoicePage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/saved-analyses" element={<SavedAnalysesPage />} />
              <Route path="/login" element={<LoginPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
