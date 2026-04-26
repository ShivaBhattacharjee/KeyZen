class ScoreUtils {
    static int addPoints(int current, int delta) {
        return current + delta;
    }

    static int addPoints(int current, int delta, int bonus) {
        return current + delta + bonus;
    }

    static double wpm(double words, double minutes) {
        if (minutes == 0.0) return 0.0;
        return words / minutes;
    }

    public static void main(String[] args) {
        int score = addPoints(20, 10);
        score = addPoints(score, 5, 2);
        System.out.println("Score: " + score);
        System.out.println("WPM: " + wpm(72, 2));
    }
}
