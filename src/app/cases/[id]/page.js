'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function CasePage() {
  const { id } = useParams()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedFields, setEditedFields] = useState(new Set())

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then(res => res.json())
      .then(data => {
        setCaseData(data)
        setLoading(false)
      })
  }, [id])

  function handleEdit(field, value) {
    setCaseData(prev => ({
      ...prev,
      structured_summary: { ...prev.structured_summary, [field]: value }
    }))
    setEditedFields(prev => new Set(prev).add(field))
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structured_summary: caseData.structured_summary,
        revised_hpi: caseData.structured_summary.revised_hpi
      })
    })
    setSaving(false)
    setEditedFields(new Set())
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'DM Mono', fontSize: '13px', color: '#3a4060' }}>Loading...</span>
    </div>
  )

  if (!caseData) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'DM Mono', fontSize: '13px', color: '#3a4060' }}>Case not found.</span>
    </div>
  )

  const s = caseData.structured_summary || {}

  const fields = [
    { label: 'Chief Complaint', field: 'chief_complaint' },
    { label: 'HPI Summary', field: 'hpi_summary' },
    { label: 'Disposition Recommendation', field: 'disposition_recommendation' },
    { label: 'Revised HPI', field: 'revised_hpi' },
  ]

  const arrayFields = [
    { label: 'Key Findings', field: 'key_findings' },
    { label: 'Suspected Conditions', field: 'suspected_conditions' },
    { label: 'Uncertainties / Missing Info', field: 'uncertainties' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0f1e; color: #e8eaf0; font-family: 'DM Sans', sans-serif; }
        textarea:focus { outline: none; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
        <div style={{ borderBottom: '1px solid #1a2040', padding: '20px 0' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4a7fff', boxShadow: '0 0 12px #4a7fff88' }} />
              <span style={{ fontFamily: 'DM Serif Display', fontSize: '18px', color: '#e8eaf0', letterSpacing: '0.02em' }}>ClinicalNote</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="/cases" style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#5a6080', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                All Cases
              </a>
              <a href="/" style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#4a7fff', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                New Case →
              </a>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 32px' }}>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '36px', color: '#e8eaf0', lineHeight: 1.2, marginBottom: '8px' }}>
                Case Detail
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#5a6080', fontWeight: 300 }}>
                Review, edit, and save structured output
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {caseData.is_edited && editedFields.size === 0 && (
                <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#f0a030', background: '#f0a03011', padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                  ● PREVIOUSLY EDITED
                </span>
              )}
              {editedFields.size > 0 && (
                <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#f0a030', background: '#f0a03011', padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                  ● UNSAVED EDITS
                </span>
              )}
            </div>
          </div>

          <div style={{ background: '#0e1428', border: '1px solid #1a2040', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#3a4060', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
              Original Note
            </span>
            <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#c8cad8', lineHeight: '1.7', fontWeight: 300, whiteSpace: 'pre-wrap' }}>
              {caseData.clinical_note}
            </p>
          </div>

          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {fields.map(({ label, field }) => (
              <div key={field} style={{
                background: '#0e1428',
                border: editedFields.has(field) ? '1px solid #4a7fff' : '1px solid #1a2040',
                borderRadius: '10px',
                padding: '20px'
              }}>
                <label style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#3a4060', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  {label}
                </label>
                <textarea
                  value={s[field] || ''}
                  onChange={e => handleEdit(field, e.target.value)}
                  style={{
                    width: '100%', minHeight: field === 'revised_hpi' ? '140px' : '72px',
                    background: 'transparent', border: 'none', color: '#c8cad8',
                    fontFamily: 'DM Sans', fontSize: '14px', lineHeight: '1.7',
                    resize: 'vertical', fontWeight: 300
                  }}
                />
              </div>
            ))}

            {arrayFields.map(({ label, field }) => (
              <div key={field} style={{
                background: '#0e1428',
                border: editedFields.has(field) ? '1px solid #4a7fff' : '1px solid #1a2040',
                borderRadius: '10px',
                padding: '20px'
              }}>
                <label style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#3a4060', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  {label}
                </label>
                <textarea
                  value={(s[field] || []).join('\n')}
                  onChange={e => handleEdit(field, e.target.value.split('\n'))}
                  style={{
                    width: '100%', minHeight: '80px', background: 'transparent', border: 'none',
                    color: '#c8cad8', fontFamily: 'DM Sans', fontSize: '14px', lineHeight: '1.7',
                    resize: 'vertical', fontWeight: 300
                  }}
                />
              </div>
            ))}

            <button
              onClick={handleSave}
              disabled={saving || editedFields.size === 0}
              style={{
                marginTop: '8px', width: '100%', padding: '14px',
                background: saving || editedFields.size === 0 ? '#1a2040' : '#1a3a1a',
                color: saving || editedFields.size === 0 ? '#3a4060' : '#4adf7f',
                border: '1px solid #2a4a2a', borderRadius: '8px',
                fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500,
                cursor: saving || editedFields.size === 0 ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em', transition: 'all 0.2s'
              }}
            >
              {saving ? 'Saving...' : 'Save Edits'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}