import { useState } from "react";
import SidebarLogo from "./components/Sidebar.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import ProdutosScreen from "./pages/ProdutosScreen.jsx";
import ClientesScreen from "./pages/ClientesScreen.jsx";
import FuncionariosScreen from "./pages/FuncionariosScreen.jsx";
import CaixaScreen from "./pages/CaixaScreen.jsx";
import { limparToken, obterToken } from "./services/api";

function App() {
    const [autenticado, setAutenticado] = useState(
        Boolean(obterToken())
    );

    const [activePage, setActivePage] = useState("produtos");

    function handleLogout() {
        limparToken();
        setAutenticado(false);
        setActivePage("produtos");
    }

    if (!autenticado) {
        return (
            <LoginScreen
                onLogin={() => setAutenticado(true)}
            />
        );
    }

    return (
        <div className="flex min-h-screen w-full bg-[#fffdf9]">
            <SidebarLogo
                activePage={activePage}
                onNavigate={(pagina) => {
                    if (pagina === "sair") {
                        handleLogout();
                    } else {
                        setActivePage(pagina);
                    }
                }}
            />

            <main className="min-w-0 flex-1">
                {activePage === "produtos" && <ProdutosScreen />}
                {activePage === "clientes" && <ClientesScreen />}
                {activePage === "funcionarios" && <FuncionariosScreen />}
                {activePage === "caixa" && <CaixaScreen />}

                {/* atualizar dps*/}
                {activePage !== "produtos" &&
                    activePage !== "clientes" &&
                    activePage !== "funcionarios" &&
                    activePage !== "caixa" && (
                        <div className="p-8">
                            <p className="">
                                Em desenvolvimento
                            </p>
                        </div>
                    )}
            </main>
        </div>
    );
}
export default App;


/*
import SidebarLogo from './components/Sidebar.jsx'
import ProdutosScreen from './pages/ProdutosScreen.jsx'

function App() {
    return (
        <div className="flex min-h-screen w-full bg-[#fffdf9]">
            <SidebarLogo />

            <main className="min-w-0 flex-1">
                <ProdutosScreen />
            </main>
        </div>
    )
}

export default App
*/