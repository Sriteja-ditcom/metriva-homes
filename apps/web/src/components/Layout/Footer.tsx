import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-brand-500" />
              <span className="font-bold text-foreground">Metriva Homes</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India's trusted AI-powered real estate platform. Every listing verified, every transaction protected.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Explore</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/properties?listingType=BUY" className="hover:text-foreground transition-colors">Buy Properties</Link></li>
              <li><Link to="/properties?listingType=RENT" className="hover:text-foreground transition-colors">Rent Properties</Link></li>
              <li><Link to="/properties?listingType=COMMERCIAL" className="hover:text-foreground transition-colors">Commercial</Link></li>
              <li><Link to="/post-property" className="hover:text-foreground transition-colors">Post a Listing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Metriva Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with trust in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
