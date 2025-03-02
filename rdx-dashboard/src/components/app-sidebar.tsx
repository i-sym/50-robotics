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
} from "@/components/ui/sidebar"
import { Bot, FolderIcon, HomeIcon, SettingsIcon } from "lucide-react"

const projects = [
    {
        name: "Dashboard",
        url: "/",
        icon: HomeIcon,
    },
    {
        name: "Data",
        url: "/logodata",
        icon: FolderIcon,
    },
    {
        name: "Settings",
        url: "/settings",
        icon: SettingsIcon,
    },
]

export function AppSidebar() {
    return (
        <Sidebar className="">
            <SidebarHeader className="border-b p-4">
                <div className="flex items-center gap-2">
                    <Bot />
                    <span className="font-semibold">RDX Dashboard</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Projects</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects.map((project) => (
                                <SidebarMenuItem key={project.name}>
                                    <SidebarMenuButton asChild>
                                        <a href={project.url}>
                                            <project.icon />
                                            <span>{project.name}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>

    )
}
