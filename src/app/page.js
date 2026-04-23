'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [note, setNote] = useState('')
  const [structured, setStructured] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEdited, setIsEdited] = useState(new Set())
  const [files, setFiles] = useState([])
  const [modalFile, setModalFile] = useState(null)
  const [pdfPages, setPdfPages] = useState([])
  const fileInputRef = useRef(null)
  const router = useRouter()

  async function extractText(file) {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    //pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.6.205/legacy/build/pdf.worker.min.js`;
    //pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
    /**pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString(); **/
    //pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    //pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.js`;
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      fullText += content.items.map(item => item.str).join(' ') + '\n'
    }
    return fullText
  }

  async function handleFileUpload(e) {
    const selected = Array.from(e.target.files).slice(0, 2)
    if (!selected.length) return
    setFiles(selected)
    const texts = await Promise.all(selected.map(extractText))
    const labels = ['ER Note', 'H&P Note']
    const combined = texts.map((t, i) => `=== ${labels[i] || `Document ${i + 1}`} ===\n${t}`).join('\n\n')
    setNote(combined)
  }

  async function openPdfModal(file) {
    setModalFile(file)
    setPdfPages([])
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    //pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.6.205/legacy/build/pdf.worker.min.js`;
    //pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
    // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.js`;
    /**pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString(); **/
    //pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pages = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      pages.push(canvas.toDataURL())
    }
    setPdfPages(pages)
  }

  async function handleGenerate() {
    setLoading(true)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note })
    })
    const data = await res.json()
    setStructured(data)
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinical_note: note,
        structured_summary: structured,
        revised_hpi: structured.revised_hpi
      })
    })
    const data = await res.json()
    setSaving(false)
    router.push(`/cases/${data.id}`)
  }

  function handleEdit(field, value) {
    setStructured(prev => ({ ...prev, [field]: value }))
    setisEdited(prev => new Set(prev).add(field))
  }

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
        ::selection { background: #2a4fff33; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #2a3155; border-radius: 3px; }
        textarea:focus { outline: none; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .file-btn:hover { border-color: #4a7fff !important; color: #4a7fff !important; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: flex-start; justify-content: center; padding: 40px 20px; overflow-y: auto; }
        .modal-box { background: #0e1428; border: 1px solid #1a2040; border-radius: 12px; width: 100%; max-width: 760px; padding: 24px; }
      `}</style>

      {/* PDF Modal */}
      {modalFile && (
        <div className="modal-overlay" onClick={() => setModalFile(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#c8cad8', letterSpacing: '0.05em' }}>{modalFile.name}</span>
              <button
                onClick={() => setModalFile(null)}
                style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#5a6080', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}
              >
                CLOSE ✕
              </button>
            </div>
            {pdfPages.length === 0 ? (
              <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#3a4060', textAlign: 'center', padding: '40px' }}>Rendering PDF...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pdfPages.map((src, i) => (
                  <img key={i} src={src} style={{ width: '100%', borderRadius: '6px', border: '1px solid #1a2040' }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #1a2040', padding: '20px 0' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4a7fff', boxShadow: '0 0 12px #4a7fff88' }} />
              <span style={{ fontFamily: 'DM Serif Display', fontSize: '18px', color: '#e8eaf0', letterSpacing: '0.02em' }}>ClinicalNote</span>
            </div>
            <a href="/cases" style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#4a7fff', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Saved Cases →
            </a>
          </div>
        </div>

        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 32px' }}>

          {/* Title */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '36px', color: '#e8eaf0', lineHeight: 1.2, marginBottom: '8px' }}>
              Clinical Note Structuring
            </h1>
            <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#5a6080', fontWeight: 300 }}>
              Upload ER Note and H&P Note PDFs, or paste a clinical note directly
            </p>
          </div>

          {/* Input Section */}
          <div style={{ background: '#0e1428', border: '1px solid #1a2040', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#3a4060', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Clinical Note Input</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {files.map((f, i) => (
                  <button
                    key={i}
                    className="file-btn"
                    onClick={() => openPdfModal(f)}
                    style={{
                      fontFamily: 'DM Mono', fontSize: '11px', color: '#4a7fff',
                      background: '#4a7fff11', border: '1px solid #4a7fff33',
                      padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
                      letterSpacing: '0.04em', transition: 'all 0.15s', maxWidth: '160px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}
                  >
                    {f.name}
                  </button>
                ))}
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    fontFamily: 'DM Mono', fontSize: '11px', color: '#5a6080',
                    background: '#1a2040', border: '1px solid #2a3155',
                    padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', letterSpacing: '0.05em'
                  }}
                >
                  Upload PDFs
                </button>
              </div>
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Paste clinical note here, or upload PDFs above..."
              style={{
                width: '100%', minHeight: '180px', background: 'transparent', border: 'none',
                color: '#c8cad8', fontFamily: 'DM Sans', fontSize: '14px', lineHeight: '1.7',
                resize: 'vertical', fontWeight: 300
              }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !note}
            style={{
              width: '100%', padding: '14px', background: loading ? '#1a2040' : '#4a7fff',
              color: loading ? '#3a4060' : '#fff', border: 'none', borderRadius: '8px',
              fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500,
              cursor: loading || !note ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em', transition: 'all 0.2s', marginBottom: '40px',
              opacity: !note ? 0.4 : 1
            }}
          >
            {loading ? 'Analyzing note...' : 'Generate Structured Output'}
          </button>

          {/* Structured Output */}
          {structured && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontFamily: 'DM Serif Display', fontSize: '22px', color: '#e8eaf0' }}>Structured Output</span>
                {isEdited.size > 0 && (
                  <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#f0a030', background: '#f0a03011', padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                    ● UNSAVED EDITS
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {fields.map(({ label, field }) => (
                  <div key={field} style={{ background: '#0e1428', border: isEdited.has(field) ? '1px solid #4a7fff' : '1px solid #1a2040', borderRadius: '10px', padding: '20px' }}>
                    <label style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#3a4060', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                      {label}
                    </label>
                    <textarea
                      value={structured[field] || ''}
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
                  <div key={field} style={{ background: '#0e1428', border: isEdited.has(field) ? '1px solid #4a7fff' : '1px solid #1a2040', borderRadius: '10px', padding: '20px' }}>
                    <label style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#3a4060', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                      {label}
                    </label>
                    <textarea
                      value={(structured[field] || []).join('\n')}
                      onChange={e => handleEdit(field, e.target.value.split('\n'))}
                      style={{
                        width: '100%', minHeight: '80px', background: 'transparent', border: 'none',
                        color: '#c8cad8', fontFamily: 'DM Sans', fontSize: '14px', lineHeight: '1.7',
                        resize: 'vertical', fontWeight: 300
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  marginTop: '20px', width: '100%', padding: '14px',
                  background: saving ? '#1a2040' : '#1a3a1a',
                  color: saving ? '#3a4060' : '#4adf7f',
                  border: '1px solid #2a4a2a', borderRadius: '8px',
                  fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500,
                  cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '0.02em', transition: 'all 0.2s'
                }}
              >
                {saving ? 'Saving...' : 'Save Case'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}