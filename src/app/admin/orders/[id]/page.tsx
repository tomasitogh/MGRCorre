"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

interface Runner {
  name: string;
  dni: string;
  age: number;
  raceType: string;
  raceCategory?: string;
  shirtSize: string;
  runnerNumber: number;
}

interface OrderDetail {
  _id: string;
  phone: string;
  paymentMethod: string;
  paymentReceiptUrl?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  runners: Runner[];
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setOrder)
      .catch(() => router.push("/admin/orders"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
    } finally {
      setUpdating(false);
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="bg-primary text-primary-foreground py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => router.push("/admin/orders")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
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
              <span>{new Date(order.createdAt).toLocaleDateString("es-AR")}</span>
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
              <span className="font-bold">${order.totalAmount.toLocaleString("es-AR")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participantes ({order.runners.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.runners.map((r) => (
              <div key={r.runnerNumber} className="flex items-center justify-between rounded-lg border p-3">
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
                    {r.raceType}{r.raceCategory ? ` (${r.raceCategory})` : ""}
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
              <a href={order.paymentReceiptUrl} target="_blank" rel="noopener noreferrer">
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

        <div className="flex gap-3 justify-end">
          <Button
            variant="destructive"
            disabled={updating || order.status === "rechazado"}
            onClick={() => updateStatus("rechazado")}
          >
            Rechazar
          </Button>
          <Button
            disabled={updating || order.status === "aprobado"}
            className="bg-green-600 hover:bg-green-700"
            onClick={() => updateStatus("aprobado")}
          >
            Aprobar
          </Button>
        </div>
      </div>
    </div>
  );
}
