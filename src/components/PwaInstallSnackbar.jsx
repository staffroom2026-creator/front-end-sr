import { createElement, useEffect, useState, useSyncExternalStore } from 'react';
import { FiDownload, FiPlus, FiShare, FiX } from 'react-icons/fi';
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
  event.preventDefault();
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
  const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  return {
    isAppleMobile,
    steps: isAppleMobile
      ? [
        { icon: FiShare, text: 'Tap the Share button in Safari.' },
        { icon: FiPlus, text: 'Scroll down and tap “Add to Home Screen”.' },
        { icon: FiPlus, text: 'Tap “Add” to finish.' },
      ]
      : [
        { icon: FiDownload, text: 'Open your browser menu.' },
        { icon: FiPlus, text: 'Choose “Install Staffroom” or “Add to Home screen”.' },
      ],
  };
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
  const instructions = getInstallInstructions();

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
      setShowInstructions(true);
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
    <>
      <aside className="pwa-install-snackbar" aria-label="Install Staffroom">
        <div className="pwa-install-snackbar__icon" aria-hidden="true">
          <FiDownload size={19} />
        </div>
        <div className="pwa-install-snackbar__content">
          <strong>Add Staffroom to your home screen</strong>
          {installError && <p role="alert">{installError}</p>}
        </div>
        <button
          className="pwa-install-snackbar__action"
          type="button"
          onClick={handleInstall}
          aria-haspopup="dialog"
        >
          Install app
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
      {showInstructions && (
        <div
          className="pwa-install-guide-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowInstructions(false);
          }}
        >
          <section
            className="pwa-install-guide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-guide-title"
          >
            <header className="pwa-install-guide__header">
              <div className="pwa-install-guide__app-icon" aria-hidden="true">
                <FiDownload size={20} />
              </div>
              <button
                className="pwa-install-guide__close"
                type="button"
                onClick={() => setShowInstructions(false)}
                aria-label="Close install instructions"
              >
                <FiX size={20} />
              </button>
            </header>
            <h2 id="pwa-install-guide-title">Add Staffroom to your Home Screen</h2>
            <p className="pwa-install-guide__intro">
              {instructions.isAppleMobile
                ? 'Follow these steps in Safari to install Staffroom on your device.'
                : 'Follow these steps in your browser to install Staffroom on your device.'}
            </p>
            <ol className="pwa-install-guide__steps">
              {instructions.steps.map((step, index) => (
                <li key={step.text}>
                  <span className="pwa-install-guide__step-number">{index + 1}</span>
                  {createElement(step.icon, { size: 18, 'aria-hidden': true })}
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
            <button
              className="pwa-install-guide__done"
              type="button"
              onClick={() => setShowInstructions(false)}
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </>
  );
}
