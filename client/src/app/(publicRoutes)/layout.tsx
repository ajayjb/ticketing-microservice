import { ROUTES } from "@/constants/routes";
import { checkAuth } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await checkAuth();

  if (auth) {
    redirect(ROUTES.HOME);
  }
  
  return <div>{children}</div>;
}
