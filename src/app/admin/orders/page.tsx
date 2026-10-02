import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { logoutAction } from "@/app/actions/auth";

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

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
}

export default async function OrdersPage() {
  await connectDB();

  // Una sola agregación: evita el N+1 de countDocuments por orden.
  const orders = await Order.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "runners",
        localField: "_id",
        foreignField: "orderId",
        as: "runners",
      },
    },
    { $addFields: { participantsCount: { $size: "$runners" } } },
    { $project: { runners: 0 } },
  ]);

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="bg-primary text-primary-foreground py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin - Órdenes</h1>
          <form action={logoutAction}>
            <Button
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              Cerrar sesión
            </Button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Inscripciones ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={String(order._id)} className="hover:bg-muted/50">
                    <TableCell className="text-sm">
                      <Link
                        href={`/admin/orders/${String(order._id)}`}
                        className="block"
                      >
                        {formatDate(order.createdAt)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${String(order._id)}`}
                        className="block"
                      >
                        {order.phone}
                      </Link>
                    </TableCell>
                    <TableCell>{order.participantsCount}</TableCell>
                    <TableCell>
                      ${order.totalAmount.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="capitalize">
                      {order.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No hay inscripciones aún
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
