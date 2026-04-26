function identity<T>(value: T): T {
    return value;
}

function first<T>(arr: T[]): T | undefined {
    return arr[0];
}

function merge<A, B>(a: A, b: B): A & B {
    return { ...a, ...b } as A & B;
}

const nums = [1, 2, 3];
console.log(first(nums));

const merged = merge({ name: "Alice" }, { age: 30 });
console.log(merged.name, merged.age);

type Nullable<T> = T | null;
const val: Nullable<string> = null;
console.log(val ?? "default");
