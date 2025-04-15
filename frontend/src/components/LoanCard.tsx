import { format } from "date-fns";
import { Clock, CreditCard, FileText } from "lucide-react";

interface Loan {
    id: number;
    loanedId: number;
    loanerId: number;
    amount: number;
    currency: string;
    timeExpires: number | string;
    timeCreated: number | string;
    proofs: string;
    paid: boolean;
}

interface Profile {
    id: number;
    username: string;
    displayName: string;
    pfp: string | null;
}

interface LoanCardProps {
    loan: Loan;
    type: "loans" | "loaned";
    profile: Profile | undefined;
}

export function LoanCard({ loan, type, profile }: LoanCardProps) {
    // Safely parse dates with validation
    const parseDate = (dateValue: number | string | undefined) => {
        if (!dateValue) return new Date();
        const timestamp = Number(dateValue);
        return isNaN(timestamp) ? new Date() : new Date(timestamp);
    };

    const expiryDate = parseDate(loan.timeExpires);
    const createdDate = parseDate(loan.timeCreated);

    // Parse proofs JSON if it's a string
    const proofData = (() => {
        try {
            return typeof loan.proofs === 'string' ? JSON.parse(loan.proofs) : loan.proofs;
        } catch {
            return { proofs: [] };
        }
    })();

    // Format currency with proper spacing
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(loan.amount);

    return (
        <div className="group rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 p-6 hover:border-primary/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-start space-x-4">
                {profile ? (
                    profile.pfp ? (
                        <div className="relative">
                            <img
                                src={profile.pfp}
                                alt={profile.displayName}
                                className="w-12 h-12 rounded-full ring-2 ring-background"
                            />
                            <div className="absolute -bottom-1 -right-1">
                                <span className={`flex h-3 w-3 rounded-full ${
                                    loan.paid
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                }`} />
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary ring-2 ring-background flex items-center justify-center text-lg font-semibold group-hover:bg-primary/20 transition-colors">
                                {profile.displayName[0].toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                                <span className={`flex h-3 w-3 rounded-full ${
                                    loan.paid
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                }`} />
                            </div>
                        </div>
                    )
                ) : (
                    <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                )}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {profile?.displayName || "Loading..."}
                            </h3>
                            <p className="text-xl font-bold text-primary">
                                {formattedAmount} <span className="text-sm font-normal">{loan.currency}</span>
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            loan.paid
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-100"
                        }`}>
                            {loan.paid ? "Paid" : "Pending"}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>Created:</span>
                            </div>
                            <p className="font-medium text-foreground">
                                {format(createdDate, "PPP")}
                            </p>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4" />
                                <span>Expires:</span>
                            </div>
                            <p className="font-medium text-foreground">
                                {format(expiryDate, "PPP")}
                            </p>
                        </div>
                    </div>
                    {proofData.proofs?.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-2 border-t">
                            <FileText className="h-4 w-4" />
                            <span>
                                {proofData.proofs.length} document{proofData.proofs.length !== 1 ? 's' : ''} attached
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 