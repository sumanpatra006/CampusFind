'use client';

import ReportItemForm from './report-item-form';
import ItemFeed from './item-feed';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ReportItemForm />
        </div>
        <div className="lg:col-span-2">
          <ItemFeed />
        </div>
      </div>
    </div>
  );
}
