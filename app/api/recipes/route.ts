import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  await initDb();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (q) {
    const rows = await db.execute({
      sql: `SELECT * FROM recipes WHERE title LIKE ? OR tags LIKE ? OR description LIKE ? ORDER BY created_at DESC`,
      args: [`%${q}%`, `%${q}%`, `%${q}%`],
    });
    return NextResponse.json(rows.rows);
  }

  const rows = await db.execute(`SELECT * FROM recipes ORDER BY created_at DESC`);
  return NextResponse.json(rows.rows);
}

export async function POST(req: NextRequest) {
  await initDb();
  const body = await req.json();
  const {
    title, description, ingredients, instructions,
    prepTime, cookTime, servings, tags, sourceUrl, toddlerNotes, imageUrl
  } = body;

  const result = await db.execute({
    sql: `INSERT INTO recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, tags, source_url, toddler_notes, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      title,
      description || "",
      JSON.stringify(ingredients),
      JSON.stringify(instructions),
      prepTime || null,
      cookTime || null,
      servings || 4,
      JSON.stringify(tags || []),
      sourceUrl || null,
      toddlerNotes || null,
      imageUrl || null,
    ],
  });

  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function DELETE(req: NextRequest) {
  await initDb();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await db.execute({ sql: `DELETE FROM recipes WHERE id = ?`, args: [id] });
  return NextResponse.json({ success: true });
}
