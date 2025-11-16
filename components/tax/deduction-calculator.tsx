'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  calculateHomeOfficeDeduction,
  calculateVehicleExpenseComparison,
  calculateMealDeduction,
  formatCurrency,
} from '@/lib/tax-utils';
import { Calculator, Home, Car, Utensils, Phone, CheckCircle2 } from 'lucide-react';

export function DeductionCalculatorComponent() {
  const [activeTab, setActiveTab] = React.useState("home-office");
  const currentYear = new Date().getFullYear();

  // Home Office State
  const [homeOffice, setHomeOffice] = useState({
    square_feet: '',
    total_square_feet: '',
    rent_mortgage: '',
    utilities: '',
    insurance: '',
    repairs: '',
    depreciation: '',
  });

  // Vehicle State
  const [vehicle, setVehicle] = useState({
    total_miles: '',
    business_percentage: '80',
    gas: '',
    maintenance: '',
    insurance: '',
    registration: '',
    lease_payments: '',
    depreciation: '',
  });

  // Meals State
  const [meals, setMeals] = useState({
    total_expenses: '',
    year: currentYear.toString(),
  });

  // Phone/Internet State
  const [phoneInternet, setPhoneInternet] = useState({
    monthly_phone: '',
    monthly_internet: '',
    business_percentage: '50',
  });

  // Calculate Home Office
  const homeOfficeResult = useMemo(() => {
    const sqFt = parseFloat(homeOffice.square_feet);
    const totalSqFt = parseFloat(homeOffice.total_square_feet);

    if (!sqFt || !totalSqFt) return null;

    const actualExpenses = {
      rent_mortgage: parseFloat(homeOffice.rent_mortgage) || 0,
      utilities: parseFloat(homeOffice.utilities) || 0,
      insurance: parseFloat(homeOffice.insurance) || 0,
      repairs: parseFloat(homeOffice.repairs) || 0,
      depreciation: parseFloat(homeOffice.depreciation) || 0,
    };

    return calculateHomeOfficeDeduction(sqFt, totalSqFt, actualExpenses);
  }, [homeOffice]);

  // Calculate Vehicle
  const vehicleResult = useMemo(() => {
    const totalMiles = parseFloat(vehicle.total_miles);
    const businessPct = parseFloat(vehicle.business_percentage) / 100;

    if (!totalMiles || !businessPct) return null;

    const actualExpenses = {
      gas: parseFloat(vehicle.gas) || 0,
      maintenance: parseFloat(vehicle.maintenance) || 0,
      insurance: parseFloat(vehicle.insurance) || 0,
      registration: parseFloat(vehicle.registration) || 0,
      lease_payments: parseFloat(vehicle.lease_payments) || 0,
      depreciation: parseFloat(vehicle.depreciation) || 0,
    };

    return calculateVehicleExpenseComparison(totalMiles, businessPct, actualExpenses, currentYear);
  }, [vehicle, currentYear]);

  // Calculate Meals
  const mealsResult = useMemo(() => {
    const total = parseFloat(meals.total_expenses);
    const year = parseInt(meals.year);

    if (!total) return null;

    return calculateMealDeduction(total, year);
  }, [meals]);

  // Calculate Phone/Internet
  const phoneInternetResult = useMemo(() => {
    const monthlyPhone = parseFloat(phoneInternet.monthly_phone) || 0;
    const monthlyInternet = parseFloat(phoneInternet.monthly_internet) || 0;
    const businessPct = parseFloat(phoneInternet.business_percentage) / 100;

    const annualPhone = monthlyPhone * 12;
    const annualInternet = monthlyInternet * 12;

    return {
      phone_deduction: annualPhone * businessPct,
      internet_deduction: annualInternet * businessPct,
      total_deduction: (annualPhone + annualInternet) * businessPct,
    };
  }, [phoneInternet]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tax Deduction Calculators
          </CardTitle>
          <CardDescription>
            Calculate various business deductions and compare methods
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home-office">
            <Home className="h-4 w-4 mr-2" />
            Home Office
          </TabsTrigger>
          <TabsTrigger value="vehicle">
            <Car className="h-4 w-4 mr-2" />
            Vehicle
          </TabsTrigger>
          <TabsTrigger value="meals">
            <Utensils className="h-4 w-4 mr-2" />
            Meals
          </TabsTrigger>
          <TabsTrigger value="phone-internet">
            <Phone className="h-4 w-4 mr-2" />
            Phone/Internet
          </TabsTrigger>
        </TabsList>

        {/* Home Office Tab */}
        <TabsContent value="home-office" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calculator</CardTitle>
                <CardDescription>Enter your home office details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="office_sqft">Office Square Footage</Label>
                  <Input
                    id="office_sqft"
                    type="number"
                    placeholder="e.g., 150"
                    value={homeOffice.square_feet}
                    onChange={(e) => setHomeOffice({ ...homeOffice, square_feet: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Simplified method max: 300 sq ft
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_sqft">Total Home Square Footage</Label>
                  <Input
                    id="total_sqft"
                    type="number"
                    placeholder="e.g., 2000"
                    value={homeOffice.total_square_feet}
                    onChange={(e) =>
                      setHomeOffice({ ...homeOffice, total_square_feet: e.target.value })
                    }
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Annual Actual Expenses (Optional)</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="rent_mortgage">Rent/Mortgage</Label>
                      <Input
                        id="rent_mortgage"
                        type="number"
                        placeholder="0.00"
                        value={homeOffice.rent_mortgage}
                        onChange={(e) =>
                          setHomeOffice({ ...homeOffice, rent_mortgage: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="utilities">Utilities</Label>
                      <Input
                        id="utilities"
                        type="number"
                        placeholder="0.00"
                        value={homeOffice.utilities}
                        onChange={(e) => setHomeOffice({ ...homeOffice, utilities: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurance">Insurance</Label>
                      <Input
                        id="insurance"
                        type="number"
                        placeholder="0.00"
                        value={homeOffice.insurance}
                        onChange={(e) => setHomeOffice({ ...homeOffice, insurance: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repairs">Repairs</Label>
                      <Input
                        id="repairs"
                        type="number"
                        placeholder="0.00"
                        value={homeOffice.repairs}
                        onChange={(e) => setHomeOffice({ ...homeOffice, repairs: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results</CardTitle>
                <CardDescription>Comparison of deduction methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {homeOfficeResult ? (
                  <>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Office Percentage</div>
                      <div className="text-2xl font-bold">
                        {homeOfficeResult.percentage?.toFixed(1)}%
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Simplified Method</span>
                          {homeOfficeResult.recommended_method === 'simplified' && (
                            <Badge>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {Math.min(parseFloat(homeOffice.square_feet), 300)} sq ft × $5
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(homeOfficeResult.simplified_deduction || 0)}
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Actual Expense Method</span>
                          {homeOfficeResult.recommended_method === 'actual' && (
                            <Badge>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {homeOfficeResult.percentage?.toFixed(1)}% of actual expenses
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(homeOfficeResult.actual_deduction || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                        Maximum Deduction
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(homeOfficeResult.recommended_deduction)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Enter office and total square footage to calculate
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vehicle Tab */}
        <TabsContent value="vehicle" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calculator</CardTitle>
                <CardDescription>Compare standard mileage vs actual expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="total_miles">Total Miles Driven</Label>
                  <Input
                    id="total_miles"
                    type="number"
                    placeholder="e.g., 15000"
                    value={vehicle.total_miles}
                    onChange={(e) => setVehicle({ ...vehicle, total_miles: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_pct">Business Use Percentage</Label>
                  <Input
                    id="business_pct"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="80"
                    value={vehicle.business_percentage}
                    onChange={(e) =>
                      setVehicle({ ...vehicle, business_percentage: e.target.value })
                    }
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Annual Actual Expenses</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="gas">Gas</Label>
                      <Input
                        id="gas"
                        type="number"
                        placeholder="0.00"
                        value={vehicle.gas}
                        onChange={(e) => setVehicle({ ...vehicle, gas: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maintenance">Maintenance & Repairs</Label>
                      <Input
                        id="maintenance"
                        type="number"
                        placeholder="0.00"
                        value={vehicle.maintenance}
                        onChange={(e) => setVehicle({ ...vehicle, maintenance: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_insurance">Insurance</Label>
                      <Input
                        id="vehicle_insurance"
                        type="number"
                        placeholder="0.00"
                        value={vehicle.insurance}
                        onChange={(e) => setVehicle({ ...vehicle, insurance: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registration">Registration & Fees</Label>
                      <Input
                        id="registration"
                        type="number"
                        placeholder="0.00"
                        value={vehicle.registration}
                        onChange={(e) => setVehicle({ ...vehicle, registration: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results</CardTitle>
                <CardDescription>Method comparison for {currentYear}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {vehicleResult ? (
                  <>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Standard Mileage</span>
                          {vehicleResult.recommended_method === 'standard_mileage' && (
                            <Badge>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {vehicleResult.standard_mileage.total_miles.toFixed(0)} miles × $
                          {vehicleResult.standard_mileage.rate.toFixed(2)}
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(vehicleResult.standard_mileage.deduction)}
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Actual Expenses</span>
                          {vehicleResult.recommended_method === 'actual_expenses' && (
                            <Badge>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {vehicleResult.actual_expenses.business_percentage.toFixed(0)}% of $
                          {vehicleResult.actual_expenses.total_expenses.toFixed(2)}
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(vehicleResult.actual_expenses.deduction)}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                        Maximum Deduction
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(vehicleResult.recommended_deduction)}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Save {formatCurrency(vehicleResult.savings)} with{' '}
                        {vehicleResult.recommended_method.replace('_', ' ')}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Enter mileage and expenses to calculate
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Meals Tab */}
        <TabsContent value="meals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calculator</CardTitle>
                <CardDescription>Business meal deduction (50% rule)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meal_expenses">Total Business Meal Expenses</Label>
                  <Input
                    id="meal_expenses"
                    type="number"
                    placeholder="0.00"
                    value={meals.total_expenses}
                    onChange={(e) => setMeals({ ...meals, total_expenses: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meal_year">Tax Year</Label>
                  <Select
                    value={meals.year}
                    onValueChange={(value) => setMeals({ ...meals, year: value })}
                  >
                    <SelectTrigger id="meal_year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Note: 2021-2022 allowed 100% deduction due to COVID relief
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results</CardTitle>
                <CardDescription>Deductible amount</CardDescription>
              </CardHeader>
              <CardContent>
                {mealsResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Deductible Percentage</div>
                      <div className="text-2xl font-bold">
                        {(mealsResult.deductible_percentage * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                        Meal Deduction
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(mealsResult.deduction)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Enter total meal expenses to calculate
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Phone/Internet Tab */}
        <TabsContent value="phone-internet" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calculator</CardTitle>
                <CardDescription>Business use allocation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_phone">Monthly Phone Cost</Label>
                  <Input
                    id="monthly_phone"
                    type="number"
                    placeholder="0.00"
                    value={phoneInternet.monthly_phone}
                    onChange={(e) =>
                      setPhoneInternet({ ...phoneInternet, monthly_phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_internet">Monthly Internet Cost</Label>
                  <Input
                    id="monthly_internet"
                    type="number"
                    placeholder="0.00"
                    value={phoneInternet.monthly_internet}
                    onChange={(e) =>
                      setPhoneInternet({ ...phoneInternet, monthly_internet: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_use_pct">Business Use Percentage</Label>
                  <Input
                    id="business_use_pct"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="50"
                    value={phoneInternet.business_percentage}
                    onChange={(e) =>
                      setPhoneInternet({ ...phoneInternet, business_percentage: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results</CardTitle>
                <CardDescription>Annual deduction</CardDescription>
              </CardHeader>
              <CardContent>
                {phoneInternetResult && (phoneInternet.monthly_phone || phoneInternet.monthly_internet) ? (
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <div className="text-sm text-muted-foreground">Phone Deduction</div>
                      <div className="text-xl font-semibold text-green-600">
                        {formatCurrency(phoneInternetResult.phone_deduction)}
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="text-sm text-muted-foreground">Internet Deduction</div>
                      <div className="text-xl font-semibold text-green-600">
                        {formatCurrency(phoneInternetResult.internet_deduction)}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                        Total Annual Deduction
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(phoneInternetResult.total_deduction)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Enter monthly costs to calculate
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
