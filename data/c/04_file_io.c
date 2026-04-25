#include <stdio.h>
#include <stdlib.h>

int write_file(const char *path, const char *content) {
    FILE *f = fopen(path, "w");
    if (!f) return -1;
    fputs(content, f);
    fclose(f);
    return 0;
}

char *read_file(const char *path) {
    FILE *f = fopen(path, "r");
    if (!f) return NULL;
    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    rewind(f);
    char *buf = malloc(size + 1);
    fread(buf, 1, size, f);
    buf[size] = '\0';
    fclose(f);
    return buf;
}

int main() {
    write_file("out.txt", "hello keyzen\n");
    char *content = read_file("out.txt");
    if (content) {
        printf("%s", content);
        free(content);
    }
    return 0;
}
