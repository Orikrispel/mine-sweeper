'use strict'
// Model: 
const MINE = '<img style="width: 15px;" src="img/mine.png">'
const NORMAL = '<img style="width: 40px;" src="img/normal.png">'
const LOSE = '<img style="width: 40px;" src="img/lose.png">'
const WIN = '<img style="width: 40px;" src="img/win.png">'


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
    gGame.shownCount++
    console.log('gGame shownCount:', gGame.shownCount)
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (!elCell.classList.contains('hide')) return
    if (elCell.classList.contains('marked')) return
    // 2. Clicking a safe cell reveals the minesAroundCount of this cell
    if (gGame.firstClick.i === null) {
        gGame.firstClick.i = i
        gGame.firstClick.j = j
        buildBoard()
    }

    var currCell = gBoard[i][j]
    if (currCell.isMine) {
        elCell.style.background = 'lightcoral'
        GameOver()
    }
    if (currCell.minesAroundCount >= 0) {
        expandShown(gBoard, i, j)
    }
    checkGameOver()
}

function onCellMarked(elCell, i, j, ev) {
    if (!gGame.isOn) return
    ev.preventDefault()
    gGame.markedCount += (!gBoard[i][j].isMarked) ? 1 : -1
    elCell.classList.toggle('marked')
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    checkGameOver()
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
                if (!board[n][k].isShown) expandShown(board, n, k)
            }
        }
    }
    renderCell(board, i, j)
}

function checkGameOver() {
    if (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES) &&
        gGame.markedCount === gLevel.MINES) {
        const elBtn = document.querySelector('.play-again')
        elBtn.innerHTML = WIN
        gGame.isOn = false
    }
    return
}

function GameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.classList.remove('hide')
                renderCell(gBoard, i, j)
            }
        }
    }
    const elBtn = document.querySelector('.play-again')
    elBtn.innerHTML = LOSE
    gGame.isOn = false
}
