import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Society Maintenance Tracker",
  description: "Manage society complaints, notices, and communication",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}