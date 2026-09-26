import React, { useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import { apiErrorMessage } from '../services/api';
import {
  FiActivity,
  FiArrowLeft,
  FiBell,
  FiBookOpen,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiHelpCircle,
  FiKey,
  FiLock,
  FiLogOut,
  FiMail,
  FiMonitor,
  FiPhone,
  FiSettings,
  FiShield,
  FiUser,
  FiXCircle,
} from 'react-icons/fi';
import './InternalAdminSettings.css';

const readPayload = (response) => response?.data?.data ?? response?.data ?? {};
const readList = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

const settingKey = (setting) => setting.key || setting.setting_key;
const settingValue = (setting) => setting.value ?? setting.setting_value ?? '';

export default function InternalAdminSettings({ user, platformSettings = [], onSavePlatformSetting, onLogout }) {
  const [view, setView] = useState('overview');
  const [profile, setProfile] = useState({ first_name: '', last_name: '', full_name: '', phone: '', email: '' });
  const [preferences, setPreferences] = useState({ email_notifications: true, in_app_notifications: true });
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadAccountSettings = async () => {
      const [profileResult, preferenceResult] = await Promise.allSettled([
        accountService.getProfile(),
        accountService.getPreferences(),
      ]);
      if (!isMounted) return;

      if (profileResult.status === 'fulfilled') {
        const payload = readPayload(profileResult.value);
        const account = payload.user || payload.account || payload.profile || payload;
        const fullName = account.full_name || user?.full_name || '';
        const nameParts = fullName.trim().split(/\s+/);
        setProfile({
          first_name: account.first_name || nameParts[0] || '',
          last_name: account.last_name || nameParts.slice(1).join(' ') || '',
          full_name: fullName,
          phone: account.phone || account.phone_number || user?.phone || '',
          email: account.email || user?.email || '',
        });
      } else {
        const fullName = user?.full_name || '';
        const nameParts = fullName.trim().split(/\s+/);
        setProfile({ first_name: nameParts[0] || '', last_name: nameParts.slice(1).join(' ') || '', full_name: fullName, phone: user?.phone || '', email: user?.email || '' });
      }

      if (preferenceResult.status === 'fulfilled') {
        const payload = readPayload(preferenceResult.value);
        setPreferences((current) => ({ ...current, ...(payload.preferences || payload) }));
      }
    };
    loadAccountSettings();
    return () => { isMounted = false; };
  }, [user]);

  useEffect(() => {
    if (view !== 'activity') return undefined;
    let isMounted = true;
    setLoadingActivity(true);
    accountService.getLoginActivity({ page: 1, limit: 20 })
      .then((response) => {
        if (isMounted) setActivity(readList(readPayload(response), ['activities', 'login_activity', 'items']));
      })
      .catch((requestError) => {
        if (isMounted) setError(apiErrorMessage(requestError, 'Unable to load login activity.'));
      })
      .finally(() => { if (isMounted) setLoadingActivity(false); });
    return () => { isMounted = false; };
  }, [view]);

  const showResult = (message) => {
    setError('');
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3600);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const nextProfile = {
      first_name: profile.first_name.trim(),
      last_name: profile.last_name.trim(),
      full_name: [profile.first_name.trim(), profile.last_name.trim()].filter(Boolean).join(' '),
      phone: profile.phone.trim(),
    };
    try {
      await accountService.updateProfile(nextProfile);
      setProfile((current) => ({ ...current, ...nextProfile }));
      showResult('Personal information saved.');
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Unable to save personal information.'));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('The new passwords do not match.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await accountService.updatePassword(passwordForm);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      showResult('Password updated.');
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Unable to update password.'));
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async (nextPreferences) => {
    setPreferences(nextPreferences);
    setSaving(true);
    setError('');
    try {
      await accountService.updatePreferences(nextPreferences);
      showResult('Notification preferences saved.');
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Unable to save notification preferences.'));
    } finally {
      setSaving(false);
    }
  };

  const removeAccount = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await accountService.deleteAccount({ password: deletePassword });
      onLogout();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Unable to deactivate this account.'));
      setSaving(false);
    }
  };

  const goTo = (nextView) => {
    setError('');
    setNotice('');
    setView(nextView);
  };

  const profileName = profile.full_name || user?.full_name || user?.email || 'Administrator';
  const subviewTitles = {
    profile: 'Personal Information',
    contact: 'Email & Phone',
    password: 'Password',
    twoFactor: 'Two-Factor Authentication',
    activity: 'Login Activity',
    notifications: 'Notification Preferences',
    platform: 'Platform Settings',
    help: 'Help Center',
    support: 'Contact Support',
    legal: 'Legal',
  };

  const viewHeader = view !== 'overview' && (
    <div className="ia-settings-subhead">
      <button type="button" className="ia-settings-back" onClick={() => goTo('overview')}><FiArrowLeft size={15} /> Settings</button>
      <span aria-hidden="true">/</span>
      <strong>{subviewTitles[view]}</strong>
    </div>
  );

  const row = (Icon, title, description, action, actionLabel = 'Manage', trailing = null, danger = false) => (
    <div className={`ia-settings-row ${danger ? 'is-danger' : ''}`} key={title}>
      <span className="ia-settings-row-icon"><Icon size={16} /></span>
      <div className="ia-settings-row-copy"><strong>{title}</strong><span>{description}</span></div>
      {trailing}
      <button type="button" className="ia-settings-row-action" onClick={action}>{actionLabel}</button>
      <FiChevronRight className="ia-settings-row-chevron" size={14} />
    </div>
  );

  const section = (title, hint, children) => (
    <section className="ia-settings-section" key={title}>
      <div className="ia-settings-section-heading"><h2>{title}</h2><p>{hint}</p></div>
      <div className="ia-settings-section-body">{children}</div>
    </section>
  );

  return (
    <div className="ia-settings-page">
      {view === 'overview' ? (
        <>
          <div className="ia-settings-titlebar"><div><h1>Settings</h1><p>Manage your account, security, notifications and Staffroom preferences.</p></div></div>
          <section className="ia-settings-identity">
            <div className="ia-settings-avatar"><FiUser size={21} /></div>
            <div className="ia-settings-identity-copy"><div><h2>{profileName}</h2><span className="ia-settings-badge">{user?.admin_role || 'Admin'}</span><span className="ia-settings-status"><i /> Active</span></div><p>{profile.email || user?.email || 'Email address not available'}</p><small>Your administrator role and access permissions are managed from Admin Management.</small></div>
            <button type="button" className="ia-settings-primary-action" onClick={() => goTo('profile')}>View Account <FiChevronRight size={14} /></button>
          </section>

          <div className="ia-settings-groups">
            {section('Account', 'Manage your personal information and contact details.', <>
              {row(FiBriefcaseIcon, 'Personal Information', 'Update your name, phone and account details.', () => goTo('profile'))}
              {row(FiMail, 'Email & Phone', 'Review the email address and phone linked to your account.', () => goTo('contact'), 'Manage', <span className="ia-settings-value">{profile.email || 'No email'}</span>)}
            </>)}
            {section('Security', 'Review your password and protect your administrator account.', <>
              {row(FiKey, 'Password', 'Change your Staffroom administrator password.', () => goTo('password'), 'Manage')}
              {row(FiShield, 'Two-Factor Authentication', 'Add another layer of protection to your account.', () => goTo('twoFactor'), 'Manage', <span className="ia-settings-enabled"><i /> Not enabled</span>)}
              {row(FiMonitor, 'Login Activity', 'Review devices and sessions that accessed your account.', () => goTo('activity'), 'View Activity')}
            </>)}
            {section('Notifications', 'Choose how you receive important Staffroom administration updates.', row(FiBell, 'Notification Preferences', 'Manage email and in-app notifications for verification, reports and platform activity.', () => goTo('notifications'), 'Manage Notifications'))}
            {section('Platform', 'Manage Staffroom platform settings available to your administrator role.', <div className="ia-settings-platform-row"><span className="ia-settings-row-icon is-green"><FiSettings size={16} /></span><div className="ia-settings-row-copy"><strong>Platform Settings <span className="ia-settings-badge">Admin Only</span></strong><span>Configure platform preferences and operational settings.</span><small><i /> Granted via Super Admin credentials</small></div><button type="button" className="ia-settings-platform-action" onClick={() => goTo('platform')}>Manage <FiChevronRight size={14} /></button></div>)}
            {section('Activity', 'Review personal audit and access history from your session.', row(FiActivity, 'My Activity', 'Review your recent actions and sign-in events.', () => goTo('activity'), 'View Activity'))}
            {section('Help & Support', 'Access staff guidance and contact the Staffroom team.', <div className="ia-settings-help-grid"><button type="button" className="ia-settings-help-card" onClick={() => goTo('help')}><FiBookOpen size={17} /><strong>Help Center</strong><span>Find answers and guidance for managing Staffroom.</span><small>Open Help Center <FiChevronRight size={12} /></small></button><button type="button" className="ia-settings-help-card" onClick={() => goTo('support')}><FiHelpCircle size={17} /><strong>Contact Support</strong><span>Report a problem or contact Staffroom Support.</span><small>Contact Support <FiChevronRight size={12} /></small></button></div>)}
            {section('Legal', 'Platform terms, privacy and compliance information.', <div className="ia-settings-legal-list"><a href="/terms"><FiFileText size={14} /><span>Terms of Service</span><span>View <FiChevronRight size={13} /></span></a><a href="/contact"><FiShield size={14} /><span>Privacy Policy</span><span>View <FiChevronRight size={13} /></span></a><a href="/contact"><FiCheck size={14} /><span>Cookie Policy</span><span>View <FiChevronRight size={13} /></span></a></div>)}
            {section('Account Management', 'Control your active session and account availability.', <>
              {row(FiLogOut, 'Sign Out', 'Sign out of your Staffroom administrator account.', onLogout, 'Sign Out')}
              {row(FiXCircle, 'Deactivate Account', 'Temporarily disable your administrator account.', () => { setConfirmDelete(true); setError(''); }, 'Deactivate Account', null, true)}
            </>)}
          </div>
        </>
      ) : (
        <>
          {viewHeader}
          <section className="ia-settings-detail">
            {view === 'profile' && <form className="ia-settings-form" onSubmit={saveProfile}><h1>Personal Information</h1><p>Update the details associated with your administrator account.</p><div className="ia-settings-form-grid"><label>First name<input value={profile.first_name} onChange={(event) => setProfile({ ...profile, first_name: event.target.value })} autoComplete="given-name" required /></label><label>Last name<input value={profile.last_name} onChange={(event) => setProfile({ ...profile, last_name: event.target.value })} autoComplete="family-name" required /></label><label className="full-width">Phone number<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} autoComplete="tel" /></label><label className="full-width">Email address<input value={profile.email} readOnly disabled /></label></div><button className="ia-settings-primary-action" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button></form>}
            {view === 'contact' && <div className="ia-settings-information"><h1>Email &amp; Phone</h1><p>Contact details currently linked to your account.</p><div className="ia-settings-info-line"><FiMail size={17} /><div><strong>Email address</strong><span>{profile.email || 'No email address available'}</span></div></div><div className="ia-settings-info-line"><FiPhone size={17} /><div><strong>Phone number</strong><span>{profile.phone || 'No phone number added'}</span></div><button type="button" onClick={() => goTo('profile')}>Edit</button></div><p className="ia-settings-callout">For email address changes, contact support so your administrator access can be verified.</p><a className="ia-settings-primary-action" href="mailto:support@staffroomng.com">Contact Support <FiChevronRight size={14} /></a></div>}
            {view === 'password' && <form className="ia-settings-form" onSubmit={savePassword}><h1>Change Password</h1><p>Use at least eight characters, including one letter and one number.</p><label>Current password<input type="password" autoComplete="current-password" value={passwordForm.current_password} onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })} required /></label><label>New password<input type="password" autoComplete="new-password" value={passwordForm.new_password} onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })} minLength={8} required /></label><label>Confirm new password<input type="password" autoComplete="new-password" value={passwordForm.confirm_password} onChange={(event) => setPasswordForm({ ...passwordForm, confirm_password: event.target.value })} minLength={8} required /></label><button className="ia-settings-primary-action" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Update Password'}</button></form>}
            {view === 'twoFactor' && <div className="ia-settings-information"><h1>Two-Factor Authentication</h1><p>Require a second verification step when signing in to your administrator account.</p><div className="ia-settings-callout"><FiLock size={18} /><span>Two-factor enrollment is not available for internal administrator accounts yet. Contact support for current account security options.</span></div><a className="ia-settings-primary-action" href="mailto:support@staffroomng.com">Contact Support <FiChevronRight size={14} /></a></div>}
            {view === 'activity' && <div className="ia-settings-information"><h1>Login Activity</h1><p>Recent sign-ins and account activity.</p>{loadingActivity ? <p role="status">Loading activity…</p> : activity.length ? <div className="ia-settings-activity-list">{activity.map((entry, index) => <div className="ia-settings-activity-item" key={entry.id || entry.activity_id || `${entry.created_at}-${index}`}><span className="ia-settings-row-icon"><FiClock size={16} /></span><div><strong>{entry.device || entry.action || entry.event || 'Account activity'}</strong><span>{entry.location || entry.ip_address || 'Location not provided'}</span></div><time>{entry.created_at || entry.timestamp || 'Date not provided'}</time></div>)}</div> : <div className="ia-settings-empty"><FiActivity size={20} /><p>No recent activity was returned for this account.</p></div>}</div>}
            {view === 'notifications' && <div className="ia-settings-information"><h1>Notification Preferences</h1><p>Choose which updates are delivered to your administrator account.</p><label className="ia-settings-toggle-row"><span><strong>Email notifications</strong><small>Receive important Staffroom updates by email.</small></span><input type="checkbox" checked={Boolean(preferences.email_notifications)} disabled={saving} onChange={(event) => savePreferences({ ...preferences, email_notifications: event.target.checked })} /></label><label className="ia-settings-toggle-row"><span><strong>In-app notifications</strong><small>Show updates about verification, reports and platform activity.</small></span><input type="checkbox" checked={Boolean(preferences.in_app_notifications)} disabled={saving} onChange={(event) => savePreferences({ ...preferences, in_app_notifications: event.target.checked })} /></label><p className="ia-settings-footnote">Security notifications remain enabled for all accounts.</p></div>}
            {view === 'platform' && <div className="ia-settings-information"><h1>Platform Settings</h1><p>Configuration values available to your administrator role.</p>{platformSettings.length ? <div className="ia-settings-platform-list">{platformSettings.map((setting) => <PlatformSetting key={settingKey(setting)} setting={setting} onSave={onSavePlatformSetting} />)}</div> : <div className="ia-settings-empty"><FiSettings size={20} /><p>No platform settings are available to your account.</p></div>}</div>}
            {view === 'help' && <div className="ia-settings-information"><h1>Help Center</h1><p>Find support for common administrator workflows.</p><div className="ia-settings-help-links"><a href="/contact">Account access and verification <FiChevronRight size={14} /></a><a href="/contact">Managing schools, teachers and jobs <FiChevronRight size={14} /></a><a href="/contact">Reports and platform operations <FiChevronRight size={14} /></a></div><a className="ia-settings-primary-action" href="/contact">Open Help Center <FiChevronRight size={14} /></a></div>}
            {view === 'support' && <div className="ia-settings-information"><h1>Contact Support</h1><p>Send the Staffroom team a note about an account or platform issue.</p><div className="ia-settings-info-line"><FiMail size={17} /><div><strong>Email Support</strong><span>support@staffroomng.com</span></div></div><a className="ia-settings-primary-action" href="mailto:support@staffroomng.com?subject=Staffroom%20administrator%20support">Compose Email <FiChevronRight size={14} /></a></div>}
            {view === 'legal' && <div className="ia-settings-information"><h1>Legal</h1><p>Review the policies that govern use of Staffroom.</p><div className="ia-settings-help-links"><a href="/terms">Terms of Service <FiChevronRight size={14} /></a><a href="/contact">Privacy Policy <FiChevronRight size={14} /></a><a href="/contact">Cookie Policy <FiChevronRight size={14} /></a></div></div>}
          </section>
        </>
      )}

      {(notice || error) && <div className={`ia-settings-toast ${error ? 'is-error' : ''}`} role={error ? 'alert' : 'status'}>{error || notice}<button type="button" aria-label="Dismiss message" onClick={() => { setNotice(''); setError(''); }}><FiXCircle size={15} /></button></div>}

      {confirmDelete && <div className="ia-settings-modal-backdrop" role="presentation"><form className="ia-settings-confirm-modal" onSubmit={removeAccount} role="dialog" aria-modal="true" aria-labelledby="ia-delete-title"><button type="button" className="ia-settings-modal-close" aria-label="Close" onClick={() => setConfirmDelete(false)}><FiXCircle size={19} /></button><span className="ia-settings-danger-icon"><FiXCircle size={19} /></span><h2 id="ia-delete-title">Deactivate administrator account?</h2><p>This will disable access to this account. Enter your password to confirm. You will be signed out when the request succeeds.</p><label>Password<input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} autoComplete="current-password" required /></label><div><button type="button" className="ia-settings-cancel" onClick={() => setConfirmDelete(false)}>Cancel</button><button type="submit" className="ia-settings-delete" disabled={saving}>{saving ? 'Working…' : 'Deactivate Account'}</button></div></form></div>}
    </div>
  );
}

function PlatformSetting({ setting, onSave }) {
  const key = settingKey(setting);
  const value = settingValue(setting);
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isBoolean = typeof value === 'boolean' || ['true', 'false'].includes(String(value).toLowerCase());

  useEffect(() => setDraft(String(value)), [value]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const wasSaved = await onSave(key, isBoolean ? draft === 'true' : draft);
      setSaved(wasSaved);
    } finally {
      setSaving(false);
    }
  };

  return <div className="ia-settings-platform-item"><div><strong>{String(key || 'Setting').replace(/[_-]/g, ' ')}</strong><small>{setting.description || (saved ? 'Saved successfully' : 'Platform configuration value')}</small></div>{isBoolean ? <select value={draft} onChange={(event) => { setDraft(event.target.value); setSaved(false); }} aria-label={`${key} value`}><option value="true">Enabled</option><option value="false">Disabled</option></select> : <input value={draft} onChange={(event) => { setDraft(event.target.value); setSaved(false); }} aria-label={`${key} value`} />}<button type="button" onClick={handleSave} disabled={saving || String(value) === draft}>{saving ? 'Saving…' : saved ? 'Saved' : 'Save'}</button></div>;
}

function FiBriefcaseIcon(props) {
  return <FiUser {...props} />;
}