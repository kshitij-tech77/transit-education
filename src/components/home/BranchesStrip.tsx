import { MapPin, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BranchesStrip({ branches }: { branches: any[] }) {
  const branchData = branches || [];
  return (
    <section className="py-12 bg-black border-t border-gray-800">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {branchData.map((branch) => (
            <Link key={branch.slug} href={`/locations/${branch.slug}`} className="bg-gray-900/50 hover:bg-gray-800 border border-gray-800 p-6 rounded-xl transition-all group">
              <h3 className="text-white font-bold text-lg mb-4">{branch.name}</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Phone className="w-4 h-4 shrink-0 text-brand" />
                  <span>{branch.phone}</span>
                </div>
              </div>
              <div className="text-brand text-sm font-semibold flex items-center gap-2 group-hover:text-white transition-colors">
                View branch <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
