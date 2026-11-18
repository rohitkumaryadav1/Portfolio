import { notFound } from 'next/navigation';
import { read } from '@/lib/data';
import { ResumeViewer } from '@/components/resume-viewer';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Resume',
  description: 'View or download Rohit Kumar Yadav’s resume.',
};
export default async function Resume() {
  const profile = (await read('profile'))[0]?.data;
  if (!profile?.resume_path) notFound();
  return <ResumeViewer name={profile.name} />;
}
