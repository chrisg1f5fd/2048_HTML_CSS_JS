// Fundemental variables for running the game
let board;
let tempBoard;
let score = 0;
const rows = 4;
const columns = 4;

// Variables for animations
let animQueueMovements = new Map();
let animQueueUpdates = new Map();


// Variables for Pointer input (Mouse, Trackpad, etc)
let isCursorLocked = false;
let isGateOpen = true; // bool to only read first pointer movement-delta from input
let pointerDelta = [0,0];




function updateTile(tile, num) {
    // clear the given tile's visual text
    tile.innerText = "";
    // clear the list of styles previously connected to the given tile
    tile.classList.value = ""; 
    // start building the tile style-wise from the base `tile` style 
    tile.classList.add("tile");
    // based on the given number the tile should be, append the matching style to the style list
    if (num > 0) {
        tile.innerText = num;
        if (num <= 4096) {
            tile.classList.add("t"+num.toString());
        } else {
            tile.classList.add("t8192");
        }
    }
}

function hasEmptyTile() {
    for (let r=0; r<rows; r++) {
        for (let c=0; c<columns; c++) {
            if (board[r][c] == 0) {
                return true;
            }
        }
    }
    return false;
}

function spawnTile() {
    if (!hasEmptyTile()) {
        // We would probably want to add the endGame case here
        return;
    }
    
    let found = false;
    while (!found) {
        // find a random open spot on the board
        // technically, this approach can generate out-of-bounds if Math.random() returns 1 for either row or column, but the function just loops again in that instance
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);

        if (board[r][c] == 0) {
            board[r][c] = 2;
            let tile = document.getElementById(r.toString()+"-"+c.toString());
            tile.innerText = "2";
            tile.classList.add("t2");
            tile.animate([
                {
                    transform: "scale(.9)",
                    opacity: .75
                },
                {
                    transform: "scale(1.1)",
                    opacity: .9
                },
                {
                    transform: "scale(1)",
                    opacity: 1
                }
            ],
            {
                duration: 100,
                fill: "forwards"
            })
            found = true;
        }
    }
}


function setGame() {
    // This eventually needs to be rewritten as its own function to handle custom board sizes
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]

    // This builds the board in the HTML file
    for (let r=0; r<rows; r++) {
        for (let c=0; c<columns; c++) {
            // creates <div>'s: <div id="0-0">, <div id="0-1">, etc
            let tile = document.createElement("div");
            tile.id = r.toString()+"-"+c.toString();
            let num = board[r][c];
            updateTile(tile, num);
            document.getElementById("board").append(tile);
        }
    }

    spawnTile();
    spawnTile();
}



function filterZero(row) {
    // overwrite the array with the same nums, just without 0s
    return row.filter(num => num != 0);
}

function slide(row) {
    // clear the 0s
    row = filterZero(row);

    // slide 
    // row.length-1 to not go out of bounds
    for (let i=0; i<row.length-1; i++) {
        if (row[i] == row[i+1]) {
            row[i] = row[i] * 2;
            row[i+1] = 0;
            score += row[i];
        }
    }

    // 0s would form inbetween tiles; they need clearing
    row = filterZero(row);

    // with all nums in their right pos, fill in with 0s
    while (row.length < columns) {
        row.push(0);
    }

    return row;
}

