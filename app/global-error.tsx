"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h2 className="text-3xl font-black text-red-500 mb-4">Error Fatal del Sistema</h2>
          <p className="text-gray-600 mb-8 max-w-md text-center">Nos disculpamos, ha ocurrido un error inesperado al cargar la aplicación.</p>
          <button 
            onClick={() => reset()}
            className="px-6 py-3 bg-black text-white font-bold rounded-2xl"
          >
            Intentar de Nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
