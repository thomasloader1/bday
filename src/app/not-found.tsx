import Link from "next/link";
import Button from "@/components/ui/Button";

export const runtime = "nodejs";

export default function NotFound() {
  return (
    <section className="py-16 md:py-24">
      <h1 className="text-display text-ink">Página no encontrada</h1>
      <p className="lead mt-4 text-ink-2">
        El enlace que abriste no existe o cambió de lugar.
      </p>
      <div className="mt-8">
        <Button asChild variant="primary">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </section>
  );
}
