'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuarterlyReportComponent } from '@/components/tax/quarterly-report';
import { AnnualSummaryComponent } from '@/components/tax/annual-summary';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('quarterly');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tax Reports</h1>
        <p className="text-muted-foreground">
          Generate quarterly and annual tax reports for your business
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="quarterly">Quarterly Reports</TabsTrigger>
          <TabsTrigger value="annual">Annual Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="quarterly" className="mt-6">
          <QuarterlyReportComponent />
        </TabsContent>

        <TabsContent value="annual" className="mt-6">
          <AnnualSummaryComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
