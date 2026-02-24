import Breadcrumbs from "./Breadcrumbs";
import { Calendar, Clock, User } from "lucide-react";

export default function BlogHero({ metadata }) {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: metadata.title },
  ];

  return (
    <header className="pt-28 pb-12 border-b border-[#1f1f1f]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
          {metadata.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <User size={15} />
            {metadata.author.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={15} />
            {new Date(metadata.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={15} />
            {metadata.readingTime} read
          </span>
        </div>
      </div>
    </header>
  );
}
