"use client";

import { Button } from "./button";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await signOut({ callbackUrl: "/login" });
      }}
    >
      Logout
    </Button>
  );
}
