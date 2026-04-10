import { readCrew } from '@/lib/crew';

/**
 * MeetTheTeam — server component rendered on the About page.
 * Returns null if the section is hidden or there are no visible members.
 */
export default function MeetTheTeam() {
  const { sectionVisible, title, subtitle, members } = readCrew();
  const visible = members.filter(m => m.visible);

  if (!sectionVisible || visible.length === 0) return null;

  const gridClass =
    visible.length === 1
      ? 'grid-cols-1 max-w-xs mx-auto'
      : visible.length === 2
        ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="max-w-6xl mx-auto px-6 py-14 border-gray-100">
      <h2 className="text-3xl font-bold text-center mb-1">{title}</h2>
      {subtitle && (
        <p className="text-center text-sm mb-12">{subtitle}</p>
      )}

      <div className={`grid gap-10  ${gridClass}`}>
        {visible.map(member => (
          <CrewMemberCard member={member} key={member.name} />
        ))}
      </div>
    </section>
  );
}


function CrewMemberCard({member}) {

  return (
    <div key={member.id} className="flex flex-col items-center text-center">
      {member.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.image}
          alt={member.name}
          className="w-32 h-32 rounded-full object-cover mb-4 ring-4 ring-(--form-selection) shadow-sm"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-lime-50 ring-4 ring-(--form-selection) flex items-center justify-center mb-4 shadow-sm">
          <svg className="w-14 h-14 text-lime-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
      )}

      <h3 className="font-bold  text-lg leading-tight">{member.name}</h3>
      <p className="text-(--selected)! text-sm font-semibold mt-0.5 mb-3">{member.title}</p>

      {member.description && (
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{member.description}</p>
      )}

      {(member.phone || member.email) && (
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs ">
          {member.phone && (
            <a
              href={`tel:${member.phone.replace(/\D/g, '')}`}
              className="hover:text-(--selected) transition-colors"
            >
              {member.phone}
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="hover:text-(--selected) transition-colors"
            >
              {member.email}
            </a>
          )}
        </div>
      )}
    </div>
  )
}