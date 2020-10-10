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
