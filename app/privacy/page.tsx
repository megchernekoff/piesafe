export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 2rem', fontFamily: 'Georgia, serif', color: '#2a1e10', lineHeight: 1.75 }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.5rem' }}>Privacy Policy</h1>
      <p style={{ color: '#7a6a50', marginBottom: '2.5rem', fontSize: '0.9rem' }}>Last updated: November 2026</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.75rem' }}>What we collect</h2>
        <p>Pie Safe collects the following information when you create an account and use the service:</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li>Your name and email address (via Clerk authentication)</li>
          <li>Recipes you save, including titles, ingredients, and instructions</li>
          <li>Meal plans and grocery lists you generate</li>
          <li>Dietary preferences and household settings you provide</li>
          <li>Gmail OAuth tokens if you connect your Gmail account for newsletter scanning (read-only access)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.75rem' }}>How we use it</h2>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li>To provide and personalise the Pie Safe service</li>
          <li>To generate AI-powered meal plans tailored to your preferences</li>
          <li>To scan recipe newsletters in your Gmail inbox (only when you explicitly request it)</li>
          <li>We do not sell your data to third parties</li>
          <li>We do not use your data for advertising</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.75rem' }}>Chrome extension</h2>
        <p>The Pie Safe Chrome extension reads the HTML of recipe pages you visit in order to extract and save recipe content to your account. It does not collect browsing history, track pages you visit, or share any data with third parties. It only transmits data to pie-safe.com when you explicitly click to save a recipe.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.75rem' }}>Third-party services</h2>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li><strong>Clerk</strong> — handles authentication and user accounts</li>
          <li><strong>Turso</strong> — stores your recipes, meal plans, and preferences</li>
          <li><strong>Anthropic</strong> — powers recipe parsing and meal plan generation (recipe content is sent to their API)</li>
          <li><strong>Google</strong> — Gmail OAuth for newsletter scanning (optional, read-only)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.75rem' }}>Your data</h2>
        <p>You can delete your account and all associated data at any time by contacting us. Gmail access can be revoked at any time from your Google account settings or from within Pie Safe.</p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.75rem' }}>Contact</h2>
        <p>Questions? Email <a href="mailto:piesafe214@gmail.com" style={{ color: '#6b5c8a' }}>piesafe214@gmail.com</a></p>
      </section>
    </div>
  )
}
