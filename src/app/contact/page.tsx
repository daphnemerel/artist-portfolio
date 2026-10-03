import type { Metadata } from "next";
import { PageTitle } from "@/components/type/PageTitle";
import { Label } from "@/components/type/Label";
import { getSite } from "@/lib/content";
import styles from "./contact.module.css";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const site = getSite();
  const hasDetails = site.email || site.instagram || site.representation.length > 0;

  return (
    <div className="container">
      <PageTitle>Contact</PageTitle>
      <div className={styles.contact}>
        {!hasDetails && <p className={styles.muted}>Contact details to be added.</p>}

        {site.email && (
          <section>
            <Label as="h2">Email</Label>
            <p>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </section>
        )}

        {site.instagram && (
          <section>
            <Label as="h2">Instagram</Label>
            <p>
              <a href={`https://instagram.com/${site.instagram}`} rel="noopener noreferrer">
                @{site.instagram}
              </a>
            </p>
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

        {site.location && <p className={styles.muted}>{site.location}</p>}
      </div>
    </div>
  );
}
