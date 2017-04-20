import * as CompGeo from '../index';

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
