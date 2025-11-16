'use client';

import { MileageLogComponent } from '@/components/tax/mileage-log';

export default function MileagePage() {
  const userId = 'current-user'; // In real app, get from auth

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mileage Log</h1>
        <p className="text-muted-foreground">
          Track your business mileage for accurate tax deductions
        </p>
      </div>

      <MileageLogComponent userId={userId} filterPeriod="all" />
    </div>
  );
}
