import * as React from 'react';

export default function mergeReactTree(nodes: Node[]) {
  const nodeToKey = new Map<string, Node[]>();
  breadthFirst(nodes).forEach((node) => {
    let id = NodeUtils.getId(node);
    if (id) {
      if (nodeToKey.has(id)) {
        nodeToKey.get(id)!.push(node);
      } else {
        nodeToKey.set(id, [node]);
      }
    }
  });
  return {
    tree: mergeReactTreeImpl(nodes, nodeToKey),
    nodeKeys: [...nodeToKey.keys()]
  };
}

function mergeReactTreeImpl(
  nodes: Node[],
  nodeToKey: Map<string, Node[]>,
  visited = new Set()): Node[] {

  const result: Node[] = new Array(nodes.length);

  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    let id = NodeUtils.getId(node);
    if (NodeUtils.isValidElement(node) && id && !visited.has(id)) {
      visited.add(id);
      const correspondingAll = nodeToKey.get(id)
      const corresponding = correspondingAll && correspondingAll[1];
      let newEl = document.createElement(node.tagName);
      newEl.setAttribute('data-source', corresponding ? 'BOTH' : NodeUtils.getSource(node)!);
      newEl.setAttribute('data-morph-key', id);
      mergeReactTreeImpl(
        interleaveArray(
          NodeUtils.children(node, true),
          NodeUtils.children(corresponding, true)), nodeToKey, visited).forEach((child) => {
        newEl.appendChild(child);
      });
      result[i] = newEl;
    } else {
      //result[i] = null;
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    let id = NodeUtils.getId(node);
    if (!id) {
      if (NodeUtils.isValidElement(node)) {
        let newEl = document.createElement(node.tagName);
        newEl.setAttribute('data-source', NodeUtils.getSource(node)!);
        mergeReactTreeImpl(NodeUtils.children(node, !NodeUtils.isSpanified(node)), nodeToKey, visited).forEach((child) => {
          newEl.appendChild(child);
        })
      } else {
        result[i] = node;
      }
    }
  }

  return result;
}


const NodeUtils = {
  isValidElement(node: any): node is Element {
    return node instanceof Element;
  },
  getId(node: Node) {
    return NodeUtils.isValidElement(node) && node.getAttribute('data-morph-key');
  },
  getSource(node: Node) {
    return NodeUtils.isValidElement(node) && node.getAttribute('data-source') || null;
  },
  isSpanified(node: Node) {
    return NodeUtils.isValidElement(node) && node.getAttribute('data-spanified');
  },
  toString(node: Node): string {
    if (NodeUtils.isValidElement(node)) {
      return `<${node.tagName} id=${NodeUtils.getId(node)}> ${NodeUtils.children(node).map(NodeUtils.toString)} </${node.tagName}>`;
    } else {
      return node + '';
    }
  },
  children(node?: Node, spanify: boolean = false): Node[] {
    if (node && NodeUtils.isValidElement(node)) {
      const source = NodeUtils.getSource(node);
      const children = [];
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (NodeUtils.isValidElement(child)) {
          source && child.setAttribute('data-source', source);
          children.push(child);
        } else if (spanify) {
          let span = document.createElement('span');
          span.appendChild(child);
          children.push(span);
        } else {
          children.push(child);
        }
      }
      return children;
    } else {
      return [];
    }
  }
};


function interleaveArray<T>(a: T[], b: T[]): T[] {
  let result = []
  for (let i = 0; i < a.length || i < b.length; i++) {
    if (i < a.length) {
      result.push(a[i]);
    }
    if (i < b.length) {
      result.push(b[i]);
    }
  }
  return result;
}

function breadthFirst(nodes: Node[]): Node[] {
  const queue = nodes.slice();
  let result = [];
  while (queue.length) {
    const node = queue.shift()!;
    result.push(node);
    for (let child of NodeUtils.children(node)) {
      queue.push(child);
    }
  }
  return result;
}

// console.clear()
// let merged = mergeReactTree([
// <div id="ROOT" data-source="X">
// 	<div id="A">A
// 	  <div id="B">B
// 	    <div id="C">C</div>
// 	    <div>D</div>
//     </div>
//   </div>
// 	<div id="A2">A
// 	  <div id="B2">B
// 	    <div id="C2">C</div>
// 	    <div>ee</div>
// 	    <div>ff</div>
//     </div>
//   </div>
// </div>,
// <div id="ROOT" data-source="Y">
// 	<div id="A">A
// 	  <div id="B">B
// 	    <div id="C">C</div>
// 	    <div id="D">DD</div>
// 	    <div>E</div>
//     </div>
//   </div>
// </div>
// ])
// // let merged = mergeReactTree(
// // <div id="ROOT">
// // 	<div id="B">B</div>
// // 	<div id="B2">B2</div>
// // </div>,
// // <div id="ROOT">
// // 	<div id="B">B</div>
// // 	<div id="B3">B3</div>
// // </div>
// // )
// console.log('MERGED',merged)
// console.log(ReactDOM.render(<div>{merged}</div>, document.getElementById('container')))