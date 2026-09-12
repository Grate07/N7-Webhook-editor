import { Router, type IRouter } from "express";
import { SendWebhookBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/webhook/status", (_req, res) => {
  res.json({ configured: Boolean(process.env.DISCORD_WEBHOOK_URL) });
});

router.post("/webhook/send", async (req, res) => {
  const parsed = SendWebhookBody.safeParse(req.body);

  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid webhook payload");
    return res.status(400).json({ error: "The embed payload is invalid." });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return res
      .status(503)
      .json({ error: "The Discord webhook is not configured." });
  }

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!discordResponse.ok) {
      const responseBody = await discordResponse.text();
      req.log.error(
        {
          status: discordResponse.status,
          response: responseBody.slice(0, 500),
        },
        "Discord rejected the webhook payload",
      );
      return res
        .status(502)
        .json({ error: "Discord rejected the webhook payload." });
    }

    return res.status(204).send();
  } catch (error) {
    req.log.error({ err: error }, "Discord webhook request failed");
    return res.status(502).json({ error: "Could not reach Discord." });
  }
});

export default router;