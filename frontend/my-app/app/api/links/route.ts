import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const filePath = path.join(process.cwd(), "links.json");

    const fileData = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : [];

    const id = uuidv4();
    const novoLink = {
      id,
      link: `http://localhost:3000/checkout/${id}`, 
      ...data,
    };

    fileData.push(novoLink);
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Erro ao salvar o link:", error);
    return NextResponse.json({ error: "Não foi possível salvar o link" }, { status: 500 });
  }
}

// GET /api/links?id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID não informado" }, { status: 400 });

    const filePath = path.join(process.cwd(), "links.json");
    const links = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : [];

    const dados = links.find((l: any) => l.id === id);
    if (!dados) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

    return NextResponse.json(dados);
  } catch (error) {
    console.error("Erro ao ler link:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
