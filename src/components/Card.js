export default function Card({ children }) {
  return (
    <div className="bg-[#1F1F23] border border-[#2CB67D]/20 rounded-2xl shadow-lg p-6 transition-all hover:border-[#2CB67D]">
      {children}
    </div>
  )
}
