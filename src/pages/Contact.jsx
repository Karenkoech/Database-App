import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Contact() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: '',
    subject: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Simulate form submission (you can add actual API endpoint later)
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setFormData({ name: user?.fullName || '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Get in touch with our team for support, questions, or feedback</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          {[
            { icon: '📧', title: 'Email', items: ['support@dbaudit.com', 'info@dbaudit.com'] },
            { icon: '📞', title: 'Phone', items: ['+1 (555) 123-4567', 'Mon-Fri, 9AM-5PM EST'] },
            { icon: '📍', title: 'Address', items: ['123 Tech Street', 'San Francisco, CA 94105'] },
            { icon: '💬', title: 'Support', items: ['Available 24/7', 'For urgent issues'] }
          ].map((info, idx) => (
            <div key={idx} className="info-card">
              <div className="info-icon">{info.icon}</div>
              <h3>{info.title}</h3>
              {info.items.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="contact-form-section">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactName">Your Name</label>
                <input
                  type="text"
                  id="contactName"
                  name="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Your Email</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contactSubject">Subject</label>
              <input
                type="text"
                id="contactSubject"
                name="subject"
                required
                placeholder="How can we help?"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactMessage">Message</label>
              <textarea
                id="contactMessage"
                name="message"
                rows="6"
                required
                placeholder="Tell us about your question or feedback..."
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            {success && (
              <div className="success-message" style={{ display: 'block' }}>
                ✅ Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="error-message" style={{ display: 'block' }}>
                {error}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              <span className={loading ? 'btn-loader' : 'btn-text'}>
                {loading ? '⏳' : 'Send Message'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
