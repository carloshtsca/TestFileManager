import { Box, Folders, Gauge, Heart, LayoutDashboard, Search, Settings2, Trash2, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Field, FieldDescription } from "../ui/field";
import Account from "./Account";

type MenuItemType = {
    icon: React.ReactNode;
    label?: string;
    url?: string;
    onClick: () => void;
};

export default function Menu() {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);

    const menuItems: MenuItemType[] = [
        { icon: <LayoutDashboard />, label: 'Admin Dashboard', url: '/admin/dashboard', onClick: () => navigate('/admin/dashboard') },
        { icon: <Users />, label: 'Users', url: '/admin/users', onClick: () => navigate('/admin/users') },
        { icon: <Gauge />, label: 'Dashboard', url: '/', onClick: () => navigate('/') },
        { icon: <Folders />, label: 'My Files', url: '/my_files', onClick: () => navigate('/my_files') },
        { icon: <Search />, label: 'Search', onClick: () => console.log('Abrir Modal Search') },
        { icon: <Heart />, label: 'Favorites', url: '/favorites', onClick: () => navigate('/favorites') },
        { icon: <Trash2 />, label: 'Trash', url: '/trash', onClick: () => navigate('/trash') },
        { icon: <Settings2 />, label: 'Settings', onClick: () => console.log('Abrir Drawer Settings') },
    ];

    const isAdmin = user?.roles.includes("ADMIN");

    return (
        <div className='w-18 h-full flex flex-col items-center justify-between border-r dark:bg-[#0D0D0D] bg-[#F5F5F5] px-2 py-3'>
            <div className='flex flex-col items-center gap-1'>
                <Link to={isAdmin ? '/admin/dashboard' : '/'} className='flex items-center justify-center px-3 py-2'><Box className='text-primary size-7' /></Link>

                {menuItems
                    .filter(item => {
                        if (!isAdmin && item.url?.startsWith("/admin")) {
                            return false;
                        }
                        return true;
                    })
                    .map((item, index) => (
                        <MenuItem key={index} icon={item.icon} url={item.url} onClick={item.onClick} />
                    ))
                }
            </div>

            <div className='flex flex-col items-center gap-2 px-2 py-1'>
                <Account />
            </div>
        </div>
    );
};

export const MenuItem = ({ icon, label, url, onClick }: MenuItemType) => {
    const location = useLocation();

    const isActive = url ? location.pathname === url : false;

    return (
        <div
            className={`flex flex-col items-center justify-center p-3 cursor-pointer size-11
                ${isActive ? 'text-primary' : 'dark:text-[#808080] text-dark'}
            `}
            onClick={onClick}
        >
            {icon}
        </div>
    );
};