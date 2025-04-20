import { Button } from "@/components/ui/button";
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
import { Check, X } from "lucide-react";
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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await form.trigger();

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

            toast({
                title: "Error",
                description: errorDesc,
                variant: "destructive",
            });
            return;
        }


        if (values.loanerId === values.loanedId) {
            toast({
                title: "Error",
                description: "Loaner and recipient cannot be the same.",
                variant: "destructive",
            });
            return;
        }

        
        try {
            if (!currentUserUsername) {
                throw new Error("User session expired or invalid. Please log in again.");
            }

            const queryParams = new URLSearchParams({
                loanerUsername: values.loanerId,
                loanedUsername: values.loanedId,
                amount: values.amount,
                currency: values.currency,
                timeExpires: values.timeExpires.getTime().toString(),
            });

            const response = await fetch(
                `http://localhost:3000/create-loan?${queryParams}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create loan");
            }

            const data = await response.json();
            toast({
                title: "Success",
                description: "Loan created successfully",
                variant: "default",
            });

            // ---- Start Notification Logic ----
            try {
                 const loanId = data.loanId;
                 if (!loanId) {
                     console.warn("Loan ID not found in response, skipping notifications.");
                 } else if (currentUserUsername) {
                     let recipientUsername: string | null = null;
                     let actionText: string = '';
                     let otherPartyUsername: string | null = null; // Added for second notification
                     let directionText: string = ''; // Added for second notification

                     if (values.loanerId === currentUserUsername) {
                         // Current user is the loaner, notify the loaned
                         recipientUsername = values.loanedId;
                         actionText = 'borrow';
                         otherPartyUsername = values.loanedId; // Other party is the recipient
                         directionText = 'to';
                     } else if (values.loanedId === currentUserUsername) {
                         // Current user is the loaned, notify the loaner
                         recipientUsername = values.loanerId;
                         actionText = 'loan';
                         otherPartyUsername = values.loanerId; // Other party is the loaner
                         directionText = 'from';
                     }

                     // --- First Notification (to other user) ---
                     if (recipientUsername) {
                         const notificationMessage = `New loan request from ${currentUserUsername} for you to ${actionText}. LoanID:${loanId} [Approve] [Decline] [Details]`;
                         const notificationParams = new URLSearchParams({
                             username: recipientUsername,
                             type: 'approval',
                             message: notificationMessage,
                         });

                         try {
                             const notifResponse = await fetch(`http://localhost:3000/send-notification?${notificationParams.toString()}`, {
                                 method: 'POST',
                                 credentials: 'include',
                             });
                             if (!notifResponse.ok) {
                                 const notifError = await notifResponse.json();
                                 console.error(`Failed to send notification to ${recipientUsername}:`, notifError.error);
                                 toast({ title: "Warning", description: `Loan created, but failed to send notification to ${recipientUsername}.`, variant: "destructive" });
                             } else {
                                 console.log(`Notification sent to ${recipientUsername}`);
                             }
                         } catch(firstNotifError) {
                              console.error(`Error sending notification to ${recipientUsername}:`, firstNotifError);
                              toast({ title: "Warning", description: `Loan created, but failed to send notification to ${recipientUsername}.`, variant: "destructive" });
                         }
                     } else {
                         console.error("Could not determine recipient username for the primary notification.");
                     }

                    // --- Second Notification (to current user) ---
                    if (otherPartyUsername) {
                        const selfNotificationMessage = `Your loan request ${directionText} ${otherPartyUsername} for ${values.amount} ${values.currency} has been initiated. LoanID:${loanId}`;
                        const selfNotificationParams = new URLSearchParams({
                            username: currentUserUsername, // Target the current user
                            type: 'message', // Or 'system'
                            message: selfNotificationMessage,
                        });

                         try {
                             const selfNotifResponse = await fetch(`http://localhost:3000/send-notification?${selfNotificationParams.toString()}`, {
                                 method: 'POST',
                                 credentials: 'include',
                             });

                             if (!selfNotifResponse.ok) {
                                 const selfNotifError = await selfNotifResponse.json();
                                 // Don't necessarily show a toast for this, maybe just log it
                                 console.error(`Failed to send confirmation notification to self (${currentUserUsername}):`, selfNotifError.error);
                             } else {
                                 console.log(`Confirmation notification sent to self (${currentUserUsername})`);
                             }
                         } catch (selfNotifError) {
                              console.error(`Error sending confirmation notification to self (${currentUserUsername}):`, selfNotifError);
                         }
                    } else {
                         console.error("Could not determine the other party username for the confirmation notification.");
                    }

                 }
            } catch (error) { // Catch errors from the main loan creation fetch
                 console.error("Error during loan creation process:", error);
                 // The main toast for loan creation failure is handled in the outer catch block
            }
            // ---- End Notification Logic ----

            form.reset();
            setLoanerUsernameValid(null);
            setLoanerDisplayName(null);
            setLoanerDisplayPfp(null);
            setLoanedUsernameValid(null);
            setLoanedDisplayName(null);
            setLoanedDisplayPfp(null);
            setTypeUser(null);
        } catch (error) {
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
                    <div className="flex items-center justify-between mb-4">
                        <h1 className={`text-4xl font-bold text-blue-600  0`} style={{ fontFamily: 'monospace' }}>
                            Create New Loan
                        </h1>
                    </div>
                    <div className="mb-4 h-6">
                        {typeUser && (
                            <p className={`text-sm font-medium text-green-700 dark:text-green-400 ${typeUser === 'loaned' ? 'bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded inline-block' : ''}`}>
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
                                    <div className="flex items-end"> {/* Use items-end to align baseline if needed */} 
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                // Removed FormItem wrapper, added flex-grow
                                                <div className="flex-grow">
                                                    {/* Removed FormLabel */}
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="Enter amount"
                                                            {...field}
                                                            // Added rounded-r-none
                                                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 rounded-r-none focus:z-10 relative"
                                                        />
                                                    </FormControl>
                                                    {/* FormMessage moved outside the flex container */} 
                                                </div>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="currency"
                                            render={({ field }) => (
                                                // Removed FormItem wrapper
                                                <div> 
                                                    {/* Removed FormLabel */}
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            {/* Added rounded-l-none, border-l-0, removed margin-top */}
                                                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 rounded-l-none border-l-0 w-auto focus:z-10 relative">
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
                                                    {/* FormMessage moved outside the flex container */} 
                                                </div>
                                            )}
                                        />
                                    </div>
                                    {/* Display error messages below the combined field */}
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

                                <Button 
                                    type="submit" 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white transition-all duration-200"
                                >
                                    Create Loan
                                </Button>
                            </form>
                        </Form>
                    </div>
                </main>
            </div>
        </div>
    );
}
