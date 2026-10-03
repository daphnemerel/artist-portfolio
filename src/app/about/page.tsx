import type { Metadata } from "next";
import { Label } from "@/components/type/Label";
import { Prose } from "@/components/type/Prose";
import { getSite } from "@/lib/content";
import { marked } from "marked";
import styles from "./about.module.css";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const site = getSite();
  const bio = marked.parse(site.bio, { async: false });

  return (
    <div className={`${styles.about} container`}>
      <div className={styles.bio}>
        <h1 className="visually-hidden">About</h1>
        <Prose html={bio} />
      </div>

      <aside className={styles.side}>
        {(site.email || site.instagram || site.location) && (
          <section>
            <Label as="h2">Contact</Label>
            {site.email && (
              <p>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            )}
            {site.instagram && (
              <p>
                <a href={`https://instagram.com/${site.instagram}`} rel="noopener noreferrer">
                  @{site.instagram}
                </a>
              </p>
            )}
            {site.location && <p className={styles.muted}>{site.location}</p>}
          </section>
        )}

        {site.representation.length > 0 && (
          <section>
            <Label as="h2">Representation</Label>
            {site.representation.map((gallery) => (
              <p key={gallery.name}>
                {gallery.url ? (
                  <a href={gallery.url} rel="noopener noreferrer">
                    {gallery.name}
                  </a>
                ) : (
                  gallery.name
                )}
                <span className={styles.muted}>, {gallery.city}</span>
              </p>
            ))}
          </section>
        )}

        {site.cv && (
          <section>
            <Label as="h2">CV</Label>
            <p>
              <a href={site.cv}>Download CV (PDF)</a>
            </p>
          </section>
        )}
      </aside>
    </div>
  );
}
