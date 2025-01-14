// 
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log(req.body)
    console.log(req.query)
    console.log(session.user.id)


    if (!req.query.id || !req.query.singleid || !req.body) {
      return res.status(400).json({ message: "Infraction ID, Single ID, and body are required" });
    }

    const PermissionCheck = await fetch(`${process.env.API_URL}/permissions?auth=${process.env.API_AUTH}&server=${req.query.id}&user=${session.user.id}`);
    const PermissionCheckJson = await PermissionCheck.json();

    if (PermissionCheckJson.isAdmin !== true) {
        return res.status(PermissionCheck.status).json({ message: "Unauthorized" });
      }

    const infraction = await fetch(
      `${process.env.API_URL}/UpdateInfraction?auth=${process.env.API_AUTH}&server=${req.query.id}&id=${req.query.singleid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    if (!infraction.ok) {
      return res.status(infraction.status).json({ message: "Failed to update infraction" });
    }

    const infractionData = await infraction.json();
    res.status(200).json(infractionData);

  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
