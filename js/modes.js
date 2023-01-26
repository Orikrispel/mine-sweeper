'use strict'
var isHint = false
var isDarkMode = false
var currHint
var safeClickLeft

const LIFE = 'img/life.png'
const HINT = 'img/hint.png'

function gameLevel(size, mines) {
  gLevel.SIZE = size
  gLevel.MINES = mines
  onInit()
}

function renderLivesHints() {
  var strLifeHTML = ''
  var strHintHTML = ''
  for (var j = 0; j < 3; j++) {
    strLifeHTML += `<img style="width: 20px;" class="life life-${j + 1}" src="${LIFE}">`
    strHintHTML += `<img style="width: 20px;" class="hint hint-${j + 1}" src="${HINT}" onclick="getHint(this)">`
  }
  const elLives = document.querySelector('.lives')
  const elHints = document.querySelector('.hints')
  elLives.innerHTML = strLifeHTML
  elHints.innerHTML = strHintHTML
}

function getHint(elHint) {
  if (elHint === currHint) {
    isHint = !isHint
    elHint.style.filter = 'drop-shadow(0 0 0 rgba(0,0,0,0))'
    currHint = null
    return
  }
  isHint = true
  elHint.style.filter = 'drop-shadow(0 0 4px rgba(255, 255, 0))'
  currHint = elHint
}

function showHintCells(board, i, j) {
  HINTSOUND.play()
  for (var n = i - 1; n <= i + 1; n++) {
    if (n < 0 || n >= board.length) continue
    for (var k = j - 1; k <= j + 1; k++) {
      if (k < 0 || k >= board[n].length) continue
      document.querySelector(`.cell-${n}-${k}`).classList.remove('hide')
      renderCell(board, n, k)
      currHint.hidden = true
    }
  }
  setTimeout(() => {
    for (var n = i - 1; n <= i + 1; n++) {
      if (n < 0 || n >= board.length) continue
      for (var k = j - 1; k <= j + 1; k++) {
        if (k < 0 || k >= board[n].length) continue
        const cell = gBoard[n][k]
        if (!cell.isShown) document.querySelector(`.cell-${n}-${k}`).classList.add('hide')
        renderCell(board, n, k)
      }
    }
    isHint = false
  },
    1000);
}

function toggleDarkMode(elBtn) {
  isDarkMode = !isDarkMode
  document.querySelector('body').classList.toggle('dark-mode')
  const src = (!isDarkMode) ? 'img/moon-light.png' : 'img/sun-dim-light.png'
  elBtn.innerHTML = `<img style=" width: 25px;" src="${src}">`
  const srcSafeBtn = (!isDarkMode) ? 'img/lifebuoy-dark.png' : 'img/lifebuoy-light.png'
  document.querySelector('.safe-btn').innerHTML = `<img style=" width: 25px;" src="${srcSafeBtn}">`

}

function showSafeCell(elBtn) {
  if (!safeClickLeft) return
  const size = gLevel.SIZE

  var randPos = {
    i: getRandomInt(0, size),
    j: getRandomInt(0, size)
  }
  var cell = gBoard[randPos.i][randPos.j]
  while (cell.isMarked || cell.isShown || cell.isMine) {
    randPos = {
      i: getRandomInt(0, size),
      j: getRandomInt(0, size)
    }
    cell = gBoard[randPos.i][randPos.j]
  }
  // console.log(`random cell-${randPos.i}-${randPos.j}`)
  const chosenCell = document.querySelector(`.cell-${randPos.i}-${randPos.j}`)
  console.log(chosenCell)
  chosenCell.classList.add('safe-cell')
  setTimeout(() => {
    chosenCell.classList.remove('safe-cell')
  }, 2000);
  // model:
  safeClickLeft--
  document.querySelector('.available-safe-clicks span').innerText = safeClickLeft
  // dom
}

function showSafeButton() {
  document.querySelector('.safe').hidden = false
  document.querySelector('.available-safe-clicks').hidden = false
  document.querySelector('.available-safe-clicks span').innerText = safeClickLeft
}
function hideSafeButton() {
  document.querySelector('.safe').hidden = true
  document.querySelector('.available-safe-clicks').hidden = true
}