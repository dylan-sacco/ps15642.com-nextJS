import Link from "next/link";

const tagToSlug = (tag) =>
  tag
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function TagsLinked({ tags, invert, selected }) {
  console.log(invert)
  return (
    <div className="flex flex-wrap gap-[7px]">
      {tags.map((tag) => (
        <TagSquare tag={tag} key={tag} invert={invert} selected={selected} />
      ))}
    </div>
  );
}

export function TagSquare({ tag, invert, selected}) {
  const slug = tagToSlug(tag);
  return (
    <Link
      href={`/blog/tag/${slug}`}
      className={
        "text-[10px] font-semibold tracking-widest uppercase  bg-lime-400/10 border border-lime-400/30 px-[9px] py-[3px] rounded-sm no-underline transition-colors duration-150  "
        + `${invert ? " text-lime-900 " : " text-lime-400 "}`
        + `${
          slug === selected 
            ? " bg-lime-600 text-white border-lime-600 "
            : " bg-lime-50  border-lime-200 hover:bg-lime-400/20 "
        }`
      }
    >
      {tag}
    </Link>
  );
}
