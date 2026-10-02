import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Runner } from "@/models/Runner";
import { OrderStatusButtons } from "@/components/order-status-buttons";

export const dynamic = "force-dynamic";

function statusColor(status: string) {
  switch (status) {
    case "aprobado":
      return "bg-green-100 text-green-800 border-green-200";
    case "rechazado":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await connectDB();
  const [order, runners] = await Promise.all([
    Order.findById(id).lean(),
    Runner.find({ orderId: id }).lean(),
  ]);

  if (!order) {
    notFound();
  }

  const orderId = String(order._id);

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="bg-primary text-primary-foreground py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-primary-foreground hover:bg-primary-foreground/10")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
          <h1 className="text-xl font-bold">Detalle de orden</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Información de la orden</CardTitle>
            <Badge variant="outline" className={statusColor(order.status)}>
              {order.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span>
                {new Date(order.createdAt).toLocaleDateString("es-AR", {
                  timeZone: "America/Argentina/Buenos_Aires",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teléfono:</span>
              <span>{order.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Método de pago:</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold">
                ${order.totalAmount.toLocaleString("es-AR")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participantes ({runners.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {runners.map((r) => (
              <div
                key={r.runnerNumber}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground">DNI: {r.dni}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.age} años · Talle {r.shirtSize}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">#{r.runnerNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.raceType}
                    {r.raceCategory ? ` (${r.raceCategory})` : ""}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {order.paymentMethod === "transferencia" && order.paymentReceiptUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Comprobante de pago</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={order.paymentReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={order.paymentReceiptUrl}
                  alt="Comprobante de pago"
                  width={400}
                  height={600}
                  className="rounded-lg border object-contain"
                  unoptimized
                />
              </a>
            </CardContent>
          </Card>
        )}

        <Separator />

        <OrderStatusButtons orderId={orderId} status={order.status} />
      </div>
    </div>
  );
}
