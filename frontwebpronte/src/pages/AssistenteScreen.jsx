import { useEffect, useRef, useState } from "react";
import { HiChatAlt2, HiPaperAirplane } from "react-icons/hi";
import { assistenteApi } from "../services/api";

const LIMITE = 500;

const SUGESTOES = [
    "O que está acabando?",
    "Quais produtos estão com menos de 20 unidades?",
    "Qual o produto mais caro do estoque?",
];

function AssistenteScreen() {
    const [conversa, setConversa] = useState([]);
    const [pergunta, setPergunta] = useState("");
    const [consultando, setConsultando] = useState(false);
    const fimDaConversa = useRef(null);
    const campo = useRef(null);

    useEffect(() => {
        campo.current?.focus();
    }, []);

    useEffect(() => {
        fimDaConversa.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [conversa, consultando]);

    async function perguntar(texto) {
        const conteudo = texto.trim();
        if (!conteudo || consultando) return;

        if (conteudo.length > LIMITE) {
            setConversa((atual) => [
                ...atual,
                { autor: "erro", texto: `A pergunta pode ter no máximo ${LIMITE} caracteres.` },
            ]);
            return;
        }

        setConversa((atual) => [...atual, { autor: "voce", texto: conteudo }]);
        setPergunta("");
        setConsultando(true);

        try {
            const resposta = await assistenteApi.perguntar(conteudo);
            setConversa((atual) => [...atual, { autor: "assistente", texto: resposta?.resposta || "" }]);
        } catch (e) {
            setConversa((atual) => [
                ...atual,
                { autor: "erro", texto: e.message || "O assistente não respondeu. Tente novamente." },
            ]);
        } finally {
            setConsultando(false);
            campo.current?.focus();
        }
    }

    function enviar(evento) {
        evento.preventDefault();
        perguntar(pergunta);
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#fffdf9] p-5 sm:p-8">
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
                <div className="mb-8">
                    <p className="mb-1 text-sm font-medium text-[#ff5a16]">Inteligência artificial</p>
                    <h1 className="text-3xl font-bold text-[#0E1F39]">Assistente de Estoque</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        As respostas usam os produtos cadastrados no momento da pergunta.
                    </p>
                </div>

                <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-gray-100 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#ff5a16]">
                            <HiChatAlt2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-[#0E1F39]">Pergunte sobre o estoque</h2>
                            <p className="text-xs text-gray-500">Até {LIMITE} caracteres por pergunta.</p>
                        </div>
                    </div>

                    <div className="min-h-[320px] flex-1 space-y-4 overflow-y-auto p-5">
                        {conversa.length === 0 && !consultando && (
                            <div className="py-6 text-center">
                                <p className="mb-4 text-sm text-gray-500">
                                    Nenhuma pergunta ainda. Experimente:
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {SUGESTOES.map((sugestao) => (
                                        <button
                                            key={sugestao}
                                            type="button"
                                            onClick={() => perguntar(sugestao)}
                                            className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-[#0E1F39] transition hover:bg-orange-100"
                                        >
                                            {sugestao}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {conversa.map((mensagem, indice) =>
                            mensagem.autor === "erro" ? (
                                <div
                                    key={indice}
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {mensagem.texto}
                                </div>
                            ) : (
                                <div
                                    key={indice}
                                    className={`flex ${mensagem.autor === "voce" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${mensagem.autor === "voce"
                                            ? "bg-[#0E1F39] text-white"
                                            : "border border-gray-100 bg-gray-50 text-[#0E1F39]"}`}
                                    >
                                        <p className={`mb-1 text-xs font-semibold ${mensagem.autor === "voce" ? "text-orange-200" : "text-[#ff5a16]"}`}>
                                            {mensagem.autor === "voce" ? "Você" : "Assistente"}
                                        </p>
                                        <p className="whitespace-pre-line">{mensagem.texto}</p>
                                    </div>
                                </div>
                            )
                        )}

                        {consultando && (
                            <p className="text-sm text-gray-500">Consultando o estoque...</p>
                        )}

                        <div ref={fimDaConversa} />
                    </div>

                    <form onSubmit={enviar} className="flex gap-3 border-t border-gray-100 p-4">
                        <input
                            ref={campo}
                            type="text"
                            value={pergunta}
                            onChange={(e) => setPergunta(e.target.value)}
                            placeholder="Ex: Quais produtos estão com menos de 20 unidades?"
                            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                        />
                        <button
                            type="submit"
                            disabled={consultando || !pergunta.trim()}
                            className="flex items-center gap-2 rounded-xl bg-[#ff5a16] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e94b0c] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <HiPaperAirplane className="h-4 w-4 rotate-90" />
                            Perguntar
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default AssistenteScreen;
