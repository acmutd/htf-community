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

function isPowerOf2(value) {
  return (value & (value - 1)) == 0
}

function loadTexture (gl, url) {
  // Obtain a texture resource from WebGL
  const tex = gl.createTexture()
  // Bind this texture to WebGL's 2D texture target, so we can write data into it
  gl.bindTexture(gl.TEXTURE_2D, tex)
  // Textures from the internet take a while to load, so let's fill the texture
  // with a single pixel of a color
  //
  // texImage2D Arguments: target, level of detail, internal format, width, height, border, format, data type, data
  // Level of detail: 0 = base image
  // Internal format: RGB, RGBA, ALPHA, etc
  // Border: always 0
  // Format: must be same as internal format
  // I skipped over the edge cases, you can read all about them (and more) in:
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([42, 235, 180, 255]))

  // Create a new Image object used to fetch the image over the network
  // (This is plain old DOM stuff, not WebGL)
  const img = new Image()
  // When the image loads, we want to transfer it's data to the texture. Let's
  // create a function that does this, and register it as a callback for the
  // browser to run once it has downloaded the image
  img.addEventListener('load', () => {
    // Bind this texture so we can use it
    gl.bindTexture(gl.TEXTURE_2D, tex)
    // Flip the texture upside down, since (0, 0) in WebGL is bottom-left and
    // (0, 0) in image files is top-left
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    // Fill the texture with our loaded image data
    // Instead of passing the data manually via Uint8Array/etc (as we did above),
    // WebGL conveniently accepts a regular DOM image element, so that's what we use here
    // Width/height/border are implied from the image, so no need to specify those arguments here
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)

    if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
      gl.generateMipmap(gl.TEXTURE_2D)
    } else {
      // WebGL 1 enforces certain restrictions on non-power-of-two (NPOT) textures

      // If we read out of bounds of the texture (e.g. UV coords outside of
      // [0, 1]) then clamp the coordinates to between [0, 1], don't try to
      // repeat the texture
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

      // Use linear coordinate interpolation rather than mipmapping, since we
      // can't have mipmaps with NPOT textures
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    }
  })
  // Set the Image's source to the desired URl, causing the browser to fire off
  // an appropriate HTTP request
  img.src = url

  // Return our WebGL texture object
  return tex
}
