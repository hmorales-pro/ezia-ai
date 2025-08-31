import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirection...',
};

export default function Page() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/home" />
      <script dangerouslySetInnerHTML={{ __html: 'window.location.href = "/home";' }} />
    </>
  );
}