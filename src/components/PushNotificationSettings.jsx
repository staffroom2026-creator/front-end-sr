import { useEffect, useState } from 'react';
import { FiAlertCircle, FiBell, FiCheckCircle } from 'react-icons/fi';
import { apiErrorMessage } from '../services/api';
import { pushNotificationService } from '../services/pushNotificationService';

const isPushSupported = () => (
  typeof window !== 'undefined'
  && window.isSecureContext
  && 'Notification' in window
  && 'serviceWorker' in navigator
  && 'PushManager' in window
);

const initialStatus = () => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission === 'denied' ? 'blocked' : 'checking';
};

const decodeVapidKey = (encodedKey) => {
  const normalizedKey = encodedKey.replace(/-/g, '+').replace(/_/g, '/');
  const paddedKey = normalizedKey.padEnd(Math.ceil(normalizedKey.length / 4) * 4, '=');
  const rawKey = window.atob(paddedKey);

  return Uint8Array.from(rawKey, (character) => character.charCodeAt(0));
};

export default function PushNotificationSettings() {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isPushSupported()) return undefined;
    let active = true;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await pushNotificationService.saveSubscription(subscription.toJSON());
          if (active) setStatus('enabled');
        } else if (active) {
          setStatus(Notification.permission === 'denied' ? 'blocked' : 'disabled');
        }
      } catch (subscriptionError) {
        if (active) {
          setStatus('disabled');
          setError(apiErrorMessage(subscriptionError, 'Unable to check push notification settings.'));
        }
      }
    };

    checkSubscription();
    return () => {
      active = false;
    };
  }, []);

  const handleToggle = async () => {
    if (!isPushSupported()) {
      setStatus('unsupported');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (status === 'enabled') {
        if (existingSubscription) {
          await pushNotificationService.removeSubscription(existingSubscription.endpoint);
          await existingSubscription.unsubscribe();
        }
        setStatus('disabled');
        return;
      }

      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'blocked' : 'disabled');
        setError('Allow notifications in your browser to receive Staffroom updates.');
        return;
      }

      const keyResponse = await pushNotificationService.getPublicKey();
      const publicKey = keyResponse?.data?.data?.public_key ?? keyResponse?.data?.public_key;
      if (typeof publicKey !== 'string' || !publicKey) {
        throw new Error('The server did not provide its Web Push public key.');
      }

      const subscription = existingSubscription || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(publicKey),
      });
      await pushNotificationService.saveSubscription(subscription.toJSON());
      setStatus('enabled');
    } catch (subscriptionError) {
      setError(apiErrorMessage(subscriptionError, 'Unable to update push notification settings.'));
    } finally {
      setBusy(false);
    }
  };

  const enabled = status === 'enabled';
  const unavailable = status === 'unsupported';
  const blocked = status === 'blocked';
  const statusText = unavailable
    ? 'Push notifications are not supported here. Use a secure HTTPS connection and a supported browser.'
    : blocked
      ? 'Notifications are blocked by your browser. Change the site permission in browser settings to enable them.'
      : status === 'checking'
        ? 'Checking this device…'
        : enabled
          ? 'This device will receive Staffroom updates, even when the app is closed.'
          : 'Get timely Staffroom updates on this browser or installed PWA.';

  return (
    <section
      aria-labelledby="push-notification-settings-title"
      style={{
        alignItems: 'center',
        background: '#fff',
        border: '1px solid #e4e9e7',
        borderRadius: 16,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
        marginTop: 24,
        padding: 20,
      }}
    >
      <div style={{ alignItems: 'flex-start', display: 'flex', gap: 14, minWidth: 240 }}>
        <span
          aria-hidden="true"
          style={{
            alignItems: 'center',
            background: enabled ? '#e7f8ee' : '#f1f5f3',
            borderRadius: 12,
            color: enabled ? '#16864a' : '#52645b',
            display: 'inline-flex',
            height: 42,
            justifyContent: 'center',
            width: 42,
          }}
        >
          <FiBell size={20} />
        </span>
        <div>
          <h2 id="push-notification-settings-title" style={{ color: '#17251e', fontSize: 16, margin: '0 0 5px' }}>
            Push notifications
          </h2>
          <p aria-live="polite" style={{ color: '#64736b', fontSize: 13, lineHeight: 1.5, margin: 0, maxWidth: 520 }}>
            {statusText}
          </p>
          {error && (
            <p role="alert" style={{ alignItems: 'center', color: '#b42318', display: 'flex', fontSize: 12, gap: 6, margin: '8px 0 0' }}>
              <FiAlertCircle aria-hidden="true" /> {error}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={busy || status === 'checking' || unavailable || blocked}
        aria-pressed={enabled}
        style={{
          background: enabled ? '#f2f5f3' : '#17874e',
          border: enabled ? '1px solid #d5ded9' : '1px solid #17874e',
          borderRadius: 10,
          color: enabled ? '#34443b' : '#fff',
          cursor: busy || status === 'checking' || unavailable || blocked ? 'not-allowed' : 'pointer',
          fontSize: 13,
          fontWeight: 700,
          minHeight: 40,
          opacity: busy || status === 'checking' || unavailable || blocked ? 0.65 : 1,
          padding: '0 16px',
        }}
      >
        {busy || status === 'checking'
          ? 'Please wait…'
          : enabled
            ? <><FiCheckCircle aria-hidden="true" style={{ marginRight: 6, verticalAlign: 'middle' }} /> Disable notifications</>
            : 'Enable notifications'}
      </button>
    </section>
  );
}
