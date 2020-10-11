# WebGL Workshop
*Part of ACM Hacktoberfest 2020*

## Overview
[ACM Hacktoberfest](https://hacktoberfest.acmutd.co) is a one-day event celebrating open source with workshops
and speakers about modern software practices.

### What You'll Learn
1. How to use WebGL, a powerful Javascript API for high-performance graphics
2. How to configure the graphics pipeline for your content
3. How to write shaders for texturing and lighting

### Technologies
- WebGL
- JavaScript

## Deployment
After your pull request is approved, you'll be able to see the finished product at [webgl-workshop.acmutd.co](https://webgl-workshop.acmutd.co).

## Documentation
MDN's [WebGL API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext) is an indispensable resource for understanding the semantics of WebGL's API calls. Don't be intimidated by the number of functions listed - simply search for the name of a WebGL function you want to learn about (e.g. `texImage2D`) and follow the link to its reference, where you'll see a list of accepted arguments accompanied by detailed explanations and example code. The code for this workshop is loosely based on [MDN's WebGL tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial), so if a traditional online tutorial is more convenient for you than the workshop format, you should definitely check out that link.

## Directory Layout
* `0-base` - The directory with which you'll (probably) start the workshop; a minimal template to handle HTML and user interaction so you can focus on learning WebGL
* `1-color` - A cube shaded entirely the same color
* `2-texture` - A textured cube
* `3-lighting` - A lit textured cube

## HTTP Server for Examples
In these examples, we demonstrate the use of textures to apply an image onto a 3D surface. This functionality is only available if you use a local HTTP server to run the examples, rather than double-clicking the HTML files. Follow [these instructions](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server#Running_a_simple_local_HTTP_server) to install one if you don't have it already.

Notes on instructions:
* Step 1: we'd recommend getting the *x86-64* version of Python (rather than the *x86* one mentioned in that tutorial), unless you already have a different version of Python installed.
* Step 3: `cd` into the root of this repository (e.g. the `htf-community` folder on your drive).

## A Good Idea
It might be a good idea to clone this repo and test everything to make sure it works, and perhaps skim the code/comments so you already have an idea of what we're doing before the workshop (not a requirement though; we'll go through almost all of it again during the workshop). If you run into any issues, [hit us up on Discord](https://www.acmutd.co/discord)!
