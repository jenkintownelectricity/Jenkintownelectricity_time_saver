import { useQuery } from '@tanstack/react-query';
import { Wrench, Loader2, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';

interface Part {
  id: number;
  partNumber: string;
  name: string;
  description: string | null;
  category: string;
  price: string | null;
  inStock: boolean;
  imageUrl: string | null;
}

export function PartsPage() {
  const { data: parts, isLoading } = useQuery<Part[]>({
    queryKey: ['parts'],
    queryFn: () => api.get<Part[]>('/api/parts'),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Parts Catalog</h1>
        <p className="text-lg text-muted-foreground">
          Browse and order parts for your golf cart
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parts && parts.length > 0 ? (
          parts.map((part) => (
            <Card key={part.id} className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{part.name}</CardTitle>
                  {part.inStock ? (
                    <Badge variant="default">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
                <CardDescription>
                  Part #: {part.partNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary">{part.category}</Badge>

                {part.description && (
                  <p className="text-sm text-muted-foreground">
                    {part.description}
                  </p>
                )}

                {part.price && (
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(part.price)}
                  </p>
                )}

                <Button className="w-full" disabled={!part.inStock}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              No parts available. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
