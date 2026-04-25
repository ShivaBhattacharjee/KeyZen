#include <stdio.h>
#include <stdlib.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int *make_array(int len, int fill) {
    int *arr = malloc(len * sizeof(int));
    for (int i = 0; i < len; i++) {
        arr[i] = fill;
    }
    return arr;
}

int main() {
    int x = 10, y = 20;
    printf("before: x=%d y=%d\n", x, y);
    swap(&x, &y);
    printf("after:  x=%d y=%d\n", x, y);

    int *arr = make_array(5, 7);
    for (int i = 0; i < 5; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
    free(arr);
    return 0;
}
