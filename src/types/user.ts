export interface User {
    id: string;
    avatar: string | null;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    phone: string;
    country: string;
    roles: string[];
    storageLimit: number;
    storageUsed: number;
    isVerified: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}