import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl gradient-hero text-sm font-bold text-primary-foreground">
              ش
            </div>
            <p className="text-lg font-bold">الأمل الصامت</p>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            منصة رقمية مبتكرة تحوّل التعليم الجامعي إلى تجربة بصرية متكاملة موجهة
            خصيصًا لفئة الصم.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">روابط</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link className="hover:text-foreground" href="/learn">
                التعلّم
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/talents">
                المواهب
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/about">
                عن المنصة
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/contact">
                تواصل
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">رؤيتنا</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            تمكين الصم من الوصول إلى تعليم رقمي دامج، وتطوير قدراتهم في بيئة
            متكاملة تجمع بين العلم والإبداع.
          </p>
        </div>
      </div>
      <div className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} الأمل الصامت — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
