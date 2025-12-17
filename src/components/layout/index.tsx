import { Outlet } from "react-router-dom";
import Menu from "./Menu";

export default function MainLayout() {
    return (
        <div className='h-screen w-full flex'>
            <Menu />
            <div className='flex flex-1 w-full h-full'>
                <Outlet />
            </div>
        </div>
    );
};
