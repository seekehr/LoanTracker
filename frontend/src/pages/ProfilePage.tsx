import { AppSidebar } from "@/components/AppSidebar";
import Error from "@/components/Error";
import { Navbar } from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getCookie } from "@/lib/utils";
import { Check, Eye, EyeOff, LogOut, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingPage from "./LoadingPage";

interface ProfileData {
    displayName: string;
    username: string;
    timeCreated: string;
    pfp: string;
    verified: boolean;
    verificationIdNumber: string;
}

export default function ProfilePage() {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showVerificationId, setShowVerificationId] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            console.log("HIIIII");
            if (!getCookie("token")) {
                setLoading(false);
                setError(true);
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/profile", {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [setLoading, setProfileData, setError]);

    const handleUpdate = async (field: string, value: string) => {
        try {
            const response = await fetch(`http://localhost:3000/update-account?${field}=${value}`, {
                method: "POST",
                credentials: "include",
            });
            if (response.ok) {
                setProfileData((prev) => prev ? { ...prev, [field]: value } : null);
            }
        } catch (error) {
            console.error(`Failed to update ${field}:`, error);
        }
    };

    const handleLogout = () => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/");
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (error || !profileData) {
        return <Error />;
    }

    return (
        <div className="relative min-h-screen">
            {/* Fixed background that covers entire viewport */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/25 to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
            
            {/* Content layer */}
            <div className="relative flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-1 flex">
                    <div className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 border-r border-border/40 bg-background/60 backdrop-blur-sm">
                        <SidebarProvider>
                            <AppSidebar />
                        </SidebarProvider>
                    </div>

                    <main className="flex-1 w-full">
                        <div className="max-w-[1200px] mx-auto p-6">
                            

                            {/* Main Content */}
                            <div className="bg-background/60 backdrop-blur-lg rounded-3xl p-8 border border-border/50 shadow-xl">
                                {/* Profile Header */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={profileData?.pfp} alt={profileData?.displayName} className="object-cover" />
                                                <AvatarFallback>{profileData?.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button 
                                                        variant="outline" 
                                                        size="icon"
                                                        className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-background shadow-md hover:shadow-lg"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Update Profile Picture</DialogTitle>
                                                    </DialogHeader>
                                                    <Input
                                                        type="url"
                                                        placeholder="Enter new profile picture URL"
                                                        onChange={(e) => handleUpdate("pfp", e.target.value)}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                                {profileData?.displayName}
                                                <div className="relative group">
                                                    {profileData?.verified ? (
                                                        <>
                                                            <Check className="h-5 w-5 text-blue-500" />
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-blue-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                                Verified Account
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <X className="h-5 w-5 text-red-500" />
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                                Not Verified
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </h2>
                                            <p className="text-muted-foreground">@{profileData?.username}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Display Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Display Name</label>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={profileData?.displayName}
                                                        className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 cursor-pointer group-hover:border-blue-500/50 transition-colors"
                                                    />
                                                    <div className="absolute right-3 top-2.5">
                                                        <Pencil className="h-4 w-4 text-muted-foreground/50 group-hover:text-blue-500" />
                                                    </div>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update Display Name</DialogTitle>
                                                </DialogHeader>
                                                <Input
                                                    placeholder="Enter new display name"
                                                    defaultValue={profileData?.displayName}
                                                    onChange={(e) => handleUpdate("displayName", e.target.value)}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Username */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Username</label>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={profileData?.username}
                                                        className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 cursor-pointer group-hover:border-blue-500/50 transition-colors"
                                                    />
                                                    <div className="absolute right-3 top-2.5">
                                                        <Pencil className="h-4 w-4 text-muted-foreground/50 group-hover:text-blue-500" />
                                                    </div>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update Username</DialogTitle>
                                                </DialogHeader>
                                                <Input
                                                    placeholder="Enter new username"
                                                    defaultValue={profileData?.username}
                                                    onChange={(e) => handleUpdate("username", e.target.value)}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Account Created */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Account Created</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={new Date(profileData?.timeCreated).toLocaleDateString()}
                                            className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50"
                                        />
                                    </div>

                                    {/* Verification ID */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Verification ID</label>
                                        <div className="relative">
                                            <input
                                                type={showVerificationId ? "text" : "password"}
                                                readOnly
                                                value={profileData?.verificationIdNumber}
                                                className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50"
                                            />
                                            <div className="absolute right-3 top-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowVerificationId(!showVerificationId)}
                                                    className="h-6 w-6 p-0 hover:text-blue-500"
                                                >
                                                    {showVerificationId ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <Button 
                                    onClick={handleLogout}
                                    variant="destructive"
                                    className="w-full mt-8 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
