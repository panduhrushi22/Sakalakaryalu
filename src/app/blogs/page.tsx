import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

export const revalidate = 0; // Fresh database fetches always

export default async function BlogsPage() {
  const blogs = await prisma.blog.findMany({
    orderBy: { date: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="h-4 w-4" />
          <span>Spiritual Library</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-stone-850 leading-tight">
          ఆధ్యాత్మిక విజ్ఞాన వేదిక
        </h1>
        <p className="font-lora text-stone-600 text-sm sm:text-base leading-relaxed">
          Deep dive into the scientific and traditional explanations behind everyday Hindu rituals, habits, and lifestyles.
        </p>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="h-48 relative bg-stone-100">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center text-[10px] text-stone-400 font-outfit space-x-2">
                  <span>{blog.date}</span>
                  <span>•</span>
                  <span>{blog.readTime}</span>
                </div>
                
                <h3 className="font-cinzel text-lg font-bold text-stone-800 leading-snug hover:text-amber-600 transition-colors line-clamp-2">
                  <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                </h3>
                
                <p className="text-xs text-stone-500 font-lora line-clamp-3 leading-relaxed">
                  {blog.summary}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-stone-50">
              <Link
                href={`/blogs/${blog.slug}`}
                className="inline-flex items-center text-xs font-bold text-amber-700 hover:text-amber-600 font-outfit tracking-wide group pt-3"
              >
                <span>Read Full Explanation</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
