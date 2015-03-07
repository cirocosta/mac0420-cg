## Geometric Models

3D geometric models describe 3d objects using mathematical primitives. The most ubiquitous type is composed of 3d triangles with shared vertices (a triangle mesh).

## Graphics Pipeline

The basic operations in the pipeline map the 3d vertex locatons to 2d screen positions and shade the triangles so that they both look realistic and appear in proper back-to-front order.

Generally this is solved in 4d coordinate space: 3 traditional geometric coordinates and a fourth homogeneous coordinate for handling perspective viewing (4 matrices and 4 vector).

## HTML5

`<canvas>` tag defines a drawing area on a webpage. It does not provides directly drawing methods but a mechanism called 'context' which supports the actual drawing features.

In the 2d context, coordinate system's center is upper left.