function slideLeft() {
    for (let r=0; r<rows; r++) {
        let row = board[r];
        row = slide(row);
        board[r] = row;

        for (let c=0; c<columns; c++) {
            let tile = document.getElementById(r.toString()+"-"+c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

// Reusing the slideLeft() func by just raeding the arrays backwards
function slideRight() {
    for (let r=0; r<rows; r++) {
        let row = board[r];
        row.reverse();
        row = slide(row);
        row.reverse();
        board[r] = row;

        for (let c=0; c<columns; c++) {
            let tile = document.getElementById(r.toString()+"-"+c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideUp() {
    for (let c=0; c<columns; c++) {
        let row = [];
        for (let r=0; r<rows; r++) {
            row.push(board[r][c]);
        }
        row = slide(row);
        for (let r=0; r<rows; r++) {
            board[r][c] = row[r];
        }

        for (let r=0; r<rows; r++) {
            let tile = document.getElementById(r.toString()+"-"+c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideDown() {
    for (let c=0; c<columns; c++) {
        let row = [];
        for (let r=0; r<rows; r++) {
            row.push(board[r][c]);
        }
        row.reverse();
        row = slide(row);
        row.reverse();
        for (let r=0; r<rows; r++) {
            board[r][c] = row[r];
        }
        
        for (let r=0; r<rows; r++) {
            let tile = document.getElementById(r.toString()+"-"+c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}


/* function areBoardsEqual(board1, board2) {
    if (board1.length != board2.length) {
        return false;
    }
    for (let r=0; r<board1.length; r++) {
        for (let c=0; c<board1[r].length; c++) {
            if (board1[r][c] != board2[r][c]) {
                return false;
            }
        }
    }
    return true;
} */


// Game input when cursor is not locked
document.addEventListener("keyup", (e) => {
    if (!isCursorLocked) {
        if (e.code == "ArrowLeft") {
            // tempBoard = [];
            slideLeft();
            /* if (areBoardsEqual(board, tempBoard)) {
                spawnTile();
            } */
            spawnTile();
        }
        else if (e.code == "ArrowRight") {
            // tempBoard = [];
            slideRight();
            /* if (areBoardsEqual(board, tempBoard)) {
                spawnTile();
            } */
            spawnTile();
        }
        else if (e.code == "ArrowUp") {
            // tempBoard = [];
            slideUp();
            /* if (areBoardsEqual(board, tempBoard)) {
                spawnTile();
            } */
            spawnTile();
        }
        else if (e.code == "ArrowDown") {
            // tempBoard = [];
            slideDown();
            /* if (areBoardsEqual(board, tempBoard)) {
                spawnTile();
            } */
            spawnTile();
        }
        document.getElementById("score").innerText = score;
        //spawnTile();
    } /* else {
        if (e.code == "Escape") {
            isCursorLocked = false;
        }
    } */
})




document.addEventListener("pointerlockchange", (e) => {
    if(document.pointerLockElement === null) {
        isCursorLocked = false;
    } else {
        isCursorLocked = true;
    }
})

// Locking cursor
document.addEventListener("click", (e) => {
    isCursorLocked = true;
    document.body.requestPointerLock();
})

var moveCounter = 0;

// Game input when cursor is locked
document.addEventListener("mousemove", (e) => {
    if (isCursorLocked) {
        pointerDelta = [e.movementX, e.movementY];
        if (pointerDelta[0] != 0 && pointerDelta[1] != 0) {
            console.log(pointerDelta);
        }
        // console.log(isGateOpen);

        if (isGateOpen && (pointerDelta[0] != 0 && pointerDelta[1] != 0)) {
            // pointerDelta = [e.movementX, e.movementY];
            console.log(pointerDelta);
            moveCounter++;
            console.log(moveCounter);
            isGateOpen = false;

            if (Math.abs(pointerDelta[0]) > Math.abs(pointerDelta[1])) {
                if (pointerDelta[0] > 0) {
                    // tempBoard = board;
                    slideRight();
                    /* if (areBoardsEqual(board, tempBoard)) {
                        spawnTile();
                    } */
                } else {
                    // tempBoard = board;
                    slideLeft();
                    /* if (areBoardsEqual(board, tempBoard)) {
                        spawnTile();
                    } */
                }
            } else {
                if (pointerDelta[1] > 0) {
                    // tempBoard = board;
                    slideDown();
                    /* if (areBoardsEqual(board, tempBoard)) {
                        spawnTile();
                    } */
                } else {
                    // tempBoard = board;
                    slideUp();
                    /* if (areBoardsEqual(board, tempBoard)) {
                        spawnTile();
                    } */
                }
            }
            spawnTile();
            
            setTimeout(() => {
                isGateOpen = true;
            }, 250);

        }
        /* if (e.movementX == 0 && e.movementY == 0) {
            isGateOpen = true;
        } */
        // isGateOpen = false;
        

    }
})

window.onload = function() {
    setGame();
}
