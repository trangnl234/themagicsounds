// Dữ liệu Word Bank chuẩn quốc tế Jolly Phonics phân theo 3 trình độ độ tuổi:
// 1. age_5_6: 5 - 6 tuổi (CVC dễ, ngắn gọn, 100% 1 âm tiết, tối đa 10 từ)
// 2. age_7_8: 7 - 8 tuổi (Bắt đầu bằng 4 từ CVC [nếu có đủ] sau đó vào các từ Younger Children; 70-80% 1 âm tiết, tối đa 20-30% 2 âm tiết, tối đa 10 từ)
// 3. age_9_10: 9 - 10 tuổi (Bắt đầu bằng 2 từ CVC [nếu có đủ] sau đó vào từ Older Children / Advance; 60-70% 1 âm tiết, 30-40% 2 âm tiết, tối đa 10 từ)
// NGUYÊN TẮC QUAN TRỌNG:
// - Lấy ĐÚNG giới hạn từ vựng được ghi trong từng âm của Jolly Phonics Word Bank (chỉ dùng các âm đã được học tính đến âm đó).
// - 10 từ mỗi level là TỐI ĐA, KHÔNG BẮT BUỘC. Nếu không đủ 10 từ thì DỪNG LẠI, TUYỆT ĐỐI KHÔNG BỊA THÊM TỪ.
// - Có âm không có từ nào (như âm /s/ là âm đầu tiên) hoặc chỉ có 1-2 từ (như /a/, /t/) là hoàn toàn bình thường và chuẩn sư phạm.
// - TUYỆT ĐỐI KHÔNG CÓ TỪ 3 ÂM TIẾT TRỞ LÊN.

export type BlendingLevelKey = 'age_5_6' | 'age_7_8' | 'age_9_10';

export interface BlendingLevelConfig {
  key: BlendingLevelKey;
  label: string;
  badge: string;
  ageRange: string;
  description: string;
  icon: string;
}

export const BLENDING_LEVELS: BlendingLevelConfig[] = [
  {
    key: 'age_5_6',
    label: '5 – 6 tuổi',
    badge: 'CVC Dễ (Tối đa 10 từ)',
    ageRange: '5 - 6 Tuổi',
    description: 'Từ CVC cơ bản 1 âm tiết trong Word Bank của âm hiện tại (tối đa 10 từ)',
    icon: 'child_care',
  },
  {
    key: 'age_7_8',
    label: '7 – 8 tuổi',
    badge: '4 CVC + Younger (Tối đa 10 từ)',
    ageRange: '7 - 8 Tuổi',
    description: 'Bắt đầu bằng 4 từ CVC rồi tới từ Younger Children (tối đa 10 từ, ≤ 2 âm tiết)',
    icon: 'school',
  },
  {
    key: 'age_9_10',
    label: '9 – 10 tuổi',
    badge: '2 CVC + Advance (Tối đa 10 từ)',
    ageRange: '9 - 10 Tuổi',
    description: 'Bắt đầu bằng 2 từ CVC rồi tới từ Advance (tối đa 10 từ, 60-70% 1 âm tiết, không có 3 âm tiết)',
    icon: 'psychology',
  },
];

export interface SoundWordBank {
  age_5_6: string[];
  age_7_8: string[];
  age_9_10: string[];
}

