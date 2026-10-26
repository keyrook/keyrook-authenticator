import { useCallback, useState } from 'react';
import type { VaultStatus } from '../lib/protocol.js';
import { ErrorBoundary } from '../components/ErrorBoundary.js';
import { useActivityPing, useTheme, useVault } from '../components/hooks.js';
import { Logo } from '../components/icons.js';
import { Spinner } from '../components/primitives.js';
import { RecoveryScreen } from './RecoveryScreen.js';
import { SetupScreen } from './SetupScreen.js';
import { UnlockScreen } from './UnlockScreen.js';
import { UnrecoverableScreen } from './UnrecoverableScreen.js';
import { VaultScreen } from './VaultScreen.js';

/** The popup, with a way back if one of its screens throws while drawing. */
export function App() {
  return (
    <ErrorBoundary className="h-[480px] app:h-(--app-height)">
      <Popup />
    </ErrorBoundary>
  );
}

function Popup() {
  const { status, data, error, refresh, mutate, setStatus } = useVault();
  const [recovering, setRecovering] = useState(false);
  const [signInNext, setSignInNext] = useState(false);

  useTheme(data?.settings.theme);
  useActivityPing(status?.state === 'unlocked');

  const handleAuthenticated = useCallback(
    (next: VaultStatus) => {
      setRecovering(false);
      setStatus(next);
    },
    [setStatus],
  );

  if (error) {
    return (
      <Centered>
        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
      </Centered>
    );
  }

  if (!status) {
    return (
      <Centered>
        <Spinner className="h-5 w-5 text-neutral-400" />
      </Centered>
    );
  }

  if (status.state === 'uninitialized') {
    return (
      <SetupScreen
        onCreating={(then) => setSignInNext(then === 'signIn')}
        onCreated={handleAuthenticated}
      />
    );
  }

  if (recovering) {
    return (
      <RecoveryScreen onRecovered={handleAuthenticated} onCancel={() => setRecovering(false)} />
    );
  }

  if (status.state === 'unrecoverable') {
    return (
      <UnrecoverableScreen
        onReset={refresh}
        hasRecovery={status.hasRecovery}
        onUseRecoveryKey={() => setRecovering(true)}
      />
    );
  }

  if (status.state === 'locked') {
    return (
      <UnlockScreen
        onUnlocked={handleAuthenticated}
        hasRecovery={status.hasRecovery}
        onUseRecoveryKey={() => setRecovering(true)}
        passkeys={status.passkeys}
      />
    );
  }
  return (
    <VaultScreen
      data={status.data}
      protection={status.protection}
      mutate={mutate}
      refresh={refresh}
      startWithSignIn={signInNext}
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[480px] flex-col items-center app:h-(--app-height) justify-center gap-4 px-8 text-center">
      <Logo className="h-9 w-9 opacity-90" />
      {children}
    </div>
  );
}
