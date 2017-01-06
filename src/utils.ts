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

