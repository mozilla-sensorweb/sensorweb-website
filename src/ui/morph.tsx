import * as React from 'react';
import * as _ from 'lodash';
const { injectGlobal } = require<any>('styled-components');

function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}

interface DecomposedMatrix {
  rotate: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  translateX: number;
  translateY: number;
}

type Matrix = number[];

function matrixToString(x: DecomposedMatrix) {
  return `translate(${x.translateX}px, ${x.translateY}px) rotate(${x.rotate}rad) ` +
         `skew(${x.skewX}rad, ${x.skewY}rad) scale(${x.scaleX}, ${x.scaleY})`;
}

function interpolateDecomposedTransforms(a: DecomposedMatrix, b: DecomposedMatrix, t: number) {
  return {
    rotate: lerp(a.rotate, b.rotate, t),
    scaleX: lerp(a.scaleX, b.scaleX, t),
    scaleY: lerp(a.scaleY, b.scaleY, t),
    skewX: lerp(a.skewX, b.skewX, t),
    skewY: lerp(a.skewY, b.skewY, t),
    translateX: lerp(a.translateX, b.translateX, t),
    translateY: lerp(a.translateY, b.translateY, t),
  };
}

const IDENTITY = [1, 0, 0, 1, 0, 0];

function compose(x: DecomposedMatrix) {
  const translation = [1, 0, 0, 1, x.translateX, x.translateY];
  const scale = [x.scaleX, 0, 0, x.scaleY, 0, 0];
  const rotation = [Math.cos(x.rotate), Math.sin(x.rotate),
                    -Math.sin(x.rotate), Math.cos(x.rotate), 0, 0];
  const shear = [1, Math.tan(x.skewY), Math.tan(x.skewX), 1, 0, 0];
  let mat = IDENTITY;
  mat = multiply(mat, translation);
  mat = multiply(mat, scale);
  mat = multiply(mat, shear);
  mat = multiply(mat, rotation);
  return mat;
}
// http://frederic-wang.fr/decomposition-of-2d-transform-matrices.html
export function decompose([a, b, c, d, e, f]: Matrix) {
  const determinant = (a * d) - (b * c);
  let result: DecomposedMatrix = {} as DecomposedMatrix;
  if (a !== 0 || b !== 0) {
    const r = Math.sqrt(a * a + b * b);
    result.rotate = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
    result.scaleX = r;
    result.scaleY = determinant / r;
    result.skewX = Math.atan((a * c + b * d) / (r * r));
    result.skewY = 0;
  } else if (c !== 0 || d !== 0) {
    const s = Math.sqrt(c * c + d * d);
    result.rotate = (Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s)));
    result.scaleX = determinant / s;
    result.scaleY = s;
    result.skewX = 0;
    result.skewY = Math.atan((a * c + b * d) / (s * s));
  } else {
    result.scaleX = 0;
    result.scaleY = 0;
  }
  result.translateX = e;
  result.translateY = f;

  return result;
}



export function multiply([a1, b1, c1, d1, e1, f1]: Matrix, [a2, b2, c2, d2, e2, f2]: Matrix) {
  return [
    (a1 * a2) + (c1 * b2),      // a
    (b1 * a2) + (d1 * b2),      // b
    (a1 * c2) + (c1 * d2),      // c
    (b1 * c2) + (d1 * d2),      // d
    (a1 * e2) + (c1 * f2) + e1, // e
    (b1 * e2) + (d1 * f2) + f1  // f
  ];
}

export function invert([a, b, c, d, e, f]: Matrix) {
  const determinant = (a * d) - (c * b);
  return [
    d / determinant,
    b / -determinant,
    c / -determinant,
    a / determinant,
    ((c * f) - (e * d)) / determinant,
    ((e * b) - (a * f)) / determinant
  ];
}
export function parseMatrixTransformString(transform: string) {
  if (transform.slice(0, 7) !== 'matrix(') {
    throw new Error(`Could not parse transform string (${transform})`);
  }

  return transform.slice(7, -1).split(' ').map(parseFloat);
}

export function getTransformMatrix(node: HTMLElement) {
  const style = getComputedStyle(node);
  const transform = style.transform;

  if (!transform || transform === 'none') {
    return IDENTITY;
  }

  const origin = style.transformOrigin!.split(' ').map(parseFloat);
  let matrix = parseMatrixTransformString(transform!);
  // compensate for the transform origin (we want to express everything in [0,0] terms)
  matrix = multiply([1, 0, 0, 1, origin[0], origin[1]], matrix);
  matrix = multiply(matrix, [1, 0, 0, 1, -origin[0], -origin[1]]);
  return matrix;
}
export function getCumulativeTransformMatrix(node: HTMLElement | null, root: HTMLElement) {
  let matrix = [1, 0, 0, 1, 0, 0];
  while (node) {
    const parentMatrix = getTransformMatrix(node);
    if (parentMatrix) {
      matrix = multiply(parentMatrix, matrix);
    }
    node = node.parentElement;
    if (node === root) {
      break;
    }
  }
  return matrix;
}

function getUntransformedClientRect(el?: HTMLElement) {
  if (!el) {
    return undefined;
  }
  let offsetLeft = 0;
  let offsetTop = 0;
  let width = el.offsetWidth;
  let height = el.offsetHeight;
  do {
    offsetLeft += el.offsetLeft;
    offsetTop += el.offsetTop;
  } while ((el = el.offsetParent as HTMLElement));

  if (width === 0 && height === 0) {
    return undefined;
  }

  return {
    left: offsetLeft,
    top: offsetTop,
    width,
    height,
  } as ClientRect;
}
function rescale(val: number, a: number, b: number, a2: number, b2: number) {
  return (val - a) / (b - a) * (b2 - a2) + a2;
}
interface MorphTweenProps {
  percent: number;
}
export class MorphTween extends React.Component<MorphTweenProps, any> {
  el: HTMLElement;

