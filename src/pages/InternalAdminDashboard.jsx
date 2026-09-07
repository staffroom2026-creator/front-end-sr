import React, { useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import {
  FiBell,
  FiBriefcase,
  FiCheckCircle,
  FiChevronRight,
  FiClipboard,
  FiGrid,
  FiLogOut,
  FiMessageSquare,
  FiMoreVertical,
  FiSettings,
  FiShield,
  FiUser,
  FiUsers,
  FiClock,
  FiBarChart2,
} from 'react-icons/fi';

const navItems = [
  ['overview', 'Dashboard', FiGrid],
  ['jobs', 'Jobs', FiBriefcase],
  ['verification', 'Verification', FiShield],
  ['reports', 'Reports', FiClipboard],
  ['notifications', 'Notifications', FiBell],
  ['settings', 'Settings', FiSettings],
];

const overviewStats = [
  { label: 'Total Teachers', value: '1,284', note: 'Total teacher accounts', tone: 'neutral', icon: FiUsers },
  { label: 'Total Schools', value: '326', note: 'Total schools registered', tone: 'neutral', icon: FiGrid },
  { label: 'Active Jobs', value: '184', note: 'Jobs currently visible to teachers', tone: 'neutral', icon: FiBriefcase },
  { label: 'Pending Reviews', value: '17', note: 'Jobs waiting for review', tone: 'warning', icon: FiClock },
];

const summaryCards = [
  { label: 'Published', value: '184', accent: 'green' },
  { label: 'Pending', value: '17', accent: 'amber' },
  { label: 'Changes Req.', value: '8', accent: 'gray' },
  { label: 'Rejected', value: '12', accent: 'red' },
];

const reviewRows = [
  {
    school: 'Mathematics Teacher',
    schoolSub: 'Bright Future International School',
    hours: '2 hours ago',
    status: 'Pending',
    action: 'Review',
  },
  {
    school: 'English Teacher',
    schoolSub: 'Greenfield Academy',
    hours: '5 hours ago',
    status: 'Pending',
    action: 'Review',
  },
  {
    school: 'Primary School Teacher',
    schoolSub: 'Royal Academy',
    hours: '1 day ago',
    status: 'Pending',
    action: 'Review',
  },
];

const recentActivity = [
  { type: 'success', icon: FiCheckCircle, text: 'Admin Sarah approved job', subtext: 'Science Teacher', time: '10 mins ago' },
  { type: 'notice', icon: FiClipboard, text: 'Oakwood High submitted new', subtext: 'job PE Instructor', time: '45 mins ago' },
  { type: 'info', icon: FiCheckCircle, text: 'Admin Mike rejected job', subtext: 'Substitute Teacher', time: '2 hours ago' },
  { type: 'muted', icon: FiUser, text: 'Jane Doe completed teacher', subtext: 'verification', time: '3 hours ago' },
];

const quickStats = [
  { value: '24', label: 'Verification req.', icon: FiShield },
  { value: '5', label: 'New reports', icon: FiBarChart2 },
];

export default function InternalAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const activeTabLabel = navItems.find(([key]) => key === activeTab)?.[1] || 'Dashboard';

  return (
    <div className="internal-admin-shell">
      <div className="internal-admin-frame">
        <aside className="internal-admin-sidebar">
          <div className="internal-admin-sidebar-inner">
            <div className="internal-admin-brand">
              <BrandLogo />
            </div>

            <nav className="internal-admin-nav">
              {navItems.map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  className={`internal-admin-nav-item ${key === activeTab ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(key)}
                  aria-current={key === activeTab ? 'page' : undefined}
                >
                  {React.createElement(Icon, { size: 18 })}
                  <span>{label}</span>
                  {key === 'reports' && <i className="internal-admin-dot" />}
                </button>
              ))}
            </nav>

            <button type="button" className="internal-admin-logout">
              <FiLogOut size={17} />
              Log out
            </button>
          </div>
        </aside>

        <div className="internal-admin-main">
          <header className="internal-admin-header">
            <div className="internal-admin-header-tools">
              <button type="button" className="internal-admin-bell" aria-label="Notifications">
                <FiBell size={17} />
              </button>

              <div className="internal-admin-user-divider" />
              <div className="internal-admin-user-meta">
                <strong>Admin User</strong>
                <span>BrightMinds Academy</span>
              </div>
              <div className="internal-admin-user-avatar" aria-label="Admin User" title="Admin User">
                A
              </div>
            </div>
          </header>

          <main className="internal-admin-content">
            <div className="internal-admin-overview-header">
              <div>
                <div className="internal-admin-breadcrumb">Dashboard / {activeTabLabel}</div>
                <h1>{activeTabLabel === 'Dashboard' ? 'Overview' : activeTabLabel}</h1>
                <p>
                  {activeTab === 'overview'
                    ? 'Monitor Staffroom activity and review job submissions.'
                    : `Manage Staffroom ${activeTabLabel.toLowerCase()} from this workspace.`}
                </p>
              </div>
            </div>

            {activeTab === 'overview' ? <>
            <section className="internal-admin-stat-grid">
              {overviewStats.map((item) => (
                <div key={item.label} className={`internal-admin-stat-card ${item.tone}`}>
                  <div className="internal-admin-stat-label">
                    <span>{item.label}</span>
                    {React.createElement(item.icon, { size: 19 })}
                  </div>
                  <strong>{item.value}</strong>
                  <small>{item.note}</small>
                </div>
              ))}
            </section>

            <div className="internal-admin-summary-row">
              <section className="internal-admin-summary-panel">
                <div className="internal-admin-panel-header">
                  <h3>Job Status Summary</h3>
                  <div className="internal-admin-meta-icons">
                    <button type="button" aria-label="summary actions">
                      <FiMoreVertical size={14} />
                    </button>
                  </div>
                </div>

                <div className="internal-admin-summary-grid">
                  {summaryCards.map((item) => (
                    <div key={item.label} className={`internal-admin-summary-card ${item.accent}`}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <div className="internal-admin-quick-stats">
                {quickStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="internal-admin-quick-stat">
                      {React.createElement(Icon, { size: 14 })}
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="internal-admin-lower-grid">
              <section className="internal-admin-panel left-panel">
                <div className="internal-admin-panel-header">
                  <h3>Jobs Pending Review</h3>
                  <button type="button" className="internal-admin-link-button">
                    View All <FiChevronRight size={14} />
                  </button>
                </div>

                <div className="internal-admin-table-head">
                  <span>Job Title / School</span>
                  <span>Submitted</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>

                {reviewRows.map((row) => (
                  <div key={row.school} className="internal-admin-table-row">
                    <div className="internal-admin-school-cell">
                      <strong>{row.school}</strong>
                      <small>{row.schoolSub}</small>
                    </div>
                    <span className="internal-admin-timespan">{row.hours}</span>
                    <span className="internal-admin-status-pill pending">{row.status}</span>
                    <button type="button" className="internal-admin-review-btn">
                      {row.action}
                    </button>
                  </div>
                ))}
              </section>

              <aside className="internal-admin-side-column">
                <section className="internal-admin-panel right-panel">
                  <div className="internal-admin-panel-header">
                    <h3>Recent Activity</h3>
                  </div>

                  <div className="internal-admin-activity-list">
                    {recentActivity.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={`${item.text}-${item.time}`} className={`internal-admin-activity-item ${item.type}`}>
                          <span className="internal-admin-activity-icon">
                            {React.createElement(Icon, { size: 14 })}
                          </span>
                          <div>
                            <strong>{item.text}</strong>
                            <small>{item.subtext}</small>
                            <time>{item.time}</time>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </aside>
            </div>
            </> : (
              <section className="internal-admin-tab-placeholder">
                <div className="internal-admin-placeholder-icon">
                  {React.createElement(navItems.find(([key]) => key === activeTab)?.[2] || FiGrid, { size: 22 })}
                </div>
                <h2>{activeTabLabel}</h2>
                <p>This {activeTabLabel.toLowerCase()} tab is ready for its workflow and data.</p>
              </section>
            )}
          </main>
        </div>
      </div>

      <style>{`
        :root {
          --ia-bg: #f5f5f4;
          --ia-panel: #ffffff;
          --ia-sidebar: #ffffff;
          --ia-line: #dfe2df;
          --ia-text: #20221f;
          --ia-muted: #68706c;
          --ia-soft: #edf5ef;
          --ia-green: #17853d;
          --ia-green-soft: #e2f5e7;
          --ia-orange: #f5eaa8;
          --ia-red: #ff684e;
          --ia-gray: #e7e9e8;
        }

        * { box-sizing: border-box; }

        .internal-admin-shell {
          min-height: 100vh;
          background: var(--ia-bg);
          color: var(--ia-text);
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        .internal-admin-frame {
          display: flex;
          max-width: 1440px;
          margin: 0 auto;
          min-height: 100vh;
          background: var(--ia-bg);
          border-left: 1px solid var(--ia-line);
          border-right: 1px solid var(--ia-line);
        }

        .internal-admin-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 20;
          width: 236px;
          height: 100vh;
          background: var(--ia-sidebar);
          border-right: 1px solid var(--ia-line);
          overflow-y: auto;
        }

        .internal-admin-sidebar-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 18px 14px 18px;
        }

        .internal-admin-brand {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 4px 8px 18px;
        }

        .internal-admin-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 12px;
        }

        .internal-admin-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          border: none;
          background: transparent;
          color: #2f3f35;
          padding: 10px 12px;
          border-radius: 10px;
          text-align: left;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .internal-admin-nav-item svg {
          flex-shrink: 0;
          color: #4d5a52;
        }

        .internal-admin-nav-item.is-active {
          background: #dff3e5;
          color: #075b2b;
          box-shadow: inset 3px 0 0 #168642;
        }

        .internal-admin-nav-item.is-active svg {
          color: #075b2b;
        }

        .internal-admin-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fe5c5c;
          margin-left: auto;
          box-shadow: 0 0 0 3px rgba(254, 92, 92, 0.15);
        }

        .internal-admin-logout {
          margin-top: auto;
          border: none;
          background: #ff684e;
          color: white;
          font-weight: 700;
          border-radius: 18px;
          padding: 13px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: none;
        }

        .internal-admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          margin-left: 236px;
        }

        .internal-admin-header {
          position: fixed;
          top: 0;
          right: 0;
          left: 236px;
          z-index: 15;
          height: 72px;
          border-bottom: 1px solid var(--ia-line);
          background: rgba(255, 255, 255, 0.78);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 28px 0 24px;
          backdrop-filter: blur(10px);
        }

        .internal-admin-header-tools {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-left: auto;
        }

        .internal-admin-bell {
          width: 42px;
          height: 42px;
          border: none;
          background: transparent;
          border-radius: 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #35443d;
          cursor: pointer;
        }

        .internal-admin-user-divider {
          width: 1px;
          height: 40px;
          background: #d5dbd6;
          margin: 0 2px;
        }

        .internal-admin-user-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.15;
        }

        .internal-admin-user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #d8f1dd 0%, #a9e2b8 100%);
          color: #19492a;
          font-size: 12px;
          font-weight: 800;
          border: 2px solid #17853d;
        }

        .internal-admin-user-meta strong {
          font-size: 12px;
          color: #1e2d26;
        }

        .internal-admin-user-meta span {
          font-size: 10px;
          color: #6e7c73;
        }

        .internal-admin-content {
          padding: 98px 32px 36px;
          overflow: auto;
        }

        .internal-admin-overview-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .internal-admin-breadcrumb {
          color: #68706c;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .internal-admin-overview-header h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .internal-admin-overview-header p {
          margin: 8px 0 0;
          color: #56605a;
          font-size: 14px;
        }

        .internal-admin-tab-placeholder {
          min-height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid var(--ia-line);
          border-radius: 14px;
          background: #ffffff;
          color: var(--ia-muted);
          text-align: center;
        }

        .internal-admin-placeholder-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: var(--ia-soft);
          color: var(--ia-green);
        }

        .internal-admin-tab-placeholder h2 {
          margin: 0;
          color: var(--ia-text);
          font-size: 20px;
        }

        .internal-admin-tab-placeholder p {
          margin: 0;
          font-size: 13px;
        }

        .internal-admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .internal-admin-stat-card {
          background: #ffffff;
          border: 1px solid var(--ia-line);
          border-radius: 12px;
          padding: 16px 16px 14px;
          min-height: 118px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(27, 38, 18, 0.04);
        }

        .internal-admin-stat-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .internal-admin-stat-label span {
          color: #222824;
          font-size: 14px;
          font-weight: 500;
        }

        .internal-admin-stat-label svg { color: #4e5b53; }

        .internal-admin-stat-card strong {
          font-size: 28px;
          letter-spacing: -0.04em;
          color: #191f1d;
          line-height: 1;
        }

        .internal-admin-stat-card small {
          color: #56605a;
          font-size: 12px;
          line-height: 1.35;
          max-width: 170px;
        }

        .internal-admin-stat-card.accent {
          background: #ffffff;
        }

        .internal-admin-stat-card.warning {
          background: #fff2a9;
          border-color: #e0ca62;
        }

        .internal-admin-summary-panel,
        .internal-admin-panel {
          background: #ffffff;
          border: 1px solid var(--ia-line);
            border-radius: 14px;
          box-shadow: 0 1px 3px rgba(19, 31, 25, 0.04);
        }

        .internal-admin-summary-panel {
           padding: 0 14px 14px;
          margin-bottom: 0;
        }

        .internal-admin-summary-row {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(250px, 1fr);
          align-items: start;
          gap: 18px;
          margin-bottom: 18px;
        }

        .internal-admin-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
            padding: 14px 0 12px;
          gap: 12px;
        }

        .internal-admin-panel-header h3 {
          margin: 0;
          font-size: 16px;
          letter-spacing: -0.02em;
        }

        .internal-admin-meta-icons button {
          border: 1px solid var(--ia-line);
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: transparent;
          color: #5e6b63;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .internal-admin-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .internal-admin-summary-card {
          border: 1px solid var(--ia-line);
          background: #f6f7f6;
          border-radius: 14px;
          min-height: 78px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
             min-height: 86px;
        }

        .internal-admin-summary-card strong {
          font-size: 27px;
          letter-spacing: -0.06em;
          margin-bottom: 8px;
          line-height: 1;
        }

        .internal-admin-summary-card span {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #5d6a61;
          font-weight: 700;
        }

        .internal-admin-summary-card.green {
          background: #edf9f0;
          border-color: #cde5d3;
        }

        .internal-admin-summary-card.green strong { color: #1e8c3c; }

        .internal-admin-summary-card.amber {
          background: #fff4b6;
          border-color: #e8d57c;
        }

        .internal-admin-summary-card.amber strong { color: #b57a00; }

        .internal-admin-summary-card.gray {
          background: #ffffff;
          border-color: #cfd5d1;
        }

        .internal-admin-summary-card.gray strong { color: #4c5d5b; }

        .internal-admin-summary-card.red {
          background: #ffffff;
          border-color: #cfd5d1;
        }

        .internal-admin-summary-card.red strong { color: #d84a4a; }

        .internal-admin-lower-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(270px, 0.9fr);
          gap: 18px;
        }

        .internal-admin-panel {
          padding: 0 16px 12px;
        }

        .left-panel {
          align-self: start;
          min-height: 340px;
        }

        .internal-admin-link-button {
          border: none;
          background: transparent;
          color: #1f2343;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
        }

        .internal-admin-table-head,
        .internal-admin-table-row {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) 112px 104px 92px;
          align-items: center;
          gap: 12px;
        }

        .internal-admin-table-head {
          padding: 10px 0 11px;
          font-size: 10px;
          color: #7c857f;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border-bottom: 1px solid var(--ia-line);
        }

        .internal-admin-table-row {
          padding: 16px 0;
          border-bottom: 1px solid rgba(227, 231, 224, 0.8);
        }

        .internal-admin-table-row:last-child {
          border-bottom: none;
        }

        .internal-admin-school-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .internal-admin-school-cell strong {
          font-size: 14px;
          color: #1d2322;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .internal-admin-school-cell small,
        .internal-admin-timespan {
          color: #56605a;
          font-size: 12px;
        }

        .internal-admin-status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 11px;
          padding: 7px 10px;
          font-weight: 700;
          width: fit-content;
          border: 1px solid transparent;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .internal-admin-status-pill.pending {
          background: #f1faf2;
          color: #24372b;
          border-color: transparent;
          border-radius: 0;
          padding: 5px 8px;
        }

        .internal-admin-review-btn {
          border: 1px solid #1f2343;
          background: #ffffff;
          color: #1f2343;
          padding: 8px 15px;
          border-radius: 8px;
          font-weight: 500;
          width: fit-content;
          cursor: pointer;
        }

        .internal-admin-side-column {
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-width: 0;
          width: 100%;
        }

        .internal-admin-quick-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .internal-admin-quick-stat {
          min-height: 94px;
          border: 1px solid #cfd5d1;
          border-radius: 12px;
          background: #ffffff;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          color: #a6ada8;
        }

        .internal-admin-quick-stat strong {
          color: #252a27;
          font-size: 24px;
          font-weight: 500;
          margin-top: 1px;
        }

        .internal-admin-quick-stat span {
          color: #a6ada8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .right-panel {
          padding-bottom: 14px;
          min-height: 0;
          align-self: start;
          width: 100%;
          position: relative;
          top: -38px;
        }

        .internal-admin-activity-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-top: 2px;
        }

        .internal-admin-activity-item {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr);
          gap: 10px;
          align-items: flex-start;
          border-radius: 0;
          padding: 10px 4px;
          border: none;
          border-top: 1px solid var(--ia-line);
          background: #ffffff;
        }

        .internal-admin-activity-item strong {
          display: block;
          font-size: 12px;
          color: #1d2322;
          line-height: 1.35;
          margin-top: 2px;
        }

        .internal-admin-activity-item small {
          display: block;
          font-size: 11px;
          color: #252a27;
          margin-top: 2px;
        }

        .internal-admin-activity-item time {
          display: block;
          font-size: 10px;
          color: #b1b7b3;
          padding-top: 4px;
        }

        .internal-admin-activity-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #eaf3ef;
          color: #2d7d4a;
          margin-top: 1px;
        }

        .internal-admin-activity-item.notice .internal-admin-activity-icon {
          background: #fef1d6;
          color: #b77d00;
        }

        .internal-admin-activity-item.info .internal-admin-activity-icon {
          background: #e9f0ff;
          color: #3756c3;
        }

        .internal-admin-activity-item.muted .internal-admin-activity-icon {
          background: #eef1f0;
          color: #586662;
        }

        @media (max-width: 1120px) {
          .internal-admin-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .internal-admin-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .internal-admin-lower-grid {
            grid-template-columns: 1fr;
          }

          .internal-admin-summary-row {
            grid-template-columns: minmax(0, 1fr) minmax(230px, 0.7fr);
          }
        }

        @media (max-width: 860px) {
          .internal-admin-frame {
            display: block;
          }

          .internal-admin-sidebar {
            display: none;
          }

          .internal-admin-main {
            margin-left: 0;
          }

          .internal-admin-content {
            padding: 20px 16px 28px;
          }

          .internal-admin-header {
            left: 0;
            padding: 0 16px;
            height: 74px;
          }

          .internal-admin-header-tools {
            width: 100%;
            justify-content: flex-end;
            gap: 10px;
          }

          .internal-admin-content {
            padding-top: 101px;
          }

          .internal-admin-stat-grid,
          .internal-admin-summary-grid,
          .internal-admin-summary-row {
            grid-template-columns: 1fr;
          }

          .internal-admin-table-head {
            display: none;
          }

          .internal-admin-table-row {
            grid-template-columns: 1fr;
            gap: 10px;
            padding: 14px 0 18px;
          }

          .internal-admin-review-btn,
          .internal-admin-status-pill {
            width: fit-content;
          }
        }
      `}</style>
    </div>
  );
}
