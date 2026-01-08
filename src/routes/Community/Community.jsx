import React, { useMemo, useState } from "react";
import "./Community.css";

export default function Community() {
  const [query, setQuery] = useState("");

  const navLinks = useMemo(
    () => [
      { label: "Ui Timer", href: "#" },
      { label: "Menu", href: "#" },
      { label: "Meal planning", href: "#" },
      { label: "Account", href: "#" },
      { label: "Recipes", href: "#" },
      { label: "User", href: "#" },
      { label: "Scan Products", href: "#" },
      { label: "Log Out", href: "#" },
    ],
    []
  );

  const posts = useMemo(
    () => [
      {
        id: 1,
        title: "Accountability",
        body:
          "I'm Sarah, and I use Nutrihelp to track my meals and daily walks. Posting updates and seeing others' progress keeps me motivated.",
        date: "December 24th 2025",
        image:
          "https://images.unsplash.com/photo-1543339318-b43dc53e19b3?auto=format&fit=crop&w=1200&q=70",
      },
      {
        id: 2,
        title: "Going stroing",
        body:
          "I'm Michael, and I share weekly check-ins about my weight loss. The support I get here helps me stay accountable.",
        date: "May 20th 2025",
        image:
          "https://images.unsplash.com/photo-1541534401786-2077eed87a74?auto=format&fit=crop&w=1200&q=70",
      },
      {
        id: 3,
        title: "Tips and Tricks",
        body:
          "I'm Aisha, and I post simple recipes that help me eat healthier. It feels good knowing others find them useful.",
        date: "Jan 15th, 2025",
        image:
          "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?auto=format&fit=crop&w=1200&q=70",
      },
    ],
    []
  );

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
    );
  }, [query, posts]);

  return (
    <div className="cm-root">
      {/* Top nav */}
      <header className="cm-topbar">
        <div className="cm-brand">
          <div className="cm-logoMark" aria-hidden="true">
            <span className="cm-logoIcon">🌿</span>
          </div>
          <div className="cm-brandText">NutriHelp</div>
        </div>

        <nav className="cm-navlinks" aria-label="Primary navigation">
          {navLinks.map((l) => (
            <a key={l.label} className="cm-navlink" href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="cm-page">
        {/* Search row */}
        <div className="cm-searchRow">
          <div className="cm-search">
            <span className="cm-searchIcon" aria-hidden="true">
              ☰
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search community"
            />
            <span className="cm-searchIcon" aria-hidden="true">
              🔍
            </span>
          </div>
        </div>

        {/* Three stats */}
        <section className="cm-stats" aria-label="Community stats shortcuts">
          <div className="cm-stat">
            <div className="cm-statIcon" aria-hidden="true">
              👤
            </div>
            <div className="cm-statLabel">Members</div>
          </div>

          <div className="cm-stat">
            <div className="cm-statIcon" aria-hidden="true">
              👤
            </div>
            <div className="cm-statLabel">Posts</div>
          </div>

          <div className="cm-stat">
            <div className="cm-statIcon" aria-hidden="true">
              👤
            </div>
            <div className="cm-statLabel">Top Contributors</div>
          </div>
        </section>

        {/* Hero */}
        <section className="cm-hero">
          <div className="cm-heroCard">
            <div className="cm-heroText">
              <h2>Nutrihelp Community</h2>
              <p>
                The Nutrihelp community is built around people supporting each
                other on their health journeys. It gives a space to share their
                progress, post updates about their goals, and learn from others
                with similar experiences.
              </p>
              <a className="cm-readMore" href="#">
                Read more
              </a>
            </div>

            <div className="cm-heroImageWrap" aria-hidden="true">
              <img
                src="https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=1400&q=70"
                alt=""
              />
            </div>
          </div>
        </section>

        {/* Posts grid */}
        <section className="cm-grid" aria-label="Community posts">
          {filteredPosts.map((p) => (
            <article key={p.id} className="cm-card">
              <div className="cm-cardImage">
                <img src={p.image} alt="" />
              </div>

              <div className="cm-cardBody">
                <h3>{p.title}</h3>
                <p>{p.body}</p>

                <div className="cm-cardFooter">
                  <div className="cm-date">{p.date}</div>
                  <a className="cm-readMore" href="#">
                    Read more
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
