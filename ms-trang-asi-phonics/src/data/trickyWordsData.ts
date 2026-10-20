export interface TrickyGroup {
  id: number;
  name: string;
  set1: string[];
  set2: string[];
  sentence: string;
  desc: string;
}

export const TRICKY_WORDS_DATA: Record<number, TrickyGroup> = {
  1: {
    id: 1,
    name: 'Nhóm 1',
    set1: ['I', 'he', 'she', 'the', 'we', 'me'],
    set2: ['was', 'to', 'do', 'are', 'all', 'you'],
    sentence: 'He said: We all like the sun.',
    desc: 'Thẻ Flashcard viền đậm chuẩn Group 1 • Chạm để nghe phát âm giọng chuẩn bản ngữ'
  },
  2: {
    id: 2,
    name: 'Nhóm 2',
    set1: ['your', 'come', 'some', 'said', 'here', 'there'],
    set2: ['they', 'go', 'no', 'so', 'my', 'one'],
    sentence: 'Come here and go with my friend.',
    desc: 'Thẻ Flashcard viền đậm chuẩn Group 2 • Chạm để nghe phát âm giọng chuẩn bản ngữ'
  },
  3: {
    id: 3,
    name: 'Nhóm 3',
    set1: ['by', 'only', 'old', 'like', 'have', 'live'],
    set2: ['give', 'little', 'down', 'what', 'when', 'why'],
    sentence: 'The little dog likes to have fun down here.',
    desc: 'Thẻ Flashcard viền đậm chuẩn Group 3 • Chạm để nghe phát âm giọng chuẩn bản ngữ'
  },
  4: {
    id: 4,
    name: 'Nhóm 4',
    set1: ['where', 'who', 'which', 'any', 'many', 'more'],
    set2: ['before', 'other', 'were', 'because', 'want', 'saw'],
    sentence: 'Where were the children because I want more?',
    desc: 'Thẻ Flashcard viền đậm chuẩn Group 4 • Chạm để nghe phát âm giọng chuẩn bản ngữ'
  },
  5: {
    id: 5,
    name: 'Nhóm 5',
    set1: ['put', 'could', 'should', 'would', 'right', 'two'],
    set2: ['four', 'goes', 'does', 'made', 'their', 'once'],
    sentence: 'He could put two toys into their bag once.',
    desc: 'Thẻ Flashcard viền đậm chuẩn Group 5 • Chạm để nghe phát âm giọng chuẩn bản ngữ'
  },
  6: {
    id: 6,
    name: 'Nhóm 6',
    set1: ['upon', 'always', 'also', 'of', 'eight', 'love'],
    set2: ['cover', 'after', 'every', 'mother', 'father', 'brother'],
    sentence: 'Once upon a time, my mother always gave love.',
    desc: 'Thẻ Flashcard viền đậm chuẩn Group 6 • Chạm để nghe phát âm giọng chuẩn bản ngữ'
  }
};
