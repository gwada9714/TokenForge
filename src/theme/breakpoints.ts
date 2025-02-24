export const values = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export const up = (key: string) => `@media (min-width: ${values[key]}px)`;
export const down = (key: string) => `@media (max-width: ${values[key] - 0.05}px)`;
export const between = (start: string, end: string) => 
  `@media (min-width: ${values[start]}px) and (max-width: ${values[end] - 0.05}px)`;

export const breakpoints = {
  values,
  up,
  down,
  between,
};
