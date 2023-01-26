'use strict'

function createSquareMat(ROWS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < ROWS; j++) {
            row.push({
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            })
        }
        mat.push(row)
    }
    return mat
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function startTimer() {
    seconds++;
    var display = seconds.toString().padStart(3, '0');
    document.querySelector('.timer').innerText = display
}