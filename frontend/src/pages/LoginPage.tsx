
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addCookie, TOKEN_COOKIE_EXPIRY } from "@/lib/utils";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "username": username,
                    "password": password,
                },
            });

            
            if (response.ok) {
                const data = await response.json();
                if ("token" in data && typeof(data["token"]) === "string") {
                    toast({
                        title: "Login successful",
                        description: "Welcome back!",
                    });
                    addCookie("token", data["token"] as string, TOKEN_COOKIE_EXPIRY);
                    navigate("/");
                } else {
                    toast({
                        variant: "destructive",
                        title: "Login failed",
                        description: "Invalid token found? Report to dev..",
                    });
                }
                
            } else {
                toast({
                    variant: "destructive",
                    title: "Login failed",
                    description: "Invalid username/password.",
                });
            }
        } catch (error) {
            console.log(error);
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
                    <h2 className="text-3xl font-bold">Welcome back</h2>
                    <p className="mt-2 text-muted-foreground">Sign in to your account</p>
                </div>
        
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
                            </label>
                            <Input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        <LogIn className="mr-2 h-4 w-4" /> Sign in
                    </Button>
                </form>

                <div className="text-center">
                    <Link to="/register">
                        <Button variant="link">Register instead?</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
