//
// Shaders
//

const assetVtxSource = `
// Use high-precision floating-point values
precision highp float;

// Attributes are unique to each vertex
attribute vec3 position; // (X, Y, Z) coordinates in 3D space
attribute vec2 texCoord; // (U, V) [aka (S, T)] coordinates indicating which
                         // pixel of the texture is "glued" onto this vertex of
                         // the 3D surface

// Uniforms can be updated once before the shader is invoked
// (i.e. before a draw call is issued, with drawArrays/drawElements/etc)
uniform mat4 projMat; // Projects from 3D (perspective) into 2D
uniform mat4 modelViewMat; // Applies camera and model transformations

// Varyings are passed from the vertex shader to the fragment shader
// They must be declared in both shaders
varying vec2 vTexCoord;

void main(void) {
  // Set varyings which will be used by fragment shader
  // The GPU automatically interpolates these values between fragments
  vTexCoord = texCoord;

  // Multiply the input vertex position by matrices, to project it into 2D screen space
  // Write our vertex position to the built-in output variable gl_Position
  gl_Position = projMat * modelViewMat * vec4(position, 1.0);
}
`

const assetFragSource = `
// Use high-precision floating-point values
precision highp float;

// ID of texture unit storing the texture we want to draw on this object
uniform sampler2D textureImg;

// Varyings are passed from the vertex shader to the fragment shader
// They must be declared in both shaders
varying vec2 vTexCoord;

void main(void) {
  // Sample our texture at the coordinate defined by vTexCoord, and assign that
  // to our output built-in variable gl_FragColor
  gl_FragColor = texture2D(textureImg, vTexCoord);
}
`

//
// Model
//

const assetVtxPosArray = [
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

const assetVtxTexCoordArray = [
  // Front
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,

  // Back
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,

  // Top
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,

  // Bottom
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,

  // Right
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,

  // Left
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
]

const assetIndexArray = [
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
