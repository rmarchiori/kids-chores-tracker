import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Kids Chores Tracker</h1>
        <p className="mb-8 text-xl text-gray-600">
          A family chore management app for parents and children
        </p>
        <div className="flex flex-col gap-4 justify-center">
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login" className="btn-primary">
              Login
            </Link>
            <Link href="/auth/register" className="btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
