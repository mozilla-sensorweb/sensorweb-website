import * as React from 'react';
import * as _ from 'lodash';
const { injectGlobal } = require<any>('styled-components');

function lerp(start: number, end: number, percent: number) {
  return start + percent * (end - start);
}


function parseFontWeight(s: string) {
  return parseInt(s === 'bold' ? '700' : s === 'normal' ? '400' : s);
}

function nearestCorrespondingParentKeys(node?: HTMLElement | null) {
  if (!node) {
    return [];
  }
  let parents = [];
  while ((node = node.parentElement)) {
    // Because of an insanely stupid WebKit bug, we can't use `.dataset` to reliably access the property.
    // https://bugs.webkit.org/show_bug.cgi?id=161454
    if (node.getAttribute('data-morph-key')) {
      parents.unshift(node.getAttribute('data-morph-key')!);
    }
  }
  return parents;
}

function keyedElements(root: HTMLElement) {
  const els = root.querySelectorAll('[data-morph-key]');
  const ret = new Map<string, HTMLElement>();
  for (let i = 0; i < els.length; i++) {
    const el = els[i] as HTMLElement;
    ret.set(el.getAttribute('data-morph-key')!, el);
  }
  return ret;
}
function proportionRect(p1: ClientRect, c1: ClientRect, p2: ClientRect) {
  return {
    left: p2.left + (c1.left - p1.left) / p1.width * p2.width,
    top: p2.top + (c1.top - p1.top) / p1.height * p2.height,
    width: c1.width,
    height: c1.height
  } as ClientRect;
}


interface MorphTweenProps {
  percent: number;
}
export class MorphTween extends React.Component<MorphTweenProps, any> {
  a: HTMLElement;
  b: HTMLElement;
  c: HTMLElement;

  cachedRects = new Map<HTMLElement, ClientRect>();

  getRect(el: HTMLElement) {
    let rect = this.cachedRects.get(el);
    if (!rect) {
      rect = el.getBoundingClientRect();
      this.cachedRects.set(el, rect);
    }
    return rect;
  }

