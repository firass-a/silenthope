"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Check, Star, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleGate, useCan } from "@/components/layout/role-gate";
import { useTalentsStore } from "@/stores/talents.store";
import { useCategoriesStore } from "@/stores/categories.store";
import { formatDate } from "@/lib/utils";

export default function TalentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <RoleGate anyOf={["manage_talents", "review_talents"]}>
      <TalentDetailContent params={params} />
    </RoleGate>
  );
}

function TalentDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const canReview = useCan("review_talents");
  const canManage = useCan("manage_talents");
  const talents = useTalentsStore((s) => s.talents);
  const talent = useMemo(() => talents.find((t) => t.id === id), [talents, id]);
  const approveTalent = useTalentsStore((s) => s.approveTalent);
  const rejectTalent = useTalentsStore((s) => s.rejectTalent);
  const featureTalent = useTalentsStore((s) => s.featureTalent);
  const categories = useCategoriesStore((s) => s.categories);
  const category = useMemo(
    () => categories.find((c) => c.id === talent?.categoryId),
    [categories, talent?.categoryId]
  );

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!talent) {
    return (
      <EmptyState
        title="الموهبة غير موجودة"
        description="لم يتم العثور على هذه الموهبة"
        actionLabel="العودة"
        onAction={() => window.history.back()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={talent.title}
        description={`بواسطة ${talent.studentName}`}
        badge={<StatusBadge status={talent.status} />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/talents">
                <ArrowRight className="size-4" />
                العودة
              </Link>
            </Button>
            {canReview && talent.status === "pending" ? (
              <>
                <Button
                  onClick={() => {
                    approveTalent(id);
                    toast.success("تمت الموافقة على الموهبة");
                  }}
                >
                  <Check className="size-4" />
                  موافقة
                </Button>
                <Button variant="destructive" onClick={() => setRejectOpen(true)}>
                  <X className="size-4" />
                  رفض
                </Button>
              </>
            ) : null}
            {canManage && (talent.status === "approved" || talent.status === "featured") && (
              <Button
                variant="accent"
                onClick={() => {
                  featureTalent(id, !talent.featured);
                  toast.success(talent.featured ? "تم إلغاء التمييز" : "تم تمييز الموهبة");
                }}
              >
                <Star className="size-4" />
                {talent.featured ? "إلغاء التمييز" : "تمييز"}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الوصف</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{talent.description}</p>
            </CardContent>
          </Card>

          {talent.rejectionReason ? (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive">سبب الرفض</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{talent.rejectionReason}</p>
              </CardContent>
            </Card>
          ) : null}

          {talent.skills.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">المهارات</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {talent.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">التصنيف</span>
                <span>{category?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المشاهدات</span>
                <span>{talent.views}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الإعجابات</span>
                <span>{talent.likes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">تاريخ الإرسال</span>
                <span>{formatDate(talent.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">آخر تحديث</span>
                <span>{formatDate(talent.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض الموهبة</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">سبب الرفض</Label>
            <Textarea
              id="reason"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={() => {
                rejectTalent(id, rejectReason.trim());
                toast.success("تم رفض الموهبة");
                setRejectOpen(false);
                setRejectReason("");
              }}
            >
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
