class ThreadsDemo {
    public static void main(String[] args) throws InterruptedException {
        Runnable worker = () -> {
            for (int i = 1; i <= 3; i++) {
                System.out.println("Typing tick " + i);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        };

        Thread thread = new Thread(worker);
        thread.start();
        thread.join();

        System.out.println("Session complete");
    }
}