  componentDidUpdate() {
    const aMorphs = keyedElements(this.a);
    const bMorphs = keyedElements(this.b);
    const allKeys = _.uniq([...aMorphs.keys(), ...bMorphs.keys()]);
    aMorphs.set('ROOT', this.a);
    bMorphs.set('ROOT', this.b);


    interface Anim {
      key: string;
      parentKey: string;
      el: HTMLElement;
      from: any;
      to: any;
    }
    const animMap = new Map<string, Anim>();

    if (this.props.percent === 0 || this.props.percent === 1) {
      this.cachedRects.clear();
    }

    allKeys.forEach((key: string) => {
      const a = aMorphs.get(key);
      const b = bMorphs.get(key);

      // Transformations must be relative to the nearest corresponding ancestor of both elements.
      // (Or just the one, if there is only one.)
      //const parents = nearestCorrespondingParentsOfBoth(a, b);
      let parentKey: string;
      let parentA: HTMLElement;
      let parentB: HTMLElement;
      let parentsA = nearestCorrespondingParentKeys(a).filter(k => aMorphs.has(k) && bMorphs.has(k));
      let parentsB = nearestCorrespondingParentKeys(b).filter(k => aMorphs.has(k) && bMorphs.has(k));
      // Find the nearest common ancestor of both. That's the [i - 1] comparison as described here:
      // http://stackoverflow.com/questions/1484473. However, in the case where one of the arrays
      // is empty (meaning the element is simply not present there), we want to return the outermost
      // parent that is contained in both A and B. That's the [i] comparison.
      for (let i = 0; ; i++) {
        if (parentsA[i] !== parentsB[i] || !parentsA[i] || !parentsB[i]) {
          parentKey = parentsA[i - 1] || parentsA[i] || parentsB[i];
          parentA = aMorphs.get(parentKey)!;
          parentB = bMorphs.get(parentKey)!;
          break;
        }
      }

      let rectA = a && this.getRect(a);
      let rectB = b && this.getRect(b);
      let rectParentA = this.getRect(parentA);
      let rectParentB = this.getRect(parentB);
      let startOpacity = 1;
      let endOpacity = 1;

      if (!rectA || (rectA.width === 0 && rectA.height === 0)) {
        rectA = proportionRect(rectParentB, rectB!, rectParentA);
        startOpacity = 0;
      }
      if (!rectB || (rectB.width === 0 && rectB.height === 0)) {
        rectB = rectA;
        rectParentB = rectParentA;
        endOpacity = 0;
      }

      const from: any = {
        x: rectA!.left - rectParentA.left - parseInt(getComputedStyle(parentA).borderLeftWidth || '0'),
        y: rectA!.top - rectParentA.top - parseInt(getComputedStyle(parentA).borderTopWidth || '0'),
        width: rectA!.width,
        height: rectA!.height,
        opacity: startOpacity,
      };
      const to: any = {
        x: rectB!.left - rectParentB.left,
        y: rectB!.top - rectParentB.top,
        width: rectB!.width,
        height: rectB!.height,
        opacity: endOpacity,
      };
      const styleProps = [/*'width', 'height',*/ 'fontSize', 'fontWeight', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'];
      if (a && b) {
        const styleA = getComputedStyle(a) as any;
        const styleB = getComputedStyle(b) as any;
        styleProps.forEach((prop) => {
          if (styleA[prop] !== styleB[prop]) {
            //key === 'favorite' && console.log('prop?', prop, styleA[prop], styleB[prop], rectA!.height, rectB!.height);
            from[prop] = styleA[prop];
            to[prop] = styleB[prop];
          }
        });
      }

      let el = this.c.querySelector(`[data-morph-key="${key}-C"]`) as HTMLElement | undefined;
      if (!el) {
        el = (b || a)!.cloneNode(true) as HTMLElement;
        el.classList.add('hideMorphing');
        el.setAttribute('data-morph-key', key + '-C');
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.margin = '0';
        el.style.visibility = 'visible'; // override hideMorphing!
        this.c.appendChild(el);
      }

      animMap.set(key, {
        key,
        parentKey,
        el,
        from,
        to,
      });
    });

    // Assemble the tree.
    for (let anim of animMap.values()) {
      let animParent = animMap.get(anim.parentKey);
      (animParent && animParent.el || this.c).appendChild(anim.el);
    }

    function addUnit(key: string, value: number) {
      if (key === 'opacity' || key === 'fontWeight') {
        return value + '';
      } else {
        return value + 'px';
      }
    }

    // Apply transformations.
    [...animMap.values()].forEach((anim) => {
      for (let key in anim.from) {
        if (key === 'x' || key === 'y') {
          continue;
        }
        (anim.el.style as any)[key] = addUnit(key, lerp(parseFloat(anim.from[key]), parseFloat(anim.to[key]), this.props.percent));
      }
      const x = lerp(anim.from.x, anim.to.x, this.props.percent);
      const y = lerp(anim.from.y, anim.to.y, this.props.percent);
      anim.el.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  render() {
    const t = this.props.percent;
    const c = React.Children.toArray(this.props.children);
    const isMorphing = t > 0 && t < 1;
    return <div style={{position: 'relative', flexGrow: 1}}>
      <div ref={el => this.a = el} data-morph-key="ROOT" className={isMorphing ? 'hideMorphing' : ''} style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        opacity: lerp(1, 0, t * 2),
        pointerEvents: t === 0 ? 'all' : 'none'//visibility: t === 0 ? 'visible' : 'hidden'
      }}>{c[0]}</div>
      <div ref={el => this.b = el} data-morph-key="ROOT" className={isMorphing ? 'hideMorphing' : ''} style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        opacity: lerp(0, 1, Math.max(0, (t - 0.5) * 2)),
        pointerEvents: t === 1 ? 'all' : 'none'
      }}>{c[1]}</div>
      <div ref={el => this.c = el} style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        display: t > 0 && t < 1 ? 'block' : 'none'
      }}></div>
    </div>;
  }
}

injectGlobal`
  .hideMorphing [data-morph-key] {
    visibility: hidden;
  }
  span[data-morph-key] {
    display: inline-block;
  }
`