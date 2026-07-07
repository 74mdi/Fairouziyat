"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

const section = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="api-code-block">
      <code>{code}</code>
    </pre>
  );
}

export default function AboutPage() {
  const base = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  return (
    <div className="page">
      <PageHeader crumbs={[{ label: "الرئيسية", href: "/" }, { label: "عن الموقع والـ API" }]} />

      <motion.div variants={container} initial="hidden" animate="show">

        {/* Hero */}
        <motion.div variants={section} className="about-hero">
          <h1 className="about-title">فيروزيّات</h1>
          <p className="about-lead">
            أرشيف مفتوح لكلمات أغاني السيدة فيروز — للباحثين والمطوّرين وعشّاق الموسيقى اللبنانية
          </p>
        </motion.div>

        {/* Credit */}
        <motion.section variants={section} className="about-section">
          <h2 className="about-heading">مصدر البيانات</h2>
          <p>
            جميع البيانات الواردة في هذا الموقع — من كلمات وأسماء الملحّنين والشعراء ومعلومات الألبومات — مُجمَّعة من موقع{" "}
            <a href="https://www.fairouziyat.com" target="_blank" rel="noopener noreferrer" className="about-link">
              fairouziyat.com
            </a>{" "}
            تقديراً لجهود القائمين عليه في توثيق التراث الموسيقي اللبناني.
          </p>
          <p style={{ marginTop: 12 }}>
            هذا الموقع لأغراض تعليمية وبحثية غير تجارية. جميع الحقوق الأدبية محفوظة لأصحابها.
          </p>
        </motion.section>

        {/* API */}
        <motion.section variants={section} className="about-section">
          <h2 className="about-heading">واجهة برمجية مفتوحة (API)</h2>
          <p>
            يمكن لأي مطوّر استخدام هذه الواجهة البرمجية مجانًا في مشاريعه الشخصية أو البحثية.
            جميع الردود بصيغة <strong>JSON</strong>.
          </p>

          <div className="api-endpoints">

            <div className="api-endpoint">
              <div className="api-method-row">
                <span className="api-badge">GET</span>
                <code className="api-path">/api/albums</code>
              </div>
              <p className="api-desc">قائمة جميع الألبومات مع عدد الأغاني</p>
              <CodeBlock code={`GET ${base}/api/albums

// Response
[
  { "id": 1, "name": "أنا وسهرانة", "cover_local": null, "song_count": 15 },
  ...
]`} />
            </div>

            <div className="api-endpoint">
              <div className="api-method-row">
                <span className="api-badge">GET</span>
                <code className="api-path">/api/albums/[id]</code>
              </div>
              <p className="api-desc">تفاصيل ألبوم مع قائمة أغانيه</p>
              <CodeBlock code={`GET ${base}/api/albums/1

// Response
{
  "album": { "id": 1, "name": "أنا وسهرانة", ... },
  "songs": [
    { "id": 12, "title": "...", "track_number": 1, "maqam": "راست", ... },
    ...
  ]
}`} />
            </div>

            <div className="api-endpoint">
              <div className="api-method-row">
                <span className="api-badge">GET</span>
                <code className="api-path">/api/songs/[id]</code>
              </div>
              <p className="api-desc">تفاصيل أغنية واحدة مع الكلمات والتنقّل للسابق والتالي</p>
              <CodeBlock code={`GET ${base}/api/songs/42

// Response
{
  "id": 42,
  "title": "يا ريت",
  "album_name": "أنا وسهرانة",
  "lyrics": "...",
  "lyricist": "...",
  "composer": "...",
  "maqam": "...",
  "prev_id": 41,
  "next_id": 43
}`} />
            </div>

            <div className="api-endpoint">
              <div className="api-method-row">
                <span className="api-badge">GET</span>
                <code className="api-path">/api/search?q=كلمة</code>
              </div>
              <p className="api-desc">بحث نصي في العناوين والكلمات وأسماء الملحّنين والشعراء</p>
              <CodeBlock code={`GET ${base}/api/search?q=بيروت

// Response
{
  "songs": [ { "id": 7, "title": "...", "album_name": "...", ... } ],
  "albums": [ ... ]
}`} />
            </div>

            <div className="api-endpoint">
              <div className="api-method-row">
                <span className="api-badge">GET</span>
                <code className="api-path">/api/stats</code>
              </div>
              <p className="api-desc">إحصاءات المكتبة الإجمالية</p>
              <CodeBlock code={`GET ${base}/api/stats

// Response
{
  "total_albums": 63,
  "total_songs": 856,
  "total_composers": 29,
  "total_maqamat": 18
}`} />
            </div>

          </div>
        </motion.section>

        {/* License */}
        <motion.section variants={section} className="about-section about-license">
          <h2 className="about-heading">الترخيص</h2>
          <p>
            الكود المصدري لهذا الموقع متاح للاستخدام الحر. البيانات تُنسب إلى مصدرها{" "}
            <a href="https://www.fairouziyat.com" target="_blank" rel="noopener noreferrer" className="about-link">fairouziyat.com</a>.
          </p>
        </motion.section>

      </motion.div>
    </div>
  );
}
