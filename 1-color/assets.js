//
// Shaders
//

const assetVtxSource = `
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

const assetFragSource = `
// Use high-precision floating-point values
precision highp float;

void main(void) {
  // Write our color to the built-in output variable gl_FragColor
  gl_FragColor = vec4(0.9, 0.4, 0.6, 1.0);
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
