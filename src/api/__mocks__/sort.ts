function isDate(value: string) {
  return !isNaN(Date.parse(value));
}

function compareDates(a: string, b: string, direction: string) {
  if (direction === 'asc') {
    return new Date(a).getTime() - new Date(b).getTime();
  } else {
    return new Date(b).getTime() - new Date(a).getTime();
  }
}

function compareStrings(a: string, b: string, direction: string) {
  if (direction === 'asc') {
    return String(a).localeCompare(String(b));
  } else {
    return String(b).localeCompare(String(a));
  }
}

function compareNumbers(a: number, b: number, direction: string) {
  if (direction === 'asc') {
    return a - b;
  } else {
    return b - a;
  }
}


function sort<T extends object>(a: T, b: T, sort: string): number {
  const [ field, direction ] = sort.split(':');

  const left = a[field as keyof T];
  const right = b[field as keyof T];
  
  if (Number.isInteger(left)) {
    return compareNumbers(Number(left), Number(right), direction);
  } else if (typeof left === 'string') {
    if (isDate(left)) {
      return compareDates(left, right as string, direction);
    } else {
      return compareStrings(left, right as string, direction);
    }
  }

  return 0;
};

export function sortBy<T extends object>(s: string) {
  return (a: T, b: T) => sort<T>(a, b, s);
}
