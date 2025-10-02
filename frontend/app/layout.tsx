import type { Metadata } from "next";
import { AppProvider } from "../contexts/AppContext";
import { CustomThemeProvider } from "../contexts/ThemeProvider";
import Header from "../components/header";

export const metadata: Metadata = {
  title: "BLWM Retreat- Oct 2025",
  description: "Living Waters Ministries Bangladesh Retreat Management System",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <CustomThemeProvider>
            <Header />
            <main>{children}</main>
          </CustomThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
