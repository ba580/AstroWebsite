import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { createClient } from "redis";
import { IncomingMessage, ServerResponse } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { DiscordProfile } from "next-auth/providers/discord";
import { OAuthConfig } from "next-auth/providers/oauth";
import { NextApiRequestCookies } from "next/dist/server/api-utils";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

await redisClient.connect();



export default async function handler(req: NextApiRequest & IncomingMessage & { cookies: NextApiRequestCookies; }, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const cacheKey = `discord:servers_and_mutuals:${session.user.id}`;
  let data;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      data = JSON.parse(cachedData);
    } else {
      const guildsResponse = await fetch(`https://discord.com/api/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const guilds = await guildsResponse.json();

      const mutualGuilds = await fetch(`${process.env.API_URL}/mutual_servers?perm=staff`, {
        method: "POST",
        body: JSON.stringify({
          user: session.user.id,
          guilds: guilds.map((guild: { id: string; }) => guild.id),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const mutualGuildsJson = await mutualGuilds.json();
      
      data = { guilds, mutualGuilds };
      await redisClient.set(cacheKey, JSON.stringify(data), {
        EX: 1200,
      });
    }

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  res.status(200).json(data.mutualGuildsJson);
}
