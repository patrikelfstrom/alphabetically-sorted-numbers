type ToggleAllValuesParams = {
  currentValues: string[];
  minSelected: number;
  optionValues: string[];
};

export function areAllOptionsSelected(
  currentValues: string[],
  optionValues: string[],
): boolean {
  if (optionValues.length === 0) {
    return false;
  }

  const selectedValueSet = new Set(currentValues);

  return optionValues.every((optionValue) => selectedValueSet.has(optionValue));
}

export function getNextValues(
  currentValues: string[],
  nextValue: string,
  minSelected: number,
): string[] {
  const isSelected = currentValues.includes(nextValue);

  if (!isSelected) {
    return [...currentValues, nextValue];
  }

  if (currentValues.length <= minSelected) {
    return currentValues;
  }

  return currentValues.filter((currentValue) => currentValue !== nextValue);
}

export function getToggleAllValues({
  currentValues,
  minSelected,
  optionValues,
}: ToggleAllValuesParams): string[] {
  if (!areAllOptionsSelected(currentValues, optionValues)) {
    return [...optionValues];
  }

  if (minSelected === 0) {
    return [];
  }

  return optionValues.slice(0, minSelected);
}
