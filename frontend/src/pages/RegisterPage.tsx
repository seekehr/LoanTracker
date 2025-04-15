import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addCookie, getCookie, TOKEN_COOKIE_EXPIRY, verifyName } from "@/lib/utils";
import { Check, UserPlus, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Japan",
    "China",
    "India",
    "Brazil",
];

function verifyPassword(password: string): boolean {
    if (password.length < 8 || password.length > 30) {
        return false;
    }

    if (/\s/.test(password)) {
        return false;
    }

    if (!/[a-zA-Z]/.test(password)) {
        return false;
    }

    if (!/[0-9]/.test(password)) {
        return false;
    }

    return /[^a-zA-Z0-9]/.test(password);
}


function verifyDisplayName(name: string): boolean {
    if (name.length < 6 || name.length > 60) {
        return false;
    }
        
    return /^(?=.*[a-zA-Z])(?!.* {2})[a-zA-Z0-9_ ]+$/.test(name);
}


const RegisterPage = () => {
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [country, setCountry] = useState("");
    const [displayNameValid, setDisplayNameValid] = useState<boolean | null>(null);
    const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
    const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const checkUsernameRaw = async (username: string) => {
        if (!verifyName(username)) {
            setUsernameValid(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/check-username?username=${username}`);
            setUsernameValid(response.ok);
        } catch (error) {
            setUsernameValid(false);
        }
    };

    const checkUsername = useCallback(checkUsernameRaw, [setUsernameValid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (getCookie("not-new") === "true") {
            toast({
                variant: "destructive",
                title: "Registration failed",
                description: "Multiple accounts from the same IP address are not allowed",
            });
            return;
        }
        
        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "displayname": displayName,
                    "username": username,
                    "password": password,
                    "country": "PK",
                },
            });

            if (response.ok) {
                const data = await response.json();
                if ("token" in data && typeof(data["token"]) === "string") {
                    toast({
                        title: "Registration successful",
                        description: "Welcome!",
                    });
                    addCookie("token", data["token"] as string, TOKEN_COOKIE_EXPIRY);
                    addCookie("not-new", "true", 31536000);
                    navigate("/login");
                } else {
                    toast({
                        variant: "destructive",
                        title: "Registration failed",
                        description: "Invalid token found? Report to dev..",
                    });
                }
            } else {
                if (response.status === 403) {
                    toast({
                        variant: "destructive",
                        title: "Registration failed",
                        description: "Multiple accounts from the same IP address are not allowed",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Registration failed",
                        description: "Please check your information and try again.",
                    });
                }
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not connect to the server.",
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Create an account</h2>
                    <p className="mt-2 text-muted-foreground">Sign up to get started</p>
                </div>
        
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                Display Name
                            </label>
                            <Input
                                id="displayName"
                                type="text"
                                required
                                value={displayName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setDisplayName(value);
                                    setDisplayNameValid(verifyDisplayName(value));
                                }}
                                placeholder="Enter your display name"
                            />
                            <div className="absolute right-3 top-9">
                                {displayNameValid === true && <Check className="w-4 h-4 text-green-500" />}
                                {displayNameValid === false && <X className="w-4 h-4 text-red-500" />}
                            </div>
                        </div>
                        <div className="relative">
                            <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
                            </label>
                            <Input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setUsername(value);
                                    checkUsername(value);
                                }}
                                placeholder="Choose a username"
                            />
                            <div className="absolute right-3 top-9">
                                {usernameValid === true && <Check className="w-4 h-4 text-green-500" />}
                                {usernameValid === false && <X className="w-4 h-4 text-red-500" />}
                            </div>
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPassword(value);
                                    setPasswordValid(verifyPassword(value));
                                }}
                                placeholder="Choose a password"
                            />
                            <div className="absolute right-3 top-9">
                                {passwordValid === true && <Check className="w-4 h-4 text-green-500" />}
                                {passwordValid === false && <X className="w-4 h-4 text-red-500" />}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium mb-2">
                Country
                            </label>
                            <Select value={country} onValueChange={setCountry} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country} value={country}>
                                            {country}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" /> Sign up
                    </Button>
                </form>

                <div className="text-center">
                    <Link to="/login">
                        <Button variant="link">Login instead?</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
