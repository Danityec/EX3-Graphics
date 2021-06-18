/**
 * Computer Graphics Course - Homework Exercise 3
 * @author: Danit Noa Yechezkel (203964036)
 * @author: Dekel Menashe (311224117)
 * @author: Keren Halpert (313604621)
 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const clearBtn = document.getElementById('clear');
const loadBtn = document.getElementById('load');
const helpTxt = document.getElementById('help');
const orthographicBtn = document.getElementById('orthographic');
const obliqueBtn = document.getElementById('oblique');
const perspectiveBtn = document.getElementById('perspective');
const rotateXBtn = document.getElementById('rotate-x');
const rotateYBtn = document.getElementById('rotate-y');
const rotateZBtn = document.getElementById('rotate-z');
const removeHiddenBtn = document.getElementById('remove-hidden');

let mode = 'orthographic'
let rotate = ''
let pointCoordinates = []
let polygonCoordinates = []
let x1 = 0
let y1 = 0
let clear = 1

/**
 * Scale the image by {t} value
 */
const scaleImg = (t) => {
    for (let i = 0; i < pointCoordinates.length; i++)
        for (let j = 0; j < pointCoordinates[i].length; j++)
            pointCoordinates[i][j] *= t
    createDrawing()
}

/**
 * Rotate the image according to mouse drag
 */
const rotateImg = (x1, y1, x2, y2) => {
    let angle = Math.atan2((y2 - y1), (x2 - x1)) * 180 / Math.PI
    let x = 0, y = 0, z = 0

    for (let i = 0; i < pointCoordinates.length; i++) {
        if (rotate == 'x') {
            y = pointCoordinates[i][1]
            z = pointCoordinates[i][2]
            pointCoordinates[i][1] = (y * Math.cos(angle)) - (z * Math.sin(angle))
            pointCoordinates[i][2] = (y * Math.sin(angle)) + (z * Math.cos(angle))
        } else if (rotate == 'y') {
            x = pointCoordinates[i][0]
            z = pointCoordinates[i][2]
            pointCoordinates[i][0] = (z * Math.sin(angle)) + (x * Math.cos(angle))
            pointCoordinates[i][2] = (z * Math.cos(angle)) - (x * Math.sin(angle))
        } else if (rotate == 'z') {
            x = pointCoordinates[i][0]
            y = pointCoordinates[i][1]
            pointCoordinates[i][0] = (x * Math.cos(angle)) - (y * Math.sin(angle))
            pointCoordinates[i][1] = (x * Math.sin(angle)) + (y * Math.cos(angle))
        }
    }
    createDrawing()
}

/**
 * Return if the area is hidden according to the 3D perspective
 */
const isVisible = (normal) => {
    const cop = [0, 0, -1000]
    const p1 = pointCoordinates[0]
    let subtract = [p1[0] - cop[0], p1[1] - cop[1], p1[2] - cop[2]]
    let visible = ((subtract[0] * normal[0]) + (subtract[1] * normal[1]) + (subtract[2] * normal[2]))
    if (visible <= 0)
        return false
    else
        return true
}


/**
 * Load the image coordinates from a text file
 */
const loadDrawingFile = () => {
    fetch('polygons.txt')
        .then(response => response.text())
        .then(text => {

            pointCoordinates = []
            polygonCoordinates = []
            let values = []
            let section = 0;

            const lines = text.split('\n')
            for (let i = 0; i < lines.length; i++) {
                if (lines[i][0] == '.') {
                    section++;
                } else {
                    switch (section) {
                        case 0: {
                            values = lines[i].split(',')
                            pointCoordinates.push([])
                            for (let j = 0; j < values.length; j++) {
                                pointCoordinates[i].push(parseInt(values[j]))
                            }
                            break;
                        }
                        case 1: {
                            values = lines[i].split(',')
                            pointCoordinates.push([])
                            for (let j = 0; j < values.length; j++) {
                                pointCoordinates[i - 1].push(parseInt(values[j]))
                            }
                            break;
                        }
                        case 2: {
                            values = lines[i].split(',')
                            polygonCoordinates.push([])
                            for (let j = 0; j < values.length; j++) {
                                polygonCoordinates[i - (pointCoordinates.length + 2)].push(parseInt(values[j]))
                            }
                            break;
                        }
                        case 3: {
                            values = lines[i].split(',')
                            polygonCoordinates.push([])
                            for (let j = 0; j < values.length; j++) {
                                polygonCoordinates[i - (pointCoordinates.length + 3)].push(parseInt(values[j]))
                            }
                            break;
                        }
                    }
                }
            }
            createDrawing()
        })
}

/**
 * Sorts the polygon list acording to depth in perspective
 */
