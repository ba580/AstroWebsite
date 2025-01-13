// Resets redis guild cache
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { createClient } from "redis";
import { NextApiRequest, NextApiResponse } from "next";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

await redisClient.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const keys = await redisClient.keys(`discord:servers_and_mutuals:${session.user.id}`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Redis cache cleared successfully.");
      res.status(200).json({ message: "Redis cache cleared successfully." });
    } else {
      console.log("No keys found in Redis cache.");
      res.status(200).json({ message: "No keys found in Redis cache." });
    }
  } catch (error) {
    console.error("Error clearing Redis cache:", error);
    res.status(500).json({ message: "Error clearing Redis cache." });
  }
}
