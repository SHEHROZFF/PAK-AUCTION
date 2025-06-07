'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthenticatedApp } from '@/components/AuthenticatedApp';

export default function Home() {
  return (
    <Provider store={store}>
      <AuthenticatedApp />
    </Provider>
  );
}
