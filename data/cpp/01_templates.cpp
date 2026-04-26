#include <iostream>
#include <vector>

template <typename T>
T clamp(T value, T lo, T hi) {
    if (value < lo) return lo;
    if (value > hi) return hi;
    return value;
}

template <typename T>
T sum(const std::vector<T>& v) {
    T total = T{};
    for (const auto& x : v) total += x;
    return total;
}

template <typename T, typename U>
struct Pair {
    T first;
    U second;
};

int main() {
    std::cout << clamp(15, 0, 10) << "\n";
    std::cout << clamp(3.7, 0.0, 5.0) << "\n";

    std::vector<int> nums = {1, 2, 3, 4, 5};
    std::cout << "sum = " << sum(nums) << "\n";

    Pair<std::string, int> p{"score", 42};
    std::cout << p.first << ": " << p.second << "\n";
    return 0;
}
