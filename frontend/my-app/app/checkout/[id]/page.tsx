"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Checkout() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "", // novo campo
    cartaoNumero: "",
    cartaoValidade: "",
    cartaoCVV: "",
    parcelas: "1",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Buscar link
  useEffect(() => {
    if (!id) return;
    fetch(`/api/links?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLink(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage({ type: "error", text: "Erro ao buscar o link." });
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: id, ...formData }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Pagamento realizado com sucesso!" });
        
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao processar pagamento." });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Erro ao processar pagamento." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-20">Carregando...</p>;
  if (!link) return <p className="text-center mt-20">Link não encontrado</p>;

  const maxParcelas = link.maxParcelas ? parseInt(link.maxParcelas) : 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#06082E]">Pagamento</h1>
        <p className="text-[#06082E] mt-2">Confira os dados da venda e finalize o pagamento</p>
      </header>

      {/* Detalhes da venda */}
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full mb-8 text-[#06082E]">
        <h2 className="text-xl font-semibold text-[#06082E] mb-4">Detalhes da Venda</h2>
        <p><strong>Título:</strong> {link.titulo}</p>
        {link.descricao && <p><strong>Descrição:</strong> {link.descricao}</p>}
        <p><strong>Valor da Venda:</strong> R$ {link.resultado?.valorCliente?.toFixed(2) ?? "0.00"}</p>

        {link.recorrente === "Sim" && link.meses && (
          <p><strong>Venda Recorrente:</strong> {link.meses} {parseInt(link.meses) === 1 ? "Mês" : "Meses"}</p>
        )}
        {maxParcelas > 1 && <p><strong>Parcelamento:</strong> Até {maxParcelas}x</p>}
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full space-y-4">
        {message && (
          <div className={`p-3 rounded-md text-white ${message.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
            {message.text}
          </div>
        )}

        <h2 className="text-xl font-semibold text-[#06082E] mb-2">Dados Pessoais</h2>
        <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome completo" required className="w-full border rounded-lg px-1 py-2 text-black" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" required className="w-full border rounded-lg px-1 py-2 text-black" />
        <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="CPF" required className="w-full border rounded-lg px-1 py-2 text-black" />
        <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" required className="w-full border rounded-lg px-1 py-2 text-black" />

        <h2 className="text-xl font-semibold text-[#06082E] mt-4 mb-2">Endereço</h2>
        <input type="text" name="rua" value={formData.rua} onChange={handleChange} placeholder="Rua/Logradouro" required className="w-full border rounded-lg px-1 py-2 text-black" />
        <div className="flex gap-2">
          <input type="text" name="numero" value={formData.numero} onChange={handleChange} placeholder="Número" required className="flex-1 border rounded-lg px-1 py-2 text-black" />
          <input type="text" name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Complemento" className="flex-1 border px-1 rounded-lg py-2 text-black" />
        </div>
        <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} placeholder="Bairro" required className="w-full border rounded-lg px-1 py-2 text-black" />
        <div className="flex gap-2">
          <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" required className="flex-1 border rounded-lg px-1 py-2 text-black" />
          <input type="text" name="estado" value={formData.estado} onChange={handleChange} placeholder="Estado" required className="w-24 border rounded-lg px-1 py-2 text-black" />
        </div>
        <input type="text" name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" required className="w-full border rounded-lg px-1 py-2 text-black" />

        <h2 className="text-xl font-semibold text-[#06082E] mt-4 mb-2">Dados do Cartão</h2>
        <input type="text" name="cartaoNumero" value={formData.cartaoNumero} onChange={handleChange} placeholder="Número do Cartão" required className="w-full border rounded-lg px-1 py-2 text-black" />
        <div className="flex gap-2">
          <input type="text" name="cartaoValidade" value={formData.cartaoValidade} onChange={handleChange} placeholder="MM/AA" required className="flex-1 border rounded-lg px-1 py-2 text-black" />
          <input type="text" name="cartaoCVV" value={formData.cartaoCVV} onChange={handleChange} placeholder="CVV" required className="w-24 border rounded-lg px-1 py-2 text-black" />
        </div>

        {maxParcelas > 1 && (
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#06082E]">Parcelas</label>
            <select name="parcelas" value={formData.parcelas} onChange={handleChange} className="w-full border rounded-lg px-1 py-2 text-[#06082E]">
              {[...Array(maxParcelas)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}x de R$ {(link.resultado?.valorCliente / (i + 1)).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#06082E] text-white py-3 rounded-lg font-semibold hover:bg-[#1a1f60] transition disabled:opacity-50"
        >
          {submitting ? "Processando..." : "Finalizar Pagamento"}
        </button>
      </form>
    </div>
  );
}
