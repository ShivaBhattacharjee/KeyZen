#include <iostream>
#include <string>

class Animal {
public:
    Animal(std::string name) : name_(std::move(name)) {}
    virtual ~Animal() = default;
    virtual std::string speak() const = 0;
    const std::string& name() const { return name_; }

private:
    std::string name_;
};

class Dog : public Animal {
public:
    Dog(std::string name, std::string breed)
        : Animal(std::move(name)), breed_(std::move(breed)) {}

    std::string speak() const override {
        return name() + " barks!";
    }

private:
    std::string breed_;
};

int main() {
    Dog dog("Rex", "Shepherd");
    std::cout << dog.speak() << "\n";
    return 0;
}
