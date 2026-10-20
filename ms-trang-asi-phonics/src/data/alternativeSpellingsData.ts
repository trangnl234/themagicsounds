export interface AlternativeSpellingItem {
  id: string;
  grapheme: string;
  displayGrapheme: string;
  phonemeSoundKey: string;
  ipa: string;
  ruleVi: string;
  examples: { word: string; highlighted: string }[];
  words: string[]; // 10 từ chuẩn Jolly Phonics Word Book (trình độ 7-8 tuổi)
  note?: string;
}

export interface AlternativeSpellingTopic {
  id: string;
  group: 1 | 2;
  soundTitle: string;
  rootSound: string;
  ipa: string;
  color: string;
  desc: string;
  items: AlternativeSpellingItem[];
  practiceSentence: string;
}

/**
 * HỆ THỐNG 12 SET ÂM THAY THẾ (ALTERNATIVES) CHUẨN JOLLY PHONICS
 * Chia làm 2 Group đúng chuẩn:
 * - Group 1 (Đỏ): ai, ue, oa, oi, ie, or
 * - Group 2 (Tím): s, ou, j, ee, er, f
 * Mỗi loại âm thay thế có cố định 10 từ vựng đánh vần chuẩn dạng 7-8 tuổi lấy từ Jolly Phonics Word Book.
 */
