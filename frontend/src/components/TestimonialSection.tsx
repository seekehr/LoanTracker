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
        <section id="testimonials" className="py-20">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
                    <p className="text-muted-foreground">
            Join thousands of people who are taking control of their loans with LoanTracker.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="border-0 shadow-md">
                            <CardContent className="p-6">
                                <QuoteIcon className="h-8 w-8 text-primary/20 mb-4" />
                                <p className="mb-6 text-foreground/90 italic">
                  "{testimonial.content}"
                                </p>
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                                        {testimonial.avatar}
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="font-semibold">{testimonial.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
