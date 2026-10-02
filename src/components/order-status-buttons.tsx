"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/app/actions/orders";

export function OrderStatusButtons({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleUpdate(nextStatus: "aprobado" | "rechazado") {
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, nextStatus);
        toast.success(`Orden ${nextStatus}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al actualizar");
      }
    });
  }

  return (
    <div className="flex gap-3 justify-end">
      <Button
        variant="destructive"
        disabled={pending || status === "rechazado"}
        onClick={() => handleUpdate("rechazado")}
      >
        {pending ? "Actualizando..." : "Rechazar"}
      </Button>
      <Button
        disabled={pending || status === "aprobado"}
        className="bg-green-600 hover:bg-green-700"
        onClick={() => handleUpdate("aprobado")}
      >
        {pending ? "Actualizando..." : "Aprobar"}
      </Button>
    </div>
  );
}
