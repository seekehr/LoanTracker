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
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <div className="hidden lg:block w-56 h-[calc(100vh-4rem)] sticky top-16 border-r border-border/40 bg-background/60 backdrop-blur-sm">
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                </div>
                <main className="flex-1 p-6">
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-3xl font-bold mb-6">Create New Loan</h1>
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
                                            <FormLabel>Recipient Username</FormLabel>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter recipient's username"
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            checkUsername(e.target.value);
                                                        }}
                                                    />
                                                </FormControl>
                                                {field.value && (
                                                    <div className="absolute right-3 top-2.5">
                                                        {usernameValid === true && (
                                                            <Check className="h-5 w-5 text-green-500" />
                                                        )}
                                                        {usernameValid === false && (
                                                            <X className="h-5 w-5 text-red-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {usernameValid && displayName && (
                                                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                                    {displayPfp ? (
                                                        <img
                                                            src={displayPfp}
                                                            alt={displayName}
                                                            className="w-5 h-5 rounded-full mr-2"
                                                        />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-xs">
                                                            {displayName[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span>{displayName}</span>
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Enter amount"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currencies.map((currency) => (
                                                        <SelectItem
                                                            key={currency}
                                                            value={currency}
                                                        >
                                                            {currency}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="timeExpires"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Expiry Time</FormLabel>
                                            <FormControl>
                                                <ReactDatePicker
                                                    selected={field.value}
                                                    onChange={(date: Date) => field.onChange(date)}
                                                    showTimeSelect
                                                    timeFormat="HH:mm"
                                                    timeIntervals={15}
                                                    dateFormat="MMMM d, yyyy h:mm aa"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholderText="Select expiry date and time"
                                                    minDate={new Date()}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full">
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
