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
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                <Navbar />
                <div className="flex relative isolate">
                    <div className="hidden lg:block flex-none">
                        <SidebarProvider>
                            <AppSidebar />
                        </SidebarProvider>
                    </div>
                    <div className="flex-1">
                        <main className="px-4 sm:px-6 lg:px-12 py-6 lg:ml-16">
                            <div className="max-w-4xl mx-auto">
                                <h1 className="text-3xl font-bold mb-6">Loading...</h1>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profileData) {
        return <Error />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <Navbar />
            <div className="flex relative isolate">
                <div className="hidden lg:block flex-none">
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                </div>
                <div className="flex-1">
                    <main className="px-4 sm:px-6 lg:px-12 py-6 lg:ml-16">
                        <div className="max-w-[900px] mx-auto">
                            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-white/10 shadow-xl">
                                {/* Profile Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
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
                                        <div className="text-center sm:text-left">
                                            <h2 className="text-xl font-semibold flex items-center justify-center sm:justify-start gap-2">
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
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={profileData?.displayName}
                                                        className="w-full h-10 px-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer group-hover:border-blue-500/50 transition-colors"
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
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={profileData?.username}
                                                        className="w-full h-10 px-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer group-hover:border-blue-500/50 transition-colors"
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
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Created</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={new Date(profileData?.timeCreated).toLocaleDateString()}
                                            className="w-full h-10 px-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                                        />
                                    </div>

                                    {/* Verification ID */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Verification ID</label>
                                        <div className="relative">
                                            <input
                                                type={showVerificationId ? "text" : "password"}
                                                readOnly
                                                value={profileData?.verificationIdNumber}
                                                className="w-full h-10 px-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
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
