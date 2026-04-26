#include <iostream>
#include <string>
#include <utility>

class Buffer {
public:
    explicit Buffer(size_t size)
        : data_(new char[size]), size_(size) {
        std::cout << "alloc " << size << "\n";
    }

    ~Buffer() {
        delete[] data_;
        std::cout << "free\n";
    }

    Buffer(Buffer&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;
        other.size_ = 0;
        std::cout << "move\n";
    }

    Buffer(const Buffer&) = delete;
    Buffer& operator=(const Buffer&) = delete;

private:
    char* data_;
    size_t size_;
};

int main() {
    Buffer a(1024);
    Buffer b = std::move(a);
    return 0;
}
