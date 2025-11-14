import { Link } from 'wouter';
import { MapPin, Car, FileText, Database, Navigation, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HomePage() {
  const features = [
    {
      icon: Navigation,
      title: 'GPS Navigation',
      description: 'Turn-by-turn directions optimized for LSV, NEV, and street-legal golf carts with speed limit filtering',
      href: '/gps',
    },
    {
      icon: Database,
      title: 'Comprehensive Database',
      description: 'The world\'s most complete golf cart database with specs, models, and technical information',
      href: '/brands',
    },
    {
      icon: FileText,
      title: 'Wiring Diagrams',
      description: 'Find or upload wiring diagrams for every golf cart model. Custom AutoCAD drawings available',
      href: '/wiring',
    },
    {
      icon: Car,
      title: 'Parts Catalog',
      description: 'Search and order parts with compatibility checking across all major brands and models',
      href: '/parts',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Ultimate Golf Cart Resource Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              GPS navigation, technical specs, wiring diagrams, and parts - all in one place
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/gps">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg">
                  <MapPin className="mr-2 h-5 w-5" />
                  Start Navigation
                </Button>
              </Link>
              <Link href="/brands">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg bg-white/10 border-white text-white hover:bg-white/20">
                  <Car className="mr-2 h-5 w-5" />
                  Browse Database
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for golf cart owners, technicians, and enthusiasts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href}>
                  <Card className="card-hover cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why GolfCartly Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Why GolfCartly?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Golf Cart Optimized</h3>
                <p className="text-muted-foreground">
                  Routes filtered for ≤35 mph roads, residential streets, and bike paths
                </p>
              </div>

              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <Database className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Complete Database</h3>
                <p className="text-muted-foreground">
                  The world's largest collection of golf cart specs and wiring diagrams
                </p>
              </div>

              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Diagrams</h3>
                <p className="text-muted-foreground">
                  Can't find a diagram? We create custom AutoCAD drawings for you
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Navigate smarter. Maintain better. Drive confidently.
          </p>
          <Link href="/gps">
            <Button size="lg" className="text-lg">
              <MapPin className="mr-2 h-5 w-5" />
              Start Navigating Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
