'use strict'
// images
const MINE = '<img style="width: 15px;" src="img/mine.png">'
const NORMAL = '<img style="width: 40px;" src="img/normal.png">'
const LOSE = '<img style="width: 40px;" src="img/lose.png">'
const WIN = '<img style="width: 40px;" src="img/win.png">'
// sounds:
const WINNING = new Audio("sounds/winning.wav")
WINNING.volume = 0.5
const LOOSING = new Audio("sounds/loosing.mp3")
LOOSING.volume = 0.5;
const EXPLOSION = new Audio("sounds/explosion.wav")
EXPLOSION.volume = 0.05;
const HINTSOUND = new Audio("sounds/light.wav")
HINTSOUND.volume = 0.5;

// Model: 
var gIntervalTimer
var seconds
var livesCount
var gBoard
var gLevel = {
    SIZE: 8,
    MINES: 14
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    firstClick: {
        i: null,
        j: null
    }
}


function onInit() {
    seconds = 0
    livesCount = 3
    safeClickLeft = 3
    clearInterval(gIntervalTimer)
    hideSafeButton()
    document.querySelector('.timer').innerText = '000'
    var MinesCounter = gLevel.MINES.toString().padStart(3, '0');
    document.querySelector('.mines-counter').innerText = MinesCounter
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.isOn = true
    gGame.firstClick.i = gGame.firstClick.j = null

    // 1. Create a 4x4 gBoard Matrix containing Objects.
    gBoard = createSquareMat(gLevel.SIZE)
    renderBoard(gBoard)
    // 2. Set 2 of them to be mines
    // 3. Present the mines using renderBoard() function.
}

function buildBoard() {
    addMines()
    var size = gLevel.SIZE
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (!(gBoard[i][j].isMine))
                gBoard[i][j].minesAroundCount = setMinesNegsCount(i, j, gBoard)
        }
    }
}

function addMines() {
    for (var i = 0; i < gLevel.MINES; i++) {
        var minePos = {
            i: getRandomInt(0, gLevel.SIZE),
            j: getRandomInt(0, gLevel.SIZE)
        }

        // Check first click or already a mine
        if (minePos.i === gGame.firstClick.i &&
            minePos.j === gGame.firstClick.j ||
            gBoard[minePos.i][minePos.j].isMine) {
            i--
            continue
        }
        gBoard[minePos.i][minePos.j] = {
            minesAroundCount: -1,
            isShown: false,
            isMine: true,
            isMarked: false
        }
    }
}

function setMinesNegsCount(cellI, cellJ, board) {
    // Check if this is mine
    if (board[cellI][cellJ].isMine) return

    var minesCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) minesCount++
        }
    }
    return minesCount
}

