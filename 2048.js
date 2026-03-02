// Fundemental variables for running the game
const rows = 4;
const columns = 4;
let board;
let tempBoard;
let score = 0;

// Variables for animations
let animQueueMovements = new Map();
let animQueueUpdates = new Map();


// Variables for Pointer input (Mouse, Trackpad, etc)
let isCursorLocked = false;
let isGateOpen = true; // to only read first pointer movement-delta from input
let pointerDelta = [0,0];




function updateTile(tile, num) {
    // refreshing the working tile's contents with baseline styling
    tile.innerText = "";
    tile.classList.value = ""; 
    tile.classList.add("tile");
    // based on the given number the tile should be, append the matching style to the tile
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
    // tracking if sliding was possible
    let wereChanges = false;
    
    
    for (let r=0; r<rows; r++) {
        let preSlide = board[r].slice();
        let row = board[r].slice();
        row = slide(row);
        board[r] = row.slice();
        
        for (let i=0; i<preSlide.length; i++) {
            if (preSlide[i] != row[i]) {
                wereChanges = true;
            }
        }

        for (let c=0; c<columns; c++) {
            let tile = document.getElementById(r.toString()+"-"+c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }

    return wereChanges;
}

// Reusing the slideLeft() func by just reading the arrays backwards
function slideRight() {
    // tracking if sliding was possible
    let wereChanges = false;

    console.log("Board");
    for (let r=0; r<rows; r++) {
        let preSlide = board[r].slice();
        let row = board[r].slice();
        row.reverse();
        row = slide(row);
        row.reverse();
        board[r] = row.slice();

        for (let i=0; i<preSlide.length; i++) {
            if (preSlide[i] != row[i]) {
                wereChanges = true;
            }
        }

        for (let c=0; c<columns; c++) {
            let tile = document.getElementById(r.toString()+"-"+c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }

    return wereChanges;
}

function slideUp() {
    // tracking if sliding was possible
    let wereChanges = false;

    for (let c=0; c<columns; c++) {
        let row = [];
        let preSlide = [];
        for (let r=0; r<rows; r++) {
            row.push(board[r][c]);
        }

        preSlide = row.slice();
        row = slide(row);

        for (let r=0; r<rows; r++) {
            board[r][c] = row[r];
        }

        for (let i=0; i<preSlide.length; i++) {
            if (preSlide[i] != row[i]) {
                wereChanges = true;
            }
        }

        for (let r=0; r<rows; r++) {
            let tile = document.getElementById(r.toString()+"-"+c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
    return wereChanges;
}

function slideDown() {
    // tracking if sliding was possible
    let wereChanges = false;

    for (let c=0; c<columns; c++) {
        let row = [];
        let preSlide = [];
        for (let r=0; r<rows; r++) {
            row.push(board[r][c]);
        }

        preSlide = row.slice();
        row.reverse();
        row = slide(row);
        row.reverse();
        for (let r=0; r<rows; r++) {
            board[r][c] = row[r];
        }

         for (let i=0; i<preSlide.length; i++) {
            if (preSlide[i] != row[i]) {
                wereChanges = true;
            }
        }
        
        for (let r=0; r<rows; r++) {
            let tile = document.getElementById(r.toString()+"-"+c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
    return wereChanges;
}


// Game input when pointer is not locked
document.addEventListener("keyup", (e) => {
    if (!isCursorLocked) {
        if (e.code == "ArrowLeft") {
            let didSlide = slideLeft();
            if (didSlide) { 
                spawnTile(); 
            }
        }
        else if (e.code == "ArrowRight") {
            let didSlide = slideRight();
            if (didSlide) {
                spawnTile();
            }
        }
        else if (e.code == "ArrowUp") {
            let didSlide = slideUp();
            if (didSlide) {
                spawnTile();
            }
        }
        else if (e.code == "ArrowDown") {
            let didSlide = slideDown();
            if (didSlide) {
                spawnTile();
            }
        }
        document.getElementById("score").innerText = score;
    } 
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

let moveCounter = 0;

// Game input when cursor is locked
document.addEventListener("mousemove", (e) => {
    if (isCursorLocked) {
        pointerDelta = [e.movementX, e.movementY];
        if (pointerDelta[0] != 0 && pointerDelta[1] != 0) {
            console.log(pointerDelta);
        }

        if (isGateOpen && (pointerDelta[0] != 0 && pointerDelta[1] != 0)) {
            let didSlide = false;
            
            console.log(pointerDelta);
            moveCounter++;
            console.log(moveCounter);
            isGateOpen = false;

            if (Math.abs(pointerDelta[0]) > Math.abs(pointerDelta[1])) {
                if (pointerDelta[0] > 0) {
                    didSlide = slideRight();
                    if (didSlide) {
                        spawnTile();
                    }
                } else {
                    didSlide = slideLeft();
                    if (didSlide) {
                        spawnTile();
                    }
                }
            } else {
                if (pointerDelta[1] > 0) {
                    didSlide = slideDown();
                    if (didSlide) {
                        spawnTile();
                    }
                } else {
                    didSlide = slideUp();
                    if (didSlide) {
                        spawnTile();
                    }
                }
            }
            
            setTimeout(() => {
                isGateOpen = true;
            }, 250);

        }
    }
})

window.onload = function() {
    setGame();
}
