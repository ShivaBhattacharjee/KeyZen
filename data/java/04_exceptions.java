class InvalidDurationException extends Exception {
    InvalidDurationException(String message) {
        super(message);
    }
}

class ExceptionsDemo {
    static double calculateWpm(int words, int seconds) throws InvalidDurationException {
        if (seconds <= 0) {
            throw new InvalidDurationException("seconds must be greater than 0");
        }
        return (words * 60.0) / seconds;
    }

    public static void main(String[] args) {
        try {
            System.out.println(calculateWpm(48, 30));
            System.out.println(calculateWpm(48, 0));
        } catch (InvalidDurationException e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
