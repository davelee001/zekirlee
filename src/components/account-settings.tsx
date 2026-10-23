"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useAccount } from "@/hooks/use-account";
import { createClient } from "@/lib/supabase/client";

export function AccountSettings() {
  const account = useAccount();
  const [email, setEmail] = useState("");
