import React, { useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  Button,
  PrimaryButton,
  Input,
  Text,
  Checkbox,
  useToasts,
  Fade,
} from '@automatize/ui/web';
import { ThemeSwitcher } from '../components/ThemeSwitcher/ThemeSwitcher.web';
import { LanguageSwitcher } from '../components/LanguageSwitcher/LanguageSwitcher.web';
import { useTranslation } from '@automatize/core-localization';
import type { SignInScreenProps } from './SignInScreen.types';
import { useSignIn } from './useSignIn';

// --- MAIN COMPONENT ---

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSuccess,
  onResetPassword,
  locale,
  theme,
}) => {
  const { t } = useTranslation();
  const toast = useToasts();
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    error,
    isLoading,
    handleSignIn,
  } = useSignIn();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleSignIn().then((result) => {
      if (result.success) onSuccess();
    });
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

      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-4">
            <Fade delay={100}>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                <span className="font-light text-foreground tracking-tighter">
                  {t('sign-in.welcome')}
                </span>
              </h1>
            </Fade>

            <Fade delay={200}>
              <p className="text-muted-foreground">{t('sign-in.subtitle')}</p>
            </Fade>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Fade delay={300}>
                <Input
                  id="sign-in-email"
                  name="email"
                  type="email"
                  label={t('sign-in.email.label')}
                  placeholder={t('sign-in.email.placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </Fade>

              <Fade delay={400}>
                <div className="space-y-1.5">
                  <Text
                    htmlFor="sign-in-password"
                    color="muted"
                    className="pl-4"
                  >
                    {t('sign-in.password.label')}
                  </Text>
                  <div className="relative">
                    <Input
                      id="sign-in-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('sign-in.password.placeholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </Fade>

              <Fade
                delay={500}
                className="flex items-center justify-between text-sm"
              >
                <Text
                  variant="label"
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Checkbox name="rememberMe" />
                  <Text variant="bodySmall" color="primary">
                    {t('sign-in.remember')}
                  </Text>
                </Text>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={onResetPassword}
                  className="p-0 h-auto"
                >
                  {t('sign-in.reset-password')}
                </Button>
              </Fade>

              <Fade delay={600}>
                <PrimaryButton
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full"
                >
                  {isLoading ? t('sign-in.submitting') : t('sign-in.submit')}
                </PrimaryButton>
              </Fade>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
