import * as CompGeo from '../es6/index';

export function h(){
  const sh = [
    [
      {
        "x": 5,
        "y": 2,
        "z": 0
      },
      {
        "x": 4,
        "y": 2,
        "z": 0
      },
      {
        "x": 4,
        "y": 3,
        "z": 0
      },
      {
        "x": 5,
        "y": 3,
        "z": 0
      },
      {
        "x": 5,
        "y": 4,
        "z": 0
      },
      {
        "x": 2,
        "y": 4,
        "z": 0
      },
      {
        "x": 2,
        "y": 3,
        "z": 0
      },
      {
        "x": 3,
        "y": 3,
        "z": 0
      },
      {
        "x": 3,
        "y": 2,
        "z": 0
      },
      {
        "x": 2,
        "y": 2,
        "z": 0
      },
      {
        "x": 2,
        "y": 1,
        "z": 0
      },
      {
        "x": 5,
        "y": 1,
        "z": 0
      }
    ]
  ];

  return gameShapeToCompGeoPath( sh.map( (path)=>path.map( (v)=>({x:v.x*0.25,y:v.y*0.25,z:v.z*0.25}))) );
}

function gameShapeToCompGeoPath( shape ){
  const first = shape[0][0];
  const pather = new CompGeo.shapes.Pather( [first.x, first.y] );
  shape.forEach( function( path, pathIndex ){
    path.forEach( function( vertex, vi ){
      if( vi === 0 ){
        return;
      }
      pather.lineTo( [ vertex.x, vertex.y ] );
    });
    pather.close();

    const nextPath = shape[ pathIndex + 1 ];
    if( nextPath ){
      pather.moveTo( nextPath[ 0 ].x, nextPath[ 0 ].y );
    }
  });

  // console.log( JSON.stringify( pather.path, null, 2 ) );
  return pather.path;
}

export function convex() {
  return new CompGeo.shapes.Pather([0, 0.25])
    .lineTo([0.1, 0])
    .lineTo([0.7, 0.15])
    .lineTo([1, 0.6])
    .lineTo([0.75, 0.75])
    .lineTo([0.55, 0.8])
    .lineTo([0.25, 0.85])
    .close();
}

export function concave() {
  return new CompGeo.shapes.Pather([0, 0.25])
    .lineTo([0.1, 0])
    .lineTo([0.7, 0.15])
    .lineTo([1, 0.6])
    .lineTo([0.75, 0.75])
    .lineTo([0.55, 0.6])
    .lineTo([0.25, 0.85])
    .close();
}

export function square() {
  return new CompGeo.shapes.Pather()
    .lineTo([1, 0])
    .lineTo([1, 1])
    .lineTo([0, 1])
    .close();
}

export function box() {
  return new CompGeo.shapes.Pather([0.25, 0])
    .lineTo([0.75, 0])
    .lineTo([0.75, 1])
    .lineTo([0.25, 1])
    .close();
}

export function plus() {
  return new CompGeo.shapes.Pather([0, 1 / 3])
    .lineTo([1 / 3, 1 / 3])
    .lineTo([1 / 3, 0])
    .lineTo([2 / 3, 0])
    .lineTo([2 / 3, 1 / 3])
    .lineTo([1, 1 / 3])
    .lineTo([1, 2 / 3])
    .lineTo([2 / 3, 2 / 3])
    .lineTo([2 / 3, 1])
    .lineTo([1 / 3, 1])
    .lineTo([1 / 3, 2 / 3])
    .lineTo([0, 2 / 3])
    .close();
}

export function l() {
  return new CompGeo.shapes.Pather()
    .lineTo([0.5, 0])
    .lineTo([0.5, 0.5])
    .lineTo([1, 0.5])
    .lineTo([1, 1])
    .lineTo([0, 1])
    .close();
}

export function u() {
  return new CompGeo.shapes.Pather()
    .lineTo([1 / 3, 0])
    .lineTo([1 / 3, 2 / 3])
    .lineTo([2 / 3, 2 / 3])
    .lineTo([2 / 3, 0])
    .lineTo([1, 0])
    .lineTo([1, 1])
    .lineTo([0, 1])
    .close();
}
