'use client';

import { TaxDocumentsComponent } from '@/components/tax/tax-documents';

export default function DocumentsPage() {
  const userId = 'current-user'; // In real app, get from auth

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tax Documents</h1>
        <p className="text-muted-foreground">
          Store and organize all your tax-related documents in one place
        </p>
      </div>

      <TaxDocumentsComponent userId={userId} />
    </div>
  );
}
