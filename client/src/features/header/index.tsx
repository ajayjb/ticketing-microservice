import React from "react";
import Image from "next/image";

import HeaderButtons from "../headerButtons";

const Header = async () => {
  return (
    <div className="py-4 flex justify-between items-center">
      <Image
        src="/tickets.png"
        alt="tickets"
        width={150}
        height={50}
        loading="eager"
      />
      <div>
        <HeaderButtons />
      </div>
    </div>
  );
};

export default Header;