const sortDepth = () => {
    let max = pointCoordinates[0][2];
    let sortedZIndex = [];

    for (let i = 0; i < polygonCoordinates.length; i++) {
        max = pointCoordinates[i][2]
        for (let j = 0; j < polygonCoordinates[i].length; j++) {
            if (pointCoordinates[polygonCoordinates[i][j] - 1][2] > max)
                max = pointCoordinates[polygonCoordinates[i][j] - 1][2]
        }
        sortedZIndex.push([i, max]);
    }

    sortedZIndex.sort((a, b) => {
        return a[1] - b[1]
    })

    let sortedPolygons = []
    for (let i = 0; i < sortedZIndex.length; i++) {
        sortedPolygons[i] = polygonCoordinates[sortedZIndex[i][0]];
    }

    polygonCoordinates = sortedPolygons;
}

/**
 * Create the drawing of the canvas according to the coordinates in {pointCoordinates} and {polygonCoordinates} array
 */
const createDrawing = () => {
    sortDepth()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let normal = 0, vis = 0, subtractionA = [], subtractionB = []
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0, z1 = 0, z2 = 0

    for (let i = 0; i < polygonCoordinates.length; i++) {
        ctx.beginPath();
        for (let j = 0; j < polygonCoordinates[i].length; j++) {
            if (j == polygonCoordinates[i].length - 1) {
                x1 = pointCoordinates[polygonCoordinates[i][j] - 1][0]
                y1 = pointCoordinates[polygonCoordinates[i][j] - 1][1]
                z1 = pointCoordinates[polygonCoordinates[i][j] - 1][2]
                x2 = pointCoordinates[polygonCoordinates[i][0] - 1][0]
                y2 = pointCoordinates[polygonCoordinates[i][0] - 1][1]
                z2 = pointCoordinates[polygonCoordinates[i][0] - 1][2]
                x3 = pointCoordinates[polygonCoordinates[i][1] - 1][0]
                y3 = pointCoordinates[polygonCoordinates[i][1] - 1][1]
                z3 = pointCoordinates[polygonCoordinates[i][1] - 1][2]

                subtractionA = [[x2 - x1], [y2 - y1], [z2 - z1]]
                subtractionB = [[x3 - x2], [y3 - y2], [z3 - z2]]
                const a1 = subtractionA[0]
                const a2 = subtractionA[1]
                const a3 = subtractionA[2]
                const b1 = subtractionB[0]
                const b2 = subtractionB[1]
                const b3 = subtractionB[2]

                normal = [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1]
                vis = isVisible(normal)

            } else if (j == polygonCoordinates[i].length - 2) {
                x1 = pointCoordinates[polygonCoordinates[i][j] - 1][0]
                y1 = pointCoordinates[polygonCoordinates[i][j] - 1][1]
                z1 = pointCoordinates[polygonCoordinates[i][j] - 1][2]
                x2 = pointCoordinates[polygonCoordinates[i][j + 1] - 1][0]
                y2 = pointCoordinates[polygonCoordinates[i][j + 1] - 1][1]
                z2 = pointCoordinates[polygonCoordinates[i][j + 1] - 1][2]
                x3 = pointCoordinates[polygonCoordinates[i][0] - 1][0]
                y3 = pointCoordinates[polygonCoordinates[i][0] - 1][1]
                z3 = pointCoordinates[polygonCoordinates[i][0] - 1][2]

                subtractionA = [[x2 - x1], [y2 - y1], [z2 - z1]]
                subtractionB = [[x3 - x2], [y3 - y2], [z3 - z2]]
                const a1 = subtractionA[0]
                const a2 = subtractionA[1]
                const a3 = subtractionA[2]
                const b1 = subtractionB[0]
                const b2 = subtractionB[1]
                const b3 = subtractionB[2]

                normal = [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1]
                vis = isVisible(normal)

            } else {
                x1 = pointCoordinates[polygonCoordinates[i][j] - 1][0]
                y1 = pointCoordinates[polygonCoordinates[i][j] - 1][1]
                z1 = pointCoordinates[polygonCoordinates[i][j] - 1][2]
                x2 = pointCoordinates[polygonCoordinates[i][j + 1] - 1][0]
                y2 = pointCoordinates[polygonCoordinates[i][j + 1] - 1][1]
                z2 = pointCoordinates[polygonCoordinates[i][j + 1] - 1][2]
                x3 = pointCoordinates[polygonCoordinates[i][j + 2] - 1][0]
                y3 = pointCoordinates[polygonCoordinates[i][j + 2] - 1][1]
                z3 = pointCoordinates[polygonCoordinates[i][j + 2] - 1][2]

                subtractionA = [[x2 - x1], [y2 - y1], [z2 - z1]]
                subtractionB = [[x3 - x2], [y3 - y2], [z3 - z2]]
                const a1 = subtractionA[0]
                const a2 = subtractionA[1]
                const a3 = subtractionA[2]
                const b1 = subtractionB[0]
                const b2 = subtractionB[1]
                const b3 = subtractionB[2]

                normal = [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1]
                vis = isVisible(normal)
            }

            if (mode == 'orthograpic') {
                x1 = x1
                x2 = x2
                y1 = y1
                y2 = y2
            } else if (mode == 'oblique') {
                x1 = x1 + ((z1 * 0.5) * Math.cos(45 * (180.0 / Math.PI)))
                x2 = x2 + ((z2 * 0.5) * Math.cos(45 * (180.0 / Math.PI)))
                y1 = y1 + ((z1 * 0.5) * Math.sin(45 * (180.0 / Math.PI)))
                y2 = y2 + ((z2 * 0.5) * Math.sin(45 * (180.0 / Math.PI)))
            } else if (mode == 'perspective') {
                x1 = x1 / (1 + (z1 / 1000))
                x2 = x2 / (1 + (z2 / 1000))
                y1 = y1 / (1 + (z1 / 1000))
                y2 = y2 / (1 + (z2 / 1000))
            }

            if (j === 0)
                ctx.moveTo(x1 + canvas.width / 2, y1 + canvas.height / 2);

            if (clear) {
                ctx.lineTo(x2 + canvas.width / 2, y2 + canvas.height / 2);
                ctx.strokeStyle = '#666666';
                ctx.stroke();
            } else {
                if (vis) {
                    ctx.lineTo(x2 + canvas.width / 2, y2 + canvas.height / 2);
                    ctx.strokeStyle = '#666666';
                    ctx.stroke();
                }
            }
        }
        ctx.closePath();
        if (!clear) {
            ctx.fillStyle = "#353535"
            ctx.fill();
        }
    }
}

