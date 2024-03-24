export default {
  formatDate: (value: {toLocaleDateString: (arg0: string) => unknown}) => {
    if (value instanceof Date) {
      return value.toLocaleDateString('fi-FI');
    } else {
      console.error('formatDate helper received a non-date value:', value);
      return 'Invalid Date';
    }
  },
  not: (bool: boolean) => !bool,
};
