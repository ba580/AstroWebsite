import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import  AppSidebar  from "../sidebar";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [guild, setGuild] = useState<any | null>(null);
  const { id } = router.query;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    const fetchGuild = async () => {
      try {
        const res = await fetch(`/api/guild/${id}`);
        const data = await res.json();
        setGuild(data.mutualGuilds[0]);
      } catch (error) {
        console.error("Error fetching guild:", error);
      }
    };
    if (id) {
      fetchGuild();
    }
  }, [id, status, router]);

  if (!guild) {
    return (
        <main className="overflow-auto flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-sans">
        <div className="flex items-center justify-center h-screen">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            className="animate-spin text-indigo-500"
          >
            <path
              fill="none"
              stroke="#fff"
              strokeDasharray="16"
              strokeDashoffset="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 3c4.97 0 9 4.03 9 9"
            >
              <animate
                fill="freeze"
                attributeName="stroke-dashoffset"
                dur="0.2s"
                values="16;0"
              />
              <animateTransform
                attributeName="transform"
                dur="1.5s"
                repeatCount="indefinite"
                type="rotate"
                values="0 12 12;360 12 12"
              />
            </path>
          </svg>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-sans">
      <div className="flex">
        <SidebarProvider>
          <AppSidebar GuildName={guild.name} GuildIcon={guild.icon}/>
        </SidebarProvider>
      </div>
    </div>
  );
}
