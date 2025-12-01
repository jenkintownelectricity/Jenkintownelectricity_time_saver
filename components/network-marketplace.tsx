'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Network,
  Users,
  MapPin,
  TrendingUp,
  DollarSign,
  Zap,
  Plus,
  Share2,
  LogOut,
  Search
} from 'lucide-react'

export default function NetworkMarketplace() {
  const {
    ownerSettings,
    currentCompanyCode,
    companyAccounts,
    networkMarketplaces,
    incomingCalls,
    createMarketplace,
    joinMarketplace,
    leaveMarketplace,
    shareCallToNetwork,
    getMarketplacesForCompany
  } = useAppStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newMarketplace, setNewMarketplace] = useState({
    name: '',
    description: '',
    cities: '',
    radius: 50,
    monthlyFee: 50
  })

  const currentCompany = companyAccounts.find(c => c.companyCode === currentCompanyCode)
  const myMarketplaces = useMemo(() => {
    if (!currentCompanyCode) return []
    return getMarketplacesForCompany(currentCompanyCode)
  }, [currentCompanyCode, getMarketplacesForCompany])

  const availableMarketplaces = useMemo(() => {
    if (!currentCompanyCode) return networkMarketplaces
    return networkMarketplaces.filter(mp => !mp.memberCompanies.includes(currentCompanyCode))
  }, [currentCompanyCode, networkMarketplaces])

  const handleCreateMarketplace = () => {
    if (!currentCompanyCode || !newMarketplace.name.trim()) return

    createMarketplace({
      name: newMarketplace.name.trim(),
      description: newMarketplace.description.trim(),
      memberCompanies: [currentCompanyCode],
      serviceArea: {
        cities: newMarketplace.cities.split(',').map(c => c.trim()).filter(c => c),
        radius: newMarketplace.radius
      },
      settings: {
        allowAutoAccept: false,
        requireVerification: true,
        minimumRating: 4.0,
        monthlyFee: newMarketplace.monthlyFee
      }
    })

    setShowCreateModal(false)
    setNewMarketplace({
      name: '',
      description: '',
      cities: '',
      radius: 50,
      monthlyFee: 50
    })
  }

  const handleJoinMarketplace = (marketplaceId: string) => {
    if (!currentCompanyCode) return
    const marketplace = networkMarketplaces.find(mp => mp.id === marketplaceId)
    if (marketplace && marketplace.settings.monthlyFee > 0) {
      if (confirm(`Join this network for $${marketplace.settings.monthlyFee}/month?`)) {
        joinMarketplace(marketplaceId, currentCompanyCode)
      }
    } else {
      joinMarketplace(marketplaceId, currentCompanyCode)
    }
  }

  const handleLeaveMarketplace = (marketplaceId: string) => {
    if (!currentCompanyCode) return
    if (confirm('Leave this network?')) {
      leaveMarketplace(marketplaceId, currentCompanyCode)
    }
  }

  const handleShareCall = (callId: string, marketplaceId: string) => {
    if (ownerSettings.monetization.enabled && ownerSettings.monetization.callBidding.enabled) {
      const marketplace = networkMarketplaces.find(mp => mp.id === marketplaceId)
      const dailyFee = marketplace ? marketplace.settings.monthlyFee / 30 : 0
      if (dailyFee > 0) {
        if (confirm(`Share this call to the network? Network fee: $${dailyFee.toFixed(2)}`)) {
          shareCallToNetwork(callId, marketplaceId)
          alert('Call shared to network!')
        }
      } else {
        shareCallToNetwork(callId, marketplaceId)
        alert('Call shared to network!')
      }
    } else {
      shareCallToNetwork(callId, marketplaceId)
      alert('Call shared to network!')
    }
  }

  if (!ownerSettings.monetization.enabled) {
    return (
      <Card className="border-2 border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-500" />
            Network Marketplace
          </CardTitle>
          <CardDescription>
            Share calls and collaborate with other companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-lg font-medium text-blue-600 mb-2">
              🌐 Network Feature Preview
            </p>
            <p className="text-muted-foreground">
              The network marketplace allows you to share overflow work with other trusted electrical contractors.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              This feature will be available when monetization is enabled.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentCompanyCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Marketplace</CardTitle>
          <CardDescription>
            Create a company account to join networks
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Network Marketplace</h2>
          <p className="text-muted-foreground">
            Expand your service area and share overflow work
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Network
        </Button>
      </div>

      {/* My Networks */}
      {myMarketplaces.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">My Networks</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {myMarketplaces.map((marketplace) => (
              <Card key={marketplace.id} className="border-2 border-green-500/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-green-500" />
                        {marketplace.name}
                      </CardTitle>
                      <CardDescription>{marketplace.description}</CardDescription>
                    </div>
                    <Badge className="bg-green-600">Member</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-2xl font-bold">{marketplace.memberCompanies.length}</p>
                      <p className="text-xs text-muted-foreground">Members</p>
                    </div>
                    <div>
                      <Zap className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-2xl font-bold">{marketplace.stats.totalCalls}</p>
                      <p className="text-xs text-muted-foreground">Calls</p>
                    </div>
                    <div>
                      <DollarSign className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-2xl font-bold">${(marketplace.stats.totalValue / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-muted-foreground">Value</p>
                    </div>
                  </div>

                  <div className="border-t my-3" />

                  <div>
                    <p className="text-sm font-medium mb-2">Service Area:</p>
                    <div className="flex flex-wrap gap-2">
                      {marketplace.serviceArea.cities.map((city, idx) => (
                        <Badge key={idx} variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          {city}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {marketplace.serviceArea.radius} mile radius
                    </p>
                  </div>

                  <div className="border-t my-3" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Monthly Fee</p>
                      <p className="text-lg font-bold">${marketplace.settings.monthlyFee}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveMarketplace(marketplace.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Leave
                    </Button>
                  </div>

                  {/* Quick Share Calls */}
                  <div>
                    <p className="text-sm font-medium mb-2">Share Calls:</p>
                    {incomingCalls.filter(c => c.companyCode === currentCompanyCode && c.status === 'open').length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active calls to share</p>
                    ) : (
                      <div className="space-y-2">
                        {incomingCalls
                          .filter(c => c.companyCode === currentCompanyCode && c.status === 'open')
                          .slice(0, 2)
                          .map(call => (
                            <Button
                              key={call.id}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleShareCall(call.id, marketplace.id)}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              {call.description.slice(0, 30)}...
                            </Button>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Networks */}
      {availableMarketplaces.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Available Networks</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {availableMarketplaces.map((marketplace) => (
              <Card key={marketplace.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    {marketplace.name}
                  </CardTitle>
                  <CardDescription>{marketplace.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xl font-bold">{marketplace.memberCompanies.length}</p>
                      <p className="text-xs text-muted-foreground">Members</p>
                    </div>
                    <div>
                      <Zap className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xl font-bold">{marketplace.stats.totalCalls}</p>
                      <p className="text-xs text-muted-foreground">Calls</p>
                    </div>
                    <div>
                      <TrendingUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xl font-bold">{marketplace.stats.avgResponseTime}m</p>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                    </div>
                  </div>

                  <div className="border-t my-3" />

                  <div>
                    <p className="text-sm font-medium mb-2">Service Area:</p>
                    <div className="flex flex-wrap gap-2">
                      {marketplace.serviceArea.cities.slice(0, 3).map((city, idx) => (
                        <Badge key={idx} variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          {city}
                        </Badge>
                      ))}
                      {marketplace.serviceArea.cities.length > 3 && (
                        <Badge variant="outline">
                          +{marketplace.serviceArea.cities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="border-t my-3" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Fee</p>
                      <p className="text-xl font-bold">${marketplace.settings.monthlyFee}</p>
                    </div>
                    <Button onClick={() => handleJoinMarketplace(marketplace.id)}>
                      Join Network
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Marketplace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Create Network Marketplace</CardTitle>
              <CardDescription>
                Start a new network to share work with other contractors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Network Name</label>
                <Input
                  placeholder="Philadelphia Electrical Network"
                  value={newMarketplace.name}
                  onChange={(e) => setNewMarketplace({ ...newMarketplace, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  placeholder="Serving the greater Philadelphia area..."
                  value={newMarketplace.description}
                  onChange={(e) => setNewMarketplace({ ...newMarketplace, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Service Cities (comma-separated)</label>
                <Input
                  placeholder="Philadelphia, Camden, Wilmington"
                  value={newMarketplace.cities}
                  onChange={(e) => setNewMarketplace({ ...newMarketplace, cities: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Service Radius (miles)</label>
                <Input
                  type="number"
                  value={newMarketplace.radius}
                  onChange={(e) => setNewMarketplace({ ...newMarketplace, radius: parseInt(e.target.value) || 50 })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Monthly Fee ($)</label>
                <Input
                  type="number"
                  value={newMarketplace.monthlyFee}
                  onChange={(e) => setNewMarketplace({ ...newMarketplace, monthlyFee: parseFloat(e.target.value) || 50 })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMarketplace}>
                  Create Network
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
