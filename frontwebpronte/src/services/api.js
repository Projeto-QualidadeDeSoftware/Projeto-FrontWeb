const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export function salvarToken(token) {
  sessionStorage.setItem('pronte_token', token);
}

export function obterToken() {
  return sessionStorage.getItem('pronte_token');
}

export function limparToken() {
  sessionStorage.removeItem('pronte_token');
}


async function requisicao(caminho, opcoes = {}) {
    const token = obterToken();
    const headers = { ...(opcoes.headers || {}) };

    if (opcoes.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let resposta;

    try {
        resposta = await fetch(`${API_URL}${caminho}`, {
            ...opcoes,
            headers,
        });
    } catch {
        throw new Error(
            `Não foi possível conectar à API. Confira se o backend está rodando em ${API_URL}.`);
    }

    if (resposta.status === 401) {
        limparToken();
        throw new Error(
            "Sua sessão expirou ou você não está autenticado. Faça login novamente.");
    }
    const texto = await resposta.text();
    let dados = null;

    if (texto) {
        try {
            dados = JSON.parse(texto);
        } catch {
            dados = null;}
    }

    if (!resposta.ok) {
        let mensagem =
            dados?.mensagem ||
            dados?.message ||
            dados?.detail ||
            `Erro ${resposta.status} ao comunicar com a API.`;

        if (Array.isArray(dados?.errors)) {
            mensagem = dados.errors
                .map((erro) => erro.defaultMessage || erro.message || erro)
                .join(", ");
        }
        throw new Error(mensagem);
    }

    return dados;
}


export async function login(cpf, senha) {
  const resposta = await requisicao('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ cpf, senha }),
  });
  if (!resposta?.token) throw new Error('A API não retornou o token esperado no login.');
  salvarToken(resposta.token);
  return resposta;
}

export const produtosApi = {
  listar: () => requisicao('/produto'),
  buscarPorId: (id) => requisicao(`/produto/${id}`),
  criar: (produto) => requisicao('/produto', { method: 'POST', body: JSON.stringify(produto) }),
  atualizar: (id, produto) => requisicao(`/produto/${id}`, { method: 'PUT', body: JSON.stringify(produto) }),
  excluir: (id) => requisicao(`/produto/${id}`, { method: 'DELETE' }),
};
