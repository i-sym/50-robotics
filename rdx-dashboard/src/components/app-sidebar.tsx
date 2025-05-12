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
import { Bot, FolderIcon, HomeIcon, SettingsIcon, Joystick, BrainCircuit, Bug, Wand } from "lucide-react"
import { Button } from "./ui/button"

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
    // controls
    {
        name: "Controls",
        url: "/controls",
        icon: Joystick,
    },
    {
        name: "AR Controls",
        url: "/arcontrols",
        icon: Wand,
    },

    {
        name: "AI Features",
        url: "/ai",
        icon: BrainCircuit,
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
                                        <a href={project.url} className="my-1">
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
            <SidebarFooter className="p-4 flex items-right justify-right w-full ">
                <hr />

                <Button variant="outline" className="flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                </Button>

            </SidebarFooter>
        </Sidebar>

    )
}
