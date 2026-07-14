import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';

export const revalidate = 0; // Fresh database fetches always

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await prisma.blog.findUnique({
    where: { slug: params.slug },
  });

  if (!blog) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center space-x-2 text-xs text-stone-400 font-outfit uppercase tracking-wider">
        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blogs" className="hover:text-amber-600 transition-colors">Blogs</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-stone-700 font-semibold truncate max-w-[200px]">{blog.title}</span>
      </div>

      {/* Blog Article Header */}
      <div className="space-y-4">
        <h1 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-880 leading-tight">
          {blog.title}
        </h1>
        
        <div className="flex items-center text-xs text-stone-400 font-outfit space-x-3 border-b border-stone-100 pb-4">
          <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded font-semibold text-[10px] uppercase">
            Spiritual Science
          </span>
          <span>{blog.date}</span>
          <span>•</span>
          <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" />{blog.readTime}</span>
        </div>
      </div>

      {/* Main Image */}
      <div className="h-64 sm:h-[400px] rounded-3xl overflow-hidden shadow-lg bg-stone-100 border border-stone-200">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Detailed Body Paragraphs */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 font-lora text-stone-700 text-xs sm:text-sm md:text-base leading-relaxed tracking-wide">
        {blog.content.split('\n\n').map((paragraph, index) => {
          if (!paragraph.trim()) return null;
          return (
            <p key={index} className="indent-4 sm:indent-8">
              {paragraph.trim()}
            </p>
          );
        })}
      </div>

      {/* Read more footer CTA */}
      <div className="text-center pt-4">
        <Link
          href="/blogs"
          className="inline-flex items-center bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 font-outfit font-bold text-xs tracking-wider px-6 py-3 rounded-full shadow-sm hover:scale-105 transition-all"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          <span>Return to Spiritual Library</span>
        </Link>
      </div>
    </div>
  );
}
