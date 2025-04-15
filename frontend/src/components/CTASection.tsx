
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export function CTASection() {
    return (
        <section id="pricing" className="py-20 bg-muted/30">
            <div className="container px-4 mx-auto">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Ready to Take Control?</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start tracking your loans today and take the first step toward financial freedom.
                    </p>
                </div>

                <div className="max-w-lg mx-auto bg-card rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-8 text-center bg-gradient-to-r from-primary to-secondary text-white">
                        <h3 className="text-2xl font-bold mb-2">Free 14-Day Trial</h3>
                        <p className="opacity-90">No credit card required</p>
                    </div>
                    <div className="p-8">
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <p>Unlimited loan tracking</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <p>Payment reminders and notifications</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <p>Visual reports and progress tracking</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <p>Financial calculators and planning tools</p>
                            </div>
                        </div>
                        <Button className="w-full" size="lg">
              Get Started Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <p className="text-center text-sm text-muted-foreground mt-4">
              Cancel anytime. No obligations.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
