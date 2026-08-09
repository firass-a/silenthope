"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/components/brand/section";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    toast.success("تم استلام رسالتك — سنعود إليك قريباً");
  }

  return (
    <div>
      <section className="gradient-mist border-b border-border/40">
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-600">تواصل</p>
            <h1 className="mt-3 text-display">نسمعك… بصرياً</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              اكتب رسالتك وسنعود إليك — لا حاجة لحساب للتواصل.
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-6">
            <div className="flex gap-3">
              <Mail className="size-5 text-brand-600" />
              <div>
                <p className="font-semibold">البريد</p>
                <p className="text-sm text-muted-foreground">hello@silenthope.dz</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="size-5 text-brand-600" />
              <div>
                <p className="font-semibold">الهاتف</p>
                <p className="text-sm text-muted-foreground">0550 00 00 00</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="size-5 text-brand-600" />
              <div>
                <p className="font-semibold">المكان</p>
                <p className="text-sm text-muted-foreground">الجزائر العاصمة</p>
              </div>
            </div>
            <p className="rounded-3xl bg-brand-50 p-5 text-sm leading-relaxed text-muted-foreground">
              نقرأ كل رسالة بعناية ونعود إليك في أقرب وقت ممكن.
            </p>
          </aside>

          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-[2rem] border border-border/60 bg-card/80 p-6 md:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" required name="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد</Label>
                <Input id="email" type="email" required name="email" dir="ltr" className="text-left" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">الموضوع</Label>
              <Input id="subject" required name="subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">الرسالة</Label>
              <Textarea id="message" required name="message" rows={6} />
            </div>
            <Button type="submit" size="lg" disabled={sent}>
              {sent ? "تم الإرسال" : "إرسال الرسالة"}
            </Button>
          </form>
        </div>
      </Section>
    </div>
  );
}
