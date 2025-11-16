import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6" />
              <span className="text-lg font-bold">ProcureChain</span>
            </div>
            <p className="text-gray-400 text-sm">
              AI-powered procurement transparency for Kenyan county governments
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/procurement" className="hover:text-white">Procurements</Link></li>
              <li><Link href="/vendors" className="hover:text-white">Vendors</Link></li>
              <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 ProcureChain. Built at Kabarak University.</p>
          <p className="mt-2">Department of Computer Science | Supervisor: Ms. Daisy Ondwari</p>
        </div>
      </div>
    </footer>
  );
}
