import React, { useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Checkbox,
  useToasts,
  ThemeSwitcher,
  LanguageSwitcher,
} from '@automatize/ui/web';
import { useTranslation } from 'react-i18next';
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await handleSignIn();
    if (result.success) onSuccess();
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
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">
              <span className="font-light text-foreground tracking-tighter">
                {t('sign-in.welcome')}
              </span>
            </h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">
              {t('sign-in.subtitle')}
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="animate-element animate-delay-300">
                <Label htmlFor="sign-in-email">
                  {t('sign-in.email.label')}
                </Label>
                <Input
                  id="sign-in-email"
                  name="email"
                  type="email"
                  placeholder={t('sign-in.email.placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="animate-element animate-delay-400">
                <Label htmlFor="sign-in-password">
                  {t('sign-in.password.label')}
                </Label>
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

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <Label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox name="rememberMe" />
                  <span className="text-foreground/90">
                    {t('sign-in.remember')}
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={onResetPassword}
                  className="p-0 h-auto"
                >
                  {t('sign-in.reset-password')}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="animate-element animate-delay-600 w-full"
              >
                {isLoading ? t('sign-in.submitting') : t('sign-in.submit')}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
