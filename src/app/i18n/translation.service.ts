import { Injectable, computed, signal } from '@angular/core';
import { Language, translations } from './translations';

type TranslationParams = Record<string, string | number>;

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly storageKey = 'app_language';
  private readonly languageSignal = signal<Language>(this.getInitialLanguage());

  readonly language = computed(() => this.languageSignal());

  setLanguage(language: Language): void {
    this.languageSignal.set(language);
    localStorage.setItem(this.storageKey, language);
  }

  t(key: string, params?: TranslationParams): string {
    const dictionary = translations[this.languageSignal()];
    const template =
      dictionary[key as keyof typeof dictionary] ??
      translations.en[key as keyof typeof translations.en] ??
      key;

    return this.interpolate(template, params);
  }

  translateStatus(status: string): string {
    return this.t(`status.${status}`);
  }

  translatePriority(priority: string): string {
    return this.t(`priority.${priority}`);
  }

  translateBackendMessage(message: string): string {
    return this.t(`backend.${message}`);
  }

  translateRole(roleName: string): string {
    const normalizedRole = roleName.trim().toLowerCase();

    if (normalizedRole === 'admin') {
      return this.t('role.admin');
    }

    if (normalizedRole === 'user') {
      return this.t('role.user');
    }

    return roleName;
  }

  translateCategory(categoryName: string): string {
    const normalizedCategory = categoryName.trim().toLowerCase();

    if (normalizedCategory === 'work') {
      return this.t('category.work');
    }

    if (normalizedCategory === 'personal') {
      return this.t('category.personal');
    }

    if (normalizedCategory === 'study') {
      return this.t('category.study');
    }

    return categoryName;
  }

  private getInitialLanguage(): Language {
    const savedLanguage = localStorage.getItem(this.storageKey);
    return savedLanguage === 'en' ? 'en' : 'uk';
  }

  private interpolate(template: string, params?: TranslationParams): string {
    if (!params) {
      return template;
    }

    return Object.entries(params).reduce(
      (result, [key, value]) =>
        result.replaceAll(`{{${key}}}`, String(value)),
      template,
    );
  }
}
