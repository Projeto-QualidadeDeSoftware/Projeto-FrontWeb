
import { useEffect, useMemo, useState } from "react";
import { funcionariosApi } from "../services/api";

const CARGOS = [
    "Administrador",
    "Gerente",
    "Operador de Caixa",
    "Supervisor",
    "Estoquista",
    "Repositor",
];

// Mantém na lista o cargo de um funcionário antigo cadastrado com outro nome.
function opcoesDeCargo(atual) {
    const cargo = String(atual || "").trim();
    return cargo && !CARGOS.includes(cargo) ? [...CARGOS, cargo] : CARGOS;
}

const camposVazios = {
    nome: "",
    cpf: "",
    cargo: "",
    senha: "",
    salario: "",
};

const ITENS_POR_PAGINA = 6;

function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function FuncionariosScreen() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [funcionarioEditando, setFuncionarioEditando] = useState(null);
    const [formulario, setFormulario] = useState({ ...camposVazios });
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);

    async function carregarFuncionarios() {
        setCarregando(true);
        setErro("");

        try {
            const dados = await funcionariosApi.listar();
            setFuncionarios(Array.isArray(dados) ? dados : []);
        } catch (e) {
            setErro(e.message || "Não foi possível carregar os funcionários.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    const funcionariosFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        return funcionarios.filter((funcionario) =>
            [
                funcionario.nome,
                funcionario.cpf,
                funcionario.cargo,
            ].some((valor) =>
                String(valor || "").toLowerCase().includes(termo)
            )
        );
    }, [funcionarios, busca]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(funcionariosFiltrados.length / ITENS_POR_PAGINA)
    );

    const funcionariosDaPagina = funcionariosFiltrados.slice(
        (paginaAtual - 1) * ITENS_POR_PAGINA,
        paginaAtual * ITENS_POR_PAGINA
    );

    useEffect(() => {
        setPaginaAtual(1);
    }, [busca]);

    useEffect(() => {
        if (paginaAtual > totalPaginas) {
            setPaginaAtual(totalPaginas);
        }
    }, [paginaAtual, totalPaginas]);

    function abrirCadastro() {
        setFuncionarioEditando(null);
        setFormulario({ ...camposVazios });
        setErro("");
        setSucesso("");
        setModalAberto(true);
    }

    async function abrirEdicao(id) {
        setErro("");
        setSucesso("");

        try {
            const funcionario = await funcionariosApi.buscarPorId(id);

            setFuncionarioEditando(funcionario);
            setFormulario({
                nome: funcionario.nome || "",
                cpf: funcionario.cpf || "",
                cargo: funcionario.cargo || "",
                senha: "",
                salario: funcionario.salario ?? "",
            });

            setModalAberto(true);
        } catch (e) {
            setErro(e.message || "Não foi possível carregar o funcionário.");
        }
    }

    function fecharModal() {
        if (salvando) return;

        setModalAberto(false);
        setFuncionarioEditando(null);
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

    async function salvarFuncionario(evento) {
        evento.preventDefault();
        setErro("");
        setSucesso("");

        if (
            !formulario.nome.trim() ||
            !formulario.cpf.trim() ||
            !formulario.cargo.trim() ||
            !formulario.senha ||
            formulario.salario === ""
        ) {
            setErro("Preencha todos os campos.");
            return;
        }

        if (formulario.nome.trim().length < 3) {
            setErro("O nome deve ter pelo menos 3 caracteres.");
            return;
        }

        if (formulario.senha.length < 4) {
            setErro("A senha deve ter pelo menos 4 caracteres.");
            return;
        }

        if (!Number.isFinite(Number(formulario.salario)) ||
            Number(formulario.salario) <= 0) {
            setErro("O salário deve ser maior que zero.");
            return;
        }

        const dados = {
            nome: formulario.nome.trim(),
            cpf: formulario.cpf.trim(),
            cargo: formulario.cargo.trim(),
            senha: formulario.senha,
            salario: Number(formulario.salario),
        };

        setSalvando(true);

        try {
            if (funcionarioEditando) {
                await funcionariosApi.atualizar(
                    funcionarioEditando.id,
                    dados
                );
                setSucesso("Funcionário atualizado com sucesso.");
            } else {
                await funcionariosApi.criar(dados);
                setSucesso("Funcionário cadastrado com sucesso.");
            }

            setModalAberto(false);
            setFuncionarioEditando(null);
            setFormulario({ ...camposVazios });

            await carregarFuncionarios();
        } catch (e) {
            setErro(e.message || "Não foi possível salvar o funcionário.");
        } finally {
            setSalvando(false);
        }
    }

    async function excluirFuncionario(funcionario) {
        const confirmar = window.confirm(
            `Deseja realmente excluir o funcionário "${funcionario.nome}"?`
        );

        if (!confirmar) return;

        setErro("");
        setSucesso("");

        try {
            await funcionariosApi.excluir(funcionario.id);
            setSucesso("Funcionário excluído com sucesso.");
            await carregarFuncionarios();
        } catch (e) {
            setErro(e.message || "Não foi possível excluir o funcionário.");
        }
    }

    return (
        <main className="min-h-screen bg-[#fffdf9] p-5 text-[#0E1F39] md:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Cabeçalho */}
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-medium text-[#ff5a16]">
                            Gerenciamento
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight">
                            Funcionários
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Consulte e gerencie os funcionários cadastrados.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={abrirCadastro}
                        className="rounded-xl bg-[#ff5a16] px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                        + Novo funcionário
                    </button>
                </div>

                {/* Mensagens */}
                {erro && !modalAberto && (
                    <div
                        role="alert"
                        className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        <span>{erro}</span>
                        <button onClick={() => setErro("")} aria-label="Fechar erro">
                            ×
                        </button>
                    </div>
                )}

                {sucesso && (
                    <div
                        role="status"
                        className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                    >
                        <span>{sucesso}</span>
                        <button onClick={() => setSucesso("")} aria-label="Fechar mensagem">
                            ×
                        </button>
                    </div>
                )}

                {/* Resumo */}
                <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Funcionários cadastrados
                        </p>
                        <p className="mt-2 text-3xl font-bold">
                            {funcionarios.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Resultados encontrados
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[#ff5a16]">
                            {funcionariosFiltrados.length}
                        </p>
                    </div>
                </section>

                {/* Listagem */}
                <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-bold">
                                Lista de funcionários
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Pesquise por nome, CPF ou cargo.
                            </p>
                        </div>

                        <input
                            type="search"
                            value={busca}
                            onChange={(evento) => setBusca(evento.target.value)}
                            placeholder="Buscar funcionário..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100 sm:max-w-sm"
                        />
                    </div>

                    {carregando ? (
                        <div className="p-12 text-center text-gray-500">
                            Carregando funcionários...
                        </div>
                    ) : funcionarios.length === 0 && !erro ? (
                        <div className="p-12 text-center">
                            <p className="font-semibold">
                                Nenhum funcionário cadastrado.
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Clique em "Novo funcionário" para cadastrar.
                            </p>
                        </div>
                    ) : funcionariosFiltrados.length === 0 ? (
                        <div className="p-12 text-center text-sm text-gray-500">
                            Nenhum funcionário encontrado.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-5 py-4 font-semibold">Código</th>
                                            <th className="px-5 py-4 font-semibold">Funcionário</th>
                                            <th className="px-5 py-4 font-semibold">CPF</th>
                                            <th className="px-5 py-4 font-semibold">Cargo</th>
                                            <th className="px-5 py-4 font-semibold">Salário</th>
                                            <th className="px-5 py-4 text-right font-semibold">Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {funcionariosDaPagina.map((funcionario) => (
                                            <tr
                                                key={funcionario.id}
                                                className="transition hover:bg-orange-50/40"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                                                    #{funcionario.id}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-[#ff5a16]">
                                                            {funcionario.nome?.charAt(0).toUpperCase() || "?"}
                                                        </div>
                                                        <span className="font-semibold">
                                                            {funcionario.nome}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                    {funcionario.cpf}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    {funcionario.cargo}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 font-semibold">
                                                    {moeda(funcionario.salario)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => abrirEdicao(funcionario.id)}
                                                            className="rounded-lg border border-gray-200 px-3 py-2 font-medium transition hover:border-orange-300 hover:bg-orange-50"
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => excluirFuncionario(funcionario)}
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
                            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                                <p>
                                    {funcionariosFiltrados.length === 0
                                        ? "0 funcionários"
                                        : `${(paginaAtual - 1) * ITENS_POR_PAGINA + 1}–${Math.min(paginaAtual * ITENS_POR_PAGINA, funcionariosFiltrados.length)} de ${funcionariosFiltrados.length} funcionários`}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={paginaAtual <= 1}
                                        onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                                        className="rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Anterior
                                    </button>

                                    <span className="px-2">
                                        Página {paginaAtual} de {totalPaginas}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={paginaAtual >= totalPaginas}
                                        onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                                        className="rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* Modal de cadastro e edição */}
            {modalAberto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0E1F39]/60 p-4"
                    onMouseDown={(evento) => {
                        if (
                            evento.target === evento.currentTarget &&
                            !salvando
                        ) {
                            fecharModal();
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-form-funcionario"
                        className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                            <div>
                                <h2
                                    id="titulo-form-funcionario"
                                    className="text-xl font-bold"
                                >
                                    {funcionarioEditando
                                        ? "Editar funcionário"
                                        : "Cadastrar funcionário"}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Preencha os dados do funcionário.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fecharModal}
                                disabled={salvando}
                                className="rounded-lg px-3 py-1 text-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Fechar formulário"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={salvarFuncionario} className="p-6">
                            {erro && (
                                <div
                                    role="alert"
                                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {erro}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="nome" className="mb-2 block text-sm font-semibold">
                                        Nome completo
                                    </label>
                                    <input
                                        id="nome"
                                        name="nome"
                                        type="text"
                                        value={formulario.nome}
                                        onChange={alterarCampo}
                                        minLength={3}
                                        maxLength={100}
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                        placeholder="Nome do funcionário"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cpf" className="mb-2 block text-sm font-semibold">
                                        CPF
                                    </label>
                                    <input
                                        id="cpf"
                                        name="cpf"
                                        type="text"
                                        value={formulario.cpf}
                                        onChange={alterarCampo}
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                        placeholder="CPF do funcionário"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cargo" className="mb-2 block text-sm font-semibold">
                                        Cargo
                                    </label>
                                    <select
                                        id="cargo"
                                        name="cargo"
                                        value={formulario.cargo}
                                        onChange={alterarCampo}
                                        required
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                    >
                                        <option value="" disabled>
                                            Selecione o cargo
                                        </option>
                                        {opcoesDeCargo(formulario.cargo).map((opcao) => (
                                            <option key={opcao} value={opcao}>
                                                {opcao}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="salario" className="mb-2 block text-sm font-semibold">
                                        Salário (R$)
                                    </label>
                                    <input
                                        id="salario"
                                        name="salario"
                                        type="number"
                                        value={formulario.salario}
                                        onChange={alterarCampo}
                                        min="0.01"
                                        step="0.01"
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                        placeholder="0,00"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="senha" className="mb-2 block text-sm font-semibold">
                                        {funcionarioEditando
                                            ? "Nova senha"
                                            : "Senha"}
                                    </label>
                                    <input
                                        id="senha"
                                        name="senha"
                                        type="password"
                                        value={formulario.senha}
                                        onChange={alterarCampo}
                                        minLength={4}
                                        autoComplete="new-password"
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                                        placeholder="Mínimo de 4 caracteres"
                                    />
                                    {funcionarioEditando && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            A API exige uma senha ao atualizar o funcionário. Informe a nova senha.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    disabled={salvando}
                                    className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
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
                                        : funcionarioEditando
                                            ? "Salvar alterações"
                                            : "Cadastrar funcionário"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default FuncionariosScreen;
