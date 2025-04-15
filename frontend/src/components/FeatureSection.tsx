import {
    BarChart3,
    Bell,
    Calculator,
    Calendar,
    CreditCard,
    FileText,
    PieChart,
    TrendingDown,
} from "lucide-react";
  
const features = [
    {
        title: "Track Multiple Loans",
        description:
        "Add, organize, and monitor all your loans in one centralized dashboard.",
        icon: CreditCard,
    },
    {
        title: "Payment Reminders",
        description:
        "Never miss a payment with customizable notifications and reminders.",
        icon: Bell,
    },
    {
        title: "Visual Progress",
        description:
        "See your loan payoff progress with beautiful, interactive charts.",
        icon: PieChart,
    },
    {
        title: "Payment Scheduling",
        description:
        "Schedule payments in advance and see how they impact your loan term.",
        icon: Calendar,
    },
    {
        title: "Interest Savings Calculator",
        description:
        "Calculate how much interest you can save with extra payments.",
        icon: Calculator,
    },
    {
        title: "Payment History",
        description:
        "Track your payment history and view detailed transaction reports.",
        icon: FileText,
    },
    {
        title: "Debt Reduction Strategies",
        description:
        "Get personalized recommendations to pay off your loans faster.",
        icon: TrendingDown,
    },
    {
        title: "Financial Analytics",
        description:
        "Analyze your loan data to make better financial decisions.",
        icon: BarChart3,
    },
];
  
export function FeatureSection() {
    return (
        <section id="features" className="py-20 bg-muted/30">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">All-in-One Loan Management</h2>
                    <p className="text-muted-foreground">
              Powerful features designed to simplify your loan tracking and help you become debt-free sooner.
                    </p>
                </div>
  
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card bg-card p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:bg-accent/50 hover:-translate-y-1"
                        >
                            <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}