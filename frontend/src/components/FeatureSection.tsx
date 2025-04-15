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
        <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">All-in-One Loan Management</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Powerful features designed to simplify your loan tracking and help you become debt-free sooner.
                    </p>
                </div>
  
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-[#0044FF]/5 hover:-translate-y-1 group"
                        >
                            <div className="rounded-lg bg-[#0044FF]/10 dark:bg-[#0044FF]/20 p-3 w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="h-6 w-6 text-[#0044FF] dark:text-[#60EFFF]" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-[#0044FF] dark:group-hover:text-[#60EFFF] transition-colors">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] dark:opacity-[0.04]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-gray-900/50"></div>
        </section>
    );
}