export const ALTERNATIVE_SPELLINGS_DATA: AlternativeSpellingTopic[] = [
  // ============================================================================
  // GROUP 1 (ĐỎ): ai, ue, oa, oi, ie, or
  // ============================================================================

  // 1. ai -> ay, a_e
  {
    id: 'ai',
    group: 1,
    soundTitle: 'ai',
    rootSound: 'ai',
    ipa: '/eɪ/',
    color: '#DF413E',
    desc: 'Âm thay thế của /ai/: <ay> và <a_e>.',
    practiceSentence: 'May I play a game and bake a cake on a rainy day?',
    items: [
      {
        id: 'ay',
        grapheme: 'ay',
        displayGrapheme: 'ay',
        phonemeSoundKey: 'ai',
        ipa: '/eɪ/',
        ruleVi: 'Thường đứng ở cuối từ thay cho <ai>',
        note: 'Ví dụ: day, play, say, tray, stay, spray',
        examples: [
          { word: 'day', highlighted: 'ay' },
          { word: 'play', highlighted: 'ay' },
          { word: 'tray', highlighted: 'ay' },
          { word: 'stay', highlighted: 'ay' },
          { word: 'spray', highlighted: 'ay' },
        ],
        words: ['day', 'pay', 'say', 'way', 'play', 'tray', 'clay', 'stay', 'pray', 'spray'],
      },
      {
        id: 'a_e',
        grapheme: 'a_e',
        displayGrapheme: 'a_e',
        phonemeSoundKey: 'ai',
        ipa: '/eɪ/',
        ruleVi: 'Nguyên âm đôi tách (Magic e): chữ e cuối câm làm a đọc thành /eɪ/',
        note: 'Ví dụ: cake, make, game, gate, cave, wave',
        examples: [
          { word: 'cake', highlighted: 'a_e' },
          { word: 'make', highlighted: 'a_e' },
          { word: 'game', highlighted: 'a_e' },
          { word: 'gate', highlighted: 'a_e' },
          { word: 'wave', highlighted: 'a_e' },
        ],
        words: ['cake', 'make', 'game', 'name', 'gate', 'late', 'date', 'cave', 'save', 'wave'],
      },
    ],
  },

  // 2. ue -> ew, u_e
  {
    id: 'ue',
    group: 1,
    soundTitle: 'ue',
    rootSound: 'ue',
    ipa: '/juː/',
    color: '#DF413E',
    desc: 'Âm thay thế của /ue/: <ew> và <u_e>.',
    practiceSentence: 'A few cute mules use a huge tube and a new flute.',
    items: [
      {
        id: 'ew',
        grapheme: 'ew',
        displayGrapheme: 'ew',
        phonemeSoundKey: 'ue',
        ipa: '/juː/',
        ruleVi: 'Âm đôi <ew> thường đứng ở cuối từ thay cho <ue>',
        note: 'Ví dụ: few, new, dew, stew, blew, flew',
        examples: [
          { word: 'few', highlighted: 'ew' },
          { word: 'new', highlighted: 'ew' },
          { word: 'stew', highlighted: 'ew' },
          { word: 'blew', highlighted: 'ew' },
          { word: 'flew', highlighted: 'ew' },
        ],
        words: ['few', 'new', 'dew', 'stew', 'blew', 'flew', 'grew', 'chew', 'drew', 'screw'],
      },
      {
        id: 'u_e',
        grapheme: 'u_e',
        displayGrapheme: 'u_e',
        phonemeSoundKey: 'ue',
        ipa: '/juː/',
        ruleVi: 'Nguyên âm đôi tách (Magic e): chữ e cuối câm làm u đọc thành /juː/ hoặc /uː/',
        note: 'Ví dụ: cube, tube, tune, use, cute, flute',
        examples: [
          { word: 'cube', highlighted: 'u_e' },
          { word: 'tube', highlighted: 'u_e' },
          { word: 'tune', highlighted: 'u_e' },
          { word: 'cute', highlighted: 'u_e' },
          { word: 'flute', highlighted: 'u_e' },
        ],
        words: ['cube', 'tube', 'tune', 'dune', 'use', 'fuse', 'cute', 'mule', 'rule', 'flute'],
      },
    ],
  },

  // 3. oa -> ow, o_e
  {
    id: 'oa',
    group: 1,
    soundTitle: 'oa',
    rootSound: 'oa',
    ipa: '/əʊ/',
    color: '#DF413E',
    desc: 'Âm thay thế của /oa/: <ow> và <o_e>.',
    practiceSentence: 'Show the slow mole how to go home in the snow.',
    items: [
      {
        id: 'ow_oa',
        grapheme: 'ow',
        displayGrapheme: 'ow',
        phonemeSoundKey: 'oa',
        ipa: '/əʊ/',
        ruleVi: 'Âm đôi <ow> đọc là /əʊ/ như âm /oa/',
        note: 'Ví dụ: low, bow, row, blow, snow, show, grow',
        examples: [
          { word: 'snow', highlighted: 'ow' },
          { word: 'blow', highlighted: 'ow' },
          { word: 'show', highlighted: 'ow' },
          { word: 'slow', highlighted: 'ow' },
          { word: 'glow', highlighted: 'ow' },
        ],
        words: ['low', 'bow', 'row', 'blow', 'crow', 'flow', 'glow', 'slow', 'snow', 'show'],
      },
      {
        id: 'o_e',
        grapheme: 'o_e',
        displayGrapheme: 'o_e',
        phonemeSoundKey: 'oa',
        ipa: '/əʊ/',
        ruleVi: 'Nguyên âm đôi tách (Magic e): chữ e cuối câm làm o đọc thành /əʊ/',
        note: 'Ví dụ: bone, cone, home, rope, hope, hole, nose',
        examples: [
          { word: 'bone', highlighted: 'o_e' },
          { word: 'home', highlighted: 'o_e' },
          { word: 'rope', highlighted: 'o_e' },
          { word: 'hole', highlighted: 'o_e' },
          { word: 'nose', highlighted: 'o_e' },
        ],
        words: ['bone', 'cone', 'home', 'rope', 'hope', 'hole', 'mole', 'pole', 'note', 'nose'],
      },
    ],
  },

  // 4. oi -> oy
  {
    id: 'oi',
    group: 1,
    soundTitle: 'oi',
    rootSound: 'oi',
    ipa: '/ɔɪ/',
    color: '#DF413E',
    desc: 'Âm thay thế của /oi/: <oy>.',
    practiceSentence: 'The boy was full of joy with his new royal toy.',
    items: [
      {
        id: 'oy',
        grapheme: 'oy',
        displayGrapheme: 'oy',
        phonemeSoundKey: 'oi',
        ipa: '/ɔɪ/',
        ruleVi: 'Thường đứng ở cuối từ thay cho <oi>',
        note: 'Ví dụ: boy, toy, joy, enjoy, annoy, royal',
        examples: [
          { word: 'boy', highlighted: 'oy' },
          { word: 'toy', highlighted: 'oy' },
          { word: 'joy', highlighted: 'oy' },
          { word: 'enjoy', highlighted: 'oy' },
          { word: 'annoy', highlighted: 'oy' },
        ],
        words: ['boy', 'toy', 'joy', 'coy', 'soy', 'roy', 'ploy', 'ahoy', 'enjoy', 'annoy'],
      },
    ],
  },

  // 5. ie -> igh, y, i_e
  {
    id: 'ie',
    group: 1,
    soundTitle: 'ie',
    rootSound: 'ie',
    ipa: '/aɪ/',
    color: '#DF413E',
    desc: 'Âm thay thế của /ie/: <igh>, <y> và <i_e>.',
    practiceSentence: 'I like to fly my kite high in the bright night sky.',
    items: [
      {
        id: 'igh',
        grapheme: 'igh',
        displayGrapheme: 'igh',
        phonemeSoundKey: 'ie',
        ipa: '/aɪ/',
        ruleVi: 'Âm ba (trigraph) <igh> phát âm là /aɪ/, thường đứng trước chữ t',
        note: 'Ví dụ: high, night, light, right, bright',
        examples: [
          { word: 'high', highlighted: 'igh' },
          { word: 'night', highlighted: 'igh' },
          { word: 'light', highlighted: 'igh' },
          { word: 'right', highlighted: 'igh' },
          { word: 'bright', highlighted: 'igh' },
        ],
        words: ['high', 'sigh', 'light', 'night', 'right', 'sight', 'fight', 'might', 'tight', 'bright'],
      },
      {
        id: 'y_ie',
        grapheme: 'y',
        displayGrapheme: 'y',
        phonemeSoundKey: 'ie',
        ipa: '/aɪ/',
        ruleVi: 'Chữ <y> ở cuối từ ngắn phát âm là /aɪ/ như âm /ie/',
        note: 'Ví dụ: by, my, try, cry, dry, fly, sky, shy',
        examples: [
          { word: 'fly', highlighted: 'y' },
          { word: 'sky', highlighted: 'y' },
          { word: 'cry', highlighted: 'y' },
          { word: 'dry', highlighted: 'y' },
          { word: 'try', highlighted: 'y' },
        ],
        words: ['by', 'my', 'try', 'cry', 'dry', 'fly', 'fry', 'shy', 'sky', 'spy'],
      },
      {
        id: 'i_e',
        grapheme: 'i_e',
        displayGrapheme: 'i_e',
        phonemeSoundKey: 'ie',
        ipa: '/aɪ/',
        ruleVi: 'Nguyên âm đôi tách (Magic e): chữ e cuối câm làm i đọc thành /aɪ/',
        note: 'Ví dụ: bike, like, time, nine, five, kite, ride',
        examples: [
          { word: 'bike', highlighted: 'i_e' },
          { word: 'time', highlighted: 'i_e' },
          { word: 'nine', highlighted: 'i_e' },
          { word: 'line', highlighted: 'i_e' },
          { word: 'ride', highlighted: 'i_e' },
        ],
        words: ['bike', 'like', 'time', 'line', 'mine', 'nine', 'fine', 'pine', 'ride', 'hide'],
      },
    ],
  },

  // 6. or -> al, au, aw
  {
    id: 'or',
    group: 1,
    soundTitle: 'or',
    rootSound: 'or',
    ipa: '/ɔː/',
    color: '#DF413E',
    desc: 'Âm thay thế của /or/: <al>, <au> và <aw>.',
    practiceSentence: 'Paul saw a small hawk draw with chalk on the tall wall.',
    items: [
      {
        id: 'al',
        grapheme: 'al',
        displayGrapheme: 'al',
        phonemeSoundKey: 'or',
        ipa: '/ɔː/',
        ruleVi: 'Cụm <al> (trước l hoặc k) đọc thành /ɔː/ hoặc /ɔːl/',
        note: 'Ví dụ: all, ball, call, fall, tall, wall, talk, walk, chalk',
        examples: [
          { word: 'ball', highlighted: 'al' },
          { word: 'tall', highlighted: 'al' },
          { word: 'wall', highlighted: 'al' },
          { word: 'talk', highlighted: 'al' },
          { word: 'walk', highlighted: 'al' },
        ],
        words: ['all', 'ball', 'call', 'fall', 'hall', 'tall', 'wall', 'talk', 'walk', 'chalk'],
      },
      {
        id: 'au',
        grapheme: 'au',
        displayGrapheme: 'au',
        phonemeSoundKey: 'or',
        ipa: '/ɔː/',
        ruleVi: 'Âm đôi <au> phát âm là /ɔː/ như âm /or/',
        note: 'Ví dụ: haul, fault, vault, haunt, launch, sauce, pause',
        examples: [
          { word: 'haul', highlighted: 'au' },
          { word: 'fault', highlighted: 'au' },
          { word: 'sauce', highlighted: 'au' },
          { word: 'pause', highlighted: 'au' },
          { word: 'launch', highlighted: 'au' },
        ],
        words: ['haul', 'paul', 'fault', 'vault', 'haunt', 'launch', 'sauce', 'pause', 'cause', 'clause'],
      },
      {
        id: 'aw',
        grapheme: 'aw',
        displayGrapheme: 'aw',
        phonemeSoundKey: 'or',
        ipa: '/ɔː/',
        ruleVi: 'Âm đôi <aw> phát âm là /ɔː/ như âm /or/',
        note: 'Ví dụ: saw, paw, raw, claw, draw, straw, lawn, yawn, hawk',
        examples: [
          { word: 'saw', highlighted: 'aw' },
          { word: 'paw', highlighted: 'aw' },
          { word: 'draw', highlighted: 'aw' },
          { word: 'straw', highlighted: 'aw' },
          { word: 'lawn', highlighted: 'aw' },
        ],
        words: ['saw', 'paw', 'raw', 'claw', 'draw', 'straw', 'lawn', 'yawn', 'dawn', 'hawk'],
      },
    ],
  },

  // ============================================================================
  // GROUP 2 (TÍM): s, ou, j, ee, er, f
  // ============================================================================

  // 7. s -> cy, ce, ci
  {
    id: 's',
    group: 2,
    soundTitle: 's',
    rootSound: 's',
    ipa: '/s/',
    color: '#9F4BE3',
    desc: 'Âm thay thế của /s/ (Soft c): <cy>, <ce> và <ci>.',
    practiceSentence: 'Bruce rode his cycle to the city to buy nice spicy rice.',
    items: [
      {
        id: 'cy',
        grapheme: 'cy',
        displayGrapheme: 'cy',
        phonemeSoundKey: 's',
        ipa: '/s/',
        ruleVi: 'Khi <c> đứng trước <y>, chữ c phát âm mềm thành /s/',
        note: 'Ví dụ: icy, spicy, fancy, mercy, cycle, cymbal, cylinder',
        examples: [
          { word: 'icy', highlighted: 'cy' },
          { word: 'spicy', highlighted: 'cy' },
          { word: 'fancy', highlighted: 'cy' },
          { word: 'cycle', highlighted: 'cy' },
          { word: 'cymbal', highlighted: 'cy' },
        ],
        words: ['icy', 'lacy', 'racy', 'spicy', 'fancy', 'mercy', 'cycle', 'cyber', 'cymbal', 'cylinder'],
      },
      {
        id: 'ce',
        grapheme: 'ce',
        displayGrapheme: 'ce',
        phonemeSoundKey: 's',
        ipa: '/s/',
        ruleVi: 'Khi <c> đứng trước <e>, chữ c phát âm mềm thành /s/',
        note: 'Ví dụ: mice, nice, rice, face, race, dance, fence, prince',
        examples: [
          { word: 'mice', highlighted: 'ce' },
          { word: 'face', highlighted: 'ce' },
          { word: 'dance', highlighted: 'ce' },
          { word: 'fence', highlighted: 'ce' },
          { word: 'prince', highlighted: 'ce' },
        ],
        words: ['mice', 'nice', 'rice', 'face', 'race', 'space', 'place', 'dance', 'fence', 'prince'],
      },
      {
        id: 'ci',
        grapheme: 'ci',
        displayGrapheme: 'ci',
        phonemeSoundKey: 's',
        ipa: '/s/',
        ruleVi: 'Khi <c> đứng trước <i>, chữ c phát âm mềm thành /s/',
        note: 'Ví dụ: city, acid, pencil, circus, circle, cinema',
        examples: [
          { word: 'city', highlighted: 'ci' },
          { word: 'pencil', highlighted: 'ci' },
          { word: 'circus', highlighted: 'ci' },
          { word: 'circle', highlighted: 'ci' },
          { word: 'cinema', highlighted: 'ci' },
        ],
        words: ['city', 'acid', 'civic', 'civil', 'pencil', 'circus', 'circle', 'cinema', 'cider', 'stencil'],
      },
    ],
  },

  // 8. ou -> ow
  {
    id: 'ou',
    group: 2,
    soundTitle: 'ou',
    rootSound: 'ou',
    ipa: '/aʊ/',
    color: '#9F4BE3',
    desc: 'Âm thay thế của /ou/: <ow>.',
    practiceSentence: 'The brown cow and the owl went down to the town.',
    items: [
      {
        id: 'ow_ou',
        grapheme: 'ow',
        displayGrapheme: 'ow',
        phonemeSoundKey: 'ou',
        ipa: '/aʊ/',
        ruleVi: 'Âm đôi <ow> phát âm là /aʊ/ như âm /ou/',
        note: 'Ví dụ: cow, owl, down, town, brown, clown, crown',
        examples: [
          { word: 'cow', highlighted: 'ow' },
          { word: 'owl', highlighted: 'ow' },
          { word: 'brown', highlighted: 'ow' },
          { word: 'clown', highlighted: 'ow' },
          { word: 'crown', highlighted: 'ow' },
        ],
        words: ['cow', 'now', 'how', 'owl', 'down', 'town', 'brown', 'clown', 'crown', 'crowd'],
      },
    ],
  },

  // 9. j -> gy, ge, gi
  {
    id: 'j',
    group: 2,
    soundTitle: 'j',
    rootSound: 'j',
    ipa: '/dʒ/',
    color: '#9F4BE3',
    desc: 'Âm thay thế của /j/ (Soft g): <gy>, <ge> và <gi>.',
    practiceSentence: 'The giant giraffe had a large orange in a cage at the gym.',
    items: [
      {
        id: 'gy',
        grapheme: 'gy',
        displayGrapheme: 'gy',
        phonemeSoundKey: 'j',
        ipa: '/dʒ/',
        ruleVi: 'Khi <g> đứng trước <y>, chữ g phát âm mềm thành /dʒ/',
        note: 'Ví dụ: gym, gypsy, energy, allergy, biology, geology',
        examples: [
          { word: 'gym', highlighted: 'gy' },
          { word: 'energy', highlighted: 'gy' },
          { word: 'allergy', highlighted: 'gy' },
          { word: 'biology', highlighted: 'gy' },
          { word: 'stingy', highlighted: 'gy' },
        ],
        words: ['gym', 'gypsy', 'energy', 'allergy', 'apology', 'biology', 'geology', 'prodigy', 'stingy', 'spongy'],
      },
      {
        id: 'ge',
        grapheme: 'ge',
        displayGrapheme: 'ge',
        phonemeSoundKey: 'j',
        ipa: '/dʒ/',
        ruleVi: 'Khi <g> đứng trước <e>, chữ g phát âm mềm thành /dʒ/',
        note: 'Ví dụ: cage, page, stage, huge, large, orange, village',
        examples: [
          { word: 'cage', highlighted: 'ge' },
          { word: 'page', highlighted: 'ge' },
          { word: 'stage', highlighted: 'ge' },
          { word: 'large', highlighted: 'ge' },
          { word: 'orange', highlighted: 'ge' },
        ],
        words: ['age', 'cage', 'page', 'stage', 'huge', 'large', 'barge', 'charge', 'orange', 'village'],
      },
      {
        id: 'gi',
        grapheme: 'gi',
        displayGrapheme: 'gi',
        phonemeSoundKey: 'j',
        ipa: '/dʒ/',
        ruleVi: 'Khi <g> đứng trước <i>, chữ g phát âm mềm thành /dʒ/',
        note: 'Ví dụ: giant, magic, digit, engine, ginger, giraffe',
        examples: [
          { word: 'giant', highlighted: 'gi' },
          { word: 'magic', highlighted: 'gi' },
          { word: 'engine', highlighted: 'gi' },
          { word: 'ginger', highlighted: 'gi' },
          { word: 'giraffe', highlighted: 'gi' },
        ],
        words: ['giant', 'magic', 'digit', 'logic', 'tragic', 'rigid', 'margin', 'engine', 'ginger', 'giraffe'],
      },
    ],
  },

  // 10. ee -> ea, e_e, y
  {
    id: 'ee',
    group: 2,
    soundTitle: 'ee',
    rootSound: 'ee',
    ipa: '/i:/',
    color: '#9F4BE3',
    desc: 'Âm thay thế của /ee/: <ea>, <e_e> và <y>.',
    practiceSentence: 'The happy puppy can eat a sweet peach under a green leaf.',
    items: [
      {
        id: 'ea',
        grapheme: 'ea',
        displayGrapheme: 'ea',
        phonemeSoundKey: 'ee',
        ipa: '/i:/',
        ruleVi: 'Âm đôi <ea> đọc ngân dài /i:/ như âm /ee/',
        note: 'Ví dụ: eat, sea, tea, leaf, team, bean',
        examples: [
          { word: 'eat', highlighted: 'ea' },
          { word: 'sea', highlighted: 'ea' },
          { word: 'leaf', highlighted: 'ea' },
          { word: 'team', highlighted: 'ea' },
          { word: 'bean', highlighted: 'ea' },
        ],
        words: ['eat', 'sea', 'tea', 'meat', 'seat', 'leaf', 'read', 'beak', 'team', 'bean'],
      },
      {
        id: 'e_e',
        grapheme: 'e_e',
        displayGrapheme: 'e_e',
        phonemeSoundKey: 'ee',
        ipa: '/i:/',
        ruleVi: 'Nguyên âm đôi tách (Magic e): chữ e cuối câm làm chữ e trước đọc là /i:/',
        note: 'Ví dụ: eve, these, theme, complete, athlete',
        examples: [
          { word: 'eve', highlighted: 'e_e' },
          { word: 'these', highlighted: 'e_e' },
          { word: 'theme', highlighted: 'e_e' },
          { word: 'complete', highlighted: 'e_e' },
          { word: 'athlete', highlighted: 'e_e' },
        ],
        words: ['eve', 'these', 'theme', 'gene', 'scene', 'pete', 'steve', 'complete', 'extreme', 'athlete'],
      },
      {
        id: 'y_ee',
        grapheme: 'y',
        displayGrapheme: 'y',
        phonemeSoundKey: 'ee',
        ipa: '/i:/',
        ruleVi: 'Chữ <y> ở cuối từ 2 âm tiết phát âm là /i:/',
        note: 'Ví dụ: sunny, funny, puppy, happy, teddy, windy',
        examples: [
          { word: 'sunny', highlighted: 'y' },
          { word: 'puppy', highlighted: 'y' },
          { word: 'happy', highlighted: 'y' },
          { word: 'teddy', highlighted: 'y' },
          { word: 'windy', highlighted: 'y' },
        ],
        words: ['sunny', 'funny', 'puppy', 'happy', 'lucky', 'teddy', 'muddy', 'foggy', 'sandy', 'windy'],
      },
    ],
  },

  // 11. er -> ir, ur
  {
    id: 'er',
    group: 2,
    soundTitle: 'er',
    rootSound: 'er',
    ipa: '/ɜː/',
    color: '#9F4BE3',
    desc: 'Âm thay thế của /er/: <ir> và <ur>.',
    practiceSentence: 'The girl in the purple skirt saw a bird on Thursday.',
    items: [
      {
        id: 'ir',
        grapheme: 'ir',
        displayGrapheme: 'ir',
        phonemeSoundKey: 'er',
        ipa: '/ɜː/',
        ruleVi: 'Âm đôi <ir> phát âm là /ɜː/ giống hệt âm /er/',
        note: 'Ví dụ: bird, girl, dirt, shirt, skirt, first, stir',
        examples: [
          { word: 'bird', highlighted: 'ir' },
          { word: 'girl', highlighted: 'ir' },
          { word: 'shirt', highlighted: 'ir' },
          { word: 'skirt', highlighted: 'ir' },
          { word: 'first', highlighted: 'ir' },
        ],
        words: ['bird', 'girl', 'dirt', 'shirt', 'skirt', 'first', 'third', 'stir', 'swirl', 'twirl'],
      },
      {
        id: 'ur',
        grapheme: 'ur',
        displayGrapheme: 'ur',
        phonemeSoundKey: 'er',
        ipa: '/ɜː/',
        ruleVi: 'Âm đôi <ur> phát âm là /ɜː/ giống hệt âm /er/',
        note: 'Ví dụ: turn, burn, fur, hurt, curl, nurse, purse',
        examples: [
          { word: 'turn', highlighted: 'ur' },
          { word: 'burn', highlighted: 'ur' },
          { word: 'hurt', highlighted: 'ur' },
          { word: 'nurse', highlighted: 'ur' },
          { word: 'purse', highlighted: 'ur' },
        ],
        words: ['turn', 'burn', 'fur', 'hurt', 'curl', 'surf', 'nurse', 'purse', 'church', 'burst'],
      },
    ],
  },

  // 12. f -> ph
  {
    id: 'f',
    group: 2,
    soundTitle: 'f',
    rootSound: 'f',
    ipa: '/f/',
    color: '#9F4BE3',
    desc: 'Âm thay thế của /f/: <ph>.',
    practiceSentence: 'Philip took a photo of a dolphin and an elephant on his phone.',
    items: [
      {
        id: 'ph',
        grapheme: 'ph',
        displayGrapheme: 'ph',
        phonemeSoundKey: 'f',
        ipa: '/f/',
        ruleVi: 'Âm đôi phụ âm <ph> phát âm là /f/',
        note: 'Ví dụ: graph, phone, photo, dolphin, elephant, nephew, phonics',
        examples: [
          { word: 'phone', highlighted: 'ph' },
          { word: 'photo', highlighted: 'ph' },
          { word: 'graph', highlighted: 'ph' },
          { word: 'dolphin', highlighted: 'ph' },
          { word: 'elephant', highlighted: 'ph' },
        ],
        words: ['graph', 'phone', 'photo', 'phase', 'phrase', 'dolphin', 'elephant', 'nephew', 'orphan', 'phonics'],
      },
    ],
  },
];
