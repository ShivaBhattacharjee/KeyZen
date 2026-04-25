#include <stdio.h>

int clamp(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int sum(int *arr, int len) {
    int total = 0;
    for (int i = 0; i < len; i++) {
        total += arr[i];
    }
    return total;
}

int main() {
    printf("%d\n", clamp(15, 0, 10));
    printf("%d\n", factorial(6));

    int nums[] = {1, 2, 3, 4, 5};
    printf("sum = %d\n", sum(nums, 5));
    return 0;
}
