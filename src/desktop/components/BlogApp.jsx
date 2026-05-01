import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useStudioContent } from "../hooks/useStudioContent";
import "./BlogApp.css";

const NARROW_WIDTH = 520;

const formatDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Render lightweight inline markup: **bold** and `code`. Plain-text otherwise.
// No HTML strings, no dangerouslySetInnerHTML — every output is a React element.
const INLINE_RE = /(\*\*[^*]+\*\*|`[^`]+`)/g;

const renderInline = (text) =>
  text.split(INLINE_RE).map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return <strong key={i}>{seg.slice(2, -2)}</strong>;
    }
    if (seg.startsWith("`") && seg.endsWith("`")) {
      return <code key={i}>{seg.slice(1, -1)}</code>;
    }
    return <Fragment key={i}>{seg}</Fragment>;
  });

const renderBlock = (block, idx) => {
  switch (block.type) {
    case "heading": {
      const level = Math.min(Math.max(block.level || 3, 2), 4);
      const Tag = `h${level}`;
      return <Tag key={idx}>{renderInline(block.text || "")}</Tag>;
    }
    case "list":
      return (
        <ul key={idx}>
          {(block.items || []).map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "paragraph":
    default:
      return <p key={idx}>{renderInline(block.text || "")}</p>;
  }
};

const BlogApp = () => {
  const blogPosts = useStudioContent("blogPosts");
  const sortedPosts = useMemo(
    () => [...(blogPosts || [])].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [blogPosts]
  );
  const rootRef = useRef(null);
  const [activeId, setActiveId] = useState(sortedPosts[0]?.id || null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!rootRef.current || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width || 0;
      setIsNarrow(width < NARROW_WIDTH);
    });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  const active = sortedPosts.find((p) => p.id === activeId) || sortedPosts[0];

  const handleSelect = (id) => {
    setActiveId(id);
    if (isNarrow) setShowDetail(true);
  };

  const handleKeyOnList = (e) => {
    if (!sortedPosts.length) return;
    const idx = sortedPosts.findIndex((p) => p.id === activeId);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = sortedPosts[Math.min(idx + 1, sortedPosts.length - 1)];
      setActiveId(next.id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = sortedPosts[Math.max(idx - 1, 0)];
      setActiveId(prev.id);
    } else if (e.key === "Enter" && isNarrow) {
      setShowDetail(true);
    }
  };

  if (!sortedPosts.length) {
    return (
      <div className="blog-app blog-empty">
        <div className="blog-empty-card">
          <h3>Nothing here yet</h3>
          <p>The notebook is open. New entries will land here.</p>
        </div>
      </div>
    );
  }

  const showList = !isNarrow || !showDetail;
  const showActive = !isNarrow || showDetail;

  return (
    <div
      ref={rootRef}
      className={`blog-app ${isNarrow ? "narrow" : ""} ${showDetail ? "show-detail" : ""}`}
    >
      {showList && (
        <aside className="blog-list" onKeyDown={handleKeyOnList} tabIndex={0} aria-label="Blog posts">
          <div className="blog-list-header">Posts</div>
          <ul className="blog-list-items">
            {sortedPosts.map((post) => {
              const selected = post.id === active?.id;
              return (
                <li key={post.id}>
                  <button
                    type="button"
                    className={`blog-list-item ${selected ? "selected" : ""}`}
                    onClick={() => handleSelect(post.id)}
                    aria-current={selected ? "true" : undefined}
                  >
                    <div className="blog-list-title">{post.title}</div>
                    <div className="blog-list-date">{formatDate(post.date)}</div>
                    <div className="blog-list-excerpt">{post.excerpt}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      {showActive && active && (
        <article className="blog-detail">
          {isNarrow && (
            <button
              type="button"
              className="blog-back"
              onClick={() => setShowDetail(false)}
              aria-label="Back to posts"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Posts
            </button>
          )}
          <header className="blog-detail-header">
            <h1 className="blog-detail-title">{active.title}</h1>
            <div className="blog-detail-meta">
              <time dateTime={active.date}>{formatDate(active.date)}</time>
              {active.readingMinutes ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{active.readingMinutes} min read</span>
                </>
              ) : null}
            </div>
            {active.tags?.length ? (
              <div className="blog-detail-tags">
                {active.tags.map((tag) => (
                  <span key={tag} className="blog-detail-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </header>
          <div className="blog-detail-body">
            {(active.content || []).map((block, idx) => renderBlock(block, idx))}
          </div>
        </article>
      )}
    </div>
  );
};

export default BlogApp;
