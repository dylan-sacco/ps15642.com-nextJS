import { getPublishedProjects } from '@/lib/projects';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Projects | P&S Contracting and Landscape',
  description: 'See the latest landscape, hardscape, and commercial projects from P&S Contracting and Landscape.',
  openGraph: {
    title: 'Projects | P&S Contracting and Landscape',
    description: 'Landscape, hardscape, and commercial projects from P&S Contracting and Landscape.',
    url: '/projects',
    siteName: 'P&S Contracting and Landscape',
    images: [{ url: '/hs1.webp', width: 1800, height: 800 }],
    locale: 'en_US',
    type: 'website',
  },
};

export default function ProjectsPage() {
  const projects = getPublishedProjects();

  return (
    <div>
      <ParallaxCard>
        <H1Drop color="text-white" size="text-4xl md:text-6xl">
          Projects
        </H1Drop>
      </ParallaxCard>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-16">No projects published yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map(project => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {project.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-52 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                )}
                <div className="p-5">
                  {project.date && (
                    <time className="text-xs text-gray-400">{project.date}</time>
                  )}
                  <h2 className="text-lg font-bold text-gray-800 mt-1 mb-2 group-hover:text-lime-700 transition-colors">
                    {project.title}
                  </h2>
                  {project.excerpt && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{project.excerpt}</p>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-lime-50 text-lime-700 border border-lime-200 rounded-full px-2.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
