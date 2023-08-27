var stop = false

class MinesWeeper {
    constructor (rows=10, columns=10, qtdMines=10) {
        this.rows = rows
        this.columns = columns
        this.qtdMines = qtdMines
        this.field = []
    }
    
    generateField() {
        if (this.field) {
            this.field = []
        }
        for (let iRow = 0; iRow < this.rows; iRow++) {
            this.field[iRow] = []
            for (let iCol = 0; iCol < this.columns; iCol++) {
                this.field[iRow][iCol] = 0
            }
        }
        this.generateMines()
    }

    generateMines() {
        for (let iMine = 0; iMine < this.qtdMines; iMine++) {
            let row = Math.floor(Math.random() * (this.rows-1))
            let col = Math.floor(Math.random() * (this.columns-1))
            if (this.field[row][col] == 0) {
                this.field[row][col]--
                this.checkNeighbors(row, col)
            } else {
                iMine--
            }
        }
    }

    checkNeighbors(row, col) {
        for (let workRow = row - 1; workRow <= row + 1; workRow++) {
            for (let workCol = col -1; workCol <= col + 1; workCol++) {
                if (workRow >= 0 && workRow < this.rows) {
                    if (workCol >= 0 && workCol < this.columns) {
                        if (this.field[workRow][workCol] >= 0) {
                            this.field[workRow][workCol]++
                        }
                    }
                }
            }
        }
    }
}

class GameInterface {
    constructor (gameAreaElement, level=1) {
        this.level = level
        this.minefield = new MinesWeeper()
        this.gameAreaElement = gameAreaElement
        this.listColor = ['green', 'blue', '#191970', 'orange', 'red', 'purple', 'pink', 'gray']
        this.started = false
        this.finalTime = '00:00:00'
        this.countWins = 10000
        this.numFlags = 10
    }

    setLevel(level=null) {
        this.level = level ? level : this.level
        
        let levelValue = this.level > 0 && this.level <= 3 ? ((this.level -1) * 5) + 10 : 10
        this.minefield.rows = levelValue
        this.minefield.columns = levelValue
        this.minefield.qtdMines = levelValue
        this.countWins = (levelValue * levelValue) - levelValue
        this.numFlags = levelValue
        
        this.gameAreaElement.classList.remove('lv1')
        this.gameAreaElement.classList.remove('lv2')
        this.gameAreaElement.classList.remove('lv3')
        
        this.minefield.generateField()
        if (level) {
            this.started = false
            this.finalTime = '00:00:00'
            this.countWins = 10000
            stop = true
            document.querySelector('#timer').innerHTML = '00:00:00'
            this.gameAreaElement.innerHTML = ''
            this.generateInterfaceField()
        }

        this.gameAreaElement.classList.add(`lv${this.level > 0 && this.level <= 3 ? this.level : 1}`)
        document.querySelector('.num-mines').querySelector('span').innerHTML = this.numFlags
    }

    generateInterfaceField() {
        const table = document.createElement('table')
        table.setAttribute('class', 'table-field')
        this.gameAreaElement.appendChild(table)

        this.minefield.field.forEach((rowField, indexRowField) => {
            const tr = document.createElement('tr')
            tr.setAttribute('data-row', `${indexRowField}`)
            table.appendChild(tr)
            rowField.forEach((itemValue, indexValue) => {
                const td = document.createElement('td')
                td.setAttribute('data-col', `${indexValue}`)
                tr.appendChild(td)

                const underground = document.createElement('div')
                underground.setAttribute('class', 'underground')
                if (itemValue > 0) {
                    underground.innerHTML = itemValue
                    underground.style.cssText = `color: ${this.listColor[itemValue-1]};`
                    
                } else if (itemValue < 0) {
                    underground.innerHTML = '<img src="/img/bomb.png" class="bomb"></img>'
                }
                
                td.appendChild(underground)

                const surface  = document.createElement('div')
                surface.setAttribute('class', 'surface')
                td.appendChild(surface)
            })
        })
    }

    setFlag(surfaceElement) {
        try {
            if (this.numFlags > 0) {
                if (surfaceElement.childElementCount <= 0) {
                    this.numFlags--
                    document.querySelector('.num-mines').querySelector('span').innerHTML = this.numFlags
                    surfaceElement.innerHTML = '<img src="/img/flag.png">'
                } else {
                    this.numFlags++
                    document.querySelector('.num-mines').querySelector('span').innerHTML = this.numFlags
                    surfaceElement.innerHTML = ''
                }
            }
        } catch {
            return false
        }
    }

