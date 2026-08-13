/** High-quality visual placeholders for the Visual-First UI */

const COURSE_IMAGES: Record<string, string> = {
  course_001:
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
  course_002:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  course_003:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
};

const TALENT_IMAGES = [
  "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80",
  "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&q=80",
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80",
  "https://images.unsplash.com/photo-1626785774573-4b7993143456?w=1200&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
];

/** Curated cover photos for seed talent projects */
export const TALENT_COVERS: Record<string, string> = {
  talent_001:
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80",
  talent_002:
    "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&q=80",
  talent_003:
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
  talent_004:
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80",
  talent_005:
    "https://images.unsplash.com/photo-1626785774573-4b7993143456?w=1200&q=80",
  talent_006:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  talent_007:
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&q=80",
  talent_008:
    "https://images.unsplash.com/photo-1573164713986-89922e4a97a0?w=1200&q=80",
  talent_009:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
};

const STUDENT_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94cf00ffd549?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop&q=80",
];

export function courseImage(courseId: string, fallbackIndex = 0): string {
  return (
    COURSE_IMAGES[courseId] ??
    TALENT_IMAGES[fallbackIndex % TALENT_IMAGES.length]
  );
}

export function talentImage(talentId: string, index = 0): string {
  if (TALENT_COVERS[talentId]) return TALENT_COVERS[talentId];
  let hash = 0;
  for (let i = 0; i < talentId.length; i++) {
    hash = (hash + talentId.charCodeAt(i) * (i + 1)) % TALENT_IMAGES.length;
  }
  return TALENT_IMAGES[(hash + index) % TALENT_IMAGES.length];
}

export function studentAvatar(studentId: string): string {
  let hash = 0;
  for (let i = 0; i < studentId.length; i++) {
    hash = (hash + studentId.charCodeAt(i)) % STUDENT_AVATARS.length;
  }
  return STUDENT_AVATARS[hash];
}

export const SPECIALTY_VISUALS = [
  {
    id: "cs",
    title: "علوم الحاسوب",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
  },
  {
    id: "math",
    title: "الرياضيات",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  },
  {
    id: "econ",
    title: "الاقتصاد",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  },
  {
    id: "law",
    title: "القانون",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
  },
  {
    id: "science",
    title: "العلوم",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
  },
  {
    id: "arts",
    title: "الفنون",
    image:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
  },
] as const;

export const INTEREST_CHIPS = [
  "برمجة",
  "تصميم",
  "فن",
  "رياضيات",
  "علوم",
  "تصوير",
  "كتابة",
  "ابتكار",
] as const;

export const SUBJECT_CHIPS = [
  "إدارة الأعمال",
  "الإحصاء",
  "التسويق",
  "الإعلام الآلي",
  "الاتصال البصري",
  "المحاسبة",
  "الفنون التشكيلية",
  "ريادة الأعمال",
] as const;
