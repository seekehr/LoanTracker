import { useToast } from "@/hooks/use-toast"; // Assuming useToast is accessible
import { useCallback, useEffect, useState } from 'react';

export interface Notification {
    id: number;
    accountId: number;
    type: 'approval' | 'message' | 'system';
    message: string;
    read: boolean; // Assuming backend will eventually support this
    // Allow for various potential types after JSON stringification/parsing
    timeCreated: string | number | Date;
    link: string | null; // Add this if it's missing
}

export function useNotifications(pollInterval: number = 30000) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Let's derive hasUnread from the fetched data if possible, or track separately
    // For now, let's assume any notification means "unread" until 'read' is implemented
    const [hasUnread, setHasUnread] = useState(false);
    const { toast } = useToast();

    const fetchNotifications = useCallback(async () => {
        // Don't set isLoading to true on subsequent polls, only initial load
        // setIsLoading(true); // Removed for polling
        setError(null);
        try {
            const response = await fetch('http://localhost:3000/get-notifications', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'application/json' },
            });

            if (response.ok) {
                const data: Notification[] = await response.json();
                // Sort based on attempting to parse timeCreated
                data.sort((a, b) => {
                    const dateA = new Date(a.timeCreated).getTime();
                    const dateB = new Date(b.timeCreated).getTime();
                    // Handle potential NaN from invalid dates during sort
                    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
                });
                setNotifications(data);
                setHasUnread(data.some(n => !n.read)); // Better: check actual read status if available
            } else if (response.status === 401) {
                // User might not be logged in, clear state
                setNotifications([]);
                setHasUnread(false);
                setError("Please log in to view notifications."); // Set error for NotificationsPage
            } else {
                const errorData = await response.json();
                console.error("Failed to fetch notifications:", response.statusText, errorData);
                setError(errorData.error || `Failed to fetch notifications: ${response.statusText}`);
                 // Don't toast on every poll failure, maybe only on manual refresh?
                // toast({ title: "Error", description: "Could not fetch notifications.", variant: "destructive" });
                setHasUnread(false); // Reset on error
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
            setHasUnread(false); // Reset on error
            // toast({ title: "Error", description: errorMessage, variant: "destructive" });
        } finally {
            // Only set loading to false after the *initial* fetch
            if (isLoading) {
                 setIsLoading(false);
            }
        }
    }, [toast, isLoading]); // Added isLoading dependency

    useEffect(() => {
        fetchNotifications(); // Initial fetch
        const intervalId = setInterval(fetchNotifications, pollInterval);
        return () => clearInterval(intervalId); // Cleanup interval
    }, [fetchNotifications, pollInterval]);

    return { notifications, isLoading, error, hasUnread, refetch: fetchNotifications };
} 