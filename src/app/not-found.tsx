import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>No encontrado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            La página u orden que buscás no existe.
          </p>
          <Link href="/" className={buttonVariants({ className: "w-full" })}>
            Volver al inicio
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
