// Path: /app/components
// File: CategoryBanner.tsx
// Version: 1.0.0

type CategoryBannerProps = {
  title: string;
  description: string;
  image: string;
  href: string;
  bgColor?: string;
};

export default function CategoryBanner({
  title,
  description,
  image,
  href,
  bgColor = "bg-gray-50",
}: CategoryBannerProps) {
  return (
    <a
      href={href}
      className={`flex flex-col md:flex-row items-center gap-6 rounded-xl p-6 hover:shadow-md transition ${bgColor}`}
    >
      <img
        src={image}
        alt={title}
        className="w-full md:w-48 h-32 object-cover rounded-lg"
      />
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </a>
  );
}