"use client";

import { useState, useEffect } from "react";
import { DownloadIcon, TrashIcon } from "./icons";
import { useToast } from "./Toast";

type NewsletterLead = {
  id: string;
  email: string;
  date: string;
  source: string;
};

type ContactLead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  date: string;
  status: string;
};

export function LeadsView() {
  const toast = useToast();
  const [newsletterLeads, setNewsletterLeads] = useState<NewsletterLead[]>([]);
  const [contactLeads, setContactLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterPage, setNewsletterPage] = useState(1);
  const [contactPage, setContactPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch leads from API
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      // Fetch newsletter subscribers
      const newsletterResponse = await fetch('/api/leads/newsletter');
      const newsletterData = await newsletterResponse.json();

      if (newsletterResponse.ok && newsletterData.subscribers) {
        const mappedNewsletter = newsletterData.subscribers.map((s: any) => ({
          id: s.id,
          email: s.email,
          date: new Date(s.subscribed_at).toLocaleDateString('en-ET'),
          source: 'Website',
        }));
        setNewsletterLeads(mappedNewsletter);
      }

      // Fetch contact form submissions
      const contactResponse = await fetch('/api/leads/contact');
      const contactData = await contactResponse.json();

      if (contactResponse.ok && contactData.contacts) {
        const mappedContacts = contactData.contacts.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          message: c.message,
          date: new Date(c.created_at).toLocaleDateString('en-ET'),
          status: c.status,
        }));
        setContactLeads(mappedContacts);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((item) => Object.values(item).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination calculations for newsletter
  const newsletterTotalPages = Math.ceil(newsletterLeads.length / itemsPerPage);
  const newsletterStartIndex = (newsletterPage - 1) * itemsPerPage;
  const newsletterEndIndex = newsletterStartIndex + itemsPerPage;
  const currentNewsletterLeads = newsletterLeads.slice(newsletterStartIndex, newsletterEndIndex);

  // Pagination calculations for contact
  const contactTotalPages = Math.ceil(contactLeads.length / itemsPerPage);
  const contactStartIndex = (contactPage - 1) * itemsPerPage;
  const contactEndIndex = contactStartIndex + itemsPerPage;
  const currentContactLeads = contactLeads.slice(contactStartIndex, contactEndIndex);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--cream-line)',
          borderTopColor: 'var(--caramel)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Loading leads...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Newsletter Subscribers */}
      <div className="section-card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h3 className="card-title">Newsletter Subscribers</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCSV(newsletterLeads, "newsletter-subscribers")}
          >
            <DownloadIcon size={16} strokeWidth={2.2} />
            Export CSV
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Subscribed Date</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentNewsletterLeads.map((lead) => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: 600 }}>{lead.email}</td>
                  <td style={{ color: "var(--espresso-dim)" }}>{lead.date}</td>
                  <td>{lead.source}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        setNewsletterLeads(newsletterLeads.filter((l) => l.id !== lead.id))
                      }
                      style={{ padding: "6px 12px" }}
                    >
                      <TrashIcon size={14} strokeWidth={2.2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Newsletter */}
        {newsletterTotalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderTop: '1px solid var(--cream-line)',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--espresso-dim)' }}>
              Showing {newsletterStartIndex + 1}-{Math.min(newsletterEndIndex, newsletterLeads.length)} of {newsletterLeads.length} subscribers
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setNewsletterPage(prev => Math.max(1, prev - 1))}
                disabled={newsletterPage === 1}
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: newsletterPage === 1 ? 0.5 : 1,
                  cursor: newsletterPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: newsletterTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setNewsletterPage(page)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: 'none',
                      background: newsletterPage === page ? 'var(--brown)' : 'var(--panel)',
                      color: newsletterPage === page ? 'var(--cream)' : 'var(--espresso)',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setNewsletterPage(prev => Math.min(newsletterTotalPages, prev + 1))}
                disabled={newsletterPage === newsletterTotalPages}
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: newsletterPage === newsletterTotalPages ? 0.5 : 1,
                  cursor: newsletterPage === newsletterTotalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Form Submissions */}
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title">Contact Form Submissions</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCSV(contactLeads, "contact-submissions")}
          >
            <DownloadIcon size={16} strokeWidth={2.2} />
            Export CSV
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentContactLeads.map((lead) => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: 600 }}>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td style={{ maxWidth: "300px" }}>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lead.message}
                    </div>
                  </td>
                  <td style={{ color: "var(--espresso-dim)" }}>{lead.date}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" style={{ padding: "6px 12px" }}>
                      Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Contact Leads */}
        {contactTotalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderTop: '1px solid var(--cream-line)',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--espresso-dim)' }}>
              Showing {contactStartIndex + 1}-{Math.min(contactEndIndex, contactLeads.length)} of {contactLeads.length} contacts
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setContactPage(prev => Math.max(1, prev - 1))}
                disabled={contactPage === 1}
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: contactPage === 1 ? 0.5 : 1,
                  cursor: contactPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: contactTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setContactPage(page)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: 'none',
                      background: contactPage === page ? 'var(--brown)' : 'var(--panel)',
                      color: contactPage === page ? 'var(--cream)' : 'var(--espresso)',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setContactPage(prev => Math.min(contactTotalPages, prev + 1))}
                disabled={contactPage === contactTotalPages}
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: contactPage === contactTotalPages ? 0.5 : 1,
                  cursor: contactPage === contactTotalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
