import React from "react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './pronte.css';

// ex: import { IconName } from "react-icons/name";
import { HiShoppingCart, HiUserGroup, HiClipboardList, HiChartBar, HiCog } from "react-icons/hi";
import { LuPackageSearch } from "react-icons/lu";


//https://www.material-tailwind.com/docs/react/sidebar
//https://react.dev/learn/rendering-lists
const menuItems = [
    {
        label: "Frente de Caixa",
        icon: HiShoppingCart,
        active: true,
    },
    {
        label: "Produtos",
        icon: LuPackageSearch,
        /* icons de produto?
        import { MdOutlineInventory } from "react-icons/md"; 
        import { LuPackageSearch } from "react-icons/lu";*/
    },
    {
        label: "Clientes",
        icon: HiUserGroup,
    },
    {
        label: "Funcionários",
        icon: HiClipboardList,
    },
    {
        label: "Relatórios",
        icon: HiChartBar,
    },
    {
        label: "Configurações",
        icon: HiCog,
    },
];
//https://www.material-tailwind.com/docs/react/sidebar
function SidebarLogo() {
    return (
        <aside className="flex h-screen w-[270px] shrink-0 flex-col bg-[#0E1F39] px-[18px] py-4">

            <div className="mb-7 flex justify-center">
                <img src="/logo.png" alt="Logo Pronte" className="h-auto w-[235px] object-contain"/>
            </div>
            <nav className="flex flex-col gap-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <a key={item.label} href="#" className={`flex h-[54px] w-full items-center gap-4 rounded-[14px] px-4 text-white transition-all ${item.active ? "bg-[#ff5a16] hover:bg-[#ff6a2b]" : "hover:bg-white/10" }`}>
                            <Icon className="h-7 w-7 shrink-0" />
                            {/* whitespace-nowrap texto sem quebra*/}
                            <span className="whitespace-nowrap text-[17px] font-semibold">
                                {item.label}
                            </span>
                        </a>
                    );
                })}

            </nav>

        </aside>
    );
}

export default SidebarLogo;