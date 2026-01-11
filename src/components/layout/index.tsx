import { Outlet } from "react-router-dom";
import Menu from "./Menu";
import { DialogProvider } from "@/context/DIalogProvider";
import { Spinner } from "@/components/ui/spinner";
import { useTreeStore } from "@/store/treeStore";

export default function MainLayout() {
    const { status } = useTreeStore();

    return (
        <DialogProvider>
            <div className='relative h-screen w-full flex'>
                <Menu />
                <div className='flex flex-1 w-full h-full'>
                    <Outlet />
                </div>

                {status.blocking.loading &&
                    <div className='absolute top-0 left-0 w-screen h-screen flex flex-col items-center justify-center gap-1 bg-black/50 text-sm font-mono'>
                        <Spinner />
                        Loading
                    </div>
                }
            </div>
        </DialogProvider>
    );
};
