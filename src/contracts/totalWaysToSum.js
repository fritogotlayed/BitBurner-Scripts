function countWays(n) {
  let table = new Array(n + 1);

  // Init things
  table[0] = 1;
  for (let i = 1; i < n + 1; i++) {
    table[i] = 0;
  }

  // Do the math
  for (let i = 1; i < n; i++) {
    for (let j = i; j <= n; j++) {
      table[j] += table[j - i];
    }
  }

  return table[n];
}

const input = Number(process.argv[2]);
console.log(`input: ${input}`);
console.log(`ways: ${countWays(input)}`);
