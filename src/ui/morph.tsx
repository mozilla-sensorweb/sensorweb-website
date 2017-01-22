import * as React from 'react';
const { injectGlobal } = require<any>('styled-components');

function lerp(start: number, end: number, percent: number) {
  return start + percent * (end - start);
}


function parseFontWeight(s: string) {
  return parseInt(s === 'bold' ? '700' : s === 'normal' ? '400' : s);
}


interface MorphTweenProps {
  percent: number;
}
export class MorphTween extends React.Component<MorphTweenProps, any> {
  a: HTMLElement;
  b: HTMLElement;
  c: HTMLElement;

  componentDidUpdate() {
    const aMorphs = this.a.querySelectorAll('[data-morph-key]');
    //console.log('morph', this.props.percent)
    const rect = this.c.getBoundingClientRect();
    interface MorphingElement {
      elA: HTMLElement;
      elB: HTMLElement;
      elC?: HTMLElement;
      rectA: ClientRect;
      rectB: ClientRect;
      styleA: CSSStyleDeclaration;
      styleB: CSSStyleDeclaration;
    }

    const morphs: MorphingElement[] = [];

    for (let i = 0; i < aMorphs.length; i++) {
      const aEl = (aMorphs[i] as HTMLElement);
      const bEl = this.b.querySelector(`[data-morph-key="${aEl.dataset['morphKey']}"]`) as HTMLElement;
      let cEl = this.c.querySelector(`[data-morph-key="${aEl.dataset['morphKey']}"]`) as HTMLElement;

      morphs.push({
        elA: aEl,
        elB: bEl,
        elC: cEl,
        rectA: aEl.getBoundingClientRect(),
        rectB: bEl.getBoundingClientRect(),
        styleA: getComputedStyle(aEl),
        styleB: getComputedStyle(bEl),
      });
    }


    const elsToAdd = morphs.map((morph) => {
      if (!morph.elC) {
        morph.elC = morph.elB.cloneNode(true) as HTMLElement;
        morph.elC.style.position = 'absolute';
        morph.elC.style.top = '0';
        morph.elC.style.left = '0';
        return morph.elC;
      }
    }).filter((el) => !!el) as HTMLElement[];

    morphs.forEach((morph) => {
      const x = lerp(morph.rectA.left - rect.left, morph.rectB.left - rect.left, this.props.percent);
      const y = lerp(morph.rectA.top - rect.top, morph.rectB.top - rect.top, this.props.percent);
      const c = morph.elC!;
      c.style.transform = `translate(${x}px, ${y}px)`;
      c.style.width = lerp(parseFloat(morph.styleA.width || ''), parseFloat(morph.styleB.width || ''), this.props.percent) + 'px';
      c.style.height = lerp(parseFloat(morph.styleA.height || ''), parseFloat(morph.styleB.height || ''), this.props.percent) + 'px';
      c.style.fontSize = lerp(parseInt(morph.styleA.fontSize || ''), parseInt(morph.styleB.fontSize || ''), this.props.percent) + 'px';
      c.style.fontWeight = lerp(parseFontWeight(morph.styleA.fontWeight || ''), parseFontWeight(morph.styleB.fontWeight || ''), this.props.percent) + '';
    });

    elsToAdd.forEach((el) => {
      this.c.appendChild(el);
    });
  }

  render() {
    const t = this.props.percent;
    const c = React.Children.toArray(this.props.children);
    const isMorphing = t > 0 && t < 1;
    return <div style={{position: 'relative', flexGrow: 1}}>
      <div ref={el => this.a = el} className={isMorphing ? 'hideMorphing' : ''}  style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        opacity: lerp(1, 0, t * 2)
        //visibility: t === 0 ? 'visible' : 'hidden'
      }}>{c[0]}</div>
      <div ref={el => this.b = el} className={isMorphing ? 'hideMorphing' : ''} style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        opacity: lerp(0, 1, Math.max(0, (t - 0.5) * 2))
        //visibility: t === 1 ? 'visible' : 'hidden'
      }}>{c[1]}</div>
      <div ref={el => this.c = el} style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        visibility: t > 0 && t < 1 ? 'visible' : 'hidden'
      }}></div>
    </div>;
  }
}

injectGlobal`
  .hideMorphing [data-morph-key] {
    visibility: hidden;
  }
`