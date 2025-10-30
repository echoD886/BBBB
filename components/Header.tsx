import React from 'react';
import { useTranslation } from '../i18n';

export const Header: React.FC = () => {
  const { t, setLanguage, language } = useTranslation();

  const handleLanguageChange = (lang: 'en' | 'zh') => {
    setLanguage(lang);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-transparent">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-white">
          <span className="text-orange-400">AI</span> {t('header.chef')}
        </a>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-white hover:text-orange-300 transition-colors">{t('header.home')}</a>
          <a href="#" className="text-white hover:text-orange-300 transition-colors">{t('header.generator')}</a>
          <a href="#" className="text-white hover:text-orange-300 transition-colors">{t('header.community')}</a>
          <a href="#" className="text-white hover:text-orange-300 transition-colors">{t('header.kitchen')}</a>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-white bg-white/20 backdrop-blur-sm rounded-full p-1 flex">
            <button 
              onClick={() => handleLanguageChange('en')} 
              className={`px-3 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-white text-slate-800' : ''}`}
            >
              EN
            </button>
            <button 
              onClick={() => handleLanguageChange('zh')} 
              className={`px-3 py-1 rounded-full transition-colors ${language === 'zh' ? 'bg-white text-slate-800' : ''}`}
            >
              中文
            </button>
          </div>
          <button className="md:hidden text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </nav>
    </header>
  );
};