const STORE_URL = 'https://chromewebstore.google.com/detail/pie-safe/gmlfjbhjimpojkadhckonigmlappjjmb'

export default function ExtensionPage() {
  return (
    <div style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <h1 className="page-title">Get the Extension</h1>
        <p className="page-subtitle">Save any recipe to your box in one click</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* CTA */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🧩</div>
          <h3 className="serif" style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '0.5rem' }}>Available on the Chrome Web Store</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            One click to install. Works immediately on any recipe page.
          </p>
          <a href={STORE_URL} target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2.25rem' }}>
              Add to Chrome — it&apos;s free →
            </button>
          </a>
        </div>

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

        <p style={{ fontSize: '0.78rem', color: 'var(--ink-light)', fontStyle: 'italic', lineHeight: 1.6, textAlign: 'center' }}>
          You need to be logged into pie-safe.com in the same browser for the extension to work.
        </p>
      </div>
    </div>
  )
}
