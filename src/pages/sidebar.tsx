import { Home, Puzzle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const bannerUrl = "/default.png";

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Modules",
    url: "#",
    icon: Puzzle,
    subItems: [
      { title: "Infractions", url: "#" },
      { title: "Promotions", url: "#" },
      { title: "Message Quota", url: "#" },
      { title: "Staff Panel", url: "#" },
      { title: "Modmail", url: "#" },
      { title: "QOTD", url: "#" },
      { title: "Ban Appeal", url: "#" },
      { title: "Welcome", url: "#" },
      { title: "Suggestions", url: "#" },
      { title: "Staff Feedback", url: "#" },
      { title: "Custom Commands", url: "#" },
      { title: "Forums", url: "#" },
      { title: "LOA", url: "#" },
      { title: "Suspensions", url: "#" },
    ],
  },
];

export default function AppSidebar({}: any) {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [mutualServers, setMutualServers] = useState<any[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSelectChange = (value: string) => {
    console.log("Selected server:", value);
    setSelectedServer(value);
    router.push(`/dashboard/${value}`);
  };

  const fetchMutualServers = async () => {
    try {
      const res = await fetch("/api/mutual");
      const data = await res.json();
      console.log("Fetched servers:", data);
      return data.mutual || [];
    } catch (error) {
      console.error("Error fetching mutual servers:", error);
      return [];
    }
  };
  useEffect(() => {
    const fetchAndPopulateServers = async () => {
      if (session) {
        const servers = await fetchMutualServers();
        setMutualServers(servers);
      }
    };
    fetchAndPopulateServers();
  }, [session]);
  const serverOptions = mutualServers.map((server) => (
    <SelectItem key={server.id} value={server.id}>
      <div className="flex items-center space-x-2">
        {server.icon ? (
          <img
            src={server.icon}
            alt={`${server.name} Icon`}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 bg-gray-400 rounded-full" />
        )}
        <span>{server.name}</span>
      </div>
    </SelectItem>
  ));

  return (
    <SidebarProvider>
      <Sidebar className="dark text-gray-200">
        <SidebarContent>
          <div className="relative">
            <div
              className="w-full h-40 bg-cover bg-center rounded-t-lg"
              style={{ backgroundImage: `url(${bannerUrl})` }}
            />
          </div>

          <SidebarGroup>
            <Select
              value={selectedServer || ""}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent className="dark">{serverOptions}</SelectContent>
            </Select>

            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>

                    {item.subItems && (
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <div className="mt-auto p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <img
                className="w-10 h-10 rounded-full"
                src={session?.user?.image || "/default.png"}
                alt="User Avatar"
              />
              <div>
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
