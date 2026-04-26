interface Bird { type: "bird"; flyingSpeed: number; }
interface Horse { type: "horse"; runningSpeed: number; }

type Animal = Bird | Horse;

function getSpeed(animal: Animal): number {
    if (animal.type === "bird") {
        return animal.flyingSpeed;
    }
    if (animal.type === "horse") {
        return animal.runningSpeed;
    }
    const _exhaustiveCheck: never = animal;
    return _exhaustiveCheck;
}

function isBird(animal: Animal): animal is Bird {
    return animal.type === "bird";
}

const myPet: Animal = { type: "bird", flyingSpeed: 50 };

if (isBird(myPet)) {
    console.log(`Speed: ${myPet.flyingSpeed}`);
}

