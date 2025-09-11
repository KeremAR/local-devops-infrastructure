import {
  component$,
  Slot,
  createContextId,
  useStore,
  useContextProvider,
  useVisibleTask$,
} from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import type { User } from '~/types';

export interface AppState {
  user: User | null;
  token: string;
}

export const AppContext = createContextId<AppState>('app.context');

export default component$(() => {
  const appState = useStore<AppState>({
    user: null,
    token: '',
  });
  useContextProvider(AppContext, appState);

  const nav = useNavigate();
  const loc = useLocation();

  useVisibleTask$(({ track }) => {
    track(() => appState.user);

    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!appState.user && savedToken && savedUser) {
      appState.token = savedToken;
      appState.user = JSON.parse(savedUser);
    }

    if (!appState.user && !loc.url.pathname.endsWith('/login/')) {
      nav('/login');
    } else if (appState.user && loc.url.pathname.endsWith('/login/')) {
      nav('/');
    }
  });

  return <Slot />;
});
