fn length(s: &str) -> usize {
    s.len()
}

fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        if b == b' ' {
            return &s[..i];
        }
    }
    s
}

fn main() {
    let s = String::from("hello world");
    let word = first_word(&s);
    println!("first word: {}", word);
    println!("length: {}", length(&s));

    let s2 = s.clone();
    println!("clone: {}", s2);
}
