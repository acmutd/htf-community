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

## Directory Layout

* `0-base` - The directory with which you'll (probably) start the workshop; a minimal template to handle HTML and user interaction so you can focus on learning WebGL
* `1-color` - A cube shaded entirely the same color
* `2-texture` - A textured cube
* `3-lighting` - A lit textured cube

## A Note About HTTP

In these examples, we demonstrate the use of textures to apply an image onto a 3D surface. These textures are loaded from external files, yet modern browsers do not allow content loaded via a `file:///` url to fetch other resources on the drive as if it were a network. To work around this, you'll need to set up a local HTTP server to run the examples (if you want to see textures) rather than just double-clicking on the `.html` files.

If you already have [Node.js](https://nodejs.org) installed, you might like to use [`http-server`](https://www.npmjs.com/package/http-server). Alternatively, if you already have Python, you can simply `cd` to the directory of this repo and run `python -m http.server`. If you don't already have either of those, just pick one and install it. If you can't decide, pick Node.js, because you're likely to encounter it soon again at other workshops and projects.

## A Good Idea

It might be a good idea to clone this repo and test everything to make sure it works, and perhaps skim the code/comments so you already have an idea of what we're doing before the workshop (not a requirement though; we'll go through almost all of it again during the workshop). If you run into any issues, [hit us up on Discord](https://www.acmutd.co/discord)!
