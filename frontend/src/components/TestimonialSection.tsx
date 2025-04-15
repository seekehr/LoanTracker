import { Card, CardContent } from "@/components/ui/card";
import { QuoteIcon } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Homeowner",
        content:
      "LoanTracker has been a game-changer for managing my mortgage. I can easily see my progress and it motivates me to make extra payments when I can.",
        avatar: "SJ",
    },
    {
        name: "Michael Chen",
        role: "Graduate Student",
        content:
      "As someone with multiple student loans, this app has simplified everything. The visual reports help me strategize which loans to focus on first.",
        avatar: "MC",
    },
    {
        name: "Emily Rodriguez",
        role: "Small Business Owner",
        content:
      "I use LoanTracker for both personal and business loans. The payment reminders have saved me from late fees multiple times!",
        avatar: "ER",
    },
];

export function TestimonialSection() {
    return (
        <section id="testimonials" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">What Our Users Say</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Join thousands of people who are taking control of their loans with LoanTracker.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="group bg-gray-50 dark:bg-gray-800/50 border-0 shadow-lg hover:shadow-xl dark:shadow-gray-900/30 transition-all duration-300 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <QuoteIcon className="h-8 w-8 text-[#0044FF] dark:text-[#60EFFF] opacity-30 mb-6 group-hover:scale-110 transition-transform duration-300" />
                                <p className="mb-8 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-lg bg-[#0044FF]/10 dark:bg-[#0044FF]/20 text-[#0044FF] dark:text-[#60EFFF] flex items-center justify-center font-medium text-lg group-hover:scale-110 transition-transform duration-300">
                                        {testimonial.avatar}
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] dark:opacity-[0.04]"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0044FF]/5 via-transparent to-[#60EFFF]/5"></div>
        </section>
    );
}
