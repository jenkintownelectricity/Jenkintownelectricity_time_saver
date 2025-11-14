import { useQuery } from '@tanstack/react-query';
import { Car, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/queryClient';

interface Brand {
  id: number;
  name: string;
  description: string;
  specialization: string;
  keyFeatures: string[];
  websiteUrl: string;
  marketPosition: string;
  logoUrl?: string;
}

interface Model {
  id: number;
  brandId: number;
  modelName: string;
  year: number | null;
  vehicleType: string;
  batteryType: string;
  voltage: string;
  range: string;
  topSpeed: string;
  seatingCapacity: number;
  price: string;
  features: string[];
  imageUrl?: string;
}

export function BrandsPage() {
  const { data: brands, isLoading: loadingBrands } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: () => api.get<Brand[]>('/api/brands'),
  });

  const { data: models, isLoading: loadingModels } = useQuery<Model[]>({
    queryKey: ['models'],
    queryFn: () => api.get<Model[]>('/api/models'),
  });

  if (loadingBrands || loadingModels) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Golf Cart Database</h1>
        <p className="text-lg text-muted-foreground">
          Browse the world's most comprehensive golf cart specifications
        </p>
      </div>

      {/* Brands Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Brands</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands && brands.length > 0 ? (
            brands.map((brand) => (
              <Card key={brand.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <Car className="h-5 w-5" />
                        <span>{brand.name}</span>
                      </CardTitle>
                      {brand.marketPosition && (
                        <Badge variant="secondary" className="mt-2">
                          {brand.marketPosition}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="mt-3">
                    {brand.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {brand.specialization && (
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>Specialization:</strong> {brand.specialization}
                    </p>
                  )}
                  {brand.keyFeatures && brand.keyFeatures.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Key Features:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {brand.keyFeatures.slice(0, 3).map((feature, idx) => (
                          <li key={idx}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {brand.websiteUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => window.open(brand.websiteUrl, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                No brands found. Add brands to get started!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Models Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Popular Models</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models && models.length > 0 ? (
            models.slice(0, 6).map((model) => (
              <Card key={model.id} className="card-hover">
                {model.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-secondary">
                    <img
                      src={model.imageUrl}
                      alt={model.modelName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{model.modelName}</span>
                    {model.year && (
                      <Badge variant="outline">{model.year}</Badge>
                    )}
                  </CardTitle>
                  {model.vehicleType && (
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{model.vehicleType}</Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {model.batteryType && (
                      <div>
                        <span className="text-muted-foreground">Battery:</span>
                        <p className="font-medium">{model.batteryType}</p>
                      </div>
                    )}
                    {model.voltage && (
                      <div>
                        <span className="text-muted-foreground">Voltage:</span>
                        <p className="font-medium">{model.voltage}</p>
                      </div>
                    )}
                    {model.range && (
                      <div>
                        <span className="text-muted-foreground">Range:</span>
                        <p className="font-medium">{model.range}</p>
                      </div>
                    )}
                    {model.topSpeed && (
                      <div>
                        <span className="text-muted-foreground">Top Speed:</span>
                        <p className="font-medium">{model.topSpeed}</p>
                      </div>
                    )}
                  </div>
                  {model.seatingCapacity && (
                    <p>
                      <span className="text-muted-foreground">Seating:</span>{' '}
                      <span className="font-medium">
                        {model.seatingCapacity} passengers
                      </span>
                    </p>
                  )}
                  {model.price && (
                    <p className="text-lg font-semibold text-primary">
                      {model.price}
                    </p>
                  )}
                  <Link href={`/wiring?modelId=${model.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Wiring Diagrams
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                No models found. Add models to get started!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
