export default function LoadingSpinner({ size = "md", color = "purple" }) {
  // Size mapping
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  // Color mapping (Tailwind classes)
  const colors = {
    purple: "border-purple-500",
    blue: "border-blue-500",
    red: "border-red-500",
    green: "border-green-500",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`
          ${sizes[size]}
          ${colors[color]}
          border-t-transparent
          rounded-full
          animate-spin
        `}
      />
    </div>
  );
}
