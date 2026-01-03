
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="z-20 flex flex-col justify-start items-center min-h-screen py-2 mt-10">
      <div className="flex flex-col justify-center items-center my-5">
        <Image src={'./hero.svg'} height={300} width={300} alt="hero-image" />
        <h1 className="z-20 text-6xl mt-8 font-extrabold text-center bg-clip-text text-transparent bg-linear-to-r 
from-purple-500 via-indigo-500 to-blue-500
dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400"> SuperCode AI Editor</h1>
      </div>
      <p className="mt-2 text-lg text-center text-gray-600 dark:text-gray-400 px-5 py-10 max-w-2xl">
        SuperCode Editor is a powerful and intelligent code editor that enhances
        your coding experience with advanced features and seamless integration.
        It is designed to help you write, debug, and optimize your code
        efficiently.
      </p>
      <Link href={"/dashboard"}>
        <Button variant={"brand"} className="mb-4 cursor-pointer" size={"lg"}>
          Get Started
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}