"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RunnerResult {
  name: string;
  runnerNumber: number;
  age: number;
  raceType: string;
  raceCategory?: string;
  shirtSize: string;
  status: string;
}

export function DniLookup() {
  const [dni, setDni] = useState("");
  const [results, setResults] = useState<RunnerResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!dni.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(`/api/lookup?dni=${encodeURIComponent(dni)}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "No se encontraron inscripciones");
        return;
      }
      const data = await res.json();
      setResults(data.runners);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Consulta el estado de tu inscripción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="lookup-dni">DNI</Label>
            <Input
              id="lookup-dni"
              placeholder="Ingresá tu DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {results && results.length > 0 && (
          <div className="space-y-2">
            {results.map((r) => (
              <div
                key={r.runnerNumber}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Número de corredor: <span className="font-mono font-bold">#{r.runnerNumber}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.raceType}{r.raceCategory ? ` (${r.raceCategory})` : ""} · {r.age} años · Talle {r.shirtSize}
                  </p>
                </div>
                <Badge variant="outline" className={statusColor(r.status)}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
