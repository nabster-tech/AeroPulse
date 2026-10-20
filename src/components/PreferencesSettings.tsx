import * as Dialog from '@radix-ui/react-dialog';
import { Settings, X } from 'lucide-react';
import { ThemeSelector } from '../theme';
import { PresentationControls } from '../presentation';
import './preferences-settings.css';

export function PreferencesSettings() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="icon-button settings-trigger"
          aria-label="Open settings"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="settings-overlay" />
        <Dialog.Content className="settings-dialog">
          <header className="settings-heading">
            <Dialog.Title>Preferences</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="icon-button" aria-label="Close settings">
                <X size={20} />
              </button>
            </Dialog.Close>
          </header>
          <Dialog.Description className="settings-description">
            Customize your workspace. Changes apply immediately.
          </Dialog.Description>
          <section className="settings-field">
            <h3>Appearance</h3>
            <p>Choose a theme or follow your device.</p>
            <ThemeSelector />
          </section>
          <section className="settings-field">
            <h3>Currency</h3>
            <p>Choose the display currency for monetary values.</p>
            <PresentationControls />
          </section>
          <p className="settings-hint">
            Click the toolbar clock to switch between local time and UTC.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
