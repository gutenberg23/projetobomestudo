
import React from "react";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { BlogList } from "@/components/blog/BlogList";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";

const Blog = () => {
  // Filtrar apenas posts da categoria 'blog'
  const blogPosts = MOCK_BLOG_POSTS.filter(post => post.category === 'blog');
  
  return (
    <BlogLayout>
      <BlogHeader />
      <BlogList posts={blogPosts} postsPerPage={10} />
    </BlogLayout>
  );
};

export default Blog;
