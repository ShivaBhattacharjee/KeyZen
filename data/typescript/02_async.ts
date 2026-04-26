async function fetchUser(id: number): Promise<{ name: string }> {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
}

async function fetchAll(ids: number[]) {
    const results = await Promise.allSettled(
        ids.map((id) => fetchUser(id))
    );
    for (const result of results) {
        if (result.status === "fulfilled") {
            console.log(result.value.name);
        } else {
            console.error(result.reason);
        }
    }
}

fetchAll([1, 2, 3]);
