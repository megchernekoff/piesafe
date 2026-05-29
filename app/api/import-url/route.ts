import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db, initDb } from "@/lib/db";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  await initDb();
  const { url } = await req.json();

  // Fetch the page
  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; recipe-importer/1.0)" },
    });
    html = await res.text();
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 });
  }

  // Strip heavy HTML down to text-ish content for Claude
  const stripped = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{3,}/g, "\n")
    .slice(0, 12000);

  const prompt = `Extract the recipe from this webpage content. Respond ONLY with valid JSON, no markdown fences:

{
  "title": "...",
  "description": "...",
  "ingredients": ["..."],
  "instructions": ["..."],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "tags": ["..."],
  "toddlerNotes": "Brief note on how to adapt this for a toddler (18-24 months), e.g. texture, salt reduction, finger food options. If not applicable write null.",
  "imageUrl": null
}

If you cannot find a recipe in this content, return: {"error": "No recipe found"}

Webpage content:
${stripped}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const clean = text.replace(/```json|```/g, "").trim();

  let recipe;
  try {
    recipe = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: "Failed to parse recipe" }, { status: 500 });
  }

  if (recipe.error) {
    return NextResponse.json({ error: recipe.error }, { status: 400 });
  }

  // Save to recipes DB
  const result = await db.execute({
    sql: `INSERT INTO recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, tags, source_url, toddler_notes, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      recipe.title,
      recipe.description || "",
      JSON.stringify(recipe.ingredients),
      JSON.stringify(recipe.instructions),
      recipe.prepTime || null,
      recipe.cookTime || null,
      recipe.servings || 4,
      JSON.stringify(recipe.tags || []),
      url,
      recipe.toddlerNotes || null,
      recipe.imageUrl || null,
    ],
  });

  return NextResponse.json({ id: result.lastInsertRowid, ...recipe, sourceUrl: url });
}
