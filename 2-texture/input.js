// Keep track of which keyboard buttons are pressed
let upPressed = false
let downPressed = false
let leftPressed = false
let rightPressed = false

function viewMatApplyInput (viewMat) {
  // Create a vector (an array in which indices 0/1/2 correspond to values X/Y/Z)
  const dir = [0.0, 0.0, 0.0]

  // If viewer is moving forwards, move scene backwards (positive Z)
  if (upPressed) {
    dir[2] += 0.125
  }
  // If viewer is moving backwards, move scene forwards (negative Z)
  if (downPressed) {
    dir[2] -= 0.125
  }
  // If viewer is moving left, move scene to the right (positive X)
  if (leftPressed) {
    dir[0] += 0.125
  }
  // If viewer is moving right, move scene to the left (positive X)
  if (rightPressed) {
    dir[0] -= 0.125
  }

  // Translate the view matrix by our chosen direction
  glMatrix.mat4.translate(viewMat, viewMat, dir)
}

function handleResize (canvas, gl, projMat) {
  // Resize the canvas DOM element to match the window's size
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Tell WebGL how large is the area into which we want it to render (in this
  // case, the entire canvas)
  gl.viewport(0, 0, canvas.width, canvas.height)
  // Set up the perspective projection matrix
  // Arguments: output matrix, field-of-view, aspect ratio, near Z, far Z
  glMatrix.mat4.perspective(projMat, 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 1000.0)
}

function bindResize (canvas, gl, projMat) {
  // Call resize handler manually on launch (otherwise we won't get canvas and
  // matrices set up until the user resizes the window themselves)
  handleResize(canvas, gl, projMat)
  // Register a callback for the window's resize event, which calls handleResize
  // with the appropriate arguments
  window.addEventListener('resize', () => handleResize(canvas, gl, projMat))
}

//
// Update key pressed/released variables in response to key down/up browser events
//

window.addEventListener('keydown', event => {
  switch (event.code) {
    case 'ArrowUp':
      upPressed = true
      break

    case 'ArrowDown':
      downPressed = true
      break

    case 'ArrowLeft':
      leftPressed = true
      break

    case 'ArrowRight':
      rightPressed = true
      break

    default:
      break
  }
})

window.addEventListener('keyup', event => {
  switch (event.code) {
    case 'ArrowUp':
      upPressed = false
      break

    case 'ArrowDown':
      downPressed = false
      break

    case 'ArrowLeft':
      leftPressed = false
      break

    case 'ArrowRight':
      rightPressed = false
      break

    default:
      break
  }
})
