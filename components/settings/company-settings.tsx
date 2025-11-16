'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function CompanySettings() {
  const { companies, currentCompanyCode, switchCompany } = useAppStore()

  const currentCompany = companies.find(c => c.code === currentCompanyCode)

  return (
    <div className="space-y-6">
      {/* Active Company */}
      {currentCompany ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Active Company</CardTitle>
                <CardDescription>Currently selected company</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-semibold">{currentCompany.name}</h3>
                  <p className="text-sm text-muted-foreground">Company Code: <span className="font-mono font-medium">{currentCompany.code}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{currentCompany.members.length} member(s)</span>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(currentCompany.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Linked Companies</p>
                  <p className="font-medium">{currentCompany.linkedCompanies.length}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Company
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Company Selected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create or select a company to get started
            </p>
            <Button>Create Company</Button>
          </CardContent>
        </Card>
      )}

      {/* All Companies */}
      {companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Companies</CardTitle>
            <CardDescription>Switch between companies or manage settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies.map((company) => (
                <div
                  key={company.code}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{company.name}</h4>
                      <p className="text-sm text-muted-foreground">Code: {company.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {company.code === currentCompanyCode && (
                      <Badge variant="default">Active</Badge>
                    )}
                    {company.code !== currentCompanyCode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => switchCompany(company.code)}
                      >
                        Switch
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
