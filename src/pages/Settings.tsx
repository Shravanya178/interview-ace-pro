
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const { t, language, setLanguage, languages } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
          <p className="text-gray-500 mt-1">{t('settings_desc')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('language_preferences')}</CardTitle>
            <CardDescription>
              {t('language_preferences_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="language">{t('select_language')}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder={t('select_language')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('notification_preferences')}</CardTitle>
            <CardDescription>
              {t('notification_preferences_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('email_notifications')}</Label>
                <p className="text-sm text-gray-500">
                  {t('email_notifications_desc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('browser_notifications')}</Label>
                <p className="text-sm text-gray-500">
                  {t('browser_notifications_desc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('privacy_settings')}</CardTitle>
            <CardDescription>
              {t('privacy_settings_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('data_collection')}</Label>
                <p className="text-sm text-gray-500">
                  {t('data_collection_desc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('analytics_tracking')}</Label>
                <p className="text-sm text-gray-500">
                  {t('analytics_tracking_desc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
