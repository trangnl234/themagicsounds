export interface DecodableWordToken {
  type: 'decodable' | 'tricky';
  text: string;
  letters: string[];
  leadingPunct?: string;
  trailingPunct?: string;
}

export interface DecodableStoryLine {
  sentence: string;
  tokens: DecodableWordToken[];
}

export interface DecodableBookPage {
  pageNumber: number;
  lines: DecodableStoryLine[];
  captionVi?: string;
}

export interface DecodablePracticePage {
  sounds: string[];
  blendingWords: string[];
  trickyWords: string[];
  blendingExamples?: string;
  vocabulary?: { word: string; definition: string }[];
  discussionQuestions?: string[];
}

export interface DecodableBook {
  id: number;
  group: number;
  bookNumber: number;
  title: string;
  synopsis: string;
  wordCount: number;
  illustration: string;
  illustrationAlt: string;
  captionVi: string;
  targetWords: { word: string; isTricky?: boolean }[];
  lines: DecodableStoryLine[];
  diamonds: number;
  // Flipbook fields for Level Advance (SPELD SA Phonic Book Series)
  flipbookId?: string;
  stars?: number;
  author?: string;
  practicePage?: DecodablePracticePage;
  pages?: DecodableBookPage[];
  fluencyChart?: string[];
}

