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
import { Loader2, UserCircle, Upload, X, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Extended user interface with profile fields
interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  phone?: string;
  title?: string;
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  preferredRole?: string;
  targetCompanies?: string[];
  interviewPreferences?: {
    receiveEmailNotifications?: boolean;
    preferredInterviewType?: string;
    cameraEnabled?: boolean;
    microphoneEnabled?: boolean;
    emotionDetectionEnabled?: boolean;
  };
}

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photoUrl: user?.photoUrl || "",
    title: (user as ExtendedUser)?.title || "",
    bio: (user as ExtendedUser)?.bio || "",
    location: (user as ExtendedUser)?.location || "",
    phone: user?.phone || "",
    github: (user as ExtendedUser)?.github || "",
    linkedin: (user as ExtendedUser)?.linkedin || "",
    experience: (user as ExtendedUser)?.experience || "0-1",
    education: (user as ExtendedUser)?.education || "",
    skills: (user as ExtendedUser)?.skills || [],
    newSkill: "",
    preferredRole: (user as ExtendedUser)?.preferredRole || "",
    targetCompanies: (user as ExtendedUser)?.targetCompanies || [],
    newCompany: "",
    interviewPreferences: {
      receiveEmailNotifications:
        (user as ExtendedUser)?.interviewPreferences
          ?.receiveEmailNotifications || true,
      preferredInterviewType:
        (user as ExtendedUser)?.interviewPreferences?.preferredInterviewType ||
        "technical",
      cameraEnabled:
        (user as ExtendedUser)?.interviewPreferences?.cameraEnabled || true,
      microphoneEnabled:
        (user as ExtendedUser)?.interviewPreferences?.microphoneEnabled || true,
      emotionDetectionEnabled:
        (user as ExtendedUser)?.interviewPreferences?.emotionDetectionEnabled ||
        true,
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interviewPreferences: {
        ...prev.interviewPreferences,
        [name]: checked,
      },
    }));
  };

  const handleSkillAdd = () => {
    if (formData.newSkill && !formData.skills.includes(formData.newSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill],
        newSkill: "",
      }));
    }
  };

  const handleSkillRemove = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleCompanyAdd = () => {
    if (
      formData.newCompany &&
      !formData.targetCompanies.includes(formData.newCompany)
    ) {
      setFormData((prev) => ({
        ...prev,
        targetCompanies: [...prev.targetCompanies, prev.newCompany],
        newCompany: "",
      }));
    }
  };

  const handleCompanyRemove = (company: string) => {
    setFormData((prev) => ({
      ...prev,
      targetCompanies: prev.targetCompanies.filter((c) => c !== company),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Show saving toast with Supabase indication
      toast({
        title: "Saving profile to Supabase",
        description: "Your profile data is being saved to the database...",
      });

      // Log the data we're submitting
      console.log("Submitting profile data to Supabase:", formData);

      // Ensure we don't submit temporary form state properties
      const dataToSubmit = { ...formData };
      delete dataToSubmit.newSkill;
      delete dataToSubmit.newCompany;

      // Update profile in Supabase
      await updateProfile(dataToSubmit);

      // Success feedback
      toast({
        title: "Profile saved successfully",
        description:
          "Your profile has been updated and saved to the Supabase database.",
        variant: "default",
      });

      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile to Supabase:", error);
      toast({
        title: "Supabase save failed",
        description:
          "There was a problem saving your profile to the database. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("profile")}</h1>
            <p className="text-gray-500 mt-1">{t("manage profile")}</p>
          </div>
          <div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      photoUrl: user.photoUrl || "",
                      title: (user as ExtendedUser).title || "",
                      bio: (user as ExtendedUser).bio || "",
                      location: (user as ExtendedUser).location || "",
                      phone: user.phone || "",
                      github: (user as ExtendedUser).github || "",
                      linkedin: (user as ExtendedUser).linkedin || "",
                      experience: (user as ExtendedUser).experience || "0-1",
                      education: (user as ExtendedUser).education || "",
                      skills: (user as ExtendedUser).skills || [],
                      newSkill: "",
                      preferredRole: (user as ExtendedUser).preferredRole || "",
                      targetCompanies:
                        (user as ExtendedUser).targetCompanies || [],
                      newCompany: "",
                      interviewPreferences: {
                        receiveEmailNotifications:
                          (user as ExtendedUser).interviewPreferences
                            ?.receiveEmailNotifications || true,
                        preferredInterviewType:
                          (user as ExtendedUser).interviewPreferences
                            ?.preferredInterviewType || "technical",
                        cameraEnabled:
                          (user as ExtendedUser).interviewPreferences
                            ?.cameraEnabled || true,
                        microphoneEnabled:
                          (user as ExtendedUser).interviewPreferences
                            ?.microphoneEnabled || true,
                        emotionDetectionEnabled:
                          (user as ExtendedUser).interviewPreferences
                            ?.emotionDetectionEnabled || true,
                      },
                    });
                  }}
                  disabled={isLoading}
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("save")}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                {t("edit profile")}
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("personal information")}</CardTitle>
                <CardDescription>
                  {isEditing
                    ? t("update profile info")
                    : t("view profile info")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4 md:w-1/4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage
                        src={formData.photoUrl}
                        alt={formData.name}
                      />
                      <AvatarFallback className="text-4xl">
                        <UserCircle className="w-16 h-16" />
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="flex flex-col items-center">
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer"
                        >
                          <div className="flex items-center space-x-2 text-primary">
                            <Upload size={16} />
                            <span>Upload photo</span>
                          </div>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <div className="mt-2">
                          <Label
                            htmlFor="photoUrl"
                            className="text-xs text-gray-500"
                          >
                            Or use URL
                          </Label>
                          <Input
                            id="photoUrl"
                            name="photoUrl"
                            value={formData.photoUrl || ""}
                            onChange={handleChange}
                            placeholder="https://example.com/photo.jpg"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 md:w-3/4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isLoading}
                          />
                        ) : (
                          <p className="mt-1 text-lg">
                            {user.phone || "Not specified"}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="location">Location</Label>
                        {isEditing ? (
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="City, Country"
                          />
                        ) : (
                          <p className="mt-1 text-lg">
                            {(user as ExtendedUser).location || "Not specified"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="Tell us a bit about yourself"
                          rows={3}
                        />
                      ) : (
                        <p className="mt-1">
                          {(user as ExtendedUser).bio || "No bio provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Add your professional details to customize your interview
                  experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Professional Title</Label>
                      {isEditing ? (
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="e.g. Senior Software Engineer"
                        />
                      ) : (
                        <p className="mt-1 text-lg">
                          {(user as ExtendedUser).title || "Not specified"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      {isEditing ? (
                        <Select
                          value={formData.experience}
                          onValueChange={(value) =>
                            handleSelectChange("experience", value)
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 years</SelectItem>
                            <SelectItem value="1-3">1-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-lg">
                          {(user as ExtendedUser).experience === "0-1"
                            ? "0-1 years"
                            : (user as ExtendedUser).experience === "1-3"
                            ? "1-3 years"
                            : (user as ExtendedUser).experience === "3-5"
                            ? "3-5 years"
                            : (user as ExtendedUser).experience === "5-10"
                            ? "5-10 years"
                            : (user as ExtendedUser).experience === "10+"
                            ? "10+ years"
                            : "Not specified"}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="education">Education</Label>
                    {isEditing ? (
                      <Textarea
                        id="education"
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="e.g. BS Computer Science, Stanford University"
                        rows={2}
                      />
                    ) : (
                      <p className="mt-1">
                        {(user as ExtendedUser).education || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex">
                          <Input
                            id="newSkill"
                            name="newSkill"
                            value={formData.newSkill}
                            onChange={handleChange}
                            placeholder="Add a skill"
                            className="rounded-r-none"
                          />
                          <Button
                            type="button"
                            onClick={handleSkillAdd}
                            className="rounded-l-none"
                            disabled={!formData.newSkill}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="py-1"
                            >
                              {skill}
                              <button
                                type="button"
                                className="ml-1 text-gray-500 hover:text-gray-700"
                                onClick={() => handleSkillRemove(skill)}
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {((user as ExtendedUser).skills || []).length > 0 ? (
                          (user as ExtendedUser).skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="py-1"
                            >
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p>No skills specified</p>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredRole">Target Role</Label>
                      {isEditing ? (
                        <Input
                          id="preferredRole"
                          name="preferredRole"
                          value={formData.preferredRole}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="e.g. Frontend Developer"
                        />
                      ) : (
                        <p className="mt-1 text-lg">
                          {(user as ExtendedUser).preferredRole ||
                            "Not specified"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="targetCompanies">Target Companies</Label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex">
                            <Input
                              id="newCompany"
                              name="newCompany"
                              value={formData.newCompany}
                              onChange={handleChange}
                              placeholder="Add a company"
                              className="rounded-r-none"
                            />
                            <Button
                              type="button"
                              onClick={handleCompanyAdd}
                              className="rounded-l-none"
                              disabled={!formData.newCompany}
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.targetCompanies.map((company, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="py-1"
                              >
                                {company}
                                <button
                                  type="button"
                                  className="ml-1 text-gray-500 hover:text-gray-700"
                                  onClick={() => handleCompanyRemove(company)}
                                >
                                  <X size={12} />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {((user as ExtendedUser).targetCompanies || [])
                            .length > 0 ? (
                            (user as ExtendedUser).targetCompanies.map(
                              (company, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="py-1"
                                >
                                  {company}
                                </Badge>
                              )
                            )
                          ) : (
                            <p>No target companies specified</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      {isEditing ? (
                        <Input
                          id="linkedin"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      ) : (
                        <p className="mt-1 text-lg">
                          {(user as ExtendedUser).linkedin ? (
                            <a
                              href={(user as ExtendedUser).linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {(user as ExtendedUser).linkedin.replace(
                                "https://linkedin.com/in/",
                                ""
                              )}
                            </a>
                          ) : (
                            "Not specified"
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="github">GitHub Profile</Label>
                      {isEditing ? (
                        <Input
                          id="github"
                          name="github"
                          value={formData.github}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="https://github.com/yourusername"
                        />
                      ) : (
                        <p className="mt-1 text-lg">
                          {(user as ExtendedUser).github ? (
                            <a
                              href={(user as ExtendedUser).github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {(user as ExtendedUser).github.replace(
                                "https://github.com/",
                                ""
                              )}
                            </a>
                          ) : (
                            "Not specified"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview Preferences</CardTitle>
                <CardDescription>
                  Customize your interview experience and notification
                  preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="preferredInterviewType"
                      className="text-base font-medium"
                    >
                      Default Interview Type
                    </Label>
                    {isEditing ? (
                      <Select
                        value={
                          formData.interviewPreferences.preferredInterviewType
                        }
                        onValueChange={(value) =>
                          handleSelectChange(
                            "interviewPreferences.preferredInterviewType",
                            value
                          )
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select interview type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">
                            Technical Interview
                          </SelectItem>
                          <SelectItem value="behavioral">
                            Behavioral Interview
                          </SelectItem>
                          <SelectItem value="system-design">
                            System Design Interview
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-lg">
                        {(user as ExtendedUser).interviewPreferences
                          ?.preferredInterviewType === "technical"
                          ? "Technical Interview"
                          : (user as ExtendedUser).interviewPreferences
                              ?.preferredInterviewType === "behavioral"
                          ? "Behavioral Interview"
                          : (user as ExtendedUser).interviewPreferences
                              ?.preferredInterviewType === "system-design"
                          ? "System Design Interview"
                          : "Not specified"}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-base font-medium">
                      Default Hardware Settings
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="cameraEnabled">Camera Enabled</Label>
                        <p className="text-sm text-gray-500">
                          Enable video by default in interviews
                        </p>
                      </div>
                      {isEditing ? (
                        <Switch
                          id="cameraEnabled"
                          checked={formData.interviewPreferences.cameraEnabled}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("cameraEnabled", checked)
                          }
                          disabled={isLoading}
                        />
                      ) : (
                        <Badge
                          variant={
                            (user as ExtendedUser).interviewPreferences
                              ?.cameraEnabled
                              ? "default"
                              : "outline"
                          }
                        >
                          {(user as ExtendedUser).interviewPreferences
                            ?.cameraEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="microphoneEnabled">
                          Microphone Enabled
                        </Label>
                        <p className="text-sm text-gray-500">
                          Enable microphone by default in interviews
                        </p>
                      </div>
                      {isEditing ? (
                        <Switch
                          id="microphoneEnabled"
                          checked={
                            formData.interviewPreferences.microphoneEnabled
                          }
                          onCheckedChange={(checked) =>
                            handleSwitchChange("microphoneEnabled", checked)
                          }
                          disabled={isLoading}
                        />
                      ) : (
                        <Badge
                          variant={
                            (user as ExtendedUser).interviewPreferences
                              ?.microphoneEnabled
                              ? "default"
                              : "outline"
                          }
                        >
                          {(user as ExtendedUser).interviewPreferences
                            ?.microphoneEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emotionDetectionEnabled">
                          Emotion Detection
                        </Label>
                        <p className="text-sm text-gray-500">
                          Enable emotion detection for interview feedback
                        </p>
                      </div>
                      {isEditing ? (
                        <Switch
                          id="emotionDetectionEnabled"
                          checked={
                            formData.interviewPreferences
                              .emotionDetectionEnabled
                          }
                          onCheckedChange={(checked) =>
                            handleSwitchChange(
                              "emotionDetectionEnabled",
                              checked
                            )
                          }
                          disabled={isLoading}
                        />
                      ) : (
                        <Badge
                          variant={
                            (user as ExtendedUser).interviewPreferences
                              ?.emotionDetectionEnabled
                              ? "default"
                              : "outline"
                          }
                        >
                          {(user as ExtendedUser).interviewPreferences
                            ?.emotionDetectionEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="receiveEmailNotifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive email notifications about interview results
                      </p>
                    </div>
                    {isEditing ? (
                      <Switch
                        id="receiveEmailNotifications"
                        checked={
                          formData.interviewPreferences
                            .receiveEmailNotifications
                        }
                        onCheckedChange={(checked) =>
                          handleSwitchChange(
                            "receiveEmailNotifications",
                            checked
                          )
                        }
                        disabled={isLoading}
                      />
                    ) : (
                      <Badge
                        variant={
                          (user as ExtendedUser).interviewPreferences
                            ?.receiveEmailNotifications
                            ? "default"
                            : "outline"
                        }
                      >
                        {(user as ExtendedUser).interviewPreferences
                          ?.receiveEmailNotifications
                          ? "Enabled"
                          : "Disabled"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    {t("save")}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
