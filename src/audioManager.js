const tableaux_sons = [
    ['src/sounds/success.mp3', 'src/sounds/warning.mp3'], // <=5 erreurs
    ['src/sounds/success2.mp3', 'src/sounds/warning2.mp3'], // <=10 erreurs
    ['src/sounds/success3.mp3', 'src/sounds/warning3.mp3'], // <=50 erreurs
    ['src/sounds/success4.mp3', 'src/sounds/warning4.mp3'] // <=100 erreurs
]

/**
 * Return a random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Play a sound based on the number of errors.
 * @param {number} nb_errors - The number of errors.
 */
export function playSound(nb_errors) {
    const audio = new Audio(tableaux_sons[nb_errors <= 5 ? 0 : nb_errors <= 10 ? 1 : nb_errors <= 50 ? 2 : 3][randomInt(0, tableaux_sons[nb_errors <= 5 ? 0 : nb_errors <= 10 ? 1 : nb_errors <= 50 ? 2 : 3].length - 1)]);
    audio.play();
}