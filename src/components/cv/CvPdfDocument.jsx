import { Document, Link, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 48,
    paddingHorizontal: 46,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.4,
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  role: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f766e",
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 8.5,
    color: "#374151",
    marginBottom: 2,
  },
  linkText: {
    fontSize: 8.5,
    color: "#0d9488",
    marginTop: 2,
    marginBottom: 2,
    textDecoration: "none",
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 6,
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 3,
  },
  paragraph: {
    marginBottom: 6,
    textAlign: "justify",
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingRight: 8,
  },
  bullet: {
    width: 12,
    fontFamily: "Helvetica-Bold",
  },
  bulletText: {
    flex: 1,
  },
  skillGroup: {
    marginBottom: 5,
  },
  skillLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  skillItems: {
    fontSize: 8.5,
    color: "#374151",
  },
  jobTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginTop: 6,
  },
  jobMeta: {
    fontSize: 8.5,
    color: "#6b7280",
    marginBottom: 3,
  },
  projectTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    marginTop: 5,
  },
  projectDesc: {
    fontSize: 8.5,
    color: "#374151",
    marginBottom: 2,
  },
  projectTech: {
    fontSize: 8,
    color: "#0f766e",
    marginBottom: 1,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 46,
    right: 46,
    fontSize: 7.5,
    color: "#9ca3af",
    textAlign: "center",
  },
  brandText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0d9488",
    marginTop: 8,
    marginBottom: 4,
  },
});

function shortText(text, max = 160) {
  if (!text) return "";
  const t = String(text).trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3)}...`;
}

function normalizeCert(cert) {
  if (typeof cert === "string") {
    return { title: cert, organization: "", link: null };
  }
  return {
    title: cert?.title ?? "",
    organization: cert?.organization ?? "",
    link: cert?.link ?? null,
  };
}

/** Remote images often break PDF generation in the browser (CORS / fetch). Only allow safe http(s) links. */
function safeHttpUrl(url) {
  if (!url || typeof url !== "string") return null;
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  return null;
}

function getObjective(data) {
  return String(data.cv?.objective ?? data.about?.summary ?? "");
}

function getPdfFileName(data) {
  const name = data.cv?.pdfFileName;
  if (name && typeof name === "string") return name;
  const dev = (data.site?.developerName ?? "CV").replace(/\s+/g, "_");
  return `${dev}_CV.pdf`;
}

export { getPdfFileName };

export default function CvPdfDocument({ data }) {
  const objective = getObjective(data);
  const contactBits = [
    data.site?.location,
    data.site?.address,
    data.contact?.phone ? `Phone: ${data.contact.phone}` : "",
    data.contact?.email ? `Email: ${data.contact.email}` : "",
  ].filter(Boolean);

  const devName = String(data.site?.developerName ?? "");
  const role = String(data.site?.role ?? "");
  const email = String(data.contact?.email ?? "");

  return (
    <Document
      title={`${devName} — CV`}
      author={devName}
      subject="Curriculum Vitae"
      keywords="React, Next.js, Frontend, Full-Stack"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{devName}</Text>
        <Text style={styles.role}>{role}</Text>
        {contactBits.map((line) => (
          <Text key={line} style={styles.contactLine}>
            {line}
          </Text>
        ))}
        {(data.socialLinks ?? []).map((s) => {
          const href = safeHttpUrl(s.url);
          const label = `${s.label ?? "Link"}: ${s.url ?? ""}`;
          return href ? (
            <Link key={s.label ?? href} src={href}>
              <Text style={styles.linkText}>{label}</Text>
            </Link>
          ) : (
            <Text key={String(s.label)} style={styles.contactLine}>
              {label}
            </Text>
          );
        })}
        {data.site?.brand ? <Text style={styles.brandText}>{String(data.site.brand)}</Text> : null}

        <Text style={styles.sectionTitle}>Professional summary</Text>
        <Text style={styles.paragraph}>{objective}</Text>

        <Text style={styles.sectionTitle}>Core strengths</Text>
        {(data.about?.highlights ?? []).map((h) => (
          <View key={String(h)} style={styles.bulletRow} wrap={false}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{String(h)}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Technical skills</Text>
        {(data.skills ?? []).map((g) => (
          <View key={String(g.group)} style={styles.skillGroup} wrap={false}>
            <Text style={styles.skillLabel}>{String(g.group)}</Text>
            <Text style={styles.skillItems}>{(g.items ?? []).map(String).join(" · ")}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Professional experience</Text>
        {(data.experience ?? []).map((job) => (
          <View key={`${job.company}-${job.period}`} wrap={false}>
            <Text style={styles.jobTitle}>
              {String(job.role)} — {String(job.company)}
            </Text>
            <Text style={styles.jobMeta}>{String(job.period)}</Text>
            <Text style={styles.paragraph}>{String(job.impact ?? "")}</Text>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          {`${devName} · ${role} · ${email}`}
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Selected projects & products</Text>
        <Text style={[styles.paragraph, { fontSize: 8.5, color: "#4b5563" }]}>
          Representative work across enterprise ERP, aviation operations, banking, and personal
          products. Links included where publicly available.
        </Text>
        {(data.projects ?? []).map((p) => {
          const href = p.link && p.link !== "#" ? safeHttpUrl(p.link) : null;
          return (
            <View key={String(p.title)} wrap={false}>
              <Text style={styles.projectTitle}>{String(p.title)}</Text>
              <Text style={styles.projectDesc}>{shortText(p.description, 200)}</Text>
              <Text style={styles.projectTech}>{(p.tech ?? []).map(String).join(" · ")}</Text>
              {href ? (
                <Link src={href}>
                  <Text style={styles.linkText}>{href}</Text>
                </Link>
              ) : null}
            </View>
          );
        })}

        <Text style={styles.footer} fixed>
          {`${devName} — Page 2`}
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Education</Text>
        {(data.education ?? []).map((e) => (
          <View key={`${e.degree}-${e.institution}`} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={styles.jobTitle}>{String(e.degree)}</Text>
            <Text style={styles.jobMeta}>{String(e.institution)}</Text>
            <Text style={styles.skillItems}>{String(e.result)}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Certifications & training</Text>
        {(data.certifications ?? []).map((raw, i) => {
          const c = normalizeCert(raw);
          const line = c.organization ? `${c.title} (${c.organization})` : c.title;
          const href = safeHttpUrl(c.link);
          return (
            <View key={`cert-${i}`} style={styles.bulletRow} wrap={false}>
              <Text style={styles.bullet}>•</Text>
              <View style={{ flex: 1 }}>
                {href ? (
                  <Link src={href}>
                    <Text style={styles.linkText}>{line}</Text>
                  </Link>
                ) : (
                  <Text style={styles.bulletText}>{line}</Text>
                )}
              </View>
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Availability</Text>
        <Text style={styles.paragraph}>
          {String(data.site?.availability ?? "")} · {String(data.site?.yearsOfExperience ?? "")}{" "}
          experience
          {data.site?.brand ? ` · ${String(data.site.brand)}` : ""}
          {" · "}References available upon request.
        </Text>

        <Text style={styles.footer} fixed>
          {`${devName} — Page 3`}
        </Text>
      </Page>
    </Document>
  );
}
