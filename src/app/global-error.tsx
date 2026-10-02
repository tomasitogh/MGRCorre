"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2>Algo salió mal</h2>
            <button onClick={() => reset()}>Reintentar</button>
          </div>
        </div>
      </body>
    </html>
  );
}
