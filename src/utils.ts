export function pickFromArray(array: any[], n: number): any[] {
  let space = Math.floor(array.length / n);
  if (space === 0) {
    return array; // if the array has >= n elements, just return the array
  }
  return array.filter((_, i) => (i % space === 0) || i === array.length - 1);
}

function randInt(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export async function fetchJson<T>(url: string) {
  return new Promise<T>((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.addEventListener('load', (evt: ProgressEvent) => {
      try {
        let json = JSON.parse(request.responseText);
        if (json) {
          resolve(json);
        } else {
          reject(json);
        }
      } catch (e) {
        reject(e);
      }
    });
    request.addEventListener('error', (evt: ProgressEvent) => {
      reject(evt);
    });
    request.open('GET', url, true);
    request.send();
  });
}

let jsonpId = 0;
export async function fetchJsonP<T>(url: string) {
  const fnName = 'fetchJsonP' + (jsonpId++);
  return new Promise<T>((resolve, reject) => {
    let script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = url.replace('=?', '=' + fnName);
    script.onerror = reject;
    (window as any)[fnName] = (data: T) => {
      delete (window as any)[fnName];
      resolve(data);
    };
    document.getElementsByTagName('head')[0].appendChild(script);
  });
}