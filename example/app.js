import * as THREE from 'three';

import * as CompGeo from '../index';
import * as TestPath from './testpath';

const createOrbitViewer = require('three-orbit-viewer')(THREE);

const app = createOrbitViewer({
  clearColor: 0x181819,
  clearAlpha: 1.0,
  fov: 65,
  position: new THREE.Vector3(1, 1, -2)
});

const lightGroup = new THREE.Group();
app.scene.add( lightGroup );

const light1 = new THREE.PointLight( 0xfffcff, 1 );
light1.position.set( 0, 5, 0 );
const light2 = new THREE.PointLight( 0xfdffff, 0.6 );
light2.position.set( -2, -2, 0 );
const light3 = new THREE.PointLight( 0xffffab, 0.4 );
light3.position.set( 2, -2, 1 );
lightGroup.add( light1, light2, light3 );

let meshGroup = new THREE.Group();

function generate( pathFunc ){
  app.scene.remove( meshGroup );

  meshGroup = new THREE.Group();
  meshGroup.rotation.x = -Math.PI * 0.5;
  app.scene.add( meshGroup );

  const path = pathFunc();
  const lineGeometry = segmentsToGeometry( path.segments );
  const line = new THREE.LineSegments( lineGeometry, new THREE.LineBasicMaterial({color:0xffffff}) );
  meshGroup.add( line );

  const skeleton = new CompGeo.Skeleton( path, Infinity );
  const skeletonPath = new CompGeo.shapes.Path( skeleton.spokes );
  const skeletonGeometry = segmentsToGeometry( skeletonPath.segments );
  const skeletonLine = new THREE.LineSegments( skeletonGeometry, new THREE.LineBasicMaterial({color:0xff0000}) );
  meshGroup.add( skeletonLine );

  const shape = new CompGeo.shapes.Shape( path.concat( skeletonPath ) );
  const geometry = shape.triangulate();
  const mat = new THREE.MeshStandardMaterial({ wireframe: false, color: 0xffffff });
  const mesh = new THREE.Mesh( geometry, mat );
  geometry.computeFaceNormals();
  meshGroup.add( mesh );

  meshGroup.add( new THREE.Points( geometry, new THREE.PointsMaterial({size:0.02}) ) );

}

const pathList = Object.keys( TestPath );
let pathIndex = 0;
generate( TestPath[ pathList[ pathIndex ] ] );

window.addEventListener('keydown', function(){
  pathIndex++;
  if( pathIndex >= pathList.length ){
    pathIndex = 0;
  }
  generate( TestPath[ pathList[ pathIndex ] ] );
}, true)
;

function gameShapeToPath( shape ){
  //  game shape here is an array of array of {x,y,z}s
  const first = shape[0][0];
  const pather = new CompGeo.shapes.Pather( [first.x, first.y] );
  shape.forEach( function( path ){
    path.forEach( function( vertex, vi ){
      if( vi === 0 ){
        return;
      }
      pather.lineTo( [ vertex.x, vertex.y ] );
    });
    pather.close();
    pather.moveTo( path[ 0 ].x, path[ 0 ].y );
  });
  return pather.path;
}


function segmentsToGeometry( segments ){
  return segments.reduce( function( geometry, { start, end } ){
    geometry.vertices.push( new THREE.Vector3( start[ 0 ], start[ 1 ], start[ 2 ] ), new THREE.Vector3( end[ 0 ], end[ 1 ], end[ 2 ] ) );
    return geometry;
  }, new THREE.Geometry() )
}

app.on('tick', function(){
  if( meshGroup ){
    // meshGroup.rotation.z += 0.01;
  }
});