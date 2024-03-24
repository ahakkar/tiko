const formatPercentage = (numberStr: string) => {
  const number = parseFloat(numberStr);

  if (isNaN(number) || number < 0.0 || number > 1.0) {
    console.log(numberStr, typeof numberStr);
    if (isNaN(number)) {
      console.log('NaN');
    }
    console.log('numberStr', numberStr);
    return 'Invalid aleprosentti';
  }

  const percentage = (number * 100).toFixed(0);
  return `${percentage} %`;
};

const formatDate = (value: {toLocaleDateString: (arg0: string) => unknown}) => {
  if (value instanceof Date) {
    return value.toLocaleDateString('fi-FI');
  } else {
    console.error('formatDate helper received a non-date value:', value);
    return 'Invalid Date';
  }
};

export default {
  formatDate: formatDate,
  formatPercentage: formatPercentage,
  not: (bool: boolean) => !bool,
};
