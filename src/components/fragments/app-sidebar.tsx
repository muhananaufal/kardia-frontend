import React from "react";
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Activity,
    BadgeCheck,
    BarChart3,
    Bell,
    ChevronRight,
    Heart,
    HelpCircle,
    History,
    Home,
    LogOut,
    MessageSquare,
    Settings,
    Stethoscope,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

const mainNavItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart3,
    },
    {
        title: "Analisis Baru",
        url: "/dashboard/analysis",
        icon: Activity,
    },
    {
        title: "Riwayat",
        url: "/dashboard/history",
        icon: History,
    },
    {
        title: "Chat AI",
        url: "/dashboard/ai-chat",
        icon: MessageSquare,
    },
];

const bottomNavItems = [
    {
        title: "Landing Page",
        url: "/",
        icon: Home,
    },
    {
        title: "Profile",
        url: "/dashboard/profile",
        icon: Settings,
    }
    // {
    //     title: "Help Center",
    //     url: "/dashboard/help",
    //     icon: HelpCircle,
    // },
];

export function AppSidebar({ user, handleLogout }: AppSidebarProps) {
    const location = useLocation();
    const { isMobile } = useSidebar();

    return (
        <Sidebar className="border-r border-slate-200/60" collapsible="offcanvas">
            <SidebarHeader className="p-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500 text-white shadow-lg">
                        <Heart className="h-6 w-6" />
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <h1 className="text-xl font-bold text-rose-500">
                            Kardia
                        </h1>
                        <p className="text-xs text-slate-500">
                            Deteksi Dini, Jaga Jantung Setiap Hari
                        </p>
                    </div>
                </motion.div>
            </SidebarHeader>

            <SidebarContent className="px-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-slate-600 font-medium mb-2 group-data-[collapsible=icon]:hidden">
                        Main Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item, index) => (
                                <SidebarMenuItem key={item.title}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: index * 0.1,
                                        }}
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            isActive={
                                                location.pathname === item.url
                                            }
                                            tooltip={item.title}
                                            className="group relative overflow-hidden rounded-md transition-all duration-200 hover:bg-rose-50 data-[active=true]:bg-rose-100 data-[active=true]:text-rose-700"
                                        >
                                            <Link
                                                to={item.url}
                                                className="flex items-center gap-3 w-full"
                                            >
                                                <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                                                <span className="font-medium">
                                                    {item.title}
                                                </span>
                                                {location.pathname ===
                                                    item.url && (
                                                    <motion.div
                                                        layoutId="activeIndicator"
                                                        className="absolute right-2 h-2 w-2 rounded-full bg-rose-500 group-data-[collapsible=icon]:hidden"
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 300,
                                                            damping: 30,
                                                        }}
                                                    />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </motion.div>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* <SidebarSeparator className="my-6 bg-slate-200/60" /> */}

                <SidebarGroup>
                    <SidebarGroupLabel className="text-slate-600 font-medium mb-2 group-data-[collapsible=icon]:hidden">
                        Quick Access
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {bottomNavItems.map((item, index) => (
                                <SidebarMenuItem key={item.title}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: (index + 5) * 0.1,
                                        }}
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            isActive={
                                                location.pathname === item.url
                                            }
                                            tooltip={item.title}
                                            className="group rounded-xl transition-all duration-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-800"
                                        >
                                            <Link
                                                to={item.url}
                                                className="flex items-center gap-3 w-full"
                                            >
                                                <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </motion.div>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/60 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
                >
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">
                                                {user.first_name} {user.last_name}
                                            </span>
                                            <span className="truncate text-xs">
                                                {user.email}
                                            </span>
                                        </div>
                                        <ChevronRight className="ml-auto size-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                    side={isMobile ? "bottom" : "right"}
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-medium">
                                                    {user.first_name} {user.last_name}
                                                </span>
                                                <span className="truncate text-xs">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem>
                                            <BadgeCheck />
                                            <Link to="/dashboard/profile">
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Bell />
                                            Notifications
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <LogOut />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left"
                                        >
                                            Logout
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </motion.div>
            </SidebarFooter>
        </Sidebar>
    );
}
