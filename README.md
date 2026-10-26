# FrontWebPronte

## Inicio Rápido

## Sobre o projeto

O FrontWebPronte é um projeto de desenvolvimento frontend web desenvolvido com React, Tailwind CSS e Vite. O projeto tem como objetivo a criação de uma aplicação web utilizando tecnologias modernas para construção de interfaces.

## Tecnologias utilizadas

- React
- Tailwind CSS
- Vite
- Node.js
- npm

## Requisitos

Para executar o projeto, é necessário ter o Node.js e o npm instalados.

Para verificar a instalação, execute:

```bash
node -v
npm -v
```

## Instalação

Clone o repositório:

```bash
git clone https://github.com/SEU-USUARIO/frontwebpronte.git
```

Acesse a pasta do projeto:

```bash
cd frontwebpronte
```

Instale as dependências:

```bash
npm install
```

## Execução

Para iniciar o servidor de desenvolvimento, execute:

```bash
npm run dev
```

Após a inicialização, acesse o endereço exibido no terminal. Geralmente:

http://localhost:5173/

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Compila o projeto para produção. |
| `npm run lint` | Analisa o código. |
| `npm run preview` | Executa uma prévia da versão compilada. |

## Estrutura do projeto

```text
frontwebpronte/
├── src/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

A estrutura pode variar de acordo com os arquivos existentes no projeto.

## Compilação para produção

Para gerar os arquivos de produção, execute:

```bash
npm run build
```

Os arquivos compilados serão gerados na pasta `dist`, caso a compilação seja concluída com sucesso.

## Execução pelo Visual Studio 2022

Abra a solução do projeto no Visual Studio 2022 e localize a pasta que contém o arquivo `package.json`.

No terminal integrado, execute:

```powershell
npm install
npm run dev
```

Depois, acesse no navegador o endereço informado pelo Vite.

A inicialização pelo botão de execução do Visual Studio depende da configuração do projeto JavaScript.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): em todo push e pull request para `main` e `dev`, roda `npm ci`, o lint e o `npm run build`. Se o código não compilar, o PR não pode ser mesclado.
- **CD** (`.github/workflows/cd.yml`): a cada alteração na `main`, gera o site apontando para a API de homologação e publica em `https://web-hml.20-151-6-104.sslip.io`; depois da aprovação de um integrante no environment `producao`, gera o site apontando para a API de produção e publica em `https://web.20-151-6-104.sslip.io`.

O endereço da API em cada ambiente vem da variable `API_URL` do environment do GitHub. Localmente, `npm run dev` usa o `.env` (`localhost`) e `npm run build` usa o `.env.production`.

## Licença

A licença do projeto ainda não foi definida.
