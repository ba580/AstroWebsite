"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ServerCard from "@/components/server-card";
import { useRouter } from "next/router";
import Header from "@/components/header";
import { NoServersFound } from "@/components/no-servers";

export default function Servers() {
  const { data: session, status } = useSession();
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }

    const fetchServers = async () => {
      try {
        const res = await fetch("/api/mutual");
        const data = await res.json();
        setServers(data.mutual || []);
      } catch (error) {
        console.error("Error fetching servers:", error);
        setError("There was an issue fetching the servers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, [status, router]);

  if (loading) {
    return (
      <main className="overflow-auto flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-sans">
        <Header />
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
<main className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-sans">
  <Header />
  <div className="flex-grow flex items-center justify-center sm:px-8 md:px-16 lg:px-32 xl:px-72 py-24">
    {servers.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 w-full">
        {servers.map((server: any) => (
          <ServerCard
            key={server.id}
            name={server.name}
            iconUrl={server.icon}
            role="Admin"
            id={server.id.toString()}
          />
        ))}
      </div>
    ) : (
      <NoServersFound />
    )}
  </div>
</main>




  );
}
