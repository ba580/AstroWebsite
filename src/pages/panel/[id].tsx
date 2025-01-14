'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function InfractionManager() {
  const [search, setSearch] = React.useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const [guild, setGuild] = useState<any | null>(null);
  const [infractions, setInfractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = router.query;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [guildRes, infractionsRes] = await Promise.all([
          fetch(`/api/guild/${id}`),
          fetch(`/api/infractions/${id}`),
        ]);

        if (!guildRes.ok) throw new Error(`Guild fetch failed: ${guildRes.status}`);
        if (!infractionsRes.ok) throw new Error(`Infractions fetch failed: ${infractionsRes.status}`);

        const guildData = await guildRes.json();
        const infractionsData = await infractionsRes.json();

        setGuild(guildData.mutualGuilds[0]);
        setInfractions(infractionsData);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAllData();
    }
  }, [id, status, router]);

  const filteredInfractions = infractions.filter((infraction: any) => {
    if (!search) return true;
    return ['id', 'user.id', 'reason']
      .map((key) => key.split('.').reduce((acc, curr) => acc?.[curr], infraction))
      .some((field) => field && field.toString().toLowerCase().includes(search.toLowerCase()));
  });

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-sans">
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {`Error: ${error}`}
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Case ID / User ID / Reason"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="">Author</TableHead>
                <TableHead className="">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInfractions.map((infraction: any) => (
                <TableRow
                  key={infraction.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/panel/infraction/${id}/${infraction.id}`)}
                >
                  <TableCell className="font-mono">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={infraction.status === 'active' ? 'destructive' : 'secondary'}
                        className="h-2 w-2 rounded-full p-0"
                      />
                      {infraction.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={infraction.user.avatar} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <span className="font-mono text-sm">{infraction.user.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="break-words whitespace-normal">{infraction.action.details}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={infraction.author.avatar} />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm">{infraction.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {infraction.author.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                    <span  className="text-xs text-muted-foreground">{new Date(infraction.created).toLocaleString()}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
