import type { Metadata } from 'next';
import './globals.css';
import { AmbientMesh } from '@/components/ambient-mesh';
export const metadata: Metadata = {
  title: { default: 'Rohit Kumar Yadav', template: '%s · Rohit Kumar Yadav' },
  description: 'Computer Science undergraduate building practical software with AI and data.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AmbientMesh />
        {children}
      </body>
    </html>
  );
}
