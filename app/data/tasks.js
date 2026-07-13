export const tasks = [
  {
    id: 1,
    projectId: 1,
    assignedUserIds: [1, 2],
    createdByUserId: 3,

    title: 'Przygotować ofertę dla klienta',

    description:
      'Przygotować kompletną ofertę dla klienta. Oferta powinna zawierać zakres wykonywanych prac, kosztorys, przewidywany czas realizacji oraz warunki współpracy. Po przygotowaniu dokument należy przesłać klientowi do akceptacji.',

    project: 'Panel rezerwacji Beauty Studio',

    status: 'W trakcie',
    priority: 'Wysoki',

    deadline: '2026-07-18',
    createdAt: '2026-07-10'
  },

  {
    id: 2,
    projectId: 1,
    assignedUserIds: [2],
    createdByUserId: 3,

    title: 'Poprawić formularz kontaktowy',

    description:
      'Sprawdzić działanie formularza kontaktowego oraz poprawić walidację pól. Formularz powinien wyświetlać czytelne komunikaty błędów, blokować wysłanie niepoprawnych danych i potwierdzać prawidłowe wysłanie wiadomości.',

    project: 'Panel rezerwacji Beauty Studio',

    status: 'Do zrobienia',
    priority: 'Średni',

    deadline: '2026-07-21',
    createdAt: '2026-07-11'
  },

  {
    id: 3,
    projectId: 2,
    assignedUserIds: [1],
    createdByUserId: 3,

    title: 'Wysłać projekt graficzny',

    description:
      'Przygotować najnowszą wersję projektu graficznego strony internetowej kawiarni. Przed wysłaniem należy sprawdzić układ strony głównej, wersję mobilną, kolory, czcionki oraz poprawność materiałów przekazanych przez klienta.',

    project: 'Nowa strona dla kawiarni Mokka',

    status: 'Zakończone',
    priority: 'Wysoki',

    deadline: '2026-07-16',
    createdAt: '2026-07-09'
  },

  {
    id: 4,
    projectId: 3,
    assignedUserIds: [1, 2],
    createdByUserId: 3,

    title: 'Programowanie backendu',

    description:
      'Przygotować podstawową obsługę danych sklepu internetowego. Backend powinien umożliwiać pobieranie produktów, dodawanie nowych produktów, aktualizowanie danych oraz usuwanie produktów. Należy również przygotować obsługę podstawowych błędów.',

    project: 'Sklep online Green Planet',

    status: 'W trakcie',
    priority: 'Średni',

    deadline: '2026-07-30',
    createdAt: '2026-07-08'
  },

  {
    id: 5,
    projectId: 3,
    assignedUserIds: [2],
    createdByUserId: 3,

    title: 'Przygotować widok koszyka',

    description:
      'Stworzyć widok koszyka zakupowego. Użytkownik powinien mieć możliwość zwiększania i zmniejszania liczby produktów, usuwania produktów z koszyka oraz sprawdzenia łącznej wartości zamówienia.',

    project: 'Sklep online Green Planet',

    status: 'Do zrobienia',
    priority: 'Wysoki',

    deadline: '2026-07-25',
    createdAt: '2026-07-12'
  },

  {
    id: 6,
    projectId: 2,
    assignedUserIds: [1, 2],
    createdByUserId: 3,

    title: 'Dostosować stronę do telefonów',

    description:
      'Sprawdzić wygląd wszystkich podstron na telefonach i tabletach. Poprawić szerokości elementów, wielkość tekstów, menu nawigacyjne oraz rozmieszczenie zdjęć. Strona nie powinna posiadać poziomego przewijania.',

    project: 'Nowa strona dla kawiarni Mokka',

    status: 'Do zrobienia',
    priority: 'Niski',

    deadline: '2026-07-28',
    createdAt: '2026-07-12'
  }
]