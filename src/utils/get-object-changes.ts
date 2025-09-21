export function getObjectChanges<T extends object>(current: T, before: T): Partial<T> {
  const changes: Partial<T> = {};
  (Object.keys(current) as (keyof T)[]).forEach((key) => {
    if (current[key] !== before[key]) {
      changes[key] = current[key];
    }
  });
  return changes;
}
