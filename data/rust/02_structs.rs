struct User {
    name: String,
    email: String,
    score: u32,
}

impl User {
    fn new(name: &str, email: &str) -> Self {
        User {
            name: name.to_string(),
            email: email.to_string(),
            score: 0,
        }
    }

    fn add_score(&mut self, points: u32) {
        self.score += points;
    }

    fn summary(&self) -> String {
        format!("{} <{}> score={}", self.name, self.email, self.score)
    }
}

fn main() {
    let mut user = User::new("Alice", "alice@example.com");
    user.add_score(50);
    println!("{}", user.summary());
}
