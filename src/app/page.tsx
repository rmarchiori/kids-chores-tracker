export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Kids Chores Tracker</h1>
        <p className="mb-8 text-xl text-gray-600">
          A family chore management app for parents and children
        </p>
        <div className="flex gap-4 justify-center">
          <button className="btn-primary">Parent Login</button>
          <button className="btn-secondary">Child Login</button>
        </div>
      </div>
    </main>
  )
}
