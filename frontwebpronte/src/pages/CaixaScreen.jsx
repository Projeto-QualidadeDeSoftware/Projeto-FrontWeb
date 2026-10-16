
import { useEffect, useMemo, useState } from "react";
import {
    produtosApi,
    clientesApi,
    funcionariosApi,
    vendasApi,
} from "../services/api";

function dataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function CaixaScreen() {
    const [produtos, setProdutos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);

    const [busca, setBusca] = useState("");
    const [carrinho, setCarrinho] = useState([]);
    const [clienteId, setClienteId] = useState("");
    const [funcionarioId, setFuncionarioId] = useState("");
    const [dataVenda, setDataVenda] = useState(dataHoje());

    const [carregando, setCarregando] = useState(true);
    const [finalizando, setFinalizando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [vendaConcluida, setVendaConcluida] = useState(null);

    useEffect(() => {
        async function carregarDados() {
            setCarregando(true);
            setErro("");

            try {
                const [listaProdutos, listaClientes, listaFuncionarios] =
                    await Promise.all([
                        produtosApi.listar(),
                        clientesApi.listar(),
                        funcionariosApi.listar(),
                    ]);

                setProdutos(
                    Array.isArray(listaProdutos) ? listaProdutos : []
                );
                setClientes(
                    Array.isArray(listaClientes) ? listaClientes : []
                );
                setFuncionarios(
                    Array.isArray(listaFuncionarios) ? listaFuncionarios : []
                );
            } catch (erro) {
                setErro(erro.message);
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    const produtosFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        return produtos.filter((produto) =>
            String(produto.nome || "").toLowerCase().includes(termo)
        );
    }, [produtos, busca]);

    const totalItens = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    const valorTotal = carrinho.reduce(
        (total, item) =>
            total + Number(item.preco || 0) * item.quantidade,
        0
    );

    function adicionarProduto(produto) {
        setErro("");
        setMensagem("");
        setVendaConcluida(null);

        if (Number(produto.estoque || 0) <= 0) {
            setErro(`O produto "${produto.nome}" está sem estoque.`);
            return;
        }

        setCarrinho((anterior) => {
            const existente = anterior.find(
                (item) => item.id === produto.id
            );

            if (existente) {
                if (existente.quantidade >= Number(produto.estoque || 0)) {
                    setErro(
                        `Estoque insuficiente para "${produto.nome}".`
                    );
                    return anterior;
                }

                return anterior.map((item) =>
                    item.id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                );
            }

            return [
                ...anterior,
                {
                    id: produto.id,
                    nome: produto.nome,
                    preco: Number(produto.preco || 0),
                    estoque: Number(produto.estoque || 0),
                    quantidade: 1,
                },
            ];
        });
    }

    function alterarQuantidade(produtoId, quantidade) {
        setErro("");
        setMensagem("");
        setVendaConcluida(null);

        if (quantidade <= 0) {
            setCarrinho((anterior) =>
                anterior.filter((item) => item.id !== produtoId)
            );
            return;
        }

        const item = carrinho.find(
            (produto) => produto.id === produtoId
        );

        if (item && quantidade > item.estoque) {
            setErro(
                `Estoque insuficiente para "${item.nome}". Disponível: ${item.estoque}.`
            );
            return;
        }

        setCarrinho((anterior) =>
            anterior.map((item) =>
                item.id === produtoId
                    ? { ...item, quantidade }
                    : item
            )
        );
    }

    function removerProduto(produtoId) {
        setCarrinho((anterior) =>
            anterior.filter((item) => item.id !== produtoId)
        );

        setErro("");
        setMensagem("");
        setVendaConcluida(null);
    }

    async function finalizarVenda(evento) {
        evento.preventDefault();

        setErro("");
        setMensagem("");
        setVendaConcluida(null);

        if (!clienteId) {
            setErro("Selecione um cliente para continuar.");
            return;
        }

        if (!funcionarioId) {
            setErro("Selecione o funcionário responsável pela venda.");
            return;
        }

        if (!dataVenda) {
            setErro("Informe a data da venda.");
            return;
        }

        if (carrinho.length === 0) {
            setErro("Adicione pelo menos um produto ao carrinho.");
            return;
        }

        const venda = {
            dataVenda,
            clienteId: Number(clienteId),
            funcionarioId: Number(funcionarioId),
            itens: carrinho.map((item) => ({
                produtoId: Number(item.id),
                quantidade: item.quantidade,
            })),
        };

        setFinalizando(true);

        try {
            const resposta = await vendasApi.criar(venda);

            setVendaConcluida(resposta);
            setMensagem(
                `Venda #${resposta.id} realizada com sucesso!`
            );
            setCarrinho([]);
            setClienteId("");
            setFuncionarioId("");
            setBusca("");

            const listaAtualizada = await produtosApi.listar();
            setProdutos(
                Array.isArray(listaAtualizada) ? listaAtualizada : []
            );
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setFinalizando(false);
        }
    }

    function limparVenda() {
        setCarrinho([]);
        setClienteId("");
        setFuncionarioId("");
        setDataVenda(dataHoje());
        setBusca("");
        setErro("");
        setMensagem("");
        setVendaConcluida(null);
    }

    if (carregando) {
        return (
            <div className="min-h-screen bg-[#fffdf9] p-8">
                <p className="text-sm text-gray-500">
                    Carregando dados da frente de caixa...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fffdf9] p-5 sm:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Cabeçalho */}
                <div className="mb-8">
                    <p className="mb-1 text-sm font-medium text-[#ff5a16]">
                        Vendas
                    </p>

                    <h1 className="text-3xl font-bold text-[#0E1F39]">
                        Frente de Caixa
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Selecione os produtos, confira o carrinho e finalize a venda.
                    </p>
                </div>

                {/* Mensagens */}
                {erro && (
                    <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{erro}</span>

                        <button
                            type="button"
                            onClick={() => setErro("")}
                            className="font-bold"
                            aria-label="Fechar erro"
                        >
                            ×
                        </button>
                    </div>
                )}

                {mensagem && (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {mensagem}
                    </div>
                )}

                {/* Resumo */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Produtos disponíveis
                        </p>

                        <p className="mt-2 text-3xl font-bold text-[#0E1F39]">
                            {produtos.filter(
                                (produto) => Number(produto.estoque || 0) > 0
                            ).length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Itens no carrinho
                        </p>

                        <p className="mt-2 text-3xl font-bold text-[#0E1F39]">
                            {totalItens}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total da venda
                        </p>

                        <p className="mt-2 text-3xl font-bold text-[#ff5a16]">
                            {formatarMoeda(valorTotal)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.2fr_0.8fr]">

                    {/* Seleção de produtos */}
                    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-5">
                            <h2 className="font-bold text-[#0E1F39]">
                                Produtos
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Clique em um produto para adicioná-lo.
                            </p>

                            <input
                                type="search"
                                value={busca}
                                onChange={(evento) => setBusca(evento.target.value)}
                                placeholder="Buscar produto pelo nome..."
                                className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                            />
                        </div>

                        {produtosFiltrados.length === 0 ? (
                            <div className="p-10 text-center text-sm text-gray-500">
                                Nenhum produto encontrado.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                                {produtosFiltrados.map((produto) => {
                                    const estoque = Number(produto.estoque || 0);

                                    return (
                                        <button
                                            key={produto.id}
                                            type="button"
                                            disabled={estoque <= 0}
                                            onClick={() => adicionarProduto(produto)}
                                            className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-orange-300 hover:bg-orange-50/50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <div className="mb-3 flex items-start justify-between gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-lg font-bold text-[#ff5a16]">
                                                    +
                                                </div>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estoque > 0
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-red-50 text-red-600"
                                                        }`}
                                                >
                                                    Estoque: {estoque}
                                                </span>
                                            </div>

                                            <p className="font-semibold text-[#0E1F39]">
                                                {produto.nome}
                                            </p>

                                            <p className="mt-2 text-lg font-bold text-[#ff5a16]">
                                                {formatarMoeda(produto.preco)}
                                            </p>

                                            <p className="mt-2 text-xs text-gray-400">
                                                {estoque > 0
                                                    ? "Adicionar ao carrinho"
                                                    : "Sem estoque"}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Carrinho e finalização */}
                    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-5">
                            <h2 className="font-bold text-[#0E1F39]">
                                Carrinho da venda
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Confira as quantidades e o valor dos itens.
                            </p>
                        </div>

                        {carrinho.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl text-[#ff5a16]">
                                    +
                                </div>

                                <p className="mt-4 font-semibold text-[#0E1F39]">
                                    Carrinho vazio
                                </p>

                                <p className="mt-2 text-sm text-gray-500">
                                    Adicione produtos para iniciar a venda.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 px-5">
                                {carrinho.map((item) => (
                                    <div
                                        key={item.id}
                                        className="py-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[#0E1F39]">
                                                    {item.nome}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {formatarMoeda(item.preco)} por unidade
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removerProduto(item.id)}
                                                className="shrink-0 text-sm font-medium text-red-500 hover:text-red-700"
                                            >
                                                Remover
                                            </button>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        alterarQuantidade(
                                                            item.id,
                                                            item.quantidade - 1
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-[#0E1F39] hover:bg-gray-50"
                                                    aria-label={`Diminuir quantidade de ${item.nome}`}
                                                >
                                                    −
                                                </button>

                                                <span className="min-w-5 text-center text-sm font-semibold">
                                                    {item.quantidade}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        alterarQuantidade(
                                                            item.id,
                                                            item.quantidade + 1
                                                        )
                                                    }
                                                    disabled={item.quantidade >= item.estoque}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-[#0E1F39] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    aria-label={`Aumentar quantidade de ${item.nome}`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <p className="font-bold text-[#0E1F39]">
                                                {formatarMoeda(
                                                    item.preco * item.quantidade
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form
                            onSubmit={finalizarVenda}
                            className="border-t border-gray-100 bg-gray-50/70 p-5"
                        >
                            <div className="mb-4">
                                <label
                                    htmlFor="clienteVenda"
                                    className="mb-2 block text-sm font-semibold text-[#0E1F39]"
                                >
                                    Cliente
                                </label>

                                <select
                                    id="clienteVenda"
                                    value={clienteId}
                                    onChange={(evento) => setClienteId(evento.target.value)}
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                >
                                    <option value="">Selecione um cliente</option>

                                    {clientes.map((cliente) => (
                                        <option
                                            key={cliente.id}
                                            value={cliente.id}
                                        >
                                            {cliente.nome} — {cliente.cpf}
                                        </option>
                                    ))}
                                </select>

                                {clientes.length === 0 && (
                                    <p className="mt-2 text-xs text-red-600">
                                        Cadastre um cliente antes de realizar a venda.
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="funcionarioVenda"
                                    className="mb-2 block text-sm font-semibold text-[#0E1F39]"
                                >
                                    Funcionário responsável
                                </label>

                                <select
                                    id="funcionarioVenda"
                                    value={funcionarioId}
                                    onChange={(evento) => setFuncionarioId(evento.target.value)}
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                >
                                    <option value="">Selecione um funcionário</option>

                                    {funcionarios.map((funcionario) => (
                                        <option
                                            key={funcionario.id}
                                            value={funcionario.id}
                                        >
                                            {funcionario.nome} — {funcionario.cpf}
                                        </option>
                                    ))}
                                </select>

                                {funcionarios.length === 0 && (
                                    <p className="mt-2 text-xs text-red-600">
                                        Cadastre um funcionário antes de realizar a venda.
                                    </p>
                                )}
                            </div>

                            <div className="mb-5">
                                <label
                                    htmlFor="dataVenda"
                                    className="mb-2 block text-sm font-semibold text-[#0E1F39]"
                                >
                                    Data da venda
                                </label>

                                <input
                                    id="dataVenda"
                                    type="date"
                                    value={dataVenda}
                                    onChange={(evento) => setDataVenda(evento.target.value)}
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                />
                            </div>

                            <div className="mb-5 rounded-xl bg-[#0E1F39] p-4 text-white">
                                <div className="flex items-center justify-between text-sm text-white/75">
                                    <span>Quantidade de itens</span>
                                    <span>{totalItens}</span>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <span className="font-medium">
                                        Total a pagar
                                    </span>

                                    <span className="text-2xl font-bold">
                                        {formatarMoeda(valorTotal)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    finalizando ||
                                    carrinho.length === 0 ||
                                    clientes.length === 0 ||
                                    funcionarios.length === 0
                                }
                                className="w-full rounded-xl bg-[#ff5a16] px-5 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {finalizando
                                    ? "Finalizando venda..."
                                    : "Finalizar venda"}
                            </button>

                            <button
                                type="button"
                                onClick={limparVenda}
                                disabled={finalizando}
                                className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Limpar venda
                            </button>

                            {vendaConcluida && (
                                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                                    <p className="font-semibold text-green-800">
                                        Venda #{vendaConcluida.id} concluída
                                    </p>

                                    <p className="mt-1 text-sm text-green-700">
                                        Total registrado:{" "}
                                        {formatarMoeda(vendaConcluida.valorTotal)}
                                    </p>
                                </div>
                            )}
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default CaixaScreen;
