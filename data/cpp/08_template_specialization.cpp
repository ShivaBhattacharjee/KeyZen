#include <iostream>
#include <string>
#include <type_traits>

template <typename T> struct TypeName {
  static const char *get() { return "unknown"; }
};

template <> struct TypeName<int> {
  static const char *get() { return "int"; }
};

template <> struct TypeName<double> {
  static const char *get() { return "double"; }
};

template <> struct TypeName<std::string> {
  static const char *get() { return "string"; }
};

template <typename T> void printType(const T &val) {
  std::cout << TypeName<T>::get() << ": " << val << "\n";
}

template <typename T> T add(T a, T b) {
  if constexpr (std::is_integral<T>::value) {
    std::cout << "integer add\n";
  } else {
    std::cout << "float add\n";
  }
  return a + b;
}

int main() {
  printType(42);
  printType(3.14);
  printType(std::string("hello"));
  std::cout << add(3, 4) << "\n";
  std::cout << add(1.5, 2.5) << "\n";
  return 0;
}
