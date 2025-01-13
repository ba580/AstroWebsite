import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.query.id) {
      return res.status(400).json({ message: "Guild ID is required" });
    }

    const Mutual = await fetch(
      `${process.env.API_URL}/mutual_servers?perm=admin`,
      {
        method: "POST",
        body: JSON.stringify({ user: session.user.id, guilds: [req.query.id] }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!Mutual.ok) {
      return res.status(Mutual.status).json({ message: "Failed to fetch mutual servers" });
    }

    const mutualData = await Mutual.json();
    const mutualGuilds = mutualData.mutual || []; 
    res.status(200).json({ mutualGuilds });

  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
