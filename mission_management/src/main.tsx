import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
// Conditionally start MSW mock server in development if VITE_USE_MOCK === 'true'
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
  // Dynamic import to avoid bundling in production
  import('./api/mock/server').then((m) => m.setupMockServer());
}
import { AppRoutes } from "./routes/AppRoutes";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
