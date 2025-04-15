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
                
                // Try parsing if strings, otherwise use as is
                const loansArray = typeof data.loans === 'string' ? JSON.parse(data.loans) : (data.loans || []);
                const loanedArray = typeof data.loaned === 'string' ? JSON.parse(data.loaned) : (data.loaned || []);
                
                setLoans(Array.isArray(loansArray) ? loansArray : []);
                setLoaned(Array.isArray(loanedArray) ? loanedArray : []);

                // Fetch profiles for all unique users
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
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex relative isolate">
                    <div className="hidden lg:block flex-none">
                        <SidebarProvider>
                            <AppSidebar />
                        </SidebarProvider>
                    </div>
                    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:ml-14">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-3xl font-bold mb-6">Loading...</h1>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
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
                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
                                <TabsTrigger 
                                    value="loans" 
                                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                >
                                    Loans
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="loaned"
                                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
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
                                        <div className="col-span-2 bg-muted/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-border/50">
                                            <p className="text-muted-foreground">
                                                No loans found
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
                                        <div className="col-span-2 bg-muted/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-border/50">
                                            <p className="text-muted-foreground">
                                                No loans found
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
