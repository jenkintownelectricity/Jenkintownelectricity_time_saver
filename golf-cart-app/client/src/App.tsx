import { Route, Switch } from 'wouter';
import { Header } from './components/header';
import { HomePage } from './pages/home';
import { GPSNavigationPage } from './pages/gps-navigation';
import { BrandsPage } from './pages/brands';
import { WiringPage } from './pages/wiring';
import { PartsPage } from './pages/parts';
import { CartPage } from './pages/cart';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/gps" component={GPSNavigationPage} />
          <Route path="/brands" component={BrandsPage} />
          <Route path="/wiring" component={WiringPage} />
          <Route path="/parts" component={PartsPage} />
          <Route path="/cart" component={CartPage} />
          <Route>
            <div className="container mx-auto px-4 py-20 text-center">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <p className="text-lg text-muted-foreground mb-8">
                The page you're looking for doesn't exist.
              </p>
              <a href="/" className="text-primary hover:underline">
                Go back home
              </a>
            </div>
          </Route>
        </Switch>
      </main>
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 GolfCartly. Built with ❤️ for the golf cart community.</p>
          <p className="mt-2">Navigate smarter. Maintain better. Drive confidently.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
