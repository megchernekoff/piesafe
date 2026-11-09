export default function ExtensionPage() {
  return (
    <div style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <h1 className="page-title">Get the Extension</h1>
        <p className="page-subtitle">Save any recipe to your box in one click</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* What it does */}
        <div className="card">
          <h3 className="serif" style={{ fontSize: '1.3rem', fontWeight: 300, marginBottom: '0.75rem' }}>What it does</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', lineHeight: 1.65 }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--ochre)' }}>→</span>
              <span>Click the Pie Safe icon on any recipe page to save it to your Recipe Box</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--ochre)' }}>→</span>
              <span>Right-click anywhere on a recipe page and choose <strong>Save to Pie Safe</strong></span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--ochre)' }}>→</span>
              <span>Works on NYT Cooking, Serious Eats, and any site you can browse — including paywalled sites you subscribe to</span>
            </div>
          </div>
        </div>

        {/* Install steps */}
        <div className="card">
          <h3 className="serif" style={{ fontSize: '1.3rem', fontWeight: 300, marginBottom: '1rem' }}>How to install</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { n: 1, text: 'Download the extension folder from the link below' },
              { n: 2, text: 'Open Chrome and go to chrome://extensions' },
              { n: 3, text: 'Turn on Developer mode using the toggle in the top right' },
              { n: 4, text: 'Click Load unpacked and select the extension folder you downloaded' },
              { n: 5, text: 'Click the puzzle piece icon in your Chrome toolbar and pin Pie Safe' },
            ].map(({ n, text }) => (
              <div key={n} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'var(--lavender)',
                  color: 'var(--parchment)',
                  borderRadius: '50%',
                  width: 26, height: 26,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', fontWeight: 600, flexShrink: 0,
                }}>{n}</div>
                <span style={{ fontSize: '0.875rem', lineHeight: 1.65, paddingTop: '0.2rem' }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--stone-dark)' }}>
            <a
              href="https://github.com/megchernekoff/piesafe/archive/refs/heads/main.zip"
              download
              style={{ textDecoration: 'none' }}
            >
              <button className="btn-primary">
                ↓ Download extension
              </button>
            </a>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-light)', marginTop: '0.6rem' }}>
              Chrome only · Free · No account needed beyond Pie Safe
            </p>
          </div>
        </div>

        {/* Note */}
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-light)', fontStyle: 'italic', lineHeight: 1.6 }}>
          You need to be logged into pie-safe.com in the same browser for the extension to work.
          Once installed, it stays connected automatically.
        </p>

      </div>
    </div>
  )
}
