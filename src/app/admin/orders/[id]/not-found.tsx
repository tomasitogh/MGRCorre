import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>Orden no encontrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            La orden que buscás no existe o fue eliminada.
          </p>
          <Link href="/admin/orders" className={buttonVariants({ className: "w-full" })}>
            Volver a órdenes
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
