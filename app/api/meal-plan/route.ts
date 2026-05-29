import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db, initDb } from "@/lib/db";
import { USER_PREFS } from "@/lib/prefs";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  await initDb();
  const { weekStart, tweaks, savedRecipeIds } = await req.json();

  // Optionally pull saved recipes for context
  let savedRecipesContext = "";
  if (savedRecipeIds?.length) {
    const placeholders = savedRecipeIds.map(() => "?").join(",");
    const rows = await db.execute({
      sql: `SELECT title, ingredients, instructions, toddler_notes FROM recipes WHERE id IN (${placeholders})`,
      args: savedRecipeIds,
    });
    if (rows.rows.length) {
      savedRecipesContext = `\n\nThe user has requested these saved recipes be included:\n${rows.rows
        .map((r) => `- ${r.title}`)
        .join("\n")}`;
    }
  }

  const prompt = `You are a meal planning assistant for a family in San Francisco.

User preferences:
- Dislikes (NEVER include): ${USER_PREFS.dislikes.join(", ")}
- Household: 2 adults + ${USER_PREFS.toddlerName} (${USER_PREFS.toddlerAge})
- Notes: ${USER_PREFS.notes}
${tweaks ? `\nSpecific requests for this week: ${tweaks}` : ""}
${savedRecipesContext}

Generate a full week meal plan (Monday–Sunday) with dinner for each night (optionally lunch 2-3 days).

Respond ONLY with valid JSON in this exact structure:
{
  "weekStart": "${weekStart}",
  "days": [
    {
      "day": "Monday",
      "dinner": {
        "title": "...",
        "description": "...",
        "ingredients": ["..."],
        "instructions": ["..."],
        "prepTime": 15,
        "cookTime": 30,
        "servings": 4,
        "toddlerAdaptation": "...",
        "tags": ["quick", "mediterranean"]
      },
      "lunch": null
    }
  ],
  "groceryList": {
    "produce": ["..."],
    "protein": ["..."],
    "dairy": ["..."],
    "pantry": ["..."],
    "other": ["..."]
  },
  "prepNotes": [
    "Sunday: Make the marinade for Tuesday's chicken...",
    "..."
  ]
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text.replace(/```json|```/g, "").trim();
  
  let planData;
  try {
    planData = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: "Failed to parse plan", raw: text }, { status: 500 });
  }

  // Save to DB
  const result = await db.execute({
    sql: `INSERT INTO meal_plans (week_start, plan_data, grocery_list, prep_notes) VALUES (?, ?, ?, ?)`,
    args: [
      weekStart,
      JSON.stringify(planData.days),
      JSON.stringify(planData.groceryList),
      JSON.stringify(planData.prepNotes),
    ],
  });

  return NextResponse.json({ id: result.lastInsertRowid, ...planData });
}

export async function GET() {
  await initDb();
  const rows = await db.execute(`SELECT * FROM meal_plans ORDER BY created_at DESC LIMIT 20`);
  return NextResponse.json(rows.rows);
}
