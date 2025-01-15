import { ComponentType } from 'react';

export type PageComponent = ComponentType<any> & {
  getLayout?: (page: JSX.Element) => JSX.Element;
};
