import EmailClient from "@/Components/EmailClient";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="my-2">
<h3>Email Automation Test Drive</h3>
      </div>
      <EmailClient/>
    </main>
  );
}
