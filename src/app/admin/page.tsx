import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/orders");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Panel Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
