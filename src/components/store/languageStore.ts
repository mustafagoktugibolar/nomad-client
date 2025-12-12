import { create } from "zustand";

export type Language = "en" | "tr";

interface Translations {
    [key: string]: {
        en: string;
        tr: string;
    };
}

export const translations: Translations = {
    // Map Legend
    legend_visa_free: { en: "Visa Free", tr: "Vizesiz" },
    legend_visa_on_arrival: { en: "Visa on Arrival / E-Visa", tr: "Kapıda Vize / E-Vize" },
    legend_visa_required: { en: "Visa Required", tr: "Vize Gerekli" },

    // Passport Types
    passport_bordo: { en: "Ordinary Passport (Bordo)", tr: "Umuma Mahsus (Bordo)" },
    passport_yesil: { en: "Special Passport (Yeşil)", tr: "Hususi (Yeşil)" },
    passport_gri: { en: "Service Passport (Gri)", tr: "Hizmet (Gri)" },
    passport_siyah: { en: "Diplomatic Passport (Siyah)", tr: "Diplomatik (Siyah)" },
    passport_default: { en: "Burgundy Passport", tr: "Bordo Pasaport" },

    // Settings Menu
    settings_title: { en: "Settings", tr: "Ayarlar" },
    settings_language: { en: "Language", tr: "Dil" },
    settings_change: { en: "Change", tr: "Değiştir" },
    settings_passport: { en: "User Passport", tr: "Pasaportunuz" },
    settings_map_legend: { en: "Map Legend", tr: "Harita Lejantı" },

    // Country Selection
    country_search_title: { en: "Which country's passport do you have?", tr: "Hangi ülke pasaportuna sahipsiniz?" },
    country_list_header: { en: "Countries", tr: "Ülkeler" },

    // Security Levels (Mapping from TR backend to EN/TR UI)
    security_safe: { en: "Safe", tr: "Güvenli" },
    security_risk: { en: "Risk", tr: "Riskli" },
    security_dangerous: { en: "Dangerous", tr: "Tehlikeli" },
    security_extreme: { en: "Do Not Travel", tr: "Gidilmemeli" },

    // Tooltip
    tooltip_visa_free: { en: "Visa Free", tr: "Vizesiz" },
    tooltip_visa_on_arrival: { en: "Visa on Arrival", tr: "Kapıda Vize" },
    tooltip_evisa: { en: "E-Visa", tr: "E-Vize" },
    tooltip_visa_required: { en: "Visa Required", tr: "Vize Gerekli" },
    tooltip_select_passport: { en: "Select a passport to see visa requirements", tr: "Vize durumunu görmek için pasaport seçin" },

    // General
    search_placeholder: { en: "Search or select a country", tr: "Ülke ara veya seç" },
    loading: { en: "Loading map...", tr: "Harita yükleniyor..." },

    // Tooltip Details
    tooltip_capital: { en: "Capital:", tr: "Başkent:" },
    tooltip_biggest_city: { en: "Best City:", tr: "En İyi Şehir:" },
    tooltip_night_life: { en: "Night Life:", tr: "Gece Hayatı:" },
    tooltip_visit_type: { en: "Visit Type:", tr: "Ziyaret Türü:" },
    tooltip_avg_daily_spend: { en: "Avg Daily Spend:", tr: "Ort. Günlük Harcama:" },
    tooltip_avg_weekly_spend: { en: "Avg Weekly Spend:", tr: "Ort. Haftalık Harcama:" },
    tooltip_best_season: { en: "Best Season:", tr: "En İyi Sezon:" },
    tooltip_country_info: { en: "🌍 Country Information:", tr: "🌍 Ülke Bilgisi:" },
    tooltip_longitude: { en: "Longitude:", tr: "Boylam:" },
    tooltip_latitude: { en: "Latitude:", tr: "Enlem:" },

    // Sidebar & Passport
    step_select_country: { en: "Select Country", tr: "Ülke Seç" },
    step_select_passport: { en: "Select Passport", tr: "Pasaport Seç" },

    // FilterBar
    filter_travel_reason: { en: "Travel Reason", tr: "Seyahat Amacı" },
    filter_budget: { en: "Budget", tr: "Bütçe" },
    filter_security: { en: "Security", tr: "Güvenlik" },
    filter_seasons: { en: "Seasons", tr: "Mevsimler" },
    filter_reset: { en: "Reset", tr: "Sıfırla" },
    filter_close: { en: "Close Filters", tr: "Filtreleri Kapat" },
    filter_filters: { en: "Filters", tr: "Filtreler" },

    // Filter Popups
    filter_budget_title: { en: "Weekly Budget", tr: "Haftalık Bütçe" },

    // Options - Security
    option_very_safe: { en: "Very Safe", tr: "Çok Güvenli" },
    option_generally_safe: { en: "Generally Safe", tr: "Genellikle Güvenli" },
    option_use_caution: { en: "Use Caution", tr: "Dikkatli Olunmalı" },
    option_risky: { en: "Risky", tr: "Riskli" },
    option_do_not_travel: { en: "Do Not Travel", tr: "Gidilmemeli" },

    // Options - Seasons
    season_spring: { en: "Spring", tr: "İlkbahar" },
    season_summer: { en: "Summer", tr: "Yaz" },
    season_autumn: { en: "Autumn", tr: "Sonbahar" },
    season_winter: { en: "Winter", tr: "Kış" },

    // Options - Travel Reason
    reason_tourism: { en: "Tourism", tr: "Turistik" },
    reason_business: { en: "Business", tr: "İş" },
    reason_family: { en: "Family Tour", tr: "Aile Ziyareti" },
    reason_education: { en: "Education", tr: "Eğitim" },
    reason_work: { en: "Work", tr: "Çalışma" },
    reason_transit: { en: "Transit", tr: "Transit" },

    country_selector_loading: { en: "Loading countries...", tr: "Ülkeler yükleniyor..." },
    country_selector_updating: { en: "Updating country list...", tr: "Ülke listesi güncelleniyor..." },

    passport_selector_title: { en: "Select passport for", tr: "Pasaport seçimi:" },
    passport_back: { en: "Back", tr: "Geri" },
    passport_submit: { en: "Submit", tr: "Onayla" },
    passport_loading: { en: "Loading...", tr: "Yükleniyor..." },

    search_placeholder_nomad: { en: "Nomad", tr: "Nomad" },

    coming_soon_title: { en: "Coming Soon", tr: "Çok Yakında" },
    coming_soon_desc: { en: "Only Turkey is supported right now. More countries will be added soon.", tr: "Şu an sadece Türkiye destekleniyor. Diğer ülkeler yakında eklenecek." },
    coming_soon_ok: { en: "OK", tr: "Tamam" },

    loading_world_map: { en: "Loading World Map...", tr: "Dünya Haritası Yükleniyor..." }
};

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

// Helper to determine initial language
const getInitialLanguage = (): Language => {
    // 1. Check local storage first
    const stored = localStorage.getItem("language") as Language | null;
    if (stored) return stored;

    // 2. Check browser language (for first time users)
    if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language || (navigator.languages && navigator.languages[0]);
        if (browserLang && browserLang.toLowerCase().startsWith('tr')) {
            return 'tr';
        }
    }

    // 3. Default to English
    return 'en';
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
    language: getInitialLanguage(),

    setLanguage: (lang) => {
        localStorage.setItem("language", lang);
        set({ language: lang });
    },

    t: (key: string) => {
        const lang = get().language;
        return translations[key]?.[lang] || key;
    },
}));
