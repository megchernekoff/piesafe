import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db, initDb } from "@/lib/db";
import { RECIPE_EMAIL_SENDERS, EMAIL_RECIPE_KEYWORDS } from "@/lib/prefs";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  await initDb();

  const prompt = `Search my Gmail inbox for recipe-related emails. 

Look for emails from these known recipe senders: ${RECIPE_EMAIL_SENDERS.join(", ")}
Also look for any emails containing these keywords in subject: ${EMAIL_RECIPE_KEYWORDS.join(", ")}

Search the last 60 days. For each email found:
1. Get the sender, subject, and date
2. Extract any recipe URLs (links to recipes on websites)
3. Note a brief snippet about what recipe(s) are mentioned

Return a JSON array like:
[
  {
    "sender": "newsletter@bonappetit.com",
    "subject": "3 weeknight dinners you'll love",
    "emailDate": "2026-05-20",
    "recipeLinks": ["https://...", "https://..."],
    "snippet": "Features a crispy chicken thighs recipe and a pasta dish"
  }
]

If no recipe emails found, return an empty array [].
Return ONLY the JSON, no markdown.`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client.messages.create as any)({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
      mcp_servers: [
        {
          type: "url",
          url: "https://gmailmcp.googleapis.com/mcp/v1",
          name: "gmail-mcp",
        },
      ],
    });

    // Extract text from response (could be after tool use blocks)
    const content = response.content as Array<{ type: string; text?: string }>;
    const textBlock = content.find((b) => b.type === "text");
    const text = textBlock?.text ?? "[]";
    const clean = text.replace(/```json|```/g, "").trim();

    let emails: Array<{
      sender: string;
      subject: string;
      emailDate: string;
      recipeLinks: string[];
      snippet: string;
    }> = [];

    try {
      emails = JSON.parse(clean);
    } catch {
      // If parse fails, return empty
      emails = [];
    }

    // Save new ones to DB (dedupe by subject+sender)
    let saved = 0;
    for (const email of emails) {
      const existing = await db.execute({
        sql: `SELECT id FROM email_recipes WHERE sender = ? AND subject = ?`,
        args: [email.sender, email.subject],
      });
      if (!existing.rows.length) {
        await db.execute({
          sql: `INSERT INTO email_recipes (sender, subject, recipe_links, raw_snippet, email_date) VALUES (?, ?, ?, ?, ?)`,
          args: [
            email.sender,
            email.subject,
            JSON.stringify(email.recipeLinks || []),
            email.snippet || "",
            email.emailDate || null,
          ],
        });
        saved++;
      }
    }

    // Return all from DB
    const all = await db.execute(
      `SELECT * FROM email_recipes ORDER BY email_date DESC, scanned_at DESC LIMIT 100`
    );

    return NextResponse.json({ scanned: emails.length, newlySaved: saved, emails: all.rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message, emails: [] }, { status: 500 });
  }
}

export async function GET() {
  await initDb();
  const all = await db.execute(
    `SELECT * FROM email_recipes ORDER BY email_date DESC, scanned_at DESC LIMIT 100`
  );
  return NextResponse.json({ emails: all.rows });
}
