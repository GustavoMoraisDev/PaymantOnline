"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CriarPagamentos() {
  const router = useRouter();

  const taxas = {
    Debito: { taxa: 1.5 },
    Pix: { taxa: 0.5 },
    Credito: {
      recorrente: { taxa: 3.0 },
      parcelado: {
        1: 3.5, 2: 4.0, 3: 4.5, 4: 5.0, 5: 5.5, 6: 6.0,
        7: 6.5, 8: 7.0, 9: 7.5, 10: 8.0, 11: 8.5, 12: 9.0,
        13: 9.5, 14: 10.0, 15: 10.5, 16: 11.0, 17: 11.5,
        18: 12.0, 19: 12.5, 20: 13.0, 21: 13.5,
      },
    },
  };

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    valor: "",
    formaPagamento: "",
    recorrente: "",
    meses: "",
    maxParcelas: "",
  });

  const [repassar, setRepassar] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, repassar, resultado }),
      });

      const data = await res.json();

      if (res.ok && data.id) {
        router.push(`/Link-gerado/${data.id}`);
      } else {
        console.error("Erro ao criar link:", data.error);
        alert("Não foi possível criar o link. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao criar link:", error);
      alert("Ocorreu um erro ao criar o link.");
    }
  };

  
  const podeRepassar =
    formData.valor &&
    formData.formaPagamento &&
    (
      formData.formaPagamento === "Débito" ||
      formData.formaPagamento === "Pix" ||
      (
        formData.formaPagamento === "Crédito" &&
        (
          (formData.recorrente === "Sim" && formData.meses) ||
          (formData.recorrente === "Não" && formData.maxParcelas)
        )
      )
    );

  
  const calcularValores = () => {
    const valor = parseFloat(formData.valor);
    if (!valor || !formData.formaPagamento) return null;

    let taxa = 0;

    if (formData.formaPagamento === "Débito") {
      taxa = taxas.Debito.taxa;
    } else if (formData.formaPagamento === "Pix") {
      taxa = taxas.Pix.taxa;
    } else if (formData.formaPagamento === "Crédito") {
      if (formData.recorrente === "Sim" && formData.meses) {
        taxa = taxas.Credito.recorrente.taxa;
      } else if (formData.recorrente === "Não" && formData.maxParcelas) {
        taxa = taxas.Credito.parcelado[parseInt(formData.maxParcelas) as keyof typeof taxas.Credito.parcelado];
      }
    }

    if (!taxa) return null;

    let valorLiquido = 0;
    let valorCliente = 0;

    if (repassar) {
      valorLiquido = valor;
      valorCliente = valor / (1 - taxa / 100);
    } else {
      valorLiquido = valor * (1 - taxa / 100);
      valorCliente = valor;
    }

    const valorTaxa = valorCliente - valorLiquido;

    return { taxa, valorTaxa, valorLiquido, valorCliente };
  };

  const resultado = calcularValores();

  return (
    <div className="min-h-screen bg-amber-50 p-8 flex flex-col items-center justify-start">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#06082E]">Link de Pagamento</h1>
        <p className="text-[#06082E] mt-2">Preencha todos os campos</p>
      </header>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#06082E]">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 text-black"
            />
          </div>

          
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#06082E]">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 text-black"
            />
          </div>

          
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#06082E]">
              Valor (R$) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="valor"
              step="0.01" 
              min="0"
              value={formData.valor}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 text-black"
            />
          </div>

          
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#06082E]">
              Forma de Pagamento <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 text-[#06082E]">
              {["Débito", "Crédito", "Pix"].map((opcao) => (
                <label key={opcao} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="formaPagamento"
                    value={opcao}
                    checked={formData.formaPagamento === opcao}
                    onChange={handleChange}
                    required
                    className="text-black"
                  />
                  {opcao}
                </label>
              ))}
            </div>
          </div>

          
          {formData.formaPagamento === "Crédito" && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#06082E]">
                  Venda Recorrente?
                </label>
                <div className="flex gap-4 text-[#06082E]">
                  {["Sim", "Não"].map((opcao) => (
                    <label key={opcao} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="recorrente"
                        value={opcao}
                        checked={formData.recorrente === opcao}
                        onChange={handleChange}
                        required
                        className="text-black"
                      />
                      {opcao}
                    </label>
                  ))}
                </div>
              </div>

              {formData.recorrente === "Sim" && (
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#06082E]">
                    Quantos Meses?
                  </label>
                  <input
                    type="number"
                    name="meses"
                    min="1"
                    value={formData.meses}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 text-black"
                    required
                  />
                </div>
              )}

              {formData.recorrente === "Não" && (
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#06082E]">
                    Máximo de Parcelas
                  </label>
                  <select
                    name="maxParcelas"
                    value={formData.maxParcelas}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2 text-[#06082E]"
                  >
                    <option value="">Selecione</option>
                    {[...Array(21)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Até {i + 1}x
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          
          {podeRepassar && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="repassar"
                checked={repassar}
                onChange={() => setRepassar(!repassar)}
              />
              <label htmlFor="repassar" className="text-[#06082E]">
                Repassar Juros ao Cliente
              </label>
            </div>
          )}

          
          {resultado && (
            <div className="mt-4 p-4 bg-[#06082E] rounded-lg">
              <p >
                Valor do Link: R$ {resultado.valorCliente.toFixed(2)}
              </p>
              <p>Taxa: {resultado.taxa}%</p>
              <p>Você Recebe: R$ {resultado.valorLiquido.toFixed(2)}</p>
              
            </div>
          )}

          
          <button
            type="submit"
            className="w-full bg-[#06082E] text-white py-3 rounded-lg font-semibold hover:bg-[#1a1f60] transition"
          >
            Gerar Link
          </button>
        </form>
      </div>
    </div>
  );
}
