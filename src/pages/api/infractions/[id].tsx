// ${process.env.API_URL}/infraction?auth=${process.env.API_AUTH}/server?=req.query.id
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
      return res.status(400).json({ message: "Infraction ID is required" });
    }
    const PermissionCheck = await fetch(`${process.env.API_URL}/permissions?auth=${process.env.API_AUTH}&server=${req.query.id}&user=${session.user.id}`);
    const PermissionCheckJson = await PermissionCheck.json();

    if (PermissionCheckJson.isAdmin !== true) {
        return res.status(PermissionCheck.status).json({ message: "Unauthorized" });
      }
      
    const infraction = await fetch(
      `${process.env.API_URL}/infractions?auth=${process.env.API_AUTH}&server=${req.query.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!infraction.ok) {
      return res.status(infraction.status).json({ message: "Failed to fetch infraction" });
    }

    const infractionData = await infraction.json();
    res.status(200).json(infractionData);

  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
