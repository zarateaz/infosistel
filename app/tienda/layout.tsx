import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda Online | INFOSISTEL — Hardware y Accesorios en Huancayo",
  description:
    "Compra repuestos, accesorios y periféricos de computadora con garantía. Mouse, teclados, laptops, SSD y más con despacho en Huancayo.",
};

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
