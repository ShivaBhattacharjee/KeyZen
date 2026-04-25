abstract class Shape {
    abstract area(): number;

    describe(): string {
        return `Area: ${this.area().toFixed(2)}`;
    }
}

class Circle extends Shape {
    constructor(private radius: number) {
        super();
    }

    area(): number {
        return Math.PI * this.radius ** 2;
    }
}

class Rectangle extends Shape {
    constructor(private w: number, private h: number) {
        super();
    }

    area(): number {
        return this.w * this.h;
    }
}

const shapes: Shape[] = [new Circle(5), new Rectangle(4, 6)];
shapes.forEach((s) => console.log(s.describe()));
