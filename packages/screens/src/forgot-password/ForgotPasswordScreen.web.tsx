import React, { useEffect } from 'react';
import { MailCheck, ArrowLeft } from 'lucide-react';
import { Button, Input, useToasts, Fade } from '@automatize/ui/web';
import { ThemeSwitcher } from '../components/ThemeSwitcher/ThemeSwitcher.web';
import { LanguageSwitcher } from '../components/LanguageSwitcher/LanguageSwitcher.web';
import { useTranslation } from '@automatize/core-localization';
import type { ForgotPasswordScreenProps } from './ForgotPasswordScreen.types';
import { useForgotPassword } from './useForgotPassword';

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBackToSignIn,
  locale,
  theme,
}) => {
  const { t } = useTranslation();
  const toast = useToasts();
  const { email, setEmail, error, isLoading, isSuccess, handleSubmit } =
    useForgotPassword();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw]">
      {/* Top-right: language & theme switchers */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {theme && (
          <ThemeSwitcher
            currentPreference={theme.currentTheme}
            isDark={theme.isDarkTheme}
            options={theme.themeOptions}
            onPreferenceChange={theme.onThemeChange}
            triggerAriaLabel={t('theme.switch-label')}
          />
        )}
        <LanguageSwitcher
          languages={locale.languages}
          currentLanguage={locale.currentLanguage}
          onLanguageChange={locale.onLanguageChange}
          triggerAriaLabel={t('language.switch-label')}
        />
      </div>

      {/* Left column: form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {isSuccess ? (
            <Fade delay={100} className="flex flex-col gap-6">
              <div className="flex justify-center">
                <MailCheck className="w-16 h-16 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-center">
                <span className="font-light text-foreground tracking-tighter">
                  {t('forgot-password.success.title')}
                </span>
              </h1>
              <p className="text-muted-foreground text-center">
                {t('forgot-password.success.message')}
              </p>
              <Button type="button" onClick={onBackToSignIn} className="w-full">
                {t('forgot-password.back-to-sign-in')}
              </Button>
            </Fade>
          ) : (
            <div className="flex flex-col gap-6">
              <Fade
                delay={100}
                className="flex items-center justify-start gap-2"
              >
                <button
                  type="button"
                  onClick={onBackToSignIn}
                  aria-label={t('forgot-password.back-to-sign-in')}
                  className="flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 h-[34px] rounded-lg border border-border/50 hover:border-border hover:bg-accent/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm text-muted-foreground">
                  {t('forgot-password.back-to-sign-in')}
                </span>
              </Fade>

              <Fade delay={100}>
                <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                  <span className="font-light text-foreground tracking-tighter">
                    {t('forgot-password.title')}
                  </span>
                </h1>
              </Fade>

              <Fade delay={200}>
                <p className="text-muted-foreground">
                  {t('forgot-password.subtitle')}
                </p>
              </Fade>

              <form className="space-y-5" onSubmit={onFormSubmit}>
                <Fade delay={300}>
                  <Input
                    id="forgot-password-email"
                    name="email"
                    type="email"
                    label={t('forgot-password.email.label')}
                    placeholder={t('forgot-password.email.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </Fade>

                <Fade delay={400}>
                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full"
                  >
                    {isLoading
                      ? t('forgot-password.submitting')
                      : t('forgot-password.submit')}
                  </Button>
                </Fade>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