    showUnderground(surfaceElement, row=null, col=null) {
        try {

            if (surfaceElement.childElementCount <= 0) {
                row = !row ? parseInt(surfaceElement.parentElement.parentElement.getAttribute('data-row')) : row
                col = !col ? parseInt(surfaceElement.parentElement.getAttribute('data-col')) : col
                
                if (this.minefield.field[row][col] == -1) {
                    this.gameOver(surfaceElement.parentElement)
                } else if (this.minefield.field[row][col] < 10) {
                
                    this.removeSurface(surfaceElement)
                    this.countWins--

                    if (this.countWins <= 0) {
                        this.winGame()
                    }
                    
                    if (this.minefield.field[row][col] == 0) {
                        this.minefield.field[row][col] = 10
                        
                        for (let workRow = row - 1; workRow <= row + 1; workRow++) {
                            for (let workCol = col -1; workCol <= col + 1; workCol++) {
                                if (workRow >= 0 && workRow < this.minefield.rows) {
                                    if (workCol >= 0 && workCol < this.minefield.columns) {
                                        if (this.minefield.field[workRow][workCol] >= 0) {
                                            const tr = this.gameAreaElement.querySelector(`tr[data-row="${workRow}"]`)
                                            const td = tr.querySelector(`td[data-col="${workCol}"]`)
                                            const newSurfaceElment = td.querySelector('.surface')                                   
                                            this.showUnderground(newSurfaceElment, workRow, workCol)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    this.minefield.field[row][col] = 10
                    return true
                    
                } 

                return false
            }
            return false

        } catch {
            return false
        }
    }

    removeSurface(surfaceElement) {
        surfaceElement.style.cssText = 'animation: to-dig 1s ease forwards;'
        setTimeout(function () {
            surfaceElement.style.cssText = 'display: none;'
        }, 800)
    }

    gameOver(td) {
        let underground = td.querySelector('.underground')
        underground.style.cssText = 'background-color: red !important;'
        let allSurfaces = document.querySelectorAll('.surface')
        allSurfaces.forEach(surface => this.removeSurface(surface))
        stop = true
        this.finalTime = document.querySelector('#timer').innerHTML
        let content = '<p class="go">Game Over!</p>'
        this.showModal(content)
    }

    startGame() {
        let sec = 0
        let min = 0
        let hr = 0
        const timer = setInterval(function(){
            if (hr == 23 && min == 59 && sec == 58) {
                hr = 0
                min = 0
                sec = 0
                clearInterval(timer)
            }
            if (min == 59) {
                hr = hr < 23 ? hr + 1 : 0
            }
            if (sec == 59) {
                min = min < 59 ? min + 1 : 0
            }
            sec = sec < 59 ? sec + 1 : 0
            if (!stop) {
                document.querySelector('#timer').innerText = `${hr < 10 ? '0'+hr : hr}:${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}`
            } else {
                clearInterval(timer)
            }
        }, 1000)
    }

    winGame() {
        stop = true
        this.finalTime = document.querySelector('#timer').innerHTML
        
        let currentTimeStr = this.finalTime.split(':')
        let currentTime = (parseInt(currentTimeStr[0]) * 60 *60) + (parseInt(currentTimeStr[1]) * 60) + parseInt(currentTimeStr[2])
        let recordStr = JSON.parse(this.loadRecord())
        if (recordStr) {
            if (recordStr.sec > currentTime) {
                this.saveRecord(JSON.stringify({sec: currentTime, str: this.finalTime}))
            }
        } else {
            this.saveRecord(JSON.stringify({sec: currentTime, str: this.finalTime}))
        }
        
        let content = `<div class="wins"><h1>Parabens! Você Ganhou</h1><br><br><p>Seu Tempo: ${this.finalTime}</p><br><p>Record: ${JSON.parse(this.loadRecord()).str}</p></div>`
        this.showModal(content)
    }

    hideModal() {
        const modal = document.querySelector('#modal')
        modal.classList.remove('show')
        modal.classList.add('hide')
    }
    
    showModal(content) {
        const modal = document.querySelector('#modal')
        modal.innerHTML = content
        modal.classList.add('show')
    }
    
    saveRecord(currentTime) {
        localStorage.setItem('record-minesweeper', currentTime)
    }

    loadRecord() {
        return localStorage.getItem('record-minesweeper')
    }
}


const gameArea = document.querySelector('#game-area')
const restart = document.querySelector('#btn-reset')
const selectNivel = document.querySelector('#level')
const btnFlag = document.querySelector('#btn-flag')
var flagEnable = false

minesweeper = new GameInterface(gameArea)
minesweeper.setLevel()
minesweeper.generateInterfaceField()

function hasClass(element, className) {
    if (element.classList) {
      return element.classList.contains(className);
    } else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
    }
}

gameArea.addEventListener('click', function (event) {
    let tgt = event.target
    if (!minesweeper.started) {
        stop = false
        minesweeper.startGame()
    }

    if (hasClass(tgt.parentElement, 'surface')) {
        tgt = tgt.parentElement
    }

    if (hasClass(tgt, 'surface')) {
        if (flagEnable) {
            minesweeper.setFlag(tgt)
        } else {
            minesweeper.showUnderground(tgt)
        }

    }
})

restart.addEventListener('click', function () {
    window.location.reload()
})

selectNivel.addEventListener('change', function () {
    minesweeper.setLevel(parseInt(selectNivel.value))
})

btnFlag.addEventListener('click', function () {
    flagEnable = !flagEnable
    if (flagEnable) {
        btnFlag.style.cssText = 'border: 1px solid white'
    } else {
        btnFlag.style.cssText = ''
    }
})