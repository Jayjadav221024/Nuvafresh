import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ChevronRight } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import API from '../api/axiosInstance';

const DEFAULT_TAGS = [
  'All articles', 'a2 cow ghee', 'amla', 'avocado', 'Ayurvedic medicine', 'bad food combination',
  'Benefits of amla', 'chemical free', 'cinnamon powder', 'Citrus fruits', 'curd', 'eat smart',
  'finger millet', 'finger millet benefits', 'Food', 'fresh turmeric', 'golden turmeric', 'haldi',
  'Health', 'health benefits of ragi', 'indian population', 'khapli wheat', 'Lakadong turmeric',
  'Nuva', 'nuva ghee', 'nuva the nuva', 'ozone wash fruits', 'ozone wash vegetable', 'ragi',
  'ragi benefits', 'ragi finger millet', 'ragi millet recipes', 'ragi roti benefits', 'Recipe', 'tea',
  'the nuva', 'the nuva cinnamon', 'the nuva haldi', 'the nuva ragi', 'the nuva turmeric',
  'the nuvanuva nutrition', 'weight loss', 'weight loss sustainability', 'what is ragi'
];

const DEFAULT_BLOG_ARTICLES = [
  {
    id: 'ghee-7-checks',
    title: 'How to Identify Pure Cow Ghee: 7 Things to Check',
    category: 'Food & Health',
    author: 'Nuva Nutrition',
    date: 'Aug 19 2026',
    excerpt: "My dadi used to say a house without ghee in the dabba is not really running a kitchen at all. Growing up we'd get one spoon on hot dal...",
    bannerLabel: 'HOW TO IDENTIFY PURE COW GHEE: 7 THINGS TO CHECK',
    tags: ['#a2 cow ghee', '#Nuva', '#nuva ghee'],
    images: {
      left: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500&auto=format&fit=crop&q=80',
      right: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'avocado-weight-management',
    title: 'Avocado for Weight Management: What You Should Know',
    category: 'Food & Health',
    author: 'Nuva Nutrition',
    date: 'Aug 10 2026',
    excerpt: 'When consumed in moderate amounts, avocado can be a great choice for a person trying to lose weight. The presence of good fat...',
    bannerLabel: 'AVOCADO FOR WEIGHT MANAGEMENT: WHAT YOU SHOULD KNOW',
    tags: ['#avocado', '#Nuva', '#weight loss'],
    images: {
      left: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80',
      right: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'benefits-of-black-rice',
    title: '10 Science-Backed Health Benefits of Black Rice',
    category: 'Food & Health',
    author: 'Nuva Nutrition',
    date: 'Jul 30 2026',
    excerpt: 'Black rice is not just an eye-catching version of plain white rice; it is also highly nutritious. This rice has its distinctive black color due to...',
    bannerLabel: '10 SCIENCE-BACKED HEALTH BENEFITS OF BLACK RICE',
    tags: ['#chemical free', '#Nuva', '#Food'],
    images: {
      left: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      right: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80'
    }
  }
];

const BlogPage = () => {
  const { getContent } = useContent();
  const blogTitle = getContent('blog.hero', 'title', 'Food & Health Insights');
  const blogSubtitle = getContent('blog.hero', 'subtitle', 'Deep dives on ozone washing science, Vedic A2 ghee traditions, stone-ground ancient grains, and clean eating tips.');

  const [articles, setArticles] = useState(DEFAULT_BLOG_ARTICLES);
  const [selectedTag, setSelectedTag] = useState('All articles');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchArticles = async () => {
      try {
        const { data } = await API.get('/blogs');
        if (data.success && data.blogs && data.blogs.length > 0) {
          const formatted = data.blogs.map((b, idx) => ({
            id: b.slug || b._id || b.id || idx,
            title: b.title,
            category: b.category,
            author: b.author || 'Nuva Nutrition',
            date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 2026',
            excerpt: b.excerpt,
            bannerLabel: b.title.toUpperCase(),
            tags: b.tags?.map(t => t.startsWith('#') ? t : `#${t}`) || ['#Nuva', '#HealthyLiving'],
            images: {
              left: b.images?.left || b.bannerImage || DEFAULT_BLOG_ARTICLES[idx % DEFAULT_BLOG_ARTICLES.length].images.left,
              right: b.images?.right || b.bannerImage || DEFAULT_BLOG_ARTICLES[idx % DEFAULT_BLOG_ARTICLES.length].images.right
            }
          }));
          setArticles(formatted);
        }
      } catch (e) {}
    };
    fetchArticles();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fallbackArticles = [
    {
      id: 'ghee-7-checks',
      title: getContent('blog.hero', 'art1_title', DEFAULT_BLOG_ARTICLES[0].title),
      category: 'Food & Health',
      author: 'Nuva Nutrition',
      date: 'Aug 19 2026',
      excerpt: getContent('blog.hero', 'art1_excerpt', DEFAULT_BLOG_ARTICLES[0].excerpt),
      bannerLabel: getContent('blog.hero', 'art1_banner', DEFAULT_BLOG_ARTICLES[0].bannerLabel),
      tags: ['#a2 cow ghee', '#Nuva', '#nuva ghee'],
      images: {
        left: getContent('blog.hero', 'art1_left_img', DEFAULT_BLOG_ARTICLES[0].images.left),
        right: getContent('blog.hero', 'art1_right_img', DEFAULT_BLOG_ARTICLES[0].images.right)
      }
    },
    {
      id: 'avocado-weight-management',
      title: getContent('blog.hero', 'art2_title', DEFAULT_BLOG_ARTICLES[1].title),
      category: 'Food & Health',
      author: 'Nuva Nutrition',
      date: 'Aug 10 2026',
      excerpt: getContent('blog.hero', 'art2_excerpt', DEFAULT_BLOG_ARTICLES[1].excerpt),
      bannerLabel: getContent('blog.hero', 'art2_banner', DEFAULT_BLOG_ARTICLES[1].bannerLabel),
      tags: ['#avocado', '#Nuva', '#weight loss'],
      images: {
        left: getContent('blog.hero', 'art2_left_img', DEFAULT_BLOG_ARTICLES[1].images.left),
        right: getContent('blog.hero', 'art2_right_img', DEFAULT_BLOG_ARTICLES[1].images.right)
      }
    },
    {
      id: 'benefits-of-black-rice',
      title: getContent('blog.hero', 'art3_title', DEFAULT_BLOG_ARTICLES[2].title),
      category: 'Food & Health',
      author: 'Nuva Nutrition',
      date: 'Jul 30 2026',
      excerpt: getContent('blog.hero', 'art3_excerpt', DEFAULT_BLOG_ARTICLES[2].excerpt),
      bannerLabel: getContent('blog.hero', 'art3_banner', DEFAULT_BLOG_ARTICLES[2].bannerLabel),
      tags: ['#chemical free', '#Nuva', '#Food'],
      images: {
        left: getContent('blog.hero', 'art3_left_img', DEFAULT_BLOG_ARTICLES[2].images.left),
        right: getContent('blog.hero', 'art3_right_img', DEFAULT_BLOG_ARTICLES[2].images.right)
      }
    }
  ];

  const displayArticles = (articles && articles.length > 0 && articles !== DEFAULT_BLOG_ARTICLES)
    ? articles
    : fallbackArticles;

  const filteredArticles = selectedTag === 'All articles'
    ? displayArticles
    : displayArticles.filter(article =>
        article.tags.some(tag => tag.toLowerCase().includes(selectedTag.toLowerCase())) ||
        article.category.toLowerCase().includes(selectedTag.toLowerCase())
      );

  const rawTags = getContent('blog.hero', 'tags', '');
  const activeTags = rawTags && rawTags.trim() !== ''
    ? rawTags.split(',').map(t => t.trim()).filter(Boolean)
    : DEFAULT_TAGS;

  return (
    <div className="bg-white font-sans text-neutral-900 pb-20">
      
      {/* 1. Header Bar: Food & Health */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2d472c] font-display tracking-tight">
          {blogTitle}
        </h1>
      </div>

      {/* Breadcrumb row */}
      <div className="bg-[#f7f6f2] py-2.5 px-4 sm:px-6 lg:px-8 border-y border-neutral-200/80 mb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-neutral-600">
          <Link to="/" className="hover:text-[#2d472c] transition-colors">Home</Link>
          <span>—</span>
          <span className="text-neutral-900 font-medium">{blogTitle}</span>
        </div>
      </div>

      {/* 2. Tag Filter Cloud matching screenshot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap gap-2 items-center">
          {activeTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-[#f1eee7] text-neutral-800 hover:bg-[#e4dec2] hover:text-black'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 3-Card Split-Image Article Grid matching screenshot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="flex flex-col group cursor-pointer"
            >
              {/* Dual-Split Image Photo Collage */}
              <div className="relative rounded-t-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <div className="grid grid-cols-2 gap-1 h-56 sm:h-64">
                  <div className="overflow-hidden">
                    <img
                      src={article.images.left}
                      alt={`${article.title} left preview`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <img
                      src={article.images.right}
                      alt={`${article.title} right preview`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Beige Card Banner Strip on bottom of image matching screenshot */}
                <div className="bg-[#e4dec2] px-4 py-2.5 border-t border-[#d4cbaf]">
                  <p className="text-[11px] sm:text-xs font-bold text-[#2d472c] uppercase tracking-wider line-clamp-1 font-display">
                    {article.bannerLabel}
                  </p>
                </div>
              </div>

              {/* Text Info Below Image */}
              <div className="pt-4 space-y-2 flex flex-col justify-between flex-grow">
                <div>
                  {/* Category */}
                  <p className="text-xs text-neutral-500 font-medium">
                    {article.category}
                  </p>

                  {/* Title */}
                  <h3 className="text-base sm:text-[17px] font-bold text-neutral-900 group-hover:text-[#2d472c] transition-colors leading-snug font-display pt-1">
                    {article.title}
                  </h3>

                  {/* Author & Date */}
                  <p className="text-xs text-neutral-500 pt-1">
                    <span className="font-semibold text-neutral-700">By {article.author}</span> On {article.date}
                  </p>

                  {/* Excerpt */}
                  <p className="text-xs text-neutral-600 leading-relaxed pt-2 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-[#f1eee7] text-[10px] text-neutral-700 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </article>
          ))}
        </div>
      </div>

      {/* Floating Scroll to Top Action Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 flex items-center justify-center shadow-lg border border-neutral-200 transition-transform active:scale-95"
        title="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 stroke-[2]" />
      </button>

    </div>
  );
};

export default BlogPage;
