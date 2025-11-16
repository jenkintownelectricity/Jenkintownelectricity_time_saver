'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeductionCalculatorComponent } from '@/components/tax/deduction-calculator';
import { TaxSettingsComponent } from '@/components/tax/tax-settings';

export default function DeductionsPage() {
  const [activeTab, setActiveTab] = useState('calculator');
  const userId = 'current-user'; // In real app, get from auth

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deductions & Settings</h1>
        <p className="text-muted-foreground">
          Calculate deductions and configure your tax settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="calculator">Deduction Calculator</TabsTrigger>
          <TabsTrigger value="settings">Tax Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="mt-6">
          <DeductionCalculatorComponent />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <TaxSettingsComponent userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
