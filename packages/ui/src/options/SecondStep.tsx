import { useState } from 'react';
import type { OwnerSecondStep, SecondStepAnswer } from '../lib/protocol.js';
import { host } from '../host.js';
import { KeyIcon } from '../components/icons.js';
import { Button, Callout, Field, Spinner } from '../components/primitives.js';
import { CONTINUE_BUTTON } from './ProviderSignIn.js';
import { Footnote, FormShell, useSubmit } from './auth-ui.js';
import { send } from '../lib/protocol.js';
import { useT } from '../i18n/react.js';

/*
 * The second step at sign-in, on a Keyrook account that has turned one on —
 * on account.keyrook.com, never here (keyrook-account's docs/console.md,
 * S21). One field takes the code or, for an app that was lost, the recovery
 * key: six digits are a code, anything else is read as the key, which is only
 * ever sent as its proof.
 */

/** What was typed, as the answer it is. */
export function answerOf(typed: string): OwnerSecondStep {
  const digits = typed.replace(/\s/g, '');
  return /^\d{6}$/.test(digits) ? { code: digits } : { recoveryKey: typed.trim() };
}

/**
 * Asks for the second step of a sign-in in progress. `ticket` is a password
 * sign-in's, for the passkey's challenge; a Google or GitHub sign-in's stays
 * with the vault service.
 */
export function SecondStepForm({
  passkeys,
  ticket,
  onAnswer,
  onBack,
}: {
  /** The account has passkeys, and one of them may answer instead. */
  passkeys: boolean;
  ticket?: string;
  onAnswer: (answer: SecondStepAnswer) => Promise<void>;
  onBack: () => void;
}) {
  const t = useT();
  const [typed, setTyped] = useState('');
  const { busy, error, run } = useSubmit();
  const passkey = passkeys ? host().accountPasskeys : undefined;
  const ready = typed.trim().length >= 6;

  return (
    <FormShell
      onBack={onBack}
      title={t('secondStep.title')}
      subtitle={t('secondStep.lead')}
      onSubmit={() => void run(async () => (ready ? onAnswer(answerOf(typed)) : undefined))}
    >
      <Field
        label={t('secondStep.field')}
        hint={t('secondStep.hint')}
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        autoFocus
        autoComplete="one-time-code"
        inputMode="text"
        spellCheck={false}
        className="font-mono text-[15px] tracking-wide"
      />

      {error && <Callout tone="danger">{error}</Callout>}

      <div className="flex flex-col gap-3">
        <Button type="submit" variant="primary" className="w-full" disabled={!ready || busy}>
          {busy ? <Spinner /> : null} {t('intro.signIn')}
        </Button>
        {passkey && (
          <button
            type="button"
            className={CONTINUE_BUTTON}
            disabled={busy}
            onClick={() =>
              void run(async () =>
                onAnswer({
                  passkey: await passkey.touch(() =>
                    send({ type: 'account/secondStepChallenge', ...(ticket ? { ticket } : {}) }),
                  ),
                }),
              )
            }
          >
            <KeyIcon className="text-[17px] text-neutral-600 dark:text-neutral-300" />
            {t('secondStep.passkey')}
          </button>
        )}
      </div>
      <Footnote>{t('secondStep.where')}</Footnote>
    </FormShell>
  );
}
