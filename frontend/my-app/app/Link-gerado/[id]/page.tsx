"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function LinkGerado() {
  const params = useParams();
  const id = params.id;
  const [link, setLink] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Buscar link na API
  useEffect(() => {
    if (!id) return;

    fetch(`/api/links?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find((item: any) => item.id === id);
          setLink(found || null);
        } else {
          setLink(data);
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!link) return <p className="text-center mt-20">Carregando ou link não encontrado...</p>;

  const linkURL = link.link;

  const handleCopy = () => {
    navigator.clipboard.writeText(linkURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleWhatsApp = () => {
    const message = `Link de Pagamento: ${linkURL}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

 
  const handleEmail = () => {
    const subject = "Link de Pagamento";
    const body = `Olá!\n\nSegue o link para pagamento:\n${linkURL}\n\nTítulo: ${link.titulo}\nValor: R$ ${link.resultado.valorCliente.toFixed(2)}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-8">

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#06082E]">Link de Pagamento</h1>
        <p className="text-[#06082E] mt-2">O link já está pronto para ser enviado ao seu cliente!</p>
      </header>



      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">

        <div className="mb-4 text-[#06082E]">
  <p><strong>Título:</strong> {link.titulo}</p>
  <p><strong>Valor da Venda:</strong> R$ {link.resultado.valorCliente.toFixed(2)}</p>
  <p><strong>Taxa:</strong>{link.resultado.taxa}%</p>
  <p><strong>Valor Liquído :</strong> R$ {link.resultado.valorLiquido.toFixed(2)}</p>
  
  

  {link.recorrente === "Sim" && link.meses && (
  <p>
    <strong>Venda Recorrente:</strong> {link.meses}{" "}
    {parseInt(link.meses) === 1 ? "Mês" : "Meses"}
  </p>
)}
</div>

        <div className="mb-4">
          <label className="block font-semibold mb-1 text-[#06082E]">Link para Pagamento:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={linkURL}
              readOnly
              className="flex-1 border rounded-lg px-4 py-2 text-black"
            />
            <button
              onClick={handleCopy}
              className={`bg-[#06082E] text-white px-4 py-2 rounded-lg hover:bg-[#1a1f60] transition`}
            >
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleWhatsApp}
            className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Enviar WhatsApp
          </button>
          <button
            onClick={handleEmail}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Enviar E-mail
          </button>
        </div>
      </div>
    </div>
  );
}
