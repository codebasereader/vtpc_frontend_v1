import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="font-admin flex min-h-screen items-center justify-center bg-brand-page px-4">
      <div className="w-full max-w-sm rounded-xl border border-brand-divider bg-white p-8">
        <Outlet />
      </div>
    </div>
  )
}
