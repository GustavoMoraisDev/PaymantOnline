// app/api/pagamento/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "links.json");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const linkId = formData.linkId;

    const dbRaw = fs.readFileSync(filePath, "utf-8");
    const db = JSON.parse(dbRaw);

    const link = db.find((l: any) => l.id === linkId);
    if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

    const phoebusPayload = {
      payment: {
        value: Math.round((link.resultado.valorCliente ?? 0) * 100),
        currency_code: "986",
        merchant_payment_id: link.id,
        payment_method: "CARD",
        instalments: parseInt(formData.parcelas || "1"),
        auto_capture: true,
        payment_date: new Date().toISOString().split("T")[0],
        installment_type: "INTEREST",
        product: link.formaPagamento === "Crédito" ? "CREDIT" : "DEBIT",
      },
      customer: {
        business_customer: false,
        national_document: formData.cpf,
        first_name: formData.nome.split(" ")[0] || formData.nome,
        last_name: formData.nome.split(" ").slice(1).join(" ") || "",
        email: formData.email,
        phone_number1: formData.telefone, 
        address: {
          street: formData.rua,
          street_number: formData.numero,
          complements: formData.complemento,
          neighbourhood: formData.bairro,
          zip_code: formData.cep,
          city: formData.cidade,
          state: formData.estado,
          territory_code: "BR",
        },
      },
      customer_device: {
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
        browser_user_agent: req.headers.get("user-agent") || "",
        browser_accept: req.headers.get("accept") || "",
        color_depth: "24",
        java_enable: true,
        browser_language: req.headers.get("accept-language") || "pt-BR",
        screen_height: "1080",
        screen_width: "1920",
        time_zone_offset: "0",
      },
      card_info: {
        number: formData.cartaoNumero,
        holder_name: formData.nome,
        due_date: formData.cartaoValidade,
        cvv: formData.cartaoCVV,
        generate_token: true,
        card_holder_national_document: formData.cpf,
        billing_address: {
          street: formData.rua,
          street_number: formData.numero,
          complements: formData.complemento,
          neighbourhood: formData.bairro,
          zip_code: formData.cep,
          city: formData.cidade,
          state: formData.estado,
          territory_code: "BR",
        },
      },
      order: {
        order_number: link.id,
        order_date: new Date().toISOString(),
        
        items: [
          {
            sku: "1",
            name: link.titulo,
            unit_price: Math.round((link.resultado.valorCliente ?? 0) * 100),
            quantity: 1,
            category: "Venda",
          },
        ],
      },
      three_ds_info_request: { enabled: true },
      type: "DIRECT",
      soft_descriptor: link.titulo.slice(0, 25),
    };

    const phoebusUrl = "https://backenddevpaystore.phoebus.com.br/ecommerce/v1/payment";

    const phoebusRes = await fetch(phoebusUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer `,
      },
      body: JSON.stringify(phoebusPayload),
    });

    const phoebusData = await phoebusRes.json();

    const safeCardInfo = {
      last4: formData.cartaoNumero.slice(-4),
      brand: phoebusData?.card?.brand ?? null,
      token: phoebusData?.card_token?.token ?? null,
    };

    const compradorSafe = {
      nome: formData.nome,
      email: formData.email,
      cpf: formData.cpf,
      telefone: formData.telefone, 
      rua: formData.rua,
      numero: formData.numero,
      complemento: formData.complemento,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
      cep: formData.cep,
      parcelas: formData.parcelas,
      card: safeCardInfo,
      pagoEm: new Date().toISOString(),
    };

    const updatedDb = db.map((l: any) => {
      if (l.id !== linkId) return l;
      return {
        ...l,
        comprador: compradorSafe,
        phoebusResponse: phoebusData,
        status: phoebusData?.payment?.status ?? "unknown",
      };
    });

    fs.writeFileSync(filePath, JSON.stringify(updatedDb, null, 2));

    return NextResponse.json({ success: true, data: phoebusData });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
