export default function KasutajaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 mx-5 my-5">
        {children}
      </div>
    </div>
  )
} 