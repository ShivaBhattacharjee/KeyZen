#include <iostream>
#include <memory>

struct Node {
    int value;
    std::shared_ptr<Node> next;

    explicit Node(int v) : value(v) {}
};

std::unique_ptr<int[]> make_array(int n, int fill) {
    auto arr = std::make_unique<int[]>(n);
    for (int i = 0; i < n; i++) arr[i] = fill;
    return arr;
}

int main() {
    auto head = std::make_shared<Node>(1);
    head->next = std::make_shared<Node>(2);
    head->next->next = std::make_shared<Node>(3);

    for (auto n = head; n; n = n->next) {
        std::cout << n->value << " ";
    }
    std::cout << "\n";

    auto arr = make_array(5, 7);
    for (int i = 0; i < 5; i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << "\n";
    return 0;
}
