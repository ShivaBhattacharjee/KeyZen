fn main() {
    let name = "KeyZen";
    let mut score: i32 = 0;

    for i in 0..3 {
        score += 10;
        println!("round {}: score = {}", i + 1, score);
    }

    let nums = vec![3, 1, 4, 1, 5, 9];
    let mut sorted = nums.clone();
    sorted.sort();
    println!("{:?}", sorted);

    println!("Hello from {}!", name);
}
