class User {
    private final String name;
    private int bestWpm;

    User(String name, int bestWpm) {
        this.name = name;
        this.bestWpm = bestWpm;
    }

    void updateBest(int latestWpm) {
        if (latestWpm > bestWpm) bestWpm = latestWpm;
    }

    @Override
    public String toString() {
        return name + " (best: " + bestWpm + ")";
    }

    public static void main(String[] args) {
        User user = new User("Ava", 75);
        user.updateBest(82);
        System.out.println(user);
    }
}
