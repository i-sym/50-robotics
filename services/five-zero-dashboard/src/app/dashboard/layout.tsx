'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import {
    Home,
    LayoutDashboard,
    Settings,
    AlertCircle,
    Menu,
    X,
    Wifi,
    WifiOff,
    PanelLeft,
    Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mqttClient } from '@/lib/mqtt-client';

import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarFooter,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"


export function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMqttConnected, setIsMqttConnected] = useState(false);

    // Set mounted state and subscribe to MQTT connection events
    useEffect(() => {
        setIsMounted(true);

        const cleanup = mqttClient.onConnectionChange((connected) => {
            setIsMqttConnected(connected);
        });

        return cleanup;
    }, []);

    // Only render full UI on client-side to avoid hydration issues
    if (!isMounted) {
        return <div className="flex min-h-screen bg-background">{children}</div>;
    }

    // Navigation items
    // Navigation items
    const navItems = [
        {
            name: 'Home',
            href: '/',
            icon: Home,
        },
        {
            name: 'Main Dashboard',
            href: '/dashboard/demo',
            icon: LayoutDashboard,
        },
        {
            name: 'Machine Status',
            href: '/dashboard/machine-status',
            icon: AlertCircle,
        },
        {
            name: 'Cameras',
            href: '/cameras',
            icon: Video,
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
        },
    ];

    // Navigation item component
    const NavItem = ({ item }: { item: typeof navItems[0] }) => {
        const isActive = pathname === item.href;

        return (
            <Link
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
            >
                <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                        'w-full justify-start',
                        isActive ? 'bg-primary text-primary-foreground' : ''
                    )}
                >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                </Button>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-background w-full">
            {/* Mobile sidebar toggle */}
            <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b bg-background px-4 sm:gap-x-6 sm:px-6 lg:hidden">
                <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open sidebar</span>
                </Button>

                <div className="flex flex-1 justify-end">
                    {isMqttConnected ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <Wifi className="h-3 w-3 mr-1" />
                            Connected
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            <WifiOff className="h-3 w-3 mr-1" />
                            Disconnected
                        </Badge>
                    )}
                </div>
            </div>

            {/* Mobile sidebar */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="w-[240px] sm:w-[280px]">
                    <SheetHeader className="pb-6">
                        <SheetTitle className="flex items-center">
                            <PanelLeft className="h-5 w-5 mr-2" />
                            Five-Zero Platform
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavItem key={item.href} item={item} />
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                        <h1 className="text-xl font-semibold flex items-center">
                            <PanelLeft className="h-5 w-5 mr-2" />
                            Five-Zero Platform
                        </h1>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul className="flex flex-1 flex-col gap-y-2">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <NavItem item={item} />
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="mt-auto pb-4">
                        {isMqttConnected ? (
                            <Badge variant="outline" className="w-full py-2 bg-green-500/10 text-green-500 border-green-500/20">
                                <Wifi className="h-3 w-3 mr-2" />
                                Connected to MQTT
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="w-full py-2 bg-destructive/10 text-destructive border-destructive/20">
                                <WifiOff className="h-3 w-3 mr-2" />
                                Disconnected from MQTT
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                <main className="min-h-screen">{children}</main>
            </div>
        </div>
    );
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {




    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    {/* <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Building Your Application
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb> */}
                </header>
                {children}
            </SidebarInset>

        </SidebarProvider>
    )
}