export const DECODABLE_BOOKS_DATA: Record<number, DecodableBook[]> = {
  1: [
    {
      id: 1,
      group: 1,
      bookNumber: 1,
      title: 'Pat and the Ant',
      synopsis: 'Chú kiến nhỏ và bạn Pat',
      wordCount: 24,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida/AEtjO1XehgFHbEcVoK107cFqX5AbBSoE3QctcZuS7ODggsWzT75Rha6EgwjdYj3M1S0ssAEUDPPK5OcYJApfrmpnz_zYi4mnU7ypZt00455cyzH2nn4m1kcRwFKPdBsxUJNnlGg3wofwJGIdqHXd09iyzhDYx5Q6HGZu92IMSJ9ZCNVEQew86nP8lathP2hEfFFOaGFQlt-f_25FRNeHmWS94xXHDP3LKoQF7SmePHRWYgMppaBwVL_OcFVX',
      illustrationAlt: 'Pat meets a tiny ant on the path',
      captionVi: 'Hình ảnh minh họa: Chú kiến nhỏ bò vui tươi cùng bạn Pat',
      targetWords: [
        { word: 'Pat' }, { word: 'ant' }, { word: 'sat' }, { word: 'on' }, { word: 'the', isTricky: true }, { word: 'a', isTricky: true }
      ],
      lines: [
        {
          sentence: 'An ant sat.',
          tokens: [
            { type: 'decodable', text: 'An', letters: ['A', 'n'] },
            { type: 'decodable', text: 'ant', letters: ['a', 'n', 't'] },
            { type: 'decodable', text: 'sat', letters: ['s', 'a', 't'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Pat sat on a mat.',
          tokens: [
            { type: 'decodable', text: 'Pat', letters: ['P', 'a', 't'] },
            { type: 'decodable', text: 'sat', letters: ['s', 'a', 't'] },
            { type: 'decodable', text: 'on', letters: ['o', 'n'] },
            { type: 'tricky', text: 'a', letters: ['a'] },
            { type: 'decodable', text: 'mat', letters: ['m', 'a', 't'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'The ant sat on Pat.',
          tokens: [
            { type: 'tricky', text: 'The', letters: ['T', 'h', 'e'] },
            { type: 'decodable', text: 'ant', letters: ['a', 'n', 't'] },
            { type: 'decodable', text: 'sat', letters: ['s', 'a', 't'] },
            { type: 'decodable', text: 'on', letters: ['o', 'n'] },
            { type: 'decodable', text: 'Pat', letters: ['P', 'a', 't'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Pat pats the ant.',
          tokens: [
            { type: 'decodable', text: 'Pat', letters: ['P', 'a', 't'] },
            { type: 'decodable', text: 'pats', letters: ['p', 'a', 't', 's'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'ant', letters: ['a', 'n', 't'], trailingPunct: '.' }
          ]
        }
      ]
    },
    {
      id: 2,
      group: 1,
      bookNumber: 2,
      title: 'In the Pit',
      synopsis: 'Bạn cún ngã vào hố cát',
      wordCount: 28,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida/AEtjO1Xc3DT_CmlT7aJ8rkoUK-EZ5Cg9nCHI4lrCWx-rkKBxuZE64zFeOPefHZyPPeAmEc0HzAdHI5TZ8CWyWTu3zIw2E_j7T0CEnvtLPiDqriQcSzAr-Ttv2V6wSHHhDhwhuMisKUcxlKpkgRyAWurPr31AVYe47NiS0xSMvERG8qKwCv0UztKR4aWWb7KGHUzLbChr9Hp5fGvHnXASD9V5WSGmZuuhvN2GKx0SCDzTNlIlCHlJWqvrCQwhQg',
      illustrationAlt: 'Puppy playing near a sandy pit',
      captionVi: 'Hình ảnh minh họa: Bạn cún vui đùa quanh hố cát nhỏ',
      targetWords: [
        { word: 'pit' }, { word: 'in' }, { word: 'Pip' }, { word: 'sit' }, { word: 'the', isTricky: true }, { word: 'is' }
      ],
      lines: [
        {
          sentence: 'Pip is in a pit.',
          tokens: [
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'] },
            { type: 'decodable', text: 'is', letters: ['i', 's'] },
            { type: 'decodable', text: 'in', letters: ['i', 'n'] },
            { type: 'tricky', text: 'a', letters: ['a'] },
            { type: 'decodable', text: 'pit', letters: ['p', 'i', 't'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Pip sat in the pit.',
          tokens: [
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'] },
            { type: 'decodable', text: 'sat', letters: ['s', 'a', 't'] },
            { type: 'decodable', text: 'in', letters: ['i', 'n'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'pit', letters: ['p', 'i', 't'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Pat tap, taps Pip.',
          tokens: [
            { type: 'decodable', text: 'Pat', letters: ['P', 'a', 't'] },
            { type: 'decodable', text: 'tap', letters: ['t', 'a', 'p'], trailingPunct: ',' },
            { type: 'decodable', text: 'taps', letters: ['t', 'a', 'p', 's'] },
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'], trailingPunct: '.' }
          ]
        }
      ]
    },
    {
      id: 3,
      group: 1,
      bookNumber: 3,
      title: 'A Tin Pan',
      synopsis: 'Chiếc chảo thiếc gõ rộn ràng',
      wordCount: 26,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida/AEtjO1XzJNX_p4h7AyT3HL5N62EztKNIkBp580uXVoa7Gk0GL3Navl8wBW61TLi-K5s8Mazq1QKbJDIhpP-_Wmlx3ftBz8O0-PBGWgYiZzA41AvXOnv2p0XhezsvbCDNNNByX7NL3-YHSILHBhpIM2VIuYMXzbaj-Hy1VIqD1l8g8HFwYxd9nMLkInioDIMRNzGTMK29APXQ8L4mZxxQmaS0Q_qSWcR8po8s2wqBhrFFdmzm8Uahy92XmNZRfQ',
      illustrationAlt: 'A shining tin pan making cheerful sounds',
      captionVi: 'Hình ảnh minh họa: Chiếc chảo thiếc phát ra âm thanh vui tai',
      targetWords: [
        { word: 'tin' }, { word: 'pan' }, { word: 'pin' }, { word: 'tap' }, { word: 'a', isTricky: true }
      ],
      lines: [
        {
          sentence: 'A tin pan is on a mat.',
          tokens: [
            { type: 'tricky', text: 'A', letters: ['A'] },
            { type: 'decodable', text: 'tin', letters: ['t', 'i', 'n'] },
            { type: 'decodable', text: 'pan', letters: ['p', 'a', 'n'] },
            { type: 'decodable', text: 'is', letters: ['i', 's'] },
            { type: 'decodable', text: 'on', letters: ['o', 'n'] },
            { type: 'tricky', text: 'a', letters: ['a'] },
            { type: 'decodable', text: 'mat', letters: ['m', 'a', 't'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Pip taps on the tin pan.',
          tokens: [
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'] },
            { type: 'decodable', text: 'taps', letters: ['t', 'a', 'p', 's'] },
            { type: 'decodable', text: 'on', letters: ['o', 'n'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'tin', letters: ['t', 'i', 'n'] },
            { type: 'decodable', text: 'pan', letters: ['p', 'a', 'n'], trailingPunct: '.' }
          ]
        }
      ]
    },
    {
      id: 4,
      group: 1,
      bookNumber: 4,
      title: 'Sit, Pip!',
      synopsis: 'Lệnh chú cún nhỏ Pip ngồi yên',
      wordCount: 30,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida/AEtjO1XjqaNcNkgANcY8ljVZPw0_WfJePfzC3GOpWi7hWmu0MoV7MnJcq7W6Zkuz02g6qpQCNTD9xM7a-j8KZ-AKQh32fHBl_wustGx6ilznRoPHdMocg1zcl6dQIJj4vVCzu3i-xkmNuTlJCUG-CzgstfzHu118MG_TMq6by_V5ev_iWlgcjWyODrzB-iqnEY8kyHpKN209ZrR4c5b6-4LBEr2w5Di-h3Qn1Jv7Bq9nm0yp6dAwOUn2GBERcg',
      illustrationAlt: 'Little puppy sitting quietly',
      captionVi: 'Hình ảnh minh họa: Lệnh chú cún nhỏ Pip ngồi ngoan ngoãn',
      targetWords: [
        { word: 'Sit' }, { word: 'Pip' }, { word: 'Pat' }, { word: 'it' }
      ],
      lines: [
        {
          sentence: 'Pip, sit in the pan!',
          tokens: [
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'], trailingPunct: ',' },
            { type: 'decodable', text: 'sit', letters: ['s', 'i', 't'] },
            { type: 'decodable', text: 'in', letters: ['i', 'n'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'pan', letters: ['p', 'a', 'n'], trailingPunct: '!' }
          ]
        },
        {
          sentence: 'No, Pip, sit on the mat.',
          tokens: [
            { type: 'tricky', text: 'No', letters: ['N', 'o'], trailingPunct: ',' },
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'], trailingPunct: ',' },
            { type: 'decodable', text: 'sit', letters: ['s', 'i', 't'] },
            { type: 'decodable', text: 'on', letters: ['o', 'n'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'mat', letters: ['m', 'a', 't'], trailingPunct: '.' }
          ]
        }
      ]
    },
    {
      id: 5,
      group: 1,
      bookNumber: 5,
      title: 'An Ant on a Mat',
      synopsis: 'Con kiến bò trên tấm thảm',
      wordCount: 32,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida/AEtjO1WpB7uYPNKiAlgPBYLtbfEQWGyWFNuLfhNz7F1scvlWiqP2gD-Ifi0bk93BQOoN4ueUotDLMv0Hvx332-7eqLmMTXWaVboFRjx2eNrBzfRmoEEa_86k60v2FmcO5BRdiKXQdot81CMfJD4DzMZTKVAxldTG_AnG3WIA6PJ0-fIVaR70c-bP_836gNet4e9e2C_Yy83M0SP0Slhwb2hvltRf4l8nzyyfgy00aMIMxLbpqaYgQ2MCZWBMHg',
      illustrationAlt: 'Ant crawling across a patterned mat',
      captionVi: 'Hình ảnh minh họa: Con kiến bò chậm rãi trên tấm thảm',
      targetWords: [
        { word: 'ant' }, { word: 'mat' }, { word: 'sat' }, { word: 'tip' }, { word: 'the', isTricky: true }
      ],
      lines: [
        {
          sentence: 'An ant sat on a mat.',
          tokens: [
            { type: 'decodable', text: 'An', letters: ['A', 'n'] },
            { type: 'decodable', text: 'ant', letters: ['a', 'n', 't'] },
            { type: 'decodable', text: 'sat', letters: ['s', 'a', 't'] },
            { type: 'decodable', text: 'on', letters: ['o', 'n'] },
            { type: 'tricky', text: 'a', letters: ['a'] },
            { type: 'decodable', text: 'mat', letters: ['m', 'a', 't'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Pat taps the ant.',
          tokens: [
            { type: 'decodable', text: 'Pat', letters: ['P', 'a', 't'] },
            { type: 'decodable', text: 'taps', letters: ['t', 'a', 'p', 's'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'ant', letters: ['a', 'n', 't'], trailingPunct: '.' }
          ]
        }
      ]
    },
    {
      id: 6,
      group: 1,
      bookNumber: 6,
      title: 'Tap, Tap, Tap!',
      synopsis: 'Tiếng gõ lách cách vui tai',
      wordCount: 29,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaQ-GnQpb6ENV0WVpv8LYrKgi8UYvL5GR-xGbRMlfsYEyywqCZauABF5e2ufkAKE-8C7VnSHmrJAShqfbTbDC8YEVFUnRPwocobG-JzsNLZISDTVGwIpsoI0phy9icT8WdwbtpYYEm7NBFcqSfplcZvc4TXBjOGEGi3iWZt6o3Ydl1Kuct-DEs3gcwJePlcBEx8N84WOOurzZv7SQ_x7H0UKXaxQ-eLp7roFdpn2zllbBpHPelgeU',
      illustrationAlt: 'Charming watercolor storybook illustration of a cheerful child tapping playfully',
      captionVi: 'Hình ảnh minh họa: Tiếng gõ lách cách vui nhộn "Tap, Tap, Tap!" của bé',
      targetWords: [
        { word: 'Tap' }, { word: 'tap' }, { word: 'pat' }, { word: 'tip' }, { word: 'pit' }, { word: 'pan' }, { word: 'the', isTricky: true }, { word: 'a', isTricky: true }
      ],
      lines: [
        {
          sentence: 'Tap, tap, tap!',
          tokens: [
            { type: 'decodable', text: 'Tap', letters: ['T', 'a', 'p'], trailingPunct: ',' },
            { type: 'decodable', text: 'tap', letters: ['t', 'a', 'p'], trailingPunct: ',' },
            { type: 'decodable', text: 'tap', letters: ['t', 'a', 'p'], trailingPunct: '!' }
          ]
        },
        {
          sentence: 'Pat can tap.',
          tokens: [
            { type: 'decodable', text: 'Pat', letters: ['P', 'a', 't'] },
            { type: 'decodable', text: 'can', letters: ['c', 'a', 'n'] },
            { type: 'decodable', text: 'tap', letters: ['t', 'a', 'p'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Pip can tap a pan.',
          tokens: [
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'] },
            { type: 'decodable', text: 'can', letters: ['c', 'a', 'n'] },
            { type: 'decodable', text: 'tap', letters: ['t', 'a', 'p'] },
            { type: 'tricky', text: 'a', letters: ['a'] },
            { type: 'decodable', text: 'pan', letters: ['p', 'a', 'n'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Tap the pan, Pip!',
          tokens: [
            { type: 'decodable', text: 'Tap', letters: ['T', 'a', 'p'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'pan', letters: ['p', 'a', 'n'], trailingPunct: ',' },
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'], trailingPunct: '!' }
          ]
        },
        {
          sentence: 'Pat and Pip tap, tap, tap on the mat.',
          tokens: [
            { type: 'decodable', text: 'Pat', letters: ['P', 'a', 't'] },
            { type: 'decodable', text: 'and', letters: ['a', 'n', 'd'] },
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'] },
            { type: 'decodable', text: 'tap', letters: ['t', 'a', 'p'], trailingPunct: ',' },
            { type: 'decodable', text: 'tap', letters: ['t', 'a', 'p'], trailingPunct: ',' },
            { type: 'decodable', text: 'tap', letters: ['t', 'a', 'p'] },
            { type: 'decodable', text: 'on', letters: ['o', 'n'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'mat', letters: ['m', 'a', 't'], trailingPunct: '.' }
          ]
        }
      ]
    },
    {
      id: 7,
      group: 1,
      bookNumber: 7,
      title: 'Tin Men',
      synopsis: 'Người thiếc ngộ nghĩnh',
      wordCount: 35,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhHsS_MT7X3ipqKSZGnjNh_xZtJH65oM0SCVaqEHgpTXYhciMr4Vic60DZIYD3fcHuKrGJ-gGLep0RZMhSK8z59o1vMj_LTfotIOISC75AYpu9sujTi4WyMCkgNNXHO-f4-4LgO-YETOlVWEAbap5Ul26_4ZPjN6VSqpw_kEJpMKQbONGqN6_epnnZT52pG1yJE4L3diJKmYrMAMAQqmSG99CgQEC88UmzJhqBL81AXD7qFrkfKg4',
      illustrationAlt: 'Toy tin men standing in a line',
      captionVi: 'Hình ảnh minh họa: Những chú người thiếc đồ chơi ngộ nghĩnh',
      targetWords: [
        { word: 'tin' }, { word: 'men' }, { word: 'sit' }, { word: 'tap' }, { word: 'the', isTricky: true }
      ],
      lines: [
        {
          sentence: 'Ten tin men sit.',
          tokens: [
            { type: 'decodable', text: 'Ten', letters: ['T', 'e', 'n'] },
            { type: 'decodable', text: 'tin', letters: ['t', 'i', 'n'] },
            { type: 'decodable', text: 'men', letters: ['m', 'e', 'n'] },
            { type: 'decodable', text: 'sit', letters: ['s', 'i', 't'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'A tin man has a pan.',
          tokens: [
            { type: 'tricky', text: 'A', letters: ['A'] },
            { type: 'decodable', text: 'tin', letters: ['t', 'i', 'n'] },
            { type: 'decodable', text: 'man', letters: ['m', 'a', 'n'] },
            { type: 'decodable', text: 'has', letters: ['h', 'a', 's'] },
            { type: 'tricky', text: 'a', letters: ['a'] },
            { type: 'decodable', text: 'pan', letters: ['p', 'a', 'n'], trailingPunct: '.' }
          ]
        }
      ]
    },
    {
      id: 8,
      group: 1,
      bookNumber: 8,
      title: 'Pip and Pop',
      synopsis: 'Đôi bạn cún nhỏ đùa vui',
      wordCount: 38,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH-RxuLSsOu8Ark1p66w5HP21uPHw50c1U1no-GvOWku6geps-DYO0q3n_vdOywG1aHRB-fnNaTAVhSCw6HuzfH_EqIYeiJhqTQuGucX4CybSYjt6dJqUrgZo7_zqMyyH2usoOWQk8QN968Oosxj07oTUZG76DWo3Jbk2DkUqQT9vjH_atxGV_LNpgzQr-8bUmgPFN1TcSQiQxTOU64UrhM95zMQo9ndqqg-gkGjaNRmmKBkGC7Ng',
      illustrationAlt: 'Two happy puppies playing with a red ball',
      captionVi: 'Hình ảnh minh họa: Đôi bạn cún nhỏ Pip và Pop vui đùa rộn rã',
      targetWords: [
        { word: 'Pip' }, { word: 'Pop' }, { word: 'pit' }, { word: 'pot' }, { word: 'and' }
      ],
      lines: [
        {
          sentence: 'Pip and Pop run.',
          tokens: [
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'] },
            { type: 'decodable', text: 'and', letters: ['a', 'n', 'd'] },
            { type: 'decodable', text: 'Pop', letters: ['P', 'o', 'p'] },
            { type: 'decodable', text: 'run', letters: ['r', 'u', 'n'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Pip sat on Pop.',
          tokens: [
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'] },
            { type: 'decodable', text: 'sat', letters: ['s', 'a', 't'] },
            { type: 'decodable', text: 'on', letters: ['o', 'n'] },
            { type: 'decodable', text: 'Pop', letters: ['P', 'o', 'p'], trailingPunct: '.' }
          ]
        }
      ]
    },
    {
      id: 9,
      group: 1,
      bookNumber: 9,
      title: 'A Pin in a Pan',
      synopsis: 'Chiếc ghim nhỏ trong chảo thiếc',
      wordCount: 40,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9kMX8jjfd_TPm051gBGv6fsnvMNEd8DDfFb14KWo01G5i1714MV2HdchtUX45mTDQAdU7DVzYMtdyjsbm2s-yemrk-6XoZlQwYZ-_mAmMeO98R1AbrQAbVJa8fz5HuGGhbdjSSvymEGJOc-lM1sZfU0fzY-QgFLkW_mYVZRw3Zw_DA9PT0oGiiOHb4CH9kbcqfZ-dpzgXfBnsL_ytR4B0bp6BO7SnxIbq4LizOtL6HIRSI0g7UMU',
      illustrationAlt: 'A shining pin resting inside an empty pan',
      captionVi: 'Hình ảnh minh họa: Chiếc ghim an toàn nhỏ nằm trong lòng chảo',
      targetWords: [
        { word: 'pin' }, { word: 'pan' }, { word: 'tin' }, { word: 'tip' }, { word: 'is' }
      ],
      lines: [
        {
          sentence: 'A pin is in a pan.',
          tokens: [
            { type: 'tricky', text: 'A', letters: ['A'] },
            { type: 'decodable', text: 'pin', letters: ['p', 'i', 'n'] },
            { type: 'decodable', text: 'is', letters: ['i', 's'] },
            { type: 'decodable', text: 'in', letters: ['i', 'n'] },
            { type: 'tricky', text: 'a', letters: ['a'] },
            { type: 'decodable', text: 'pan', letters: ['p', 'a', 'n'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Tip the pan to get the pin.',
          tokens: [
            { type: 'decodable', text: 'Tip', letters: ['T', 'i', 'p'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'pan', letters: ['p', 'a', 'n'] },
            { type: 'tricky', text: 'to', letters: ['t', 'o'] },
            { type: 'decodable', text: 'get', letters: ['g', 'e', 't'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'pin', letters: ['p', 'i', 'n'], trailingPunct: '.' }
          ]
        }
      ]
    },
    {
      id: 10,
      group: 1,
      bookNumber: 10,
      title: 'The Big Mat',
      synopsis: 'Buổi dã ngoại trên chiếc thảm to',
      wordCount: 48,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaQ-GnQpb6ENV0WVpv8LYrKgi8UYvL5GR-xGbRMlfsYEyywqCZauABF5e2ufkAKE-8C7VnSHmrJAShqfbTbDC8YEVFUnRPwocobG-JzsNLZISDTVGwIpsoI0phy9icT8WdwbtpYYEm7NBFcqSfplcZvc4TXBjOGEGi3iWZt6o3Ydl1Kuct-DEs3gcwJePlcBEx8N84WOOurzZv7SQ_x7H0UKXaxQ-eLp7roFdpn2zllbBpHPelgeU',
      illustrationAlt: 'Children sitting on a big colorful mat in the sun',
      captionVi: 'Hình ảnh minh họa: Các bạn nhỏ tụ tập ngồi quanh tấm thảm to',
      targetWords: [
        { word: 'big' }, { word: 'mat' }, { word: 'sit' }, { word: 'sun' }, { word: 'the', isTricky: true }, { word: 'all', isTricky: true }
      ],
      lines: [
        {
          sentence: 'A big mat is in the sun.',
          tokens: [
            { type: 'tricky', text: 'A', letters: ['A'] },
            { type: 'decodable', text: 'big', letters: ['b', 'i', 'g'] },
            { type: 'decodable', text: 'mat', letters: ['m', 'a', 't'] },
            { type: 'decodable', text: 'is', letters: ['i', 's'] },
            { type: 'decodable', text: 'in', letters: ['i', 'n'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'sun', letters: ['s', 'u', 'n'], trailingPunct: '.' }
          ]
        },
        {
          sentence: 'Pat, Pip and the ant all sit on the mat.',
          tokens: [
            { type: 'decodable', text: 'Pat', letters: ['P', 'a', 't'], trailingPunct: ',' },
            { type: 'decodable', text: 'Pip', letters: ['P', 'i', 'p'] },
            { type: 'decodable', text: 'and', letters: ['a', 'n', 'd'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'ant', letters: ['a', 'n', 't'] },
            { type: 'tricky', text: 'all', letters: ['a', 'l', 'l'] },
            { type: 'decodable', text: 'sit', letters: ['s', 'i', 't'] },
            { type: 'decodable', text: 'on', letters: ['o', 'n'] },
            { type: 'tricky', text: 'the', letters: ['t', 'h', 'e'] },
            { type: 'decodable', text: 'mat', letters: ['m', 'a', 't'], trailingPunct: '.' }
          ]
        }
      ]
    }
  ]
};

// Populate Groups 2 to 7 with 10 books each
const GROUP_TEMPLATES: Record<number, { title: string; synopsis: string; target: string[]; text: string[] }[]> = {
  2: [
    { title: 'The Red Hen', synopsis: 'Chú gà mái đỏ trong sân', target: ['hen', 'red', 'egg', 'peck'], text: ['A red hen sat on a nest.', 'The hen has an egg.', 'Pip fed the red hen.'] },
    { title: 'A Dog in the Mud', synopsis: 'Chú cún nghịch bùn đất', target: ['dog', 'mud', 'dig', 'run'], text: ['A dog dug in the mud.', 'Dad had a rag for the dog.', 'The dog is clean now.'] },
    { title: 'The Hot Pot', synopsis: 'Nồi súp nóng hổi của mẹ', target: ['pot', 'hot', 'cup', 'lid'], text: ['Mum had a hot pot.', 'Do not touch the hot pot.', 'Mum had tea in a cup.'] },
    { title: 'Kit and the Cat', synopsis: 'Bạn Kit và chú mèo mướp', target: ['Kit', 'cat', 'hat', 'mat'], text: ['Kit has a pet cat.', 'The cat sat on a red hat.', 'Kit patted the cat.'] },
    { title: 'A Big Drum', synopsis: 'Tiếng trống thùng thình rộn rã', target: ['drum', 'tap', 'kid', 'hit'], text: ['Dad got a big drum.', 'Tap, tap, the drum went bang!', 'The kids danced to the drum.'] },
    { title: 'Run to the Hill', synopsis: 'Cuộc chạy đua lên đỉnh đồi', target: ['run', 'hill', 'top', 'hop'], text: ['Can we run up the hill?', 'We ran and we hopped.', 'We got to the top!'] },
    { title: 'The Pet Rat', synopsis: 'Chú chuột hamster thông minh', target: ['rat', 'pet', 'hid', 'nut'], text: ['Rob has a pet rat.', 'The rat hid in a hut.', 'The rat had a nut.'] },
    { title: 'Dad and His Hat', synopsis: 'Chiếc mũ bay trong gió của bố', target: ['Dad', 'hat', 'wind', 'got'], text: ['Dad has a big brown hat.', 'The wind blew the hat off.', 'Dan got the hat back.'] },
    { title: 'Ten Red Pens', synopsis: 'Hộp bút màu đỏ xinh xắn', target: ['ten', 'red', 'pen', 'box'], text: ['Ben has ten red pens.', 'Ben kept the pens in a tin.', 'He drew a red cat.'] },
    { title: 'Mud on the Rug', synopsis: 'Vết bùn lấm lem trên thảm', target: ['mud', 'rug', 'mop', 'wet'], text: ['Mud got on the soft rug.', 'Mum got a wet mop.', 'Mum made the rug clean.'] }
  ],
  3: [
    { title: 'A Big Fat Frog', synopsis: 'Chú ếch xanh béo nhảy nhót', target: ['frog', 'big', 'log', 'pond'], text: ['A big green frog sat on a log.', 'The frog jumped in the pond.', 'Ribbit, ribbit, sang the frog.'] },
    { title: 'The Red Bus', synopsis: 'Chuyến xe buýt đỏ vòng quanh', target: ['bus', 'red', 'stop', 'go'], text: ['A big red bus ran down the hill.', 'The bus stopped at the shop.', 'Hop on the bus with us!'] },
    { title: 'Up in the Sun', synopsis: 'Ngày nắng đẹp trên bãi cỏ', target: ['sun', 'hot', 'fun', 'run'], text: ['The sun is up and bright.', 'We run and have lots of fun.', 'The dog sat in the sun.'] },
    { title: 'A Lost Bat', synopsis: 'Chiếc gậy bóng chày thất lạc', target: ['bat', 'lost', 'box', 'hit'], text: ['Bob lost his baseball bat.', 'He looked in the big box.', 'He found the bat by the bed.'] },
    { title: 'Fix the Fan', synopsis: 'Chiếc quạt mát mùa hè', target: ['fan', 'fix', 'cool', 'hum'], text: ['The room was warm and hot.', 'Dad fixed the cool fan.', 'The fan went hum in the room.'] },
    { title: 'A Gift for Ben', synopsis: 'Hộp quà bí mật tặng bạn', target: ['gift', 'box', 'ribbon', 'glad'], text: ['Mum has a gift in a box.', 'The gift is for little Ben.', 'Ben was very glad to see it.'] },
    { title: 'Fog on the Bog', synopsis: 'Làn sương mờ trên đồng lúa', target: ['fog', 'bog', 'dim', 'sun'], text: ['Thick fog fell on the bog.', 'The path was dim and grey.', 'Soon the warm sun came out.'] },
    { title: 'The Bug on a Rug', synopsis: 'Chú bọ rùa cánh cam xinh xắn', target: ['bug', 'rug', 'snug', 'hug'], text: ['A cute bug sat on the rug.', 'The bug was cozy and snug.', 'I gave my pet a gentle hug.'] },
    { title: 'A Cup of Milk', synopsis: 'Ly sữa ấm trước giờ đi ngủ', target: ['cup', 'milk', 'sip', 'bed'], text: ['Mum poured milk in a cup.', 'Take a slow warm sip.', 'Now hop into bed and sleep.'] },
    { title: 'Off to Camp', synopsis: 'Chuyến cắm trại hè rộn ràng', target: ['camp', 'tent', 'lamp', 'sing'], text: ['We set up a green tent.', 'We lit a bright camp lamp.', 'We sang songs under the stars.'] }
  ],
  4: [
    { title: 'The Rainy Train', synopsis: 'Chuyến tàu hoả chạy trong mưa', target: ['rain', 'train', 'track', 'wait'], text: ['The train ran in the heavy rain.', 'We wait on the long track.', 'Choo-choo, went the happy train.'] },
    { title: 'A Sweet Peach', synopsis: 'Quả đào thơm ngọt trên cành', target: ['peach', 'sweet', 'tree', 'eat'], text: ['A sweet peach hung on a tree.', 'We reached up high to pick it.', 'It tasted fresh and sweet.'] },
    { title: 'A Goat in a Boat', synopsis: 'Chú dê chèo thuyền trên sông', target: ['goat', 'boat', 'float', 'row'], text: ['A white goat got in a wooden boat.', 'The boat floated down the blue stream.', 'The goat had an oat snack.'] },
    { title: 'The Green Tree', synopsis: 'Cây sồi xanh rợp bóng mát', target: ['tree', 'green', 'leaf', 'deep'], text: ['The green tree stood tall and wide.', 'Birds sang in the green leaves.', 'We rested in its cool shade.'] },
    { title: 'A Pie in the Sky', synopsis: 'Bánh táo nướng thơm lừng', target: ['pie', 'bake', 'sweet', 'hot'], text: ['Granny baked a warm fruit pie.', 'The pie smelled so rich and sweet.', 'We ate a slice with tea.'] },
    { title: 'A Storm at the Port', synopsis: 'Cơn bão biển tại bến cảng', target: ['storm', 'port', 'wind', 'safe'], text: ['A dark storm blew at the port.', 'Big ships tied up at the dock.', 'All were safe inside the port.'] },
    { title: 'Jelly on a Plate', synopsis: 'Đĩa thạch rung rinh nhiều màu', target: ['jelly', 'plate', 'red', 'wiggle'], text: ['Red jelly sat upon the plate.', 'It wiggled and wobbled when touched.', 'We ate it with a small spoon.'] },
    { title: 'The King and Queen', synopsis: 'Vua và hoàng hậu trong lâu đài', target: ['king', 'queen', 'crown', 'hall'], text: ['The king sat on a gold throne.', 'The queen wore a shiny crown.', 'They ruled the land with joy.'] },
    { title: 'Sheep in the Deep', synopsis: 'Đàn cừu trên đồng cỏ xanh', target: ['sheep', 'deep', 'grass', 'sleep'], text: ['White sheep grazed in deep grass.', 'When night came they lay down.', 'The little sheep fell fast asleep.'] },
    { title: 'Sail to the Shore', synopsis: 'Chèo thuyền cập bờ cát trắng', target: ['sail', 'shore', 'sand', 'wave'], text: ['We sail across the gentle bay.', 'The boat touches the golden shore.', 'We run and play on the sand.'] }
  ],
  5: [
    { title: 'Buzzing Bees', synopsis: 'Đàn ong chăm chỉ tìm mật', target: ['bee', 'buzz', 'flower', 'zoom'], text: ['Busy bees zoom past the flowers.', 'They buzz and gather sweet nectar.', 'The queen bee waits in the hive.'] },
    { title: 'The North Wind', synopsis: 'Gió bấc thổi lá vàng bay', target: ['wind', 'blow', 'cold', 'leaf'], text: ['The chilly wind blows through the trees.', 'Leaves swirl around in the air.', 'Wrap up warm in your coat.'] },
    { title: 'Sing a Song', synopsis: 'Bài hát rộn rã đón ngày mới', target: ['sing', 'song', 'ring', 'joy'], text: ['Let us sing a cheerful song.', 'Bells ring with a sweet sound.', 'Everyone claps and smiles along.'] },
    { title: 'The Red Van', synopsis: 'Chuyến xe van chở đồ dã ngoại', target: ['van', 'drive', 'trip', 'pack'], text: ['Dad packed boxes in the red van.', 'We drove down the open road.', 'A fun camping trip had begun!'] },
    { title: 'Look at the Book', synopsis: 'Cuốn truyện tranh hấp dẫn', target: ['look', 'book', 'read', 'page'], text: ['Open the book and look inside.', 'Read every word with careful care.', 'Great tales wait on every page.'] },
    { title: 'Under the Moon', synopsis: 'Ánh trăng rằm sáng lung linh', target: ['moon', 'night', 'glow', 'soon'], text: ['The full moon shines high and bright.', 'Stars glow in the quiet dark night.', 'Soon sweet dreams will arrive.'] },
    { title: 'Strong Wings', synopsis: 'Đôi cánh khỏe của đại bàng', target: ['wing', 'strong', 'fly', 'high'], text: ['The eagle spread its wide strong wings.', 'It flew up high above the hills.', 'Gliding softly through the skies.'] },
    { title: 'Winter Wood', synopsis: 'Khu rừng mùa đông phủ tuyết', target: ['wood', 'snow', 'cold', 'foot'], text: ['Soft white snow covers the wood.', 'Footprints trail beside the brook.', 'Winter has arrived in peace.'] },
    { title: 'Zoo Visit', synopsis: 'Chuyến tham quan vườn thú', target: ['zoo', 'zebra', 'see', 'feed'], text: ['We went to the big animal zoo.', 'We saw striped zebras run and play.', 'It was an exciting sunny day.'] },
    { title: 'Good Food', synopsis: 'Bữa tiệc gia đình ấm cúng', target: ['good', 'food', 'cook', 'spoon'], text: ['Mum cooks good warm food for all.', 'Stir the soup with a wooden spoon.', 'Eat together and smile with love.'] }
  ],
  6: [
    { title: 'The White Ship', synopsis: 'Con tàu trắng căng buồm lướt sóng', target: ['ship', 'white', 'sail', 'sea'], text: ['A white ship sails on the blue sea.', 'The captain holds the steering wheel.', 'Dolphins jump alongside the ship.'] },
    { title: 'Fish and Chips', synopsis: 'Món cá rán giòn tan truyền thống', target: ['fish', 'chips', 'dish', 'hot'], text: ['We had hot crispy fish and chips.', 'Serve them fresh on a paper dish.', 'A favorite treat on Friday night.'] },
    { title: 'The Clever Fox', synopsis: 'Chú cáo thông minh trong rừng', target: ['fox', 'clever', 'box', 'six'], text: ['A quick red fox ran through the brush.', 'He found six acorns by a log.', 'He hid them safe inside a box.'] },
    { title: 'Brush Your Teeth', synopsis: 'Bé đánh răng sạch bóng mỗi tối', target: ['brush', 'teeth', 'clean', 'shine'], text: ['Remember to brush your teeth clean.', 'Up and down and all around.', 'Make them shine white and bright.'] },
    { title: 'Think and Thank', synopsis: 'Lời cảm ơn chân thành từ trái tim', target: ['think', 'thank', 'kind', 'word'], text: ['Think of kind words every day.', 'Always say thank you with a warm smile.', 'Kindness brings joy to everyone.'] },
    { title: 'Chicks in the Shed', synopsis: 'Đàn gà con ríu rít trong chuồng', target: ['chick', 'shed', 'peck', 'soft'], text: ['Tiny yellow chicks peck in the shed.', 'They chirp and snuggle together.', 'Soft feathers keep them safe and warm.'] },
    { title: 'Shops on the Street', synopsis: 'Phố phường tấp nập cửa hàng', target: ['shop', 'street', 'walk', 'buy'], text: ['We walked down the busy street.', 'The fruit shop smelled sweet and ripe.', 'We bought fresh red apples today.'] },
    { title: 'This and That', synopsis: 'Khám phá thế giới xung quanh', target: ['this', 'that', 'with', 'them'], text: ['Look at this and point at that.', 'Share your toys with good friends.', 'Playing together is always best.'] },
    { title: 'The Thick Cloth', synopsis: 'Tấm chăn dày giữ ấm mùa đông', target: ['thick', 'cloth', 'warm', 'bed'], text: ['A thick wool cloth kept us warm.', 'Outside the cold night wind blew.', 'Snug in bed till the morning sun.'] },
    { title: 'A Quick Yawn', synopsis: 'Cái ngáp ngủ trước giờ đi nằm', target: ['yawn', 'sleep', 'rest', 'bed'], text: ['A big yawn came from little Tom.', 'Rub sleepy eyes and hug your bear.', 'Time to rest your sleepy head.'] }
  ],
  7: [
    { title: 'The Quick Queen', synopsis: 'Hoàng hậu nhanh nhẹn vi hành', target: ['quick', 'queen', 'crown', 'hall'], text: ['The quick queen walked into the hall.', 'She wore a silver crown of gems.', 'She listened to the people with grace.'] },
    { title: 'Out of the Cloud', synopsis: 'Cầu vồng rực rỡ sau đám mây', target: ['cloud', 'out', 'rain', 'shine'], text: ['The sun burst out of a grey cloud.', 'A bright rainbow arched across the sky.', 'Colors sparkled everywhere we looked.'] },
    { title: 'A Shiny Coin', synopsis: 'Đồng xu may mắn trên đường', target: ['coin', 'point', 'soil', 'find'], text: ['Tim spotted a shiny gold coin.', 'It lay half buried in the brown soil.', 'He saved it in his little bank.'] },
    { title: 'A Clue for You', synopsis: 'Manh mối trò chơi tìm kho báu', target: ['clue', 'blue', 'find', 'map'], text: ['Follow the clue written on the blue card.', 'It points to a spot beneath the old tree.', 'You found the secret treasure box!'] },
    { title: 'The Fast Mixer', synopsis: 'Chiếc máy trộn làm bánh kem', target: ['mixer', 'butter', 'stir', 'bake'], text: ['Mum turns on the fast electric mixer.', 'Whisk the butter and sweet white sugar.', 'Bake the cake till golden brown.'] },
    { title: 'A Bright Star', synopsis: 'Ngôi sao dẫn đường lấp lánh', target: ['star', 'far', 'dark', 'glow'], text: ['A bright star twinkles from afar.', 'It lights the dark road in the night.', 'Make a wish upon that lovely star.'] },
    { title: 'Duck in the Pond', synopsis: 'Chú vịt con bơi lội tung tăng', target: ['duck', 'quack', 'quick', 'pond'], text: ['The yellow duck swam in the pond.', 'Quack, quack, called the mother duck.', 'All the little ducklings swam right back.'] },
    { title: 'Round and Round', synopsis: 'Vòng quay ngựa gỗ rộn ràng', target: ['round', 'turn', 'ride', 'music'], text: ['The carousel goes round and round.', 'Children laugh on colorful horses.', 'Lively music plays all through the park.'] },
    { title: 'Hard Work at Farm', synopsis: 'Ngày lao động hăng say ở nông trại', target: ['work', 'farm', 'barn', 'corn'], text: ['The farmer works hard on his green farm.', 'He gathers sweet corn into the barn.', 'Good harvest after faithful labor.'] },
    { title: 'Smart Readers', synopsis: 'Bé tự tin đọc sách độc lập', target: ['read', 'smart', 'star', 'proud'], text: ['We can read seventy whole stories now!', 'We decode every word with phonics skill.', 'Ms Trang ASI is so proud of our growth!'] }
  ]
};

// Populate the remaining groups
for (let g = 2; g <= 7; g++) {
  const templates = GROUP_TEMPLATES[g] || [];
  DECODABLE_BOOKS_DATA[g] = templates.map((tmpl, idx) => {
    const bookNumber = idx + 1;
    const lines: DecodableStoryLine[] = tmpl.text.map(sentence => {
      const words = sentence.split(' ');
      const tokens: DecodableWordToken[] = words.map(w => {
        let clean = w.replace(/[.,!?;:]/g, '');
        let punct = w.match(/[.,!?;:]$/)?.[0];
        const isTricky = [
          'a', 'i', 'he', 'she', 'the', 'we', 'me', 'be', 'was', 'to', 'do', 'are', 'all', 'you',
          'your', 'come', 'some', 'said', 'here', 'there', 'they', 'go', 'no', 'so', 'my', 'one',
          'by', 'only', 'old', 'like', 'have', 'live', 'give', 'little', 'down', 'what', 'when', 'why',
          'where', 'who', 'which', 'any', 'many', 'more', 'before', 'other', 'were', 'because', 'want', 'saw',
          'put', 'could', 'should', 'would', 'right', 'two', 'four', 'goes', 'does', 'made', 'their', 'once',
          'upon', 'always', 'also', 'of', 'eight', 'love', 'cover', 'after', 'every', 'mother', 'father', 'brother',
        ].includes(clean.toLowerCase());
        return {
          type: isTricky ? 'tricky' : 'decodable',
          text: clean,
          letters: clean.split(''),
          trailingPunct: punct
        };
      });
      return { sentence, tokens };
    });

    const targetWords = tmpl.target.map(w => ({
      word: w,
      isTricky: ['the', 'a', 'to', 'all'].includes(w.toLowerCase())
    }));

    return {
      id: g * 100 + bookNumber,
      group: g,
      bookNumber,
      title: tmpl.title,
      synopsis: tmpl.synopsis,
      wordCount: 25 + bookNumber * 2,
      diamonds: 10,
      illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaQ-GnQpb6ENV0WVpv8LYrKgi8UYvL5GR-xGbRMlfsYEyywqCZauABF5e2ufkAKE-8C7VnSHmrJAShqfbTbDC8YEVFUnRPwocobG-JzsNLZISDTVGwIpsoI0phy9icT8WdwbtpYYEm7NBFcqSfplcZvc4TXBjOGEGi3iWZt6o3Ydl1Kuct-DEs3gcwJePlcBEx8N84WOOurzZv7SQ_x7H0UKXaxQ-eLp7roFdpn2zllbBpHPelgeU',
      illustrationAlt: tmpl.title + ' watercolor illustration',
      captionVi: 'Hình ảnh minh họa: ' + tmpl.synopsis,
      targetWords,
      lines
    };
  });
}

const TRICKY_LOWER_LIST = [
  'a', 'i', 'he', 'she', 'the', 'we', 'me', 'be', 'was', 'to', 'do', 'are', 'all', 'you',
  'your', 'come', 'some', 'said', 'here', 'there', 'they', 'go', 'no', 'so', 'my', 'one',
  'by', 'only', 'old', 'like', 'have', 'live', 'give', 'little', 'down', 'what', 'when', 'why',
  'where', 'who', 'which', 'any', 'many', 'more', 'before', 'other', 'were', 'because', 'want', 'saw',
  'put', 'could', 'should', 'would', 'right', 'two', 'four', 'goes', 'does', 'made', 'their', 'once',
  'upon', 'always', 'also', 'of', 'eight', 'love', 'cover', 'after', 'every', 'mother', 'father', 'brother',
];

export function buildStoryLinesFromSentences(
  sentences: string[],
  extraTrickyWords: string[] = []
): DecodableStoryLine[] {
  const extraSet = new Set(extraTrickyWords.map((w) => w.toLowerCase()));
  return sentences.map((sentence) => {
    const words = sentence.trim().split(/\s+/);
    const tokens: DecodableWordToken[] = words.map((w) => {
      const leadingPunct = w.match(/^[“"‘'([)]+/)?.[0];
      const trailingPunct = w.match(/[.,!?;:"'”’)\]]+$/)?.[0];
      const clean = w.replace(/^[“"‘'([)]+|[.,!?;:"'”’)\]]+$/g, '');
      const lower = clean.toLowerCase();
      const isTricky = TRICKY_LOWER_LIST.includes(lower) || extraSet.has(lower);
      return {
        type: isTricky ? 'tricky' : 'decodable',
        text: clean,
        letters: clean.split(''),
        leadingPunct,
        trailingPunct,
      };
    });
    return { sentence, tokens };
  });
}

// 5 Truyện Chuẩn SPELD SA Set 1 (s, a, t, p, i, n)
const SPELD_SET_1_BOOKS: DecodableBook[] = [
  {
    id: 1001,
    group: 1,
    bookNumber: 1,
    flipbookId: 'speld-g1-b1',
    stars: 2,
    title: 'It',
    author: 'Written by Angela Weeks. Illustrated by Trent Lambert.',
    synopsis: 'Trò chơi đuổi bắt "Ai làm bị (It)" trên sân trường (33 words)',
    wordCount: 33,
    diamonds: 15,
    illustration: '',
    illustrationAlt: 'It - SPELD SA Set 1',
    captionVi: 'SPELD SA Phonic Book Series • Set 1 (s, a, t, p, i, n)',
    targetWords: [
      { word: 'it' },
      { word: 'Tan' },
      { word: 'Ann' },
      { word: 'Nat' },
      { word: 'taps' },
      { word: 'sits' },
      { word: 'pats' },
      { word: 'pants' },
      { word: 'is', isTricky: true },
    ],
    practicePage: {
      sounds: ['s', 'a', 't', 'i', 'p', 'n'],
      blendingWords: ['it', 'Tan', 'Ann', 'Nat', 'taps', 'sits', 'pats', 'pants'],
      trickyWords: ['is'],
      blendingExamples: "e.g. i-t is ‘it’; T-a-n is ‘Tan’; A-nn is ‘Ann’; s-i-t-s is ‘sits’; p-a-n-t-s is ‘pants’.",
      vocabulary: [
        { word: 'it', definition: 'the player in a chasing game who is tagging the other players' },
        { word: 'taps', definition: 'touches lightly with fingers' },
        { word: 'sits', definition: 'rests on his/her bottom with a straight back' },
        { word: 'pats', definition: 'touches lightly with a hand' },
        { word: 'pants', definition: 'breathes heavily in and out' },
      ],
      discussionQuestions: [
        'Have you played a game like this? What do you call the game?',
        'Tell me about the game you played. How many children can play? How do you choose who will be ‘it’ first? What are the rules?',
        'Who had a turn at being ‘it’ at the beginning of the story? Who had a turn at being ‘it’ at the end? What do you do if you are ‘it’?',
        'To pant means to breathe heavily. Why did Pat and Ann pant or breathe heavily? Can you pant like Pat and Ann?',
      ],
    },
    pages: [
      {
        pageNumber: 1,
        lines: buildStoryLinesFromSentences(['Pip, Tan, Pat, Ann, Nat'], ['is']),
        captionVi: 'Trang 1: 5 bạn nhỏ Pip, Tan, Pat, Ann và Nat trên sân trường',
      },
      {
        pageNumber: 2,
        lines: buildStoryLinesFromSentences(['Ann is ‘it’.'], ['is']),
        captionVi: 'Trang 2: Bạn Ann nhắm mắt làm người đuổi bắt ("it")',
      },
      {
        pageNumber: 3,
        lines: buildStoryLinesFromSentences(['Ann taps Nat.', 'Nat sits.'], ['is']),
        captionVi: 'Trang 3: Ann chạm nhẹ vào Nat, Nat ngồi xuống',
      },
      {
        pageNumber: 4,
        lines: buildStoryLinesFromSentences(['Ann pats Pip.', 'Pip sits.'], ['is']),
        captionVi: 'Trang 4: Ann vỗ nhẹ vào Pip, Pip ngồi xuống',
      },
      {
        pageNumber: 5,
        lines: buildStoryLinesFromSentences(['Ann pats Tan.', 'Tan sits.'], ['is']),
        captionVi: 'Trang 5: Ann vỗ nhẹ vào Tan, Tan ngồi xuống',
      },
      {
        pageNumber: 6,
        lines: buildStoryLinesFromSentences(['Ann taps Pat.'], ['is']),
        captionVi: 'Trang 6: Ann đuổi kịp và chạm vào Pat',
      },
      {
        pageNumber: 7,
        lines: buildStoryLinesFromSentences(['Pat pants.', 'Ann pants.'], ['is']),
        captionVi: 'Trang 7: Pat và Ann thở hổn hển sau cuộc rượt đuổi',
      },
      {
        pageNumber: 8,
        lines: buildStoryLinesFromSentences(['Pat is ‘it’.'], ['is']),
        captionVi: 'Trang 8: Đến lượt Pat nhắm mắt làm người đuổi bắt ("it")',
      },
    ],
    fluencyChart: [
      'it', 'at', 'pit', 'pat',
      'tap', 'Ann', 'sit', 'tan',
      'sat', 'Nat', 'tin', 'nip',
      'pip', 'sap', 'its', 'pin',
      'pats', 'taps', 'sits', 'snap',
      'nips', 'pips', 'spin', 'pants',
    ],
    lines: buildStoryLinesFromSentences(
      [
        'Pip, Tan, Pat, Ann, Nat',
        'Ann is ‘it’.',
        'Ann taps Nat. Nat sits.',
        'Ann pats Pip. Pip sits.',
        'Ann pats Tan. Tan sits.',
        'Ann taps Pat.',
        'Pat pants. Ann pants.',
        'Pat is ‘it’.',
      ],
      ['is']
    ),
  },
  {
    id: 1002,
    group: 1,
    bookNumber: 2,
    flipbookId: 'speld-g1-b2',
    stars: 1,
    title: 'Sant the ant',
    author: 'Written by Jan Polkinghorne. Illustrated by Dave Atze.',
    synopsis: 'Chú kiến mật Sant tinh nghịch trên cát (18 words)',
    wordCount: 18,
    diamonds: 15,
    illustration: '',
    illustrationAlt: 'Sant the ant - SPELD SA Set 1',
    captionVi: 'SPELD SA Phonic Book Series • Set 1 (s, a, t, p, i, n)',
    targetWords: [
      { word: 'in' },
      { word: 'at' },
      { word: 'ant' },
      { word: 'tin' },
      { word: 'tap' },
      { word: 'pin' },
      { word: 'sat' },
      { word: 'sit' },
      { word: 'the', isTricky: true },
      { word: 'on', isTricky: true },
      { word: 'a', isTricky: true },
    ],
    practicePage: {
      sounds: ['s', 'a', 't', 'i', 'p', 'n'],
      blendingWords: ['in', 'at', 'ant', 'tin', 'tap', 'pin', 'sat', 'sit'],
      trickyWords: ['the', 'on', 'a'],
      blendingExamples: "e.g. a-n-t is ‘ant’; t-i-n is ‘tin’; t-a-p is ‘tap’.",
      vocabulary: [
        { word: 'ant', definition: 'a crawling insect with six legs' },
        { word: 'sat', definition: 'rested on your bottom with your back straight' },
        { word: 'tin', definition: 'a metal can' },
        { word: 'tap', definition: 'water can come out of a tap' },
        { word: 'pin', definition: 'small, metal tool with a sharp point to join things together' },
      ],
      discussionQuestions: [
        'Who is Sant? What did Sant do in the story?',
        'Tell me where you have seen ants.',
        'Why do you think Sant sat at the tap?',
        'How would you feel if you sat on a pin?',
      ],
    },
    pages: [
      {
        pageNumber: 1,
        lines: buildStoryLinesFromSentences(['Sant the ant'], ['the', 'on', 'a']),
        captionVi: 'Trang 1: Chú kiến mật Sant vẫy tay chào',
      },
      {
        pageNumber: 2,
        lines: buildStoryLinesFromSentences(['Sant sat in a tin.'], ['the', 'on', 'a']),
        captionVi: 'Trang 2: Sant ngồi trong một chiếc lon thiếc',
      },
      {
        pageNumber: 3,
        lines: buildStoryLinesFromSentences(['Sant sat at the tap.'], ['the', 'on', 'a']),
        captionVi: 'Trang 3: Sant ngồi cạnh vòi nước đang chảy',
      },
      {
        pageNumber: 4,
        lines: buildStoryLinesFromSentences(['Sant sat on a pin.'], ['the', 'on', 'a']),
        captionVi: 'Trang 4: Sant ngồi trúng chiếc kim băng và kêu "a-a-a!"',
      },
    ],
    fluencyChart: [
      'at', 'an', 'it', 'in',
      'tin', 'sat', 'pin', 'ant',
      'tap', 'sit', 'nap', 'Sant',
    ],
    lines: buildStoryLinesFromSentences(
      [
        'Sant the ant',
        'Sant sat in a tin.',
        'Sant sat at the tap.',
        'Sant sat on a pin.',
      ],
      ['the', 'on', 'a']
    ),
  },
  {
    id: 1003,
    group: 1,
    bookNumber: 3,
    flipbookId: 'speld-g1-b3',
    stars: 1,
    title: 'Tan-Tan sits',
    author: 'Written by Angela Weeks. Illustrated by Trent Lambert.',
    synopsis: 'Dạy chú cún con Tan-Tan ngồi ngoan (31 words)',
    wordCount: 31,
    diamonds: 15,
    illustration: '',
    illustrationAlt: 'Tan-Tan sits - SPELD SA Set 1',
    captionVi: 'SPELD SA Phonic Book Series • Set 1 (s, a, t, p, i, n)',
    targetWords: [
      { word: 'Pip' },
      { word: 'Nat' },
      { word: 'Tan' },
      { word: 'sit' },
      { word: 'sits' },
      { word: 'pat' },
      { word: 'pats' },
    ],
    practicePage: {
      sounds: ['s', 'a', 't', 'i', 'p', 'n'],
      blendingWords: ['Pip', 'Nat', 'Tan', 'sit', 'sits', 'pat', 'pats'],
      trickyWords: [],
      blendingExamples: "e.g. P-i-p is ‘Pip’; s-i-t is ‘sit’; T-a-n is ‘Tan’.",
      vocabulary: [
        { word: 'Pip', definition: 'someone’s name' },
        { word: 'sit', definition: 'to tell the dog to sit down' },
        { word: 'sits', definition: 'the dog rests on its bottom' },
        { word: 'pats', definition: 'lightly strokes with a hand' },
      ],
      discussionQuestions: [
        'What happened in this story?',
        'Why is it important to teach a dog to sit?',
        'Nat is Pip’s mother. So Pip is Nat’s …? (child, son)',
        'Why did Nat tell Pip to pat Tan-Tan?',
        'What do you think Pip said to Tan-Tan when the dog did the right thing?',
        'Show me on your arm how Pip patted the dog.',
      ],
    },
    pages: [
      {
        pageNumber: 1,
        lines: buildStoryLinesFromSentences(['Nat, Pip, Tan-Tan']),
        captionVi: 'Trang 1: Mẹ Nat, bạn nhỏ Pip và chú cún Tan-Tan',
      },
      {
        pageNumber: 2,
        lines: buildStoryLinesFromSentences(['“Sit Tan-Tan.”']),
        captionVi: 'Trang 2: Mẹ Nat ra hiệu cho cún Tan-Tan ngồi xuống',
      },
      {
        pageNumber: 3,
        lines: buildStoryLinesFromSentences(['Tan-Tan sits.']),
        captionVi: 'Trang 3: Chú cún Tan-Tan ngồi ngoan ngoãn',
      },
      {
        pageNumber: 4,
        lines: buildStoryLinesFromSentences(['Nat pats Tan-Tan.']),
        captionVi: 'Trang 4: Mẹ Nat xoa đầu khen ngợi Tan-Tan',
      },
      {
        pageNumber: 5,
        lines: buildStoryLinesFromSentences(['“Sit Tan-Tan, sit.”', 'Tan-Tan sits.']),
        captionVi: 'Trang 5: Pip tập ra lệnh cho Tan-Tan ngồi xuống',
      },
      {
        pageNumber: 6,
        lines: buildStoryLinesFromSentences(['“Pat Tan-Tan.”']),
        captionVi: 'Trang 6: Mẹ Nat bảo Pip xoa đầu khen Tan-Tan',
      },
      {
        pageNumber: 7,
        lines: buildStoryLinesFromSentences(['Pip pats Tan-Tan.']),
        captionVi: 'Trang 7: Pip quỳ xuống xoa đầu chú cún Tan-Tan',
      },
      {
        pageNumber: 8,
        lines: buildStoryLinesFromSentences(['Tan-Tan sits.']),
        captionVi: 'Trang 8: Chú cún Tan-Tan ngồi vẫy đuôi vui vẻ',
      },
    ],
    fluencyChart: [
      'in', 'at', 'it', 'sit',
      'tan', 'sip', 'Nat', 'Pip',
      'pin', 'pat', 'sits', 'pats',
    ],
    lines: buildStoryLinesFromSentences([
      'Nat, Pip, Tan-Tan',
      '“Sit Tan-Tan.”',
      'Tan-Tan sits.',
      'Nat pats Tan-Tan.',
      '“Sit Tan-Tan, sit.” Tan-Tan sits.',
      '“Pat Tan-Tan.”',
      'Pip pats Tan-Tan.',
      'Tan-Tan sits.',
    ]),
  },
  {
    id: 1004,
    group: 1,
    bookNumber: 4,
    flipbookId: 'speld-g1-b4',
    stars: 2,
    title: 'The tins sit',
    author: 'Written by Jacqui Edwards. Illustrated by Dave Atze.',
    synopsis: 'Xếp tháp lon thiếc cùng bạn Nat và kiến Sant (29 words)',
    wordCount: 29,
    diamonds: 15,
    illustration: '',
    illustrationAlt: 'The tins sit - SPELD SA Set 1',
    captionVi: 'SPELD SA Phonic Book Series • Set 1 (s, a, t, p, i, n)',
    targetWords: [
      { word: 'it' },
      { word: 'sit' },
      { word: 'tin' },
      { word: 'at' },
      { word: 'pat' },
      { word: 'pats' },
      { word: 'tips' },
      { word: 'spins' },
      { word: 'the', isTricky: true },
      { word: 'a', isTricky: true },
      { word: 'is', isTricky: true },
    ],
    practicePage: {
      sounds: ['s', 'a', 't', 'i', 'p', 'n'],
      blendingWords: ['it', 'sit', 'tin', 'at', 'pat', 'pats', 'tips', 'spins'],
      trickyWords: ['the', 'a', 'is'],
      blendingExamples: "e.g. t-i-n is ‘tin’; t-i-p-s is ‘tips’; p-a-t-s is ‘pats’; s-p-i-n-s is ‘spins’.",
      vocabulary: [
        { word: 'tin', definition: 'a metal can for food or drink' },
        { word: 'sit', definition: 'to rest on top of' },
        { word: 'at the', definition: 'next to' },
        { word: 'pats', definition: 'taps something with a hand' },
        { word: 'spins', definition: 'turns quickly' },
        { word: 'tips', definition: 'turns over' },
      ],
      discussionQuestions: [
        'Do you know another word for a tin? (a can)',
        'What types of things come in a tin or a can?',
        'How many tins did Nat and Sant find? Count the tins.',
        'Have you ever built a tower of tins or blocks? What did you do to knock it down? Make a tower of tins with a friend and see who can knock the most down.',
        'Why was Sant’s foot sore? Have you ever had something fall on your foot? Tell me what happened.',
      ],
    },
    pages: [
      {
        pageNumber: 1,
        lines: buildStoryLinesFromSentences(['It is a tin.'], ['the', 'a', 'is']),
        captionVi: 'Trang 1: Nat cầm một chiếc lon thiếc trên tay',
      },
      {
        pageNumber: 2,
        lines: buildStoryLinesFromSentences(['A tin, a tin, a tin'], ['the', 'a', 'is']),
        captionVi: 'Trang 2: Nhiều chiếc lon thiếc đặt trên sân',
      },
      {
        pageNumber: 3,
        lines: buildStoryLinesFromSentences(['The tins sit.'], ['the', 'a', 'is']),
        captionVi: 'Trang 3: Nat xếp các lon thiếc chồng lên nhau thành tháp',
      },
      {
        pageNumber: 4,
        lines: buildStoryLinesFromSentences(['Sant is at the tins.'], ['the', 'a', 'is']),
        captionVi: 'Trang 4: Kiến Sant trèo lên tháp lon thiếc',
      },
      {
        pageNumber: 5,
        lines: buildStoryLinesFromSentences(['Sant pats.'], ['the', 'a', 'is']),
        captionVi: 'Trang 5: Kiến Sant vỗ nhẹ vào chiếc lon dưới đáy',
      },
      {
        pageNumber: 6,
        lines: buildStoryLinesFromSentences(['Sant spins.'], ['the', 'a', 'is']),
        captionVi: 'Trang 6: Kiến Sant xoay vòng đá văng chồng lon',
      },
      {
        pageNumber: 7,
        lines: buildStoryLinesFromSentences(['Sant tips the tins.'], ['the', 'a', 'is']),
        captionVi: 'Trang 7: Chồng lon thiếc đổ lăn ra đè trúng chân Sant',
      },
      {
        pageNumber: 8,
        lines: buildStoryLinesFromSentences(['Nat pats Sant.'], ['the', 'a', 'is']),
        captionVi: 'Trang 8: Nat đặt kiến Sant lên tay và vỗ về an ủi',
      },
    ],
    fluencyChart: [
      'it', 'an', 'at', 'in',
      'sit', 'sat', 'tin', 'ant',
      'tan', 'pin', 'pat', 'Nat',
      'tip', 'nip', 'tap', 'pit',
      'pats', 'tips', 'taps', 'tins',
      'spin', 'spat', 'Sant', 'spins',
    ],
    lines: buildStoryLinesFromSentences(
      [
        'It is a tin.',
        'A tin, a tin, a tin',
        'The tins sit.',
        'Sant is at the tins.',
        'Sant pats.',
        'Sant spins.',
        'Sant tips the tins.',
        'Nat pats Sant.',
      ],
      ['the', 'a', 'is']
    ),
  },
  {
    id: 1005,
    group: 1,
    bookNumber: 5,
    flipbookId: 'speld-g1-b5',
    stars: 2,
    title: 'Ants in Ann’s pants',
    author: 'Written by Angela Weeks. Illustrated by Trent Lambert.',
    synopsis: 'Đàn kiến bò vào ống quần bị rách của Ann (23 words)',
    wordCount: 23,
    diamonds: 15,
    illustration: '',
    illustrationAlt: 'Ants in Ann’s pants - SPELD SA Set 1',
    captionVi: 'SPELD SA Phonic Book Series • Set 1 (s, a, t, p, i, n)',
    targetWords: [
      { word: 'pit' },
      { word: 'Ann' },
      { word: 'ant' },
      { word: 'sit' },
      { word: 'spin' },
      { word: 'sits' },
      { word: 'ants' },
      { word: 'pants' },
      { word: 'the', isTricky: true },
      { word: 'a', isTricky: true },
    ],
    practicePage: {
      sounds: ['s', 'a', 't', 'i', 'p', 'n'],
      blendingWords: ['pit', 'Ann', 'ant', 'sit', 'spin', 'sits', 'ants', 'pants'],
      trickyWords: ['the', 'a'],
      blendingExamples: "e.g. p-i-t is ‘pit’; A-nn is ‘Ann’; s-p-i-n is ‘spin’; p-a-n-t-s is ‘pants’.",
      vocabulary: [
        { word: 'ants', definition: 'crawling insects with six legs' },
        { word: 'pit', definition: 'a low, sandy dip in the ground' },
        { word: 'pants', definition: 'clothing that covers the lower body – waist to ankle' },
        { word: 'spin', definition: 'to turn quickly' },
      ],
      discussionQuestions: [
        'What happened to Ann in this story?',
        'How do you think the ants got into Ann’s pants? Do you think Ann noticed the ants in the pit?',
        'What do ants eat? Do you think they wanted to eat Ann?',
        'What do you think Ann was trying to do in the end by spinning? Have you been bitten by an ant?',
      ],
    },
    pages: [
      {
        pageNumber: 1,
        lines: buildStoryLinesFromSentences(['Ants'], ['the', 'a']),
        captionVi: 'Trang 1: Những chú kiến đen bò trên cát',
      },
      {
        pageNumber: 2,
        lines: buildStoryLinesFromSentences(['Ants in a pit'], ['the', 'a']),
        captionVi: 'Trang 2: Đàn kiến ở trong một hố cát trũng',
      },
      {
        pageNumber: 3,
        lines: buildStoryLinesFromSentences(['Ann'], ['the', 'a']),
        captionVi: 'Trang 3: Bạn nhỏ Ann đứng trên đường đất đỏ',
      },
      {
        pageNumber: 4,
        lines: buildStoryLinesFromSentences(['Ann’s pants'], ['the', 'a']),
        captionVi: 'Trang 4: Chiếc quần dài màu hồng của Ann có một vết rách ở gối',
      },
      {
        pageNumber: 5,
        lines: buildStoryLinesFromSentences(['Ann sits.'], ['the', 'a']),
        captionVi: 'Trang 5: Ann ngồi khoanh chân trên bãi cát',
      },
      {
        pageNumber: 6,
        lines: buildStoryLinesFromSentences(['Ann sits in the pit.'], ['the', 'a']),
        captionVi: 'Trang 6: Ann ngồi ngay trong hố cát nơi có đàn kiến',
      },
      {
        pageNumber: 7,
        lines: buildStoryLinesFromSentences(['Ants in Ann’s pants'], ['the', 'a']),
        captionVi: 'Trang 7: Đàn kiến chui qua vết rách vào trong ống quần của Ann',
      },
      {
        pageNumber: 8,
        lines: buildStoryLinesFromSentences(['Ann in a spin'], ['the', 'a']),
        captionVi: 'Trang 8: Ann nhảy dựng lên xoay vòng để giũ đàn kiến ra',
      },
    ],
    fluencyChart: [
      'in', 'an', 'at', 'it',
      'sat', 'Ann', 'sit', 'ant',
      'nip', 'pan', 'pin', 'sip',
      'pip', 'sap', 'ants', 'sits',
      'taps', 'tips', 'snap', 'sips',
      'spin', 'pant', 'nips', 'pants',
    ],
    lines: buildStoryLinesFromSentences(
      [
        'Ants',
        'Ants in a pit',
        'Ann',
        'Ann’s pants',
        'Ann sits.',
        'Ann sits in the pit.',
        'Ants in Ann’s pants',
        'Ann in a spin',
      ],
      ['the', 'a']
    ),
  },
];

import {
  SPELD_SET_2_BOOKS,
  SPELD_SET_3_BOOKS,
  SPELD_SET_4_BOOKS,
  SPELD_SET_5_BOOKS,
  SPELD_SET_6_BOOKS,
  SPELD_SET_7_BOOKS,
  SPELD_EXTENDED_BOOKS_DATA,
} from './speldAdvanceBooksData';

export const ADVANCE_BOOKS_DATA: Record<number, DecodableBook[]> = {
  1: SPELD_SET_1_BOOKS,
  2: SPELD_SET_2_BOOKS,
  3: SPELD_SET_3_BOOKS,
  4: SPELD_SET_4_BOOKS,
  5: SPELD_SET_5_BOOKS,
  6: SPELD_SET_6_BOOKS,
  7: SPELD_SET_7_BOOKS,
};

export const EXTENDED_BOOKS_DATA: Record<number, DecodableBook[]> = SPELD_EXTENDED_BOOKS_DATA;




