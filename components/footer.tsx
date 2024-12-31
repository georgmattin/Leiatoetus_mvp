export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-500">
            © 2024 Leiatoetus.ee. Kõik õigused kaitstud.
          </p>
        </div>
        <div className="mt-4 flex justify-center md:mt-0">
          <div className="text-sm text-gray-500">
            <a href="/kontakt" className="hover:text-gray-900">Kontakt</a>
            <span className="mx-2">|</span>
            <a href="/tingimused" className="hover:text-gray-900">Tingimused</a>
          </div>
        </div>
      </div>
    </footer>
  )
} 