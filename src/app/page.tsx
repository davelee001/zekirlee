import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-20">
      <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Zekirlee</p>
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">A place for ideas to grow.</h1>
      <p className="max-w-xl text-lg text-muted-foreground">Your application foundation is ready. Build conversations, connect your knowledge, and bring lasting memory to your AI experience.</p>
      <div><Button asChild variant="outline"><a href="/api/health">Check application health</a></Button></div>
    </main>
  );
}

