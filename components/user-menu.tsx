"use client";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function UserMenu() {
  const { data } = useSession();
  const user = data?.user;
  
  if (!user) {
    return (
      <Link href="/signin">
        <Button variant="ghost">Sign in</Button>
      </Link>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 w-8 rounded-full overflow-hidden">
        <Image src={user.image || "/placeholder-user.jpg"} alt={user.name || "User"} fill className="object-cover" />
      </div>
      <span className="text-sm">{user.name || user.email}</span>
      <Button variant="outline" size="sm" onClick={() => signOut()}>Sign out</Button>
    </div>
  );
}

