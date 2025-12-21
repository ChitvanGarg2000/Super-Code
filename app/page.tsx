'use client'
import { Button } from "@/components/ui/button";
import UserButton from "@/features/auth/components/UserButton";
export default function Home() {
  return (
    <>
    <h1 className="text-3xl font-bold underline">Hello World</h1>
    <Button>Click me</Button>
    <UserButton />
    </>
  );
}