function getRandomBetween5And15() {
  return Math.floor(Math.random() * (15 - 5 + 1)) + 5;
}

export const wait = async (fonction) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(fonction());
        }, getRandomBetween5And15() * 1000);
    });
}