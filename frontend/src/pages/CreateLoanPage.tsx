import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from 'lodash-es/debounce';
import { Check, Images, Plus, Trash, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AppSidebar } from "../components/AppSidebar";

const formSchema = z.object({
    loanerId: z.string().min(1, "Loaner username is required"),
    loanedId: z.string().min(1, "Recipient username is required"),
    amount: z.string().min(1, "Amount is required"),
    currency: z.string().min(1, "Currency is required"),
    timeExpires: z.date({
        required_error: "Please select an expiry date",
        invalid_type_error: "That's not a valid date!",
    }),
});

const currencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "INR",
];

export default function CreateLoanPage() {
    const [currentUserUsername, setCurrentUserUsername] = useState<string | null>(null);
    const [loanerUsernameValid, setLoanerUsernameValid] = useState<boolean | null>(null);
    const [loanerDisplayName, setLoanerDisplayName] = useState<string | null>(null);
    const [loanerDisplayPfp, setLoanerDisplayPfp] = useState<string | null>(null);
    const [loanedUsernameValid, setLoanedUsernameValid] = useState<boolean | null>(null);
    const [loanedDisplayName, setLoanedDisplayName] = useState<string | null>(null);
    const [loanedDisplayPfp, setLoanedDisplayPfp] = useState<string | null>(null);
    const [typeUser, setTypeUser] = useState<'loaner' | 'loaned' |null>(null);
    const [proofsDialogOpen, setProofsDialogOpen] = useState(false);
    const [proofLinks, setProofLinks] = useState<string[]>(['']);
    const [proofLinkError, setProofLinkError] = useState<string | null>(null);
    
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            loanerId: "",
            loanedId: "",
            amount: "",
            currency: "USD",
            timeExpires: undefined,
        },
    });
    
    const watchedLoanerId = form.watch('loanerId');
    const watchedLoanedId = form.watch('loanedId');
    const isUserLoaner = watchedLoanerId === currentUserUsername && !!currentUserUsername;
    const isUserLoaned = watchedLoanedId === currentUserUsername && !!currentUserUsername;

    const handleInputChange = useCallback((fieldType: 'loaner' | 'loaned', currentValue: string) => {
        if (!currentUserUsername) return; 
        if (fieldType === 'loaner') {
            if (currentValue === currentUserUsername) {
                setTypeUser('loaner');
            }
        } else if (fieldType === 'loaned') {    
            if (currentValue === currentUserUsername) {
                setTypeUser('loaned');
            }
        }
    }, [currentUserUsername, setTypeUser]); // Dependencies


    const navigate = useNavigate();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const tokenResponse = await fetch("http://localhost:3000/parse-token", {
                    method: "POST",
                    credentials: "include"
                });
                if (tokenResponse.ok) {
                    const tokenData = await tokenResponse.json();
                    setCurrentUserUsername(tokenData.username);
                } else {
                    console.error("Failed to fetch user token: " + tokenResponse.statusText);
                    toast({
                        title: "Error",
                        description: "Failed to fetch your username? Try again later.",
                        variant: "destructive",
                    });
                    navigate("/loans");
                    return;
                }
            } catch (error) {
                console.error("Error fetching user token:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch your username? Try again later.",
                    variant: "destructive",
                });
                navigate("/loans");
                return;
            }
        };
        fetchUser();
    }, [navigate, toast]);

    // Memoize the debounced function
    const checkUsernameRaw = useMemo(() =>
        debounce(async (username: string, fieldType: 'loaner' | 'loaned') => {
            // Reset validity state immediately for feedback
            const setValidity = fieldType === 'loaner' ? setLoanerUsernameValid : setLoanedUsernameValid;
            setValidity(null);

            const setDisplayName = fieldType === 'loaner' ? setLoanerDisplayName : setLoanedDisplayName;
            const setDisplayPfp = fieldType === 'loaner' ? setLoanerDisplayPfp : setLoanedDisplayPfp;

            try {
                const response = await fetch(`http://localhost:3000/check-username?username=${username}`);
                const isValid = response.status === 401; // Assuming 401 means user exists
                setValidity(isValid);

                // If valid, fetch profile data
                if (isValid) {
                    const profileResponse = await fetch(`http://localhost:3000/profile?username=${username}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        credentials: 'include'
                    });
                    if (profileResponse.ok) {
                        const profileData = await profileResponse.json();
                        setDisplayName(profileData.displayName);
                        setDisplayPfp(profileData.pfp);
                    } else {
                        // Handle profile fetch error, but username is still considered valid
                        setDisplayName(null);
                        setDisplayPfp(null);
                    }
                } else {
                    // Reset profile info if username is not valid or fetch fails
                    setDisplayName(null);
                    setDisplayPfp(null);
                }
            } catch (error) {
                console.error("Error checking username:", error);
                setValidity(false);
                setDisplayName(null); // Reset on error
                setDisplayPfp(null);
            } finally {
                handleInputChange(fieldType, username);
            }
        }, 500), // Debounce time
    [handleInputChange, setLoanerUsernameValid, setLoanerDisplayName, setLoanerDisplayPfp, setLoanedUsernameValid, setLoanedDisplayName, setLoanedDisplayPfp] // Added all state setters
    );
   
    const checkLoanerUsername = useCallback(
        (username: string) => checkUsernameRaw(username, 'loaner'),
        [checkUsernameRaw]
    );

    const checkLoanedUsername = useCallback(
        (username: string) => checkUsernameRaw(username, 'loaned'),
        [checkUsernameRaw]
    );

    // Helper function to handle sending notifications after loan creation
    const handleNotifications = async (loanId: number, values: z.infer<typeof formSchema>, currentUserUsername: string) => {
        let recipientUsername: string | null = null;
        let actionText: string = '';
        let otherPartyUsername: string | null = null;
        let directionText: string = '';

        if (values.loanerId === currentUserUsername) {
            recipientUsername = values.loanedId;
            actionText = 'borrow';
            otherPartyUsername = values.loanedId;
            directionText = 'to';
        } else if (values.loanedId === currentUserUsername) {
            recipientUsername = values.loanerId;
            actionText = 'loan';
            otherPartyUsername = values.loanerId;
            directionText = 'from';
        }

        // --- Send notification to the other party ---
        if (recipientUsername) {
            const notificationMessage = `New loan request from ${currentUserUsername} for you to ${actionText}. LoanID:${loanId} [Approve] [Decline] [Details]`;
            const notificationParams = new URLSearchParams({
                username: recipientUsername,
                type: 'approval',
                message: notificationMessage
            });

            try {
                const notifResponse = await fetch(`http://localhost:3000/send-notification?${notificationParams.toString()}`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (!notifResponse.ok) {
                    const notifError = await notifResponse.json();
                    console.error(`Failed to send notification to ${recipientUsername}:`, notifError.error);
                    // Use toast from the main component scope
                    toast({ title: "Warning", description: `Loan created, but failed to send notification to ${recipientUsername}.`, variant: "destructive" });
                } else {
                    console.log(`Notification sent to ${recipientUsername}`);
                }
            } catch(error) {
                console.error(`Error sending notification to ${recipientUsername}:`, error);
                toast({ title: "Warning", description: `Loan created, but failed to send notification to ${recipientUsername}.`, variant: "destructive" });
            }
        } else {
            console.error("Could not determine recipient username for the primary notification.");
        }

        // --- Send confirmation notification to the current user ---
        if (otherPartyUsername) {
            const selfNotificationMessage = `Your loan request ${directionText} ${otherPartyUsername} for ${values.amount} ${values.currency} has been initiated. LoanID:${loanId}`;
            const selfNotificationParams = new URLSearchParams({
                username: currentUserUsername,
                type: 'system',
                message: selfNotificationMessage,
                link: "http://localhost:3000/"
            });

            try {
                const selfNotifResponse = await fetch(`http://localhost:3000/send-notification?${selfNotificationParams.toString()}`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (!selfNotifResponse.ok) {
                    const selfNotifError = await selfNotifResponse.json();
                    console.error(`Failed to send confirmation notification to self (${currentUserUsername}):`, selfNotifError.error);
                    // Optional: Maybe add a less intrusive warning here if needed
                } else {
                    console.log(`Confirmation notification sent to self (${currentUserUsername})`);
                }
            } catch (error) {
                console.error(`Error sending confirmation notification to self (${currentUserUsername}):`, error);
            }
        } else {
            console.error("Could not determine the other party username for the confirmation notification.");
        }
    };

    // Function to check if a URL is a valid Imgur link
    const isValidImgurLink = (url: string) => {
        return url.trim() === '' || /^https?:\/\/(i\.)?imgur\.com\/\w+(\.\w+)?$/.test(url);
    };

    const handleAddProofLink = () => {
        if (proofLinks.length < 4) {
            setProofLinks([...proofLinks, '']);
        }
    };

    const handleRemoveProofLink = (index: number) => {
        const newLinks = [...proofLinks];
        newLinks.splice(index, 1);
        setProofLinks(newLinks);
    };

    const handleProofLinkChange = (value: string, index: number) => {
        const newLinks = [...proofLinks];
        newLinks[index] = value;
        setProofLinks(newLinks);
        
        // Validate Imgur URL format
        if (value && !isValidImgurLink(value)) {
            setProofLinkError("Only Imgur links are allowed (e.g., https://imgur.com/image or https://i.imgur.com/image.jpg)");
        } else {
            setProofLinkError(null);
        }
    };

    const handleOpenProofsDialog = () => {
        setProofLinks(['']);
        setProofLinkError(null);
        setProofsDialogOpen(true);
    };

    const handleSubmitProofs = () => {
        // Filter out empty links and validate all links
        const filteredLinks = proofLinks.filter(link => link.trim() !== '');
        
        // Check if all links are valid Imgur links
        const allValid = filteredLinks.every(link => isValidImgurLink(link));
        
        if (!allValid) {
            setProofLinkError("All links must be valid Imgur links");
            return;
        }
        
        // Store the proof links in form data or local state for submission
        toast({
            title: "Success",
            description: `Added ${filteredLinks.length} proof links`,
            variant: "default",
        });
        
        setProofsDialogOpen(false);
    };

    // Create image URL for preview
    const getImageUrl = (imgurUrl: string) => {
        if (!imgurUrl || !isValidImgurLink(imgurUrl)) return null;
        
        // Convert standard imgur URL to direct image URL if needed
        if (imgurUrl.includes('i.imgur.com')) {
            return imgurUrl; // Already a direct image URL
        } else {
            // Extract the ID and construct a direct thumbnail URL
            const match = imgurUrl.match(/imgur\.com\/(\w+)/);
            if (match && match[1]) {
                return `https://i.imgur.com/${match[1]}s.jpg`; // 's' suffix for small thumbnail
            }
            return null;
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await form.trigger(); // Trigger validation

        // --- Initial Validations ---
        if (!form.formState.isValid) {
            toast({ title: "Error", description: "Please fill all required fields correctly.", variant: "destructive" });
            return;
        }

        const isLoanerStillValid = values.loanerId === currentUserUsername || loanerUsernameValid;
        const isLoanedStillValid = values.loanedId === currentUserUsername || loanedUsernameValid;

        if (!isLoanerStillValid || !isLoanedStillValid) {
            let errorDesc = "Please ensure both usernames are valid.";
            if (!isLoanerStillValid) errorDesc = "Please enter a valid username for the loaner.";
            else if (!isLoanedStillValid) errorDesc = "Please enter a valid username for the loan recipient.";
            toast({ title: "Error", description: errorDesc, variant: "destructive" });
            return;
        }

        if (values.loanerId === values.loanedId) {
            toast({ title: "Error", description: "Loaner and recipient cannot be the same.", variant: "destructive" });
            return;
        }

        if (!currentUserUsername) {
             toast({ title: "Error", description: "User session expired or invalid. Please log in again.", variant: "destructive" });
             // Optionally navigate to login
             return;
        }

        let key = "loaner";
        if (values.loanedId === currentUserUsername) {
            key = "loaned";
        }
        const filteredProofs = { proofs: { [key]: proofLinks.filter(link => link.trim() !== '') } };
        console.log(filteredProofs);
        
        // --- API Call to Create Loan ---
        try {
            const queryParams = new URLSearchParams({
                loanerUsername: values.loanerId,
                loanedUsername: values.loanedId,
                amount: values.amount,
                currency: values.currency,
                timeExpires: values.timeExpires.getTime().toString(),
                proofs: JSON.stringify(filteredProofs),
            });

            const response = await fetch(
                `http://localhost:3000/create-loan?${queryParams}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create loan");
            }

            const data = await response.json();
            toast({
                title: "Success",
                description: "Loan created successfully",
                variant: "default", // Use default variant for success
            });

            // --- Handle Notifications ---
            if (data.loanId) {
                 await handleNotifications(data.loanId, values, currentUserUsername);
            } else {
                 console.warn("Loan ID not found in response, skipping notification sending.");
            }

            // --- Reset Form State ---
            form.reset();
            setLoanerUsernameValid(null);
            setLoanerDisplayName(null);
            setLoanerDisplayPfp(null);
            setLoanedUsernameValid(null);
            setLoanedDisplayName(null);
            setLoanedDisplayPfp(null);
            setTypeUser(null);
            setProofLinks(['']);

        } catch (error) {
            // --- Handle Loan Creation Error ---
            console.error("Error creating loan:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create loan",
                variant: "destructive",
            });
        } 
    }

    return (
        <div className="min-h-screen flex bg-sky-50 dark:bg-gray-900">
            <div className="hidden lg:block flex-none">
                <SidebarProvider>
                    <AppSidebar />
                </SidebarProvider>
            </div>
            <div className="flex-1 flex justify-center py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
                <main className="w-full max-w-2xl">
                    <h1 className={`text-3xl font-bold text-blue-600 dark:text-blue-400`} style={{ fontFamily: 'monospace' }}>
                        Create New Loan
                    </h1>
                    <div className="mb-4 h-6">
                        {typeUser && (
                            <p className={`text-sm font-medium ${typeUser === 'loaner' ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded inline-block'}`}>
                                {typeUser === 'loaner' ? 'You are loaning someone.' : 'You are borrowing from someone.'}
                            </p>
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-md rounded-lg p-6 sm:p-8">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <FormField
                                    control={form.control}
                                    name="loanerId"
                                    render={({ field }) => {
                                        return (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Loaner Username</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter loaner's username"
                                                            {...field}
                                                            onChange={async (e) => {
                                                                const username = e.target.value;
                                                                field.onChange(e); // Update form state
                                                                checkLoanerUsername(username); // Trigger debounced check (no await)
                                                            
                                                            }}
                                                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                    {field.value && (
                                                        <div className="absolute right-3 top-2.5">
                                                            {loanerUsernameValid === true && (
                                                                <Check className="h-5 w-5 text-green-500 dark:text-green-400" />
                                                            )}
                                                            {loanerUsernameValid === false && (
                                                                <X className="h-5 w-5 text-red-500 dark:text-red-400" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {loanerUsernameValid && loanerDisplayName && (
                                                    <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        {loanerDisplayPfp ? (
                                                            <img
                                                                src={loanerDisplayPfp}
                                                                alt={loanerDisplayName}
                                                                className="w-5 h-5 rounded-full mr-2"
                                                            />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-2 text-xs font-medium">
                                                                {loanerDisplayName[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span>{loanerDisplayName}</span>
                                                    </div>
                                                )}
                                                <FormMessage className="text-red-600 dark:text-red-500" />
                                            </FormItem>
                                        );
                                    }}
                                />

                                <FormField
                                    control={form.control}
                                    name="loanedId"
                                    render={({ field }) => {
                                        return (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Recipient Username</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter recipient's username"
                                                            {...field}
                                                            onChange={async (e) => {
                                                                const username = e.target.value;
                                                                field.onChange(e); // Update form state
                                                                checkLoanedUsername(username); // Trigger debounced check (no await)
                                                            }}
                                                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                    {field.value && (
                                                        <div className="absolute right-3 top-2.5">
                                                            {loanedUsernameValid === true && (
                                                                <Check className="h-5 w-5 text-green-500 dark:text-green-400" />
                                                            )}
                                                            {loanedUsernameValid === false && (
                                                                <X className="h-5 w-5 text-red-500 dark:text-red-400" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {loanedUsernameValid && loanedDisplayName && (
                                                    <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        {loanedDisplayPfp ? (
                                                            <img
                                                                src={loanedDisplayPfp}
                                                                alt={loanedDisplayName}
                                                                className="w-5 h-5 rounded-full mr-2"
                                                            />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-2 text-xs font-medium">
                                                                {loanedDisplayName[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span>{loanedDisplayName}</span>
                                                    </div>
                                                )}
                                                <FormMessage className="text-red-600 dark:text-red-500" />
                                            </FormItem>
                                        );
                                    }}
                                />

                                {/* Combined Amount and Currency Field */}
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Amount & Currency</FormLabel>
                                    <div className="flex items-end">
                                        {/* Amount Input Field */}
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <div className="flex-grow">
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="Enter amount"
                                                            {...field}
                                                            className="rounded-r-none focus:z-10 relative bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                </div>
                                            )}
                                        />
                                        {/* Currency Select Field */}
                                        <FormField
                                            control={form.control}
                                            name="currency"
                                            render={({ field }) => (
                                                <div>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-l-none border-l-0 w-auto focus:z-10 relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                                                                <SelectValue placeholder="Select currency" className="text-gray-500 dark:text-gray-400" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                                            {currencies.map((currency) => (
                                                                <SelectItem
                                                                    key={currency}
                                                                    value={currency}
                                                                    className="focus:bg-gray-100 dark:focus:bg-gray-700"
                                                                >
                                                                    {currency}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    {/* Combined Error Message */}
                                    <FormMessage className="text-red-600 dark:text-red-500">
                                        {form.formState.errors.amount?.message || form.formState.errors.currency?.message}
                                    </FormMessage>
                                </FormItem>

                                <FormField
                                    control={form.control}
                                    name="timeExpires"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-gray-700 dark:text-gray-300">Expiry Time</FormLabel>
                                            <FormControl>
                                                <ReactDatePicker
                                                    selected={field.value}
                                                    onChange={(date: Date) => field.onChange(date)}
                                                    showTimeSelect
                                                    timeFormat="HH:mm"
                                                    timeIntervals={15}
                                                    dateFormat="MMMM d, yyyy h:mm aa"
                                                    className="flex h-10 w-full rounded-md border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                                    placeholderText="Select expiry date and time"
                                                    minDate={new Date()}
                                                    calendarClassName="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                                    dayClassName={() => "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
                                                    monthClassName={() => "text-gray-700 dark:text-gray-300"}
                                                    timeClassName={() => "text-gray-700 dark:text-gray-300"}
                                                    popperPlacement="bottom-start"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-600 dark:text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                {/* Add a button for proofs before the submit button */}
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={handleOpenProofsDialog}
                                            className="flex items-center space-x-2 border-dashed"
                                        >
                                            <Images className="h-5 w-5" />
                                            <span>Add Proof Links</span>
                                        </Button>
                                        
                                        {proofLinks.some(link => link.trim() !== '') && (
                                            <span className="text-sm text-green-600 dark:text-green-400">
                                                {proofLinks.filter(link => link.trim() !== '').length} proof(s) added
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Display thumbnails of proof links in the main form */}
                                    {proofLinks.some(link => link.trim() !== '') && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {proofLinks
                                                .filter(link => link.trim() !== '')
                                                .map((link, index) => (
                                                    <div key={index} className="relative group">
                                                        {getImageUrl(link) ? (
                                                            <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 relative group">
                                                                <img 
                                                                    src={getImageUrl(link)} 
                                                                    alt={`Proof ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newLinks = [...proofLinks];
                                                                        newLinks.splice(proofLinks.findIndex(l => l === link), 1);
                                                                        if (newLinks.length === 0) newLinks.push('');
                                                                        setProofLinks(newLinks);
                                                                    }}
                                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                                                    aria-label="Remove proof"
                                                                >
                                                                    <Trash className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 overflow-hidden relative group">
                                                                <span className="px-1 text-center overflow-hidden text-ellipsis">
                                                                    {link.length > 15 ? link.substring(0, 15) + '...' : link}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newLinks = [...proofLinks];
                                                                        newLinks.splice(proofLinks.findIndex(l => l === link), 1);
                                                                        if (newLinks.length === 0) newLinks.push('');
                                                                        setProofLinks(newLinks);
                                                                    }}
                                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                                                    aria-label="Remove proof"
                                                                >
                                                                    <Trash className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white transition-all duration-200"
                                >
                                    Create Loan
                                </Button>
                            </form>
                        </Form>
                    </div>
                    
                    {/* Proofs Dialog */}
                    <Dialog open={proofsDialogOpen} onOpenChange={setProofsDialogOpen}>
                        <DialogContent className="sm:max-w-[550px]">
                            <DialogHeader>
                                <DialogTitle>Add Proof Links</DialogTitle>
                                <DialogDescription>
                                    Add up to 4 Imgur links as proof for this loan.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    {proofLinks.map((link, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id={`proof-link-${index}`}
                                                    placeholder="https://imgur.com/abcd123"
                                                    value={link}
                                                    onChange={(e) => handleProofLinkChange(e.target.value, index)}
                                                    className={`flex-1 ${!isValidImgurLink(link) && link.trim() !== '' ? 'border-red-500 dark:border-red-400' : ''}`}
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
                                        <p className="text-red-500 dark:text-red-400 text-sm">{proofLinkError}</p>
                                    )}
                                    
                                    {proofLinks.length < 4 && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={handleAddProofLink}
                                            className="mt-2"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Another Link
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setProofsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSubmitProofs}
                                    disabled={!!proofLinkError || !proofLinks.some(link => link.trim() !== '' && isValidImgurLink(link))}
                                >
                                    Confirm
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}
