import { format } from "date-fns";
import { Check, Clock, CreditCard, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    approved: boolean;
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
    const navigate = useNavigate();
    
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

    const handleCardClick = () => {
        navigate(`/loan?id=${loan.id}`);
    };

    return (
        <div 
            className="rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md p-6 relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800"
            onClick={handleCardClick}
        >
            {/* Approval indicator in top-right corner */}
            <div className="absolute top-2 right-2 flex items-center">
                {loan.approved ? (
                    <div className="flex items-center bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-full px-2 py-0.5">
                        <Check className="w-3 h-3 mr-1" />
                        <span>Approved</span>
                    </div>
                ) : (
                    <div className="flex items-center bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs rounded-full px-2 py-0.5">
                        <X className="w-3 h-3 mr-1" />
                        <span>Not Approved</span>
                    </div>
                )}
            </div>

            <div className="relative flex items-start space-x-4">
                {profile ? (
                    profile.pfp ? (
                        <div className="relative">
                            <img
                                src={profile.pfp}
                                alt={profile.displayName}
                                className="w-12 h-12 rounded-full ring-1 ring-gray-200 dark:ring-gray-700"
                            />
                            <div className="absolute -bottom-1 -right-1">
                                <span className={`flex h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                                    loan.paid
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                }`} />
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-600 flex items-center justify-center text-lg font-semibold">
                                {profile.displayName[0].toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                                <span className={`flex h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                                    loan.paid
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                }`} />
                            </div>
                        </div>
                    )
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                )}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {profile?.displayName || "Loading..."}
                            </h3>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {formattedAmount} <span className="text-sm font-normal text-gray-600 dark:text-gray-400">{loan.currency}</span>
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            loan.paid
                                ? "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-700"
                                : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700"
                        }`}>
                            {loan.paid ? "Paid" : "Pending"}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span>Created:</span>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {format(createdDate, "PPP")}
                            </p>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span>Expires:</span>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {format(expiryDate, "PPP")}
                            </p>
                        </div>
                    </div>
                    {proofData.proofs?.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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