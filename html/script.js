// THANKS : MaximilianAdF
let timerTimeout;
let timerProgressBar;
let totalSecondsVar = 25;
let gridCols = 5;
let gridRows = 5;
let container;
let htmlContainer;
let devMode = false;
let devData = {
    header: 'REMOVE IMPURITIES',
    instructions: '',
    time: 25,
    rows: 10,
    cols: 10
};

class Cube {
    constructor(color = "") {
        this.color = color === "" ? this.getRandomColor() : color;
    }

    getElement() {
        const element = document.createElement("div");
        const child = document.createElement("div");
        child.className = "cube";

        if (this.color !== "empty") {
            element.className = "cube" + this.color.charAt(0);
            element.addEventListener("click", this.squareClick.bind(this));
        } else {
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
            const fromIndex = idx - gridCols * (i + 1);
            const toIndex = idx - gridCols * i;
            [container[toIndex], container[fromIndex]] = [container[fromIndex], container[toIndex]];
        }

        this.updateContainer();
    }

    updateContainer() {
        const fragment = document.createDocumentFragment();
        container.forEach(cube => {
            fragment.appendChild(cube.getElement());
        });

        htmlContainer.innerHTML = '';
        htmlContainer.appendChild(fragment);
    }

    // updateContainer() {
    //     // Clear the container
    //     while (htmlContainer.firstChild) {
    //         htmlContainer.removeChild(htmlContainer.firstChild);
    //     }
    //     // Append nodes from the modified copy
    //     container.forEach(cube => {
    //         htmlContainer.appendChild(cube.getElement());
    //     });
    // }

    getAdjacentCubes(cube) {
        const idx = container.indexOf(cube);
        const adjacentCubes = [];
        const row = Math.floor(idx / gridCols);
        const col = idx % gridCols;

        if (col > 0) adjacentCubes.push(container[idx - 1]);
        if (col < gridCols - 1) adjacentCubes.push(container[idx + 1]);
        if (row > 0) adjacentCubes.push(container[idx - gridCols]);
        if (row < gridRows - 1) adjacentCubes.push(container[idx + gridCols]);

        return adjacentCubes;
    }

    removeConnectedCubes() {
        const connectedCubes = this.getConnectedCubes();

        if (connectedCubes.size > 1) {
            connectedCubes.forEach(cube => {
                cube.color = "empty";
                this.cubeGravity(container.indexOf(cube));
            });

            this.cubeLeftShift();
        } else {
            console.log("No connected cubes");
        }
    }

    getRandomColor() {
        const colors = ["red", "green", "blue"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getConnectedCubes() {
        const connectedCubes = new Set();
        const queue = [this];

        while (queue.length > 0) {
            const currentCube = queue.shift();
            connectedCubes.add(currentCube);
            const neighbors = this.getAdjacentCubes(currentCube);

            neighbors.forEach(neighbor => {
                if (!connectedCubes.has(neighbor) && neighbor.color === this.color) {
                    queue.push(neighbor);
                    connectedCubes.add(neighbor);
                }
            });
        }

        return connectedCubes;
    }

    checkwin() {
        const emptyCubes = container.filter(cube => cube.color === "empty").length;
        const redCubes = container.filter(cube => cube.color === "red").length;
        const greenCubes = container.filter(cube => cube.color === "green").length;
        const blueCubes = container.filter(cube => cube.color === "blue").length;

        if (emptyCubes === gridRows * gridCols) {
            endGame("win", redCubes, greenCubes, blueCubes);
        } else if (shouldFail()) {
            endGame("lose", redCubes, greenCubes, blueCubes);
        }
    }

    squareClick() {
        this.removeConnectedCubes();
        this.checkwin();
    }
}

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


function shouldFail() {
    const containerCopy = container.map(cube => new Cube(cube.color));

    if (getColorCount(containerCopy).includes(1)) {
        console.log("FAIL: Single cube of a color remaining");
        return true;
    }

    return !containerCopy.some(cube => {
        if (cube.color !== "empty") {
            const connectedCubes = getConnectedCubes(containerCopy, cube);
            return connectedCubes.size > 1;
        }
        return false;
    });
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

    tempContainer.forEach(cube => {
        if (cube.color === "red") colorCount[0]++;
        else if (cube.color === "green") colorCount[1]++;
        else if (cube.color === "blue") colorCount[2]++;
    });

    return colorCount;
}

function endGame(outcome, redCubes, whiteCubes, yellowCubes) {
    const timerProgress = document.querySelector(".timer-progress-bar");
    const overlay = document.querySelector(".overlay");

    timerProgress.style.transition = "none";
    timerProgress.style.display = "none";
    timerProgress.style.width = "100%";
    overlay.style.display = "block";

    setTimeout(() => {
        fetch(`https://${GetParentResourceName()}/getOutcome`, {
            method: "POST",
            body: JSON.stringify({ outcome, redCubes, whiteCubes, yellowCubes })
        });
        document.querySelector(".hack-box-container").style.display = "none";
    }, outcome === "reset" ? 1000 : 2000);
}

function resetGameFunc() {
    document.documentElement.style.setProperty("--grid-columns", gridCols);
    document.documentElement.style.setProperty("--grid-rows", gridRows);

    const timerProgress = document.querySelector(".timer-progress-bar");
    timerProgress.style.transition = `width ${totalSecondsVar}s cubic-bezier(0.4, 1, 0.7, 0.93)`;

    generateCubes();
    runTimerFunc();
}
function generateCubes() {
    console.log("generating cubes...");
    container = Array.from({ length: gridRows * gridCols }, () => new Cube());
    container[container.length - 1].updateContainer();
}
function runTimerFunc() {
    const timerProgress = document.querySelector(".timer-progress-bar");
    clearTimeout(timerProgressBar);
    clearTimeout(timerTimeout);

    timerProgressBar = setTimeout(() => {
        timerProgress.style.width = "0%";
    }, 100);

    timerTimeout = setTimeout(() => {
        const redCubes = container.filter(cube => cube.color === "red").length;
        const greenCubes = container.filter(cube => cube.color === "green").length;
        const blueCubes = container.filter(cube => cube.color === "blue").length;
        endGame("lose", redCubes, greenCubes, blueCubes);
    }, totalSecondsVar * 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    if (devMode) {
        htmlContainer = document.getElementById("container");
        startGame(devData);
    }
});

window.addEventListener("message", event => {
    if (event.data.action === 'startGame') {
        startGame(event.data.gameData);
    }
});

function startGame(gameData) {
    htmlContainer = document.getElementById("container");
    totalSecondsVar = Number(gameData.time);
    
    gridRows = Number(gameData.rows);
    gridCols = Number(gameData.cols);
    console.log(totalSecondsVar, gridRows, gridCols)
    if (typeof gameData.header === "string") {
        document.querySelector(".info-container > h2").innerHTML = gameData.header;
    }

    if (typeof gameData.instructions === "string") {
        document.querySelector(".info-container > p").innerHTML = gameData.instructions;
    }

    const overlay = document.querySelector(".overlay");
    overlay.style.display = 'none';
    setTimeout(() => {
        document.querySelector(".hack-box-container").style.display = "flex";
        resetGameFunc();
    }, 100);
}
