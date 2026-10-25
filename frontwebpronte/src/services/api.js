const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export function salvarToken(token) {
  sessionStorage.setItem('pronte_token', token);
}

export function obterToken() {
  return sessionStorage.getItem('pronte_token');
}

export function limparToken() {
  sessionStorage.removeItem('pronte_token');
  sessionStorage.removeItem('pronte_usuario');
}

export function salvarUsuario(usuario) {
  if (usuario) sessionStorage.setItem('pronte_usuario', JSON.stringify(usuario));
}

export function obterUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem('pronte_usuario') || 'null');
  } catch {
    return null;
  }
}

export const SESSAO_EXPIRADA = 'pronte:sessao-expirada';


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
        const tinhaSessao = Boolean(obterToken());
        limparToken();
        if (tinhaSessao) {
            window.dispatchEvent(new Event(SESSAO_EXPIRADA));
            throw new Error("Sua sessão expirou. Faça login novamente.");
        }
        let mensagem = "Você não está autenticado. Faça login novamente.";
        try {
            const corpo = await resposta.json();
            if (corpo?.mensagem) mensagem = corpo.mensagem;
        } catch {
            // resposta sem corpo JSON
        }
        throw new Error(mensagem);
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
  salvarUsuario(resposta.funcionario);
  return resposta;
}

export const authApi = {
    usuarioLogado: () => requisicao('/auth/me'),
};

// assistente de IA
export const assistenteApi = {
    perguntar: (pergunta) => requisicao('/assistente/pergunta', {
        method: 'POST',
        body: JSON.stringify({ pergunta }),
    }),
};

// produto
export const produtosApi = {
  listar: () => requisicao('/produto'),
  buscarPorId: (id) => requisicao(`/produto/${id}`),
  criar: (produto) => requisicao('/produto', { method: 'POST', body: JSON.stringify(produto) }),
  atualizar: (id, produto) => requisicao(`/produto/${id}`, { method: 'PUT', body: JSON.stringify(produto) }),
  excluir: (id) => requisicao(`/produto/${id}`, { method: 'DELETE' }),
};

//cliente
export const clientesApi = {
    listar: () => requisicao('/cliente'),
    buscarPorId: (id) => requisicao(`/cliente/${id}`),
    criar: (cliente) => requisicao('/cliente', { method: 'POST', body: JSON.stringify(cliente), }),
    atualizar: (id, cliente) => requisicao(`/cliente/${id}`, { method: 'PUT', body: JSON.stringify(cliente), }),
    excluir: (id) => requisicao(`/cliente/${id}`, { method: 'DELETE', }),
    listarVendas: (id) => requisicao(`/cliente/${id}/vendas`),
};

// funcionário
export const funcionariosApi = {
    listar: () => requisicao('/funcionario'),
    buscarPorId: (id) => requisicao(`/funcionario/${id}`),
    criar: (funcionario) => requisicao('/funcionario', {
        method: 'POST',
        body: JSON.stringify(funcionario),
    }),
    atualizar: (id, funcionario) => requisicao(`/funcionario/${id}`, {
        method: 'PUT',
        body: JSON.stringify(funcionario),
    }),
    excluir: (id) => requisicao(`/funcionario/${id}`, {
        method: 'DELETE',
    }),
    listarVendas: (id) => requisicao(`/funcionario/${id}/vendas`),
};

// vendas
export const vendasApi = {
    listar: () => requisicao('/venda'),
    buscarPorId: (id) => requisicao(`/venda/${id}`),
    criar: (venda) => requisicao('/venda', {
        method: 'POST',
        body: JSON.stringify(venda),
    }),
};