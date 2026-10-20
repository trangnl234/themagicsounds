export interface CommonSentenceChunkItem {
  id: string;
  number: number;
  category: string;
  fullSentence: string;
  soundChunk: string;
  connectedGuide: string;
  meaning: string;
}

export interface ShortSpeechLine {
  id: string;
  sentence: string;
  connectedGuide: string;
  meaning: string;
  chunks: string[];
  imageUrl?: string;
}

export interface ShortSpeechLesson {
  id: string;
  number: number;
  titleEn: string;
  titleVi: string;
  level: string;
  topicTag: string;
  imageUrl: string;
  lines: ShortSpeechLine[];
}

export const COMMON_SENTENCE_CATEGORIES = [
  'Tất cả',
  'Chào hỏi & Làm quen',
  'Gia đình & Nhà cửa',
  'Trường học & Lớp học',
  'Ăn uống & Mua sắm',
  'Hoạt động hàng ngày',
  'Cảm xúc & Phản xạ',
  'Hỏi đáp & Nhờ giúp đỡ',
  'Thời tiết & Thời gian',
] as const;

export const COMMON_SENTENCES_80: CommonSentenceChunkItem[] = [
  {
    id: 'cs-01',
    number: 1,
    category: 'Chào hỏi & Làm quen',
    fullSentence: 'How is it going today?',
    soundChunk: 'how_is_it',
    connectedGuide: '[How-zi-going] today?',
    meaning: 'Hôm nay mọi việc của bạn thế nào?',
  },
  {
    id: 'cs-02',
    number: 2,
    category: 'Chào hỏi & Làm quen',
    fullSentence: 'Nice to meet you here.',
    soundChunk: 'nice_to_meet_you',
    connectedGuide: '[Nai-stə-mee-tʃu] here.',
    meaning: 'Rất vui được gặp bạn ở đây.',
  },
  {
    id: 'cs-03',
    number: 3,
    category: 'Chào hỏi & Làm quen',
    fullSentence: 'What is your name?',
    soundChunk: 'what_is_your',
    connectedGuide: '[Wha-tsjər] name?',
    meaning: 'Tên của bạn là gì?',
  },
  {
    id: 'cs-04',
    number: 4,
    category: 'Chào hỏi & Làm quen',
    fullSentence: 'Where are you from?',
    soundChunk: 'where_are_you',
    connectedGuide: '[Where-ə-ju] from?',
    meaning: 'Bạn đến từ đâu?',
  },
  {
    id: 'cs-05',
    number: 5,
    category: 'Chào hỏi & Làm quen',
    fullSentence: 'How old are you now?',
    soundChunk: 'old_are_you',
    connectedGuide: 'How [ol-dər-ju] now?',
    meaning: 'Bây giờ bạn bao nhiêu tuổi rồi?',
  },
  {
    id: 'cs-06',
    number: 6,
    category: 'Chào hỏi & Làm quen',
    fullSentence: 'It is good to see you again.',
    soundChunk: 'good_to_see_you',
    connectedGuide: 'It’s [gʊ-tə-see-ju] again.',
    meaning: 'Thật vui khi được gặp lại bạn.',
  },
  {
    id: 'cs-07',
    number: 7,
    category: 'Chào hỏi & Làm quen',
    fullSentence: 'Have a great day ahead!',
    soundChunk: 'have_a_great_day',
    connectedGuide: '[Ha-və] [grei-day] ahead!',
    meaning: 'Chúc bạn một ngày tuyệt vời phía trước!',
  },
  {
    id: 'cs-08',
    number: 8,
    category: 'Chào hỏi & Làm quen',
    fullSentence: 'See you later this afternoon.',
    soundChunk: 'this_afternoon',
    connectedGuide: 'See-ya later [thi-saf-tər-noon].',
    meaning: 'Hẹn gặp lại bạn chiều nay nhé.',
  },
  {
    id: 'cs-09',
    number: 9,
    category: 'Chào hỏi & Làm quen',
    fullSentence: 'See you the next day at school.',
    soundChunk: 'next_day',
    connectedGuide: 'See you the [neks-day] at school.',
    meaning: 'Hẹn gặp bạn ngày hôm sau ở trường nhé.',
  },
  {
    id: 'cs-10',
    number: 10,
    category: 'Chào hỏi & Làm quen',
    fullSentence: 'Take care of yourself!',
    soundChunk: 'take_care_of',
    connectedGuide: '[Tei-keə-rəv] yourself!',
    meaning: 'Hãy giữ gìn sức khoẻ nhé!',
  },
  {
    id: 'cs-11',
    number: 11,
    category: 'Gia đình & Nhà cửa',
    fullSentence: 'Can you pick it up for me?',
    soundChunk: 'pick_it_up',
    connectedGuide: 'Can you [pi-ki-tup] for me?',
    meaning: 'Bạn nhặt giúp mình lên được không?',
  },
  {
    id: 'cs-12',
    number: 12,
    category: 'Gia đình & Nhà cửa',
    fullSentence: 'Please turn off the light.',
    soundChunk: 'turn_off',
    connectedGuide: 'Please [tɜː-nɒf] the light.',
    meaning: 'Làm ơn tắt đèn giúp mình nhé.',
  },
  {
    id: 'cs-13',
    number: 13,
    category: 'Gia đình & Nhà cửa',
    fullSentence: 'Could you turn it on now?',
    soundChunk: 'turn_it_on',
    connectedGuide: 'Could-ja [tɜː-ni-tɒn] now?',
    meaning: 'Bạn bật nó lên bây giờ giúp mình được không?',
  },
  {
    id: 'cs-14',
    number: 14,
    category: 'Gia đình & Nhà cửa',
    fullSentence: 'Put away your toys, please.',
    soundChunk: 'put_away',
    connectedGuide: '[Pʊ-tə-wei] your toys, please.',
    meaning: 'Con cất đồ chơi gọn vào nhé.',
  },
  {
    id: 'cs-15',
    number: 15,
    category: 'Gia đình & Nhà cửa',
    fullSentence: 'Come in and sit down.',
    soundChunk: 'come_in_and_sit_down',
    connectedGuide: '[Cʌ-min] ənd [si-down].',
    meaning: 'Mời vào nhà và ngồi xuống nhé.',
  },
  {
    id: 'cs-16',
    number: 16,
    category: 'Gia đình & Nhà cửa',
    fullSentence: 'Clean up your room before dinner.',
    soundChunk: 'clean_up',
    connectedGuide: '[Klee-nʌp] your room before dinner.',
    meaning: 'Dọn phòng gọn gàng trước bữa tối nhé.',
  },
  {
    id: 'cs-17',
    number: 17,
    category: 'Gia đình & Nhà cửa',
    fullSentence: 'Wake up! It is time for breakfast.',
    soundChunk: 'wake_up_it_is',
    connectedGuide: '[Wei-kʌp]! [I-ts] time for breakfast.',
    meaning: 'Dậy thôi! Đến giờ ăn sáng rồi.',
  },
  {
    id: 'cs-18',
    number: 18,
    category: 'Gia đình & Nhà cửa',
    fullSentence: 'Wash your hands with soap.',
    soundChunk: 'wash_your',
    connectedGuide: '[Wɒ-ʃjər] hands with soap.',
    meaning: 'Rửa tay bằng xà phòng nhé.',
  },
  {
    id: 'cs-19',
    number: 19,
    category: 'Gia đình & Nhà cửa',
    fullSentence: 'Get dressed quickly, we are late.',
    soundChunk: 'get_dressed',
    connectedGuide: '[Ge-drest] quickly, we’re late.',
    meaning: 'Mặc quần áo nhanh lên, chúng ta muộn rồi.',
  },
  {
    id: 'cs-20',
    number: 20,
    category: 'Gia đình & Nhà cửa',
    fullSentence: 'Call me as soon as you get home.',
    soundChunk: 'as_soon_as',
    connectedGuide: 'CALL me [əz-SOON-əz] you GET HOME.',
    meaning: 'Gọi cho mình ngay khi bạn về tới nhà nhé.',
  },
  {
    id: 'cs-21',
    number: 21,
    category: 'Trường học & Lớp học',
    fullSentence: 'Open your book to page ten.',
    soundChunk: 'open_your_book',
    connectedGuide: '[əʊ-pən-jər] [bʊk-tə] page ten.',
    meaning: 'Mở sách của bạn ra trang số 10.',
  },
  {
    id: 'cs-22',
    number: 22,
    category: 'Trường học & Lớp học',
    fullSentence: 'Listen to the teacher carefully.',
    soundChunk: 'listen_to_the',
    connectedGuide: '[Li-sən-tə-ðə] teacher carefully.',
    meaning: 'Hãy lắng nghe cô giáo thật kỹ nhé.',
  },
  {
    id: 'cs-23',
    number: 23,
    category: 'Trường học & Lớp học',
    fullSentence: 'Look at the board right now.',
    soundChunk: 'look_at_the',
    connectedGuide: '[Lʊ-kət-ðə] board [rai-now].',
    meaning: 'Nhìn lên bảng ngay bây giờ nhé.',
  },
  {
    id: 'cs-24',
    number: 24,
    category: 'Trường học & Lớp học',
    fullSentence: 'Raise your hand if you know.',
    soundChunk: 'if_you_know',
    connectedGuide: '[Rei-zjər] hand [i-fju-nəʊ].',
    meaning: 'Giơ tay lên nếu con biết câu trả lời nhé.',
  },
  {
    id: 'cs-25',
    number: 25,
    category: 'Trường học & Lớp học',
    fullSentence: 'Write it down in your notebook.',
    soundChunk: 'write_it_down',
    connectedGuide: '[Rai-ti-down] in your notebook.',
    meaning: 'Viết điều đó vào vở của bạn nhé.',
  },
  {
    id: 'cs-26',
    number: 26,
    category: 'Trường học & Lớp học',
    fullSentence: 'Work in pairs with your friend.',
    soundChunk: 'work_in_pairs',
    connectedGuide: '[Wɜː-kɪn-peəz] with your friend.',
    meaning: 'Làm việc theo cặp cùng với bạn của mình nhé.',
  },
  {
    id: 'cs-27',
    number: 27,
    category: 'Trường học & Lớp học',
    fullSentence: 'Read out loud after me.',
    soundChunk: 'read_out_loud',
    connectedGuide: '[Ree-dout-loud] [ɑːf-tər] me.',
    meaning: 'Đọc to rõ ràng theo sau cô nhé.',
  },
  {
    id: 'cs-28',
    number: 28,
    category: 'Trường học & Lớp học',
    fullSentence: 'Can I borrow your pencil?',
    soundChunk: 'can_i_borrow',
    connectedGuide: '[Cə-nai] borrow your pencil?',
    meaning: 'Mình mượn bút chì của bạn được không?',
  },
  {
    id: 'cs-29',
    number: 29,
    category: 'Trường học & Lớp học',
    fullSentence: 'Are you ready for the test?',
    soundChunk: 'ready_for_the',
    connectedGuide: '[ɑː-ju] [re-di-fər-ðə] test?',
    meaning: 'Bạn đã sẵn sàng cho bài kiểm tra chưa?',
  },
  {
    id: 'cs-30',
    number: 30,
    category: 'Trường học & Lớp học',
    fullSentence: 'Time is up, put your pens down.',
    soundChunk: 'time_is_up',
    connectedGuide: '[Tai-mi-zʌp], [pʊ-tʃər] pens down.',
    meaning: 'Hết giờ rồi, các em đặt bút xuống nhé.',
  },
  {
    id: 'cs-31',
    number: 31,
    category: 'Ăn uống & Mua sắm',
    fullSentence: 'Would you like a cup of tea?',
    soundChunk: 'cup_of_tea',
    connectedGuide: 'Would-ja like-a [cu-pəv-tea]?',
    meaning: 'Bạn có muốn uống một tách trà không?',
  },
  {
    id: 'cs-32',
    number: 32,
    category: 'Ăn uống & Mua sắm',
    fullSentence: 'Can I have a glass of water?',
    soundChunk: 'glass_of_water',
    connectedGuide: '[Cə-nai] [ha-və] [glɑː-səv-wɔː-tər]?',
    meaning: 'Cho mình xin một cốc nước được không?',
  },
  {
    id: 'cs-33',
    number: 33,
    category: 'Ăn uống & Mua sắm',
    fullSentence: 'I would like a piece of cake.',
    soundChunk: 'piece_of_cake',
    connectedGuide: 'I’d [lai-kə] [pee-səv-keik].',
    meaning: 'Mình muốn một miếng bánh ngọt.',
  },
  {
    id: 'cs-34',
    number: 34,
    category: 'Ăn uống & Mua sắm',
    fullSentence: 'What do you want to eat?',
    soundChunk: 'want_to_eat',
    connectedGuide: '[Wha-dju] [wɒn-tə-eet]?',
    meaning: 'Bạn muốn ăn món gì?',
  },
  {
    id: 'cs-35',
    number: 35,
    category: 'Ăn uống & Mua sắm',
    fullSentence: 'Dinner is ready on the table.',
    soundChunk: 'on_the_table',
    connectedGuide: 'Dinner [ɪz-re-di] [ɒn-ðə-tei-bəl].',
    meaning: 'Bữa tối đã sẵn sàng ở trên bàn rồi.',
  },
  {
    id: 'cs-36',
    number: 36,
    category: 'Ăn uống & Mua sắm',
    fullSentence: 'How much is this shirt?',
    soundChunk: 'much_is_this',
    connectedGuide: 'How [mʌ-tʃɪz-ðɪs] shirt?',
    meaning: 'Chiếc áo sơ mi này giá bao nhiêu?',
  },
  {
    id: 'cs-37',
    number: 37,
    category: 'Ăn uống & Mua sắm',
    fullSentence: 'Can I try it on right here?',
    soundChunk: 'try_it_on',
    connectedGuide: '[Cə-nai] [trai-yi-tɒn] right here?',
    meaning: 'Mình có thể mặc thử nó ngay đây không?',
  },
  {
    id: 'cs-38',
    number: 38,
    category: 'Ăn uống & Mua sắm',
    fullSentence: 'Do you have a smaller size?',
    soundChunk: 'have_a_smaller',
    connectedGuide: '[Dju-ha-və] smaller size?',
    meaning: 'Bạn có cỡ nào nhỏ hơn không?',
  },
  {
    id: 'cs-39',
    number: 39,
    category: 'Ăn uống & Mua sắm',
    fullSentence: 'This apple tastes so sweet.',
    soundChunk: 'tastes_so_sweet',
    connectedGuide: '[Ðɪ-sæ-pəl] [tei-ssəʊ-sweet].',
    meaning: 'Quả táo này có vị ngọt thật đấy.',
  },
  {
    id: 'cs-40',
    number: 40,
    category: 'Ăn uống & Mua sắm',
    fullSentence: 'Help yourself to some fruit.',
    soundChunk: 'help_yourself',
    connectedGuide: '[Hel-pjɔː-self] tə some fruit.',
    meaning: 'Cứ tự nhiên ăn hoa quả nhé.',
  },
  {
    id: 'cs-41',
    number: 41,
    category: 'Hoạt động hàng ngày',
    fullSentence: 'What did you do this morning?',
    soundChunk: 'did_you',
    connectedGuide: 'What [di-dʒu] do this morning?',
    meaning: 'Sáng nay bạn đã làm gì thế?',
  },
  {
    id: 'cs-42',
    number: 42,
    category: 'Hoạt động hàng ngày',
    fullSentence: 'I am going to the park now.',
    soundChunk: 'going_to_the',
    connectedGuide: 'I’m [gəʊ-ɪŋ-tə-ðə] park now.',
    meaning: 'Bây giờ mình đang đi ra công viên.',
  },
  {
    id: 'cs-43',
    number: 43,
    category: 'Hoạt động hàng ngày',
    fullSentence: 'Let us go for a walk outside.',
    soundChunk: 'go_for_a_walk',
    connectedGuide: 'Let’s [gəʊ-fə-rə-wɔːk] outside.',
    meaning: 'Chúng mình cùng đi dạo bên ngoài nhé.',
  },
  {
    id: 'cs-44',
    number: 44,
    category: 'Hoạt động hàng ngày',
    fullSentence: 'Wait a minute, I am coming.',
    soundChunk: 'wait_a_minute',
    connectedGuide: '[Wei-tə-mi-nɪt], I’m coming.',
    meaning: 'Đợi một lát nhé, mình ra ngay đây.',
  },
  {
    id: 'cs-45',
    number: 45,
    category: 'Hoạt động hàng ngày',
    fullSentence: 'Hold on a second, please.',
    soundChunk: 'hold_on_a_second',
    connectedGuide: '[Həʊl-dɒ-nə] second, please.',
    meaning: 'Vui lòng giữ máy / chờ một giây nhé.',
  },
  {
    id: 'cs-46',
    number: 46,
    category: 'Hoạt động hàng ngày',
    fullSentence: 'Look out! The floor is wet.',
    soundChunk: 'look_out',
    connectedGuide: '[Lʊ-kout]! The [flɔː-rɪz] wet.',
    meaning: 'Cẩn thận kìa! Sàn nhà đang ướt đấy.',
  },
  {
    id: 'cs-47',
    number: 47,
    category: 'Hoạt động hàng ngày',
    fullSentence: 'Hurry up or we will miss the bus.',
    soundChunk: 'hurry_up',
    connectedGuide: '[Hʌ-ri-yʌp] or we’ll miss the bus.',
    meaning: 'Nhanh lên nào không là chúng ta lỡ xe buýt đấy.',
  },
  {
    id: 'cs-48',
    number: 48,
    category: 'Hoạt động hàng ngày',
    fullSentence: 'Put on your coat before going out.',
    soundChunk: 'put_on_your',
    connectedGuide: '[Pʊ-tɒn-jər] coat before going out.',
    meaning: 'Mặc áo khoác vào trước khi ra ngoài nhé.',
  },
  {
    id: 'cs-49',
    number: 49,
    category: 'Hoạt động hàng ngày',
    fullSentence: 'Take off your shoes at the door.',
    soundChunk: 'take_off_your',
    connectedGuide: '[Tei-kɒf-jər] shoes [æt-ðə] door.',
    meaning: 'Cởi giày của bạn ở ngay cửa nhé.',
  },
  {
    id: 'cs-50',
    number: 50,
    category: 'Hoạt động hàng ngày',
    fullSentence: 'It is time to go to bed.',
    soundChunk: 'time_to_go',
    connectedGuide: '[I-ts] [taim-tə-gəʊ] tə bed.',
    meaning: 'Đã đến giờ đi ngủ rồi.',
  },
  {
    id: 'cs-51',
    number: 51,
    category: 'Cảm xúc & Phản xạ',
    fullSentence: 'That is a great idea!',
    soundChunk: 'great_idea',
    connectedGuide: 'That’s-ə [grei-tai-diə]!',
    meaning: 'Đó quả là một ý kiến tuyệt vời!',
  },
  {
    id: 'cs-52',
    number: 52,
    category: 'Cảm xúc & Phản xạ',
    fullSentence: 'I am so happy for you.',
    soundChunk: 'happy_for_you',
    connectedGuide: 'I’m so [hæ-pi-fər-ju].',
    meaning: 'Mình thực sự rất mừng cho bạn.',
  },
  {
    id: 'cs-53',
    number: 53,
    category: 'Cảm xúc & Phản xạ',
    fullSentence: 'Do not worry about it.',
    soundChunk: 'worry_about_it',
    connectedGuide: '[Dəʊn-wʌ-ri] [ə-bou-tɪt].',
    meaning: 'Đừng lo lắng về chuyện đó nhé.',
  },
  {
    id: 'cs-54',
    number: 54,
    category: 'Cảm xúc & Phản xạ',
    fullSentence: 'Never mind, it is okay.',
    soundChunk: 'it_is_okay',
    connectedGuide: 'Never mind, [i-tsəʊ-kei].',
    meaning: 'Không sao đâu, ổn mà.',
  },
  {
    id: 'cs-55',
    number: 55,
    category: 'Cảm xúc & Phản xạ',
    fullSentence: 'Are you sure about that?',
    soundChunk: 'sure_about_that',
    connectedGuide: '[ɑː-ju] [ʃʊə-rə-bout] that?',
    meaning: 'Bạn có chắc chắn về điều đó không?',
  },
  {
    id: 'cs-56',
    number: 56,
    category: 'Cảm xúc & Phản xạ',
    fullSentence: 'I have no idea what happened.',
    soundChunk: 'no_idea',
    connectedGuide: 'I-hæv [nəʊ-wai-diə] what happened.',
    meaning: 'Mình hoàn toàn không biết chuyện gì đã xảy ra.',
  },
  {
    id: 'cs-57',
    number: 57,
    category: 'Cảm xúc & Phản xạ',
    fullSentence: 'You did a really good job!',
    soundChunk: 'good_job',
    connectedGuide: 'You [di-də] really [gʊ-dʒɒb]!',
    meaning: 'Con đã làm rất tốt!',
  },
  {
    id: 'cs-58',
    number: 58,
    category: 'Cảm xúc & Phản xạ',
    fullSentence: 'Keep up the good work!',
    soundChunk: 'keep_up_the',
    connectedGuide: '[Kee-pʌp-ðə] [gʊ-dwɜːk]!',
    meaning: 'Hãy tiếp tục phát huy tốt như vậy nhé!',
  },
  {
    id: 'cs-59',
    number: 59,
    category: 'Cảm xúc & Phản xạ',
    fullSentence: 'I am proud of you, my dear.',
    soundChunk: 'proud_of_you',
    connectedGuide: 'I’m [prou-dəv-ju], my dear.',
    meaning: 'Mẹ rất tự hào về con yêu.',
  },
  {
    id: 'cs-60',
    number: 60,
    category: 'Cảm xúc & Phản xạ',
    fullSentence: 'That sounds like a lot of fun!',
    soundChunk: 'lot_of_fun',
    connectedGuide: 'That sounds [lai-kə] [lɒ-təv-fʌn]!',
    meaning: 'Nghe có vẻ rất vui và thú vị đấy!',
  },
  {
    id: 'cs-61',
    number: 61,
    category: 'Hỏi đáp & Nhờ giúp đỡ',
    fullSentence: 'Please let me know if you need help.',
    soundChunk: 'let_me_know',
    connectedGuide: 'Please [lem-me-know] if you need help.',
    meaning: 'Hãy báo cho mình biết nếu bạn cần hỗ trợ nhé.',
  },
  {
    id: 'cs-62',
    number: 62,
    category: 'Hỏi đáp & Nhờ giúp đỡ',
    fullSentence: 'Can you give me a hand?',
    soundChunk: 'give_me_a_hand',
    connectedGuide: 'Can-ja [gɪ-mi-yə-hænd]?',
    meaning: 'Bạn giúp mình một tay được không?',
  },
  {
    id: 'cs-63',
    number: 63,
    category: 'Hỏi đáp & Nhờ giúp đỡ',
    fullSentence: 'Could you say that again?',
    soundChunk: 'say_that_again',
    connectedGuide: '[Kʊ-dʒu] [sei-ðæ-tə-gen]?',
    meaning: 'Bạn có thể nhắc lại câu đó được không?',
  },
  {
    id: 'cs-64',
    number: 64,
    category: 'Hỏi đáp & Nhờ giúp đỡ',
    fullSentence: 'What does this word mean?',
    soundChunk: 'does_this_word',
    connectedGuide: '[Wha-dʌz] [ðɪ-swɜːd] mean?',
    meaning: 'Từ này có nghĩa là gì thế?',
  },
  {
    id: 'cs-65',
    number: 65,
    category: 'Hỏi đáp & Nhờ giúp đỡ',
    fullSentence: 'How do you spell your name?',
    soundChunk: 'do_you_spell',
    connectedGuide: 'How [dju-spel] your name?',
    meaning: 'Bạn đánh vần tên của bạn như thế nào?',
  },
  {
    id: 'cs-66',
    number: 66,
    category: 'Hỏi đáp & Nhờ giúp đỡ',
    fullSentence: 'Where did you put my bag?',
    soundChunk: 'did_you_put',
    connectedGuide: 'Where [di-dʒu-pʊt] my bag?',
    meaning: 'Bạn đã để chiếc cặp của mình ở đâu rồi?',
  },
  {
    id: 'cs-67',
    number: 67,
    category: 'Hỏi đáp & Nhờ giúp đỡ',
    fullSentence: 'Do you know where it is?',
    soundChunk: 'where_it_is',
    connectedGuide: '[Dju-nəʊ] [weə-rɪ-tɪz]?',
    meaning: 'Bạn có biết nó ở đâu không?',
  },
  {
    id: 'cs-68',
    number: 68,
    category: 'Hỏi đáp & Nhờ giúp đỡ',
    fullSentence: 'Thank you so much for helping me.',
    soundChunk: 'thank_you_so_much',
    connectedGuide: '[Θæŋ-kju] [səʊ-mʌtʃ] fər helping me.',
    meaning: 'Cảm ơn bạn rất nhiều vì đã giúp đỡ mình.',
  },
  {
    id: 'cs-69',
    number: 69,
    category: 'Hỏi đáp & Nhờ giúp đỡ',
    fullSentence: 'You are welcome anytime!',
    soundChunk: 'you_are_welcome',
    connectedGuide: '[Jʊə-wel-kəm] anytime!',
    meaning: 'Không có gì đâu, bất cứ lúc nào nhé!',
  },
  {
    id: 'cs-70',
    number: 70,
    category: 'Hỏi đáp & Nhờ giúp đỡ',
    fullSentence: 'Excuse me, may I come in?',
    soundChunk: 'may_i_come_in',
    connectedGuide: 'Excuse me, [mei-yai] [cʌ-min]?',
    meaning: 'Xin phép cho em vào lớp ạ.',
  },
  {
    id: 'cs-71',
    number: 71,
    category: 'Thời tiết & Thời gian',
    fullSentence: 'What time is it right now?',
    soundChunk: 'time_is_it',
    connectedGuide: '[Wha-tai-mi-zɪt] right now?',
    meaning: 'Bây giờ là mấy giờ rồi?',
  },
  {
    id: 'cs-72',
    number: 72,
    category: 'Thời tiết & Thời gian',
    fullSentence: 'It is half past seven.',
    soundChunk: 'half_past_seven',
    connectedGuide: '[I-ts] [hɑːf-pɑː-se-vən].',
    meaning: 'Bây giờ là bảy giờ rưỡi.',
  },
  {
    id: 'cs-73',
    number: 73,
    category: 'Thời tiết & Thời gian',
    fullSentence: 'What is the weather like today?',
    soundChunk: 'weather_like_today',
    connectedGuide: '[Wha-tsðə] [we-ðər-laik] təday?',
    meaning: 'Thời tiết hôm nay như thế nào?',
  },
  {
    id: 'cs-74',
    number: 74,
    category: 'Thời tiết & Thời gian',
    fullSentence: 'It is sunny and warm outside.',
    soundChunk: 'sunny_and_warm',
    connectedGuide: '[I-ts] [sʌ-ni-yənd-wɔːm] outside.',
    meaning: 'Bên ngoài trời đang nắng và ấm áp.',
  },
  {
    id: 'cs-75',
    number: 75,
    category: 'Thời tiết & Thời gian',
    fullSentence: 'Take an umbrella with you.',
    soundChunk: 'take_an_umbrella',
    connectedGuide: '[Tei-kə-nʌm-bre-lə] with you.',
    meaning: 'Bạn nhớ mang theo một chiếc ô nhé.',
  },
  {
    id: 'cs-76',
    number: 76,
    category: 'Thời tiết & Thời gian',
    fullSentence: 'It looks like it is going to rain.',
    soundChunk: 'going_to_rain',
    connectedGuide: 'It [lʊks-laik] it’s [gə-nə-rein].',
    meaning: 'Trông có vẻ như trời sắp mưa rồi.',
  },
  {
    id: 'cs-77',
    number: 77,
    category: 'Thời tiết & Thời gian',
    fullSentence: 'What are you doing this weekend?',
    soundChunk: 'doing_this_weekend',
    connectedGuide: '[Wha-dər-ju] doing [ðɪ-sweek-end]?',
    meaning: 'Cuối tuần này bạn định làm gì?',
  },
  {
    id: 'cs-78',
    number: 78,
    category: 'Thời tiết & Thời gian',
    fullSentence: 'We are going to visit grandma.',
    soundChunk: 'going_to_visit',
    connectedGuide: 'We’re [gəʊ-ɪŋ-tə] [vi-zɪt] grandma.',
    meaning: 'Chúng mình sẽ đi thăm bà.',
  },
  {
    id: 'cs-79',
    number: 79,
    category: 'Thời tiết & Thời gian',
    fullSentence: 'Have a wonderful weekend!',
    soundChunk: 'have_a_wonderful',
    connectedGuide: '[Ha-və] wonderful weekend!',
    meaning: 'Chúc bạn một kỳ nghỉ cuối tuần tuyệt vời!',
  },
  {
    id: 'cs-80',
    number: 80,
    category: 'Thời tiết & Thời gian',
    fullSentence: 'See you on Monday morning!',
    soundChunk: 'see_you_on',
    connectedGuide: '[See-ju-wɒn] Monday morning!',
    meaning: 'Hẹn gặp lại bạn vào sáng thứ Hai nhé!',
  },
];

