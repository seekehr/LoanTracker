import { ThemeSwitcher } from "./ThemeSwitcher.js";

export function Footer() {
    return (
        <footer className="bg-muted/40 py-12 border-t">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              LoanTracker
                        </h3>
                        <p className="text-muted-foreground max-w-md mb-6">
              Simplify your loan management, visualize your progress, and achieve financial freedom sooner.
                        </p>
                        <div className="flex items-center">
                            <span className="mr-3 text-sm text-muted-foreground">
                Change theme:
                            </span>
                            <ThemeSwitcher />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Press
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} LoanTracker. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
