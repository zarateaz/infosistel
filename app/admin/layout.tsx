import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | INFOSISTEL",
  description: "Panel de administración de INFOSISTEL. Gestión de productos, reparaciones y usuarios.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
