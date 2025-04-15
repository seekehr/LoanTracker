import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Check, Eye, EyeOff, LogOut, Pencil } from "lucide-react";
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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
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
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

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

    if (loading || !profileData) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <div className="flex flex-1">
                    <AppSidebar />
                    <div className="flex-1 p-8">
                        <div className="max-w-6xl w-full mx-auto space-y-8">
                            <div className="flex flex-col items-center space-y-4">
                                <Avatar className="w-32 h-32 ring-4 ring-primary/10 transition-all duration-300 hover:ring-primary/30">
                                    <AvatarImage src={profileData?.pfp} alt={profileData?.displayName} className="object-cover" />
                                    <AvatarFallback className="text-2xl">{profileData?.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="mt-4 transition-all duration-300 hover:shadow-md">
                                            Update Profile Picture
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Update Profile Picture</DialogTitle>
                                        </DialogHeader>
                                        <Input
                                            type="url"
                                            placeholder="Enter new profile picture URL"
                                            onChange={(e) => handleUpdate("pfp", e.target.value)}
                                            className="mt-4"
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="space-y-4 bg-card rounded-xl p-6 shadow-lg backdrop-blur-sm border border-primary/10 transition-all duration-300 hover:shadow-xl">
                                <div className="flex items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-colors">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Display Name</h3>
                                        <p className="text-lg font-semibold">{profileData?.displayName}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {profileData?.verified && (
                                            <Check className="h-5 w-5 text-blue-500" />
                                        )}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
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
                                </div>

                                <div className="flex items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-colors">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                                        <p className="text-lg">{profileData?.username}</p>
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
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

                                <div className="p-4 hover:bg-accent/50 rounded-lg transition-colors">
                                    <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
                                    <p className="text-lg">{new Date(profileData?.timeCreated).toLocaleDateString()}</p>
                                </div>

                                <div className="flex items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-colors">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-muted-foreground">Verification ID</h3>
                                        <p className="text-lg font-mono break-all">
                                            {showVerificationId ? profileData?.verificationIdNumber : "•".repeat(20)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowVerificationId(!showVerificationId)}
                                        >
                                            {showVerificationId ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update Verification ID</DialogTitle>
                                                </DialogHeader>
                                                <Input
                                                    type={showVerificationId ? "text" : "password"}
                                                    placeholder="Enter new verification ID"
                                                    onChange={(e) => handleUpdate("verificationIdNumber", e.target.value)}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={handleLogout}
                                variant="destructive"
                                className="w-full mt-8 hover:bg-red-700 transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Log out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