/**
 * Remove the selected class for the GUI
 */
const removeSelected = () => {
    rotateXBtn.classList.remove('selected');
    rotateYBtn.classList.remove('selected');
    rotateZBtn.classList.remove('selected');
    obliqueBtn.classList.remove('selected');
    orthographicBtn.classList.remove('selected');
    perspectiveBtn.classList.remove('selected');
}

/**
 * Handles mouse events for the application to work
 */
window.onload = () => {
    orthographicBtn.classList.add('selected');
    loadDrawingFile();
    helpTxt.innerText = ''

    loadBtn.addEventListener('click', () => {
        loadDrawingFile();
    });

    clearBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the canvas?"))
            ctx.clearRect(0, 0, canvas.width, canvas.height)
    });

    orthographicBtn.addEventListener('click', () => {
        mode = 'orthographic'
        helpTxt.innerText = ''
        removeSelected()
        orthographicBtn.classList.add('selected');
        createDrawing()
    });

    obliqueBtn.addEventListener('click', () => {
        mode = 'oblique'
        helpTxt.innerText = ''
        removeSelected()
        obliqueBtn.classList.add('selected');
        createDrawing()
    });

    perspectiveBtn.addEventListener('click', () => {
        mode = 'perspective'
        helpTxt.innerText = ''
        removeSelected()
        perspectiveBtn.classList.add('selected');
        createDrawing()
    });

    rotateXBtn.addEventListener('click', () => {
        rotate = 'x'
        helpTxt.innerText = 'Drag the mouse on the canvas to rotate the objects'
        removeSelected()
        rotateXBtn.classList.add('selected');
    });

    rotateYBtn.addEventListener('click', () => {
        rotate = 'y'
        helpTxt.innerText = 'Drag the mouse on the canvas to rotate the objects'
        removeSelected()
        rotateYBtn.classList.add('selected');
    });

    rotateZBtn.addEventListener('click', () => {
        rotate = 'z'
        helpTxt.innerText = 'Drag the mouse on the canvas to rotate the objects'
        removeSelected()
        rotateZBtn.classList.add('selected');
    });

    removeHiddenBtn.addEventListener('click', () => {
        clear = !clear;
        if (!clear) {
            removeHiddenBtn.classList.add('selected');
            removeHiddenBtn.innerText = "Colored Objects"
        }
        else {
            removeHiddenBtn.classList.remove('selected');
            removeHiddenBtn.innerText = "Transparent Objects"
        }
        createDrawing();
    });

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault()
        if (Math.sign(event.deltaY) > 0)
            scaleImg(0.99)
        else
            scaleImg(1.01)
    });

    canvas.addEventListener('mousedown', (event) => {
        x1 = event.layerX
        y1 = event.layerY
    });

    canvas.addEventListener('mouseup', (event) => {
        if (rotate === 'x') {
            rotateImg(x1, y1, event.layerX, event.layerY)
        }
        else if (rotate === 'y') {
            rotateImg(x1, y1, event.layerX, event.layerY)
        }
        else if (rotate === 'z') {
            rotateImg(x1, y1, event.layerX, event.layerY)
        }
    });
}