function renderBoard(board) {
    const elBtn = document.querySelector('.play-again')
    elBtn.innerHTML = NORMAL
    var strHTML = '<table><tbody>'
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            strHTML += `<td onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j}, event)"`
            const cell = board[i][j]
            const className = `cell cell-${i}-${j} hide`
            if (cell.minesAroundCount === 0) strHTML += ` class="${className}"></td>`
            else strHTML += (cell.isMine) ? ` class="${className}">${MINE}</td>` : ` class="${className}">${cell.minesAroundCount}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
    // update hints and lives
    renderLivesHints()
}

function chooseColor(minesCount) {
    var color
    switch (minesCount) {
        case 1: color = '#4B87EC'
            return color
        case 2: color = '#ECB366'
            return color
        case 3: color = '#04C988'
            return color
        case 4: color = '#950202'
            return color
        case 5: color = '#10054D'
            return color
        case 6: color = '#430617'
            return color
        case 7: color = '#CD7239'
            return color
        case 8: color = '#171717'
            return color
    }
}

function renderCell(board, i, j) {
    const cell = board[i][j]
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    var className = (cell.isMarked) ? 'marked' : ''
    if (cell.isShown && elCell.classList.contains('hide')) elCell.classList.toggle('hide')
    var innerText = (cell.isMine) ? MINE : cell.minesAroundCount
    innerText = (innerText === 0) ? '' : innerText
    elCell.classList += className
    elCell.innerHTML = innerText
    if (innerText >= 1) {
        const color = chooseColor(cell.minesAroundCount)
        elCell.style.color = `${color}`
    }
    if (!cell.isMine && !isHint) gGame.shownCount++
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (!elCell.classList.contains('hide')) return
    if (elCell.classList.contains('marked')) return
    if (gGame.firstClick.i === null) {
        gGame.firstClick.i = i
        gGame.firstClick.j = j
        buildBoard()
        showSafeButton()
        gIntervalTimer = setInterval(startTimer, 1000)
    }

    if (isHint) {
        showHintCells(gBoard, i, j)
        return
    }
    var currCell = gBoard[i][j]
    if (currCell.isMine) {
        document.querySelector(`.life-${livesCount}`).hidden = true
        livesCount--
        if (livesCount) EXPLOSION.play()
        elCell.style.background = '#FF6961'
        //model:
        gBoard[i][j].isShown = true
        //dom:
        renderCell(gBoard, i, j)
        var diff = gLevel.MINES - gGame.markedCount - (3 - livesCount)
        var MinesCounter = (diff >= 0) ? diff.toString().padStart(3, '0') : '-' + (Math.abs(diff)).toString().padStart(2, '0');
        document.querySelector('.mines-counter').innerText = MinesCounter
        checkgameOver()
    }
    if (currCell.minesAroundCount >= 0) {
        expandShown(gBoard, i, j)
    }
    checkgameOver()
}

function onCellMarked(elCell, i, j, ev) {
    if (!gGame.isOn) return
    if (!elCell.classList.contains('hide')) return
    ev.preventDefault()
    gGame.markedCount += (!gBoard[i][j].isMarked) ? 1 : -1
    elCell.classList.toggle('marked')
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    // Update mines counter
    var diff = gLevel.MINES - (3 - livesCount) - gGame.markedCount
    var MinesCounter = (diff >= 0) ? diff.toString().padStart(3, '0') : '-' + (Math.abs(diff)).toString().padStart(2, '0');
    document.querySelector('.mines-counter').innerText = MinesCounter
    checkgameOver()
}

function expandShown(board, i, j) {
    var currCell = board[i][j]
    currCell.isShown = true
    if (currCell.minesAroundCount === 0) {
        for (var n = i - 1; n <= i + 1; n++) {
            if (n < 0 || n >= board.length) continue
            for (var k = j - 1; k <= j + 1; k++) {
                if (k < 0 || k >= board[n].length) continue
                if (n === i && k === j) continue
                const cell = board[n][k]
                if (!cell.isShown && !cell.isMarked) expandShown(board, n, k)
            }
        }
    }
    renderCell(board, i, j)
}

function checkgameOver() {
    var notMines = (gLevel.SIZE ** 2 - gLevel.MINES)
    var currFlags = gGame.markedCount + (3 - livesCount)
    if (gGame.shownCount === notMines &&
        gLevel.MINES === currFlags) {
        victory()
    }

    if (livesCount === 0) {
        gameOver()
    }
    return
}

function gameOver() {
    LOOSING.play()
    // Show all mines on board and hide flags
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.classList.remove('hide')
                elCell.classList.remove('marked')
                renderCell(gBoard, i, j)
            }
        }
    }
    const elBtn = document.querySelector('.play-again')
    elBtn.innerHTML = LOSE
    clearInterval(gIntervalTimer)
    gGame.isOn = false
}

function victory() {
    WINNING.play()
    const elBtn = document.querySelector('.play-again')
    elBtn.innerHTML = WIN
    clearInterval(gIntervalTimer)
    gGame.isOn = false
}

