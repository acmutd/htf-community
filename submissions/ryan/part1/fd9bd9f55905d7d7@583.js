// https://observablehq.com/@iffyloop/acm-computer-graphics-workshop@583
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`
# ACM Computer Graphics Workshop - Part 1 (Color)
`
)});
  main.variable(observer("canvas")).define("canvas", function(){return(
document.createElement('canvas')
)});
  main.variable(observer()).define(["canvas"], function(canvas){return(
canvas.width = 800
)});
  main.variable(observer()).define(["canvas"], function(canvas){return(
canvas.height = 450
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
Have you ever wondered how your computer draws 3D images? We'll teach you in this workshop, discussing every step of the graphics pipeline along with the appropriate low-level API concepts and calls.

Since WebGL is fundamentally a huge state machine, there's a lot of properties to configure before drawing your first object on the screen. Be patient, though, and you'll discover what makes WebGL such a powerful and efficient API, and you'll be able to easily reconfigure it for drawing different types of content.

By the middle of the workshop, you'll know how to render a 3D cube on the screen with WebGL, and by the end, you'll add texturing and lighting to your cube!
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## The Graphics Pipeline

![Graphics pipeline diagram](https://open.gl/media/img/c2_pipeline.png)

When we talk about "the graphics pipeline," we're talking about the different stages of processing that your content goes through before being drawn on the screen. Let's discuss the pipeline in more detail:

* Geometry buffers *{vertices}*: Vertex buffers store vertex positions and other attributes in a single chunk of GPU-accessible memory. Index buffers store the order in which vertices should be drawn to form triangles, in case multiple triangles share the same vertex(es).
* Vertex shader: The vertex shader is a piece of code that executes on the GPU and projects vertex positions from their 3D model-space coordinates into 2D screen-space coordinates.
* Shape assembly: Groups of vertices are assembled into triangles.
* (Geometry shader does not exist in WebGL).
* Rasterization & Fragment shader: Rasterization is the process of filling in a triangle. The term comes from the fact that we're converting *vector* (vertex) data into *raster* (pixel) data. The fragment shader is a piece of code that executes on the GPU and determines the color of each pixel.
* Tests & Blending: The depth of each fragment is tested against any previously drawn content, and if something was drawn in front of it earlier, the current fragment is discarded. Alpha blending composites transparent objects, but we're not going to cover blending in this workshop.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## Shaders

### Vertex Shader

Let's begin by writing basic vertex and fragment shaders. Shaders are written in a programming language called GLSL (OpenGL Shading Language), but we're going to store our shader code inside a JavaScript string, so we can pass it to WebGL later.
`
)});
  main.variable(observer("cubeVtxShaderSource")).define("cubeVtxShaderSource", function(){return(
`
// Use high-precision floating-point values
precision highp float;

// Attributes are unique to each vertex
attribute vec3 position; // (X, Y, Z) coordinates in 3D space

// Uniforms can be updated once before the shader is invoked
// (i.e. before a draw call is issued, with drawArrays/drawElements/etc)
uniform mat4 projMat; // Projects from 3D (perspective) into 2D
uniform mat4 modelViewMat; // Applies camera and model transformations

void main(void) {
  // Multiply the input vertex position by matrices, to project it into 2D screen space
  // Write our vertex position to the built-in output variable gl_Position
  gl_Position = projMat * modelViewMat * vec4(position, 1.0);
}
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
The initial line of the vertex shader, \`precision highp float\`, tells the GPU to use a high-precision floating point data type to represent our numbers.

Attributes represent data about each vertex, such as its position, color, texture coordinate, etc. \`attribute vec3 position\` declares a 3D vector attribute which can be referenced by the variable name \`position\`. Soon, you'll see how we bind this to the vertex position buffer.

Uniforms represent data that are updated with each invocation of the shader. Here, we create two uniform variables to access projection and model-view matrices, by which we'll multiply our vertices to calculate their 2D coordinates on the screen. Similarly to attributes, these are declared by our \`uniform mat4\` statements.

A function called \`main\` that returns nothing (\`void\`) is the entry point at which the GPU will begin executing our code. Inside this function, we multiply each vertex's position by the appropriate matrices as described above. Finally, we assign the result to \`gl_Position\`, a built-in variable that indicates to WebGL the result of our calculations.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
### Fragment Shader
`
)});
  main.variable(observer("cubeFragShaderSource")).define("cubeFragShaderSource", function(){return(
`
// Use high-precision floating-point values
precision highp float;

void main(void) {
  // Write our color to the built-in output variable gl_FragColor
  gl_FragColor = vec4(0.9, 0.4, 0.6, 1.0);
}
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
Similarly to our vertex shader, our fragment shader needs a precision and an entry point, which we've defined here. This is perhaps the simplest possible fragment shader, as it merely assigns the same color to every pixel of the object. \`gl_FragColor\` is the built-in variable to which we assign our output color, and RGBA components range from [0,1] instead of the [0,255] range that you might be familiar with from image editing software.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
### Compiling Shaders

Now it's time to take our human-readable shader source code and convert it into an efficient executable bytecode. This will be our first time interacting with the WebGL JavaScript API, and we're going to make a utility function so we don't have to repeat the same code to compile both shaders.
`
)});
  main.variable(observer("compileShader")).define("compileShader", function(){return(
function compileShader (gl, type, source) {
  // Obtain a shader resource from WebGL
  const shader = gl.createShader(type)
  // Send our shader's source code to the WebGL implementation
  gl.shaderSource(shader, source)
  // Tell WebGL to compile our shader
  gl.compileShader(shader)

  // If our shader failed to compile...
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Get the shader's log from WebGL and write it to the browser console
    console.error('Shader compilation failed: ' + gl.getShaderInfoLog(shader))
    // Delete the shader resource (it is no longer useful)
    gl.deleteShader(shader)
    // We don't have a useful shader to return, so just return null (nothing)
    return null
  }

  // Return the compiled shader
  return shader
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
This function takes three arguments:

* \`gl\`: A WebGL context
* \`type\`: One of \`gl.VERTEX_SHADER\` or \`gl.FRAGMENT_SHADER\`, indicating the type of shader we're compiling
* \`source\`: The source code for our shader

First, we call \`gl.createShader\` with the appropriate \`type\` argument to allocate a new shader resource. Next, we pass the shader's source code to WebGL's shader compiler with \`gl.shaderSource\`. Finally, we tell WebGL to compile our source code into executable code.

In case we made a mistake, or something went wrong with the WebGL implementation our browser uses, we check for errors with the \`gl.getShaderParameter\` function, requesting the \`gl.COMPILE_STATUS\` parameter. In this case, \`gl.getShaderParameter\` will return \`true\` if the shader compiled correctly, and \`false\` if it didn't. If it returned \`false\`, we request the shader's information log with \`gl.getShaderInfoLog\` and print it to the console, we delete the shader resource since it's no longer usable, and we \`return null\` indicating that there is no valid output.

If the compilation succeeds, we simply return the shader object we created.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
### Linking Shaders

When drawing an object, we'll never use our vertex or fragment shaders individually. Rather, we combine them into something called a "shader program." Making a shader program involves compiling vertex and fragment shaders and linking them together so they can communicate. We'll write another utility function to do that.
`
)});
  main.variable(observer("initShaderProgram")).define("initShaderProgram", ["compileShader"], function(compileShader){return(
function initShaderProgram (gl, vtxSource, fragSource) {
  // Compile our vertex shader from it's source
  const vtxShader = compileShader(gl, gl.VERTEX_SHADER, vtxSource)
  // Compile our fragment shader from it's source
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSource)

  // Obtain a shader program resource from WebGL
  const program = gl.createProgram()
  // Attach our vertex shader to the program
  gl.attachShader(program, vtxShader)
  // Attach our fragment shader to the program
  gl.attachShader(program, fragShader)
  // Link two attached shaders into one single program
  // This is similar to how you might compile two C++ files separately, but
  // pass them both to the linker to resolve dependencies and generate a
  // single executable
  gl.linkProgram(program)

  // If our shader program failed to link (most likely because of an
  // incompatibility between the two shaders in varyings/etc, or because we
  // misused or didn't use appropriate built-in variables and functions)...
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // Get the shader program's log from WebGL and write it to the browser console
    console.error('Shader program linking failed: ' + gl.getProgramInfoLog(program))
    // Delete shader and shader program resources
    gl.deleteShader(vtxShader)
    gl.deleteShader(fragShader)
    gl.deleteProgram(program)
    // We don't have a useful shader program to return, so just return null (nothing)
    return null
  }

  return program
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
Conceptually, this function is very similar to the \`compileShader\` function.

It accepts three arguments:

* \`gl\`: A WebGL context
* \`vtxSource\`: Vertex shader source code
* \`fragSource\`: Fragment shader source code

For convenience, this function accepts the raw shader source code and invokes our \`compileShader\` function on behalf of the caller.

Now that we're ready to create the shader program, we use \`gl.createProgram\` to allocate a new shader program resource. We then call \`gl.attachShader\` to attach both our shaders to the program, followed by \`gl.linkProgram\` to perform the linking.

In case our shader program failed to link, we check its status and, if there was an error, print the shader program's log to the console. We also delete the involved shaders and shader program since they're no longer useful, and \`return null\` to indicate that we don't have any valid output.

Hopefully, the linking succeeded, in which case we return our new shader program.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## Creating a WebGL Context

A WebGL context keeps track of our graphics pipeline configuration and any associated resources (e.g. buffers, textures, or shaders). Let's go ahead and create the context now so we can test our shader compilation utilities.
`
)});
  main.variable(observer("gl")).define("gl", ["canvas"], function(canvas){return(
canvas.getContext('webgl')
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
We created the \`<canvas>\` element at the very top of this workshop, using the \`document.createElement\` function. We now call the canvas' \`getContext\` function to acquire a WebGL context.

We'll use this context to compile and link our shaders...
`
)});
  main.variable(observer("shaderProgram")).define("shaderProgram", ["initShaderProgram","gl","cubeVtxShaderSource","cubeFragShaderSource"], function(initShaderProgram,gl,cubeVtxShaderSource,cubeFragShaderSource){return(
initShaderProgram(gl, cubeVtxShaderSource, cubeFragShaderSource)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
If you see \`shaderProgram = WebGLProgram {}\` above, then congratulations! You've successfully initialized your first shader program. Otherwise, if it says \`shaderProgram = null\`, you'll need to open your browser's debugging console to figure out what's wrong.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
It's very nice to have a usable shader program, but unless we have a way to transfer data between our JavaScript code running here on the CPU, and our shader running on the GPU, it's pretty much useless. Thankfully, WebGL provides two functions, \`gl.getAttribLocation\` and \`gl.getUniformLocation\`, which return numeric IDs (called "locations") that point to those resources. We can then pass those IDs into other functions that send data to the shader, but first, we need to retrieve those locations and store them in a convenient place.
`
)});
  main.variable(observer("shaderProgramInfo")).define("shaderProgramInfo", ["gl","shaderProgram"], function(gl,shaderProgram){return(
{
  attribs: {
    position: gl.getAttribLocation(shaderProgram, 'position'),
  },
  uniforms: {
    projMat: gl.getUniformLocation(shaderProgram, 'projMat'),
    modelViewMat: gl.getUniformLocation(shaderProgram, 'modelViewMat'),
  },
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
We'll use these again later once we have content to draw on the screen, but we're going to leave the subject of shaders for now and learn about buffering our cube's geometry data.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## Geometry Buffers

Geometry buffers are large arrays of numbers that store information about the shape of our object. Since 3D models consist of triangles, we're going to create a **vertex buffer** to store the (X, Y, Z) coordinates of our cube's vertices. We'll also create an **index buffer** containing indices into the vertex buffer indicating the order in which those vertices should be drawn. Index buffers allow us to reference the same vertex in multiple triangles without storing its coordinates multiple times in the vertex buffer.
`
)});
  main.variable(observer("cubeVtxPosArray")).define("cubeVtxPosArray", function(){return(
[
  // Front
  -1.0, -1.0, 1.0,
  1.0, -1.0, 1.0,
  1.0, 1.0, 1.0,
  -1.0, 1.0, 1.0,

  // Back
  -1.0, -1.0, -1.0,
  -1.0, 1.0, -1.0,
  1.0, 1.0, -1.0,
  1.0, -1.0, -1.0,

  // Top
  -1.0, 1.0, -1.0,
  -1.0, 1.0, 1.0,
  1.0, 1.0, 1.0,
  1.0, 1.0, -1.0,

  // Bottom
  -1.0, -1.0, -1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0, 1.0,
  -1.0, -1.0, 1.0,

  // Right
  1.0, -1.0, -1.0,
  1.0, 1.0, -1.0,
  1.0, 1.0, 1.0,
  1.0, -1.0, 1.0,

  // Left
  -1.0, -1.0, -1.0,
  -1.0, -1.0, 1.0,
  -1.0, 1.0, 1.0,
  -1.0, 1.0, -1.0,
]
)});
  main.variable(observer("cubeIndexArray")).define("cubeIndexArray", function(){return(
[
  // Front
  0, 1, 2,
  0, 2, 3,

  // Back
  4, 5, 6,
  4, 6, 7,

  // Top
  8, 9, 10,
  8, 10, 11,

  // Bottom
  12, 13, 14,
  12, 14, 15,

  // Right
  16, 17, 18,
  16, 18, 19,

  // Left
  20, 21, 22,
  20, 22, 23,
]
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
Above, we created two plain JavaScript arrays that contain the vertex coordinates and indices to draw a cube. Now, we're going to create two WebGL buffers and push the data from those JavaScript arrays into the buffers, which are more efficient for the GPU to access. We'll also create a utility function which makes it extra easy to buffer data.
`
)});
  main.variable(observer("createBuffer")).define("createBuffer", function(){return(
function createBuffer (gl, target, data, mode) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(target, buffer)
  gl.bufferData(target, data, mode)
  return buffer
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
This function accepts four arguments:

* \`gl\`: A WebGL context
* \`target\`: The target to which we're going to bind our buffer, either \`gl.ARRAY_BUFFER\` or \`gl.ELEMENT_ARRAY_BUFFER\`
* \`data\`: A JavaScript Typed Array containing the data we want to put into the buffer
* \`mode\`: Indicates the mode in which we intend to use the buffer, probably either \`gl.STATIC_DRAW\`, indicating that we'll only write to it occasionally, or \`gl.DYNAMIC_DRAW\`, indicating that we'll write to it frequently. In some cases, specifying a mode helps WebGL know where to store your buffer in memory so that it will operate most efficiently.

The specific behavior will become apparent with usage.
`
)});
  main.variable(observer("vtxPosBuf")).define("vtxPosBuf", ["createBuffer","gl","cubeVtxPosArray"], function(createBuffer,gl,cubeVtxPosArray){return(
createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(cubeVtxPosArray), gl.STATIC_DRAW)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
Here, we've created a buffer to store our vertex positions. Vertex buffers are used with the \`gl.ARRAY_BUFFER\` target, and we're only going to write data into this buffer once (i.e. right now), so we use \`gl.STATIC_DRAW\`. We construct a \`Float32Array\` to store our coordinates in memory as 32-bit floating point values.
`
)});
  main.variable(observer("indexBuf")).define("indexBuf", ["createBuffer","gl","cubeIndexArray"], function(createBuffer,gl,cubeIndexArray){return(
createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndexArray), gl.STATIC_DRAW)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
The index buffer is similar, but index buffers are bound to the \`gl.ELEMENT_ARRAY_BUFFER\` target. Additionally, each index is stored as an unsigned 16-bit integer, hence the use of \`Uint16Array\` instead of \`Float32Array\`.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## Matrices

Now that we've created buffers to store our model data and shaders to shade our model, we need some matrices to project our model's vertices into 2D space. Since this workshop is primarily about WebGL, not linear algebra, we're going to use a third-party library called glMatrix to perform matrix operations for us.
`
)});
  main.variable(observer("glMatrix")).define("glMatrix", ["require"], function(require){return(
require('https://cdn.jsdelivr.net/npm/gl-matrix@3.3.0/gl-matrix-min.min.js')
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
Now we can create and transform our matrices. We're going to use four matrices:
`
)});
  main.variable(observer("projMat")).define("projMat", ["glMatrix"], function(glMatrix){return(
glMatrix.mat4.create()
)});
  main.variable(observer()).define(["glMatrix","projMat","canvas"], function(glMatrix,projMat,canvas){return(
glMatrix.mat4.perspective(projMat, 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 1000.0)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
The projection matrix applies a perspective transformation to vertices, so that closer things appear larger than farther things. We pass the following arguments to \`mat4.perspective\` to initialize our projection matrix with the appropriate contents for a perspective transform:

* Output: \`projMat\`
* Field-of-view: 45 degrees converted to radians
* Aspect ratio
* Nearest valid Z coordinate
* Farthest valid Z coordinate
`
)});
  main.variable(observer("viewMat")).define("viewMat", ["glMatrix"], function(glMatrix){return(
glMatrix.mat4.create()
)});
  main.variable(observer()).define(["glMatrix","viewMat"], function(glMatrix,viewMat){return(
glMatrix.mat4.translate(viewMat, viewMat, [ 0.0, 0.0, -7.0 ])
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
The view matrix transforms the entire scene, to create the effect of a camera. Here, we translate it seven units forwards ("into" the screen), so that the cube will appear in front of our camera. Notice how the way we think about this is that the camera moves seven units backwards ("out of" the screen), but in reality, we're translating the view matrix in the opposite direction. This is because there is no camera in WebGL; to create the effect of a camera, we move the entire scene in the opposite direction.
`
)});
  main.variable(observer("modelMat")).define("modelMat", ["glMatrix"], function(glMatrix){return(
glMatrix.mat4.create()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
The model matrix will store transformations specific to the current model. In this case, we only have a single model - the cube - but in larger applications, it's helpful to separate the model and view matrices, so you can move and rotate models without affecting the camera.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
### Animating the model matrix

Let's create a function that we'll call every frame to animate the model matrix. This function first resets \`modelMat\` to its identity state, then rotates it along the X and Y axes by a function of the current time (\`Date.now\`).
`
)});
  main.variable(observer("animateModelMatrix")).define("animateModelMatrix", ["glMatrix","modelMat"], function(glMatrix,modelMat){return(
function animateModelMatrix () {
  glMatrix.mat4.identity(modelMat)
  glMatrix.mat4.rotateX(modelMat, modelMat, Math.sin(Date.now() / 750.0) * 2)
  glMatrix.mat4.rotateY(modelMat, modelMat, Math.cos(Date.now() / 750.0) * 2)
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
Now we're back to creating our final matrix, the model-view matrix.
`
)});
  main.variable(observer("modelViewMat")).define("modelViewMat", ["glMatrix"], function(glMatrix){return(
glMatrix.mat4.create()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
The model-view matrix will store the product of the view matrix multiplied by the model matrix. When we add lighting, we'll need to derive from this another matrix which will transform vertex normals.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## Initializing WebGL

Now it's time to set the viewport size and background color for our scene. We'll also enable depth testing, so closer objects obscure farther objects.
`
)});
  main.variable(observer()).define(["gl","canvas"], function(gl,canvas){return(
gl.viewport(0, 0, canvas.width, canvas.height)
)});
  main.variable(observer()).define(["gl"], function(gl){return(
gl.clearColor(0.1, 0.1, 0.1, 1.0)
)});
  main.variable(observer()).define(["gl"], function(gl){return(
gl.enable(gl.DEPTH_TEST)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## Drawing a Scene

Finally! With all our resources set up, we can write a function that uses them to render a frame of animation.
`
)});
  main.variable(observer("drawScene")).define("drawScene", ["animateModelMatrix","glMatrix","modelViewMat","viewMat","modelMat","gl","shaderProgram","shaderProgramInfo","projMat","vtxPosBuf","indexBuf","cubeIndexArray"], function(animateModelMatrix,glMatrix,modelViewMat,viewMat,modelMat,gl,shaderProgram,shaderProgramInfo,projMat,vtxPosBuf,indexBuf,cubeIndexArray){return(
function drawScene () {
  // It's considered best practice to schedule another animation frame
  // immediately when the current frame begins
  window.requestAnimationFrame(drawScene)

  // Call the function we declared earlier to animate the model matrix
  animateModelMatrix()
  // Multiply view matrix * model matrix and write result to modelViewMatrix
  glMatrix.mat4.multiply(modelViewMat, viewMat, modelMat)

  // Clear the screen to empty
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Use our shader program to draw this model
  gl.useProgram(shaderProgram)

  // Pass our matrix data to the shader program
  // 4fv = 4D array of 4D floating-point vectors
  gl.uniformMatrix4fv(shaderProgramInfo.uniforms.projMat, false, projMat)
  gl.uniformMatrix4fv(shaderProgramInfo.uniforms.modelViewMat, false, modelViewMat)

  // Bind our vertex position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vtxPosBuf)
  // Specify layout of our vertex buffer.
  // This flexibility offered by this function is most useful if you're using
  // interleaved buffers, which we aren't.
  //
  // Arguments: attribute location, number of components per attribute, data type, normalized, stride
  // Stride = "offset in bytes between the beginning of consecutive vertex attributes"
  // 0 sets stride = number of components per attribute * component data type size
  // Offset = "offset in bytes of the first component in the vertex attribute array"
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
  gl.vertexAttribPointer(shaderProgramInfo.attribs.position, 3, gl.FLOAT, false, 0, 0)
  // Enable our attribute location (basically: we bound useful data to it and
  // the shader is going to access it)
  gl.enableVertexAttribArray(shaderProgramInfo.attribs.position)

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
  gl.drawElements(gl.TRIANGLES, cubeIndexArray.length, gl.UNSIGNED_SHORT, 0)
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
That's a lot of code, but hopefully it makes sense, since you learned about all the different types of resources when we created them. Before drawing anything, we call \`gl.clear\` to erase all previous content from the pixel color and depth framebuffers. Next, we call \`gl.useProgram\` to activate the shader program we created near the beginning of this workshop. With the shader program activated, we use \`gl.uniformMatrix4fv\` to transfer our matrices from this script, running on the CPU, to a location in GPU-accessible memory from which our shader expects to read its \`projMat\` and \`modelViewMat\` uniforms. We then bind our vertex buffer and specify the layout according to which its data is organized. The number \`3\` matches the *3D* vectors used for our vertices, and \`gl.FLOAT\` matches the \`Float32Array\` data type we stored in the buffer. \`gl.enableVertexAttribArray\` enables the shader to read the attribute we've just bound. Finally, we bind our index buffer, and issue the \`gl.drawElements\` *draw call*. A *draw call* is a special type of WebGL API function that actually draws something on the screen!
`
)});
  main.variable(observer()).define(["drawScene"], function(drawScene){return(
window.requestAnimationFrame(drawScene)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## You Did It!

Congratulations, you've been very patient! Your hard work has finally paid off, in the form a 3D spinning cube! You'll have to scroll back up to the top of this workshop to see it, though.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
This would also be a *fantastic* time to ask any questions, if you're confused about *anything at all* we've discussed so far.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## Some Ideas

To better understand how shaders work, try changing the cube's color by assigning a different value to \`gl_FragColor\` in our fragment shader's source code. Also try modifying the data in \`cubeVtxPosArray\` and see how the cube's shape changes!
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## Textures and Lighting

If you want to learn how to apply textures and lighting to your cube, continue on to the next notebook in our workshop series!
`
)});
  return main;
}
