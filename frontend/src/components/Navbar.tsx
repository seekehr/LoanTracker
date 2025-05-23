import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { FilePlus, FileText, LogIn, Menu, Settings, User, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.querySelector(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAtHome, setIsAtHome] = useState(false);

    useEffect(() => {
        if (window.location.pathname === '/') {
            setIsAtHome(true);
        }
    }, [setIsAtHome]);

    const hasToken = document.cookie.includes('token');
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
            <div className="container px-4 mx-auto">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0">
                            <span className="text-2xl font-bold text-black dark:text-white" style={{ fontFamily: 'monospace' }}>
                                LoanTracker
                            </span>
                        </Link>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex md:items-center md:justify-between flex-1">
                        {isAtHome ? (
                            <div className="flex items-center space-x-6 ml-10">
                                <button
                                    onClick={() => handleNavigation("/#features")}
                                    className="text-foreground/80 hover:text-primary transition-colors"
                                >
                                    Features
                                </button>
                                <button
                                    onClick={() => handleNavigation("/#testimonials")}
                                    className="text-foreground/80 hover:text-primary transition-colors"
                                >
                                    Testimonials
                                </button>
                                <button
                                    onClick={() => handleNavigation("/#pricing")}
                                    className="text-foreground/80 hover:text-primary transition-colors"
                                >
                                    Pricing
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-6 ml-10">
                                <button
                                    onClick={() => handleNavigation("/#features")}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 transition-colors flex items-center gap-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </button>
                                <button
                                    onClick={() => handleNavigation("/#testimonials")}
                                    className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-2"
                                >
                                    <FilePlus className="h-4 w-4" />
                                    Loan
                                </button>
                                <button
                                    onClick={() => handleNavigation("/#pricing")}
                                    className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors flex items-center gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    Manage
                                </button>
                            </div>
                        )}
                        <div className="flex items-center space-x-3">
                            <ThemeSwitcher />
                            {hasToken ? (
                                <Link to="/profile">
                                    <Button variant="ghost" size="sm">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <Button variant="ghost" size="sm">
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Login
                                        </Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button size="sm">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Sign Up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden items-center space-x-3">
                        <ThemeSwitcher />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-background border-b">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a
                            href="#features"
                            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
                            onClick={(e) => {
                                scrollToSection(e, '#features');
                                setIsMenuOpen(false);
                            }}
                        >
                            Features
                        </a>
                        <a
                            href="#testimonials"
                            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
                            onClick={(e) => {
                                scrollToSection(e, '#testimonials');
                                setIsMenuOpen(false);
                            }}
                        >
                            Testimonials
                        </a>
                        <a
                            href="#pricing"
                            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
                            onClick={(e) => {
                                scrollToSection(e, '#pricing');
                                setIsMenuOpen(false);
                            }}
                        >
                            Pricing
                        </a>
                        {hasToken ? (
                            <div className="px-3 py-2">
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2 px-3 py-2">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full justify-start">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
