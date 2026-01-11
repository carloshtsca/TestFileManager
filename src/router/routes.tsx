import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

import MainLayout from '@/components/layout';
import ProtectedRoutes from '@/middlewares/ProtectedRoutes';
import PublicRoutes from '@/middlewares/PublicRoutes';

import LoginScreen from '@/components/screens/LoginScreen';
import MyFilesScreen from '@/components/screens/MyFilesScreen';
import NotFoundScreen from '@/components/screens/NotFoundScreen';
import RegisterScreen from '@/components/screens/RegisterScreen';

const MainRoutes = () => {
    const user = useAuthStore(state => state.user);

    const isAdmin = user?.roles.includes("ADMIN");

    return (
        <Routes>
            <Route path="/auth" element={<PublicRoutes />}>
                <Route index path="register" element={<RegisterScreen />} />
                <Route path="login" element={<LoginScreen />} />
                <Route path="*" element={<NotFoundScreen />} />
            </Route>

            <Route path="/" element={<ProtectedRoutes><MainLayout /></ProtectedRoutes>}>
                {isAdmin && (
                    <Route path="admin">
                        <Route index path="dashboard" element={<div>Admin Dashboard</div>} />
                        <Route path="users" element={<div>Admin Users</div>} />
                        <Route path="*" element={<NotFoundScreen />} />
                    </Route>
                )}

                <Route index element={<div>Dashboard</div>} />

                {/* <Route path="my_files" element={<MyFilesScreen />} /> */}

                <Route path="my_files">
                    <Route index element={<MyFilesScreen />} />
                    <Route path=":id" element={<MyFilesScreen />} />
                </Route>

                <Route path="favorites" element={<div>Favorites</div>} />
                <Route path="trash" element={<div>Trash</div>} />

                <Route path="*" element={<NotFoundScreen />} />
            </Route>

            <Route path="*" element={<NotFoundScreen />} />
        </Routes>
    );
};

export default MainRoutes;