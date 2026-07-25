import { useSelector } from "react-redux"

const translations = {

    de: {

        Logout: "Logout",
        EditProfile: "Profil bearbeiten",
        Contact: "Kontaktieren",
        Delete: "Löschen",
        Report: "Anzeige melden",
        Favorites: "Merken",
        Saved: "Gespeichert",
        Profile:'Profil',
        MeineAnzeigen:'Meine Anzeigen',
        Merklist: 'Merklist',
        Nachrichten:'Nachrichten',
        AnmeldungErforderlich: 'Anmeldung erforderlich',
        Schliessen: 'Schließen',

    },

    ru: {

        Logout: "Выйти",
        EditProfile: "Редактировать профиль",
        Contact: "Связаться",
        Delete: "Удалить",
        Report: "Пожаловаться",
        Favorites: "В избранное",
        Saved: "Сохранено",
        Profile:'Профиль',
        MeineAnzeigen:'Мои Объявления',
        Merklist: 'Избранное',
        Nachrichten: 'Сообщения',
        AnmeldungErforderlich: 'Авторизация прошла успешно',
        Schliessen: 'Закрыть',

    },

    uk: {
        Logout: "Вийти",
        EditProfile: "Редагувати профіль",
        Contact: "Написати повідомлення",
        Delete: "Видалити",
        Report: "Поскаржитись",
        Favorites: "У вибране",
        Saved: "Збережено",
        Profile:'Профіль',
        MeineAnzeigen:'Мої оголошення',
        Merklist: 'Обране',
        Nachrichten: 'Повідомлення',
        AnmeldungErforderlich: 'Авторизація пройшла успішно',
        Schliessen: 'Закрити',
    },

    tr: {
        Logout: "Çıkış",
        EditProfile: "Profili düzenle",
        Contact: "bir mesaj yaz",
        Delete: "Silmek",
        Report: "Şikayet etmek",
        Favorites: "Favorilere ekle",
        Saved: "Kaydedildi",
        Profile:'Profil',
        MeineAnzeigen:'Reklamlarım',
        Merklist: 'Favoriler',
        Nachrichten: 'Mesajlar',
        AnmeldungErforderlich: 'Yetkilendirme başarılı oldu.',
        Schliessen: 'Kapalı',
    }

}

export function useTranslation() {

    const lan =
        useSelector(state => state.user.lan) || "de"

    function t(key) {

        return translations[lan]?.[key] ?? key

    }

    return { t }

}