export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">End-User License Agreement (EULA)</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Agreement to Terms</h2>
            <p>
              By accessing or using Jenkintown Electricity Time Saver ("the Application"), you agree
              to be bound by this End-User License Agreement. If you do not agree to these terms,
              do not use the Application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">License Grant</h2>
            <p>
              We grant you a limited, non-exclusive, non-transferable, revocable license to use
              the Application for your business purposes in accordance with this Agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Permitted Use</h2>
            <p>You may use the Application to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Create and manage estimates, work orders, and invoices</li>
              <li>Sync data with QuickBooks Online</li>
              <li>Use AI-powered features for business assistance</li>
              <li>Generate PDF documents for your business</li>
              <li>Store business data locally in your browser</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Restrictions</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Modify, reverse engineer, or decompile the Application</li>
              <li>Use the Application for unlawful purposes</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Application to send spam or malicious content</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">QuickBooks Integration</h2>
            <p>
              When using the QuickBooks integration, you acknowledge that:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>You authorize the Application to access your QuickBooks data</li>
              <li>You are responsible for the accuracy of synced data</li>
              <li>You can revoke access at any time through QuickBooks settings</li>
              <li>QuickBooks' terms of service also apply to the integration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Intellectual Property</h2>
            <p>
              The Application and its original content, features, and functionality are owned by
              us and are protected by international copyright, trademark, and other intellectual
              property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Your Data</h2>
            <p>
              You retain all rights to your business data. We do not claim ownership of any
              information you input into the Application. You are responsible for maintaining
              backups of your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Disclaimer of Warranties</h2>
            <p>
              THE APPLICATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
              WE DO NOT WARRANT THAT THE APPLICATION WILL BE UNINTERRUPTED OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF
              THE APPLICATION.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">AI Features</h2>
            <p>
              AI-powered features (voice assistant, photo analysis) are provided for informational
              purposes. You are responsible for verifying all AI-generated recommendations and
              ensuring compliance with applicable codes and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Termination</h2>
            <p>
              We may terminate or suspend your access to the Application at any time, without
              prior notice, for any reason, including breach of this Agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the
              Application after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Governing Law</h2>
            <p>
              This Agreement shall be governed by and construed in accordance with the laws of
              the jurisdiction in which we operate, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Contact Information</h2>
            <p>
              If you have questions about this Agreement, please contact us through the
              Application's support channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
