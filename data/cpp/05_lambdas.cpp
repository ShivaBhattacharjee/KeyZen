#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
    std::vector<int> nums = {3, 1, 4, 1, 5, 9, 2, 6};

    std::vector<int> evens;
    std::copy_if(nums.begin(), nums.end(),
                 std::back_inserter(evens),
                 [](int x) { return x % 2 == 0; });

    std::sort(evens.begin(), evens.end(),
              [](int a, int b) { return a > b; });

    int total = std::accumulate(evens.begin(), evens.end(), 0);

    for (int n : evens) std::cout << n << " ";
    std::cout << "\ntotal = " << total << "\n";

    int factor = 3;
    auto scale = [factor](int x) { return x * factor; };
    std::cout << scale(7) << "\n";
    return 0;
}
