function getRandomBetween5And15() {
  return Math.floor(Math.random() * (15 - 5 + 1)) + 5;
}

const wait = async (fonction) => {
    setTimeout(() => {
        fonction()
    }, getRandomBetween5And15 * 1000);
}

module.exports = wait