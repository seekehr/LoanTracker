import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp } from "lucide-react";

export function HeroSection() {
    return (
        <div className="relative overflow-hidden bg-[#0044FF] dark:bg-gradient-to-b dark:from-[#0033CC] dark:to-[#0044FF]">
            <div className="container px-4 py-20 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 max-w-2xl">
                        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight tracking-tight text-white">
                            Take Control of Your{" "}
                            <span className="relative">
                                <span className="relative z-10">Loans</span>
                                <span className="absolute inset-x-0 bottom-2 h-3 bg-gradient-to-r from-[#00FF87] to-[#60EFFF] opacity-30 dark:opacity-40"></span>
                            </span>
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed">
                            Track all your loans in one place, visualize payments, and stay on top of your financial freedom journey.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                            <div className="flex-grow">
                                <input 
                                    type="email" 
                                    placeholder="Email Address" 
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10"
                                />
                            </div>
                            <Button size="lg" className="bg-white text-[#0044FF] dark:bg-white/90 hover:bg-white/90 dark:hover:bg-white transition-colors font-semibold">
                                Start your free trial
                            </Button>
                        </div>
                    </div>
                    <div className="relative hidden md:block">
                        <div className="relative z-10 grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="transform translate-x-8">
                                    <div className="bg-white/90 dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/10">
                                        <div className="aspect-[4/3] p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Overview</h3>
                                                <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">April 2025</span>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-start space-x-4">
                                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                        <img 
                                                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=faces" 
                                                            alt="Profile" 
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">Alex Thompson</h4>
                                                        <div className="text-sm space-y-1">
                                                            <p className="text-gray-600 dark:text-gray-400">Amount to pay: <span className="text-gray-900 dark:text-white font-medium">$12,450</span></p>
                                                            <p className="text-gray-600 dark:text-gray-400">Expiry Date: <span className="text-gray-900 dark:text-white font-medium">June 15, 2025</span></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="transform -translate-x-4 translate-y-8">
                                    <div className="bg-white/90 dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/10">
                                        <div className="p-4">
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center">
                                                    <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400 mb-1" />
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center">
                                                    <BarChart2 className="h-5 w-5 text-blue-500 dark:text-blue-400 mb-1" />
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">History</span>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center">
                                                    <span className="font-medium text-sm mb-1 dark:text-white">$230</span>
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Saved</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 transform translate-y-12">
                                <div className="bg-white/90 dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/10">
                                    <img 
                                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop" 
                                        alt="Dashboard" 
                                        className="w-full h-auto opacity-90 dark:opacity-80"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00FF87]/10 via-transparent to-[#60EFFF]/10 dark:from-[#00FF87]/5 dark:to-[#60EFFF]/5"></div>
        </div>
    );
}
