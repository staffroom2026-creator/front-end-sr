import { useEffect, useState, useSyncExternalStore } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import './PwaInstallSnackbar.css';

const DISMISSED_KEY = 'staffroom-pwa-install-dismissed';

let deferredInstallPrompt = null;
const installPromptSubscribers = new Set();

function subscribeToInstallPrompt(callback) {
  installPromptSubscribers.add(callback);
  return () => installPromptSubscribers.delete(callback);
}

function getDeferredInstallPrompt() {
  return deferredInstallPrompt;
}

function setDeferredInstallPrompt(prompt) {
  deferredInstallPrompt = prompt;
  installPromptSubscribers.forEach((callback) => callback());
}

const handleBeforeInstallPrompt = (event) => {
  setDeferredInstallPrompt(event);
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  });
}

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function getInstallInstructions() {
  const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent);

  return isAppleMobile
    ? 'Tap Share, then choose “Add to Home Screen”.'
    : 'Open your browser menu and choose “Install Staffroom” or “Add to Home screen”.';
}

export default function PwaInstallSnackbar() {
  const installPrompt = useSyncExternalStore(
    subscribeToInstallPrompt,
    getDeferredInstallPrompt,
    () => null,
  );
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installError, setInstallError] = useState('');

  useEffect(() => {
    if (isAppInstalled() || window.sessionStorage.getItem(DISMISSED_KEY)) {
      return undefined;
    }

    const showSnackbar = window.setTimeout(() => setIsVisible(true), 1200);
    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.clearTimeout(showSnackbar);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismissSnackbar = () => {
    window.sessionStorage.setItem(DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowInstructions((visible) => !visible);
      return;
    }

    setInstallError('');

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      setDeferredInstallPrompt(null);

      if (outcome === 'accepted') {
        setIsVisible(false);
      }
    } catch {
      setInstallError('Installation could not be started. Use your browser menu to install Staffroom.');
      setShowInstructions(true);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside className="pwa-install-snackbar" aria-label="Install Staffroom">
      <div className="pwa-install-snackbar__icon" aria-hidden="true">
        <FiDownload size={19} />
      </div>
      <div className="pwa-install-snackbar__content">
        <strong>Add Staffroom to your home screen</strong>
        {installError && <p role="alert">{installError}</p>}
        {showInstructions && (
          <p role="status">{getInstallInstructions()}</p>
        )}
      </div>
      <button
        className="pwa-install-snackbar__action"
        type="button"
        onClick={handleInstall}
        aria-expanded={showInstructions}
      >
        {installPrompt ? 'Install app' : showInstructions ? 'Got it' : 'How to install'}
      </button>
      <button
        className="pwa-install-snackbar__close"
        type="button"
        onClick={dismissSnackbar}
        aria-label="Dismiss install message"
      >
        <FiX size={18} />
      </button>
    </aside>
  );
}
