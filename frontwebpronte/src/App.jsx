import { useState } from "react";
import SidebarLogo from "./components/Sidebar.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import ProdutosScreen from "./pages/ProdutosScreen.jsx";
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

                {activePage !== "produtos" && (
                    <div className="p-8">
                        <h1 className="text-2xl font-bold text-[#0E1F39]">
                            {activePage === "caixa" && "Frente de Caixa"}
                            {activePage === "clientes" && "Clientes"}
                            {activePage === "funcionarios" && "Funcionários"}
                            {activePage === "relatorios" && "Relatórios"}
                            {activePage === "configuracoes" && "Configurações"}
                        </h1>

                        <p className="mt-2 text-gray-500">
                            (Placeholder)
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