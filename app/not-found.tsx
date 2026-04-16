import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl font-black text-blue-infositel mb-4">404 - No Encontrado</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
      <Link href="/" className="px-8 py-4 bg-blue-infositel text-white tracking-widest uppercase font-black text-sm rounded-2xl hover:bg-black transition-colors shadow-xl">
        Volver al Inicio
      </Link>
    </div>
  );
}
