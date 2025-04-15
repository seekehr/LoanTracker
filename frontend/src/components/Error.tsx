import { Button } from "@/components/ui/button";
import { Home, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Error = () => {
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-red-500/20">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Failed to Load Profile</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        We couldn't load your profile data. This might be due to a network issue or the server being unavailable.
                    </p>
                    <div className="pt-4 space-y-3">
                        <Button 
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-500 hover:bg-red-600 text-white"
                        >
                            Try Again
                        </Button>
                        <Button 
                            onClick={() => navigate("/")}
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Go Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Error;