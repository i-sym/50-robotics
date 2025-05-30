import * as React from "react"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LiveKitStatus } from "@/components/livekit-status"
import { MQTTStatus } from "@/components/mqtt-status"
import Link from "next/link"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboards",
      url: "/dashboard",
      items: [
        {
          title: "Main Dashboard",
          url: "/dashboard/demo",
        },
        // {
        //   title: "Project Structure",
        //   url: "#",
        // },
      ],
    },
    {
      title: "Streaming",
      url: "/dashboard/camera-view",
      items: [
        {
          title: "Cameras",
          url: "/dashboard/camera-view",
        },

      ],
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <h1 className="px-2 py-4 font-mono font-bold">5.0 Robotics</h1>
        {/* indicators */}
        <div className="px-2 py-1 flex items-center gap-2">
          <MQTTStatus />
          <LiveKitStatus />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={false}>
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
