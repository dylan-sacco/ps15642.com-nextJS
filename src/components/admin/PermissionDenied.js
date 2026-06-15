export default function PermissionDenied({ permission }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-3">
      <div className="text-5xl">🔒</div>
      <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
      <p className="text-gray-500 text-sm max-w-xs">
        Your account does not have permission to access this page
        {permission ? ` (${permission})` : ''}.
        Contact an admin if you think this is a mistake.
      </p>
    </div>
  );
}
