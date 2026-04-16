import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rastreo de Equipo | INFOSISTEL — Seguimiento de Reparación",
  description:
    "Consulta en tiempo real el estado de la reparación de tu laptop, PC o impresora. Ingresa tu DNI o código de servicio.",
};

export default function RastreoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
