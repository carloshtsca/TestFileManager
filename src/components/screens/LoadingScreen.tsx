import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/authStore";
import { Box } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LoadingScreenProps {
    isAuth?: boolean;
};

export default function LoadingScreen({ isAuth }: LoadingScreenProps) {
    const navigate = useNavigate();

    const { user, getUser } = useAuthStore();
    const [progress, setProgress] = useState(0);

    const fetchData = async () => {
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => (prev < 100 ? prev + 1 : prev));
        }, 20); // A cada 20ms aumenta 1

        try {
            const response = await getUser();

            clearInterval(interval);
            setProgress(100);

            toast.success(response.message);

            if (isAuth) {
                const isAdmin = response.data?.roles.includes("ADMIN");
                if (isAdmin) {
                    return navigate('/admin/dashboard');
                } else {
                    return navigate('/');
                }
            }
        } catch (err: any) {
            clearInterval(interval);
            setProgress(90);
            if (err.message === 'Server unavailable. Check your connection.') {
                toast.warning(err.message);
            } else if (err.status == 401) {
                toast.warning(err.message);
            } else {
                toast.error(err.message);
            }
        }
    };

    useEffect(() => {
        if (!user) fetchData();
    }, []);

    return (
        <div className='h-screen w-full flex flex-col items-center justify-center gap-4'>
            <div className='w-60 flex flex-col items-center justify-center gap-4'>
                <Box className='text-primary size-8 animate-pulse' />
                <span className='text-sm font-semibold'>Loading {progress}%</span>
                <Progress value={progress} className='h-1' />
            </div>
        </div>
    );
};
