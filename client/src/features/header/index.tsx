import React from "react";
import Image from "next/image";

import HeaderButtons from "../headerButtons";
import { checkAuth } from "@/lib/session";
import Link from "next/link";

const Header = async () => {
  const auth = await checkAuth();

  return (
    <div className="py-4 flex justify-between items-center">
      <Link href="/">
        <Image
          src="/tickets.png"
          alt="tickets"
          width={150}
          height={50}
          loading="eager"
        />
      </Link>
      <div>
        <HeaderButtons isLoggedIn={!!auth} />
      </div>
    </div>
  );
};

export default Header;
