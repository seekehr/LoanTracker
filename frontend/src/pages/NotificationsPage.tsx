import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import { BellRing, CheckCircle, Info, Link as LinkIcon, Loader2, MailCheck, XCircle } from "lucide-react";

// Helper to parse the notification message for actions
const parseNotificationMessage = (message: string) => {
    const parts = message.match(/^(.*?) LoanID:(\d+) \[(Approve)\] \[(Decline)\] \[(Details)\]$/);
    if (parts && parts.length === 6) {
        return {
            text: parts[1].trim(),
            loanId: parts[2],
            actions: {
                approve: true,
                decline: true,
                details: true,
            }
        };
    }
    // Default case if parsing fails or it's not an approval message
    return { text: message, loanId: null, actions: null };
};

// Helper function to format dates nicely - make more robust
const formatRelativeTime = (dateInput: string | number | Date | null | undefined): string => {
    if (!dateInput) {
        return 'Invalid date'; // Handle null or undefined input
    }

    let date: Date;
    try {
        date = new Date(dateInput);
        // Check if the date object is valid
        if (isNaN(date.getTime())) {
            console.warn("formatRelativeTime received invalid date input:", dateInput);
            return 'Invalid date';
        }
    } catch (e) {
        console.error("Error creating Date object in formatRelativeTime:", e);
        return 'Invalid date';
    }

    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export default function NotificationsPage() {
    const { notifications, isLoading, error } = useNotifications();
    const { toast } = useToast();

    // Placeholder functions for button actions
    const handleApprove = (loanId: string | null) => {
        if (!loanId) return;
        console.log(`Approving loan ${loanId}`);
        toast({ title: "Action", description: `Loan ${loanId} approved (placeholder).` });
        // TODO: Implement API call to approve loan & refetch notifications
    };

    const handleDecline = (loanId: string | null) => {
        if (!loanId) return;
        console.log(`Declining loan ${loanId}`);
        toast({ title: "Action", description: `Loan ${loanId} declined (placeholder).`, variant: "destructive" });
        // TODO: Implement API call to decline loan & refetch notifications
    };

    const handleDetails = (loanId: string | null) => {
         if (!loanId) return;
        console.log(`Viewing details for loan ${loanId}`);
        toast({ title: "Action", description: `Viewing details for loan ${loanId} (placeholder).` });
        // TODO: Implement navigation or modal for loan details
    };

    // Handler for the Mark as Read button
    const handleMarkAsRead = (notificationId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling if the card is clickable
        console.log(`Marking notification ${notificationId} as read (WIP)`);
        alert('Mark as read - WIP');
        // TODO: Implement API call to mark as read & refetch or update state
    };

    return (
        <div className="min-h-screen flex bg-sky-50 dark:bg-gray-900">
            <div className="hidden lg:block flex-none">
                <SidebarProvider>
                    <AppSidebar />
                </SidebarProvider>
            </div>
            <div className="flex-1 flex justify-center py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
                <main className="w-full max-w-3xl">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6" style={{ fontFamily: 'monospace' }}>
                        Notifications
                    </h1>

                    {isLoading && (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="ml-3 text-gray-600 dark:text-gray-400">Loading notifications...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {!isLoading && !error && notifications.length === 0 && (
                         <div className="text-center py-10">
                            <BellRing className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
                         </div>
                    )}

                    {!isLoading && !error && notifications.length > 0 && (
                        <div className="space-y-4">
                            {notifications.map((notif) => {
                                const parsed = parseNotificationMessage(notif.message);
                                const Icon = notif.type === 'approval' ? BellRing :
                                             notif.type === 'message' ? Info :
                                             BellRing;

                                return (
                                    <div key={notif.id} className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-4 flex items-start space-x-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                         <div className={`p-2 rounded-full ${
                                            notif.type === 'approval' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                            'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                         }`}>
                                            <Icon className="h-5 w-5" />
                                         </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 dark:text-gray-200 pr-10">{parsed.text}</p>
                                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                 {formatRelativeTime(notif.timeCreated)}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2 items-center">
                                                {parsed.actions && (
                                                    <>
                                                        <Button size="sm" variant="outline" className="bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/50 hover:text-green-800 dark:hover:text-green-300" onClick={() => handleApprove(parsed.loanId)}>
                                                             <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50 hover:text-red-800 dark:hover:text-red-300" onClick={() => handleDecline(parsed.loanId)}>
                                                             <XCircle className="h-4 w-4 mr-1.5" /> Decline
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="bg-gray-50 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleDetails(parsed.loanId)}>
                                                            <Info className="h-4 w-4 mr-1.5" /> Details
                                                        </Button>
                                                    </>
                                                )}

                                                {notif.link && (
                                                    <a
                                                        href={notif.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 ${
                                                            parsed.actions ? 'ml-auto' : ''
                                                        }`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <LinkIcon className="h-4 w-4 mr-1.5" /> Visit Link
                                                    </a>
                                                )}
                                             </div>
                                        </div>

                                        <div className="absolute top-3 right-3 flex items-center space-x-2">
                                            <button
                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                                                title="Mark as read"
                                            >
                                                <MailCheck className="h-4 w-4" />
                                            </button>

                                             {!notif.read && (
                                                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0" title="Unread"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
