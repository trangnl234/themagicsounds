/**
 * Công cụ phân tích âm tiết (Syllable Helper) cho Jolly Phonics
 * Xác định từ 2 âm tiết và vị trí phân tách (xuộc mờ) giữa âm tiết 1 và âm tiết 2
 */

export interface SyllableSplitInfo {
  isTwoSyllable: boolean;
  splitPhonemeIndex: number; // Vị trí phoneme cuối cùng của âm tiết 1 (xuộc sẽ nằm giữa index này và index + 1)
  syllable1: string;
  syllable2: string;
}

// Từ điển ánh xạ chuẩn âm tiết 1 cho các từ 2 âm tiết trong Jolly Phonics Word Bank
const TWO_SYLLABLE_DICT: Record<string, string> = {
  // Nhóm CVC kép (Rabbit Rule VC/CV)
  rabbit: 'rab',
  kitten: 'kit',
  mitten: 'mit',
  button: 'but',
  cotton: 'cot',
  rotten: 'rot',
  muffin: 'muf',
  ribbon: 'rib',
  ladder: 'lad',
  hammer: 'ham',
  butter: 'but',
  letter: 'let',
  summer: 'sum',
  dinner: 'din',
  happen: 'hap',
  sudden: 'sud',
  lesson: 'les',
  tennis: 'ten',
  traffic: 'traf',
  attic: 'at',
  attack: 'at',
  copper: 'cop',
  robber: 'rob',
  digger: 'dig',
  runner: 'run',
  coffee: 'cof',
  puppy: 'pup',
  funny: 'fun',
  puzzle: 'puz',
  assist: 'as',
  attempt: 'at',
  mattress: 'mat',

  // Phân tách 2 phụ âm giữa 2 nguyên âm (VC/CV)
  napkin: 'nap',
  picnic: 'pic',
  insect: 'in',
  magnet: 'mag',
  pigment: 'pig',
  segment: 'seg',
  helmet: 'hel',
  carpet: 'car',
  market: 'mar',
  target: 'tar',
  winter: 'win',
  silver: 'sil',
  cactus: 'cac',
  plastic: 'plas',
  hectic: 'hec',
  sister: 'sis',
  forest: 'for',
  morning: 'morn',
  finger: 'fing',
  tender: 'ten',
  blender: 'blen',
  velvet: 'vel',
  canteen: 'can',
  invent: 'in',
  expert: 'ex',
  object: 'ob',
  laptop: 'lap',
  index: 'in',
  public: 'pub',
  insult: 'in',
  intend: 'in',
  infect: 'in',
  impact: 'im',
  combat: 'com',
  expect: 'ex',
  disgust: 'dis',
  tractor: 'trac',
  victim: 'vic',
  chicken: 'chick',
  sandwich: 'sand',
  thimble: 'thim',
  tranquil: 'tran',
  pasta: 'pas',
  ostrich: 'os',
  kingdom: 'king',
  panther: 'pan',

  // Từ ghép (Compound words)
  sunset: 'sun',
  cobweb: 'cob',
  zigzag: 'zig',
  sunshine: 'sun',
  toolbox: 'tool',
  scrapbook: 'scrap',
  necktie: 'neck',
  rainbow: 'rain',
  railroad: 'rail',
  tinfoil: 'tin',
  outside: 'out',
  woodland: 'wood',

  // Hậu tố & âm đôi (VC/V, V/CV)
  ticket: 'tick',
  racket: 'rack',
  pocket: 'pock',
  rocket: 'rock',
  locket: 'lock',
  jacket: 'jack',
  packet: 'pack',
  socket: 'sock',
  bucket: 'buck',
  panic: 'pan',
  mimic: 'mim',
  timid: 'tim',
  topic: 'top',
  visit: 'vis',
  puppet: 'pup',
  cabin: 'cab',
  liquid: 'li',
  exit: 'ex',
  exam: 'ex',
  igloo: 'ig',
  magpie: 'mag',
  pylon: 'py',
  python: 'py',
  window: 'win',
  yellow: 'yel',
  shadow: 'shad',
  elbow: 'el',
  pillow: 'pil',
  wagon: 'wag',
  travel: 'trav',
  seven: 'sev',
  vivid: 'viv',
  wooden: 'wood',
  tattoo: 'tat',
  shampoo: 'sham',
  boxing: 'box',
  polish: 'pol',
  vanish: 'van',
  method: 'meth',
  other: 'oth',
  gather: 'gath',
  within: 'with',
  bother: 'both',
  northern: 'north',
  spirit: 'spir',
  afraid: 'a',
  afloat: 'a',
  asleep: 'a',
  remain: 're',
  resist: 're',
  insist: 'in',
  inform: 'in',
  unload: 'un',
  untie: 'un',
  record: 'rec',
  zebra: 'ze',
  amount: 'a',
  account: 'ac',
  poison: 'poi',
  avoid: 'a',
  tissue: 'tis',
  rescue: 'res',
  statue: 'stat',
  addict: 'ad',
  // Alternative Spellings 2-syllable words (Jolly Phonics Word Book)
  crayon: 'cray',
  delay: 'de',
  sunday: 'sun',
  friday: 'fri',
  birthday: 'birth',
  playground: 'play',
  pancake: 'pan',
  cupcake: 'cup',
  peanut: 'pea',
  complete: 'com',
  athlete: 'ath',
  extreme: 'ex',
  concrete: 'con',
  delete: 'de',
  compete: 'com',
  stampede: 'stam',
  sunny: 'sun',
  bunny: 'bun',
  runny: 'run',
  happy: 'hap',
  poppy: 'pop',
  teddy: 'ted',
  daddy: 'dad',
  muddy: 'mud',
  baby: 'ba',
  lady: 'la',
  windy: 'wind',
  sandy: 'sand',
  handy: 'hand',
  candy: 'can',
  berry: 'ber',
  cherry: 'cher',
  merry: 'mer',
  lorry: 'lor',
  party: 'par',
  frosty: 'frost',
  greedy: 'greed',
  hungry: 'hung',
  tonight: 'to',
  midnight: 'mid',
  sunlight: 'sun',
  lightning: 'light',
  deny: 'de',
  rely: 're',
  reply: 're',
  supply: 'sup',
  july: 'ju',
  inside: 'in',
  bedtime: 'bed',
  snowman: 'snow',
  tadpole: 'tad',
  alone: 'a',
  jewel: 'jew',
  nephew: 'neph',
  cashew: 'cash',
  skewer: 'skew',
  ruler: 'rul',
  excuse: 'ex',
  refuse: 're',
  costume: 'cos',
  perfume: 'per',
  compute: 'com',
  thirsty: 'thirst',
  circus: 'cir',
  thirteen: 'thir',
  thirty: 'thir',
  purple: 'pur',
  turtle: 'tur',
  turkey: 'tur',
  turnip: 'tur',
  burger: 'bur',
  thursday: 'thurs',
  enjoy: 'en',
  annoy: 'an',
  destroy: 'de',
  employ: 'em',
  royal: 'roy',
  loyal: 'loy',
  oyster: 'oys',
  cowboy: 'cow',
  toyshop: 'toy',
  flower: 'flow',
  tower: 'tow',
  shower: 'show',
  powder: 'pow',
  towel: 'tow',
  always: 'al',
  almost: 'al',
  walnut: 'wal',
  football: 'foot',
  snowball: 'snow',
  august: 'au',
  autumn: 'au',
  author: 'au',
  saucer: 'sau',
  laundry: 'laun',
  awful: 'aw',
  drawer: 'draw',
  jigsaw: 'jig',
  seesaw: 'see',
  city: 'cit',
  pencil: 'pen',
  magic: 'mag',
  giant: 'gi',
  ginger: 'gin',
  orange: 'or',
  village: 'vil',
  photo: 'pho',
  dolphin: 'dol',
  orphan: 'or',
  trophy: 'tro',
  phantom: 'phan',
  phonics: 'phon',
  triumph: 'tri',
  whisper: 'whis',
  whistle: 'whis',
  whisker: 'whisk',
  whirlwind: 'whirl',
  fairy: 'fair',
  hairy: 'hair',
  airy: 'air',
  repair: 're',
  despair: 'de',
  airport: 'air',
  armchair: 'arm',
  funfair: 'fun',
  aware: 'a',
  prepare: 'pre',
  compare: 'com',
  careful: 'care',
  nearly: 'near',
  appear: 'ap',
  career: 'ca',
  cheerful: 'cheer',
  sincere: 'sin',
  lucky: 'luck',
  foggy: 'fog',
  ahoy: 'a',
  icy: 'i',
  lacy: 'la',
  racy: 'ra',
  spicy: 'spi',
  fancy: 'fan',
  mercy: 'mer',
  cycle: 'cy',
  cyber: 'cy',
  cymbal: 'cym',
  acid: 'ac',
  civic: 'civ',
  civil: 'civ',
  circle: 'cir',
  cider: 'ci',
  stencil: 'sten',
  gypsy: 'gyp',
  stingy: 'stin',
  spongy: 'spon',
  digit: 'dig',
  logic: 'log',
  tragic: 'trag',
  rigid: 'rig',
  margin: 'mar',
  engine: 'en',
  giraffe: 'gi',
  obtain: 'ob',
  wigwam: 'wig',
  oblong: 'ob',
  bamboo: 'bam',
  toothbrush: 'tooth',
  toothpick: 'tooth',
  quintet: 'quin',
  outlook: 'out',
  value: 'val',
  fuel: 'fu',
  cruel: 'cru',
  duel: 'du',
  gruel: 'gru',
};

