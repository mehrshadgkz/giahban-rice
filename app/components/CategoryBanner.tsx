// A reusable large banner block for showcasing a product category.
// Used three times on the homepage: rice, rice-based products, and local goods.

type CategoryBannerProps = {
  title: string;
  description: string;
  image: string;
  href: string;
  bgColor?: string; // optional background tint, matches your amber/sage tones
};

export default function CategoryBanner({
  title,
  description,
  image,
  href,
  bgColor = "bg-white",
}: CategoryBannerProps) {
  return (
    <div className={`${bgColor} rounded-2xl overflow-hidden`}>
      <div className="relative">
        <img src={image} alt={title} className="w-full h-64 md:h-80 object-cover" />
      </div>

      <div className="p-6 md:p-8 text-center md:text-right">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-5">{description}</p>
        <a
          href={href}
          className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 transition text-white text-sm font-medium px-6 py-2.5 rounded-lg"
        >
          خرید کنید
        </a>
      </div>
    </div>
  );
}