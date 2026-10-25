
import { useState } from "react";
import { login } from "../services/api";

function LoginScreen({ onLogin }) {
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const resposta = await login(cpf, senha);
            onLogin(resposta);
        } catch (error) {
            setErro(error.message || "Não foi possível fazer login.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#fffdf9] p-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <img
                        src="/logo.png"
                        alt="Logo Pronte"
                        className="mx-auto mb-6 h-auto w-52 object-contain"
                    />

                    <h1 className="text-2xl font-bold text-[#0E1F39]">
                        Bem-vindo ao PRONTE
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Entre com seus dados para continuar
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label
                            htmlFor="cpf"
                            className="mb-2 block text-sm font-semibold text-[#0E1F39]"
                        >
                            CPF
                        </label>

                        <input
                            id="cpf"
                            type="text"
                            inputMode="numeric"
                            autoComplete="username"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="Digite seu CPF"
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="senha"
                            className="mb-2 block text-sm font-semibold text-[#0E1F39]"
                        >
                            Senha
                        </label>

                        <input
                            id="senha"
                            type="password"
                            autoComplete="current-password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#ff5a16] focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    {erro && (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {erro}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full rounded-xl bg-[#ff5a16] px-4 py-3 font-semibold text-white transition hover:bg-[#e94b0c] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginScreen;
