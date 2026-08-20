import React, { Suspense, lazy } from 'react';
import { Loader } from '../components/Loader';

export function lazyScreen<P extends object>(
  loader: () => Promise<{ default: React.ComponentType<P> }>,
) {
  const Component = lazy(loader);
  return function LazyScreen(props: P) {
    return (
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
