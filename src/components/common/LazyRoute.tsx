import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import LoadingComponent from './LoadingComponent';
import { LazyRouteProps } from '../../types/router';

const LazyRoute: React.FC<LazyRouteProps> = ({ component: Component, path }) => {
  return (
    <Route
      path={path}
      element={
        <Suspense fallback={<LoadingComponent />}>
          <Component />
        </Suspense>
      }
    />
  );
};

export default LazyRoute;
