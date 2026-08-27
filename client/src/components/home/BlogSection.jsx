import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';
import API from '../../api/axiosInstance';

const DEFAULT_BLOG_POSTS = [
  {
    id: 1,
    title: 'Why Living Soil is the Foundation of True Nutrient Density',
    excerpt: 'Discover how regenerative soil microbiology transforms the vitamins, trace minerals, and flavor profiles of your everyday vegetables.',
    category: 'Regenerative Agriculture',
    readTime: '4 min read',
    date: 'Aug 18, 2026',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    slug: 'why-living-soil-matters'
  },
  {
    id: 2,
    title: 'The Science of Ozone (O₃) Wash: Removing 99.9% Surface Toxins',
    excerpt: 'How aqueous ozone micro-bubbles neutralize pesticide residues and pathogens without altering natural crunch or flavor.',
    category: 'Purity & Tech',
    readTime: '5 min read',
    date: 'Aug 12, 2026',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    slug: 'science-of-ozone-wash'
  },
  {
    id: 3,
    title: 'From Vedic Bilona to Modern Tables: The Real Truth About A2 Ghee',
    excerpt: 'Why traditional curd-churning of indigenous Gir cow milk creates gut-healing butyric acid and essential fat-soluble nutrients.',
    category: 'Ancient Wisdom',
    readTime: '6 min read',
    date: 'Aug 05, 2026',
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&auto=format&fit=crop&q=80',
    slug: 'vedic-bilona-a2-ghee'
  }
];

const BlogSection = () => {
  const [posts, setPosts] = useState(DEFAULT_BLOG_POSTS);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await API.get('/blogs?limit=3');
        if (data.success && data.blogs && data.blogs.length > 0) {
          setPosts(data.blogs.map((b, idx) => ({
            id: b._id || b.id || idx,
            title: b.title,
            excerpt: b.excerpt,
            category: b.category,
            readTime: '4 min read',
            date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 2026',
            image: b.bannerImage || DEFAULT_BLOG_POSTS[idx % DEFAULT_BLOG_POSTS.length].image,
            slug: b.slug || b.id
          })));
        }
      } catch (e) {}
    };
    fetchArticles();
  }, []);

  const { getContent } = useContent();
  const badgeText = getContent('home.blog', 'badgeText', 'Nuva Journal & Insights');
  const heading = getContent('home.blog', 'heading', 'Stories from Soil to Health');
  const subtitle = getContent('home.blog', 'subtitle', 'Deep dives into sustainable farming, ancient nutritional wisdom, and clean eating practices.');
  const linkText = getContent('home.blog', 'linkText', 'View All Articles');

  return (
    <section className="bg-[#fbfaf6] py-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/70 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7e3d8] text-[#2d472c] text-xs font-bold mb-3 animate-fade-in-up">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{badgeText}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2d472c] font-display tracking-tight hover:text-[#3d5e3c] transition-colors duration-300">
              {heading}
            </h2>
            <p className="text-secondary-700 text-sm sm:text-base mt-2 max-w-xl">
              {subtitle}
            </p>
          </div>

          <Link
            to="/blog"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-[#2d472c] hover:text-[#1e321d] group transition-colors"
          >
            <span>{linkText}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-[#2d472c] shadow-sm">
                  {post.category}
                </span>
              </div>

              {/* Content Box */}
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Meta info (Date + Read Time) */}
                  <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      {post.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-neutral-400" />
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#2d472c] transition-colors leading-snug font-display">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Read Article Link */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d472c] group-hover:underline">
                    Read Article
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogSection;
