// Delete is DELETE $process.env.API.URL/infraction?auth=${process.env.API_AUTH}/server?=req.query.id&id={singleid}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.query.id || !req.query.singleid) {
      return res.status(400).json({ message: "Infraction ID and Single ID are required" });
    }
    const PermissionCheck = await fetch(`${process.env.API_URL}/permissions?auth=${process.env.API_AUTH}&server=${req.query.id}&user=${session.user.id}`);
    const PermissionCheckJson = await PermissionCheck.json();

    if (PermissionCheckJson.isAdmin !== true) {
        return res.status(PermissionCheck.status).json({ message: "Unauthorized" });
      }
      

    const infraction = await fetch(
      `${process.env.API_URL}/delinfraction?auth=${process.env.API_AUTH}&server=${req.query.id}&id=${req.query.singleid}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!infraction.ok) {
      return res.status(infraction.status).json({ message: "Failed to delete infraction" });
    }

    res.status(200).json({ message: "Infraction deleted successfully" });

  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
