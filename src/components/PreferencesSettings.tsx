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
        <Dialog.Content className="settings-dialog" aria-describedby={undefined}>
          <header className="settings-heading">
            <Dialog.Title>Preferences</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="icon-button" aria-label="Close settings">
                <X size={20} />
              </button>
            </Dialog.Close>
          </header>
          <div className="settings-field">
            <span>Theme</span>
            <ThemeSelector />
          </div>
          <div className="settings-field">
            <span>Currency</span>
            <PresentationControls />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
