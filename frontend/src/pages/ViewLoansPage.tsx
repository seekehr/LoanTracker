import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { LoanCard } from "../components/LoanCard";
import { Navbar } from "../components/Navbar";

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

export default function ViewLoansPage() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loaned, setLoaned] = useState<Loan[]>([]);
    const [profiles, setProfiles] = useState<Map<number, Profile>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
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
                
                setLoans(Array.isArray(loansArray) ? loansArray : []);
                setLoaned(Array.isArray(loanedArray) ? loanedArray : []);

                const uniqueIds = new Set<number>();
                const allLoans = [
                    ...(Array.isArray(loansArray) ? loansArray : []),
                    ...(Array.isArray(loanedArray) ? loanedArray : [])
                ];
                
                allLoans.forEach((loan: Loan) => {
                    uniqueIds.add(loan.loanerId);
                    uniqueIds.add(loan.loanedId);
                });

                await Promise.all([...uniqueIds].map(fetchProfile));
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
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Navbar />
                <div className="flex relative isolate">
                    <div className="hidden lg:block flex-none">
                        <SidebarProvider>
                            <AppSidebar />
                        </SidebarProvider>
                    </div>
                    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:ml-14">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Loading Loans...</h1>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Navbar />
            <div className="flex relative isolate">
                <div className="hidden lg:block flex-none">
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                </div>
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:ml-14">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0044FF] to-[#60EFFF] dark:from-[#60EFFF] dark:to-[#0044FF]">
                                Manage Loans
                            </h1>
                        </div>
                        <Tabs defaultValue="loans" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                <TabsTrigger 
                                    value="loans" 
                                    className="rounded-md py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
                                >
                                    Loans
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="loaned"
                                    className="rounded-md py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
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
                    </div>
                </main>
            </div>
        </div>
    );
}
