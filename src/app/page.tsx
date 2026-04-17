export default async function Home() {
  // Simulamos un retraso de 3 segundos trayendo datos de la "base de datos"
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans tracking-tight">
      <h1 className="text-3xl font-medium text-gray-500">Marketvesitario (Cargado ✅)</h1>
    </div>
  )
}
