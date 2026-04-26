#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::string name = "KeyZen";
    int score = 0;

    for (int i = 0; i < 3; i++) {
        score += 10;
        std::cout << "round " << i + 1 << ": score = " << score << "\n";
    }

    std::vector<int> nums = {3, 1, 4, 1, 5, 9};
    std::sort(nums.begin(), nums.end());

    for (int n : nums) {
        std::cout << n << " ";
    }
    std::cout << "\n";
    std::cout << "Hello from " << name << "!\n";
    return 0;
}
