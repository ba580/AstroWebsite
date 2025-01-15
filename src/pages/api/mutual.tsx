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

const fetchWithRetry = async (url: any, options = {}, retries = 3, delay = 1000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const delayTime = retryAfter ? parseInt(retryAfter, 10) * 1 : delay;
          console.warn(`Rate limited. Retrying in ${delayTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayTime));
          attempt++;
          continue;
        }
        const errorMessage = await response.text();
        console.error(`HTTP error! status: ${response.status} - ${errorMessage}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      console.warn(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

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
      const guilds = await fetchWithRetry(`https://discord.com/api/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      const mutualGuilds = await fetchWithRetry(`${process.env.API_URL}/mutual_servers?auth=${process.env.API_AUTH}&perm=staff`, {
        method: "POST",
        body: JSON.stringify({
          user: session.user.id,
          guilds: guilds.map((guild: { id: any; }) => guild.id),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      data = { guilds, mutualGuilds };
      await redisClient.set(cacheKey, JSON.stringify(data), {
        EX: 1200,
      });
    }

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  res.status(200).json(data.mutualGuilds);
}
