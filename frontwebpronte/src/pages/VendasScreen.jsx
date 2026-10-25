import { useCallback, useEffect, useMemo, useState } from "react";
import { HiRefresh } from "react-icons/hi";
import { vendasApi } from "../services/api";

const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function mesAtual() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

function nomeDoMes(chave) {
    const [ano, mes] = chave.split("-");
    return `${MESES[Number(mes) - 1]} de ${ano}`;
}

function dataBr(data) {
    const [ano, mes, dia] = String(data).split("-");
    return `${dia}/${mes}/${ano}`;
}

function itensDaVenda(venda) {
    return (venda.itens || []).reduce((total, item) => total + Number(item.quantidade || 0), 0);
}

function VendasScreen() {
    const [vendas, setVendas] = useState([]);
    const [mes, setMes] = useState(mesAtual());
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            const dados = await vendasApi.listar();
            setVendas(Array.isArray(dados) ? dados.filter((venda) => venda.dataVenda) : []);
        } catch (e) {
            setErro(e.message || "Não foi possível carregar as vendas.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const meses = useMemo(() => {
        const chaves = new Set([mesAtual()]);
        vendas.forEach((venda) => chaves.add(String(venda.dataVenda).slice(0, 7)));
        return [...chaves].sort().reverse();
    }, [vendas]);

    const vendasDoMes = useMemo(
        () =>
            vendas
                .filter((venda) => String(venda.dataVenda).startsWith(mes))
                .sort((a, b) =>
                    String(b.dataVenda).localeCompare(String(a.dataVenda)) || b.id - a.id
                ),
        [vendas, mes]
    );

    const resumo = useMemo(() => {
        const total = vendasDoMes.reduce((soma, venda) => soma + Number(venda.valorTotal || 0), 0);
        const itens = vendasDoMes.reduce((soma, venda) => soma + itensDaVenda(venda), 0);
        return {
            total,
            quantidade: vendasDoMes.length,
            ticketMedio: vendasDoMes.length ? total / vendasDoMes.length : 0,
            itens,
        };
    }, [vendasDoMes]);

    const produtosVendidos = useMemo(() => {
        const porProduto = new Map();
        vendasDoMes.forEach((venda) => {
            (venda.itens || []).forEach((item) => {
                const nome = item.produto || "?";
                const atual = porProduto.get(nome) || { nome, quantidade: 0, total: 0 };
                atual.quantidade += Number(item.quantidade || 0);
                atual.total += Number(item.subtotal || 0);
                porProduto.set(nome, atual);
            });
        });
        return [...porProduto.values()].sort((a, b) => b.quantidade - a.quantidade);
    }, [vendasDoMes]);

    const indicadores = [
        { titulo: "Total vendido", valor: moeda(resumo.total), destaque: true },
        { titulo: "Vendas realizadas", valor: resumo.quantidade },
        { titulo: "Ticket médio", valor: moeda(resumo.ticketMedio) },
        { titulo: "Itens vendidos", valor: resumo.itens },
    ];

    return (
        <div className="min-h-screen bg-[#fffdf9] p-5 sm:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="mb-1 text-sm font-medium text-[#ff5a16]">Fechamento</p>
                        <h1 className="text-3xl font-bold text-[#0E1F39]">Vendas</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Resumo das vendas registradas no mês escolhido.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <label htmlFor="mes" className="text-sm font-semibold text-[#0E1F39]">
                            Mês
                        </label>
                        <select
                            id="mes"
                            value={mes}
                            onChange={(e) => setMes(e.target.value)}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                        >
                            {meses.map((chave) => (
                                <option key={chave} value={chave}>
                                    {nomeDoMes(chave)}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={carregar}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0E1F39] transition hover:bg-gray-50"
                        >
                            <HiRefresh className="h-4 w-4" />
                            Atualizar
                        </button>
                    </div>
                </div>

                {erro && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {erro}
                    </div>
                )}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {indicadores.map((indicador) => (
                        <div
                            key={indicador.titulo}
                            className={`rounded-2xl border p-5 shadow-sm ${indicador.destaque
                                ? "border-orange-100 bg-orange-50"
                                : "border-gray-100 bg-white"}`}
                        >
                            <p className="text-sm text-gray-500">{indicador.titulo}</p>
                            <p className={`mt-2 text-3xl font-bold ${indicador.destaque ? "text-[#ff5a16]" : "text-[#0E1F39]"}`}>
                                {indicador.valor}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
                    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <h2 className="border-b border-gray-100 p-5 font-bold text-[#0E1F39]">Vendas do mês</h2>
                        {carregando ? (
                            <p className="p-10 text-center text-sm text-gray-500">Carregando vendas...</p>
                        ) : vendasDoMes.length === 0 ? (
                            <p className="p-10 text-center text-sm text-gray-500">Nenhuma venda neste mês.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-5 py-4 font-semibold">Nº</th>
                                            <th className="px-5 py-4 font-semibold">Data</th>
                                            <th className="px-5 py-4 font-semibold">Cliente</th>
                                            <th className="px-5 py-4 font-semibold">Vendedor</th>
                                            <th className="px-5 py-4 text-right font-semibold">Itens</th>
                                            <th className="px-5 py-4 text-right font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {vendasDoMes.map((venda) => (
                                            <tr key={venda.id} className="hover:bg-orange-50/40">
                                                <td className="px-5 py-4 font-semibold text-gray-400">
                                                    {String(venda.id).padStart(3, "0")}
                                                </td>
                                                <td className="px-5 py-4 text-gray-500">{dataBr(venda.dataVenda)}</td>
                                                <td className="px-5 py-4 font-semibold text-[#0E1F39]">
                                                    {venda.cliente?.nome || "-"}
                                                </td>
                                                <td className="px-5 py-4 text-gray-500">{venda.funcionario?.nome || "-"}</td>
                                                <td className="px-5 py-4 text-right text-gray-500">{itensDaVenda(venda)}</td>
                                                <td className="px-5 py-4 text-right font-semibold text-[#0E1F39]">
                                                    {moeda(venda.valorTotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <h2 className="border-b border-gray-100 p-5 font-bold text-[#0E1F39]">Produtos vendidos</h2>
                        {produtosVendidos.length === 0 ? (
                            <p className="p-10 text-center text-sm text-gray-500">
                                Nenhum produto vendido neste mês.
                            </p>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold">Produto</th>
                                        <th className="px-5 py-4 text-right font-semibold">Qtd.</th>
                                        <th className="px-5 py-4 text-right font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {produtosVendidos.map((produto) => (
                                        <tr key={produto.nome}>
                                            <td className="px-5 py-4 font-semibold text-[#0E1F39]">{produto.nome}</td>
                                            <td className="px-5 py-4 text-right text-gray-500">{produto.quantidade}</td>
                                            <td className="px-5 py-4 text-right font-semibold text-[#0E1F39]">
                                                {moeda(produto.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default VendasScreen;
