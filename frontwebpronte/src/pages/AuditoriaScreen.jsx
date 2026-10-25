import { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineSearch, HiRefresh } from "react-icons/hi";
import { auditoriaApi } from "../services/api";

const TAMANHO_PAGINA = 100;

const ACOES = {
    LOGIN: { rotulo: "Login", cor: "bg-green-50 text-green-700 border-green-200" },
    LOGIN_RECUSADO: { rotulo: "Login recusado", cor: "bg-red-50 text-red-700 border-red-200" },
    INCLUSAO: { rotulo: "Inclusão", cor: "bg-blue-50 text-blue-700 border-blue-200" },
    ALTERACAO: { rotulo: "Alteração", cor: "bg-amber-50 text-amber-700 border-amber-200" },
    EXCLUSAO: { rotulo: "Exclusão", cor: "bg-rose-50 text-rose-700 border-rose-200" },
    PERGUNTA_IA: { rotulo: "Pergunta à IA", cor: "bg-purple-50 text-purple-700 border-purple-200" },
};

function dataHoraBr(valor) {
    if (!valor) return "-";
    const [data, hora = ""] = String(valor).split("T");
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano} ${hora.slice(0, 8)}`;
}

function AuditoriaScreen() {
    const [registros, setRegistros] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [temMais, setTemMais] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [acao, setAcao] = useState("");
    const [busca, setBusca] = useState("");

    const carregar = useCallback(async (paginaDesejada) => {
        setCarregando(true);
        setErro("");
        try {
            const dados = await auditoriaApi.listar(paginaDesejada, TAMANHO_PAGINA);
            const lista = Array.isArray(dados) ? dados : [];
            setRegistros((atuais) => (paginaDesejada === 0 ? lista : [...atuais, ...lista]));
            setPagina(paginaDesejada);
            setTemMais(lista.length === TAMANHO_PAGINA);
        } catch (e) {
            setErro(e.message || "Não foi possível carregar a auditoria.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar(0);
    }, [carregar]);

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return registros.filter((registro) => {
            if (acao && registro.acao !== acao) return false;
            if (!termo) return true;
            return [registro.usuario, registro.recurso, registro.ip]
                .some((campo) => String(campo || "").toLowerCase().includes(termo));
        });
    }, [registros, acao, busca]);

    const resumo = useMemo(() => {
        const contar = (...acoes) => registros.filter((r) => acoes.includes(r.acao)).length;
        return [
            { titulo: "Registros carregados", valor: registros.length },
            { titulo: "Logins recusados", valor: contar("LOGIN_RECUSADO"), alerta: true },
            { titulo: "Alterações de dados", valor: contar("INCLUSAO", "ALTERACAO", "EXCLUSAO") },
            { titulo: "Perguntas à IA", valor: contar("PERGUNTA_IA") },
        ];
    }, [registros]);

    return (
        <div className="min-h-screen bg-[#fffdf9] p-5 sm:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="mb-1 text-sm font-medium text-[#ff5a16]">Segurança</p>
                        <h1 className="text-3xl font-bold text-[#0E1F39]">Auditoria</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Quem fez cada operação, quando, de onde e com qual resultado. Consultas não são registradas.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => carregar(0)}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0E1F39] transition hover:bg-gray-50"
                    >
                        <HiRefresh className="h-4 w-4" />
                        Atualizar
                    </button>
                </div>

                {erro && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {erro}
                    </div>
                )}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {resumo.map((item) => (
                        <div
                            key={item.titulo}
                            className={`rounded-2xl border p-5 shadow-sm ${item.alerta && item.valor > 0
                                ? "border-red-100 bg-red-50"
                                : "border-gray-100 bg-white"}`}
                        >
                            <p className="text-sm text-gray-500">{item.titulo}</p>
                            <p className={`mt-2 text-3xl font-bold ${item.alerta && item.valor > 0 ? "text-red-600" : "text-[#0E1F39]"}`}>
                                {item.valor}
                            </p>
                        </div>
                    ))}
                </div>

                <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-5">
                        <div className="relative min-w-[240px] flex-1">
                            <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Buscar por funcionário, rota ou IP..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                            />
                        </div>
                        <select
                            value={acao}
                            onChange={(e) => setAcao(e.target.value)}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="">Todas as ações</option>
                            {Object.entries(ACOES).map(([valor, { rotulo }]) => (
                                <option key={valor} value={valor}>
                                    {rotulo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {carregando && registros.length === 0 ? (
                        <p className="p-10 text-center text-sm text-gray-500">Carregando auditoria...</p>
                    ) : filtrados.length === 0 ? (
                        <p className="p-10 text-center text-sm text-gray-500">Nenhum registro encontrado.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold">Data e hora</th>
                                        <th className="px-5 py-4 font-semibold">Funcionário</th>
                                        <th className="px-5 py-4 font-semibold">Ação</th>
                                        <th className="px-5 py-4 font-semibold">Rota</th>
                                        <th className="px-5 py-4 font-semibold">Resultado</th>
                                        <th className="px-5 py-4 font-semibold">IP</th>
                                        <th className="px-5 py-4 text-right font-semibold">Duração</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtrados.map((registro) => {
                                        const tipo = ACOES[registro.acao] || {
                                            rotulo: registro.acao,
                                            cor: "bg-gray-50 text-gray-700 border-gray-200",
                                        };
                                        const sucesso = Number(registro.status) < 400;
                                        return (
                                            <tr key={registro.id} className="hover:bg-orange-50/40">
                                                <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                                                    {dataHoraBr(registro.dataHora)}
                                                </td>
                                                <td className="px-5 py-4 font-semibold text-[#0E1F39]">
                                                    {registro.usuario || "-"}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${tipo.cor}`}>
                                                        {tipo.rotulo}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 font-mono text-xs text-gray-600">
                                                    {registro.metodo} {registro.recurso}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`font-semibold ${sucesso ? "text-green-700" : "text-red-600"}`}>
                                                        {registro.status} {sucesso ? "sucesso" : "falha"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-gray-500">{registro.ip || "-"}</td>
                                                <td className="px-5 py-4 text-right text-gray-500">
                                                    {registro.duracaoMs} ms
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {temMais && (
                        <div className="border-t border-gray-100 p-4 text-center">
                            <button
                                type="button"
                                disabled={carregando}
                                onClick={() => carregar(pagina + 1)}
                                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0E1F39] transition hover:bg-gray-50 disabled:opacity-60"
                            >
                                {carregando ? "Carregando..." : "Carregar mais"}
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AuditoriaScreen;
