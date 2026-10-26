import { useState } from 'react';
import { liveGroups, liveItems, type VaultData } from '@authx/core';
import type { Mutate } from '../lib/protocol.js';
import { PlusIcon, TrashIcon } from '../components/icons.js';
import { Button, Field, cx } from '../components/primitives.js';
import { Section } from './Section.js';
import { useT } from '../i18n/react.js';

/**
 * Creating, ordering and removing groups.
 *
 * Assigning an account to one happens where the account is edited, not here —
 * the two lists would otherwise have to be kept in sync by eye.
 */
export function GroupsPanel({ data, mutate }: { data: VaultData; mutate: Mutate }) {
  const t = useT();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const groups = liveGroups(data);
  const items = liveItems(data);
  const countIn = (id: string) => items.filter((item) => item.groupId === id).length;
  const ungrouped = items.filter((item) => !item.groupId).length;

  return (
    <Section
      title={t('groups.title')}
      description={t('groups.description')}
    >
      <div className="flex flex-col gap-4 p-4">
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            void mutate({ op: 'groups/add', name });
            setName('');
          }}
        >
          <div className="flex-1">
            <Field
              label={t('groups.new')}
              placeholder={t('groups.newPlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" disabled={name.trim().length === 0}>
            <PlusIcon /> {t('groups.add')}
          </Button>
        </form>

        {groups.length === 0 ? (
          <p className="text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('groups.none')}</p>
        ) : (
          <ul className="rounded-xl border border-neutral-200 dark:border-neutral-800">
            {groups.map((group, index) => (
              <li
                key={group.id}
                className="flex items-center gap-3 border-b border-neutral-100 px-3 py-2.5 last:border-b-0 dark:border-neutral-900"
              >
                {/* Side by side in an app's window, where each is a finger wide. */}
                <div className="flex shrink-0 flex-col app:flex-row">
                  {([-1, 1] as const).map((direction) => (
                    <button
                      key={direction}
                      type="button"
                      aria-label={t(direction === -1 ? 'groups.moveUp' : 'groups.moveDown', { name: group.name })}
                      disabled={direction === -1 ? index === 0 : index === groups.length - 1}
                      onClick={() => void mutate({ op: 'groups/move', id: group.id, direction })}
                      className={cx(
                        'px-1 text-[9px] leading-none text-neutral-400 hover:text-neutral-700 disabled:opacity-25',
                        'dark:hover:text-neutral-200',
                      )}
                    >
                      {direction === -1 ? '▲' : '▼'}
                    </button>
                  ))}
                </div>

                {editing?.id === group.id ? (
                  <form
                    className="flex flex-1 items-center gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void mutate({ op: 'groups/rename', id: group.id, name: editing.name });
                      setEditing(null);
                    }}
                  >
                    <input
                      autoFocus
                      value={editing.name}
                      onChange={(event) => setEditing({ id: group.id, name: event.target.value })}
                      className="h-8 flex-1 rounded-lg border border-neutral-200 px-2 text-[13px] dark:border-neutral-700 dark:bg-neutral-900"
                    />
                    <Button size="sm" type="submit" variant="primary">
                      {t('common.save')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                      {t('common.cancel')}
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{group.name}</p>
                      <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
                        {t('groups.count', { count: countIn(group.id) })}
                      </p>
                    </div>

                    {confirmingDelete === group.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-neutral-600 dark:text-neutral-400">
                          {t('groups.removeNote')}
                        </span>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={async () => {
                            await mutate({ op: 'groups/delete', id: group.id });
                            setConfirmingDelete(null);
                          }}
                        >
                          {t('common.remove')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(null)}>
                          {t('common.cancel')}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => setEditing({ id: group.id, name: group.name })}
                        >
                          {t('groups.rename')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={t('groups.removeNamed', { name: group.name })}
                          onClick={() => setConfirmingDelete(group.id)}
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {groups.length > 0 && ungrouped > 0 && (
          <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
            {t('groups.ungrouped', { count: ungrouped })}
          </p>
        )}
      </div>
    </Section>
  );
}
