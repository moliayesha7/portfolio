import { Document, Link, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

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
    paddingBottom: 20,
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
  link: {
    color: "#0d9488",
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between", 
    alignItems: "flex-start",
    marginBottom: 20,
  },
  textContainer: {
    flexDirection: "column",
    flex: 1, 
  },
  image: {
    width: 80,
    height: 80,
    marginLeft: 20, 
  },
});

function shortText(text, max = 160) {
  if (!text) return "";
  const t = String(text).trim();
  if (t?.length <= max) return t;
  return `${t?.slice(0, max - 3)}...`;
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

function getObjective(data) {
  return data.cv?.objective ?? data.about?.summary ?? "";
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
    `Phone: ${data.contact?.phone ?? ""}`,
    `Email: ${data.contact?.email ?? ""}`

  ].filter(Boolean);

  return (
    <Document
      title={`${data.site?.developerName ?? ""} — CV`}
      author={data.site?.developerName}
      subject="Curriculum Vitae"
      keywords="Node.js, React, Next.js, Frontend, Full-Stack"
    >
      <Page size="A4" style={styles?.page}>
        {/* Image and Text side by side */}
        <View style={styles?.headerContainer}>
          <View style={styles?.textContainer}>
            <Text style={styles?.name}>{data.site?.developerName}</Text>
            <Text style={styles?.role}>{data.site?.role}</Text>
            {contactBits?.map((line) => (
              <Text key={line} style={styles.contactLine}>
                {line}
              </Text>
            ))}
            {(data?.socialLinks ?? []).map((s) => (
              <View key={s?.label} style={{ flexDirection: 'row', marginBottom: 2 }}>
                {/* Label with black color */}
                <Text style={{ color: '#374151' }}>{`${s.label}: `}</Text>
                {/* URL with default link color */}
                <Link src={s?.url} style={styles.link}>
                  {s?.url}
                </Link>
              </View>
            ))}
          </View>
          <Image src="/head.png" style={styles.image} />
        </View>

        <Text style={styles.sectionTitle}>Professional summary</Text>
        <Text style={styles.paragraph}>{objective}</Text>

        <Text style={styles.sectionTitle}>Core strengths</Text>
        {(data.about?.highlights ?? []).map((h) => (
          <View key={h} style={styles.bulletRow} wrap={false}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{h}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Technical skills</Text>
        {(data?.skills ?? []).map((g) => (
          <View key={g?.group} style={styles.skillGroup} wrap={false}>
            <Text style={styles.skillLabel}>{g?.group}</Text>
            <Text style={styles.skillItems}>{(g?.items ?? []).join(" · ")}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Professional experience</Text>
        {(data?.experience ?? []).map((job) => (
          <View key={`${job?.company}-${job?.period}`} wrap={false}>
            <Text style={styles.jobTitle}>
              {job?.role} — {job?.company}
            </Text>
            <Text style={styles.jobMeta}>{job?.period}</Text>
            <Text style={styles.paragraph}>{job?.impact}</Text>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          {`${data?.site?.developerName ?? ""} · ${data?.site?.role ?? ""} · ${data?.contact?.email ?? ""}`}
        </Text>
      </Page>

      {/* Other pages can follow the same structure */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Selected projects & products</Text>
        <Text style={[styles.paragraph, { fontSize: 8.5, color: "#4b5563" }]}>
          Representative work across enterprise ERP, aviation operations, banking, and personal
          products. Links included where publicly available.
        </Text>
        {(data?.projects ?? []).map((p) => (
          <View key={p?.title} wrap={false}>
            <Text style={styles.projectTitle}>{p?.title}</Text>
            <Text style={styles.projectDesc}>{shortText(p?.description, 200)}</Text>
            <Text style={styles.projectTech}>{(p?.tech ?? []).join(" · ")}</Text>
            {p?.link && p?.link !== "#" ? (
              <Link src={p?.link} style={[styles.contactLine, styles.link]}>
                {p?.link}
              </Link>
            ) : null}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          {`${data?.site?.developerName ?? ""} — Page 2`}
        </Text>

        {/* Education section immediately follows */}
        <Text style={styles.sectionTitle}>Education</Text>
        {(data?.education ?? []).map((e) => (
          <View key={`${e?.degree}-${e?.institution}`} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={styles.jobTitle}>{e?.degree}</Text>
            <Text style={styles.jobMeta}>{e?.institution}</Text>
            <Text style={styles.skillItems}>{e?.result}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Certifications & training</Text>
        {(data?.certifications ?? []).map((raw, i) => {
          const c = normalizeCert(raw);
          const line = c?.organization ? `${c?.title} (${c?.organization})` : c?.title;
          return (
            <View key={`${c?.title}-${i}`} style={styles.bulletRow} wrap={false}>
              <Text style={styles.bullet}>•</Text>
              {c?.link ? (
                <Link src={c?.link} style={[styles.bulletText, styles.link]}>
                  {line}
                </Link>
              ) : (
                <Text style={styles.bulletText}>{line}</Text>
              )}
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Availability</Text>
        <Text style={styles.paragraph}>
          {data?.site?.availability ?? ""} · {data?.site?.yearsOfExperience ?? ""} experience ·{" "}
          {data?.site?.brand ? `${data?.site?.brand} · ` : ""}
          References available upon request.
        </Text>

        <Text style={styles.footer} fixed>
          {`${data?.site?.developerName ?? ""} — Page 3`}
        </Text>
      </Page>
    </Document>
  );
}