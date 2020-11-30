/**
 * Calculates the n-th triangular number in a naive approach.
 * Doesn't matter cause n won't be greater than 5.
 * @param n
 */
export function triangularNumber(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
}
