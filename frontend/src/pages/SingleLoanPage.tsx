import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, CheckCircle, Clipboard, Clock, CreditCard, Loader2, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/AppSidebar";

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

export default function SingleLoanPage() {
    const [loan, setLoan] = useState<Loan | null>(null);
    const [loanedProfile, setLoanedProfile] = useState<Profile | null>(null);
    const [loanerProfile, setLoanerProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [canMarkAsPaid, setCanMarkAsPaid] = useState(false);
    const [canAddProofs, setCanAddProofs] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [proofsDialogOpen, setProofsDialogOpen] = useState(false);
    const [proofLinks, setProofLinks] = useState<string[]>(['']);
    const [proofLinkError, setProofLinkError] = useState<string | null>(null);
    const { toast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    
    const params = new URLSearchParams(location.search);
    const loanId = params.get("id");

    // Fetch current user's ID instead of username
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch("http://localhost:3000/parse-token?as_id=true", {
                    method: "POST",
                    credentials: "include",
                });

                if (!response.ok) {
                    console.error("Failed to fetch user ID");
                    return;
                }

                const data = await response.json();
                if (data.id !== undefined) {
                    setCurrentUserId(data.id);
                }
            } catch (error) {
                console.error("Error fetching user ID:", error);
            }
        };

        fetchCurrentUser();
    }, []);

    // Check if current user can mark loan as paid or add proofs
    useEffect(() => {
        if (loan && currentUserId !== null) {
            // Compare IDs directly rather than converting to strings
            const isLoaner = loan.loanerId === currentUserId;
            const isLoaned = loan.loanedId === currentUserId;
            
            setCanMarkAsPaid(isLoaner && !loan.paid);
            setCanAddProofs((isLoaner || isLoaned) && !loan.paid);
        }
    }, [loan, currentUserId]);

    const fetchProfile = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:3000/profile?id=${id}`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch profile");
            return await response.json();
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    };

    useEffect(() => {
        const fetchLoan = async () => {
            if (!loanId) {
                setError("Loan ID is missing");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/loan?loanId=${loanId}`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setError("Loan not found");
                        setIsLoading(false);
                        return;
                    }
                    throw new Error("Failed to fetch loan");
                }

                const data = await response.json();
                const loanData = data.loan;
                setLoan(loanData);

                // Fetch profiles for both loaner and loaned
                const [loanedProfileData, loanerProfileData] = await Promise.all([
                    fetchProfile(loanData.loanedId),
                    fetchProfile(loanData.loanerId)
                ]);
                
                setLoanedProfile(loanedProfileData);
                setLoanerProfile(loanerProfileData);
            } catch (error) {
                console.error("Error fetching loan:", error);
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("An unknown error occurred");
                }
                toast({
                    title: "Error",
                    description: "Failed to fetch loan details",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoan();
    }, [loanId, toast]);

    // Add function to parse proof links from loan data
    useEffect(() => {
        if (loan?.proofs) {
            try {
                // Try to parse proofs from JSON string
                const proofsData = typeof loan.proofs === 'string' 
                    ? JSON.parse(loan.proofs) 
                    : loan.proofs;
                
                // If proofs exists and is an array, use it
                if (proofsData.proofs && Array.isArray(proofsData.proofs)) {
                    const existingLinks = proofsData.proofs;
                    // If there are existing links, use them; otherwise keep the default empty array
                    if (existingLinks.length > 0) {
                        setProofLinks(existingLinks);
                    }
                }
            } catch (error) {
                console.error("Error parsing proof links:", error);
            }
        }
    }, [loan]);

    const formatDate = (timestamp: number | string) => {
        const date = typeof timestamp === 'number' 
            ? new Date(timestamp) 
            : new Date(parseInt(timestamp as string));
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (expiryTime: number | string) => {
        const expiry = typeof expiryTime === 'number' 
            ? expiryTime 
            : parseInt(expiryTime as string);
        
        const now = Date.now();
        const diff = expiry - now;
        
        if (diff <= 0) return "Expired";
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${days}d ${hours}h ${minutes}m`;
    };
    
    // Parse proofs JSON if it's a string
    const getProofData = (proofs: string | undefined) => {
        if (!proofs) return { proofs: [] };
        
        try {
            return typeof proofs === 'string' ? JSON.parse(proofs) : proofs;
        } catch {
            return { proofs: [] };
        }
    };

    const handleProofLinkChange = (value: string, index: number) => {
        const newProofLinks = [...proofLinks];
        newProofLinks[index] = value;
        setProofLinks(newProofLinks);
        
        if (value.trim() !== '' && !isValidImgurLink(value)) {
            setProofLinkError('Please enter valid Imgur links.');
        } else {
            setProofLinkError(null);
        }
    };

    const handleAddProofLink = () => {
        if (proofLinks.length < 4) {
            setProofLinks([...proofLinks, '']);
        }
    };

    const handleRemoveProofLink = (index: number) => {
        const newProofLinks = [...proofLinks];
        newProofLinks.splice(index, 1);
        
        if (newProofLinks.length === 0) {
            setProofLinks(['']);
        } else {
            setProofLinks(newProofLinks);
        }
        
        // Re-check errors
        const hasError = newProofLinks.some(link => link.trim() !== '' && !isValidImgurLink(link));
        if (!hasError) {
            setProofLinkError(null);
        }
    };

    const isValidImgurLink = (link: string) => {
        return /^https?:\/\/(?:i\.)?imgur\.com\/[a-zA-Z0-9]{5,}(?:\.[a-zA-Z]{3,4})?$/.test(link);
    };

    const getImageUrl = (imgurUrl: string) => {
        try {
            const url = new URL(imgurUrl);
            const pathSegments = url.pathname.split('/');
            const imgId = pathSegments[pathSegments.length - 1];
            
            if (!imgId) return null;
            
            // Remove file extension if present
            const cleanedImgId = imgId.split('.')[0];
            
            return `https://i.imgur.com/${cleanedImgId}.jpg`;
        } catch (error) {
            return null;
        }
    };

    const handleOpenProofsDialog = () => {
        if (loan && loan.proofs && loan.proofs.length > 0) {
            setProofLinks([...loan.proofs]);
        } else {
            setProofLinks(['']);
        }
        setProofLinkError(null);
        setProofsDialogOpen(true);
    };

    const handleSubmitProofs = async () => {
        // Validate all links
        const hasError = proofLinks.some(link => link.trim() !== '' && !isValidImgurLink(link));
        if (hasError) {
            setProofLinkError('Please enter valid Imgur links.');
            return;
        }
        
        let key = "loaner";
        if (loan?.loanedId === currentUserId) {
            key = "loaned";
        }

        //loanId, loanerId, loanedId, paid, approved, proofs
        const filteredProofs = { proofs: { [key]: proofLinks.filter(link => link.trim() !== '') } };
        console.log(filteredProofs);

        try {
            setIsLoading(true);
            
            const response = await fetch(`http://localhost:3000/update-loan?loanId=${loan?.id}&loanerId=${loan?.loanerId}&loanedId=${loan?.loanedId}&paid=${loan?.paid}&approved=${loan?.approved}&proofs=${encodeURIComponent(JSON.stringify(filteredProofs))}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error('Failed to update proof links');
            }
            
            // Update local state
            if (loan) {
                setLoan({
                    ...loan,
                    proofs: JSON.stringify(filteredProofs),
                });
            }
            
            toast({
                title: "Success",
                description: "Proof links updated successfully.",
                variant: "success",
            });
            
            setProofsDialogOpen(false);
        } catch (error) {
            console.error('Error updating proof links:', error);
            toast({
                title: "Error",
                description: "Failed to update proof links. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsPaid = () => {
        // Reset proof links
        setProofLinks(['']);
        setProofLinkError(null);
        setConfirmDialogOpen(true);
    };

    const handleSubmitPaid = () => {
        // Filter out empty proof links
        const filteredProofs = proofLinks.filter(link => link.trim() !== '');
        
        // Here you would make the API call to mark the loan as paid
        // and include the proof links

        toast({
            title: "Success",
            description: "Loan has been marked as paid.",
            variant: "default",
        });

        setConfirmDialogOpen(false);
        
        // For demo purposes, let's refresh the page to show the updated state
        if (loanId) {
            window.location.reload();
        }
    };

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
                            <h1 className="ml-3 text-gray-600 dark:text-gray-400">Loading loan details...</h1>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex bg-sky-50 dark:bg-gray-900">
                <div className="hidden lg:block flex-none">
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                </div>
                <div className="flex-1 flex justify-center py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
                    <main className="w-full max-w-4xl text-center">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-lg p-8 text-center">
                            <h2 className="text-xl font-semibold text-red-500 mb-4">Error</h2>
                            <p className="text-gray-700 dark:text-gray-300">{error}</p>
                            <Button 
                                className="mt-6" 
                                variant="outline"
                                onClick={() => navigate("/manage-loans")}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Return to Loans
                            </Button>
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
            <div className="flex-1 flex justify-center py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
                <main className="w-full max-w-4xl">
                    <div className="flex items-center mb-6">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mr-2 hover:bg-gray-100 dark:hover:bg-white"
                            onClick={() => navigate("/manage-loans")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400" style={{ fontFamily: 'monospace' }}>
                            Loan Details
                        </h1>
                    </div>

                    {loan && (
                        <Card className="bg-blue-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-md rounded-lg overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-gray-800 dark:to-gray-750 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                            {loan.currency} {loan.amount.toLocaleString()}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Loan #{loan.id}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <Badge className={`${loan.paid ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'} px-3 py-1 text-xs font-medium rounded-full`}>
                                            {loan.paid ? (
                                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                            ) : (
                                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                            )}
                                            {loan.paid ? 'Paid' : 'Pending'}
                                        </Badge>
                                        {!loan.paid && (
                                            <Badge className={`${loan.approved ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'} px-3 py-1 text-xs font-medium rounded-full`}>
                                                {loan.approved ? 'Approved' : 'Not Approved'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Loan Information</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <CreditCard className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</p>
                                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{loan.currency} {loan.amount.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Calendar className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Created On</p>
                                                    <p className="text-base text-gray-900 dark:text-gray-100">{formatDate(loan.timeCreated)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</p>
                                                    <p className="text-base text-gray-900 dark:text-gray-100">
                                                        {formatDate(loan.timeExpires)}
                                                        <span className={`ml-2 text-sm font-medium ${
                                                            getTimeRemaining(loan.timeExpires) === "Expired" 
                                                                ? "text-red-500" 
                                                                : "text-amber-500"
                                                        }`}>
                                                            ({getTimeRemaining(loan.timeExpires)})
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            {loan.proofs && (
                                                <div className="flex items-start flex-col">
                                                    <div className="flex items-start">
                                                        <Clipboard className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Proofs</p>
                                                            <p className="text-base text-gray-900 dark:text-gray-100">
                                                                {(() => {
                                                                    const proofData = getProofData(loan.proofs);
                                                                    if (proofData.proofs && proofData.proofs.length > 0) {
                                                                        return `${proofData.proofs.length} document${proofData.proofs.length !== 1 ? 's' : ''} attached`;
                                                                    }
                                                                    return "No documents attached";
                                                                })()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Display proof images */}
                                                    {(() => {
                                                        const proofData = getProofData(loan.proofs);
                                                        if (proofData.proofs && proofData.proofs.length > 0) {
                                                            return (
                                                                <div className="mt-3 ml-8 grid grid-cols-2 gap-2">
                                                                    {proofData.proofs.map((link: string, index: number) => (
                                                                        link && isValidImgurLink(link) && getImageUrl(link) && (
                                                                            <div key={index} className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                                                                                <a 
                                                                                    href={link} 
                                                                                    target="_blank" 
                                                                                    rel="noopener noreferrer"
                                                                                    className="block hover:opacity-90 transition-opacity"
                                                                                >
                                                                                    <img 
                                                                                        src={getImageUrl(link)} 
                                                                                        alt={`Proof ${index + 1}`} 
                                                                                        className="object-cover w-full h-32"
                                                                                        onError={(e) => {
                                                                                            e.currentTarget.style.display = 'none';
                                                                                        }}
                                                                                    />
                                                                                </a>
                                                                            </div>
                                                                        )
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Parties Involved</h3>
                                        
                                        <div className="space-y-6">
                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lender</h4>
                                                        {loanerProfile ? (
                                                            <>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{loanerProfile.displayName}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">@{loanerProfile.username}</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">Profile information unavailable</p>
                                                        )}
                                                    </div>
                                                    
                                                    {loanerProfile ? (
                                                        loanerProfile.pfp ? (
                                                            <div className="relative">
                                                                <img
                                                                    src={loanerProfile.pfp}
                                                                    alt={loanerProfile.displayName}
                                                                    className="w-16 h-16 rounded-full ring-1 ring-gray-200 dark:ring-gray-600 object-cover"
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
                                                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 ring-1 ring-gray-200 dark:ring-gray-600 flex items-center justify-center text-2xl font-semibold">
                                                                    {loanerProfile.displayName[0].toUpperCase()}
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
                                                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Borrower</h4>
                                                        {loanedProfile ? (
                                                            <>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{loanedProfile.displayName}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">@{loanedProfile.username}</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">Profile information unavailable</p>
                                                        )}
                                                    </div>
                                                    
                                                    {loanedProfile ? (
                                                        loanedProfile.pfp ? (
                                                            <div className="relative">
                                                                <img
                                                                    src={loanedProfile.pfp}
                                                                    alt={loanedProfile.displayName}
                                                                    className="w-16 h-16 rounded-full ring-1 ring-gray-200 dark:ring-gray-600 object-cover"
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
                                                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 ring-1 ring-gray-200 dark:ring-gray-600 flex items-center justify-center text-2xl font-semibold">
                                                                    {loanedProfile.displayName[0].toUpperCase()}
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
                                                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!loan.paid && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className={`rounded-lg p-4 border ${loan.approved ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30'}`}>
                                            <h3 className={`font-medium mb-2 ${loan.approved ? 'text-blue-800 dark:text-blue-300' : 'text-red-800 dark:text-red-300'}`}>
                                                Loan Status
                                            </h3>
                                            <p className={`text-sm ${loan.approved ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>
                                                This loan is currently {loan.paid ? 'paid' : 'pending payment'} and {loan.approved ? 'has been approved' : 'has not been approved yet'}.
                                                {!loan.paid && getTimeRemaining(loan.timeExpires) === "Expired" && (
                                                    <span className="font-medium text-red-500 dark:text-red-400 ml-1">The payment deadline has passed.</span>
                                                )}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>

                            <CardFooter className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between">
                                <Button className="hover:bg-gray-100 dark:hover:bg-white" variant="outline" onClick={() => navigate("/manage-loans")}>
                                    Back to Loans
                                </Button>

                                <div className="flex space-x-2">
                                    {!loan.paid && (
                                        <Button 
                                            className="w-full"
                                            disabled={!canAddProofs}
                                            onClick={handleOpenProofsDialog}
                                        >
                                            Add Proofs
                                        </Button>
                                    )}
                                    
                                    {!loan.paid && (
                                        <Button 
                                            className={`${canMarkAsPaid 
                                                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800" 
                                                : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"} text-white dark:text-gray-100`}
                                            disabled={!canMarkAsPaid}
                                            onClick={handleMarkAsPaid}
                                        >
                                            {canMarkAsPaid 
                                                ? "Mark as Paid" 
                                                : currentUserId 
                                                    ? "Only loaner can mark as paid" 
                                                    : "Sign in to mark as paid"}
                                        </Button>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    )}
                </main>
            </div>
            
            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure that you want to mark this as paid?
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="proof-links">Proof Links (Optional)</Label>
                            
                            {proofLinks.map((link, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id={`proof-link-${index}`}
                                            placeholder="https://imgur.com/abcd123"
                                            value={link}
                                            onChange={(e) => handleProofLinkChange(e.target.value, index)}
                                            className={`flex-1 ${!isValidImgurLink(link) && link.trim() !== '' ? 'border-red-500' : ''}`}
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleRemoveProofLink(index)}
                                            className="px-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    
                                    {/* Image preview */}
                                    {link.trim() !== '' && isValidImgurLink(link) && getImageUrl(link) && (
                                        <div className="mt-1 rounded-md overflow-hidden w-20 h-20 relative">
                                            <img 
                                                src={getImageUrl(link)} 
                                                alt="Preview" 
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {proofLinks.length < 4 && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleAddProofLink}
                                    className="mt-2 w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Another Proof Link
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitPaid}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Proofs Dialog */}
            <Dialog open={proofsDialogOpen} onOpenChange={setProofsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Proof Links</DialogTitle>
                        <DialogDescription>
                            Add Imgur links to images that serve as proof for this loan.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="proof-links">Proof Links (Maximum 4)</Label>
                            
                            {proofLinks.map((link, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id={`proof-link-${index}`}
                                            placeholder="https://imgur.com/abcd123"
                                            value={link}
                                            onChange={(e) => handleProofLinkChange(e.target.value, index)}
                                            className={`flex-1 ${!isValidImgurLink(link) && link.trim() !== '' ? 'border-red-500' : ''}`}
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleRemoveProofLink(index)}
                                            className="px-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    
                                    {/* Image preview */}
                                    {link.trim() !== '' && isValidImgurLink(link) && getImageUrl(link) && (
                                        <div className="mt-1 rounded-md overflow-hidden w-20 h-20 relative">
                                            <img 
                                                src={getImageUrl(link)} 
                                                alt="Preview" 
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {proofLinkError && (
                                <p className="text-sm text-red-500">{proofLinkError}</p>
                            )}
                            
                            {proofLinks.length < 4 && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleAddProofLink}
                                    className="mt-2 w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Another Proof Link
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProofsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitProofs}>
                            Save Proofs
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