export const WORDBANK_BY_SOUND: Record<string, SoundWordBank> = {
  // ==========================================
  // NHÓM 1: s, a, t, i, p, n
  // ==========================================

  // Âm 1: /s/ - Âm đầu tiên, chưa học âm nào khác nên CHƯA THỂ GHÉP VẦN TỪ NÀO (0 từ)
  s: {
    age_5_6: [],
    age_7_8: [],
    age_9_10: [],
  },

  // Âm 2: /a/ - Chỉ mới học {s, a}. Từ ghép được: 'as' (1 từ)
  a: {
    age_5_6: ['as'],
    age_7_8: ['as'],
    age_9_10: ['as'],
  },

  // Âm 3: /t/ - Đã học {s, a, t}. Từ ghép được: 'at', 'sat' (2 từ)
  t: {
    age_5_6: ['at', 'sat'],
    age_7_8: ['at', 'sat'],
    age_9_10: ['at', 'sat'],
  },

  // Âm 4: /i/ - Đã học {s, a, t, i}. Từ ghép được: 'it', 'its', 'sit', 'is' + advance 'assist' (4 - 5 từ)
  i: {
    age_5_6: ['it', 'its', 'sit', 'is'],
    age_7_8: ['it', 'its', 'sit', 'is'],
    age_9_10: ['it', 'sit', 'is', 'its', 'assist'],
  },

  // Âm 5: /p/ - Đã học {s, a, t, i, p}. Từ ghép được: pip, pit, pat, tap, tip, sip, sap, spit, spat, past, pass, pasta (7 - 10 từ)
  p: {
    age_5_6: ['pip', 'pit', 'pat', 'tap', 'tip', 'sip', 'sap'],
    age_7_8: ['pip', 'pit', 'pat', 'tap', 'tip', 'sip', 'sap', 'spit', 'spat', 'past'],
    age_9_10: ['pip', 'pat', 'tap', 'sip', 'spit', 'spat', 'past', 'pass', 'pasta'],
  },

  // Âm 6: /n/ - Đã học {s, a, t, i, p, n}. Từ ghép được trong Word Bank: an, ant, nap, nip, pan, pin, tan, tin, nit, in, spin, snap, snip, span, pant, pants, insist
  n: {
    age_5_6: ['an', 'ant', 'nap', 'nip', 'pan', 'pin', 'tan', 'tin', 'nit', 'in'],
    age_7_8: ['nap', 'nip', 'pan', 'pin', 'spin', 'snap', 'snip', 'span', 'pant', 'pants'],
    age_9_10: ['pan', 'pin', 'spin', 'snap', 'snip', 'span', 'pant', 'pants', 'insist'],
  },

  // ==========================================
  // NHÓM 2: c, k, e, h, r, m, d
  // ==========================================

  // Âm 7: /k/ (3 mặt chữ c, k, ck chung 1 âm) - Đã học {s, a, t, i, p, n, c, k, ck}
  'c-k': {
    age_5_6: ['cat', 'can', 'cap', 'act', 'kit', 'pick', 'pack', 'sack', 'sick', 'tick'],
    age_7_8: ['cat', 'can', 'cap', 'kit', 'stick', 'skip', 'skin', 'snack', 'tank', 'pink'],
    age_9_10: ['cat', 'can', 'tact', 'stack', 'spick', 'spank', 'panic', 'picnic', 'napkin', 'attack'],
  },
  c: {
    age_5_6: ['cat', 'can', 'cap', 'act', 'kit', 'pick', 'pack', 'sack', 'sick', 'tick'],
    age_7_8: ['cat', 'can', 'cap', 'kit', 'stick', 'skip', 'skin', 'snack', 'tank', 'pink'],
    age_9_10: ['cat', 'can', 'tact', 'stack', 'spick', 'spank', 'panic', 'picnic', 'napkin', 'attack'],
  },
  k: {
    age_5_6: ['cat', 'can', 'cap', 'act', 'kit', 'pick', 'pack', 'sack', 'sick', 'tick'],
    age_7_8: ['cat', 'can', 'cap', 'kit', 'stick', 'skip', 'skin', 'snack', 'tank', 'pink'],
    age_9_10: ['cat', 'can', 'tact', 'stack', 'spick', 'spank', 'panic', 'picnic', 'napkin', 'attack'],
  },
  ck: {
    age_5_6: ['cat', 'can', 'cap', 'act', 'kit', 'pick', 'pack', 'sack', 'sick', 'tick'],
    age_7_8: ['cat', 'can', 'cap', 'kit', 'stick', 'skip', 'skin', 'snack', 'tank', 'pink'],
    age_9_10: ['cat', 'can', 'tact', 'stack', 'spick', 'spank', 'panic', 'picnic', 'napkin', 'attack'],
  },

  // Âm 8: /e/ - Đã học {s, a, t, i, p, n, c, k, ck, e}
  e: {
    age_5_6: ['set', 'pet', 'net', 'pen', 'ten', 'peck', 'neck', 'step'],
    age_7_8: ['set', 'pet', 'net', 'pen', 'test', 'pest', 'nest', 'sent', 'tent', 'peck'],
    age_9_10: ['set', 'pen', 'speck', 'step', 'neck', 'kitten', 'tennis', 'insect', 'ticket', 'inspect'],
  },

  // Âm 9: /h/ - Đã học {s, a, t, i, p, n, c, k, ck, e, h} (chưa học m, d, l, o, u)
  h: {
    age_5_6: ['hat', 'hen', 'hip', 'hit'],
    age_7_8: ['hat', 'hen', 'hip', 'hit', 'hiss', 'hint', 'hack'],
    age_9_10: ['hat', 'hen', 'hip', 'hit', 'hiss', 'hint', 'hack', 'hectic', 'happen'],
  },

  // Âm 10: /r/ - Đã học {s, a, t, i, p, n, c, k, ck, e, h, r} (chưa học m, d, o, u)
  r: {
    age_5_6: ['rat', 'rip', 'ran', 'rack', 'rest', 'rent'],
    age_7_8: ['rat', 'rip', 'ran', 'rest', 'rack', 'rent', 'press', 'track', 'trap', 'trip'],
    age_9_10: ['rat', 'ran', 'strip', 'scrap', 'strap', 'strict', 'trick', 'racket', 'resist', 'spirit'],
  },

  // Âm 11: /m/ - Đã học {s, a, t, i, p, n, c, k, ck, e, h, r, m} (chưa học d, o, u)
  m: {
    age_5_6: ['man', 'men', 'map', 'mat', 'hem', 'ham', 'him'],
    age_7_8: ['man', 'men', 'map', 'mat', 'mess', 'miss', 'mist', 'mint', 'stamp', 'camp'],
    age_9_10: ['man', 'map', 'mass', 'tram', 'mist', 'mint', 'cram', 'mimic', 'attempt', 'mattress'],
  },

  // Âm 12: /d/ - Đã học {s, a, t, i, p, n, c, k, ck, e, h, r, m, d}
  d: {
    age_5_6: ['dad', 'den', 'did', 'dip', 'sad', 'red', 'mad', 'had', 'hid', 'din'],
    age_7_8: ['dad', 'den', 'did', 'dip', 'desk', 'sand', 'mend', 'send', 'spend', 'stand'],
    age_9_10: ['dad', 'dip', 'disc', 'deck', 'tend', 'dim', 'mid', 'timid', 'addict', 'intend'],
  },

  // ==========================================
  // NHÓM 3: g, o, u, l, f, b
  // ==========================================

  // Âm 13: /g/ - Đã học {s, a, t, i, p, n, c, k, ck, e, h, r, m, d, g} (chưa học o, u, l, f, b)
  g: {
    age_5_6: ['gas', 'pig', 'peg', 'gap', 'get', 'dig', 'rag', 'tag', 'sag', 'nag'],
    age_7_8: ['gas', 'pig', 'peg', 'gap', 'drag', 'snag', 'grip', 'gran', 'grin', 'grand'],
    age_9_10: ['gas', 'pig', 'stag', 'crag', 'gram', 'grim', 'grip', 'magnet', 'pigment', 'segment'],
  },

  // Âm 14: /o/ - Đã học {s, a, t, i, p, n, c, k, ck, e, h, r, m, d, g, o} (chưa học u, l, f, b)
  o: {
    age_5_6: ['top', 'pop', 'pot', 'pod', 'cot', 'cod', 'hot', 'hop', 'rot', 'rod'],
    age_7_8: ['top', 'pop', 'pot', 'pod', 'cost', 'rock', 'pond', 'sock', 'spot', 'stop'],
    age_9_10: ['pot', 'pod', 'mock', 'dock', 'crop', 'drop', 'cross', 'topic', 'pocket', 'cotton'],
  },

  // Âm 15: /u/ - Đã học {s, a, t, i, p, n, c, k, ck, e, h, r, m, d, g, o, u} (chưa học l, f, b)
  u: {
    age_5_6: ['sun', 'nut', 'cup', 'cut', 'hum', 'gum', 'tug', 'hug', 'mug', 'mud'],
    age_7_8: ['sun', 'nut', 'cup', 'cut', 'dust', 'dump', 'duck', 'tuck', 'pump', 'hunt'],
    age_9_10: ['cup', 'cut', 'drug', 'stump', 'skunk', 'crust', 'trunk', 'sunset', 'puppet', 'cactus'],
  },

  // Âm 16: /l/ - Đã học {s, a, t, i, p, n, c, k, ck, e, h, r, m, d, g, o, u, l} (chưa học f, b)
  l: {
    age_5_6: ['lap', 'lit', 'let', 'leg', 'log', 'lip', 'led', 'lot', 'lid', 'pal'],
    age_7_8: ['lap', 'lit', 'leg', 'log', 'lock', 'clap', 'clip', 'plan', 'plug', 'plum'],
    age_9_10: ['lap', 'leg', 'kilt', 'clamp', 'drill', 'plank', 'split', 'laptop', 'insult', 'helmet'],
  },

  // Âm 17: /f/ - Đã học {s, a, t, i, p, n, c, k, ck, e, h, r, m, d, g, o, u, l, f} (chưa học b)
  f: {
    age_5_6: ['fat', 'fin', 'fun', 'fog', 'fan', 'fit', 'fed', 'fell', 'fill', 'off'],
    age_7_8: ['fat', 'fin', 'fan', 'fit', 'soft', 'lift', 'fist', 'felt', 'gift', 'flag'],
    age_9_10: ['fat', 'fin', 'cuff', 'cliff', 'drift', 'frost', 'flock', 'infect', 'muffin', 'traffic'],
  },

  // Âm 18: /b/ - Đã học {s, a, t, i, p, n, c, k, ck, e, h, r, m, d, g, o, u, l, f, b}
  b: {
    age_5_6: ['bad', 'bat', 'bib', 'bag', 'rub', 'bit', 'bin', 'pub', 'cub', 'bed'],
    age_7_8: ['bad', 'bat', 'bag', 'bed', 'belt', 'bump', 'bend', 'best', 'crab', 'club'],
    age_9_10: ['bad', 'bat', 'stub', 'blot', 'blunt', 'blank', 'brisk', 'cabin', 'rabbit', 'button'],
  },

  // ==========================================
  // NHÓM 4: ai, j, oa, ie, ee, or
  // ==========================================

  // Âm 19: /ai/ - Đã học {s..b, ai}
  ai: {
    age_5_6: ['aim', 'rain', 'sail', 'pain', 'tail', 'rail', 'paid', 'nail', 'main', 'hail'],
    age_7_8: ['rain', 'sail', 'pain', 'tail', 'paint', 'train', 'snail', 'brain', 'plain', 'stain'],
    age_9_10: ['rain', 'sail', 'faint', 'grain', 'sprain', 'strain', 'trail', 'afraid', 'remain', 'obtain'],
  },

  // Âm 20: /j/ - Đã học {s..b, ai, j}
  j: {
    age_5_6: ['jog', 'jam', 'jet', 'job', 'jug', 'jut', 'jab'],
    age_7_8: ['jog', 'jam', 'jet', 'job', 'jump', 'just', 'junk', 'jail', 'jest', 'jug'],
    age_9_10: ['jam', 'jet', 'jab', 'jut', 'jail', 'jump', 'jacket', 'object', 'project', 'subject'],
  },

  // Âm 21: /oa/ - Đã học {s..b, ai, j, oa}
  oa: {
    age_5_6: ['boat', 'goat', 'load', 'soap', 'road', 'loaf', 'oak', 'soak', 'foam', 'toad'],
    age_7_8: ['boat', 'goat', 'soap', 'road', 'toast', 'roast', 'coat', 'groan', 'float', 'coast'],
    age_9_10: ['boat', 'road', 'moat', 'cloak', 'croak', 'boast', 'load', 'unload', 'afloat', 'railroad'],
  },

  // Âm 22: /ie/ - Đã học {s..b, ai, j, oa, ie}
  ie: {
    age_5_6: ['pie', 'tie', 'die', 'lie', 'tied', 'died', 'lied', 'cries', 'fries', 'tries'],
    age_7_8: ['pie', 'tie', 'die', 'lie', 'dried', 'fried', 'tried', 'skies', 'flies', 'untie'],
    age_9_10: ['pie', 'tie', 'die', 'lie', 'spies', 'dries', 'spied', 'untie', 'magpie', 'necktie'],
  },

  // Âm 23: /ee/ - Đã học {s..b, ai, j, oa, ie, ee}
  ee: {
    age_5_6: ['bee', 'see', 'seed', 'need', 'feet', 'deep', 'heel', 'beef', 'jeep', 'meet'],
    age_7_8: ['bee', 'see', 'feet', 'deep', 'sleep', 'green', 'free', 'street', 'speed', 'bleed'],
    age_9_10: ['see', 'feet', 'steel', 'greed', 'screen', 'greet', 'creep', 'canteen', 'asleep', 'coffee'],
  },

  // Âm 24: /or/ - Đã học {s..b, ai, j, oa, ie, ee, or}
  or: {
    age_5_6: ['for', 'sort', 'torn', 'horn', 'born', 'pork', 'cork', 'fork', 'corn', 'fort'],
    age_7_8: ['for', 'horn', 'born', 'fork', 'sport', 'storm', 'stork', 'snort', 'form', 'port'],
    age_9_10: ['for', 'born', 'form', 'port', 'cord', 'snort', 'stork', 'inform', 'record', 'tractor'],
  },

  // ==========================================
  // NHÓM 5: z, w, ng, v, oo (ngắn), oo (dài)
  // ==========================================

  // Âm 25: /z/ - Đã học {s..or, z}
  z: {
    age_5_6: ['zip', 'zap', 'buzz', 'fizz', 'fuzz', 'jazz', 'zest'],
    age_7_8: ['zip', 'zap', 'buzz', 'fizz', 'fuzz', 'jazz', 'zest', 'zigzag'],
    age_9_10: ['zip', 'zap', 'buzz', 'fizz', 'fuzz', 'jazz', 'zest', 'zigzag'],
  },

  // Âm 26: /w/ - Đã học {s..or, z, w}
  w: {
    age_5_6: ['win', 'web', 'wet', 'wag', 'wig', 'went', 'wind', 'well', 'will', 'swim'],
    age_7_8: ['win', 'web', 'wet', 'wag', 'swam', 'twig', 'twin', 'week', 'twist', 'sweep'],
    age_9_10: ['win', 'wet', 'swift', 'west', 'wept', 'swell', 'twist', 'wagon', 'cobweb', 'wigwam'],
  },

  // Âm 27: /ng/ - Đã học {s..or, z, w, ng}
  ng: {
    age_5_6: ['ring', 'sing', 'bang', 'song', 'wing', 'hang', 'long', 'king', 'sung', 'rang'],
    age_7_8: ['ring', 'sing', 'bang', 'song', 'sting', 'spring', 'bring', 'swing', 'strong', 'string'],
    age_9_10: ['ring', 'sing', 'lung', 'clang', 'sling', 'flung', 'spring', 'singing', 'morning', 'oblong'],
  },

  // Âm 28: /v/ - Đã học {s..or, z, w, ng, v}
  v: {
    age_5_6: ['van', 'vet', 'vat', 'vim', 'vest', 'vent', 'vain'],
    age_7_8: ['van', 'vet', 'vat', 'vim', 'vest', 'vent', 'vain', 'seven', 'visit', 'vivid'],
    age_9_10: ['van', 'vet', 'vest', 'vent', 'vain', 'vivid', 'velvet', 'seven', 'invent', 'victim'],
  },

  // Âm 29: /oo-short/ (oo ngắn) - Đã học {s..or, z, w, ng, v, oo}
  'oo-short': {
    age_5_6: ['good', 'wood', 'wool', 'soot', 'foot', 'hood', 'book', 'took', 'look', 'cook'],
    age_7_8: ['good', 'wood', 'book', 'look', 'hook', 'woof', 'stood', 'brook', 'cook', 'took'],
    age_9_10: ['wood', 'book', 'brook', 'crook', 'stood', 'took', 'hook', 'wooden', 'woodland', 'scrapbook'],
  },

  // Âm 30: /oo-long/ (oo dài) - Đã học {s..or, z, w, ng, v, oo}
  'oo-long': {
    age_5_6: ['zoo', 'moo', 'cool', 'fool', 'hoof', 'mood', 'pool', 'food', 'moon', 'loop'],
    age_7_8: ['zoo', 'cool', 'pool', 'food', 'moon', 'roof', 'room', 'boot', 'tool', 'spoon'],
    age_9_10: ['zoo', 'moon', 'boom', 'hoot', 'bloom', 'gloom', 'scoop', 'igloo', 'tattoo', 'bamboo'],
  },

  // ==========================================
  // NHÓM 6: y, x, ch, sh, th (nhẹ), th (rung)
  // ==========================================

  // Âm 31: /y/ - Đã học {s..oo, y} (phụ âm /j/)
  y: {
    age_5_6: ['yes', 'yap', 'yet', 'yak', 'yam', 'yuck', 'yank', 'yell', 'yelp'],
    age_7_8: ['yes', 'yap', 'yet', 'yak', 'yam', 'yuck', 'yank', 'yell', 'yelp'],
    age_9_10: ['yes', 'yap', 'yet', 'yak', 'yam', 'yuck', 'yank', 'yell', 'yelp'],
  },

  // Âm 32: /x/ - Đã học {s..oo, y, x}
  x: {
    age_5_6: ['six', 'fox', 'fix', 'box', 'wax', 'mix', 'fax', 'tax', 'max', 'ox'],
    age_7_8: ['six', 'fox', 'fix', 'box', 'next', 'flex', 'text', 'max', 'boxing', 'toolbox'],
    age_9_10: ['six', 'box', 'fax', 'flex', 'tax', 'text', 'expect', 'exit', 'exam', 'index'],
  },

  // Âm 33: /ch/ - Đã học {s..oo, y, x, ch}
  ch: {
    age_5_6: ['chin', 'chap', 'rich', 'chop', 'chum', 'chat', 'much', 'chill', 'such', 'chug'],
    age_7_8: ['chin', 'chop', 'chat', 'rich', 'chips', 'punch', 'bench', 'bunch', 'lunch', 'chick'],
    age_9_10: ['chin', 'chop', 'chess', 'poach', 'porch', 'speech', 'trench', 'chicken', 'sandwich', 'ostrich'],
  },

  // Âm 34: /sh/ - Đã học {s..oo, y, x, ch, sh}
  sh: {
    age_5_6: ['fish', 'shop', 'dish', 'wish', 'ship', 'hush', 'rush', 'shed', 'shut', 'rash'],
    age_7_8: ['fish', 'shop', 'dish', 'ship', 'shell', 'shock', 'brush', 'smash', 'crash', 'flash'],
    age_9_10: ['fish', 'shop', 'shift', 'shrug', 'shrink', 'flesh', 'crush', 'polish', 'vanish', 'shampoo'],
  },

  // Âm 35: /th-unvoiced/ (th không rung / nhẹ) - Đã học {s..oo, y, x, ch, sh, th}
  'th-unvoiced': {
    age_5_6: ['thin', 'moth', 'pith', 'tenth', 'thing', 'thick', 'thud', 'thump', 'tooth', 'teeth'],
    age_7_8: ['thin', 'moth', 'tenth', 'thick', 'cloth', 'three', 'thorn', 'throat', 'thank', 'think'],
    age_9_10: ['thin', 'moth', 'faith', 'north', 'thrill', 'froth', 'theft', 'method', 'toothbrush', 'toothpick'],
  },

  // Âm 36: /th-voiced/ (th rung) - Đã học {s..oo, y, x, ch, sh, th} (chưa học er)
  'th-voiced': {
    age_5_6: ['this', 'that', 'then', 'them', 'than', 'with', 'thus', 'smooth'],
    age_7_8: ['this', 'that', 'then', 'them', 'than', 'with', 'thus', 'smooth', 'within'],
    age_9_10: ['this', 'that', 'then', 'them', 'than', 'with', 'thus', 'smooth', 'within'],
  },

  // ==========================================
  // NHÓM 7: qu, ou, oi, ue, er, ar
  // ==========================================

  // Âm 37: /qu/ - Đã học {s..th, qu}
  qu: {
    age_5_6: ['quiz', 'quick', 'quack', 'quit', 'quin', 'queen', 'quilt', 'quill', 'quail', 'squid'],
    age_7_8: ['quiz', 'quick', 'quack', 'quit', 'queen', 'quilt', 'quill', 'squid', 'squint', 'quest'],
    age_9_10: ['quiz', 'quit', 'quill', 'squid', 'squint', 'quench', 'quest', 'liquid', 'tranquil', 'quintet'],
  },

  // Âm 38: /ou/ - Đã học {s..th, qu, ou}
  ou: {
    age_5_6: ['out', 'loud', 'found', 'shout', 'mouth', 'round', 'pound', 'sound', 'count', 'noun'],
    age_7_8: ['out', 'loud', 'shout', 'mouth', 'proud', 'cloud', 'ground', 'couch', 'pouch', 'scout'],
    age_9_10: ['out', 'loud', 'hound', 'pouch', 'south', 'stout', 'trout', 'amount', 'account', 'outlook'],
  },

  // Âm 39: /oi/ - Đã học {s..th, qu, ou, oi}
  oi: {
    age_5_6: ['oil', 'boil', 'soil', 'join', 'coin', 'foil', 'coil', 'joint', 'point', 'spoil'],
    age_7_8: ['oil', 'boil', 'soil', 'coin', 'joint', 'point', 'spoilt', 'moist', 'broil', 'groin'],
    age_9_10: ['oil', 'coin', 'foil', 'moist', 'toil', 'joint', 'point', 'tinfoil', 'poison', 'avoid'],
  },

  // Âm 40: /ue/ - Đã học {s..th, qu, ou, oi, ue}
  ue: {
    age_5_6: ['cue', 'due', 'hue', 'sue', 'blue', 'clue', 'glue', 'true', 'flue'],
    age_7_8: ['cue', 'due', 'blue', 'clue', 'glue', 'true', 'fuel', 'cruel', 'rescue', 'statue'],
    age_9_10: ['cue', 'due', 'blue', 'clue', 'fuel', 'duel', 'gruel', 'value', 'rescue', 'statue'],
  },

  // Âm 41: /er/ - Đã học {s..th, qu, ou, oi, ue, er}
  er: {
    age_5_6: ['her', 'kerb', 'herd', 'fern', 'perm', 'herb', 'perch', 'stern', 'term', 'verb'],
    age_7_8: ['her', 'herd', 'fern', 'term', 'perch', 'verb', 'herb', 'winter', 'summer', 'letter'],
    age_9_10: ['her', 'term', 'verb', 'stern', 'perch', 'sister', 'silver', 'tender', 'blender', 'expert'],
  },

  // Âm 42: /ar/ - Đã học trọn bộ 42 âm {s..ar}
  ar: {
    age_5_6: ['arm', 'car', 'far', 'art', 'jar', 'bar', 'ark', 'tar', 'hard', 'farm'],
    age_7_8: ['car', 'far', 'jar', 'bar', 'barn', 'card', 'park', 'dark', 'bark', 'star'],
    age_9_10: ['car', 'bar', 'tart', 'cart', 'chart', 'harsh', 'harp', 'target', 'market', 'carpet'],
  },
};

