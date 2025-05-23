import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { LoanCard } from "../components/LoanCard";

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

export default function ViewLoansPage() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loaned, setLoaned] = useState<Loan[]>([]);
    const [profiles, setProfiles] = useState<Map<number, Profile>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [couldNotLoadCount, setCouldNotLoadCount] = useState(0);
    const [noLoansFound, setNoLoansFound] = useState(false);
    const { toast } = useToast();

    const fetchProfile = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:3000/profile?id=${id}`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch profile");
            const data = await response.json();
            setProfiles((prev) => new Map(prev).set(id, data));
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await fetch("http://localhost:3000/loans", {
                    credentials: "include",
                });

                if (response.status === 404) {
                    setNoLoansFound(true);
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                if (!response.ok) {
                    
                    if (data.error) {
                        throw new Error("Error: " + data.error);
                    } else {
                        throw new Error("Failed to fetch loans");
                    }
                }
                
                const loansArray = typeof data.loans === 'string' ? JSON.parse(data.loans) : (data.loans || []);
                const loanedArray = typeof data.loaned === 'string' ? JSON.parse(data.loaned) : (data.loaned || []);
                const couldNotLoadArray = Array.isArray(data.couldNotLoad) ? data.couldNotLoad : [];
                
                // Sort loans and loaned arrays by ID in descending order (higher to lower)
                const sortedLoans = Array.isArray(loansArray) 
                    ? [...loansArray].sort((a, b) => b.id - a.id) 
                    : [];
                    
                const sortedLoaned = Array.isArray(loanedArray) 
                    ? [...loanedArray].sort((a, b) => b.id - a.id) 
                    : [];
                
                setLoans(sortedLoans);
                setLoaned(sortedLoaned);
                setCouldNotLoadCount(couldNotLoadArray.length);

                await Promise.all([...sortedLoans.map((loan: Loan) => fetchProfile(loan.loanerId)), ...sortedLoaned.map((loan: Loan) => fetchProfile(loan.loanedId))]);
            } catch (error) {
                if (error instanceof Error) {
                    console.error("Error fetching loans:", error.message);
                }
                toast({
                    title: "Error",
                    description: "Failed to fetch loans",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoans();
    }, [toast]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex bg-sky-50 dark:bg-gray-900">
                <div className="hidden lg:block flex-none">
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                </div>
                <div className="flex-1 flex justify-center py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
                    <main className="w-full max-w-4xl text-center">
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <h1 className="ml-3 text-gray-600 dark:text-gray-400">Loading loans...</h1>
                    </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-sky-50 dark:bg-gray-900">
            <div className="hidden lg:block flex-none">
                <SidebarProvider>
                    <AppSidebar />
                </SidebarProvider>
            </div>
            <div className="flex-1 flex justify-center py-6 lg:py-10 pl-8 pr-8 sm:pl-10 sm:pr-10 lg:pl-20 lg:pr-16">

                <main className="w-full max-w-4xl">
                    <h1 className={`text-3xl font-bold text-blue-600 dark:text-blue-400`} style={{ fontFamily: 'monospace' }}>
                        Manage Loans
                    </h1>

                    <div className="flex flex-wrap items-center gap-y-2 mb-8">
                        <div className="flex items-center space-x-2 mr-6">
                            {Array.from({ length: couldNotLoadCount }).map((_, index) => (
                                <div
                                    key={index}
                                    className="w-3 h-3 bg-red-500 bg-opacity-50 border border-red-700 rounded-sm"
                                    title={`Could not load item ${index + 1}`}
                                ></div>
                            ))}
                            {couldNotLoadCount > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">Could not load</span>
                            )}
                        </div>
                    </div>

                    {noLoansFound ? (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                No loans found! Try creating one first.
                            </p>
                        </div>
                    ) : (
                        <Tabs defaultValue="loans" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                <TabsTrigger 
                                    value="loans" 
                                    className="rounded-md py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm dark:data-[state=active]:shadow-gray-800"
                                >
                                    Loans
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="loaned"
                                    className="rounded-md py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm dark:data-[state=active]:shadow-gray-800"
                                >
                                    Loaned
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="loans">
                                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                                    {loans.length > 0 ? (
                                        loans.map((loan) => (
                                            <LoanCard
                                                key={loan.id}
                                                loan={loan}
                                                type="loans"
                                                profile={profiles.get(loan.loanerId)}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-lg p-6 sm:p-8 text-center">
                                            <p className="text-gray-500 dark:text-gray-400">
                                                You haven't taken out any loans yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="loaned">
                                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                                    {loaned.length > 0 ? (
                                        loaned.map((loan) => (
                                            <LoanCard
                                                key={loan.id}
                                                loan={loan}
                                                type="loaned"
                                                profile={profiles.get(loan.loanedId)}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-lg p-6 sm:p-8 text-center">
                                            <p className="text-gray-500 dark:text-gray-400">
                                                You haven't loaned out any money yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </main>
            </div>
        </div>
    );
}
