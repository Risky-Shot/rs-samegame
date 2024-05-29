let timerTimeout;
let timerProgressBar;
let totalSecondsVar = 25;
let gridCols = 5;
let gridRows = 5;
let container;
let htmlContainer;
let devMode = true;
let devData = {
    header : 'REMOVE IMPURITIES',
    instructions : '',
    time : 25,
    rows : 10,
    cols : 10
}

class Cube {
    constructor(color = "") {
        if (color === "")
            color = this.getRandomColor();
        this.color = color;
    }
    getElement() {
        const element = document.createElement("div");
        const child = document.createElement("div");
        child.className = "cube";
        if (this.color !== "empty") {
            element.className = "cube" + this.color.substring(0, 1);
            element.addEventListener("click", this.squareClick.bind(this));
        }
        else {
            element.className = "empty";
            child.classList.add("empty");
        }
        element.appendChild(child);
        return element;
    }
    cubeLeftShift() {
        let isEmptyColumn = new Array(gridCols).fill(true);
        // Identify empty columns
        for (let i = 0; i < gridRows; i++) {
            for (let j = 0; j < gridCols; j++) {
                if (!(container[i * gridCols + j].color === "empty")) {
                    isEmptyColumn[j] = false;
                }
            }
        }
        // Shift columns left if an entire column is empty
        for (let col = 0; col < gridCols; col++) {
            if (isEmptyColumn[col]) {
                // Shift all columns to the right of it one position to the left
                for (let row = 0; row < gridRows; row++) {
                    for (let shiftCol = col; shiftCol < gridCols - 1; shiftCol++) {
                        let currentIndex = row * gridCols + shiftCol;
                        let nextIndex = row * gridCols + shiftCol + 1;
                        // Swap the current and next columns
                        [container[currentIndex], container[nextIndex]] = [container[nextIndex], container[currentIndex]];
                    }
                }
                // Adjust for the shift when checking subsequent columns
                isEmptyColumn.splice(col, 1);
                isEmptyColumn.push(false); // Assume last column is now non-empty
                col--; // Re-check the current column index due to the shift
            }
        }
        this.updateContainer();
    }
    cubeGravity(idx) {
        const row = Math.floor(idx / gridCols);
        for (let i = 0; i < row; i++) {
            // Swap elements in the copied array
            [container[idx - gridCols * i], container[idx - gridCols * (i + 1)]] = [container[idx - gridCols * (i + 1)], container[idx - gridCols * i]];
        }
        // Update the live container with the modified copy
        this.updateContainer();
    }
    updateContainer() {
        // Clear the container
        while (htmlContainer.firstChild) {
            htmlContainer.removeChild(htmlContainer.firstChild);
        }
        // Append nodes from the modified copy
        container.forEach(cube => {
            htmlContainer.appendChild(cube.getElement());
        });
    }
    getAdjacentCubes(cube) {
        const idx = Array.from(container).indexOf(cube);
        // const idx = container.indexOf(cube);
        const adjacentCubes = [];
        const row = Math.floor(idx / gridCols);
        const col = idx % gridCols;
        if (col - 1 >= 0)
            adjacentCubes.push(container[idx - 1]);
        if (col + 1 < gridCols)
            adjacentCubes.push(container[idx + 1]);
        if (row - 1 >= 0)
            adjacentCubes.push(container[idx - gridCols]);
        if (row + 1 < gridRows)
            adjacentCubes.push(container[idx + gridCols]);
        return adjacentCubes;
    }
    removeConnectedCubes() {
        const connectedCubes = this.getConnectedCubes();
        if (connectedCubes.size === 1) {
            console.log("No connected cubes");
        }
        else {
            connectedCubes.forEach(cube => {
                cube.color = "empty";
                this.cubeGravity(container.indexOf(cube)); // Apply gravity to the cubes so empty cubes are at top
            });
            this.cubeLeftShift();
            // this.updateContainer(); // Already called in cubeLeftShift
        }
    }
    getRandomColor() {
        const colors = ["red", "green", "blue"];
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    }
    getConnectedCubes() {
        const connectedCubes = new Set();
        const queue = [this];
        while (queue.length > 0) {
            const currentCube = queue.shift();
            connectedCubes.add(currentCube);
            const neighbors = this.getAdjacentCubes(currentCube);
            neighbors.forEach(neighbor => {
                if (!connectedCubes.has(neighbor) && neighbor.color == this.color) {
                    queue.push(neighbor);
                    connectedCubes.add(neighbor);
                }
            });
        }
        return connectedCubes;
    }
    checkwin() {
        const emptyCubes = container.filter((cube) => cube.color === "empty");
        const redCubes = container.filter((cube) => cube.color === "red").length;
        const greenCubes = container.filter((cube) => cube.color === "green").length;
        const blueCubes = container.filter((cube) => cube.color === "blue").length;
        if (emptyCubes.length === gridRows * gridCols) {
            endGame("win", redCubes, greenCubes, blueCubes); // MODIFY
        }
        else if (shouldFail()) {
            endGame("lose", redCubes, greenCubes, blueCubes);
        }
        
    }
    squareClick() {
        this.removeConnectedCubes();
        this.checkwin();
    }
}
//The functions below together checks solvability of the board
function helpFunct(tempContainer, queue, path = []) {
    if (getColorCount(tempContainer).includes(1)) {
        console.log("FAIL, SINGLE:", path);
        return false;
    }
    let c = 0;
    tempContainer.forEach((cube) => {
        if (cube.color === "empty") {
            c++;
        }
    });
    if (c === gridRows * gridCols) {
        console.log("SOLVE:", path); // Path is one of the sequences of clicks that solves the board
        return true;
    }
    else if (queue.length === 0) {
        console.log("FAIL, NO QUEUE:", path);
        return false;
    }
    while (queue.length > 0) {
        let connectedCubes = queue.shift();
        const [updatedContainer, possibleClick] = cubesUpdate(tempContainer, connectedCubes); // [container, possibleClicks
        const updatedQueue = updateQueue(updatedContainer);
        const newPath = path.concat(possibleClick);
        if (helpFunct(updatedContainer, updatedQueue, newPath)) {
            return true;
        }
    }
    console.log("FAIL, NO PATH:", path);
    return false;
}
function cubesUpdate(tempContainer, connectedCubes) {
    let possibleClicks = -1;
    connectedCubes.forEach(cube => {
        const idx = tempContainer.indexOf(cube);
        cube.color = "empty";
        possibleClicks = idx;
        const row = Math.floor(idx / gridCols);
        for (let i = 0; i < row; i++) {
            [tempContainer[idx - gridCols * i], tempContainer[idx - gridCols * (i + 1)]] = [tempContainer[idx - gridCols * (i + 1)], tempContainer[idx - gridCols * i]];
        }
    });
    let isEmptyColumn = new Array(gridCols).fill(true);
    // Identify empty columns
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridCols; j++) {
            if (!(tempContainer[i * gridCols + j].color === "empty")) {
                isEmptyColumn[j] = false;
            }
        }
    }
    // Shift columns left if an entire column is empty
    for (let col = 0; col < gridCols; col++) {
        if (isEmptyColumn[col]) {
            // Shift all columns to the right of it one position to the left
            for (let row = 0; row < gridRows; row++) {
                for (let shiftCol = col; shiftCol < gridCols - 1; shiftCol++) {
                    let currentIndex = row * gridCols + shiftCol;
                    let nextIndex = row * gridCols + shiftCol + 1;
                    // Swap the current and next columns
                    [tempContainer[currentIndex], tempContainer[nextIndex]] = [tempContainer[nextIndex], tempContainer[currentIndex]];
                }
            }
            // Adjust for the shift when checking subsequent columns
            isEmptyColumn.splice(col, 1);
            isEmptyColumn.push(false); // Assume last column is now non-empty
            col--; // Re-check the current column index due to the shift
        }
    }
    return [tempContainer, possibleClicks];
}
function updateQueue(tempContainer) {
    let queue = [];
    let visited = new Set();
    tempContainer.forEach(cube => {
        if (!(cube.color === "empty")) {
            const connectedCubes = getConnectedCubes(tempContainer, cube);
            for (let i = 0; i < connectedCubes.size; i++) {
                const connectedCube = connectedCubes[i];
                if (!visited.has(connectedCube)) {
                    visited.add(connectedCube);
                    queue.push(connectedCubes);
                }
            }
        }
    });
    return queue;
}
function checkSolvable() {
    // const container = document.getElementById("container") as HTMLElement;
    // const containerCopy = Array.from(container.childNodes).map(node => node.cloneNode(true)); //Deep copy of the container so modification of the DOM cubes does not affect the original container
    //
    // let queue = updateQueue(containerCopy);
    // return helpFunct(containerCopy, queue);
    return false;
}
function shouldFail() {
    // This method does 2 things:
    // 1. Fail if exactly one of any color is left
    // 2. Fail if there are no groups of connected colors
    //
    // In case of a failure, return true
    const containerCopy = Array.from(container).map(cube => new Cube(cube.color));
    // No need to check if the board is empty. This method won't be called if we won.
    if (getColorCount(containerCopy).includes(1)) {
        console.log("FAIL: Single cube of a color remaining");
        return true;
    }
    // If we find a connected group, return true
    for (let i = 0; i < containerCopy.length; i++) {
        const cube = containerCopy[i];
        if (!(cube.color === "empty")) {
            const connectedCubes = getConnectedCubes(containerCopy, cube);
            if (connectedCubes.size > 1) {
                return false;
            }
        }
    }
    // If we made it here, no connected groups were found. Fail.
    console.log("FAIL: No connected groups found");
    return true;
}
function getConnectedCubes(tempContainer, cube) {
    const connectedCubes = new Set();
    const queue = [cube];
    while (queue.length > 0) {
        const currentCube = queue.shift();
        connectedCubes.add(currentCube);
        const neighbors = getAdjacentCubes(tempContainer, currentCube);
        neighbors.forEach(neighbor => {
            if (!connectedCubes.has(neighbor) && neighbor.color === cube.color) {
                connectedCubes.add(neighbor);
                queue.push(neighbor);
            }
        });
    }
    if (connectedCubes.size === 1) {
        connectedCubes.clear();
    }
    return connectedCubes;
}
function getAdjacentCubes(tempContainer, cube) {
    const idx = tempContainer.indexOf(cube);
    const adjacentCubes = [];
    const row = Math.floor(idx / gridCols);
    const col = idx % gridCols;
    if (col - 1 >= 0)
        adjacentCubes.push(tempContainer[idx - 1]);
    if (col + 1 < gridCols)
        adjacentCubes.push(tempContainer[idx + 1]);
    if (row - 1 >= 0)
        adjacentCubes.push(tempContainer[idx - gridCols]);
    if (row + 1 < gridRows)
        adjacentCubes.push(tempContainer[idx + gridCols]);
    return adjacentCubes;
}
function getColorCount(tempContainer) {
    const colorCount = [0, 0, 0];
    tempContainer.forEach((cube) => {
        if (cube.color == "red") {
            colorCount[0]++;
        }
        else if (cube.color == "green") {
            colorCount[1]++;
        }
        else if (cube.color == "blue") {
            colorCount[2]++;
        }
    });
    return colorCount;
}
// ------------------------------------------------------------^
function endGame(outcome, redCubes, greenCubes, blueCubes) {
    const timerProgress = document.querySelector(".timer-progress-bar");
    const overlay = document.querySelector(".overlay");
    timerProgress.style.transition = "none";
    timerProgress.style.display = "none";
    timerProgress.style.width = "100%";
    overlay.style.display = "block";
    if (outcome === "win") {
        setTimeout(function () {
            //timerProgress.style.display = "block";
            overlay.style.display = 'none';
            //resetGameFunc();
            // fetch(`https://${GetParentResourceName()}/getOutcome`, {
            //     method: "POST",
            //     body: JSON.stringify({
            //         outcome: "win",
            //         redCubes: redCubes,
            //         greenCubes: greenCubes,
            //         blueCubes: blueCubes
            //     })
            // });
            let gameBox = document.querySelector(".hack-box-container");
            gameBox.style.display = "none";
        }, 2000);
    }
    else if (outcome === "lose") {
        setTimeout(function () {
            //timerProgress.style.display = "block";
            overlay.style.display = 'none';
            // fetch(`https://${GetParentResourceName()}/getOutcome`, {
            //     method: "POST",
            //     body: JSON.stringify({
            //         outcome: "lose",
            //         redCubes: redCubes,
            //         greenCubes: greenCubes,
            //         blueCubes: blueCubes
            //     })
            // });
            let gameBox = document.querySelector(".hack-box-container");
            gameBox.style.display = "none";
            //resetGameFunc();
        }, 2000);
    }
    else if (outcome === "reset") {
        setTimeout(function () {
            resetMsg.style.display = 'none';
            timerProgress.style.display = "block";
            overlay.style.display = 'none';
            resetGameFunc();
        }, 1000);
    }
}
function resetGameFunc() {
    const cssVariables = {
        "--grid-columns": gridCols,
        "--grid-rows": gridRows
    };
    // Set the CSS variables
    for (const [key, value] of Object.entries(cssVariables)) {
        document.documentElement.style.setProperty(key, String(value));
    }
    const timerProgress = document.querySelector(".timer-progress-bar");
    timerProgress.style.transition = `width ${totalSecondsVar}s cubic-bezier(0.4, 1, 0.7, 0.93)`;
    generateCubes();
    runTimerFunc();
}
function generateCubes() {
    console.log("generating cubes...");
    // htmlContainer.innerHTML = "";
    container = [];
    for (let i = 0; i < gridRows * gridCols; i++) {
        const cube = new Cube();
        container === null || container === void 0 ? void 0 : container.push(cube);
        // Last iteration only
        if (i === gridRows * gridCols - 1) {
            cube.updateContainer();
        }
    }
}
function runTimerFunc() {
    const timerProgress = document.querySelector(".timer-progress-bar");
    clearTimeout(timerProgressBar); // We need to clear to prevent memory leak after multiple games are played.
    timerProgressBar = setTimeout(function () {
        timerProgress.style.width = "0%";
    }, 100);
    clearTimeout(timerTimeout); // Clear any existing timer to prevent problems with endGame("reset")
    timerTimeout = setTimeout(function () {
        endGame("lose");
    }, totalSecondsVar * 1000);
}

// HERE GAME STARTS
window.addEventListener("message", function(event) {
    switch (event.data.action) {
        case 'startGame':
            startGame(event.data.gameData);
            break;
        default:
            break;
    }
})

function startGame(gameData){
    totalSecondsVar = Number(gameData.time);
    gridRows = Number(gameData.rows);
    gridCols = Number(gameData.cols);
    if (gameData.header != null && typeof(gameData.header) == "string") {
        let header = document.querySelector(".info-container > h2");
        header.innerHTML = gameData.header;
    }
    if (gameData.instructions != null && typeof(gameData.instructions) == "string") {
        let instructions = document.querySelector(".info-container > p");
        instructions.innerHTML = gameData.instructions;
    }
    
    setTimeout(() => {
        let gameBox = document.querySelector(".hack-box-container");
        gameBox.style.display = "flex";
        resetGameFunc();
    }, 100);
    

}

document.addEventListener("DOMContentLoaded", function () {
    if(devMode == true) {
        htmlContainer = document.getElementById("container");
        startGame(devData);
    }
});
