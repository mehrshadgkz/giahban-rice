// Path: /app/components
// File: BlogPreview.tsx
// Version: 1.0.0
//
// Blog preview — shows 4 latest/popular posts on the homepage.
// For now this uses placeholder data; later this will pull from your real blog posts
// once the blog system exists (likely a simple database table of posts).

type BlogPost = {
  title: string;
  excerpt: string;
  image: string;
  href: string;
  date: string;
};

const posts: BlogPost[] = [
  {
    title: "راهنمای پخت برنج طارم هاشمی",
    excerpt: "برای بهترین تجربه عطر و طعم، این نکات را رعایت کنید...",
    image: "/blog-placeholder-1.jpg",
    href: "/blog/cooking-guide",
    date: "۱۴۰۵/۰۵/۱۰",
  },
  {
    title: "تفاوت برنج الک شده و الک نشده",
    excerpt: "کدام یک برای شما مناسب‌تر است؟ بررسی کامل تفاوت‌ها...",
    image: "/blog-placeholder-2.jpg",
    href: "/blog/sorted-vs-unsorted",
    date: "۱۴۰۵/۰۴/۲۲",
  },
  {
    title: "برداشت برنج در فریدونکنار ۱۴۰۵",
    excerpt: "گزارشی از فصل برداشت امسال و کیفیت محصول جدید...",
    image: "/blog-placeholder-3.jpg",
    href: "/blog/harvest-1405",
    date: "۱۴۰۵/۰۴/۰۵",
  },
  {
    title: "چگونه برنج اصیل را از تقلبی تشخیص دهیم",
    excerpt: "نکات مهمی که هنگام خرید برنج باید بدانید...",
    image: "/blog-placeholder-4.jpg",
    href: "/blog/authentic-rice-tips",
    date: "۱۴۰۵/۰۳/۱۸",
  },
];

export default function BlogPreview() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-center mb-8">از بلاگ گیاه‌بان</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {posts.map((post) => (
          <a
            key={post.href}
            href={post.href}
            className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-2">{post.date}</p>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-green-800 transition">
                {post.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}