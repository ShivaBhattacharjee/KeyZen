type User = {
    id: number;
    name: string;
    email: string;
    active?: boolean;
};

interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

function getUser(id: number): User {
    return { id, name: "Alice", email: "alice@example.com", active: true };
}

const res: ApiResponse<User> = {
    data: getUser(1),
    status: 200,
    message: "ok",
};

console.log(res.data.name);
