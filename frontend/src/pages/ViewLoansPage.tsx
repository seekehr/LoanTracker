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
                <div className="flex">
                    <div className="hidden lg:block w-56 h-[calc(100vh-4rem)] sticky top-16 border-r border-border/40 bg-background/60 backdrop-blur-sm">
                        <SidebarProvider>
                            <AppSidebar />
                        </SidebarProvider>
                    </div>
                    <main className="flex-1 p-6">
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
            <div className="flex">
                <div className="hidden lg:block w-56 h-[calc(100vh-4rem)] sticky top-16 border-r border-border/40 bg-background/60 backdrop-blur-sm">
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                </div>
                <main className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold mb-6">Manage Loans</h1>
                        <Tabs defaultValue="loans" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="loans">Loans</TabsTrigger>
                                <TabsTrigger value="loaned">Loaned</TabsTrigger>
                            </TabsList>
                            <TabsContent value="loans">
                                <div className="grid gap-4 md:grid-cols-2">
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
                                        <p className="text-muted-foreground col-span-2 text-center py-8">
                                            No loans found
                                        </p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="loaned">
                                <div className="grid gap-4 md:grid-cols-2">
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
                                        <p className="text-muted-foreground col-span-2 text-center py-8">
                                            No loans found
                                        </p>
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