export function getWordBankForSound(soundId: string, level: BlendingLevelKey): string[] {
  // Âm /s/ là âm đầu tiên trong tiến trình Jolly Phonics: không có từ nào để ghép vần
  if (soundId === 's') {
    return [];
  }

  const clean = soundId.toLowerCase().trim();
  let rawList: string[] = [];

  // 3 mặt chữ c, k, ck đều chung 1 âm /k/
  if (['c', 'k', 'ck', 'c-k', 'c/k', 'c_k', 'c, k', 'c,k', 'c k', 'c k ck'].includes(clean)) {
    rawList = WORDBANK_BY_SOUND['c-k']?.[level] || [];
  } else if (WORDBANK_BY_SOUND[clean]?.[level] !== undefined) {
    rawList = WORDBANK_BY_SOUND[clean][level];
  } else {
    // Tìm theo alias / biến thể tên âm (ví dụ: 'oo_short', 'th_unvoiced')
    const normalizedKey = clean.replace(/-/g, '_');
    const foundKey = Object.keys(WORDBANK_BY_SOUND).find(
      (k) => k === clean || k === normalizedKey || clean.startsWith(k)
    );

    if (foundKey && WORDBANK_BY_SOUND[foundKey]?.[level] !== undefined) {
      rawList = WORDBANK_BY_SOUND[foundKey][level];
    }
  }

  // Đảm bảo tuyệt đối không trùng từ (mỗi từ chỉ xuất hiện đúng 1 lần)
  const seen = new Set<string>();
  const uniqueList: string[] = [];
  for (const w of rawList) {
    const normalizedWord = w.toLowerCase().trim();
    if (normalizedWord && !seen.has(normalizedWord)) {
      seen.add(normalizedWord);
      uniqueList.push(normalizedWord);
    }
  }

  return uniqueList;
}