  get startEl() {
    return this.el.children[0]! as HTMLElement;
  }

  get endEl() {
    return this.el.children[1]! as HTMLElement;
  }

  componentDidUpdate() {

    function getKeyedElements(container: HTMLElement) {
      const keys = [];
      const keyToElements = new Map<string, HTMLElement>();
      const unkeyedElements = [];
      const queue: HTMLElement[] = [container];
      const queueWithinKey: (string | null)[] = [null];
      while (queue.length) {
        const current = queue.shift()!;
        const key = current.getAttribute('data-morph-key');
        const isInKeyedElement = queueWithinKey.shift()! || key;

        if (key) {
          if (keys.indexOf(key) === -1) {
            keys.push(key);
          }
          keyToElements.set(key, current);
        } else if (!isInKeyedElement) {
          unkeyedElements.push(current);
        }
        for (let i = 0; i < current.children.length; i++) {
          queue.push(current.children[i] as HTMLElement);
          queueWithinKey.push(key || isInKeyedElement);
        }
      }
      return {
        keyToElements,
        unkeyedElements
      }
    }

    let starter = getKeyedElements(this.startEl);
    let ender = getKeyedElements(this.endEl);

    let keys = _.uniq([...starter.keyToElements.keys(), ...ender.keyToElements.keys()]);

    const t = this.props.percent;

    function clobber(el: HTMLElement, property: any, opacity: number) {
      let expando = (el as any)._temp || ((el as any)._temp = {});
      if (!expando[property]) {
        expando[property] = getComputedStyle(el)[property];
      }
      const m = /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*?(.*?)\)/.exec(expando[property]) || [];
      const v = `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${opacity * parseFloat(m[4] || '1')})`;
      el.style[property] = v;
    }

    function fakeOpacity(el: HTMLElement, opacity: number) {
      ['borderLeftColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor',
       'color', 'backgroundColor'].forEach((prop) => {
         clobber(el, prop, opacity);
       })
    }

    // starter.unkeyedElements.forEach((el) => {
    //   //el.style.border = '1px solid red'
    //   let opacity = Math.max(0, Math.min(1, rescale(t, 0, 1, 1, -1)));
    //   fakeOpacity(el, opacity);
    //   //el.style.filter = `opacity(${opacity})`;
    // });
    // ender.unkeyedElements.forEach((el) => {
    //   let opacity = Math.max(0, Math.min(1, rescale(t, 0, 1, 1, -1)));
    //   fakeOpacity(el, opacity);
    //   //el.style.filter = `opacity(${opacity})`;
    // });

    keys.forEach((key) => {
      let startEl = starter.keyToElements.get(key);
      let endEl = ender.keyToElements.get(key);


      startEl && (startEl.style.transformOrigin = '0 0');
      endEl && (endEl.style.transformOrigin = '0 0');

      let fromRect = getUntransformedClientRect(startEl) || getUntransformedClientRect(endEl);
      let toRect = getUntransformedClientRect(endEl) || getUntransformedClientRect(startEl);

      if (!fromRect || !toRect) {
        return;
      }

      startEl && (startEl.style.transform = matrixToString(decompose(multiply(
        this.computeRelativeParentInverse(startEl),
        compose(interpolateDecomposedTransforms(decompose(IDENTITY), decompose([
        toRect.width / fromRect.width, 0, 0,
        toRect.height / fromRect.height,
        toRect.left - fromRect.left,
        toRect.top - fromRect.top,
      ]), t))))));

      startEl && (startEl.style.opacity = (1 - t)+'');
      endEl && (endEl.style.opacity = t+'');

      endEl && (endEl.style.transform = matrixToString(decompose(multiply(
        this.computeRelativeParentInverse(endEl),
        compose(interpolateDecomposedTransforms(decompose([
        fromRect.width / toRect.width, 0, 0,
        fromRect.height / toRect.height,
        fromRect.left - toRect.left,
        fromRect.top - toRect.top,
      ]), decompose(IDENTITY), t))))));
    });
  }


  computeRelativeParentInverse(el: HTMLElement) {
    const matrix = invert(getCumulativeTransformMatrix(el.parentElement!, this.el));
    matrix[4] -= parseFloat(getComputedStyle(el.parentElement!).borderLeftWidth || '0');
    matrix[5] -= parseFloat(getComputedStyle(el.parentElement!).borderTopWidth || '0');
    matrix[4] += -el.offsetLeft + el.offsetLeft * matrix[0];
    matrix[5] += -el.offsetTop + el.offsetTop * matrix[3];
    return matrix;
  }

  render() {
    const t = this.props.percent;
    const c = React.Children.toArray(this.props.children);
    return <div ref={el => this.el = el} style={{ position: 'relative', flexGrow: 1 }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        opacity: lerp(1, 0, t),
        pointerEvents: t === 0 ? 'all' : 'none'//visibility: t === 0 ? 'visible' : 'hidden'
      }}>{c[0]}</div>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        opacity: lerp(0, 1, t),
        pointerEvents: t === 1 ? 'all' : 'none'
      }}>{c[1]}</div>
    </div>;
  }
}

injectGlobal`
  span[data-morph-key] {
    display: inline-block;
  }
`