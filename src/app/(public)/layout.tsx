import { AdaptiveShell } from "@/components/brand/adaptive-shell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <AdaptiveShell>{children}</AdaptiveShell>;
}
