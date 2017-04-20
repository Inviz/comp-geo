*This module is forked from [Citybound](http://cityboundsim.com) [Comp-Geo](https://github.com/citybound-old/comp-geo), repaired and made partially working by @mflux.

# comp-geo

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

2D Computational Geometry for Javascript

Uses primitives with a configurable **thickness** for giving reasonable results even for inaccurate inputs.

# Status of this module

The module this was forked from was no longer being maintained. I've managed to get skeleton and shape / paths working. The rest may still be broken as the tests are not currently passing. Use at your own peril!

*@mflux

# Tests

`npm install`
`npm run test`

# Development and Web Example

`npm install`
`npm install -g budo`
`npm run dev`

## Primitives

* Line, Ray, LineSegment
* Circle, Curve

## Shapes

* Path (LineSegments + Curves)
* Shape
* Stroke

## Shape Operations

* Clipping/Boolean Operations
* Offsetting/Straight Skeleton

## Skeleton Triangulation

![Example](http://i.imgur.com/wHuq3UF.png)

See example/app.js

For general use from path to THREE.js roof shapes:

    //  Path is an array of LineSegment(s)
    const skeleton = new CompGeo.Skeleton( path, Infinity );
    const skeletonPath = new CompGeo.shapes.Path( skeleton.spokes );
    const shape = new CompGeo.shapes.Shape( path.concat( skeletonPath ) );
    const geometry = shape.triangulate();

