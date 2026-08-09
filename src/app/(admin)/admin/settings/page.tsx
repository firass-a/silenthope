"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "@/stores/settings.store";
import { useAuthStore } from "@/stores/auth.store";
import { isStaffRole } from "@/lib/permissions";
import type { FontSize } from "@/types";

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetDemoData = useSettingsStore((s) => s.resetDemoData);
  const role = useAuthStore((s) => s.session?.role);
  const staff = role ? isStaffRole(role) : false;
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإعدادات"
        description={
          staff
            ? "ضبط المنصة والمظهر وإمكانية الوصول والبيانات."
            : "إعدادات المظهر وإمكانية الوصول لحسابك."
        }
      />

      <Tabs defaultValue={staff ? "general" : "appearance"}>
        <TabsList className="flex h-auto flex-wrap">
          {staff ? <TabsTrigger value="general">عام</TabsTrigger> : null}
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="a11y">إمكانية الوصول</TabsTrigger>
          {staff ? <TabsTrigger value="notifications">الإشعارات</TabsTrigger> : null}
          {staff ? <TabsTrigger value="demo">البيانات</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات عامة</CardTitle>
              <CardDescription>اسم المنصة وبيانات التواصل</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>اسم المنصة</Label>
                <Input
                  value={settings.platformName}
                  onChange={(e) => updateSettings({ platformName: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>الوصف</Label>
                <Textarea
                  value={settings.description}
                  onChange={(e) => updateSettings({ description: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>البريد للتواصل</Label>
                <Input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateSettings({ contactEmail: e.target.value })}
                />
              </div>
              <Button
                className="sm:col-span-2 w-fit"
                onClick={() => toast.success("تم حفظ الإعدادات العامة")}
              >
                حفظ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>المظهر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="rounded-xl border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                المنصة تعمل بالوضع الفاتح فقط (هوية ورقية دافئة).
              </p>
              <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                <div>
                  <p className="font-medium">الوضع المضغوط</p>
                  <p className="text-sm text-muted-foreground">تقليل المسافات في الواجهة</p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(v) => updateSettings({ compactMode: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>سلوك الشريط الجانبي</Label>
                <Select
                  value={settings.sidebarBehavior}
                  onValueChange={(v) =>
                    updateSettings({
                      sidebarBehavior: v as "expanded" | "collapsed" | "auto",
                    })
                  }
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expanded">موسّع</SelectItem>
                    <SelectItem value="collapsed">مطوي</SelectItem>
                    <SelectItem value="auto">تلقائي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="a11y" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>إمكانية الوصول</CardTitle>
              <CardDescription>خيارات مهمة لمنصة موجّهة للصم وللوضوح البصري</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>حجم الخط</Label>
                <Select
                  value={settings.fontSize}
                  onValueChange={(v) => {
                    updateSettings({ fontSize: v as FontSize });
                    toast.success("تم تحديث حجم الخط");
                  }}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">صغير</SelectItem>
                    <SelectItem value="md">متوسط</SelectItem>
                    <SelectItem value="lg">كبير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                <div>
                  <p className="font-medium">تباين عالٍ</p>
                  <p className="text-sm text-muted-foreground">تحسين قراءة النصوص والحدود</p>
                </div>
                <Switch
                  checked={settings.contrast === "high"}
                  onCheckedChange={(v) =>
                    updateSettings({ contrast: v ? "high" : "normal" })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                <div>
                  <p className="font-medium">تقليل الحركة</p>
                  <p className="text-sm text-muted-foreground">تعطيل الحركات غير الضرورية</p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(v) => updateSettings({ reducedMotion: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ["enableNotifications", "تفعيل الإشعارات"],
                  ["emailNotifications", "إشعارات البريد"],
                  ["systemNotifications", "إشعارات النظام"],
                ] as const
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border px-4 py-3"
                >
                  <p className="font-medium">{label}</p>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(v) => updateSettings({ [key]: v })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demo" className="mt-4">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>إعادة تعيين البيانات</CardTitle>
              <CardDescription>
                مسح التعديلات الحالية وإعادة تحميل البيانات الافتراضية للمنصة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setResetOpen(true)}>
                إعادة تعيين البيانات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="إعادة تعيين كل البيانات؟"
        description="سيتم مسح جميع التعديلات الحالية وإعادة تحميل البيانات الافتراضية."
        confirmLabel="إعادة التعيين"
        destructive
        onConfirm={() => {
          toast.message("جاري إعادة التعيين...");
          resetDemoData();
        }}
      />
    </div>
  );
}
