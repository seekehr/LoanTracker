import { AppSidebar } from "@/components/AppSidebar";
import Error from "@/components/Error";
import { Navbar } from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface DetailItemProps {
    label: string;
    value: React.ReactNode;
    editable?: boolean;
    editContent?: React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, editable, editContent }) => (
    <div className="flex justify-between items-center py-3">
        <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{value}</span>
            {editable && editContent && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Pencil className="h-3 w-3 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" />
                        </Button>
                    </DialogTrigger>
                    {editContent}
                </Dialog>
            )}
        </div>
    </div>
);

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
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Navbar />
                <div className="flex relative isolate">
                    <div className="hidden lg:block flex-none">
                        <SidebarProvider>
                            <AppSidebar />
                        </SidebarProvider>
                    </div>
                    <div className="flex-1">
                        <main className="px-4 sm:px-6 lg:px-12 py-6 lg:ml-16">
                            <div className="max-w-xl mx-auto text-center">
                                <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Loading...</h1>
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
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Navbar />
            <div className="flex relative isolate">
                <div className="hidden lg:block flex-none">
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                </div>
                <div className="flex-1">
                    <main className="px-4 sm:px-6 lg:px-12 py-6 lg:ml-16">
                        <div className="max-w-xl mx-auto space-y-8">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="relative mb-4">
                                    <Avatar className="h-24 w-24 border-2 border-gray-100 dark:border-gray-700 shadow-md">
                                        <AvatarImage src={profileData?.pfp} alt={profileData?.displayName} className="object-cover" />
                                        <AvatarFallback className="text-3xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">{profileData?.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                size="icon"
                                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                                            >
                                                <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            <DialogHeader>
                                                <DialogTitle className="text-gray-900 dark:text-white">Update Profile Picture</DialogTitle>
                                            </DialogHeader>
                                            <Input
                                                type="url"
                                                placeholder="Enter new profile picture URL"
                                                onChange={(e) => handleUpdate("pfp", e.target.value)}
                                                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {profileData?.displayName}
                                    {profileData?.verified ? (
                                        <span title="Verified Account"><Check className="h-5 w-5 text-blue-500 dark:text-blue-400" /></span>
                                    ) : (
                                        <span title="Not Verified"><X className="h-5 w-5 text-red-500" /></span>
                                    )}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">@{profileData?.username}</p>
                            </div>

                            <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-md rounded-lg overflow-hidden">
                                <CardContent className="divide-y divide-gray-100 dark:divide-gray-700 p-0">
                                    <div className="p-4">
                                        <DetailItem 
                                            label="Display Name" 
                                            value={profileData.displayName} 
                                            editable 
                                            editContent={
                                                <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                                    <DialogHeader><DialogTitle className="text-gray-900 dark:text-white">Update Display Name</DialogTitle></DialogHeader>
                                                    <Input 
                                                        placeholder="Enter new display name" 
                                                        defaultValue={profileData?.displayName} 
                                                        onChange={(e) => handleUpdate("displayName", e.target.value)} 
                                                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </DialogContent>
                                            }
                                        />
                                    </div>
                                    <div className="p-4">
                                        <DetailItem 
                                            label="Username" 
                                            value={`@${profileData.username}`} 
                                            editable 
                                            editContent={
                                                <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                                    <DialogHeader><DialogTitle className="text-gray-900 dark:text-white">Update Username</DialogTitle></DialogHeader>
                                                    <Input 
                                                        placeholder="Enter new username" 
                                                        defaultValue={profileData?.username} 
                                                        onChange={(e) => handleUpdate("username", e.target.value)} 
                                                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </DialogContent>
                                            }
                                        />
                                    </div>
                                    <div className="p-4">
                                        <DetailItem label="Account Created" value={new Date(profileData.timeCreated).toLocaleDateString()} />
                                    </div>
                                    <div className="p-4">
                                        <DetailItem label="Account Verification" value={profileData.verified ? <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700">Verified</Badge> : <Badge variant="destructive">Not Verified</Badge>} />
                                    </div>
                                    <div className="flex justify-between items-center p-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Verification ID</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{showVerificationId ? profileData.verificationIdNumber : '••••••••••••'}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => setShowVerificationId(!showVerificationId)}
                                                className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                            >
                                                {showVerificationId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-12 flex justify-center">
                                <Button 
                                    onClick={handleLogout}
                                    variant="destructive"
                                    className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white w-full max-w-xs"
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
