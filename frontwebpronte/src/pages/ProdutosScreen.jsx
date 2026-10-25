import { useCallback, useEffect, useMemo, useState } from 'react';
import { HiOutlineSearch, HiPlus, HiPencilAlt, HiTrash, HiRefresh, HiX } from 'react-icons/hi';
import { obterToken } from '../services/api';
import { produtosApi } from '../services/api';

const ITENS_POR_PAGINA = 8;
const formularioVazio = { nome: '', descricao: '', preco: '', estoque: '' };

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function validar(formulario) {
  const nome = formulario.nome.trim();
  const descricao = formulario.descricao.trim();
  const preco = Number(formulario.preco);
  const estoque = Number(formulario.estoque);

  if (nome.length < 3 || nome.length > 100) return 'O nome deve ter entre 3 e 100 caracteres.';
  if (descricao.length < 5 || descricao.length > 255) return 'A descrição deve ter entre 5 e 255 caracteres.';
  if (!Number.isFinite(preco) || preco <= 0) return 'O preço deve ser maior que zero.';
  if (formulario.estoque === '' || !Number.isInteger(estoque) || estoque < 0) return 'O estoque deve ser um número inteiro igual ou maior que zero.';
  return '';
}

export default function ProdutosScreen() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioVazio);
  const [salvando, setSalvando] = useState(false);

  const carregarProdutos = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const dados = await produtosApi.listar();
      setProdutos(Array.isArray(dados) ? dados : []);
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar os produtos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarProdutos(); }, [carregarProdutos]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return produtos.filter((produto) =>
      String(produto.nome || '').toLocaleLowerCase('pt-BR').includes(termo) ||
      String(produto.descricao || '').toLocaleLowerCase('pt-BR').includes(termo) ||
      String(produto.id ?? '').includes(termo)
    );
  }, [produtos, busca]);

  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const produtosDaPagina = produtosFiltrados.slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA);

  function abrirCadastro() {
    setProdutoEditando(null);
    setFormulario(formularioVazio);
    setErro('');
    setSucesso('');
    setModalAberto(true);
  }

  function abrirEdicao(produto) {
    setProdutoEditando(produto);
    setFormulario({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      preco: String(produto.preco ?? ''),
      estoque: String(produto.estoque ?? ''),
    });
    setErro('');
    setSucesso('');
    setModalAberto(true);
  }

  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  }

  async function salvarProduto(evento) {
    evento.preventDefault();
    const mensagemValidacao = validar(formulario);
    if (mensagemValidacao) {
      setErro(mensagemValidacao);
      return;
    }

    const dados = {
      nome: formulario.nome.trim(),
      descricao: formulario.descricao.trim(),
      preco: Number(formulario.preco),
      estoque: Number(formulario.estoque),
    };

    setSalvando(true);
    setErro('');
    try {
      if (produtoEditando) {
        await produtosApi.atualizar(produtoEditando.id, dados);
        setSucesso('Produto atualizado com sucesso.');
      } else {
        await produtosApi.criar(dados);
        setSucesso('Produto cadastrado com sucesso.');
      }
      setModalAberto(false);
      await carregarProdutos();
    } catch (e) {
      setErro(e.message || 'Não foi possível salvar o produto.');
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(produto) {
    const confirmar = window.confirm(`Deseja realmente excluir o produto "${produto.nome}"?`);
    if (!confirmar) return;
    setErro('');
    setSucesso('');
    try {
      await produtosApi.excluir(produto.id);
      setSucesso('Produto excluído com sucesso.');
      await carregarProdutos();
    } catch (e) {
      setErro(e.message || 'Não foi possível excluir o produto.');
    }
  }

  if (!obterToken()) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 md:p-10">
        <section className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
          <p className="mt-3 text-slate-600">É necessário fazer login no sistema antes de consultar os produtos.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">Estoque / Gerenciamento</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Produtos</h1>
            <p className="mt-2 text-slate-500">Consulte e gerencie os produtos cadastrados no sistema.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={carregarProdutos} disabled={carregando} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
              <HiRefresh className="h-5 w-5" /> Atualizar
            </button>
            <button onClick={abrirCadastro} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-orange-700">
              <HiPlus className="h-5 w-5" /> Novo produto
            </button>
          </div>
        </div>

        {erro && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{erro}</div>}
        {sucesso && <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{sucesso}</div>}

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Produtos cadastrados</p><p className="mt-2 text-3xl font-bold">{produtos.length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Itens em estoque</p><p className="mt-2 text-3xl font-bold">{produtos.reduce((soma, p) => soma + Number(p.estoque || 0), 0)}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Produtos sem estoque</p><p className="mt-2 text-3xl font-bold">{produtos.filter((p) => Number(p.estoque) === 0).length}</p></div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 md:p-5">
            <label className="relative block max-w-lg">
              <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} placeholder="Buscar por nome, descrição ou código..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100" />
            </label>
          </div>

          {carregando ? (
            <div className="p-12 text-center text-slate-500">Carregando produtos...</div>
          ) : produtosDaPagina.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-slate-700">Nenhum produto encontrado</p>
              <p className="mt-1 text-sm text-slate-500">Tente alterar a busca ou cadastre um novo produto.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-5 py-4 font-semibold">Código</th><th className="px-5 py-4 font-semibold">Produto</th><th className="px-5 py-4 font-semibold">Preço</th><th className="px-5 py-4 font-semibold">Estoque</th><th className="px-5 py-4 text-right font-semibold">Ações</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {produtosDaPagina.map((produto) => (
                    <tr key={produto.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-medium text-slate-500">#{produto.id}</td>
                      <td className="max-w-md px-5 py-4"><p className="font-semibold text-slate-900">{produto.nome}</p><p className="mt-1 truncate text-slate-500" title={produto.descricao}>{produto.descricao}</p></td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold">{moeda(produto.preco)}</td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${Number(produto.estoque) === 0 ? 'bg-red-100 text-red-700' : Number(produto.estoque) <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{produto.estoque} un.</span></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2"><button title="Editar produto" aria-label={`Editar ${produto.nome}`} onClick={() => abrirEdicao(produto)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"><HiPencilAlt className="h-5 w-5" /></button><button title="Excluir produto" aria-label={`Excluir ${produto.nome}`} onClick={() => excluirProduto(produto)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"><HiTrash className="h-5 w-5" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>{produtosFiltrados.length === 0 ? '0 produtos' : `${(paginaAtual - 1) * ITENS_POR_PAGINA + 1}–${Math.min(paginaAtual * ITENS_POR_PAGINA, produtosFiltrados.length)} de ${produtosFiltrados.length} produtos`}</p>
            <div className="flex items-center gap-2"><button disabled={paginaAtual <= 1} onClick={() => setPagina((p) => Math.max(1, p - 1))} className="rounded-lg border border-slate-200 px-3 py-2 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button><span className="px-2">Página {paginaAtual} de {totalPaginas}</span><button disabled={paginaAtual >= totalPaginas} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} className="rounded-lg border border-slate-200 px-3 py-2 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Próxima</button></div>
          </div>
        </section>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !salvando) setModalAberto(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-form-produto" className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h2 id="titulo-form-produto" className="text-xl font-bold">{produtoEditando ? 'Editar produto' : 'Cadastrar produto'}</h2><p className="mt-1 text-sm text-slate-500">Preencha os dados solicitados pela API.</p></div><button aria-label="Fechar formulário" disabled={salvando} onClick={() => setModalAberto(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><HiX className="h-5 w-5" /></button></div>
            <form onSubmit={salvarProduto} className="space-y-4 p-6">
              {erro && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</div>}
              <div><label htmlFor="nome" className="mb-1.5 block text-sm font-semibold">Nome</label><input id="nome" name="nome" required minLength={3} maxLength={100} value={formulario.nome} onChange={alterarCampo} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" /></div>
              <div><label htmlFor="descricao" className="mb-1.5 block text-sm font-semibold">Descrição</label><textarea id="descricao" name="descricao" required minLength={5} maxLength={255} rows={3} value={formulario.descricao} onChange={alterarCampo} className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" /></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="preco" className="mb-1.5 block text-sm font-semibold">Preço (R$)</label><input id="preco" name="preco" type="number" required min="0.01" step="0.01" value={formulario.preco} onChange={alterarCampo} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" /></div><div><label htmlFor="estoque" className="mb-1.5 block text-sm font-semibold">Estoque (unidades)</label><input id="estoque" name="estoque" type="number" required min="0" step="1" value={formulario.estoque} onChange={alterarCampo} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" /></div></div>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" disabled={salvando} onClick={() => setModalAberto(false)} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button><button type="submit" disabled={salvando} className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{salvando ? 'Salvando...' : produtoEditando ? 'Salvar alterações' : 'Cadastrar produto'}</button></div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
