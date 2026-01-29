import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Globe, Lock, Palette, Mail, Smartphone } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Тохиргоо</h2>
          <p className="text-muted-foreground">Системийн тохиргоог удирдах</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="general">Ерөнхий</TabsTrigger>
            <TabsTrigger value="notifications">Мэдэгдэл</TabsTrigger>
            <TabsTrigger value="security">Аюулгүй байдал</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Globe className="w-5 h-5" />
                  Ерөнхий тохиргоо
                </CardTitle>
                <CardDescription>Системийн үндсэн тохиргоо</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Сайтын нэр</Label>
                    <Input id="siteName" defaultValue="Delivery App" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Сайтын хаяг</Label>
                    <Input id="siteUrl" defaultValue="https://delivery.mn" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Дэмжлэгийн имэйл</Label>
                    <Input id="supportEmail" defaultValue="support@delivery.mn" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Дэмжлэгийн утас</Label>
                    <Input id="supportPhone" defaultValue="+976 7777 1234" />
                  </div>
                </div>
                <Button>Хадгалах</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Palette className="w-5 h-5" />
                  Харагдах байдал
                </CardTitle>
                <CardDescription>Интерфейсийн тохиргоо</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Харанхуй горим</p>
                    <p className="text-sm text-muted-foreground">Интерфейсийг харанхуй болгох</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Compact горим</p>
                    <p className="text-sm text-muted-foreground">UI-г илүү нягт харуулах</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bell className="w-5 h-5" />
                  Мэдэгдлийн тохиргоо
                </CardTitle>
                <CardDescription>Мэдэгдэл хүлээн авах сонголтууд</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Имэйл мэдэгдэл</p>
                      <p className="text-sm text-muted-foreground">Шинэ захиалга, тайлан</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Push мэдэгдэл</p>
                      <p className="text-sm text-muted-foreground">Бодит цагийн мэдэгдлүүд</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Дуутай мэдэгдэл</p>
                      <p className="text-sm text-muted-foreground">Шинэ захиалгад дуугаар мэдэгдэх</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lock className="w-5 h-5" />
                  Аюулгүй байдлын тохиргоо
                </CardTitle>
                <CardDescription>Нууцлал болон хамгаалалтын тохиргоо</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Хоёр алхамт баталгаажуулалт</p>
                    <p className="text-sm text-muted-foreground">Нэвтрэхэд нэмэлт баталгаажуулалт</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Session timeout</p>
                    <p className="text-sm text-muted-foreground">Идэвхгүй үед автоматаар гарах</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">IP хязгаарлалт</p>
                    <p className="text-sm text-muted-foreground">Зөвхөн зөвшөөрөгдсөн IP-ээс нэвтрэх</p>
                  </div>
                  <Switch />
                </div>
                <div className="pt-4 border-t border-border">
                  <Button variant="destructive">Бүх сессийг дуусгах</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Нууц үг солих</CardTitle>
                <CardDescription>Админ нууц үгээ шинэчлэх</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Одоогийн нууц үг</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Шинэ нууц үг</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Нууц үг давтах</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Нууц үг солих</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
