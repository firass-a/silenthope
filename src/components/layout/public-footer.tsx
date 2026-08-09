import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div className="space-y-3">
          <h2 className="text-lg font-bold">الأمل الصامت</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            منصة رقمية مبتكرة تجمع بين التعليم الجامعي البصري وتنمية المواهب، مصممة خصيصًا لفئة الصم.
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold">روابط</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/courses">الدروس</Link></li>
            <li><Link className="hover:text-foreground" href="/talents">المواهب</Link></li>
            <li><Link className="hover:text-foreground" href="/about">عن المنصة</Link></li>
            <li><Link className="hover:text-foreground" href="/contact">تواصل</Link></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold">رؤيتنا</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            تمكين الصم من الوصول إلى تعليم رقمي دامج، وتطوير قدراتهم في بيئة متكاملة تجمع بين العلم والإبداع.
          </p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} الأمل الصامت — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
