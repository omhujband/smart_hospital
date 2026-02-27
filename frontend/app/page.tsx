'use client';

import { useOSStore } from './store/osStore';
import LoginScreen from './components/LoginScreen';
import Desktop from './components/Desktop';
import WindowManager from './components/WindowManager';

export default function Home() {
  const isLoggedIn = useOSStore(state => state.isLoggedIn);

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <>
      <Desktop />
      <WindowManager />
    </>
  );
}
