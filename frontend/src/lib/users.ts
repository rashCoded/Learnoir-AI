// This is a simple in-memory store for the MVP.
// In a real application, this would be replaced by a database client (e.g., Prisma, Mongoose).

export const users: any[] = [];

export const addUser = (user: any) => {
    users.push(user);
};

export const findUserByEmail = (email: string) => {
    return users.find(u => u.email === email);
};
