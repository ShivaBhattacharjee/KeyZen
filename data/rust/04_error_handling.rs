use std::fs;
use std::num::ParseIntError;

#[derive(Debug)]
enum AppError {
    Io(std::io::Error),
    Parse(ParseIntError),
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e)
    }
}

impl From<ParseIntError> for AppError {
    fn from(e: ParseIntError) -> Self {
        AppError::Parse(e)
    }
}

fn read_number(path: &str) -> Result<i32, AppError> {
    let content = fs::read_to_string(path)?;
    let n = content.trim().parse::<i32>()?;
    Ok(n)
}

fn main() {
    match read_number("number.txt") {
        Ok(n) => println!("got: {}", n),
        Err(e) => println!("error: {:?}", e),
    }
}
