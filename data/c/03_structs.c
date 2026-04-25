#include <stdio.h>
#include <string.h>

typedef struct {
    char name[64];
    int age;
    float score;
} Player;

Player make_player(const char *name, int age) {
    Player p;
    strncpy(p.name, name, sizeof(p.name) - 1);
    p.age = age;
    p.score = 0.0f;
    return p;
}

void add_score(Player *p, float pts) {
    p->score += pts;
}

void print_player(const Player *p) {
    printf("%s (age %d) score=%.1f\n", p->name, p->age, p->score);
}

int main() {
    Player p = make_player("Alice", 25);
    add_score(&p, 42.5f);
    add_score(&p, 17.0f);
    print_player(&p);
    return 0;
}
