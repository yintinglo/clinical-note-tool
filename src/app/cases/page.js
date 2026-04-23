'use client'

import { useState, useEffect } from 'react'

export default function CasesPage() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cases')
      .then(res => res.json())
      .then(data => {
        setCases(data)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'DM Mono', fontSize: '13px', color: '#3a4060' }}>Loading...</span>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0f1e; color: #e8eaf0; font-family: 'DM Sans', sans-serif; }
        .case-card { transition: border-color 0.15s, background 0.15s; }
        .case-card:hover { border-color: #2a3a6a !important; background: #111828 !important; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #1a2040', padding: '20px 0' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4a7fff', boxShadow: '0 0 12px #4a7fff88' }} />
              <span style={{ fontFamily: 'DM Serif Display', fontSize: '18px', color: '#e8eaf0', letterSpacing: '0.02em' }}>ClinicalNote</span>
            </div>
            <a href="/" style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#4a7fff', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              New Case →
            </a>
          </div>
        </div>

        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 32px' }}>

          {/* Title */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '36px', color: '#e8eaf0', lineHeight: 1.2, marginBottom: '8px' }}>
              Saved Cases
            </h1>
            <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#5a6080', fontWeight: 300 }}>
              {cases.length} {cases.length === 1 ? 'case' : 'cases'} saved
            </p>
          </div>

          {cases.length === 0 ? (
            <div style={{ background: '#0e1428', border: '1px dashed #1a2040', borderRadius: '10px', padding: '48px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'DM Mono', fontSize: '13px', color: '#3a4060', letterSpacing: '0.05em' }}>No saved cases yet</p>
              <a href="/" style={{ display: 'inline-block', marginTop: '16px', fontFamily: 'DM Mono', fontSize: '12px', color: '#4a7fff', textDecoration: 'none', letterSpacing: '0.08em' }}>
                Create your first case →
              </a>
            </div>
          ) : (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cases.map(c => (
                <a key={c.id} href={`/cases/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="case-card"
                    style={{
                      background: '#0e1428', border: '1px solid #1a2040',
                      borderRadius: '10px', padding: '20px', cursor: 'pointer'
                    }}
                  >
                    <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#c8cad8', fontWeight: 300, lineHeight: '1.5', marginBottom: '12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {c.clinical_note.slice(0, 120)}...
                    </p>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#3a4060', letterSpacing: '0.05em' }}>
                        {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {c.structured_summary?.disposition_recommendation && (
                        <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#4a7fff', background: '#4a7fff11', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                          {c.structured_summary.disposition_recommendation}
                        </span>
                      )}
                      {c.is_edited && (
                        <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#f0a030', background: '#f0a03011', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                          Edited
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}