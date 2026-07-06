export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to the Probae Admin Dashboard.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-700">
          You have successfully logged in. 
          Use the sidebar to navigate to the other sections as you build them!
        </p>
      </div>
    </div>
  );
}
