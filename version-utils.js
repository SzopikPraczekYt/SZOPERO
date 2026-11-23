function parseVersion(version) {
  if (typeof version !== "string") {
    throw new Error("Wersja musi być tekstem.");
  }

  const parts = version.split(".");

  if (parts.length !== 3 && parts.length !== 4) {
    throw new Error("Nieprawidłowy format wersji: " + version);
  }

  if (!parts.every(part => /^(0|[1-9]\d*)$/.test(part))) {
    throw new Error("Nieprawidłowy format wersji: " + version);
  }

  const numbers = parts.map(Number);

  if (numbers.some(number => !Number.isSafeInteger(number) || number > 65535)) {
    throw new Error("Liczba w wersji przekracza dozwolony zakres.");
  }

  while (numbers.length < 4) {
    numbers.push(0);
  }

  return numbers;
}

function compareVersions(first, second) {
  const a = parseVersion(first);
  const b = parseVersion(second);

  for (let i = 0; i < 4; i++) {
    if (a[i] !== b[i]) {
      return a[i] > b[i] ? 1 : -1;
    }
  }

  return 0;
}

module.exports = {
  parseVersion,
  compareVersions
};
