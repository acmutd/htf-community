// Find a handle to the canvas DOM element, searching by its ID
const canvas = document.getElementById('canvas')
// Request the browser to initialize a WebGL context for the canvas
const gl = canvas.getContext('webgl')

// Initialize our shader program (see assets.js and utils.js)
const shaderProgram = initShaderProgram(gl, assetVtxSource, assetFragSource)
// Shader attributes and uniforms are known to WebGL by numeric IDs
// Here, we look up a numeric ID (location) for each attribute and uniform,
// searching by their human-readable names
const shaderProgramInfo = {
  attribs: {
    position: gl.getAttribLocation(shaderProgram, 'position'),
    texCoord: gl.getAttribLocation(shaderProgram, 'texCoord'),
    normal: gl.getAttribLocation(shaderProgram, 'normal'),
  },
  uniforms: {
    projMat: gl.getUniformLocation(shaderProgram, 'projMat'),
    modelViewMat: gl.getUniformLocation(shaderProgram, 'modelViewMat'),
    normalMat: gl.getUniformLocation(shaderProgram, 'normalMat'),
    textureImg: gl.getUniformLocation(shaderProgram, 'textureImg'),
  },
}

//
// Mesh data used below is from assets.js
//

// Create a buffer to store vertex positions
const vtxPosBuf = gl.createBuffer()
// Bind this buffer to the ARRAY_BUFFER target so we can store data into it
// ARRAY_BUFFER is the most common buffer used to store vertex data
gl.bindBuffer(gl.ARRAY_BUFFER, vtxPosBuf)
// Create a typed array (32-bit float) for our vertex positions, and pass it to
// WebGL for storage in a GPU-accessible location
//
// STATIC_DRAW indicates that we don't anticipate updating buffered data
// frequently, so a location that is fastest for the GPU to read from is ideal
// even if it's slow for the CPU to write into
//
// There are other options, such as DYNAMIC_DRAW and STREAM_DRAW, which indicate
// that you'll want to modify buffered data more often
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(assetVtxPosArray), gl.STATIC_DRAW)

// Create a buffer to store vertex texture coordinates
const vtxTexCoordBuf = gl.createBuffer()
// Bind this buffer so we can use it
gl.bindBuffer(gl.ARRAY_BUFFER, vtxTexCoordBuf)
// Allocate array and pass it to WebGL for GPU-compatible storage
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(assetVtxTexCoordArray), gl.STATIC_DRAW)

// Create a buffer to store vertex normals
const vtxNormalBuf = gl.createBuffer()
// Bind this buffer so we can use it
gl.bindBuffer(gl.ARRAY_BUFFER, vtxNormalBuf)
// Allocate array and pass it to WebGL for GPU-compatible storage
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(assetVtxNormalArray), gl.STATIC_DRAW)

// Create a buffer to store mesh indices
//
// Indexing is a way to re-use vertex data between different triangles
// For a cube face, we have: 1 square = 2 triangles = (2 * 3 = 6) vertices
// However, we know that a square only has 4 unique vertices
//
// By storing the four vertices in our vertex arrays, and then drawing the
// vertices in the following order:
// (Triangle 1: 0, 1, 2) ; (Triangle 2: 0, 2, 3)
// We get six vertices while only having to store four in memory!
//
// This optimization is unnecessary for a cube, but it makes working with large
// models much easier
const indexBuf = gl.createBuffer()
// Bind this buffer to the ELEMENT_ARRAY_BUFFER target so we can store data into it
// ELEMENT_ARRAY_BUFFER is the most common buffer used to store index data
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf)
// Allocate array and pass it to WebGL for GPU-compatible storage
// Uint16 = unsigned 16-bit integer - this is half the size of a Float32 (which 32 bits)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(assetIndexArray), gl.STATIC_DRAW)

// Load our texture (see utils.js)
const texture = loadTexture(gl, 'texture.png')

// Create necessary matrices
//
// The model matrix contains transformations specific to the model, and the view
// matrix contains transformations specific to the camera
// For this simple example, we could have simply used one matrix; however, I wanted
// to demonstrate the use of both since in a product with multiple models you'd
// likely want to be able to update model matrices without having to re-apply the
// camera transformations every time
const projMat = glMatrix.mat4.create()
const viewMat = glMatrix.mat4.create()
const modelMat = glMatrix.mat4.create()
const modelViewMat = glMatrix.mat4.create()
const normalMat = glMatrix.mat4.create()
// Initialize view and model matrices to identity (others don't need to be
// initialized because they will be overwritten)
glMatrix.mat4.identity(viewMat)
glMatrix.mat4.identity(modelMat)
// Translate the view matrix forwards 7 units, so that the cube will appear in front of us
glMatrix.mat4.translate(viewMat, viewMat, [ 0.0, 0.0, -7.0 ])

