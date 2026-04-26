type Status = "pending" | "processing" | "completed" | "failed";

interface Order {
    id: string;
    status: Status;
    total: number;
}

function updateOrderStatus(order: Order, newStatus: Status): Order {
    console.log(`Order ${order.id} moving from ${order.status} to ${newStatus}`);
    return {
        ...order,
        status: newStatus
    };
}

const myOrder: Order = {
    id: "ORD-93021",
    status: "pending",
    total: 150.50
};

const updatedOrder = updateOrderStatus(myOrder, "processing");
console.log(`Current state: ${updatedOrder.status}`);
