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
        <div className="min-h-screen bg-white dark:bg-gray-900">
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
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0044FF] to-[#60EFFF] dark:from-[#60EFFF] dark:to-[#0044FF]">
                                Create New Loan
                            </h1>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-md rounded-lg p-6 sm:p-8">
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
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Recipient Username</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter recipient's username"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                checkUsername(e.target.value);
                                                            }}
                                                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
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
                                                    <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        {displayPfp ? (
                                                            <img
                                                                src={displayPfp}
                                                                alt={displayName}
                                                                className="w-5 h-5 rounded-full mr-2"
                                                            />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-2 text-xs font-medium">
                                                                {displayName[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span>{displayName}</span>
                                                    </div>
                                                )}
                                                <FormMessage className="text-red-600 dark:text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Enter amount"
                                                        {...field}
                                                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-600 dark:text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Currency</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
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
                                                <FormMessage className="text-red-600 dark:text-red-500" />
                                            </FormItem>
                                        )}
                                    />

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
                    </div>
                </main>
            </div>
        </div>
    );
}
