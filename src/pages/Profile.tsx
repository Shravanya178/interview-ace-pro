import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Loader2, UserCircle } from "lucide-react";

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photoUrl: user?.photoUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("profile")}</h1>
          </div>
          <Card>
            <CardContent className="pt-6 text-center">
              <p>{t("login required")}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("profile")}</h1>
          <p className="text-gray-500 mt-1">{t("manage profile")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("personal information")}</CardTitle>
            <CardDescription>
              {isEditing ? t("update profile info") : t("view profile info")}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4 md:w-1/3">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={user.photoUrl} alt={user.name} />
                    <AvatarFallback className="text-4xl">
                      <UserCircle className="w-16 h-16" />
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div>
                      <Label htmlFor="photoUrl">{t("photo url")}</Label>
                      <Input
                        id="photoUrl"
                        name="photoUrl"
                        value={formData.photoUrl || ""}
                        onChange={handleChange}
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4 md:w-2/3">
                  <div>
                    <Label htmlFor="name">{t("name")}</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="mt-1 text-lg">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">{t("email")}</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="mt-1 text-lg">{user.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name,
                        email: user.email,
                        photoUrl: user.photoUrl || "",
                      });
                    }}
                    disabled={isLoading}
                  >
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("saving")}
                      </>
                    ) : (
                      t("save")
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  {t("edit_profile")}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
