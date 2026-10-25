import { useEffect, useState } from "react";
import SidebarLogo from "./components/Sidebar.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import ProdutosScreen from "./pages/ProdutosScreen.jsx";
import ClientesScreen from "./pages/ClientesScreen.jsx";
import FuncionariosScreen from "./pages/FuncionariosScreen.jsx";
import CaixaScreen from "./pages/CaixaScreen.jsx";
import VendasScreen from "./pages/VendasScreen.jsx";
import AssistenteScreen from "./pages/AssistenteScreen.jsx";
import AuditoriaScreen from "./pages/AuditoriaScreen.jsx";
import {
    authApi,
    limparToken,
    obterToken,
    obterUsuario,
    salvarUsuario,
    SESSAO_EXPIRADA,
} from "./services/api";

const TELAS = {
    caixa: CaixaScreen,
    produtos: ProdutosScreen,
    clientes: ClientesScreen,
    funcionarios: FuncionariosScreen,
    vendas: VendasScreen,
    assistente: AssistenteScreen,
    auditoria: AuditoriaScreen,
};

function App() {
    const [autenticado, setAutenticado] = useState(Boolean(obterToken()));
    const [usuario, setUsuario] = useState(obterUsuario());
    const [activePage, setActivePage] = useState("caixa");

    useEffect(() => {
        function sessaoExpirada() {
            setAutenticado(false);
            setUsuario(null);
        }
        window.addEventListener(SESSAO_EXPIRADA, sessaoExpirada);
        return () => window.removeEventListener(SESSAO_EXPIRADA, sessaoExpirada);
    }, []);

    useEffect(() => {
        if (autenticado && !usuario) {
            authApi
                .usuarioLogado()
                .then((dados) => {
                    salvarUsuario(dados);
                    setUsuario(dados);
                })
                .catch(() => {});
        }
    }, [autenticado, usuario]);

    function handleLogout() {
        limparToken();
        setUsuario(null);
        setAutenticado(false);
        setActivePage("caixa");
    }

    if (!autenticado) {
        return (
            <LoginScreen
                onLogin={(resposta) => {
                    setUsuario(resposta?.funcionario || null);
                    setAutenticado(true);
                }}
            />
        );
    }

    const Tela = TELAS[activePage] || CaixaScreen;

    return (
        <div className="flex min-h-screen w-full bg-[#fffdf9]">
            <SidebarLogo
                activePage={activePage}
                usuario={usuario}
                onNavigate={(pagina) => {
                    if (pagina === "sair") {
                        handleLogout();
                    } else {
                        setActivePage(pagina);
                    }
                }}
            />

            <main className="min-w-0 flex-1">
                <Tela />
            </main>
        </div>
    );
}

export default App;
