export default function UnauthorizedPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-slate-900">
      <h1 className="text-4xl font-black text-indigo-600">403</h1>
      <p className="font-bold text-xl">Unauthorized Access</p>
      <p className="text-slate-500">You do not have permission to view this page.</p>
      <a href="/login" className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Back to Login</a>
    </div>
  );
}