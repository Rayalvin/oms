import { Sidebar } from "@/components/oms/sidebar";

export default function OmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-60 min-w-0">
        {children}
      </div>
    </div>
  );
}