function buildTopicIllustration(
  bgFrom: string,
  bgTo: string,
  sceneSvg: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgFrom}"/>
        <stop offset="100%" stop-color="${bgTo}"/>
      </linearGradient>
    </defs>
    <rect width="160" height="160" rx="28" fill="url(#bg)"/>
    <circle cx="132" cy="28" r="34" fill="#ffffff" fill-opacity="0.18"/>
    <circle cx="24" cy="136" r="42" fill="#ffffff" fill-opacity="0.14"/>
    ${sceneSvg}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Tạo hình ảnh minh hoạ riêng biệt cho từng câu trong 300 câu giao tiếp Mimic
 */
export function buildSentenceIllustration(
  sentence: string,
  dayNumber: number,
  lineIdx: number
): string {
  const s = sentence.toLowerCase();
  const palettes = [
    ['#ECFEFF', '#A5F3FC', '#0E7490'],
    ['#FEF3C7', '#FDE68A', '#B45309'],
    ['#FCE7F3', '#FBCFE8', '#BE185D'],
    ['#DCFCE7', '#BBF7D0', '#15803D'],
    ['#EDE9FE', '#DDD6FE', '#6D28D9'],
    ['#FFEDD5', '#FED7AA', '#C2410C'],
    ['#E0F2FE', '#BAE6FD', '#0369A1'],
    ['#FDF4FF', '#F5D0FE', '#A21CAF'],
    ['#F0FDF4', '#86EFAC', '#166534'],
    ['#FFF1F2', '#FECDD3', '#BE123C'],
  ];
  const [bgFrom, bgTo, accent] = palettes[(dayNumber + lineIdx) % palettes.length];

  let iconGraphic = '';

  if (/(wake|morning|clock|time|early|late|alarm|minute|second|hour|schedule)/i.test(s)) {
    iconGraphic = `
      <circle cx="120" cy="78" r="34" fill="#FFFFFF" stroke="${accent}" stroke-width="4.5"/>
      <circle cx="120" cy="78" r="4" fill="${accent}"/>
      <line x1="120" y1="78" x2="120" y2="56" stroke="${accent}" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="120" y1="78" x2="138" y2="78" stroke="#F97316" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="62" cy="48" r="16" fill="#FACC15" stroke="#EA580C" stroke-width="3"/>
    `;
  } else if (/(eat|breakfast|lunch|dinner|food|bread|milk|tea|water|coffee|cake|apple|fruit|hungry|thirsty|delicious|taste|cook|kitchen|table|restaurant|order|menu|bill)/i.test(s)) {
    iconGraphic = `
      <ellipse cx="105" cy="98" rx="42" ry="18" fill="#FFFFFF" stroke="${accent}" stroke-width="4"/>
      <path d="M76 94 Q105 60 134 94 Z" fill="#FB923C" stroke="${accent}" stroke-width="3.5"/>
      <rect x="152" y="54" width="28" height="48" rx="7" fill="#FEF08A" stroke="${accent}" stroke-width="3.5"/>
      <line x1="166" y1="54" x2="176" y2="36" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
      <circle cx="72" cy="56" r="12" fill="#EF4444"/>
    `;
  } else if (/(school|class|teacher|book|read|page|write|pencil|pen|notebook|test|homework|learn|word|english|spell|story)/i.test(s)) {
    iconGraphic = `
      <path d="M64 48 Q92 38 120 50 Q148 38 176 48 V108 Q148 98 120 110 Q92 98 64 108 Z" fill="#FFFFFF" stroke="${accent}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="120" y1="50" x2="120" y2="110" stroke="${accent}" stroke-width="4"/>
      <line x1="76" y1="66" x2="106" y2="66" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="76" y1="80" x2="104" y2="80" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="134" y1="66" x2="164" y2="66" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="134" y1="80" x2="160" y2="80" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round"/>
    `;
  } else if (/(weather|sun|rain|umbrella|wind|cold|warm|hot|coat|spring|summer|autumn|winter|sky|cloud)/i.test(s)) {
    iconGraphic = `
      <circle cx="86" cy="56" r="20" fill="#FACC15" stroke="#EA580C" stroke-width="3.5"/>
      <path d="M90 100 H154 A16 16 0 0 0 154 68 A22 22 0 0 0 112 62 A15 15 0 0 0 90 100 Z" fill="#FFFFFF" stroke="${accent}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="104" y1="108" x2="98" y2="120" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="124" y1="108" x2="118" y2="120" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="144" y1="108" x2="138" y2="120" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round"/>
    `;
  } else if (/(buy|shop|supermarket|shirt|size|wear|dress|shoes|bag|price|much|money|cart|market)/i.test(s)) {
    iconGraphic = `
      <rect x="82" y="54" width="76" height="62" rx="10" fill="#FFFFFF" stroke="${accent}" stroke-width="4"/>
      <path d="M102 54 C102 36 138 36 138 54" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="120" cy="84" r="14" fill="#FDE047" stroke="${accent}" stroke-width="3"/>
    `;
  } else if (/(call|phone|video|message|hear|screen|online|text)/i.test(s)) {
    iconGraphic = `
      <rect x="92" y="34" width="56" height="92" rx="12" fill="#FFFFFF" stroke="${accent}" stroke-width="4"/>
      <rect x="100" y="46" width="40" height="62" rx="6" fill="#E0F2FE"/>
      <circle cx="120" cy="117" r="4" fill="${accent}"/>
      <circle cx="120" cy="74" r="12" fill="#38BDF8"/>
    `;
  } else if (/(bus|car|bike|bicycle|walk|street|road|turn|left|right|station|airport|trip|travel|beach|park)/i.test(s)) {
    iconGraphic = `
      <rect x="68" y="58" width="104" height="44" rx="12" fill="#38BDF8" stroke="${accent}" stroke-width="4"/>
      <rect x="78" y="66" width="24" height="16" rx="4" fill="#FFFFFF"/>
      <rect x="108" y="66" width="24" height="16" rx="4" fill="#FFFFFF"/>
      <rect x="138" y="66" width="24" height="16" rx="4" fill="#FEF08A"/>
      <circle cx="92" cy="104" r="11" fill="#334155" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="148" cy="104" r="11" fill="#334155" stroke="#FFFFFF" stroke-width="3"/>
    `;
  } else if (/(dog|cat|pet|animal|bird|puppy|kitten|zoo|tail|fur)/i.test(s)) {
    iconGraphic = `
      <circle cx="120" cy="80" r="30" fill="#FBBF24" stroke="#92400E" stroke-width="4"/>
      <ellipse cx="92" cy="72" rx="9" ry="18" fill="#B45309" stroke="#92400E" stroke-width="3"/>
      <ellipse cx="148" cy="72" rx="9" ry="18" fill="#B45309" stroke="#92400E" stroke-width="3"/>
      <circle cx="110" cy="76" r="4" fill="#451A03"/>
      <circle cx="130" cy="76" r="4" fill="#451A03"/>
      <ellipse cx="120" cy="86" rx="6" ry="4" fill="#451A03"/>
    `;
  } else if (/(happy|love|proud|great|good|wonderful|smile|fun|gift|birthday|party|thank|sorry|care|help|friend)/i.test(s)) {
    iconGraphic = `
      <path d="M120 48 C108 32 82 40 82 64 C82 90 120 116 120 116 C120 116 158 90 158 64 C158 40 132 32 120 48 Z" fill="#FB7185" stroke="${accent}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="62,40 66,48 75,49 68,55 70,64 62,59 54,64 56,55 49,49 58,48" fill="#FACC15"/>
      <polygon points="178,44 181,50 188,51 183,56 184,63 178,59 172,63 173,56 168,51 175,50" fill="#FACC15"/>
    `;
  } else {
    iconGraphic = `
      <circle cx="94" cy="72" r="18" fill="#FDE68A" stroke="${accent}" stroke-width="3.5"/>
      <path d="M72 118 C72 96 116 96 116 118" fill="#38BDF8" stroke="${accent}" stroke-width="3.5"/>
      <rect x="122" y="44" width="64" height="40" rx="12" fill="#FFFFFF" stroke="${accent}" stroke-width="3.5"/>
      <circle cx="142" cy="64" r="3.5" fill="${accent}"/>
      <circle cx="154" cy="64" r="3.5" fill="${accent}"/>
      <circle cx="166" cy="64" r="3.5" fill="${accent}"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 148" width="240" height="148">
    <defs>
      <linearGradient id="sbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgFrom}"/>
        <stop offset="100%" stop-color="${bgTo}"/>
      </linearGradient>
    </defs>
    <rect width="240" height="148" rx="22" fill="url(#sbg)"/>
    <circle cx="210" cy="26" r="30" fill="#ffffff" fill-opacity="0.28"/>
    <circle cx="28" cy="126" r="36" fill="#ffffff" fill-opacity="0.22"/>
    ${iconGraphic}
    <rect x="12" y="12" width="68" height="24" rx="8" fill="#ffffff" fill-opacity="0.9"/>
    <text x="46" y="28" font-family="sans-serif" font-size="11" font-weight="800" fill="${accent}" text-anchor="middle">Day ${dayNumber} • #${lineIdx + 1}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const RAW_MIMIC_30_DAYS: Array<{
  number: number;
  titleEn: string;
  titleVi: string;
  topicTag: string;
  imageUrl: string;
  lines: Array<{
    sentence: string;
    connectedGuide: string;
    meaning: string;
  }>;
}> = [
  {
    number: 1,
    titleEn: 'Day 1: Greetings & Getting Acquainted',
    titleVi: 'Ngày 1: Chào hỏi & Làm quen',
    topicTag: 'Giao tiếp cơ bản',
    imageUrl: buildTopicIllustration(
      '#FFF1F2',
      '#FECDD3',
      `<circle cx="64" cy="68" r="18" fill="#FDE047" stroke="#BE123C" stroke-width="3.5"/>
       <circle cx="104" cy="68" r="18" fill="#FDBA74" stroke="#BE123C" stroke-width="3.5"/>
       <path d="M44 120 C44 96 84 96 84 120" fill="#FB7185" stroke="#BE123C" stroke-width="3.5"/>
       <path d="M84 120 C84 96 124 96 124 120" fill="#38BDF8" stroke="#BE123C" stroke-width="3.5"/>`
    ),
    lines: [
      { sentence: 'How is it going today?', connectedGuide: '[How-zi-gəʊ-ɪŋ] təday?', meaning: 'Hôm nay mọi việc của bạn thế nào?' },
      { sentence: 'Nice to meet you here.', connectedGuide: '[Nai-stə-mee-tʃu] here.', meaning: 'Rất vui được gặp bạn ở đây.' },
      { sentence: 'What is your full name?', connectedGuide: '[Wha-tsjər] full name?', meaning: 'Họ và tên đầy đủ của bạn là gì?' },
      { sentence: 'Where are you from?', connectedGuide: '[Where-ə-ju] from?', meaning: 'Bạn đến từ đâu?' },
      { sentence: 'How old are you now?', connectedGuide: 'How [əʊl-dər-ju] now?', meaning: 'Bây giờ bạn bao nhiêu tuổi rồi?' },
      { sentence: 'It is good to see you again.', connectedGuide: 'It’s [gʊ-tə-see-ju] əgain.', meaning: 'Thật vui khi được gặp lại bạn.' },
      { sentence: 'How have you been lately?', connectedGuide: 'How [hæv-ju-been] lately?', meaning: 'Dạo gần đây bạn thế nào rồi?' },
      { sentence: 'Have a great day ahead!', connectedGuide: '[Ha-və] [grei-dei] əhead!', meaning: 'Chúc bạn một ngày tuyệt vời phía trước!' },
      { sentence: 'See you later this afternoon.', connectedGuide: '[See-jə] later [ðɪ-sɑːf-tər-nuːn].', meaning: 'Hẹn gặp lại bạn chiều nay nhé.' },
      { sentence: 'Take care of yourself!', connectedGuide: '[Tei-keə-rəv] yourself!', meaning: 'Hãy giữ gìn sức khỏe nhé!' },
    ],
  },
  {
    number: 2,
    titleEn: 'Day 2: Morning Routine',
    titleVi: 'Ngày 2: Thói quen buổi sáng',
    topicTag: 'Buổi sáng',
    imageUrl: buildTopicIllustration(
      '#FEF9C3',
      '#FDE047',
      `<circle cx="80" cy="84" r="36" fill="#FFFFFF" stroke="#CA8A04" stroke-width="4.5"/>
       <line x1="80" y1="84" x2="80" y2="60" stroke="#CA8A04" stroke-width="4.5" stroke-linecap="round"/>
       <line x1="80" y1="84" x2="98" y2="84" stroke="#EA580C" stroke-width="4.5" stroke-linecap="round"/>
       <circle cx="122" cy="36" r="14" fill="#FB923C"/>`
    ),
    lines: [
      { sentence: 'Wake up! It is time to get up.', connectedGuide: '[Wei-kʌp]! [I-ts-taim] tə [ge-tʌp].', meaning: 'Thức dậy thôi! Đã đến giờ dậy rồi.' },
      { sentence: 'Did you sleep well last night?', connectedGuide: '[Di-dʒu] [sleep-wel] [lɑːst-nait]?', meaning: 'Tối qua con ngủ có ngon không?' },
      { sentence: 'I woke up at six thirty.', connectedGuide: 'I [wəʊ-kʌ-pæt] six thirty.', meaning: 'Mình thức dậy lúc sáu giờ rưỡi.' },
      { sentence: 'Let us make the bed neatly.', connectedGuide: 'Let’s [meik-ðə-bed] neatly.', meaning: 'Chúng mình cùng dọn giường thật gọn gàng nhé.' },
      { sentence: 'Go and brush your teeth now.', connectedGuide: 'Go ənd [brʌʃ-jər-teeθ] now.', meaning: 'Đi đánh răng ngay bây giờ nhé.' },
      { sentence: 'Wash your face with warm water.', connectedGuide: '[Wɒʃ-jər-feis] with warm water.', meaning: 'Rửa mặt bằng nước ấm nhé.' },
      { sentence: 'Comb your hair in front of the mirror.', connectedGuide: '[Kəʊm-jər-heər] [ɪn-frʌn-təv] ðə mirror.', meaning: 'Chải tóc trước gương nhé.' },
      { sentence: 'Put on your school uniform.', connectedGuide: '[Pʊ-tɒn-jər] school uniform.', meaning: 'Mặc đồng phục đi học vào nhé.' },
      { sentence: 'Open the window for fresh air.', connectedGuide: '[Əʊ-pən-ðə] window fər [fre-ʃeər].', meaning: 'Mở cửa sổ để đón không khí trong lành nhé.' },
      { sentence: 'What a bright and sunny morning!', connectedGuide: '[Whɒ-tə] bright ənd sunny morning!', meaning: 'Thật là một buổi sáng tươi sáng và tràn ngập nắng!' },
    ],
  },
  {
    number: 3,
    titleEn: 'Day 3: At the Breakfast Table',
    titleVi: 'Ngày 3: Bữa sáng cùng gia đình',
    topicTag: 'Bữa sáng',
    imageUrl: buildTopicIllustration(
      '#FFEDD5',
      '#FDBA74',
      `<ellipse cx="76" cy="104" rx="40" ry="18" fill="#FFFFFF" stroke="#C2410C" stroke-width="4"/>
       <path d="M50 100 Q76 70 102 100 Z" fill="#F97316" stroke="#C2410C" stroke-width="3.5"/>
       <rect x="108" y="54" width="24" height="50" rx="6" fill="#FEF08A" stroke="#C2410C" stroke-width="3.5"/>`
    ),
    lines: [
      { sentence: 'Breakfast is ready on the table.', connectedGuide: 'Breakfast [ɪz-re-di] [ɒn-ðə-tei-bəl].', meaning: 'Bữa sáng đã sẵn sàng ở trên bàn rồi.' },
      { sentence: 'Come and sit at the table.', connectedGuide: '[Cʌ-mənd-sɪt] [æt-ðə-tei-bəl].', meaning: 'Lại đây ngồi vào bàn ăn nào.' },
      { sentence: 'What would you like for breakfast?', connectedGuide: 'What [wʊ-dʒu-laik] fər breakfast?', meaning: 'Bạn muốn ăn gì cho bữa sáng?' },
      { sentence: 'I would like bread and fried eggs.', connectedGuide: 'I’d laik bread ənd [frai-degz].', meaning: 'Mình muốn ăn bánh mì và trứng ốp la.' },
      { sentence: 'Drink a glass of warm milk.', connectedGuide: '[Drɪŋ-kə] [glɑː-səv] warm milk.', meaning: 'Uống một cốc sữa ấm nhé.' },
      { sentence: 'Pass me the butter, please.', connectedGuide: '[Pɑːs-mee] ðə butter, please.', meaning: 'Chuyền giúp mình lọ bơ với nhé.' },
      { sentence: 'Be careful, the soup is hot.', connectedGuide: 'Be careful, ðə [suː-pɪz-hɒt].', meaning: 'Cẩn thận nhé, bát súp đang nóng đấy.' },
      { sentence: 'Eat up all your breakfast.', connectedGuide: '[Ee-tʌ-pɔːl] your breakfast.', meaning: 'Ăn hết sạch bữa sáng của con nhé.' },
      { sentence: 'This toast tastes really good.', connectedGuide: '[Ðɪs-təʊst] [teists-rɪə-li-gʊd].', meaning: 'Miếng bánh mì nướng này ngon thật đấy.' },
      { sentence: 'Thank you for the delicious meal.', connectedGuide: '[Θæŋ-kju] fər ðə delicious meal.', meaning: 'Cảm ơn vì bữa ăn thật ngon miệng.' },
    ],
  },
  {
    number: 4,
    titleEn: 'Day 4: Getting Ready for School',
    titleVi: 'Ngày 4: Chuẩn bị đến trường',
    topicTag: 'Đến trường',
    imageUrl: buildTopicIllustration(
      '#E0F2FE',
      '#7DD3FC',
      `<rect x="44" y="46" width="72" height="76" rx="18" fill="#0284C7" stroke="#0C4A6E" stroke-width="4"/>
       <rect x="56" y="76" width="48" height="32" rx="8" fill="#38BDF8" stroke="#0C4A6E" stroke-width="3"/>
       <path d="M64 46 C64 30 96 30 96 46" fill="none" stroke="#0C4A6E" stroke-width="4"/>`
    ),
    lines: [
      { sentence: 'Pack your school bag carefully.', connectedGuide: '[Pæk-jər] school bag carefully.', meaning: 'Sắp xếp cặp sách đi học thật cẩn thận nhé.' },
      { sentence: 'Do you have your pencil case?', connectedGuide: '[Dju-hæv] your pencil case?', meaning: 'Con đã mang hộp bút chì chưa?' },
      { sentence: 'Do not forget your water bottle.', connectedGuide: '[Dəʊnt-fər-get] your water bottle.', meaning: 'Đừng quên mang theo bình nước nhé.' },
      { sentence: 'Put on your shoes at the door.', connectedGuide: '[Pʊ-tɒn-jər] shoes [æt-ðə-dɔːr].', meaning: 'Đi giày vào ở ngay cửa nhé.' },
      { sentence: 'Tie your shoelaces tightly.', connectedGuide: '[Tai-jər] shoelaces tightly.', meaning: 'Buộc dây giày cho chắc vào nhé.' },
      { sentence: 'Get dressed quickly, we are late.', connectedGuide: '[Ge-drest] quickly, we’re late.', meaning: 'Mặc đồ nhanh lên nào, chúng ta muộn rồi.' },
      { sentence: 'Hurry up or we will miss the bus.', connectedGuide: '[Hʌ-ri-yʌp] ɔːr we’ll [mɪs-ðə-bʌs].', meaning: 'Nhanh lên không chúng ta sẽ lỡ chuyến xe buýt đấy.' },
      { sentence: 'Hold my hand when crossing the street.', connectedGuide: '[Həʊld-mai-hænd] when crossing ðə street.', meaning: 'Nắm tay mẹ khi băng qua đường nhé.' },
      { sentence: 'Have fun learning at school today!', connectedGuide: '[Hæv-fʌn] learning [æt-skuːl] təday!', meaning: 'Hôm nay đi học ở trường thật vui nhé!' },
      { sentence: 'I will pick you up at four.', connectedGuide: 'I’ll [pɪ-kju-ʌp] [æt-fɔːr].', meaning: 'Mẹ sẽ đón con lúc bốn giờ chiều nhé.' },
    ],
  },
  {
    number: 5,
    titleEn: 'Day 5: In the Classroom',
    titleVi: 'Ngày 5: Giao tiếp trong lớp học',
    topicTag: 'Lớp học',
    imageUrl: buildTopicIllustration(
      '#DCFCE7',
      '#86EFAC',
      `<rect x="30" y="44" width="100" height="68" rx="8" fill="#065F46" stroke="#064E3B" stroke-width="4"/>
       <line x1="48" y1="68" x2="112" y2="68" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
       <line x1="48" y1="86" x2="96" y2="86" stroke="#FDE047" stroke-width="4" stroke-linecap="round"/>`
    ),
    lines: [
      { sentence: 'Excuse me, may I come in?', connectedGuide: 'Excuse me, [mei-yai] [cʌ-min]?', meaning: 'Xin phép cô cho em vào lớp ạ.' },
      { sentence: 'Open your book to page ten.', connectedGuide: '[Əʊ-pən-jər] [bʊk-tə] page ten.', meaning: 'Các em mở sách ra trang số mười nhé.' },
      { sentence: 'Listen to the teacher carefully.', connectedGuide: '[Li-sən-tə-ðə] teacher carefully.', meaning: 'Hãy lắng nghe cô giáo giảng bài thật kỹ.' },
      { sentence: 'Look at the board right now.', connectedGuide: '[Lʊ-kət-ðə] board [rai-now].', meaning: 'Nhìn lên bảng ngay bây giờ nhé.' },
      { sentence: 'Raise your hand if you know.', connectedGuide: '[Rei-zjər] hand [i-fju-nəʊ].', meaning: 'Giơ tay lên nếu em biết câu trả lời.' },
      { sentence: 'Write it down in your notebook.', connectedGuide: '[Rai-ti-down] [ɪn-jər] notebook.', meaning: 'Viết nội dung đó vào vở của em nhé.' },
      { sentence: 'Work in pairs with your partner.', connectedGuide: '[Wɜː-kɪn-peəz] with your partner.', meaning: 'Làm việc theo cặp cùng bạn bên cạnh nhé.' },
      { sentence: 'Read out loud after me.', connectedGuide: '[Ree-dout-loud] [ɑːf-tər-mee].', meaning: 'Đọc to rõ ràng theo sau cô nhé.' },
      { sentence: 'Are you ready for the quiz?', connectedGuide: '[ɑː-ju] [re-di-fər-ðə] quiz?', meaning: 'Các em đã sẵn sàng cho bài kiểm tra nhỏ chưa?' },
      { sentence: 'Time is up, put your pens down.', connectedGuide: '[Tai-mi-zʌp], [pʊ-tʃər] pens down.', meaning: 'Hết giờ rồi, các em đặt bút xuống nhé.' },
    ],
  },
  {
    number: 6,
    titleEn: 'Day 6: Talking with Classmates & Friends',
    titleVi: 'Ngày 6: Trò chuyện cùng bạn bè',
    topicTag: 'Bạn bè',
    imageUrl: buildTopicIllustration(
      '#EDE9FE',
      '#C4B5FD',
      `<circle cx="56" cy="72" r="18" fill="#FDE68A" stroke="#5B21B6" stroke-width="3.5"/>
       <circle cx="104" cy="72" r="18" fill="#FDE68A" stroke="#5B21B6" stroke-width="3.5"/>
       <path d="M74 44 L86 44 L80 56 Z" fill="#F43F5E"/>`
    ),
    lines: [
      { sentence: 'Can I sit next to you?', connectedGuide: '[Cə-nai] [sɪt-nekst] tə you?', meaning: 'Mình ngồi cạnh bạn được không?' },
      { sentence: 'Can I borrow your ruler?', connectedGuide: '[Cə-nai] borrow your ruler?', meaning: 'Cho mình mượn thước kẻ của bạn được không?' },
      { sentence: 'Here you are, take it.', connectedGuide: '[Hɪə-ju-ɑː], [tei-kɪt].', meaning: 'Của bạn đây, bạn cầm lấy nhé.' },
      { sentence: 'Let us play together at break time.', connectedGuide: 'Let’s [plei-tə-ge-ðər] æt [breik-taim].', meaning: 'Giờ ra chơi chúng mình cùng chơi chung nhé.' },
      { sentence: 'Would you like to share my snack?', connectedGuide: '[Wʊ-dʒu-laik] tə [ʃeə-mai] snack?', meaning: 'Bạn có muốn ăn chung đồ ăn vặt với mình không?' },
      { sentence: 'Wait for me at the school gate.', connectedGuide: '[Weit-fər-mee] [æt-ðə] school gate.', meaning: 'Đợi mình ở cổng trường nhé.' },
      { sentence: 'Which game do you want to play?', connectedGuide: 'Which game [dju-wɒn-tə] play?', meaning: 'Bạn muốn chơi trò chơi nào?' },
      { sentence: 'It is your turn to roll the dice.', connectedGuide: '[I-ts-jər-tɜːn] tə [rəʊl-ðə] dice.', meaning: 'Đến lượt bạn gieo xúc xắc rồi đấy.' },
      { sentence: 'We are in the same team!', connectedGuide: 'We’re [ɪn-ðə-seim] team!', meaning: 'Chúng mình ở cùng một đội rồi!' },
      { sentence: 'You are my best friend forever.', connectedGuide: '[Jʊə-mai] [best-frend] fərever.', meaning: 'Bạn mãi là người bạn thân nhất của mình.' },
    ],
  },
  {
    number: 7,
    titleEn: 'Day 7: Asking for Help & Clarification',
    titleVi: 'Ngày 7: Hỏi đáp & Nhờ sự giúp đỡ',
    topicTag: 'Nhờ giúp đỡ',
    imageUrl: buildTopicIllustration(
      '#ECFEFF',
      '#67E8F9',
      `<circle cx="80" cy="80" r="38" fill="#FFFFFF" stroke="#0E7490" stroke-width="4"/>
       <path d="M68 68 C68 54 92 54 92 68 C92 78 80 80 80 92" fill="none" stroke="#0E7490" stroke-width="5" stroke-linecap="round"/>
       <circle cx="80" cy="106" r="3.5" fill="#0E7490"/>`
    ),
    lines: [
      { sentence: 'Can you give me a hand?', connectedGuide: 'Can-ja [gɪ-mi-yə-hænd]?', meaning: 'Bạn giúp mình một tay được không?' },
      { sentence: 'Please let me know if you need help.', connectedGuide: 'Please [lem-me-know] [ɪ-fju] need help.', meaning: 'Hãy báo cho mình biết nếu bạn cần giúp đỡ nhé.' },
      { sentence: 'Could you say that again?', connectedGuide: '[Kʊ-dʒu] [sei-ðæ-tə-gen]?', meaning: 'Bạn có thể nhắc lại câu đó được không?' },
      { sentence: 'Could you speak a little slower?', connectedGuide: '[Kʊ-dʒu] [spee-kə] little slower?', meaning: 'Bạn có thể nói chậm hơn một chút được không?' },
      { sentence: 'What does this word mean?', connectedGuide: '[Wha-dʌz] [ðɪ-swɜːd] mean?', meaning: 'Từ này có nghĩa là gì thế?' },
      { sentence: 'How do you pronounce this word?', connectedGuide: 'How [dju-prə-naʊns] [ðɪ-swɜːd]?', meaning: 'Từ này phát âm như thế nào?' },
      { sentence: 'How do you spell your name?', connectedGuide: 'How [dju-spel] your name?', meaning: 'Bạn đánh vần tên của bạn như thế nào?' },
      { sentence: 'Do you know where my bag is?', connectedGuide: '[Dju-nəʊ] where my [bæ-gɪz]?', meaning: 'Bạn có biết chiếc cặp của mình ở đâu không?' },
      { sentence: 'Can you show me how to do it?', connectedGuide: 'Can you [ʃəʊ-mee] how tə [duː-wɪt]?', meaning: 'Bạn chỉ cho mình cách làm điều này được không?' },
      { sentence: 'Thank you so much for helping me.', connectedGuide: '[Θæŋ-kju] [səʊ-mʌtʃ] fər helping me.', meaning: 'Cảm ơn bạn rất nhiều vì đã giúp đỡ mình.' },
    ],
  },
  {
    number: 8,
    titleEn: 'Day 8: Expressing Feelings & Emotions',
    titleVi: 'Ngày 8: Bày tỏ cảm xúc cá nhân',
    topicTag: 'Cảm xúc',
    imageUrl: buildTopicIllustration(
      '#FCE7F3',
      '#F9A8D4',
      `<circle cx="80" cy="80" r="38" fill="#FDE047" stroke="#BE185D" stroke-width="4"/>
       <circle cx="66" cy="70" r="4.5" fill="#831843"/>
       <circle cx="94" cy="70" r="4.5" fill="#831843"/>
       <path d="M64 88 Q80 104 96 88" fill="none" stroke="#831843" stroke-width="4.5" stroke-linecap="round"/>`
    ),
    lines: [
      { sentence: 'I am so happy to hear that!', connectedGuide: 'I’m [səʊ-hæ-pi] tə [hɪə-ðæt]!', meaning: 'Mình thực sự rất vui khi nghe điều đó!' },
      { sentence: 'I am really excited about the trip.', connectedGuide: 'I’m really [ɪk-sai-tɪ-də-baʊt] ðə trip.', meaning: 'Mình thực sự rất hào hứng về chuyến đi.' },
      { sentence: 'I feel a little bit tired today.', connectedGuide: 'I [fee-lə] little bit tired təday.', meaning: 'Hôm nay mình cảm thấy hơi mệt một chút.' },
      { sentence: 'Do not worry about it.', connectedGuide: '[Dəʊn-wʌ-ri] [ə-bou-tɪt].', meaning: 'Đừng lo lắng về chuyện đó nhé.' },
      { sentence: 'Everything is going to be okay.', connectedGuide: 'Everything ɪz [gə-nə-bee] okay.', meaning: 'Mọi chuyện rồi sẽ ổn thôi mà.' },
      { sentence: 'Are you feeling better now?', connectedGuide: '[ɑː-ju] feeling [be-tər-naʊ]?', meaning: 'Bây giờ bạn đã cảm thấy đỡ hơn chưa?' },
      { sentence: 'I was so surprised by the news.', connectedGuide: 'I wəz [səʊ-sər-praizd] bai ðə news.', meaning: 'Mình đã rất bất ngờ trước tin tức đó.' },
      { sentence: 'Take a deep breath and relax.', connectedGuide: '[Tei-kə] [deep-breθ] ənd relax.', meaning: 'Hãy hít một hơi thật sâu và thư giãn nhé.' },
      { sentence: 'I have no idea what happened.', connectedGuide: 'I hæv [nəʊ-wai-diə] what happened.', meaning: 'Mình hoàn toàn không biết chuyện gì đã xảy ra.' },
      { sentence: 'That sounds like a lot of fun!', connectedGuide: 'That sounds [lai-kə] [lɒ-təv-fʌn]!', meaning: 'Nghe có vẻ rất vui và thú vị đấy!' },
    ],
  },
  {
    number: 9,
    titleEn: 'Day 9: Compliments & Encouragement',
    titleVi: 'Ngày 9: Khen ngợi & Động viên khích lệ',
    topicTag: 'Khích lệ',
    imageUrl: buildTopicIllustration(
      '#FEF3C7',
      '#FCD34D',
      `<polygon points="80,28 95,60 130,65 104,90 110,124 80,108 50,124 56,90 30,65 65,60" fill="#F59E0B" stroke="#92400E" stroke-width="4" stroke-linejoin="round"/>`
    ),
    lines: [
      { sentence: 'You did a really good job!', connectedGuide: 'You [di-də] really [gʊ-dʒɒb]!', meaning: 'Bạn đã làm rất tốt!' },
      { sentence: 'Keep up the good work!', connectedGuide: '[Kee-pʌp-ðə] [gʊ-dwɜːk]!', meaning: 'Hãy tiếp tục phát huy tốt như vậy nhé!' },
      { sentence: 'I am so proud of you.', connectedGuide: 'I’m [səʊ-praʊ-dəv-ju].', meaning: 'Mình rất tự hào về bạn.' },
      { sentence: 'That is a wonderful idea!', connectedGuide: '[Ðæ-tsə] wonderful idea!', meaning: 'Đó quả là một ý tưởng tuyệt vời!' },
      { sentence: 'Your English is getting much better.', connectedGuide: 'Your [ɪŋ-glɪ-ʃɪz] getting [mʌtʃ-be-tər].', meaning: 'Tiếng Anh của bạn đang tiến bộ hơn rất nhiều.' },
      { sentence: 'You have a very nice smile.', connectedGuide: 'You [hæ-və] very [nais-smail].', meaning: 'Bạn có một nụ cười rất tươi.' },
      { sentence: 'Do your best and never give up!', connectedGuide: '[Duː-jər-best] ənd never [gɪ-vʌp]!', meaning: 'Hãy cố gắng hết sức và đừng bao giờ bỏ cuộc!' },
      { sentence: 'You can do it, believe in yourself!', connectedGuide: 'You [kən-duː-wɪt], [bɪ-lee-vɪn] yourself!', meaning: 'Bạn làm được mà, hãy tự tin vào chính mình!' },
      { sentence: 'Practice makes perfect every day.', connectedGuide: 'Practice [meiks-pɜː-fɪkt] every day.', meaning: 'Có công mài sắt có ngày nên kim.' },
      { sentence: 'Way to go! You nailed it!', connectedGuide: '[Wei-tə-gəʊ]! You [neil-dɪt]!', meaning: 'Tuyệt vời lắm! Bạn đã làm xuất sắc!' },
    ],
  },
  {
    number: 10,
    titleEn: 'Day 10: Saying Sorry, Excuse Me & Thank You',
    titleVi: 'Ngày 10: Lời cảm ơn, xin lỗi & Lịch sự',
    topicTag: 'Phép lịch sự',
    imageUrl: buildTopicIllustration(
      '#F0FDF4',
      '#86EFAC',
      `<path d="M80 44 C66 28 42 36 42 58 C42 84 80 114 80 114 C80 114 118 84 118 58 C118 36 94 28 80 44 Z" fill="#10B981" stroke="#065F46" stroke-width="4"/>`
    ),
    lines: [
      { sentence: 'Thank you very much for your kindness.', connectedGuide: '[Θæŋ-kju] very much fər your kindness.', meaning: 'Cảm ơn bạn rất nhiều vì sự tốt bụng của bạn.' },
      { sentence: 'You are welcome anytime!', connectedGuide: '[Jʊə-wel-kəm] anytime!', meaning: 'Không có gì đâu, bất cứ lúc nào nhé!' },
      { sentence: 'It was my pleasure to help you.', connectedGuide: 'It wəz my pleasure tə [help-ju].', meaning: 'Được giúp đỡ bạn là niềm vui của mình.' },
      { sentence: 'I am sorry for being late.', connectedGuide: 'I’m sorry fər [bee-ɪŋ-leit].', meaning: 'Mình xin lỗi vì đã đến muộn.' },
      { sentence: 'Never mind, it is okay.', connectedGuide: 'Never mind, [i-tsəʊ-kei].', meaning: 'Không sao đâu, mọi chuyện ổn mà.' },
      { sentence: 'I did not mean to do that.', connectedGuide: 'I [dɪ-dənt-meen] tə [duː-ðæt].', meaning: 'Mình không cố ý làm điều đó đâu.' },
      { sentence: 'Please forgive me this time.', connectedGuide: 'Please [fər-gɪv-mee] [ðɪs-taim].', meaning: 'Xin hãy bỏ qua cho mình lần này nhé.' },
      { sentence: 'Excuse me, may I ask a question?', connectedGuide: 'Excuse me, [mei-yai] [ɑː-skə] question?', meaning: 'Xin lỗi, mình có thể hỏi một câu được không?' },
      { sentence: 'After you, please go ahead.', connectedGuide: '[ɑːf-tər-ju], please [gəʊ-ə-hed].', meaning: 'Mời bạn đi trước ạ.' },
      { sentence: 'I really appreciate your support.', connectedGuide: 'I really [ə-pree-ʃi-eit] your support.', meaning: 'Mình thực sự trân trọng sự hỗ trợ của bạn.' },
    ],
  },
  {
    number: 11,
    titleEn: 'Day 11: At Home with Family',
    titleVi: 'Ngày 11: Sinh hoạt ấm cúng bên gia đình',
    topicTag: 'Gia đình',
    imageUrl: buildTopicIllustration(
      '#FFF1F2',
      '#FDA4AF',
      `<path d="M80 32 L32 72 H48 V124 H112 V72 H128 Z" fill="#F43F5E" stroke="#9F1239" stroke-width="4" stroke-linejoin="round"/>
       <rect x="66" y="88" width="28" height="36" rx="4" fill="#FFE4E6"/>`
    ),
    lines: [
      { sentence: 'I am home! Where is everyone?', connectedGuide: '[I-m-həʊm]! [Weə-rɪz] everyone?', meaning: 'Con về nhà rồi đây! Mọi người đâu hết rồi ạ?' },
      { sentence: 'Come in and sit down on the sofa.', connectedGuide: '[Cʌ-min] ənd [sɪ-daʊn] [ɒn-ðə] sofa.', meaning: 'Vào nhà và ngồi xuống ghế sô-pha nghỉ ngơi nhé.' },
      { sentence: 'How was your day at work?', connectedGuide: 'How wəz your [dei-yæt-wɜːk]?', meaning: 'Hôm nay ngày làm việc của bố mẹ thế nào ạ?' },
      { sentence: 'Please turn on the living room light.', connectedGuide: 'Please [tɜː-nɒn] ðə living room light.', meaning: 'Làm ơn bật đèn phòng khách lên giúp mình nhé.' },
      { sentence: 'Please turn off the television now.', connectedGuide: 'Please [tɜː-nɒf] ðə television now.', meaning: 'Làm ơn tắt ti-vi ngay bây giờ nhé.' },
      { sentence: 'Could you turn down the volume?', connectedGuide: '[Kʊ-dʒu] [tɜːn-daʊn] ðə volume?', meaning: 'Bạn vặn nhỏ âm lượng xuống một chút được không?' },
      { sentence: 'We watch a funny movie together.', connectedGuide: 'We [wɒ-tʃə] funny movie təgether.', meaning: 'Cả nhà mình cùng nhau xem một bộ phim vui nhộn.' },
      { sentence: 'Lock the front door before sleeping.', connectedGuide: '[Lɒk-ðə] front door bɪfore sleeping.', meaning: 'Khoá cửa chính cẩn thận trước khi đi ngủ nhé.' },
      { sentence: 'It is time to go to bed.', connectedGuide: '[I-ts] [taim-tə-gəʊ] tə bed.', meaning: 'Đã đến giờ đi ngủ rồi.' },
      { sentence: 'Good night and have sweet dreams!', connectedGuide: '[Gʊd-nait] ənd hæv [sweet-dreemz]!', meaning: 'Chúc ngủ ngon và có những giấc mơ đẹp nhé!' },
    ],
  },
  {
    number: 12,
    titleEn: 'Day 12: Helping with Housework',
    titleVi: 'Ngày 12: Giúp đỡ bố mẹ làm việc nhà',
    topicTag: 'Việc nhà',
    imageUrl: buildTopicIllustration(
      '#FEF9C3',
      '#FDE68A',
      `<rect x="52" y="48" width="56" height="68" rx="10" fill="#FFFFFF" stroke="#B45309" stroke-width="4"/>
       <path d="M66 82 L76 92 L96 70" fill="none" stroke="#16A34A" stroke-width="5" stroke-linecap="round"/>`
    ),
    lines: [
      { sentence: 'Can you pick it up for me?', connectedGuide: 'Can you [pi-ki-tʌp] fər me?', meaning: 'Con nhặt giúp mẹ món đồ đó lên được không?' },
      { sentence: 'Put away your toys in the box.', connectedGuide: '[Pʊ-tə-wei] your toys [ɪn-ðə-bɒks].', meaning: 'Con cất gọn đồ chơi vào trong hộp nhé.' },
      { sentence: 'Clean up your room before dinner.', connectedGuide: '[Klee-nʌp] your room bɪfore dinner.', meaning: 'Dọn dẹp phòng gọn gàng trước bữa tối nhé.' },
      { sentence: 'I help my mom sweep the floor.', connectedGuide: 'I [help-mai-mɒm] [sweep-ðə-flɔːr].', meaning: 'Mình giúp mẹ quét nhà sạch sẽ.' },
      { sentence: 'Look out! The floor is still wet.', connectedGuide: '[Lʊ-kout]! The [flɔː-rɪz] still wet.', meaning: 'Cẩn thận kìa! Sàn nhà vẫn đang còn ướt đấy.' },
      { sentence: 'Let us set the table for dinner.', connectedGuide: 'Let’s [set-ðə-tei-bəl] fər dinner.', meaning: 'Chúng mình cùng bày bàn ăn cho bữa tối nhé.' },
      { sentence: 'Who will do the dishes tonight?', connectedGuide: 'Who wɪl [duː-ðə-dɪ-ʃɪz] tənight?', meaning: 'Tối nay ai sẽ rửa bát nào?' },
      { sentence: 'Please take out the trash bag.', connectedGuide: 'Please [tei-kaʊt] ðə trash bag.', meaning: 'Làm ơn mang túi rác đi đổ giúp mình nhé.' },
      { sentence: 'I water the plants in the garden.', connectedGuide: 'I [wɔː-tər-ðə] plants [ɪn-ðə] garden.', meaning: 'Mình tưới cây trong khu vườn nhỏ.' },
      { sentence: 'Fold your clothes and put them away.', connectedGuide: '[Fəʊld-jər] clothes ənd [pʊ-ðə-mə-wei].', meaning: 'Gấp quần áo gọn gàng rồi cất vào tủ nhé.' },
    ],
  },
  {
    number: 13,
    titleEn: 'Day 13: Lunch & Dinner Time',
    titleVi: 'Ngày 13: Bữa trưa & Bữa tối ngon miệng',
    topicTag: 'Bữa ăn',
    imageUrl: buildTopicIllustration(
      '#FFEDD5',
      '#FED7AA',
      `<circle cx="80" cy="84" r="38" fill="#FFFFFF" stroke="#EA580C" stroke-width="4"/>
       <circle cx="80" cy="84" r="24" fill="#FDBA74"/>`
    ),
    lines: [
      { sentence: 'Wash your hands with soap first.', connectedGuide: '[Wɒ-ʃjər] hands with soap first.', meaning: 'Rửa tay bằng xà phòng trước khi ăn nhé.' },
      { sentence: 'What are we having for dinner?', connectedGuide: '[Whɒ-tər-wee] having fər dinner?', meaning: 'Tối nay nhà mình ăn món gì thế ạ?' },
      { sentence: 'Mom cooked fried rice and soup.', connectedGuide: 'Mom cooked [fraid-rais] ənd soup.', meaning: 'Mẹ đã nấu món cơm rang và canh nóng.' },
      { sentence: 'It smells so good in the kitchen!', connectedGuide: 'It [smelz-səʊ-gʊd] [ɪn-ðə] kitchen!', meaning: 'Trong bếp tỏa hương thơm phức!' },
      { sentence: 'Help yourself to some fresh fruit.', connectedGuide: '[Hel-pjɔː-self] tə some fresh fruit.', meaning: 'Cứ tự nhiên ăn trái cây tươi nhé.' },
      { sentence: 'Would you like some more rice?', connectedGuide: '[Wʊ-dʒu-laik] some more rice?', meaning: 'Bạn có muốn ăn thêm cơm không?' },
      { sentence: 'No, thank you. I am full now.', connectedGuide: 'No, [θæŋ-kju]. [I-m-fʊl] now.', meaning: 'Không, cảm ơn ạ. Bây giờ con no rồi.' },
      { sentence: 'Eat more green vegetables to grow tall.', connectedGuide: '[Eet-mɔː] green vegetables tə [grəʊ-tɔːl].', meaning: 'Ăn nhiều rau xanh hơn để cao lớn nhé.' },
      { sentence: 'This apple tastes so sweet and crisp.', connectedGuide: '[Ðɪ-sæ-pəl] [tei-ssəʊ-sweet] ənd crisp.', meaning: 'Quả táo này có vị ngọt và giòn thật đấy.' },
      { sentence: 'Let me clear the dishes from the table.', connectedGuide: '[Lem-mee] clear ðə dishes frəm ðə table.', meaning: 'Để con dọn bát đĩa trên bàn xuống nhé.' },
    ],
  },
  {
    number: 14,
    titleEn: 'Day 14: Ordering Food & Drinks',
    titleVi: 'Ngày 14: Gọi đồ ăn & Thức uống',
    topicTag: 'Nhà hàng',
    imageUrl: buildTopicIllustration(
      '#FEF2F2',
      '#FCA5A5',
      `<rect x="52" y="42" width="56" height="76" rx="8" fill="#FFFFFF" stroke="#DC2626" stroke-width="4"/>
       <line x1="66" y1="64" x2="94" y2="64" stroke="#DC2626" stroke-width="4" stroke-linecap="round"/>
       <line x1="66" y1="82" x2="94" y2="82" stroke="#DC2626" stroke-width="4" stroke-linecap="round"/>`
    ),
    lines: [
      { sentence: 'May I see the menu, please?', connectedGuide: '[Mei-yai] [see-ðə] menu, please?', meaning: 'Cho mình xem thực đơn với nhé?' },
      { sentence: 'Are you ready to order now?', connectedGuide: '[ɑː-ju] [re-di-tə] order now?', meaning: 'Quý khách đã sẵn sàng gọi món chưa ạ?' },
      { sentence: 'What do you want to eat?', connectedGuide: '[Wha-dju] [wɒn-tə-eet]?', meaning: 'Bạn muốn ăn món gì nào?' },
      { sentence: 'I would like a piece of cake.', connectedGuide: 'I’d [lai-kə] [pee-səv-keik].', meaning: 'Mình muốn gọi một miếng bánh ngọt.' },
      { sentence: 'Would you like a cup of tea?', connectedGuide: '[Wʊ-dʒu] [lai-kə] [cʌ-pəv-tea]?', meaning: 'Bạn có muốn uống một tách trà không?' },
      { sentence: 'Can I have a glass of water?', connectedGuide: '[Cə-nai] [ha-və] [glɑː-səv-wɔː-tər]?', meaning: 'Cho mình xin một cốc nước lọc được không?' },
      { sentence: 'I will have an orange juice, please.', connectedGuide: 'I’ll [hæ-vən] orange juice, please.', meaning: 'Cho mình một ly nước cam ép nhé.' },
      { sentence: 'Is this for here or to go?', connectedGuide: '[ɪz-ðɪs] fər here ɔːr [tə-gəʊ]?', meaning: 'Món này quý khách dùng tại chỗ hay mang về ạ?' },
      { sentence: 'Everything tastes wonderful today.', connectedGuide: 'Everything [teists-wʌn-dər-fəl] təday.', meaning: 'Mọi món ăn hôm nay đều có hương vị tuyệt vời.' },
      { sentence: 'Could we have the bill, please?', connectedGuide: '[Kʊd-wee] [hæv-ðə-bɪl], please?', meaning: 'Cho chúng mình xin hóa đơn thanh toán nhé?' },
    ],
  },
  {
    number: 15,
    titleEn: 'Day 15: At the Supermarket',
    titleVi: 'Ngày 15: Đi siêu thị & Mua sắm',
    topicTag: 'Siêu thị',
    imageUrl: buildTopicIllustration(
      '#ECFDF5',
      '#6EE7B7',
      `<path d="M36 52 H50 L62 102 H114 L124 66 H56" fill="#FFFFFF" stroke="#047857" stroke-width="4" stroke-linejoin="round"/>
       <circle cx="68" cy="116" r="7" fill="#047857"/>
       <circle cx="108" cy="116" r="7" fill="#047857"/>`
    ),
    lines: [
      { sentence: 'Let us make a shopping list first.', connectedGuide: 'Let’s [mei-kə] shopping list first.', meaning: 'Trước tiên chúng mình cùng lập danh sách đồ cần mua nhé.' },
      { sentence: 'We need milk, eggs, and fresh bread.', connectedGuide: 'We need milk, eggs, ənd [freʃ-bred].', meaning: 'Chúng ta cần mua sữa, trứng và bánh mì tươi.' },
      { sentence: 'Where can I find the dairy section?', connectedGuide: 'Where [kə-nai-faind] ðə dairy section?', meaning: 'Mình có thể tìm quầy bơ sữa ở đâu?' },
      { sentence: 'It is in aisle three over there.', connectedGuide: '[I-tɪ-zɪn] aisle three [əʊ-vər-ðeər].', meaning: 'Nó nằm ở dãy kệ số ba đằng kia kìa.' },
      { sentence: 'These strawberries look so fresh!', connectedGuide: 'These strawberries [lʊk-səʊ-freʃ]!', meaning: 'Những quả dâu tây này trông tươi quá!' },
      { sentence: 'How much is a bottle of milk?', connectedGuide: 'How [mʌ-tʃɪ-zə] [bɒ-tə-ləv] milk?', meaning: 'Một chai sữa giá bao nhiêu tiền?' },
      { sentence: 'It is on sale for two dollars.', connectedGuide: '[I-tɪ-zɒn-seil] fər two dollars.', meaning: 'Món đó đang giảm giá còn hai đô-la.' },
      { sentence: 'Let us go to the checkout counter.', connectedGuide: 'Let’s [gəʊ-tə-ðə] checkout counter.', meaning: 'Chúng mình ra quầy thu ngân thanh toán nhé.' },
      { sentence: 'We brought our own reusable bag.', connectedGuide: 'We [brɔː-taʊər] own reusable bag.', meaning: 'Chúng mình đã mang theo túi vải dùng nhiều lần.' },
      { sentence: 'Let me help you carry the bags.', connectedGuide: '[Lem-mee] [help-ju] carry ðə bags.', meaning: 'Để con giúp mẹ xách những túi đồ này nhé.' },
    ],
  },
  {
    number: 16,
    titleEn: 'Day 16: Clothes & Dressing Up',
    titleVi: 'Ngày 16: Trang phục & Thử đồ',
    topicTag: 'Trang phục',
    imageUrl: buildTopicIllustration(
      '#E0E7FF',
      '#A5B4FC',
      `<path d="M52 46 L68 38 H92 L108 46 L122 68 L104 78 L98 64 V120 H62 V64 L56 78 L38 68 Z" fill="#6366F1" stroke="#312E81" stroke-width="4" stroke-linejoin="round"/>`
    ),
    lines: [
      { sentence: 'How much is this blue shirt?', connectedGuide: 'How [mʌ-tʃɪz] ðɪs [bluː-ʃɜːt]?', meaning: 'Chiếc áo sơ mi màu xanh này giá bao nhiêu?' },
      { sentence: 'Can I try it on right here?', connectedGuide: '[Cə-nai] [trai-yi-tɒn] right here?', meaning: 'Mình có thể mặc thử nó ngay đây không?' },
      { sentence: 'Where is the fitting room, please?', connectedGuide: '[Weə-rɪz] ðə fitting room, please?', meaning: 'Cho mình hỏi phòng thử đồ ở đâu ạ?' },
      { sentence: 'Do you have a smaller size?', connectedGuide: '[Dju-ha-və] smaller size?', meaning: 'Bạn có cỡ nào nhỏ hơn không?' },
      { sentence: 'This jacket fits you very well.', connectedGuide: 'This jacket [fɪts-ju] very well.', meaning: 'Chiếc áo khoác này vừa vặn với bạn lắm.' },
      { sentence: 'Put on your coat before going out.', connectedGuide: '[Pʊ-tɒn-jər] coat bɪfore [gəʊ-ɪŋ-aʊt].', meaning: 'Mặc áo khoác vào trước khi đi ra ngoài nhé.' },
      { sentence: 'Take off your wet shoes at the door.', connectedGuide: '[Tei-kɒf-jər] wet shoes [æt-ðə-dɔːr].', meaning: 'Cởi đôi giày ướt ở ngay ngoài cửa nhé.' },
      { sentence: 'Button up your shirt neatly.', connectedGuide: '[Bʌ-tə-nʌp] your shirt neatly.', meaning: 'Cài cúc áo sơ mi cho thật gọn gàng nhé.' },
      { sentence: 'Zip up your warm winter jacket.', connectedGuide: '[Zɪ-pʌp] your warm winter jacket.', meaning: 'Kéo khóa chiếc áo khoác mùa đông ấm áp lên nhé.' },
      { sentence: 'That yellow hat looks great on you!', connectedGuide: 'That yellow hat [lʊks-grei-tɒn-ju]!', meaning: 'Chiếc mũ màu vàng đó hợp với bạn lắm!' },
    ],
  },
  {
    number: 17,
    titleEn: 'Day 17: Weather & Four Seasons',
    titleVi: 'Ngày 17: Thời tiết & Bốn mùa',
    topicTag: 'Thời tiết',
    imageUrl: buildTopicIllustration(
      '#E0F2FE',
      '#38BDF8',
      `<circle cx="58" cy="58" r="20" fill="#FACC15"/>
       <path d="M62 108 H118 A18 18 0 0 0 118 72 A24 24 0 0 0 74 66 A16 16 0 0 0 62 108 Z" fill="#FFFFFF" stroke="#0369A1" stroke-width="4"/>`
    ),
    lines: [
      { sentence: 'What is the weather like today?', connectedGuide: '[Wha-tsðə] [we-ðər-laik] təday?', meaning: 'Thời tiết hôm nay như thế nào?' },
      { sentence: 'It is sunny and warm outside.', connectedGuide: '[I-ts] [sʌ-ni-yənd-wɔːm] outside.', meaning: 'Bên ngoài trời đang nắng và ấm áp.' },
      { sentence: 'It looks like it is going to rain.', connectedGuide: 'It [lʊks-laik] it’s [gə-nə-rein].', meaning: 'Trông có vẻ như trời sắp mưa rồi.' },
      { sentence: 'Take an umbrella with you.', connectedGuide: '[Tei-kə-nʌm-bre-lə] with you.', meaning: 'Bạn nhớ mang theo một chiếc ô nhé.' },
      { sentence: 'The wind is blowing quite strongly.', connectedGuide: 'The [wɪn-dɪz] blowing quite strongly.', meaning: 'Gió đang thổi khá mạnh.' },
      { sentence: 'It is freezing cold this morning.', connectedGuide: '[I-tɪz] freezing cold ðɪs morning.', meaning: 'Sáng nay trời lạnh cóng.' },
      { sentence: 'In spring, colorful flowers bloom everywhere.', connectedGuide: 'In spring, colorful flowers [bluː-me-vri-weər].', meaning: 'Vào mùa xuân, hoa rực rỡ nở khắp mọi nơi.' },
      { sentence: 'Summer days are bright and hot.', connectedGuide: 'Summer days ɑː [brai-tənd-hɒt].', meaning: 'Những ngày mùa hè rực nắng và nóng.' },
      { sentence: 'Golden leaves fall down in autumn.', connectedGuide: 'Golden leaves [fɔːl-daʊn] [ɪ-nɔː-təm].', meaning: 'Lá vàng rơi xuống vào mùa thu.' },
      { sentence: 'Look at the rainbow in the sky!', connectedGuide: '[Lʊ-kət-ðə] rainbow [ɪn-ðə-skai]!', meaning: 'Nhìn cầu vồng trên bầu trời kìa!' },
    ],
  },
  {
    number: 18,
    titleEn: 'Day 18: Time & Daily Schedule',
    titleVi: 'Ngày 18: Thời gian & Lịch trình trong ngày',
    topicTag: 'Thời gian',
    imageUrl: buildTopicIllustration(
      '#F3E8FF',
      '#D8B4FE',
      `<rect x="40" y="42" width="80" height="80" rx="12" fill="#FFFFFF" stroke="#7E22CE" stroke-width="4"/>
       <rect x="40" y="42" width="80" height="24" rx="8" fill="#9333EA"/>
       <circle cx="80" cy="90" r="14" fill="#FDE047"/>`
    ),
    lines: [
      { sentence: 'What time is it right now?', connectedGuide: '[Wha-tai-mi-zɪt] right now?', meaning: 'Bây giờ là mấy giờ rồi?' },
      { sentence: 'It is half past seven.', connectedGuide: '[I-ts] [hɑːf-pɑː-se-vən].', meaning: 'Bây giờ là bảy giờ rưỡi.' },
      { sentence: 'It is a quarter to eight.', connectedGuide: '[I-ts-ə] [kwɔː-tər-tə-eit].', meaning: 'Bây giờ là tám giờ kém mười lăm.' },
      { sentence: 'Wait a minute, I am coming.', connectedGuide: '[Wei-tə-mi-nɪt], I’m coming.', meaning: 'Đợi một lát nhé, mình ra ngay đây.' },
      { sentence: 'Hold on a second, please.', connectedGuide: '[Həʊl-dɒ-nə] second, please.', meaning: 'Vui lòng chờ một giây nhé.' },
      { sentence: 'What day is it today?', connectedGuide: '[Whɒt-dei] [ɪ-zɪt] təday?', meaning: 'Hôm nay là thứ mấy?' },
      { sentence: 'Today is Monday morning.', connectedGuide: '[Tə-dei-ɪz] Monday morning.', meaning: 'Hôm nay là sáng thứ Hai.' },
      { sentence: 'When does the English class start?', connectedGuide: 'When dʌz ði [ɪŋ-glɪʃ-klɑːs] start?', meaning: 'Khi nào lớp học tiếng Anh bắt đầu?' },
      { sentence: 'We arrived right on time.', connectedGuide: 'We arrived [rai-tɒn-taim].', meaning: 'Chúng mình đã đến vừa đúng giờ.' },
      { sentence: 'Call me as soon as you get home.', connectedGuide: 'Call me [əz-suː-nəz] you [get-həʊm].', meaning: 'Gọi cho mình ngay khi bạn về tới nhà nhé.' },
    ],
  },
  {
    number: 19,
    titleEn: 'Day 19: Sports & Outdoor Play',
    titleVi: 'Ngày 19: Thể thao & Vận động ngoài trời',
    topicTag: 'Thể thao',
    imageUrl: buildTopicIllustration(
      '#DCFCE7',
      '#4ADE80',
      `<circle cx="80" cy="80" r="38" fill="#FFFFFF" stroke="#15803D" stroke-width="4.5"/>
       <polygon points="80,62 96,74 90,94 70,94 64,74" fill="#15803D"/>`
    ),
    lines: [
      { sentence: 'Let us go outside and play soccer.', connectedGuide: 'Let’s [gəʊ-aʊt-said] ənd [plei-sɒ-kər].', meaning: 'Chúng mình cùng ra ngoài và đá bóng nhé.' },
      { sentence: 'Kick the ball over to me!', connectedGuide: '[Kɪk-ðə-bɔːl] [əʊ-vər-tə-mee]!', meaning: 'Sút quả bóng chuyền sang cho mình nào!' },
      { sentence: 'Can you catch the ball?', connectedGuide: 'Can you [kætʃ-ðə-bɔːl]?', meaning: 'Bạn bắt được quả bóng không?' },
      { sentence: 'We play badminton in the yard.', connectedGuide: 'We play badminton [ɪn-ðə-jɑːd].', meaning: 'Chúng mình đánh cầu lông ở ngoài sân.' },
      { sentence: 'I love riding my bike in the park.', connectedGuide: 'I [lʌv-rai-dɪŋ] my bike [ɪn-ðə-pɑːk].', meaning: 'Mình rất thích đạp xe ở trong công viên.' },
      { sentence: 'Wear your helmet to stay safe.', connectedGuide: '[Weə-jər] helmet tə [stei-seif].', meaning: 'Đội mũ bảo hiểm vào để giữ an toàn nhé.' },
      { sentence: 'Do you know how to swim?', connectedGuide: '[Dju-nəʊ] [haʊ-tə-swɪm]?', meaning: 'Bạn có biết bơi không?' },
      { sentence: 'Let us run a race to that tree!', connectedGuide: 'Let’s [rʌ-nə-reis] tə ðæt tree!', meaning: 'Chúng mình cùng chạy thi tới gốc cây kia nhé!' },
      { sentence: 'Morning exercise keeps us strong.', connectedGuide: 'Morning exercise [keeps-ʌs-strɒŋ].', meaning: 'Tập thể dục buổi sáng giúp chúng ta khỏe mạnh.' },
      { sentence: 'What a great game we played!', connectedGuide: '[Whɒ-tə] [greit-geim] we played!', meaning: 'Trận đấu chúng mình vừa chơi thật tuyệt vời!' },
    ],
  },
  {
    number: 20,
    titleEn: 'Day 20: Hobbies, Music & Art',
    titleVi: 'Ngày 20: Sở thích, Âm nhạc & Hội họa',
    topicTag: 'Sở thích',
    imageUrl: buildTopicIllustration(
      '#FDF4FF',
      '#F0ABFC',
      `<ellipse cx="80" cy="84" rx="42" ry="34" fill="#FFFFFF" stroke="#86198F" stroke-width="4"/>
       <circle cx="62" cy="74" r="7" fill="#EF4444"/>
       <circle cx="80" cy="66" r="7" fill="#FACC15"/>
       <circle cx="98" cy="74" r="7" fill="#3B82F6"/>
       <circle cx="92" cy="94" r="8" fill="#F0ABFC"/>`
    ),
    lines: [
      { sentence: 'What do you do in your free time?', connectedGuide: '[Wha-dju-duː] [ɪn-jər] [free-taim]?', meaning: 'Bạn thường làm gì vào thời gian rảnh?' },
      { sentence: 'I love drawing and painting pictures.', connectedGuide: 'I [lʌv-drɔː-ɪŋ] ənd painting pictures.', meaning: 'Mình rất thích vẽ và tô màu những bức tranh.' },
      { sentence: 'Look at the picture I just drew!', connectedGuide: '[Lʊ-kət-ðə] picture I [dʒʌst-druː]!', meaning: 'Hãy nhìn bức tranh mình vừa mới vẽ này!' },
      { sentence: 'Pass me the box of crayons.', connectedGuide: '[Pɑːs-mee] ðə [bɒk-səv] crayons.', meaning: 'Đưa giúp mình hộp bút sáp màu nhé.' },
      { sentence: 'She plays the piano very well.', connectedGuide: 'She [pleiz-ðə] piano [ve-ri-wel].', meaning: 'Bạn ấy chơi đàn dương cầm rất giỏi.' },
      { sentence: 'Let us sing this English song together.', connectedGuide: 'Let’s [sɪŋ-ðɪs] English song təgether.', meaning: 'Chúng mình cùng nhau hát bài tiếng Anh này nhé.' },
      { sentence: 'I enjoy listening to happy music.', connectedGuide: 'I enjoy [lɪ-sə-nɪŋ-tə] happy music.', meaning: 'Mình thích nghe những bản nhạc vui tươi.' },
      { sentence: 'Can you fold a paper airplane?', connectedGuide: 'Can you [fəʊl-də] paper airplane?', meaning: 'Bạn có biết gấp máy bay giấy không?' },
      { sentence: 'Collecting stickers is my favorite hobby.', connectedGuide: 'Collecting [stɪ-kəz-ɪz] my favorite hobby.', meaning: 'Sưu tầm hình dán là sở thích yêu thích nhất của mình.' },
      { sentence: 'Having hobbies makes life more colorful.', connectedGuide: 'Having hobbies [meiks-laif] more colorful.', meaning: 'Có những sở thích làm cuộc sống thêm nhiều sắc màu.' },
    ],
  },
  {
    number: 21,
    titleEn: 'Day 21: Reading & Storytelling',
    titleVi: 'Ngày 21: Đọc sách & Kể chuyện mỗi ngày',
    topicTag: 'Đọc sách',
    imageUrl: buildTopicIllustration(
      '#EFF6FF',
      '#93C5FD',
      `<path d="M34 52 Q58 42 80 54 Q102 42 126 52 V112 Q102 102 80 114 Q58 102 34 112 Z" fill="#FFFFFF" stroke="#1D4ED8" stroke-width="4"/>
       <line x1="80" y1="54" x2="80" y2="114" stroke="#1D4ED8" stroke-width="4"/>`
    ),
    lines: [
      { sentence: 'Let us read a bedtime story tonight.', connectedGuide: 'Let’s [ree-də] bedtime story tənight.', meaning: 'Tối nay chúng mình cùng đọc một câu chuyện trước khi ngủ nhé.' },
      { sentence: 'Which book would you like to read?', connectedGuide: 'Which book [wʊ-dʒu-laik] tə read?', meaning: 'Con muốn đọc cuốn sách nào?' },
      { sentence: 'Look at the colorful cover of this book.', connectedGuide: '[Lʊ-kət-ðə] colorful [kʌ-və-rəv] ðɪs book.', meaning: 'Hãy nhìn trang bìa đầy màu sắc của cuốn sách này xem.' },
      { sentence: 'Turn to the next page, please.', connectedGuide: '[Tɜːn-tə-ðə] [nekst-peidʒ], please.', meaning: 'Hãy lật sang trang tiếp theo nhé.' },
      { sentence: 'Once upon a time in a green forest.', connectedGuide: '[Wʌn-sə-pɒ-nə] time [ɪ-nə] green forest.', meaning: 'Ngày xửa ngày xưa ở trong một khu rừng xanh.' },
      { sentence: 'Who is your favorite character in the story?', connectedGuide: '[Huː-ɪz] your favorite character [ɪn-ðə] story?', meaning: 'Ai là nhân vật yêu thích của bạn trong câu chuyện?' },
      { sentence: 'I read aloud for fifteen minutes a day.', connectedGuide: 'I [ree-də-laʊd] fər fifteen [mɪ-nɪ-tsə-dei].', meaning: 'Mình đọc sách thành tiếng mười lăm phút mỗi ngày.' },
      { sentence: 'Put a bookmark here before closing it.', connectedGuide: '[Pʊ-tə] bookmark here bɪfore [kləʊ-zɪŋ-ɪt].', meaning: 'Đặt thẻ đánh dấu trang ở đây trước khi gấp sách lại nhé.' },
      { sentence: 'We can borrow books from the library.', connectedGuide: 'We kən borrow books [frəm-ðə] library.', meaning: 'Chúng mình có thể mượn sách từ thư viện.' },
      { sentence: 'Books open up a whole new world.', connectedGuide: 'Books [əʊ-pə-nʌp] ə whole [njuː-wɜːld].', meaning: 'Những cuốn sách mở ra cả một thế giới mới.' },
    ],
  },
  {
    number: 22,
    titleEn: 'Day 22: Pets & Amazing Animals',
    titleVi: 'Ngày 22: Thú cưng & Thế giới động vật',
    topicTag: 'Động vật',
    imageUrl: buildTopicIllustration(
      '#FEF3C7',
      '#FBBF24',
      `<circle cx="80" cy="84" r="32" fill="#FDE68A" stroke="#92400E" stroke-width="4"/>
       <circle cx="68" cy="78" r="4.5" fill="#451A03"/>
       <circle cx="92" cy="78" r="4.5" fill="#451A03"/>
       <ellipse cx="80" cy="88" rx="6" ry="4" fill="#451A03"/>`
    ),
    lines: [
      { sentence: 'Do you have any pets at home?', connectedGuide: '[Dju-hæv] any pets [æt-həʊm]?', meaning: 'Ở nhà bạn có nuôi thú cưng nào không?' },
      { sentence: 'I have a cute little puppy.', connectedGuide: 'I [hæ-və] cute little puppy.', meaning: 'Mình có một chú cún con rất đáng yêu.' },
      { sentence: 'He wags his tail when he sees me.', connectedGuide: 'He [wægz-hɪz-teil] when he [seez-mee].', meaning: 'Chú cún vẫy đuôi mừng rỡ mỗi khi nhìn thấy mình.' },
      { sentence: 'I take my dog for a walk every day.', connectedGuide: 'I [teik-mai-dɒg] [fə-rə-wɔːk] every day.', meaning: 'Mình dắt cún đi dạo mỗi ngày.' },
      { sentence: 'The little kitten is sleeping in the sun.', connectedGuide: 'The little [kɪ-tə-nɪz] sleeping [ɪn-ðə-sʌn].', meaning: 'Chú mèo con đang nằm ngủ dưới ánh nắng.' },
      { sentence: 'Remember to feed the fish this morning.', connectedGuide: 'Remember tə [feed-ðə-fɪʃ] ðɪs morning.', meaning: 'Sáng nay nhớ cho cá ăn nhé.' },
      { sentence: 'Listen to the birds singing in the tree.', connectedGuide: '[Lɪ-sən-tə-ðə] birds singing [ɪn-ðə-tree].', meaning: 'Hãy lắng nghe tiếng chim hót trên cành cây kìa.' },
      { sentence: 'Giraffes have very long necks.', connectedGuide: 'Giraffes hæv [ve-ri-lɒŋ-neks].', meaning: 'Những chú hươu cao cổ có chiếc cổ rất dài.' },
      { sentence: 'Elephants have big ears and a long trunk.', connectedGuide: 'Elephants hæv [bɪ-gɪəz] ənd-ə [lɒŋ-trʌŋk].', meaning: 'Những chú voi có đôi tai to và chiếc vòi dài.' },
      { sentence: 'We should always be kind to animals.', connectedGuide: 'We ʃʊd always [bee-kaind] tə animals.', meaning: 'Chúng ta cần luôn yêu thương và đối xử tốt với động vật.' },
    ],
  },
  {
    number: 23,
    titleEn: 'Day 23: Health & Staying Fit',
    titleVi: 'Ngày 23: Chăm sóc sức khỏe mỗi ngày',
    topicTag: 'Sức khỏe',
    imageUrl: buildTopicIllustration(
      '#F0FDFA',
      '#5EEAD4',
      `<circle cx="80" cy="80" r="36" fill="#FFFFFF" stroke="#0F766E" stroke-width="4"/>
       <rect x="72" y="56" width="16" height="48" rx="4" fill="#EF4444"/>
       <rect x="56" y="72" width="48" height="16" rx="4" fill="#EF4444"/>`
    ),
    lines: [
      { sentence: 'What is the matter with you?', connectedGuide: '[Whɒ-tsðə] matter with you?', meaning: 'Bạn đang gặp vấn đề gì thế?' },
      { sentence: 'I have a slight headache today.', connectedGuide: 'I [hæ-və] slight headache təday.', meaning: 'Hôm nay mình bị đau đầu nhẹ.' },
      { sentence: 'Let me check your temperature first.', connectedGuide: '[Lem-mee] [tʃek-jər] temperature first.', meaning: 'Để mẹ cặp nhiệt độ kiểm tra cho con trước nhé.' },
      { sentence: 'You should take a rest in bed.', connectedGuide: 'You ʃʊd [tei-kə-rest] [ɪn-bed].', meaning: 'Con nên nằm nghỉ ngơi trên giường nhé.' },
      { sentence: 'Drink plenty of warm water today.', connectedGuide: 'Drink [plen-ti-əv] warm water təday.', meaning: 'Hôm nay hãy uống thật nhiều nước ấm nhé.' },
      { sentence: 'Open your mouth and say ah.', connectedGuide: '[Əʊ-pən-jər] mouth ənd [sei-ɑː].', meaning: 'Há miệng ra và nói A nào.' },
      { sentence: 'Take this medicine after your meal.', connectedGuide: '[Teik-ðɪs] medicine [ɑːf-tər-jər] meal.', meaning: 'Uống thuốc này sau bữa ăn nhé.' },
      { sentence: 'Brush your teeth twice a day.', connectedGuide: '[Brʌʃ-jər-teeθ] [twai-sə-dei].', meaning: 'Đánh răng đều đặn hai lần mỗi ngày nhé.' },
      { sentence: 'An apple a day keeps the doctor away.', connectedGuide: '[Ə-næ-pə-lə-dei] keeps ðə [dɒk-tə-rə-wei].', meaning: 'Mỗi ngày ăn một quả táo giúp cơ thể luôn khỏe mạnh.' },
      { sentence: 'I hope you get well very soon!', connectedGuide: 'I həʊp you [get-wel] very soon!', meaning: 'Mình chúc bạn mau chóng bình phục nhé!' },
    ],
  },
  {
    number: 24,
    titleEn: 'Day 24: Asking Directions & Places',
    titleVi: 'Ngày 24: Hỏi đường & Chỉ dẫn địa điểm',
    topicTag: 'Hỏi đường',
    imageUrl: buildTopicIllustration(
      '#FEF9C3',
      '#FACC15',
      `<rect x="74" y="36" width="12" height="92" rx="4" fill="#78350F"/>
       <polygon points="44,50 116,50 128,62 116,74 44,74" fill="#22C55E" stroke="#14532D" stroke-width="3.5"/>
       <polygon points="116,82 44,82 32,94 44,106 116,106" fill="#3B82F6" stroke="#1E3A8A" stroke-width="3.5"/>`
    ),
    lines: [
      { sentence: 'Excuse me, where is the post office?', connectedGuide: 'Excuse me, [weə-rɪz] ðə [pəʊ-stɒ-fɪs]?', meaning: 'Xin lỗi, cho mình hỏi bưu điện ở đâu ạ?' },
      { sentence: 'Could you tell me the way to the park?', connectedGuide: '[Kʊ-dʒu] [tel-mee] ðə [wei-tə-ðə] park?', meaning: 'Bạn chỉ giúp mình đường ra công viên được không?' },
      { sentence: 'Go straight ahead for two blocks.', connectedGuide: '[Gəʊ-strei-tə-hed] fər two blocks.', meaning: 'Hãy đi thẳng về phía trước hai dãy nhà.' },
      { sentence: 'Turn left at the traffic lights.', connectedGuide: '[Tɜːn-left] [æt-ðə] traffic lights.', meaning: 'Rẽ trái ở chỗ đèn giao thông nhé.' },
      { sentence: 'Turn right at the next corner.', connectedGuide: '[Tɜːn-rait] [æt-ðə] [nekst-kɔː-nər].', meaning: 'Rẽ phải ở góc đường tiếp theo nhé.' },
      { sentence: 'It is right across from the bank.', connectedGuide: '[I-tɪz] [rai-tə-krɒs] frəm ðə bank.', meaning: 'Nó nằm ngay đối diện phía bên kia ngân hàng.' },
      { sentence: 'The bookstore is next to the bakery.', connectedGuide: 'The [bʊk-stɔː-rɪz] [nekst-tə-ðə] bakery.', meaning: 'Hiệu sách nằm ngay bên cạnh tiệm bánh mì.' },
      { sentence: 'Is it far from here?', connectedGuide: '[ɪ-zɪt] [fɑː-frəm-hɪər]?', meaning: 'Chỗ đó có xa đây không?' },
      { sentence: 'It takes about five minutes on foot.', connectedGuide: '[ɪt-teiks] əbout five minutes [ɒn-fʊt].', meaning: 'Đi bộ mất khoảng năm phút thôi.' },
      { sentence: 'You cannot miss it, thank you!', connectedGuide: 'You [kæ-nɒt-mɪ-sɪt], [θæŋ-kju]!', meaning: 'Bạn sẽ nhìn thấy ngay thôi, cảm ơn bạn!' },
    ],
  },
  {
    number: 25,
    titleEn: 'Day 25: Transportation & Travel',
    titleVi: 'Ngày 25: Phương tiện giao thông & Di chuyển',
    topicTag: 'Giao thông',
    imageUrl: buildTopicIllustration(
      '#E0F2FE',
      '#60A5FA',
      `<rect x="34" y="56" width="92" height="44" rx="10" fill="#FACC15" stroke="#B45309" stroke-width="4"/>
       <rect x="44" y="64" width="22" height="16" rx="4" fill="#FFFFFF"/>
       <rect x="74" y="64" width="22" height="16" rx="4" fill="#FFFFFF"/>
       <circle cx="56" cy="102" r="10" fill="#1E293B"/>
       <circle cx="104" cy="102" r="10" fill="#1E293B"/>`
    ),
    lines: [
      { sentence: 'How do you go to school every day?', connectedGuide: 'How [dju-gəʊ] tə school every day?', meaning: 'Hàng ngày bạn đi học bằng phương tiện gì?' },
      { sentence: 'I usually go to school by bus.', connectedGuide: 'I usually [gəʊ-tə-skuːl] [bai-bʌs].', meaning: 'Mình thường đi đến trường bằng xe buýt.' },
      { sentence: 'Wait for the green light to cross.', connectedGuide: '[Weit-fər-ðə] green light tə cross.', meaning: 'Hãy đợi đèn xanh bật lên rồi mới qua đường nhé.' },
      { sentence: 'Look both ways before crossing the road.', connectedGuide: '[Lʊk-bəʊθ-weiz] bɪfore crossing ðə road.', meaning: 'Nhìn kỹ cả hai phía trước khi băng qua đường nhé.' },
      { sentence: 'Fasten your seat belt in the car.', connectedGuide: '[Fɑː-sən-jər] seat belt [ɪn-ðə-kɑːr].', meaning: 'Thắt dây an toàn khi ngồi trên xe ô tô nhé.' },
      { sentence: 'Which bus goes to the city center?', connectedGuide: 'Which bus [gəʊz-tə-ðə] city center?', meaning: 'Chuyến xe buýt nào đi tới trung tâm thành phố?' },
      { sentence: 'Let us get on the train now.', connectedGuide: 'Let’s [ge-tɒn-ðə] train now.', meaning: 'Bây giờ chúng mình cùng lên tàu nhé.' },
      { sentence: 'We will get off at the next stop.', connectedGuide: 'We’ll [ge-tɒ-fæt] ðə [nekst-stɒp].', meaning: 'Chúng mình sẽ xuống xe ở trạm dừng tiếp theo.' },
      { sentence: 'Have a safe and pleasant trip!', connectedGuide: '[Ha-və] [sei-fənd] pleasant trip!', meaning: 'Chúc bạn có một chuyến đi an toàn và vui vẻ!' },
      { sentence: 'We arrived at the airport early.', connectedGuide: 'We [ə-raiv-dæt] ði airport early.', meaning: 'Chúng mình đã đến sân bay từ sớm.' },
    ],
  },
  {
    number: 26,
    titleEn: 'Day 26: Weekend & Picnic Fun',
    titleVi: 'Ngày 26: Dã ngoại & Vui chơi cuối tuần',
    topicTag: 'Dã ngoại',
    imageUrl: buildTopicIllustration(
      '#ECFDF5',
      '#6EE7B7',
      `<polygon points="80,32 110,66 80,104 50,66" fill="#F43F5E" stroke="#065F46" stroke-width="4" stroke-linejoin="round"/>
       <line x1="80" y1="32" x2="80" y2="104" stroke="#FDE047" stroke-width="3.5"/>
       <line x1="50" y1="66" x2="110" y2="66" stroke="#FDE047" stroke-width="3.5"/>`
    ),
    lines: [
      { sentence: 'What are you doing this weekend?', connectedGuide: '[Wha-dər-ju] doing [ðɪ-sweek-end]?', meaning: 'Cuối tuần này bạn định làm gì?' },
      { sentence: 'We are going for a picnic by the lake.', connectedGuide: 'We’re [gəʊ-ɪŋ-fə-rə] picnic [bai-ðə-leik].', meaning: 'Gia đình mình sẽ đi dã ngoại ở bên bờ hồ.' },
      { sentence: 'Spread the picnic mat on the grass.', connectedGuide: '[Spred-ðə] picnic mat [ɒn-ðə-grɑːs].', meaning: 'Trải tấm thảm dã ngoại lên thảm cỏ nhé.' },
      { sentence: 'We brought sandwiches and fresh fruit.', connectedGuide: 'We brought sandwiches ənd [freʃ-fruːt].', meaning: 'Chúng mình mang theo bánh mì kẹp và trái cây tươi.' },
      { sentence: 'Let us fly a kite in the wind.', connectedGuide: 'Let’s [flai-ə-kait] [ɪn-ðə-wɪnd].', meaning: 'Chúng mình cùng thả diều đón gió nhé.' },
      { sentence: 'The kite is flying high in the sky!', connectedGuide: 'The [kai-tɪz] flying [hai-ɪn-ðə] sky!', meaning: 'Chiếc diều đang bay cao tít trên bầu trời!' },
      { sentence: 'We are going to visit grandma on Sunday.', connectedGuide: 'We’re [gəʊ-ɪŋ-tə] visit grandma [ɒn-sʌn-dei].', meaning: 'Chủ nhật này chúng mình sẽ đi thăm bà.' },
      { sentence: 'Can you take a photo for us?', connectedGuide: 'Can you [tei-kə-fəʊ-təʊ] [fə-rʌs]?', meaning: 'Bạn chụp giúp chúng mình một bức ảnh được không?' },
      { sentence: 'Say cheese and give a big smile!', connectedGuide: '[Sei-tʃeez] ənd [gɪ-və-bɪg] smile!', meaning: 'Cười thật tươi lên để chụp ảnh nào!' },
      { sentence: 'Have a wonderful weekend with your family!', connectedGuide: '[Ha-və] wonderful weekend with your family!', meaning: 'Chúc bạn một kỳ nghỉ cuối tuần tuyệt vời bên gia đình!' },
    ],
  },
  {
    number: 27,
    titleEn: 'Day 27: Birthday & Celebrations',
    titleVi: 'Ngày 27: Tiệc sinh nhật & Ngày kỷ niệm',
    topicTag: 'Sinh nhật',
    imageUrl: buildTopicIllustration(
      '#FDF4FF',
      '#F5D0FE',
      `<rect x="38" y="84" width="84" height="38" rx="8" fill="#F472B6" stroke="#86198F" stroke-width="4"/>
       <rect x="52" y="62" width="56" height="22" rx="6" fill="#FDE047" stroke="#86198F" stroke-width="4"/>
       <line x1="80" y1="62" x2="80" y2="42" stroke="#EF4444" stroke-width="5" stroke-linecap="round"/>
       <circle cx="80" cy="34" r="6" fill="#F97316"/>`
    ),
    lines: [
      { sentence: 'Happy birthday to you!', connectedGuide: '[Hæ-pi-bɜːθ-dei] [tə-ju]!', meaning: 'Chúc mừng sinh nhật bạn nhé!' },
      { sentence: 'Welcome to my birthday party!', connectedGuide: '[Wel-kəm-tə] my birthday party!', meaning: 'Chào mừng các bạn đến dự bữa tiệc sinh nhật của mình!' },
      { sentence: 'This gift is specially for you.', connectedGuide: '[Ðɪs-gɪf-tɪz] specially [fər-ju].', meaning: 'Món quà này dành tặng riêng cho bạn đấy.' },
      { sentence: 'Can I open the present now?', connectedGuide: '[Cə-nai] [əʊ-pən-ðə] present now?', meaning: 'Bây giờ mình mở hộp quà ra được không?' },
      { sentence: 'Let us decorate the room with balloons.', connectedGuide: 'Let’s decorate ðə room with balloons.', meaning: 'Chúng mình cùng trang trí căn phòng bằng bóng bay nhé.' },
      { sentence: 'Mom baked a big chocolate cake.', connectedGuide: 'Mom [beik-tə] big chocolate cake.', meaning: 'Mẹ đã nướng một chiếc bánh kem sô-cô-la thật lớn.' },
      { sentence: 'Close your eyes and make a wish!', connectedGuide: '[Kləʊ-zjər-aiz] ənd [mei-kə-wɪʃ]!', meaning: 'Hãy nhắm mắt lại và ước một điều ước nào!' },
      { sentence: 'Blow out all the candles now!', connectedGuide: '[Bləʊ-aʊ-tɔːl] ðə candles now!', meaning: 'Thổi tắt hết những ngọn nến ngay nào!' },
      { sentence: 'Let us cut the cake and share it.', connectedGuide: 'Let’s [kʌt-ðə-keik] ənd [ʃeə-rɪt].', meaning: 'Chúng mình cùng cắt bánh và chia cho mọi người nhé.' },
      { sentence: 'Wishing you health, joy, and happiness!', connectedGuide: '[Wɪ-ʃɪŋ-ju] health, joy, ənd happiness!', meaning: 'Chúc bạn luôn mạnh khỏe, vui vẻ và hạnh phúc!' },
    ],
  },
  {
    number: 28,
    titleEn: 'Day 28: Phone & Video Calls',
    titleVi: 'Ngày 28: Gọi điện thoại & Trò chuyện trực tuyến',
    topicTag: 'Điện thoại',
    imageUrl: buildTopicIllustration(
      '#E0F2FE',
      '#7DD3FC',
      `<rect x="52" y="30" width="56" height="100" rx="12" fill="#FFFFFF" stroke="#0369A1" stroke-width="4"/>
       <rect x="60" y="42" width="40" height="68" rx="6" fill="#BAE6FD"/>
       <circle cx="80" cy="120" r="4" fill="#0369A1"/>`
    ),
    lines: [
      { sentence: 'Hello, this is Anna speaking.', connectedGuide: 'Hello, [ðɪ-sɪz] Anna speaking.', meaning: 'Xin chào, mình là Anna đang nghe máy đây.' },
      { sentence: 'May I speak to Mr. Brown, please?', connectedGuide: '[Mei-yai] [speek-tə] Mr. Brown, please?', meaning: 'Cho mình xin phép nói chuyện với chú Brown được không ạ?' },
      { sentence: 'Hold on a moment, I will get him.', connectedGuide: '[Həʊl-dɒ-nə] moment, I’ll [ge-tɪm].', meaning: 'Giữ máy chờ một lát nhé, mình sẽ gọi chú ấy ngay.' },
      { sentence: 'Can you hear me clearly now?', connectedGuide: 'Can you [hɪə-mee] clearly now?', meaning: 'Bây giờ bạn có nghe thấy mình nói rõ không?' },
      { sentence: 'Your voice is breaking up a bit.', connectedGuide: 'Your [vɔi-sɪz] [brei-kɪŋ-ʌp] ə bit.', meaning: 'Tiếng của bạn đang bị ngắt quãng một chút.' },
      { sentence: 'Let us turn on the camera.', connectedGuide: 'Let’s [tɜː-nɒn-ðə] camera.', meaning: 'Chúng mình cùng bật camera lên nhé.' },
      { sentence: 'Can I leave a message for her?', connectedGuide: '[Cə-nai] [lee-və] message [fər-hɜːr]?', meaning: 'Mình có thể để lại lời nhắn cho cô ấy được không?' },
      { sentence: 'I will call you back in ten minutes.', connectedGuide: 'I’ll [kɔːl-ju-bæk] [ɪn-ten] minutes.', meaning: 'Mình sẽ gọi lại cho bạn sau mười phút nữa nhé.' },
      { sentence: 'Send me a text message when you arrive.', connectedGuide: '[Send-mee-ə] text message when you arrive.', meaning: 'Nhắn tin cho mình khi bạn đến nơi nhé.' },
      { sentence: 'It was great talking to you, bye!', connectedGuide: 'It wəz [greit-tɔː-kɪŋ] tə you, bye!', meaning: 'Trò chuyện với bạn vui lắm, tạm biệt nhé!' },
    ],
  },
  {
    number: 29,
    titleEn: 'Day 29: Making Plans & Invitations',
    titleVi: 'Ngày 29: Lên kế hoạch & Lời mời thân thiện',
    topicTag: 'Kế hoạch',
    imageUrl: buildTopicIllustration(
      '#EDE9FE',
      '#C4B5FD',
      `<rect x="38" y="42" width="84" height="78" rx="12" fill="#FFFFFF" stroke="#6D28D9" stroke-width="4"/>
       <path d="M56 84 L72 98 L104 66" fill="none" stroke="#7C3AED" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
    ),
    lines: [
      { sentence: 'Are you free this Saturday afternoon?', connectedGuide: '[ɑː-ju-free] ðɪs Saturday afternoon?', meaning: 'Chiều thứ Bảy tuần này bạn có rảnh không?' },
      { sentence: 'Would you like to come to my house?', connectedGuide: '[Wʊ-dʒu-laik] tə [cʌm-tə] my house?', meaning: 'Bạn có muốn sang nhà mình chơi không?' },
      { sentence: 'I would love to! What time?', connectedGuide: '[I-d-lʌv-tə]! [Whɒt-taim]?', meaning: 'Mình rất thích! Mấy giờ thế bạn?' },
      { sentence: 'How about meeting at three o’clock?', connectedGuide: '[Haʊ-ə-baʊt] meeting æt [θree-ə-klɒk]?', meaning: 'Hẹn gặp nhau lúc ba giờ đúng thì sao nhỉ?' },
      { sentence: 'That sounds like a great plan!', connectedGuide: 'That sounds [lai-kə] [greit-plæn]!', meaning: 'Nghe có vẻ là một kế hoạch tuyệt vời đấy!' },
      { sentence: 'Where should we meet each other?', connectedGuide: 'Where ʃʊd we [mee-teetʃ-ʌ-ðər]?', meaning: 'Chúng mình nên hẹn gặp nhau ở đâu?' },
      { sentence: 'Let us meet in front of the library.', connectedGuide: 'Let’s meet [ɪn-frʌn-təv] ðə library.', meaning: 'Chúng mình hẹn gặp ở phía trước thư viện nhé.' },
      { sentence: 'Can my little brother come along?', connectedGuide: 'Can my little brother [cʌ-mə-lɒŋ]?', meaning: 'Em trai nhỏ của mình đi cùng có được không?' },
      { sentence: 'Of course! The more, the merrier.', connectedGuide: '[Əv-kɔːs]! The more, ðə merrier.', meaning: 'Tất nhiên rồi! Càng đông càng vui mà.' },
      { sentence: 'See you on Saturday! Do not be late.', connectedGuide: '[See-ju-wɒn] Saturday! [Dəʊnt-bee-leit].', meaning: 'Hẹn gặp bạn vào thứ Bảy nhé! Đừng đến muộn nha.' },
    ],
  },
  {
    number: 30,
    titleEn: 'Day 30: Dreams & Future Goals',
    titleVi: 'Ngày 30: Ước mơ & Mục tiêu tương lai',
    topicTag: 'Ước mơ',
    imageUrl: buildTopicIllustration(
      '#FEF3C7',
      '#FDE047',
      `<polygon points="80,26 96,60 132,64 104,88 112,124 80,104 48,124 56,88 28,64 64,60" fill="#F59E0B" stroke="#78350F" stroke-width="4" stroke-linejoin="round"/>
       <circle cx="80" cy="76" r="10" fill="#FFFFFF"/>`
    ),
    lines: [
      { sentence: 'What do you want to be in the future?', connectedGuide: '[Wha-dju] [wɒn-tə-bee] [ɪn-ðə] future?', meaning: 'Trong tương lai bạn muốn làm nghề gì?' },
      { sentence: 'When I grow up, I want to be a doctor.', connectedGuide: 'When I [grəʊ-ʌp], I [wɒn-tə-bee-ə] doctor.', meaning: 'Khi lớn lên, mình muốn trở thành một bác sĩ.' },
      { sentence: 'I want to help people stay healthy.', connectedGuide: 'I [wɒn-tə-help] people [stei-hel-θi].', meaning: 'Mình muốn giúp mọi người luôn giữ gìn sức khỏe.' },
      { sentence: 'My dream is to travel around the world.', connectedGuide: 'My [dree-mɪz] tə [træ-və-lə-raʊnd] ðə world.', meaning: 'Ước mơ của mình là được đi du lịch vòng quanh thế giới.' },
      { sentence: 'Speaking English well opens many doors.', connectedGuide: '[Spee-kɪŋ-ɪŋ-glɪʃ] well [əʊ-pənz] many doors.', meaning: 'Nói tiếng Anh tốt sẽ mở ra rất nhiều cánh cửa cơ hội.' },
      { sentence: 'I practice listening and speaking every day.', connectedGuide: 'I practice listening ənd [spee-kɪŋ-e-vri] day.', meaning: 'Mình luyện nghe và nói tiếng Anh đều đặn mỗi ngày.' },
      { sentence: 'Step by step, I am getting closer to my goal.', connectedGuide: '[Step-bai-step], I’m getting [kləʊ-sər-tə] my goal.', meaning: 'Từng bước một, mình đang tiến gần hơn tới mục tiêu.' },
      { sentence: 'Always believe in your own dreams.', connectedGuide: 'Always [bɪ-lee-vɪn] your own dreams.', meaning: 'Hãy luôn tin tưởng vào ước mơ của chính mình.' },
      { sentence: 'Hard work always pays off in the end.', connectedGuide: '[Hɑːd-wɜːk] always [peiz-ɒf] [ɪn-ði-end].', meaning: 'Sự chăm chỉ nỗ lực cuối cùng sẽ luôn được đền đáp.' },
      { sentence: 'Congratulations on completing thirty days of Mimic!', connectedGuide: 'Congratulations ɒn completing thirty [deiz-əv] Mimic!', meaning: 'Chúc mừng bạn đã hoàn thành trọn vẹn 30 ngày luyện nói Mimic!' },
    ],
  },
];

export const SHORT_SPEECH_A1_LESSONS: ShortSpeechLesson[] = RAW_MIMIC_30_DAYS.map(
  (day) => ({
    id: `mimic-day-${String(day.number).padStart(2, '0')}`,
    number: day.number,
    titleEn: day.titleEn.replace(/^Day\s+\d+:\s*/i, ''),
    titleVi: day.titleVi.replace(/^Ngày\s+\d+:/i, `Chủ đề ${day.number}:`),
    level: 'Mimic 30 Chủ đề',
    topicTag: day.topicTag,
    imageUrl: day.imageUrl,
    lines: day.lines.map((l, idx) => {
      const bracketMatches = Array.from(
        l.connectedGuide.matchAll(/\[([^\]]+)\]/g)
      ).map((m) => m[1]);
      return {
        id: `d${day.number}-s${idx + 1}`,
        sentence: l.sentence,
        connectedGuide: l.connectedGuide,
        meaning: l.meaning,
        chunks: bracketMatches.length > 0 ? bracketMatches : [l.sentence],
      };
    }),
  })
);

