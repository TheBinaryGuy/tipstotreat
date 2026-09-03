export type SessionUser = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: 'admin' | 'user';
};
