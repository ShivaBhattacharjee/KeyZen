<?php
class User {
    public function __construct(
        private string $name,
        private int $score = 0
    ) {}

    public function addScore(int $pts): void {
        $this->score += $pts;
    }

    public function getSummary(): string {
        return "{$this->name}: {$this->score}";
    }
}

$u = new User("Ava");
$u->addScore(42);
echo $u->getSummary();
?>
