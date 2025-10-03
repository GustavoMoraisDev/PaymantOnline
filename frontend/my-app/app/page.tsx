import Image from "next/image";
import { FaCirclePlus } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="min-h-screen p-8 sm:p-20 bg-amber-50 font-sans flex flex-col items-center">

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#06082E]">Pagamentos Online</h1>
        <p className="text-[#06082E] mt-2">
          Crie e Gerencie os links de pagamento criados
        </p>
      </header>

    

      <section className="w-full max-w-6xl">
        
        <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-[#06082E] ">
          Últimos Links Gerados
        </h2>
        
        <a href="/Criar-Pagamento"> <FaCirclePlus size={40} className="text-[#06082E] hover:text-[#1a1f60] " /></a>

        </div>


        <div className="grid grid-cols-8 gap-4 p-4 bg-[#06082E] text-white font-medium rounded-t-lg shadow-sm">
          <p>Titulo</p>
          <p>Valor</p>
          <p>Pagamento</p>
          <p>Parcelas</p>
          <p>Recorrência</p>
          <p>Status</p>
          <p>Expiração</p>
          <p>Ações</p>
        </div>

        
        <div className="divide-y divide-gray-200 border border-t-0 border-gray-200 rounded-b-lg shadow">
          
        </div>
      </section>
    </div>
  );
}
