import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, PieChart, TrendingUp } from "lucide-react";

export function HeroSection() {
    return (
        <div className="relative overflow-hidden">
            <div className="container px-4 py-20 md:py-32 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Take Control of Your{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Loans
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-lg">
              Track all your loans in one place, visualize payments, and stay on top of your financial freedom journey.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="group">
                Get Started
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <Button size="lg" variant="outline">
                Learn More
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
                            <div className="aspect-video bg-card p-6 rounded-2xl border">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold">Loan Overview</h3>
                                    <span className="text-sm text-muted-foreground">April 2025</span>
                                </div>
                                <div className="space-y-20">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted">
                                            <img 
                                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=faces" 
                                                alt="Profile" 
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">Alex Thompson</h4>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>Amount to pay: <span className="text-foreground font-medium">$12,450</span></p>
                                                <p>Expiry Date: <span className="text-foreground font-medium">June 15, 2025</span></p>
                                            </div>
                                        </div>
                                    </div>
                  
                                    <div className="grid grid-cols-3 gap-4 mb-32">
                                        <div className="bg-muted dark:bg-muted-light p-3 rounded-lg flex flex-col items-center">
                                            <TrendingUp className="h-5 w-5 text-green-500 mb-1" />
                                            <span className="text-xs text-secondary-foreground">Progress</span>
                                        </div>

                                        <div className="bg-muted p-3 rounded-lg flex flex-col items-center">
                                            <BarChart2 className="h-5 w-5 text-blue-500 mb-1" />
                                            <span className="text-xs text-secondary-foreground">History</span>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg flex flex-col items-center">
                                            <span className="font-medium text-sm mb-1">$230</span>
                                            <span className="text-xs text-muted-foreground">Saved</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10 transform -translate-y-1/4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
