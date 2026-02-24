export default function AnswerCapsule({ children }) {
  return (
    <div className="border-l-4 border-[#3b82f6] bg-[#3b82f6]/5 rounded-r-lg px-5 py-4 my-6">
      <p className="text-gray-200 leading-relaxed text-[1.05rem] font-medium m-0">
        {children}
      </p>
    </div>
  );
}
