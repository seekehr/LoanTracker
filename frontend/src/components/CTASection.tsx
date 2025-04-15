import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export function CTASection() {
    return (
        <section id="pricing" className="py-24 bg-[#0044FF] dark:bg-gradient-to-b dark:from-[#0033CC] dark:to-[#0044FF] relative overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Take Control?</h2>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto">
                        Start tracking your loans today and take the first step toward financial freedom.
                    </p>
                </div>

                <div className="max-w-lg mx-auto">
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                        <div className="p-8 text-center border-b border-gray-200/10 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00FF87]/10 to-[#60EFFF]/10"></div>
                            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white relative z-10">Free 14-Day Trial</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-lg relative z-10">No credit card required</p>
                        </div>
                        <div className="p-8">
                            <div className="space-y-5 mb-8">
                                <div className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-[#0044FF] dark:text-[#60EFFF] mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300">Unlimited loan tracking</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-[#0044FF] dark:text-[#60EFFF] mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300">Payment reminders and notifications</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-[#0044FF] dark:text-[#60EFFF] mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300">Visual reports and progress tracking</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-[#0044FF] dark:text-[#60EFFF] mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300">Financial calculators and planning tools</p>
                                </div>
                            </div>
                            <Button className="w-full bg-[#0044FF] dark:bg-[#60EFFF] hover:bg-[#0033CC] dark:hover:bg-[#60EFFF]/90 text-white dark:text-gray-900 font-medium shadow-lg shadow-[#0044FF]/25 dark:shadow-[#60EFFF]/20 group" size="lg">
                                Get Started Free
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                                Cancel anytime. No obligations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00FF87]/10 via-transparent to-[#60EFFF]/10"></div>
        </section>
    );
}
