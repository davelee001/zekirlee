"use client";
import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { ThemeToggle } from "./theme-toggle";
export function WorkspacePage({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <main className="app-shell"><WorkspaceSidebar open={open} onClose={() => setOpen(false)} /><section className="main-panel"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><strong>{title}</strong><ThemeToggle /></header><div className="workspace-content"><h1>{title}</h1>{children}</div></section></main>;
}
