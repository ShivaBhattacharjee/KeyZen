#include <stdio.h>

int main() {
    char name[] = "KeyZen";
    int score = 0;

    for (int i = 0; i < 3; i++) {
        score += 10;
        printf("round %d: score = %d\n", i + 1, score);
    }

    int nums[] = {3, 1, 4, 1, 5, 9};
    int len = sizeof(nums) / sizeof(nums[0]);

    for (int i = 0; i < len - 1; i++) {
        for (int j = 0; j < len - i - 1; j++) {
            if (nums[j] > nums[j + 1]) {
                int tmp = nums[j];
                nums[j] = nums[j + 1];
                nums[j + 1] = tmp;
            }
        }
    }

    printf("Hello from %s!\n", name);
    return 0;
}
