export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Introduction</h2>
            <p>
              This Privacy Policy describes how Jenkintown Electricity Time Saver ("we", "our", or "us")
              collects, uses, and shares information when you use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Business information (company name, contact details)</li>
              <li>Customer information (names, contact details)</li>
              <li>Job and project details</li>
              <li>Estimates, work orders, and invoices</li>
              <li>QuickBooks connection data (with your authorization)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and manage your projects</li>
              <li>Sync data with QuickBooks (when authorized)</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">QuickBooks Integration</h2>
            <p>
              When you connect your QuickBooks account, we access your QuickBooks data solely to sync
              estimates and invoices. We do not store your QuickBooks credentials. We use OAuth 2.0
              for secure authentication, and you can disconnect at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Data Storage</h2>
            <p>
              Your data is stored locally in your browser using local storage. We do not transmit
              your business data to our servers except when syncing with QuickBooks (which goes directly
              to QuickBooks servers).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><strong>QuickBooks Online</strong> - For accounting integration</li>
              <li><strong>Anthropic Claude</strong> - For AI-powered photo analysis</li>
              <li><strong>VAPI</strong> - For voice AI assistant features</li>
            </ul>
            <p className="mt-2">
              Each service has its own privacy policy governing the use of your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Security</h2>
            <p>
              We take reasonable measures to protect your information from unauthorized access,
              use, or disclosure. However, no internet transmission is ever fully secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your information</li>
              <li>Disconnect third-party integrations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by updating the "Last Updated" date at the top of this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us through our
              application support.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
