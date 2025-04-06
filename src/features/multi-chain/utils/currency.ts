/**
 * Formats a currency amount with the specified number of decimals
 * @param amount The amount to format
 * @param decimals The number of decimals to use
 * @returns The formatted amount as a string
 */
export const formatCurrency = (amount: number, decimals: number): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });

  return formatter.format(amount);
};
