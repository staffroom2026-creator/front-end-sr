import React, { useState } from 'react';
import { FiMessageSquare, FiX } from 'react-icons/fi';
import { apiErrorMessage } from '../services/api';
import { contactService } from '../services/contactService';
import './FeedbackButton.css';

export default function FeedbackButton({ user, audience }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const name = user?.full_name || user?.name || user?.admin_name || '';
  const email = user?.email || user?.email_address || '';

  const closeDialog = () => {
    setIsOpen(false);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await contactService.submitMessage({
        name,
        email,
        subject: `${audience} dashboard feedback`,
        message: message.trim(),
      });
      setSubmitted(true);
      setMessage('');
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Unable to send feedback. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="dashboard-feedback-trigger"
        onClick={() => { setSubmitted(false); setIsOpen(true); }}
        aria-label="Send feedback"
      >
        <FiMessageSquare size={18} aria-hidden="true" />
        <span>Feedback</span>
      </button>

      {isOpen && (
        <div className="dashboard-feedback-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}>
          <section
            className="dashboard-feedback-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-feedback-title"
          >
            <header className="dashboard-feedback-header">
              <div>
                <span className="dashboard-feedback-eyebrow">YOUR VOICE MATTERS</span>
                <h2 id="dashboard-feedback-title">Share feedback</h2>
              </div>
              <button type="button" className="dashboard-feedback-close" onClick={closeDialog} aria-label="Close feedback">
                <FiX size={20} />
              </button>
            </header>

            {submitted ? (
              <div className="dashboard-feedback-success" role="status">
                <span className="dashboard-feedback-success-icon">✓</span>
                <h3>Thanks for sharing.</h3>
                <p>Your feedback has been sent to our team.</p>
                <button type="button" className="dashboard-feedback-submit" onClick={closeDialog}>Done</button>
              </div>
            ) : (
              <form className="dashboard-feedback-form" onSubmit={handleSubmit}>
                <p>Tell us what is working well or what we could improve.</p>
                {error && <p className="dashboard-feedback-error" role="alert">{error}</p>}
                <label htmlFor="dashboard-feedback-message">Your feedback</label>
                <textarea
                  id="dashboard-feedback-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write your feedback here..."
                  rows={5}
                  maxLength={2000}
                  required
                />
                <div className="dashboard-feedback-form-footer">
                  <span>{message.length}/2000</span>
                  <button type="submit" className="dashboard-feedback-submit" disabled={isSubmitting || !message.trim()}>
                    {isSubmitting ? 'Sending...' : 'Send feedback'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}