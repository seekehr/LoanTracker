import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FilePlus, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AppSidebar() {
    const navigate = useNavigate();
    const currentPath = window.location.pathname;

    const menuItems = [
        { title: "Create Loan", icon: FilePlus, path: "/create-loan" },
        { title: "Manage Loans", icon: FileText, path: "/manage-loans" },
        { title: "Settings", icon: Settings, path: "/profile" },
    ];

    return (
        <Sidebar variant="inset" className="mt-16">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>LoanTracker</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={currentPath === item.path}
                                        tooltip={item.title}
                                    >
                                        <a href={item.path}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
