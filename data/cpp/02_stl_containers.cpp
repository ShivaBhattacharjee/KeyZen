#include <iostream>
#include <vector>
#include <map>
#include <set>
#include <algorithm>

int main() {
    std::map<std::string, int> scores = {
        {"alice", 92},
        {"bob",   85},
        {"eve",   97}
    };

    for (const auto& [name, score] : scores) {
        if (score >= 90) {
            std::cout << name << " passed\n";
        }
    }

    std::vector<int> nums = {3, 1, 4, 1, 5, 9, 2, 6};
    std::sort(nums.begin(), nums.end());

    std::set<int> unique(nums.begin(), nums.end());
    for (int n : unique) {
        std::cout << n << " ";
    }
    std::cout << "\n";
    return 0;
}
