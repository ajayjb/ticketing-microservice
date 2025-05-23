import { ROUTES } from "@/constants/routes";
import { checkAuth } from "@/lib/session";
import { redirect } from "next/navigation";

const Home = async () => {
  const auth = await checkAuth();

  if (!auth) {
    redirect(ROUTES.SIGNIN);
  }

  return <div>Home</div>;
};

export default Home;