// Set glClear to clear the color buffer to grey
gl.clearColor(0.1, 0.1, 0.1, 1.0)
// Set glClear to clear the depth buffer to 1.0, the farthest possible distance
// This is because anything far away will be overwritten by nearer objects
gl.clearDepth(1.0)
// Enable depth testing
gl.enable(gl.DEPTH_TEST)

function animateModel () {
  // Animate the model by rotating its corresponding matrix
  glMatrix.mat4.identity(modelMat)
  glMatrix.mat4.rotateX(modelMat, modelMat, Math.sin(Date.now() / 750.0) * 2)
  glMatrix.mat4.rotateY(modelMat, modelMat, Math.cos(Date.now() / 750.0) * 2)
}

function drawScene () {
  // It's considered best practice to schedule another animation frame
  // immediately when the current frame begins
  window.requestAnimationFrame(drawScene)

  // Apply keyboard input movements to our view matrix (see input.js)
  viewMatApplyInput(viewMat)
  // Animate our model matrix
  animateModel()

  // Clear the screen to empty
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Use our shader program to draw this model
  gl.useProgram(shaderProgram)

  // Multiply view matrix * model matrix and write result to modelViewMatrix
  glMatrix.mat4.multiply(modelViewMat, viewMat, modelMat)
  // Create a normal matrix correspondent to modelViewMatrix
  glMatrix.mat4.invert(normalMat, modelViewMat)
  glMatrix.mat4.transpose(normalMat, normalMat)

  // Pass our matrix data to the shader program
  gl.uniformMatrix4fv(shaderProgramInfo.uniforms.projMat, false, projMat)
  gl.uniformMatrix4fv(shaderProgramInfo.uniforms.modelViewMat, false, modelViewMat)
  gl.uniformMatrix4fv(shaderProgramInfo.uniforms.normalMat, false, normalMat)

  // WebGL limits how many textures are available to a given draw call, usually
  // around 16 on modern hardware. Available textures "slots" gl.TEXTURE0 - gl.TEXTURE[N]
  // Let's use the first texture slot for our example here
  gl.activeTexture(gl.TEXTURE0)
  // Now that we've picked the appropriate texture slot, bind our texture to the
  // 2D target of this texture slot
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // Pass the texture slot ID (0) to the shader, so it knows from which texture to read
  gl.uniform1i(shaderProgramInfo.uniforms.textureImg, 0)

  // Bind our vertex position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vtxPosBuf)
  // Specify layout of our vertex buffer
  // Arguments: attribute location, number of components per attribute, data type, normalized, stride
  // Stride = "offset in bytes between the beginning of consecutive vertex attributes"
  // 0 sets stride = number of components per attribute * component data type size
  // Offset = "offset in bytes of the first component in the vertex attribute array"
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
  gl.vertexAttribPointer(shaderProgramInfo.attribs.position, 3, gl.FLOAT, false, 0, 0)
  // Enable our attribute location (basically: we bound useful data to it and
  // the shader is going to access it)
  gl.enableVertexAttribArray(shaderProgramInfo.attribs.position)

  // Bind vertex texture coordinate buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vtxTexCoordBuf)
  // Specify layout
  gl.vertexAttribPointer(shaderProgramInfo.attribs.texCoord, 2, gl.FLOAT, false, 0, 0)
  // Enable attribute location
  gl.enableVertexAttribArray(shaderProgramInfo.attribs.texCoord)

  // Bind vertex normal buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vtxNormalBuf)
  // Specify layout
  gl.vertexAttribPointer(shaderProgramInfo.attribs.normal, 3, gl.FLOAT, false, 0, 0)
  // Enable attribute location
  gl.enableVertexAttribArray(shaderProgramInfo.attribs.normal)

  // Bind our index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf)
  // Issue a draw call!
  //
  // A "draw call" is a special API call that actually draws content on the screen
  // So far, we've spent hundreds of lines of code setting up the pipeline, but
  // nothing has been rendered yet.
  // This call tells WebGL that we're done configuring things and want to use the
  // resources we've bound to produce some graphical output.
  //
  // Arguments: mode (primitive type), number of elements, element data type, offset
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
  gl.drawElements(gl.TRIANGLES, assetIndexArray.length, gl.UNSIGNED_SHORT, 0)
}

// Schedule the first animation frame
window.requestAnimationFrame(drawScene)
// Set up the resize event handler, passing reference the variables we want it
// to update on each resize
bindResize(canvas, gl, projMat)