/**
 * Xác định từ có phải 2 âm tiết không và trả về vị trí phoneme cần đặt xuộc mờ
 */
export function getSyllableSplit(word: string, phonemes: string[]): SyllableSplitInfo | null {
  if (!word || !phonemes || phonemes.length <= 1) return null;
  const clean = word.toLowerCase().trim().replace(/[^a-z-]/g, '');
  if (!clean) return null;

  // 1. Trường hợp từ có chứa dấu gạch nối sẵn (ví dụ người dùng nhập "pic-nic", "nap-kin")
  if (clean.includes('-')) {
    const [p1, p2] = clean.split('-');
    let acc = '';
    for (let i = 0; i < phonemes.length; i++) {
      acc += phonemes[i];
      if (acc === p1 && i < phonemes.length - 1) {
        return {
          isTwoSyllable: true,
          splitPhonemeIndex: i,
          syllable1: p1,
          syllable2: p2,
        };
      }
    }
  }

  // 2. Tra cứu từ điển chuẩn (hỗ trợ cả khi phụ âm đôi như bb, nn, pp, tt, ff được gộp thành 1 phoneme)
  const syl1Target = TWO_SYLLABLE_DICT[clean];
  if (syl1Target) {
    let acc = '';
    for (let i = 0; i < phonemes.length; i++) {
      acc += phonemes[i];
      const isDoubleConsonantPhoneme =
        phonemes[i].length === 2 &&
        phonemes[i][0] === phonemes[i][1] &&
        !'aeiou'.includes(phonemes[i][0]);
      if (
        (acc === syl1Target || (isDoubleConsonantPhoneme && acc.slice(0, -1) === syl1Target)) &&
        i < phonemes.length - 1
      ) {
        return {
          isTwoSyllable: true,
          splitPhonemeIndex: i,
          syllable1: syl1Target,
          syllable2: clean.slice(syl1Target.length),
        };
      }
    }
  }

  // 3. Quy tắc giải mã Phonics tự động (Heuristic fallback)
  // Đếm nhóm nguyên âm cơ bản
  const vowelMatches = clean.match(/[aeiouy]+/g) || [];
  if (vowelMatches.length === 2 && clean.length >= 4) {
    // Không áp dụng cho từ tận cùng là e câm (silent e)
    const endsWithSilentE = clean.endsWith('e') && !clean.endsWith('ee') && !clean.endsWith('le');
    if (!endsWithSilentE) {
      // Tìm vị trí chia đôi hợp lý theo phụ âm kép giữa 2 nguyên âm
      const doubleConsonantMatch = clean.match(/([bcdfghjklmnpqrstvwxyz])\1/);
      if (doubleConsonantMatch && doubleConsonantMatch.index !== undefined) {
        const splitPos = doubleConsonantMatch.index + 1;
        const s1 = clean.slice(0, splitPos);
        const s2 = clean.slice(splitPos);
        let acc = '';
        for (let i = 0; i < phonemes.length; i++) {
          acc += phonemes[i];
          const isDoubleConsonantPhoneme =
            phonemes[i].length === 2 &&
            phonemes[i][0] === phonemes[i][1] &&
            !'aeiou'.includes(phonemes[i][0]);
          if (
            (acc === s1 || (isDoubleConsonantPhoneme && acc.slice(0, -1) === s1)) &&
            i < phonemes.length - 1
          ) {
            return {
              isTwoSyllable: true,
              splitPhonemeIndex: i,
              syllable1: s1,
              syllable2: s2,
            };
          }
        }
      }
    }
  }

  return null;
}
