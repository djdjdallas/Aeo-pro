import { User } from "lucide-react";

export default function AuthorByline({ author }) {
  return (
    <div className="my-12 flex items-center gap-4 p-5 rounded-2xl border border-[#1f1f1f] bg-[#111111]">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] shrink-0">
        <User size={22} />
      </div>
      <div>
        <p className="font-semibold text-white">{author.name}</p>
        <p className="text-sm text-gray-500">{author.role}</p>
      </div>
    </div>
  );
}
