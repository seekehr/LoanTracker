import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToAuthRote } from "./components/ToAuthRoute.js";
import { ThemeProvider } from "./context/ThemeContext.js";
import Index from "./pages/IndexPage.js";
import Login from "./pages/LoginPage.js";
import NotFound from "./pages/NotFoundPage.js";
import ProfilePage from "./pages/ProfilePage.js";
import RegisterPage from "./pages/RegisterPage.js";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system">
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route
                            path="/login"
                            element={
                                <ToAuthRote>
                                    <Login />
                                </ToAuthRote>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <ToAuthRote>
                                    <RegisterPage />
                                </ToAuthRote>
                            }
                        />
                        <Route path="/profile" element={<ProfilePage />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                        
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
