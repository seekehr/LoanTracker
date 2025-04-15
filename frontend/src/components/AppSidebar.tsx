import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight, FilePlus, FileText, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function AppSidebar() {
    const navigate = useNavigate();
    const currentPath = window.location.pathname;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isMobile = useIsMobile();

    const menuItems = [
        { title: "Create Loan", icon: FilePlus, path: "/create-loan" },
        { title: "Manage Loans", icon: FileText, path: "/manage-loans" },
        { title: "Settings", icon: Settings, path: "/profile" },
    ];

    return (
        <div className={`fixed top-16 bottom-0 transition-all duration-300 ease-in-out ${isMobile ? 'z-50' : ''} ${isCollapsed ? 'w-14' : 'w-64'}`}>
            <div className={`absolute inset-0 transition-all duration-300 ${isCollapsed ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}`}>
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/95 backdrop-blur-sm border-r border-gray-200/50 dark:border-white/[0.06]" />
            </div>
            
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-6 p-1.5 rounded-full bg-white dark:bg-gray-950 border border-gray-200/50 dark:border-white/[0.06] shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900/80 transition-colors z-50"
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                ) : (
                    <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
            </button>

            <div className="relative h-full w-full z-10">
                <div className="px-3 py-2">
                    <div className={`px-3 py-2 text-xs font-medium text-blue-600 dark:text-cyan-500 transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        {!isCollapsed && 'LoanTracker'}
                    </div>
                </div>

                <nav className="px-3 py-2">
                    {menuItems.map((item) => (
                        <a
                            key={item.title}
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                                currentPath === item.path 
                                    ? "text-blue-600 dark:text-cyan-500" 
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <item.icon className={`h-5 w-5 transition-transform duration-200 ${
                                currentPath === item.path
                                    ? "text-blue-600 dark:text-cyan-500"
                                    : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                            }`} />
                            <span className={`whitespace-nowrap transition-all duration-300 ${
                                isCollapsed ? 'opacity-0 w-0 translate-x-4' : 'opacity-100 w-auto translate-x-0'
                            }`}>
                                {item.title}
                            </span>
                            {currentPath === item.path && !isCollapsed && (
                                <div className="absolute right-3 w-1 h-1 rounded-full bg-blue-600 dark:bg-cyan-500" />
                            )}
                        </a>
                    ))}
                </nav>
            </div>

            {isMobile && !isCollapsed && (
                <div 
                    className="fixed inset-0 bg-gray-400/20 dark:bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsCollapsed(true)}
                />
            )}
        </div>
    );
}
