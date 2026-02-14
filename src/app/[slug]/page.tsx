
// This file is new
import { getPublishedPageBySlug } from '@/services/custom-pages';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type PageProps = {
  params: {
    slug: string;
  };
};

// Generate metadata for the custom page
export async function generateMetadata({ params }: PageProps) {
  const { page } = await getPublishedPageBySlug(params.slug);
  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }
  return {
    title: `${page.title} | GLAD CELL`,
  };
}

export default async function CustomPage({ params }: PageProps) {
  const { slug } = params;
  const { page } = await getPublishedPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-4xl font-bold animated-gradient-text">{page.title}</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {page.content || ''}
                </ReactMarkdown>
            </CardContent>
        </Card>
    </div>
  );
}

// Optional: If you have many pages, this can pre-build them at build time.
// export async function generateStaticParams() {
//   const { getCustomPages } = require('@/services/custom-pages');
//   const { pages } = await getCustomPages();
//   return pages?.map((page) => ({
//     slug: page.slug,
//   })) || [];
// }

// Enforce dynamic rendering for this route as pages can be added/removed at any time.
export const dynamic = 'force-dynamic';
