import React from "react";
import './pronte.css';

// ex: import { IconName } from "react-icons/name";
import { HiShoppingCart, HiUserGroup, HiClipboardList, HiChartBar, HiChatAlt2, HiLogout } from "react-icons/hi";
import { LuPackageSearch } from "react-icons/lu";


//https://www.material-tailwind.com/docs/react/sidebar
//https://react.dev/learn/rendering-lists
const menuItems = [
    { label: "Frente de Caixa", icon: HiShoppingCart, page: "caixa" },
    { label: "Produtos", icon: LuPackageSearch, page: "produtos"
        /* icons de produto?
        import { MdOutlineInventory } from "react-icons/md"; 
        import { LuPackageSearch } from "react-icons/lu";*/},
    { label: "Clientes", icon: HiUserGroup, page: "clientes" },
    { label: "Funcionários", icon: HiClipboardList, page: "funcionarios" },
    { label: "Vendas", icon: HiChartBar, page: "vendas" },
    { label: "Assistente IA", icon: HiChatAlt2, page: "assistente" },
];

//https://www.material-tailwind.com/docs/react/sidebar
function SidebarLogo({ activePage, onNavigate, usuario }) {
    return (
        <aside className="flex min-h-screen w-[270px] shrink-0 flex-col bg-[#0E1F39] px-[18px] py-4">
            <div className="mb-7 flex justify-center">
                <img
                    src="/logo.png"
                    alt="Logo Pronte"
                    className="h-auto w-[235px] object-contain"
                />
            </div>

            <nav className="flex flex-col gap-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const ativo = activePage === item.page;

                    return (
                        <button
                            key={item.page}
                            type="button"
                            onClick={() => onNavigate(item.page)}
                            className={`flex h-[54px] w-full items-center gap-4 rounded-[14px] px-4 text-left text-white transition-all ${ativo
                                    ? "bg-[#ff5a16] hover:bg-[#ff6a2b]"
                                : "hover:bg-white/10" }`} >
                            <Icon className="h-7 w-7 shrink-0" />
                            {/* whitespace-nowrap texto sem quebra*/}
                            <span className="whitespace-nowrap text-[17px] font-semibold">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto rounded-[14px] bg-white/5 p-4">
                <p className="truncate text-[15px] font-semibold text-white">
                    {usuario?.nome || "Operador"}
                </p>
                <p className="truncate text-sm text-white/60">
                    {usuario?.cargo || "Operador de caixa"}
                </p>
                <button
                    type="button"
                    onClick={() => onNavigate("sair")}
                    className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#ff8a57] transition hover:text-white"
                >
                    <HiLogout className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </aside>
    );
}

export default SidebarLogo;