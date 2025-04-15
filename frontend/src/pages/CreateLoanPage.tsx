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
import { verifyName } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useCallback, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppSidebar } from "../components/AppSidebar";
import { Navbar } from "../components/Navbar";

const formSchema = z.object({
    loanedId: z.string().min(1, "Username is required"),
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
    const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [displayPfp, setDisplayPfp] = useState<string | null>(null);

    const checkUsernameRaw = async (username: string) => {
        if (!verifyName(username)) {
            setUsernameValid(false);
            setDisplayName(null);
            setDisplayPfp(null);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/check-username?username=${username}`);
            const isValid = !response.ok;
            setUsernameValid(isValid);
            
            if (isValid) {
                const profileResponse = await fetch(`http://localhost:3000/profile?paramUser=${username}`, {
                    credentials: 'include'
                });
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    setDisplayName(profileData.displayName);
                    setDisplayPfp(profileData.pfp);
                }
            } else {
                setDisplayName(null);
                setDisplayPfp(null);
            }
        } catch (error) {
            setUsernameValid(false);
            setDisplayName(null);
            setDisplayPfp(null);
        }
    };

    const checkUsername = useCallback(checkUsernameRaw, []);
    
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            loanedId: "",
            amount: "",
            currency: "",
            timeExpires: undefined,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!usernameValid) {
            toast({
                title: "Error",
                description: "Please enter a valid username for the loan recipient",
                variant: "destructive",
            });
            return;
        }

        try {
            const queryParams = new URLSearchParams({
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
            });
            form.reset();
            setUsernameValid(null);
            setDisplayName(null);
            setDisplayPfp(null);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create loan",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <Navbar />
            <div className="flex relative isolate">
                <div className="hidden lg:block flex-none">
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                </div>
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:ml-14">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-300">
                                Create New Loan
                            </h1>
                        </div>
                        <div className="bg-white/5 dark:bg-gray-900/20 backdrop-blur-xl rounded-xl border border-white/10 dark:border-white/5 p-4 sm:p-6 lg:p-8 shadow-2xl">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={form.control}
                                        name="loanedId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground/90 dark:text-white/90">Recipient Username</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter recipient's username"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                checkUsername(e.target.value);
                                                            }}
                                                            className="bg-white/5 dark:bg-gray-900/50 border-white/10 dark:border-white/10 focus:border-orange-500/50 dark:focus:border-orange-500/50 focus:ring-orange-500/20 dark:focus:ring-orange-500/20 placeholder:text-muted-foreground/50"
                                                        />
                                                    </FormControl>
                                                    {field.value && (
                                                        <div className="absolute right-3 top-2.5">
                                                            {usernameValid === true && (
                                                                <Check className="h-5 w-5 text-green-500 dark:text-green-400" />
                                                            )}
                                                            {usernameValid === false && (
                                                                <X className="h-5 w-5 text-red-500 dark:text-red-400" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {usernameValid && displayName && (
                                                    <div className="flex items-center mt-2 text-sm text-muted-foreground/70 dark:text-white/70">
                                                        {displayPfp ? (
                                                            <img
                                                                src={displayPfp}
                                                                alt={displayName}
                                                                className="w-5 h-5 rounded-full mr-2"
                                                            />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400 flex items-center justify-center mr-2 text-xs">
                                                                {displayName[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span>{displayName}</span>
                                                    </div>
                                                )}
                                                <FormMessage className="text-red-500 dark:text-red-400" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground/90 dark:text-white/90">Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Enter amount"
                                                        {...field}
                                                        className="bg-white/5 dark:bg-gray-900/50 border-white/10 dark:border-white/10 focus:border-orange-500/50 dark:focus:border-orange-500/50 focus:ring-orange-500/20 dark:focus:ring-orange-500/20 placeholder:text-muted-foreground/50"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500 dark:text-red-400" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground/90 dark:text-white/90">Currency</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/5 dark:bg-gray-900/50 border-white/10 dark:border-white/10 focus:ring-orange-500/20 dark:focus:ring-orange-500/20">
                                                            <SelectValue placeholder="Select currency" className="text-muted-foreground/70" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-background/95 dark:bg-gray-900/95 border-white/10 dark:border-white/10 backdrop-blur-xl">
                                                        {currencies.map((currency) => (
                                                            <SelectItem
                                                                key={currency}
                                                                value={currency}
                                                                className="focus:bg-orange-500/10 dark:focus:bg-orange-500/20"
                                                            >
                                                                {currency}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-red-500 dark:text-red-400" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="timeExpires"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-foreground/90 dark:text-white/90">Expiry Time</FormLabel>
                                                <FormControl>
                                                    <ReactDatePicker
                                                        selected={field.value}
                                                        onChange={(date: Date) => field.onChange(date)}
                                                        showTimeSelect
                                                        timeFormat="HH:mm"
                                                        timeIntervals={15}
                                                        dateFormat="MMMM d, yyyy h:mm aa"
                                                        className="flex h-10 w-full rounded-md border bg-white/5 dark:bg-gray-900/50 border-white/10 dark:border-white/10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus:border-orange-500/50 dark:focus:border-orange-500/50 focus:ring-orange-500/20 dark:focus:ring-orange-500/20 focus:outline-none"
                                                        placeholderText="Select expiry date and time"
                                                        minDate={new Date()}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500 dark:text-red-400" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button 
                                        type="submit" 
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-500/90 dark:hover:bg-orange-600/90 dark:text-white/90 transition-all duration-200"
                                    >
                                        Create Loan
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
