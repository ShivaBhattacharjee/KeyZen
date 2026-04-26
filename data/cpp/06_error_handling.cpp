#include <iostream>
#include <fstream>
#include <stdexcept>
#include <string>

std::string read_file(const std::string& path) {
    std::ifstream f(path);
    if (!f) {
        throw std::runtime_error("cannot open: " + path);
    }
    return std::string(
        std::istreambuf_iterator<char>(f),
        std::istreambuf_iterator<char>()
    );
}

int safe_divide(int a, int b) {
    if (b == 0) {
        throw std::invalid_argument("division by zero");
    }
    return a / b;
}

int main() {
    try {
        std::cout << safe_divide(10, 2) << "\n";
        std::cout << safe_divide(10, 0) << "\n";
    } catch (const std::invalid_argument& e) {
        std::cerr << "error: " << e.what() << "\n";
    }
    return 0;
}
