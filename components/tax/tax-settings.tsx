'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTaxStore } from '@/lib/stores/tax-store';
import { Settings, Home, Car, Phone, DollarSign, User, Save } from 'lucide-react';

interface TaxSettingsProps {
  userId: string;
}

export function TaxSettingsComponent({ userId }: TaxSettingsProps) {
  const { getTaxSettings, updateTaxSettings } = useTaxStore();
  const settings = getTaxSettings();

  const [formData, setFormData] = useState({
    tax_features_enabled: settings?.tax_features_enabled ?? true,
    home_office_enabled: settings?.home_office_enabled ?? false,
    home_office_square_feet: settings?.home_office_square_feet?.toString() ?? '',
    total_home_square_feet: settings?.total_home_square_feet?.toString() ?? '',
    monthly_rent_mortgage: settings?.monthly_rent_mortgage?.toString() ?? '',
    monthly_utilities: settings?.monthly_utilities?.toString() ?? '',
    vehicle_method: settings?.vehicle_method ?? 'standard_mileage',
    phone_business_percentage: settings?.phone_business_percentage?.toString() ?? '50',
    internet_business_percentage: settings?.internet_business_percentage?.toString() ?? '50',
    monthly_phone_cost: settings?.monthly_phone_cost?.toString() ?? '',
    monthly_internet_cost: settings?.monthly_internet_cost?.toString() ?? '',
    federal_tax_rate: settings?.federal_tax_rate ? (settings.federal_tax_rate * 100).toString() : '22',
    state_tax_rate: settings?.state_tax_rate ? (settings.state_tax_rate * 100).toString() : '5',
    quarterly_reminder_enabled: settings?.quarterly_reminder_enabled ?? true,
    auto_calculate_mileage: settings?.auto_calculate_mileage ?? true,
    accountant_name: settings?.accountant_name ?? '',
    accountant_email: settings?.accountant_email ?? '',
    accountant_phone: settings?.accountant_phone ?? '',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Calculate home office percentage
    const officeSqFt = parseFloat(formData.home_office_square_feet);
    const totalSqFt = parseFloat(formData.total_home_square_feet);
    const percentage = totalSqFt > 0 ? (officeSqFt / totalSqFt) * 100 : 0;

    // Calculate total tax rate
    const federalRate = parseFloat(formData.federal_tax_rate) / 100;
    const stateRate = parseFloat(formData.state_tax_rate) / 100;
    const selfEmploymentRate = 0.153;
    const totalRate = federalRate + stateRate + selfEmploymentRate;

    // This will be used when saving
    // formData.home_office_percentage = percentage;
    // formData.estimated_total_tax_rate = totalRate;
  }, [
    formData.home_office_square_feet,
    formData.total_home_square_feet,
    formData.federal_tax_rate,
    formData.state_tax_rate,
  ]);

  const handleSave = () => {
    const updatedSettings = {
      user_id: userId,
      tax_features_enabled: formData.tax_features_enabled,
      home_office_enabled: formData.home_office_enabled,
      home_office_square_feet: parseFloat(formData.home_office_square_feet) || 0,
      total_home_square_feet: parseFloat(formData.total_home_square_feet) || 0,
      home_office_percentage:
        parseFloat(formData.total_home_square_feet) > 0
          ? (parseFloat(formData.home_office_square_feet) /
              parseFloat(formData.total_home_square_feet)) *
            100
          : 0,
      monthly_rent_mortgage: parseFloat(formData.monthly_rent_mortgage) || undefined,
      monthly_utilities: parseFloat(formData.monthly_utilities) || undefined,
      vehicle_method: formData.vehicle_method as 'standard_mileage' | 'actual_expenses',
      vehicles: [],
      phone_business_percentage: parseFloat(formData.phone_business_percentage),
      internet_business_percentage: parseFloat(formData.internet_business_percentage),
      monthly_phone_cost: parseFloat(formData.monthly_phone_cost) || undefined,
      monthly_internet_cost: parseFloat(formData.monthly_internet_cost) || undefined,
      federal_tax_rate: parseFloat(formData.federal_tax_rate) / 100,
      state_tax_rate: parseFloat(formData.state_tax_rate) / 100,
      self_employment_tax_rate: 0.153,
      estimated_total_tax_rate:
        parseFloat(formData.federal_tax_rate) / 100 +
        parseFloat(formData.state_tax_rate) / 100 +
        0.153,
      quarterly_reminder_enabled: formData.quarterly_reminder_enabled,
      auto_calculate_mileage: formData.auto_calculate_mileage,
      accountant_name: formData.accountant_name || undefined,
      accountant_email: formData.accountant_email || undefined,
      accountant_phone: formData.accountant_phone || undefined,
    };

    updateTaxSettings(updatedSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const homeOfficePercentage =
    parseFloat(formData.total_home_square_feet) > 0
      ? ((parseFloat(formData.home_office_square_feet) / parseFloat(formData.total_home_square_feet)) *
          100).toFixed(1)
      : '0';

  const totalTaxRate = (
    parseFloat(formData.federal_tax_rate) +
    parseFloat(formData.state_tax_rate) +
    15.3
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tax Settings
              </CardTitle>
              <CardDescription>Configure your tax preferences and defaults</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={saved}>
              {saved ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General Settings</CardTitle>
          <CardDescription>Enable or disable tax features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Tax Features</Label>
              <p className="text-sm text-muted-foreground">Enable tax compliance features</p>
            </div>
            <Button
              variant={formData.tax_features_enabled ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setFormData({ ...formData, tax_features_enabled: !formData.tax_features_enabled })
              }
            >
              {formData.tax_features_enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Quarterly Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminders for estimated tax payments</p>
            </div>
            <Button
              variant={formData.quarterly_reminder_enabled ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setFormData({
                  ...formData,
                  quarterly_reminder_enabled: !formData.quarterly_reminder_enabled,
                })
              }
            >
              {formData.quarterly_reminder_enabled ? 'On' : 'Off'}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Calculate Mileage</Label>
              <p className="text-sm text-muted-foreground">
                Automatically calculate deductions for mileage entries
              </p>
            </div>
            <Button
              variant={formData.auto_calculate_mileage ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setFormData({ ...formData, auto_calculate_mileage: !formData.auto_calculate_mileage })
              }
            >
              {formData.auto_calculate_mileage ? 'On' : 'Off'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Home Office Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5" />
            Home Office Settings
          </CardTitle>
          <CardDescription>Configure home office deduction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label>Home Office Deduction</Label>
              <p className="text-sm text-muted-foreground">Enable home office deduction</p>
            </div>
            <Button
              variant={formData.home_office_enabled ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setFormData({ ...formData, home_office_enabled: !formData.home_office_enabled })
              }
            >
              {formData.home_office_enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {formData.home_office_enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="office_sqft">Office Square Feet</Label>
                  <Input
                    id="office_sqft"
                    type="number"
                    placeholder="e.g., 150"
                    value={formData.home_office_square_feet}
                    onChange={(e) =>
                      setFormData({ ...formData, home_office_square_feet: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_sqft">Total Home Square Feet</Label>
                  <Input
                    id="total_sqft"
                    type="number"
                    placeholder="e.g., 2000"
                    value={formData.total_home_square_feet}
                    onChange={(e) =>
                      setFormData({ ...formData, total_home_square_feet: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rent_mortgage">Monthly Rent/Mortgage</Label>
                  <Input
                    id="rent_mortgage"
                    type="number"
                    placeholder="0.00"
                    value={formData.monthly_rent_mortgage}
                    onChange={(e) =>
                      setFormData({ ...formData, monthly_rent_mortgage: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utilities">Monthly Utilities</Label>
                  <Input
                    id="utilities"
                    type="number"
                    placeholder="0.00"
                    value={formData.monthly_utilities}
                    onChange={(e) => setFormData({ ...formData, monthly_utilities: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Business Use Percentage</div>
                <div className="text-2xl font-bold">{homeOfficePercentage}%</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Expense Method
          </CardTitle>
          <CardDescription>Choose how to calculate vehicle expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="vehicle_method">Method</Label>
            <Select
              value={formData.vehicle_method}
              onValueChange={(value) => setFormData({ ...formData, vehicle_method: value as "standard_mileage" | "actual_expenses" })}
            >
              <SelectTrigger id="vehicle_method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard_mileage">Standard Mileage Rate</SelectItem>
                <SelectItem value="actual_expenses">Actual Expenses</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.vehicle_method === 'standard_mileage'
                ? 'Track miles and apply IRS standard rate ($0.67/mile for 2024)'
                : 'Track all actual vehicle expenses (gas, maintenance, insurance, etc.)'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Phone & Internet Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone & Internet
          </CardTitle>
          <CardDescription>Business use percentages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_pct">Phone Business %</Label>
              <Input
                id="phone_pct"
                type="number"
                min="0"
                max="100"
                placeholder="50"
                value={formData.phone_business_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, phone_business_percentage: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internet_pct">Internet Business %</Label>
              <Input
                id="internet_pct"
                type="number"
                min="0"
                max="100"
                placeholder="50"
                value={formData.internet_business_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, internet_business_percentage: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_cost">Monthly Phone Cost</Label>
              <Input
                id="phone_cost"
                type="number"
                placeholder="0.00"
                value={formData.monthly_phone_cost}
                onChange={(e) => setFormData({ ...formData, monthly_phone_cost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internet_cost">Monthly Internet Cost</Label>
              <Input
                id="internet_cost"
                type="number"
                placeholder="0.00"
                value={formData.monthly_internet_cost}
                onChange={(e) => setFormData({ ...formData, monthly_internet_cost: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Tax Rates
          </CardTitle>
          <CardDescription>Estimated tax rates for calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="federal_rate">Federal Tax Rate (%)</Label>
              <Input
                id="federal_rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="22"
                value={formData.federal_tax_rate}
                onChange={(e) => setFormData({ ...formData, federal_tax_rate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state_rate">State Tax Rate (%)</Label>
              <Input
                id="state_rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="5"
                value={formData.state_tax_rate}
                onChange={(e) => setFormData({ ...formData, state_tax_rate: e.target.value })}
              />
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Self-Employment Tax</div>
              <div className="text-xl font-bold">15.3%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Estimated Rate</div>
              <div className="text-xl font-bold">{totalTaxRate}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accountant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Accountant Information
          </CardTitle>
          <CardDescription>Your tax professional contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountant_name">Name</Label>
              <Input
                id="accountant_name"
                placeholder="John Doe CPA"
                value={formData.accountant_name}
                onChange={(e) => setFormData({ ...formData, accountant_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountant_email">Email</Label>
              <Input
                id="accountant_email"
                type="email"
                placeholder="accountant@example.com"
                value={formData.accountant_email}
                onChange={(e) => setFormData({ ...formData, accountant_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountant_phone">Phone</Label>
              <Input
                id="accountant_phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.accountant_phone}
                onChange={(e) => setFormData({ ...formData, accountant_phone: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" disabled={saved}>
          {saved ? (
            <>
              <Save className="h-5 w-5 mr-2" />
              Settings Saved!
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
