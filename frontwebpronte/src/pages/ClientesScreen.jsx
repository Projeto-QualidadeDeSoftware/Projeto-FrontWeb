
import { useEffect, useMemo, useState } from "react";
import { clientesApi } from "../services/api";

const camposVazios = {
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
};

function ClientesScreen() {
    const [clientes, setClientes] = useState([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [clienteEditando, setClienteEditando] = useState(null);
    const [formulario, setFormulario] = useState(camposVazios);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [pagina, setPagina] = useState(1);

    const clientesPorPagina = 6;

    async function carregarClientes() {
        setCarregando(true);
        setErro("");

        try {
            const dados = await clientesApi.listar();
            setClientes(Array.isArray(dados) ? dados : []);
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarClientes();
    }, []);

    const clientesFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        return clientes.filter((cliente) =>
            [
                cliente.nome,
                cliente.cpf,
                cliente.email,
                cliente.telefone,
            ].some((valor) =>
                String(valor || "").toLowerCase().includes(termo)
            )
        );
    }, [clientes, busca]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(clientesFiltrados.length / clientesPorPagina)
    );

    const clientesExibidos = clientesFiltrados.slice(
        (pagina - 1) * clientesPorPagina,
        pagina * clientesPorPagina
    );

    useEffect(() => {
        setPagina(1);
    }, [busca]);

    useEffect(() => {
        if (pagina > totalPaginas) {
            setPagina(totalPaginas);
        }
    }, [pagina, totalPaginas]);

    function abrirCadastro() {
        setClienteEditando(null);
        setFormulario({ ...camposVazios });
        setErro("");
        setMensagem("");
        setModalAberto(true);
    }

    async function abrirEdicao(id) {
        setErro("");
        setMensagem("");

        try {
            const cliente = await clientesApi.buscarPorId(id);

            setClienteEditando(cliente);
            setFormulario({
                nome: cliente.nome || "",
                cpf: cliente.cpf || "",
                email: cliente.email || "",
                telefone: cliente.telefone || "",
            });

            setModalAberto(true);
        } catch (erro) {
            setErro(erro.message);
        }
    }

    function fecharModal() {
        setModalAberto(false);
        setClienteEditando(null);
        setFormulario({ ...camposVazios });
        setErro("");
    }

    function alterarCampo(evento) {
        const { name, value } = evento.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    }

    async function salvarCliente(evento) {
        evento.preventDefault();

        setErro("");
        setMensagem("");

        if (
            !formulario.nome.trim() ||
            !formulario.cpf.trim() ||
            !formulario.email.trim() ||
            !formulario.telefone.trim()
        ) {
            setErro("Preencha todos os campos.");
            return;
        }

        setSalvando(true);

        const cliente = {
            nome: formulario.nome.trim(),
            cpf: formulario.cpf.trim(),
            email: formulario.email.trim(),
            telefone: formulario.telefone.trim(),
        };

        try {
            if (clienteEditando) {
                await clientesApi.atualizar(clienteEditando.id, cliente);
                setMensagem("Cliente atualizado com sucesso!");
            } else {
                await clientesApi.criar(cliente);
                setMensagem("Cliente cadastrado com sucesso!");
            }

            fecharModal();
            await carregarClientes();
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setSalvando(false);
        }
    }

    async function excluirCliente(cliente) {
        const confirmou = window.confirm(
            `Deseja realmente excluir o cliente "${cliente.nome}"?`
        );

        if (!confirmou) {
            return;
        }

        setErro("");
        setMensagem("");

        try {
            await clientesApi.excluir(cliente.id);
            setMensagem("Cliente excluído com sucesso!");
            await carregarClientes();
        } catch (erro) {
            setErro(erro.message);
        }
    }

    return (
        <div className="min-h-screen bg-[#fffdf9] p-5 sm:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Cabeçalho */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="mb-1 text-sm font-medium text-[#ff5a16]">
                            Gerenciamento
                        </p>

                        <h1 className="text-3xl font-bold text-[#0E1F39]">
                            Clientes
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Cadastre e gerencie os clientes da PRONTE.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={abrirCadastro}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#ff5a16] px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                        <span className="text-xl">+</span>
                        Novo cliente
                    </button>
                </div>

                {/* Mensagens */}
                {mensagem && (
                    <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        <span>{mensagem}</span>

                        <button
                            type="button"
                            onClick={() => setMensagem("")}
                            className="font-bold"
                            aria-label="Fechar mensagem"
                        >
                            ×
                        </button>
                    </div>
                )}

                {erro && !modalAberto && (
                    <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

                {/* Resumo */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total de clientes
                        </p>

                        <p className="mt-2 text-3xl font-bold text-[#0E1F39]">
                            {clientes.length}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Clientes cadastrados na API
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Resultados encontrados
                        </p>

                        <p className="mt-2 text-3xl font-bold text-[#ff5a16]">
                            {clientesFiltrados.length}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            De acordo com sua pesquisa
                        </p>
                    </div>
                </div>

                {/* Tabela */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-bold text-[#0E1F39]">
                                Lista de clientes
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Consulte os dados dos clientes cadastrados.
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-sm">
                            <input
                                type="search"
                                value={busca}
                                onChange={(evento) => setBusca(evento.target.value)}
                                placeholder="Buscar cliente..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                            />
                        </div>
                    </div>

                    {carregando ? (
                        <div className="p-12 text-center text-sm text-gray-500">
                            Carregando clientes...
                        </div>
                    ) : clientes.length === 0 && !erro ? (
                        <div className="p-12 text-center">
                            <p className="font-semibold text-[#0E1F39]">
                                Nenhum cliente cadastrado
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                                Clique em "Novo cliente" para realizar o primeiro cadastro.
                            </p>
                        </div>
                    ) : clientesFiltrados.length === 0 ? (
                        <div className="p-12 text-center text-sm text-gray-500">
                            Nenhum cliente encontrado para essa pesquisa.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-5 py-4 font-semibold">
                                                Cliente
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                CPF
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                Telefone
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                E-mail
                                            </th>

                                            <th className="px-5 py-4 text-right font-semibold">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {clientesExibidos.map((cliente) => (
                                            <tr
                                                key={cliente.id}
                                                className="transition hover:bg-orange-50/40"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-[#ff5a16]">
                                                            {cliente.nome?.charAt(0).toUpperCase() || "?"}
                                                        </div>

                                                        <span className="font-semibold text-[#0E1F39]">
                                                            {cliente.nome}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                    {cliente.cpf}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                    {cliente.telefone}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    {cliente.email}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => abrirEdicao(cliente.id)}
                                                            className="rounded-lg border border-gray-200 px-3 py-2 font-medium text-[#0E1F39] transition hover:border-orange-300 hover:bg-orange-50"
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => excluirCliente(cliente)}
                                                            className="rounded-lg border border-red-100 px-3 py-2 font-medium text-red-600 transition hover:bg-red-50"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação */}
                            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-500">
                                    Mostrando{" "}
                                    {clientesFiltrados.length === 0
                                        ? 0
                                        : (pagina - 1) * clientesPorPagina + 1}
                                    {" "}a{" "}
                                    {Math.min(
                                        pagina * clientesPorPagina,
                                        clientesFiltrados.length
                                    )}
                                    {" "}de {clientesFiltrados.length} clientes
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={pagina === 1}
                                        onClick={() => setPagina(pagina - 1)}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0E1F39] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Anterior
                                    </button>

                                    <span className="px-2 text-sm text-gray-600">
                                        {pagina} / {totalPaginas}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={pagina === totalPaginas}
                                        onClick={() => setPagina(pagina + 1)}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0E1F39] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal de cadastro e edição */}
            {modalAberto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0E1F39]/60 p-4"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) {
                            fecharModal();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-modal-cliente"
                        className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between border-b border-gray-100 p-6">
                            <div>
                                <h2
                                    id="titulo-modal-cliente"
                                    className="text-xl font-bold text-[#0E1F39]"
                                >
                                    {clienteEditando
                                        ? "Editar cliente"
                                        : "Novo cliente"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Preencha os dados abaixo.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fecharModal}
                                className="rounded-lg px-3 py-1 text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Fechar formulário"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={salvarCliente} className="p-6">
                            {erro && (
                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {erro}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="nome"
                                        className="mb-2 block text-sm font-semibold text-[#0E1F39]"
                                    >
                                        Nome completo
                                    </label>

                                    <input
                                        id="nome"
                                        name="nome"
                                        type="text"
                                        value={formulario.nome}
                                        onChange={alterarCampo}
                                        maxLength={255}
                                        required
                                        placeholder="Digite o nome do cliente"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="cpf"
                                        className="mb-2 block text-sm font-semibold text-[#0E1F39]"
                                    >
                                        CPF
                                    </label>

                                    <input
                                        id="cpf"
                                        name="cpf"
                                        type="text"
                                        value={formulario.cpf}
                                        onChange={alterarCampo}
                                        required
                                        placeholder="Digite o CPF"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="telefone"
                                        className="mb-2 block text-sm font-semibold text-[#0E1F39]"
                                    >
                                        Telefone
                                    </label>

                                    <input
                                        id="telefone"
                                        name="telefone"
                                        type="tel"
                                        value={formulario.telefone}
                                        onChange={alterarCampo}
                                        required
                                        placeholder="Digite o telefone"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-semibold text-[#0E1F39]"
                                    >
                                        E-mail
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formulario.email}
                                        onChange={alterarCampo}
                                        required
                                        placeholder="cliente@email.com"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    disabled={salvando}
                                    className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="rounded-xl bg-[#ff5a16] px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : clienteEditando
                                            ? "Salvar alterações"
                                            : "Cadastrar cliente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClientesScreen;
