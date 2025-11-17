// client/src/pages/Post.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { API_URL, FRONTEND_URL } from "../config";

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/blogs/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        if (data && data._id) {
          fetch(`${API_URL}/api/blogs/related/${data._id}`)
            .then((r) => r.json())
            .then(setRelated)
            .catch((err) => console.error("related fetch err", err));
        }
      })
      .catch((err) => console.error(err));
  }, [slug]);

  if (!post) return <main className="pt-24 text-center">Loading...</main>;

  const fullUrl = `${FRONTEND_URL}/#/blog/${post.slug}`;

  return (
    <main className="pt-28 max-w-4xl mx-auto px-6">
     <Helmet>
  <title>{String(post.title || "")} | SurpriseVista Blog</title>
  <meta name="description" content={String(post.excerpt || "")} />

  <link rel="canonical" href={fullUrl} />

  <meta property="og:title" content={String(post.title || "")} />
  <meta property="og:description" content={String(post.excerpt || "")} />
  <meta property="og:image" content={`${API_URL}${post.coverImage}`} />
  <meta property="og:url" content={fullUrl} />
  <meta property="og:type" content="article" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={String(post.title || "")} />
  <meta name="twitter:description" content={String(post.excerpt || "")} />
  <meta name="twitter:image" content={`${API_URL}${post.coverImage}`} />

  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: String(post.title || ""),
      image: `${API_URL}${post.coverImage}`,
      description: String(post.excerpt || ""),
      datePublished: post.publishedAt,
      author: {
        "@type": "Person",
        name: post.author || "SurpriseVista",
      },
      mainEntityOfPage: fullUrl,
    })}
  </script>
</Helmet>


      <img src={`${API_URL}${post.coverImage}`} alt={post.title} className="w-full h-80 object-cover rounded shadow mb-6" />

      <h1 className="text-4xl font-bold text-sv-purple">{post.title}</h1>
      <p className="text-gray-500 mt-2 mb-8">{new Date(post.publishedAt).toLocaleDateString()} • {post.author}</p>

      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

      <div className="mt-10">
        <Link to="/blog" className="text-sv-orange">← Back to Blog</Link>
      </div>

      {/* Related posts */}
      {related && related.length > 0 && (
        <section className="mt-12">
          <h3 className="text-2xl font-semibold mb-4">Related posts</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {related.map((r) => (
              <Link key={r._id} to={`/blog/${r.slug}`} className="block bg-white rounded shadow p-4 hover:shadow-lg">
                <img src={`${API_URL}${r.coverImage}`} className="h-36 w-full object-cover rounded mb-3" alt={r.title} />
                <div className="font-semibold text-sv-purple">{r.title}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(r.publishedAt).toLocaleDateString()}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
