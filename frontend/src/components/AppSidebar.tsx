import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, ChevronLeft, ChevronRight, FilePlus, FileText, Home, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function AppSidebar() {
    const navigate = useNavigate();
    const currentPath = window.location.pathname;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isMobile = useIsMobile();
    const { hasUnread } = useNotifications();

    const topMenuItems = [
        { title: "Create Loan", icon: FilePlus, path: "/create-loan" },
        { title: "Manage Loans", icon: FileText, path: "/manage-loans" },
        { title: "Notifications", icon: Bell, path: "/notifications" },
    ];

    const settingsItem = { title: "Settings", icon: Settings, path: "/profile" };
    const homeItem = { title: "Home", icon: Home, path: "/" };

    const NavItem = ({ item, isCollapsed, currentPath, hideText = false }: { item: typeof topMenuItems[0], isCollapsed: boolean, currentPath: string, hideText?: boolean }) => (
        <a
            key={item.title}
            href={item.path}
            title={isCollapsed ? item.title : undefined}
            onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
                if (isMobile) setIsCollapsed(true);
            }}
            className={`flex items-center gap-3 ${isCollapsed && hideText ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                currentPath === item.path
                    ? "bg-sky-100 text-blue-600 dark:bg-blue-900/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
            }`}
        >
            <div className="relative">
                <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    currentPath === item.path
                        ? "text-blue-500"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                }`} />
                {item.title === "Notifications" && hasUnread && !isCollapsed && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
                )}
                {item.title === "Notifications" && hasUnread && isCollapsed && (
                    <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-sky-100/90 dark:ring-gray-950/95" />
                )}
            </div>
            {!hideText && (
                <span className={`whitespace-nowrap transition-opacity duration-200 delay-100 ${
                    isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                    {item.title}
                </span>
            )}
        </a>
    );

    return (
        <>
            <div className={`fixed top-0 bottom-0 transition-all duration-300 ease-in-out ${isMobile ? 'z-50' : ''} ${isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-64 opacity-100'}`}>
                <div className={`absolute inset-0 transition-opacity duration-300`}>
                    <div className="absolute inset-0 bg-sky-100/90 dark:bg-gray-950/95 backdrop-blur-sm border-r border-gray-200/50 dark:border-white/[0.06]" />
                </div>
                
                <div className={`relative h-full w-full z-10 flex flex-col`}>
                    <div className="px-3 py-4 flex-shrink-0">
                        <div className={`pl-3 text-xl font-bold text-blue-600`} style={{ fontFamily: 'monospace' }}>
                            LoanTracker
                        </div>
                    </div>
                    <nav className="flex-grow px-3 py-2 space-y-1 overflow-y-auto">
                        {topMenuItems.map((item) => (
                            <NavItem key={item.title} item={item} isCollapsed={false} currentPath={currentPath} />
                        ))}
                    </nav>
                    <div className="mt-auto px-3 py-8 flex-shrink-0">
                        <div className="mb-8">
                            <NavItem item={settingsItem} isCollapsed={false} currentPath={currentPath} />
                        </div>
                        <hr className="my-2 border-t border-gray-200 dark:border-gray-700" />
                        <div className={`flex items-center justify-between mt-4`}>
                            <a
                                href={homeItem.path}
                                title={homeItem.title}
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    navigate(homeItem.path);
                                    if (isMobile) setIsCollapsed(true);
                                }}
                                className={`flex items-center justify-center p-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200 ${ 
                                    currentPath === homeItem.path 
                                        ? "bg-sky-100 text-blue-600 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700" 
                                        : ""
                                }`}
                            >
                                <Home className={`h-4 w-4 flex-shrink-0 ${ 
                                    currentPath === homeItem.path
                                        ? "text-blue-500" 
                                        : "text-gray-500 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-100"
                                }`} />
                            </a>
                            <ThemeSwitcher />
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`fixed top-4 p-1.5 rounded-full bg-blue-300 dark:bg-black text-white shadow-md hover:bg-gray-800 transition-all duration-300 z-50 font-mono ${isCollapsed ? 'left-4' : 'left-[15rem]'}`}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </button>

            {isMobile && !isCollapsed && (
                <div 
                    className="fixed inset-0 bg-gray-400/20 dark:bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsCollapsed(true)}
                />
            )}
        </>
    );
}
