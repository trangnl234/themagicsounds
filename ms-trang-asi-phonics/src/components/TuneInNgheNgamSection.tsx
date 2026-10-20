import React, { useState, useEffect, useRef } from 'react';
import {
  recordStudentProgress,
  syncStudentAccountOnLogin,
} from '../utils/studentProgressApi';

export interface TuneInChannelVideoItem {
  videoId: string;
  title: string;
  duration?: string;
  publishedTime?: string;
}

export interface TuneInYoutubeChannel {
  id: string;
  name: string;
  ageGroup: '0-3' | '3-6';
  ageBadge: string;
  categoryBadge: string;
  durationBadge: string;
  themeDesc: string;
  youtubeUrl: string;
  avatarUrl: string;
  coverImageUrl: string;
  embedVideoIds: string[];
}

const STORAGE_KEY_LISTENING_TIME_PREFIX = 'phonics_tunein_listening_stats_v1_';

const IN_CHANNEL_QUICK_TOPICS_0_3 = [
  { label: 'Tất cả trong kênh', query: '' },
  { label: 'ABC & Alphabet', query: 'alphabet abc' },
  { label: 'Numbers 1-10', query: 'numbers counting' },
  { label: 'Colors & Shapes', query: 'colors shapes' },
  { label: 'Animals', query: 'animals farm' },
  { label: 'Dance & Action', query: 'dance action song' },
  { label: 'Bedtime & Lullaby', query: 'bedtime sleep twinkle' },
];

const IN_CHANNEL_QUICK_TOPICS_3_6 = [
  { label: 'Tất cả trong kênh', query: '' },
  { label: 'Family & Home', query: 'family home' },
  { label: 'School & Friends', query: 'school friends play' },
  { label: 'Food & Picnic', query: 'food picnic breakfast' },
  { label: 'Holiday & Trip', query: 'holiday park beach' },
  { label: 'Bedtime Stories', query: 'bedtime night story' },
  { label: 'Full Episodes', query: 'full episode compilation' },
];

/**
 * Danh sách kênh YouTube Nghe Ngấm Tự Do cho học sinh 0–6 tuổi
 * trích xuất từ Danh sách Ngữ liệu Thực (InE Team), chia rõ 2 khung độ tuổi:
 * - Khung 1: 0–3 tuổi (Nhạc vận động, đồng dao, hoạt hình câu ngắn êm dịu)
 * - Khung 2: 3–6 tuổi (Hoạt hình giao tiếp gia đình, truyện kể Storytelling & khám phá)
 */
export const TUNE_IN_CURATED_CHANNELS: TuneInYoutubeChannel[] = [
  // ==========================================================================
  // KHUNG 1: ĐỘ TUỔI 0 – 3 TUỔI (CHỦ YẾU KÊNH CA NHẠC VUI • PRIMARY • A1)
  // ==========================================================================
  {
    id: 'yt-0-3-super-simple-songs',
    name: 'Super Simple Songs',
    ageGroup: '0-3',
    ageBadge: '0–3 tuổi • Primary',
    categoryBadge: 'Ca nhạc vui • Primary • A1',
    durationBadge: '3–5 mins',
    themeDesc:
      'Ca nhạc thiếu nhi vui nhộn, nhịp chậm, giai điệu bắt tai & từ vựng cơ bản chuẩn Primary (A1)',
    youtubeUrl: 'https://www.youtube.com/@SuperSimpleSongs',
    avatarUrl:
      'https://yt3.googleusercontent.com/x7yHOvSWKX_olv_pgx1Ou4SsHI_eOg27sXy9jbNO15rHMG3y425LnmFIyoxDyvLA8Qi3k_0rWw=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/KKNHyhl6aXU/hqdefault.jpg',
    embedVideoIds: [
      'KKNHyhl6aXU',
      'Ne-ZcF58px4',
      'LuJe0ad1Ygk',
      'GzIObE7uR8Q',
      'uBweptmCYZg',
      'eBVqcTEC3zQ',
      'WRVsOCh907o',
      'l4WNrvVjiTw',
      'OzKY5YHnOTg',
      '75p-N9YKqNo',
      'fPMjnlTEZwU',
      'hq3yfQnllfQ',
    ],
  },
  {
    id: 'yt-0-3-the-wiggles',
    name: 'The Wiggles',
    ageGroup: '0-3',
    ageBadge: '0–3 tuổi • Primary',
    categoryBadge: 'Ca nhạc vui • Primary • A1',
    durationBadge: '3–10 mins',
    themeDesc:
      'Âm nhạc vận động vui tươi, ca hát nhún nhảy giúp bé cảm thụ nhịp điệu tiếng Anh tự nhiên (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@TheWiggles',
    avatarUrl:
      'https://yt3.googleusercontent.com/NYkVY0zjC2bivn1UOGmgCpsFl0y48SaMqv7qyzUaT4S67WEK-NLCA_CYSau16nfwXwiGRljT=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/MkCL6Gzhq0w/hqdefault.jpg',
    embedVideoIds: [
      'MkCL6Gzhq0w',
      'LmkV8Mk98bI',
      '0tP1SglvyEU',
      '3EJ-RCq23pI',
      'yNj1IhFzwOs',
      'fb2aAtapOQk',
      '6nWFnWTbq-0',
      '_FUveFAVPKk',
      'eIyCT-xKQUM',
      'HFD8eu_wAr8',
    ],
  },
  {
    id: 'yt-0-3-bounce-patrol',
    name: 'Bounce Patrol - Kids Songs',
    ageGroup: '0-3',
    ageBadge: '0–3 tuổi • Primary',
    categoryBadge: 'Ca nhạc vui • Primary • A1',
    durationBadge: '3–5 mins',
    themeDesc:
      'Ca nhạc thiếu nhi sôi động, sắc màu tươi sáng, làm quen bảng chữ cái & vận động theo nhạc (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@BouncePatrol',
    avatarUrl:
      'https://yt3.googleusercontent.com/ytc/AIdro_mI96w7ZDNqK8w_bxjASmLysfsUY2txHbXKZd8NTSnKF2s=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/qxJ_CY-vm_8/hqdefault.jpg',
    embedVideoIds: [
      'qxJ_CY-vm_8',
      'wmW5rneQXUs',
      'bUiEwZ1Wxjk',
      'lCtiWaqcLPs',
      'YSlX8W9vW5w',
    ],
  },
  {
    id: 'yt-0-3-dream-english-kids',
    name: 'Dream English Kids',
    ageGroup: '0-3',
    ageBadge: '0–3 tuổi • Primary',
    categoryBadge: 'Ca nhạc vui • Primary • A1',
    durationBadge: '3–5 mins',
    themeDesc:
      'Bài hát tiếng Anh vui nhộn, câu hát ngắn lặp lại cực dễ nghe và nhún nhảy theo (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@DreamEnglishKids',
    avatarUrl:
      'https://yt3.googleusercontent.com/ytc/AIdro_mMWSn5EMfdyQBKZ03a6Fh9my3mX_loCknCRUzyhnWWH5Y=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/zOXcK8F16ck/hqdefault.jpg',
    embedVideoIds: [
      'zOXcK8F16ck',
      'tHTScIenG9k',
      'E96cLT6nTPY',
      '1B1vGkcWt-I',
      '3veWhk7m_cQ',
    ],
  },
  {
    id: 'yt-0-3-tree-of-wisdom',
    name: 'The Tree of Wisdom',
    ageGroup: '0-3',
    ageBadge: '0–3 tuổi • Primary',
    categoryBadge: 'Ca nhạc vui • Primary • A1',
    durationBadge: '3–8 mins',
    themeDesc:
      'Giai điệu ca nhạc vui nhộn, dí dỏm giúp bé hào hứng lắng nghe & vận động mỗi ngày (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@TheWiggles',
    avatarUrl: 'https://i.ytimg.com/vi/fb2aAtapOQk/hqdefault.jpg',
    coverImageUrl: 'https://i.ytimg.com/vi/fb2aAtapOQk/hqdefault.jpg',
    embedVideoIds: [
      'fb2aAtapOQk',
      '6nWFnWTbq-0',
      '_FUveFAVPKk',
      'eIyCT-xKQUM',
      'HFD8eu_wAr8',
    ],
  },
  {
    id: 'yt-0-3-dj-raphi',
    name: 'DJ Raphi - Kids Dance Songs',
    ageGroup: '0-3',
    ageBadge: '0–3 tuổi • Primary',
    categoryBadge: 'Ca nhạc vui • Primary • A1',
    durationBadge: '3–5 mins',
    themeDesc:
      'Nhạc nhảy thiếu nhi vui nhộn, nhịp điệu sôi động giúp bé phản xạ tự nhiên qua vận động (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@DJRaphi',
    avatarUrl:
      'https://yt3.googleusercontent.com/nf8_5wpQurn2rz688EKNeudX70GiUmv1MPWwUvZjTCdAiN3NY_gfdsU2jziO6rLT40Ygl6jPzQ=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/tgV05xZALIw/hqdefault.jpg',
    embedVideoIds: [
      'tgV05xZALIw',
      '3eudRQs6ukY',
      'Ee9bIsea6PQ',
      'Y5hJMjUSZCg',
      'wct6JZj1a6c',
    ],
  },
  {
    id: 'yt-0-3-barney-songs',
    name: 'Barney & Friends (Kids Songs)',
    ageGroup: '0-3',
    ageBadge: '0–3 tuổi • Primary',
    categoryBadge: 'Ca nhạc vui • Primary • A1',
    durationBadge: '3–10 mins',
    themeDesc:
      'Các bài hát thiếu nhi kinh điển vui tươi về tình bạn, gia đình & yêu thương (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@Barney',
    avatarUrl:
      'https://yt3.googleusercontent.com/rljQ7LtBfmr4_oSsATGP__GORoZKZZ3-X1G68MJTL51vVYFPp0ttvj-6sv9tO6U9EoghUHMVv4c=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/22Mn4gI3-00/hqdefault.jpg',
    embedVideoIds: [
      '22Mn4gI3-00',
      'awrpwldIlEQ',
      '3q5VmwWRFb8',
      'V-pwzIL6lYY',
      'QLkcf-a3XAI',
    ],
  },
  {
    id: 'yt-0-3-netflix-jr-songs',
    name: 'Netflix Jr. Nursery Rhymes & Songs',
    ageGroup: '0-3',
    ageBadge: '0–3 tuổi • Primary',
    categoryBadge: 'Ca nhạc vui • Primary • A1',
    durationBadge: '3–6 mins',
    themeDesc:
      'Tuyển tập bài hát đồng dao thiếu nhi vui nhộn, hình ảnh bắt mắt chuẩn Primary • A1',
    youtubeUrl: 'https://www.youtube.com/@NetflixJr',
    avatarUrl:
      'https://yt3.googleusercontent.com/wwngc-7lnve847kvoCymKGW0gAt_U_K-iAtPHLY8a7O2xtl9nbC1rJ-c7aLOT0IGJA0DmJgm4Q=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/VL7ZF-Jn_Jg/hqdefault.jpg',
    embedVideoIds: [
      'VL7ZF-Jn_Jg',
      '_7hl4XVEr34',
      'eEJoft6Xpfw',
      'jwBZRn2rE2c',
      'KtuHuUZ-U8g',
    ],
  },

  // ==========================================================================
  // KHUNG 2: ĐỘ TUỔI 3 – 6 TUỔI (CHỈ CHỌN KÊNH DỄ TỚI A1 • PRIMARY • A1)
  // ==========================================================================
  {
    id: 'yt-3-6-peppa-pig',
    name: 'Peppa Pig',
    ageGroup: '3-6',
    ageBadge: '3–6 tuổi • Primary',
    categoryBadge: 'Hoạt hình • Primary • A1',
    durationBadge: '5 mins',
    themeDesc:
      'Giao tiếp gia đình và các tình huống đời sống hàng ngày câu ngắn dễ nghe (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@PeppaPigOfficial',
    avatarUrl:
      'https://yt3.googleusercontent.com/rif9IX4_RzmYGQylB0lO0R1jp-Jt7lOYxyOlgBdPtlZZdEhxSu0pMQctyHEInn_wW-0rtb8i7A=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/m9_cVxoENL8/hqdefault.jpg',
    embedVideoIds: [
      'm9_cVxoENL8',
      'RjHq-aimIuk',
      'F5DgIQEeMes',
      'JfJvBDetyOw',
      'u9JLd63F7xI',
    ],
  },
  {
    id: 'yt-3-6-bluey',
    name: 'Bluey',
    ageGroup: '3-6',
    ageBadge: '3–6 tuổi • Primary',
    categoryBadge: 'Hoạt hình • Primary • A1',
    durationBadge: '7 mins',
    themeDesc:
      'Hoạt hình gia đình vui nhộn, trò chơi tuổi thơ và hội thoại ngắn tự nhiên (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@BlueyOfficialChannel',
    avatarUrl:
      'https://yt3.googleusercontent.com/85vkM7knUryaZjjibSKxS5E4pR2YQXntVE8RKxm_wifrFnAGFMfcSxUT2_FQamXpcpAG7DixKg=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/C_-3RY9tD8A/hqdefault.jpg',
    embedVideoIds: [
      'C_-3RY9tD8A',
      'GsTLfZaeYd4',
      '5N-Nn4-PNOQ',
      '3lfOLF0T-eE',
      'zjmstliaU9Y',
    ],
  },
  {
    id: 'yt-3-6-simon-super-rabbit',
    name: 'Simon Super Rabbit',
    ageGroup: '3-6',
    ageBadge: '3–6 tuổi • Primary',
    categoryBadge: 'Hoạt hình • Primary • A1',
    durationBadge: '5 mins',
    themeDesc:
      'Chú thỏ Simon đáng yêu với các câu chuyện gia đình & sinh hoạt hàng ngày chuẩn Primary • A1',
    youtubeUrl: 'https://www.youtube.com/@SimonSuperRabbit',
    avatarUrl:
      'https://yt3.googleusercontent.com/culY9r9tA-2h_THjabNnwVMxic7Qu9449OPq3nbB-wQJAtROEKpyujfYu6d2CH43DdL_fbI6NQ=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/GNZm0NPiMzo/hqdefault.jpg',
    embedVideoIds: [
      'GNZm0NPiMzo',
      'Sy9c5xMw2_A',
      'zi-xogiUAOI',
      '1dLKdQ_VRCc',
      'jJ3n2ufuTHk',
    ],
  },
  {
    id: 'yt-3-6-hey-duggee',
    name: 'Hey Duggee',
    ageGroup: '3-6',
    ageBadge: '3–6 tuổi • Primary',
    categoryBadge: 'Hoạt hình • Primary • A1',
    durationBadge: '7 mins',
    themeDesc:
      'Hoạt hình vui nhộn câu ngắn về tình bạn, âm nhạc và các hoạt động đơn giản (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@HeyDuggeeOfficial',
    avatarUrl:
      'https://yt3.googleusercontent.com/H4OkKHNdMfPBVbEq2XDr2uQoKSlFGzjPDG-UnzDMUhZQAoovK81Cidw4aKR_9f-84Bh6i9gA=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/asYFjPNbsJY/hqdefault.jpg',
    embedVideoIds: [
      'asYFjPNbsJY',
      'Aarp8wMaAv8',
      'mGRgf_BF0Rk',
      'Kr9LM1WLwaY',
      'SL6ANbbguXE',
    ],
  },
  {
    id: 'yt-3-6-sarah-and-duck',
    name: 'Sarah and Duck',
    ageGroup: '3-6',
    ageBadge: '3–6 tuổi • Primary',
    categoryBadge: 'Hoạt hình • Primary • A1',
    durationBadge: '7 mins',
    themeDesc:
      'Hoạt hình kể chuyện nhịp điệu chậm rãi, câu ngắn dễ nghe chuẩn Anh Quốc (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@SarahAndDuckOfficial',
    avatarUrl:
      'https://yt3.googleusercontent.com/ytc/AIdro_lknMjYYPLGVrn-pBMWchQ3ZgPWFZov0_qFxG_j5_0x=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/VnQQsKQStD4/hqdefault.jpg',
    embedVideoIds: [
      'VnQQsKQStD4',
      'aJYyQjKBo_4',
      'yR-kr2u7As4',
      'XmAtuTgvfTw',
      'Ew6QNgwH17g',
    ],
  },
  {
    id: 'yt-3-6-cbeebies',
    name: 'CBeebies',
    ageGroup: '3-6',
    ageBadge: '3–6 tuổi • Primary',
    categoryBadge: 'Ca nhạc & Hoạt hình • Primary • A1',
    durationBadge: '5–10 mins',
    themeDesc:
      'Kênh thiếu nhi BBC chuẩn Anh Quốc: bài hát vui và câu chuyện ngắn hàng ngày (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@CBeebies',
    avatarUrl:
      'https://yt3.googleusercontent.com/98R0DKiASF3R0kDUmj4UWIZ8ftQ6YzSk4KE0DXfTwPLCr8ixzd9GYJvkE7j-xE2jHMm0OCAjtMM=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/ngp12PhJ05s/hqdefault.jpg',
    embedVideoIds: [
      'ngp12PhJ05s',
      'ltA8L28hXkE',
      'Q7UOLR6zZUk',
      '7v8VPz5J9FA',
      'YCdXbxstpto',
    ],
  },
  {
    id: 'yt-3-6-sesame-street',
    name: 'Sesame Street',
    ageGroup: '3-6',
    ageBadge: '3–6 tuổi • Primary',
    categoryBadge: 'Ca nhạc & Rối • Primary • A1',
    durationBadge: '5–10 mins',
    themeDesc:
      'Ca hát vui nhộn, làm quen chữ cái & con số cùng các nhân vật rối đáng yêu (Primary • A1)',
    youtubeUrl: 'https://www.youtube.com/@SesameStreet',
    avatarUrl:
      'https://yt3.googleusercontent.com/UqIbNSghcysIlsbnGUxGMcY1Me7_bJ_zCrjz1oy9PueZVo63d1CnIk1tz8sAmTMNX9ojl4MhDQ=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/L_Few-yESmo/hqdefault.jpg',
    embedVideoIds: [
      'L_Few-yESmo',
      'sPrUy1Ya50U',
      'HjFCSAFm4r4',
      'aVbmOHHHlC8',
      'boR8mKhXJuI',
    ],
  },
  {
    id: 'yt-3-6-mickey-mouse-clubhouse',
    name: 'Mickey Mouse Clubhouse',
    ageGroup: '3-6',
    ageBadge: '3–6 tuổi • Primary',
    categoryBadge: 'Hoạt hình & Nhạc • Primary • A1',
    durationBadge: '5–10 mins',
    themeDesc:
      'Ca hát vui tươi và tương tác đếm số, màu sắc, hình khối đơn giản chuẩn Primary • A1',
    youtubeUrl: 'https://www.youtube.com/@DisneyJr',
    avatarUrl:
      'https://yt3.googleusercontent.com/ycmH6u_8GXdVOSwL8K8D0QSLxzoJvd6yiRORWT0QYosXdtBBOkqQdXTR4DS6kDHd-U49Z3dcpHY=s900-c-k-c0x00ffffff-no-rj',
    coverImageUrl: 'https://i.ytimg.com/vi/zqxjGipjF80/hqdefault.jpg',
    embedVideoIds: [
      'zqxjGipjF80',
      'p5ofS1K7fvw',
      '3Fcmj-ITl-o',
      'cUllHU2iTDM',
      'zuyvwZqUCfM',
    ],
  },
];

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDurationVietnamese(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút ${seconds} giây`;
  }
  if (minutes > 0) {
    return `${minutes} phút ${seconds} giây`;
  }
  return `${seconds} giây`;
}

export function formatShortHoursMinutes(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  if (minutes > 0) {
    return `${minutes} phút ${seconds}s`;
  }
  return `${seconds} giây`;
}

interface TuneInNgheNgamSectionProps {
  isLoggedIn: boolean;
  currentUserEmail?: string;
  currentUsername?: string;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export function TuneInNgheNgamSection({
  isLoggedIn,
  currentUserEmail = '',
  currentUsername = '',
  onOpenAuthModal,
}: TuneInNgheNgamSectionProps) {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);
  const [selectedAgeFilter, setSelectedAgeFilter] = useState<
    'ALL' | '0-3' | '3-6'
  >('ALL');

  // Kho video đầy đủ lấy trực tiếp từ trong kênh đang chọn (không ra ngoài kênh)
  const [channelVideosMap, setChannelVideosMap] = useState<
    Record<string, TuneInChannelVideoItem[]>
  >({});
  const [isLoadingChannelVideos, setIsLoadingChannelVideos] =
    useState<boolean>(false);
  const [inChannelSearchInput, setInChannelSearchInput] = useState<string>('');
  const [activeInChannelQuery, setActiveInChannelQuery] = useState<string>('');
  const [isWideCinemaLayout, setIsWideCinemaLayout] = useState<boolean>(false);

  // ============================================================================
  // BỘ ĐẾM TÍCH LUỸ GIỜ NGHE NGẤM MỖI NGÀY (ĐẾM VÀO TÀI KHOẢN)
  // ============================================================================
  const [todaySeconds, setTodaySeconds] = useState<number>(0);
  const [totalAccountSeconds, setTotalAccountSeconds] = useState<number>(0);
  const [guestSessionSeconds, setGuestSessionSeconds] = useState<number>(0);

  const unsyncedSecondsRef = useRef<number>(0);
  const userStorageKey =
    (currentUserEmail || currentUsername || '').trim().toLowerCase() || 'guest';

  // Load số giờ nghe ngấm đã tích luỹ của tài khoản khi đăng nhập
  useEffect(() => {
    if (!isLoggedIn || (!currentUserEmail && !currentUsername)) {
      setTodaySeconds(0);
      setTotalAccountSeconds(0);
      return;
    }

    const todayKey = getTodayDateString();
    let localTotal = 0;
    let localToday = 0;

    try {
      const raw = localStorage.getItem(
        STORAGE_KEY_LISTENING_TIME_PREFIX + userStorageKey
      );
      if (raw) {
        const parsed = JSON.parse(raw);
        localTotal = Number(parsed?.totalSeconds || 0);
        localToday = Number(parsed?.dailyMap?.[todayKey] || 0);
      }
    } catch {
      // ignore
    }

    setTotalAccountSeconds(localTotal);
    setTodaySeconds(localToday);

    if (currentUserEmail) {
      syncStudentAccountOnLogin(currentUserEmail, currentUsername).then(
        (synced) => {
          if (synced?.progress) {
            const srvTotal = Number(
              synced.progress.tuneInListeningSeconds || 0
            );
            const srvToday = Number(
              synced.progress.tuneInDailySeconds?.[todayKey] || 0
            );
            const mergedTotal = Math.max(localTotal, srvTotal);
            const mergedToday = Math.max(localToday, srvToday);
            setTotalAccountSeconds(mergedTotal);
            setTodaySeconds(mergedToday);
            try {
              localStorage.setItem(
                STORAGE_KEY_LISTENING_TIME_PREFIX + userStorageKey,
                JSON.stringify({
                  totalSeconds: mergedTotal,
                  dailyMap: {
                    ...(synced.progress.tuneInDailySeconds || {}),
                    [todayKey]: mergedToday,
                  },
                })
              );
            } catch {
              // ignore
            }
          }
        }
      );
    }
  }, [isLoggedIn, currentUserEmail, currentUsername, userStorageKey]);

  // Hàm đẩy số giây mới nghe lên Server tài khoản học viên
  const flushUnsyncedListeningTime = () => {
    const delta = unsyncedSecondsRef.current;
    if (
      delta <= 0 ||
      !isLoggedIn ||
      (!currentUserEmail && !currentUsername)
    ) {
      return;
    }
    unsyncedSecondsRef.current = 0;
    const todayKey = getTodayDateString();
    recordStudentProgress({
      email: currentUserEmail,
      username: currentUsername,
      tuneInListeningSecondsAdd: delta,
      tuneInDailyDate: todayKey,
      lastStudiedItem: `Tune In Nghe Ngấm (+${Math.max(1, Math.round(delta / 60))} phút)`,
    });
  };

  // Tự động đếm giờ khi đang mở 1 kênh YouTube trong ứng dụng
  const isCountingNow = Boolean(activeChannelId);

  useEffect(() => {
    if (!isCountingNow) {
      flushUnsyncedListeningTime();
      return;
    }

    const intervalId = window.setInterval(() => {
      if (!isLoggedIn) {
        setGuestSessionSeconds((prev) => prev + 1);
        return;
      }

      const todayKey = getTodayDateString();
      unsyncedSecondsRef.current += 1;

      setTodaySeconds((prevToday) => {
        const nextToday = prevToday + 1;
        setTotalAccountSeconds((prevTotal) => {
          const nextTotal = prevTotal + 1;
          try {
            const raw = localStorage.getItem(
              STORAGE_KEY_LISTENING_TIME_PREFIX + userStorageKey
            );
            const parsed = raw ? JSON.parse(raw) : {};
            const dailyMap = parsed.dailyMap || {};
            dailyMap[todayKey] = nextToday;
            localStorage.setItem(
              STORAGE_KEY_LISTENING_TIME_PREFIX + userStorageKey,
              JSON.stringify({
                totalSeconds: nextTotal,
                dailyMap,
              })
            );
          } catch {
            // ignore
          }
          return nextTotal;
        });
        return nextToday;
      });

      if (unsyncedSecondsRef.current >= 15) {
        flushUnsyncedListeningTime();
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
      flushUnsyncedListeningTime();
    };
  }, [isCountingNow, isLoggedIn, userStorageKey]);

  const activeChannel =
    TUNE_IN_CURATED_CHANNELS.find((c) => c.id === activeChannelId) || null;

  // Tự động tải kho video đầy đủ trong cùng kênh khi chọn kênh hoặc tìm kiếm trong kênh
  useEffect(() => {
    if (!activeChannel) return;

    const mapKey = `${activeChannel.id}::${activeInChannelQuery.toLowerCase()}`;
    if (channelVideosMap[mapKey] && channelVideosMap[mapKey].length > 0) {
      return;
    }

    let cancelled = false;
    setIsLoadingChannelVideos(true);

    fetch('/api/tunein/channel-videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelUrl: activeChannel.youtubeUrl,
        searchQuery: activeInChannelQuery,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const apiVideos: TuneInChannelVideoItem[] = Array.isArray(data?.videos)
          ? data.videos
          : [];

        // Gộp với danh sách video mặc định của kênh (nếu đang ở chế độ Tất cả) để luôn dồi dào video
        const merged: TuneInChannelVideoItem[] = [];
        const seen = new Set<string>();

        for (const v of apiVideos) {
          if (v?.videoId && !seen.has(v.videoId)) {
            seen.add(v.videoId);
            merged.push({
              videoId: v.videoId,
              title: v.title || `${activeChannel.name} • Video #${merged.length + 1}`,
              duration: v.duration,
              publishedTime: v.publishedTime,
            });
          }
        }

        if (!activeInChannelQuery) {
          for (const vid of activeChannel.embedVideoIds) {
            if (!seen.has(vid)) {
              seen.add(vid);
              merged.push({
                videoId: vid,
                title: `${activeChannel.name} • Tập chọn lọc #${merged.length + 1}`,
              });
            }
          }
        }

        if (merged.length > 0) {
          setChannelVideosMap((prev) => ({
            ...prev,
            [mapKey]: merged,
          }));
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingChannelVideos(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeChannel, activeInChannelQuery]);

  const channels0to3 = TUNE_IN_CURATED_CHANNELS.filter(
    (c) => c.ageGroup === '0-3'
  );
  const channels3to6 = TUNE_IN_CURATED_CHANNELS.filter(
    (c) => c.ageGroup === '3-6'
  );

  const handleSelectChannelBox = (channel: TuneInYoutubeChannel) => {
    setActiveChannelId(channel.id);
    setActiveVideoIdx(0);
    setInChannelSearchInput('');
    setActiveInChannelQuery('');
  };

  // Danh sách video hiện hành của kênh đang mở (chỉ gồm các video thuộc đúng kênh này)
  const currentChannelVideos: TuneInChannelVideoItem[] = (() => {
    if (!activeChannel) return [];
    const mapKey = `${activeChannel.id}::${activeInChannelQuery.toLowerCase()}`;
    const fetched = channelVideosMap[mapKey];
    if (fetched && fetched.length > 0) {
      return fetched;
    }
    return activeChannel.embedVideoIds.map((vid, idx) => ({
      videoId: vid,
      title: `${activeChannel.name} • Video #${idx + 1}`,
    }));
  })();

  const safeActiveIdx =
    currentChannelVideos.length > 0
      ? Math.min(activeVideoIdx, currentChannelVideos.length - 1)
      : 0;
  const currentVideoItem = currentChannelVideos[safeActiveIdx] || null;

  const getActiveEmbedUrl = (): string => {
    if (!activeChannel || !currentVideoItem) return '';
    const currentVid = currentVideoItem.videoId;
    // Khoá danh sách phát chỉ gồm các video trong cùng kênh (tối đa 40 ID quanh vị trí đang xem)
    const sliceStart = Math.max(0, safeActiveIdx - 5);
    const playlistIds = currentChannelVideos
      .slice(sliceStart, sliceStart + 35)
      .map((v) => v.videoId)
      .join(',');
    return `https://www.youtube-nocookie.com/embed/${currentVid}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&fs=1&playsinline=1&playlist=${playlistIds}`;
  };

  const dailyTargetSeconds = 30 * 60; // Mục tiêu 30 phút / ngày
  const dailyProgressPercent = Math.min(
    100,
    Math.round((todaySeconds / dailyTargetSeconds) * 100)
  );

  const renderChannelCard = (channel: TuneInYoutubeChannel) => {
    const is0to3 = channel.ageGroup === '0-3';
    const fallbackVideoThumb = channel.embedVideoIds[0]
      ? `https://i.ytimg.com/vi/${channel.embedVideoIds[0]}/hqdefault.jpg`
      : channel.coverImageUrl;

    return (
      <div
        key={channel.id}
        onClick={() => handleSelectChannelBox(channel)}
        className={`group relative rounded-[26px] bg-white p-4 border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-[0_6px_0_#e7e5e4] hover:shadow-[0_8px_0_#d6d3d1] hover:-translate-y-0.5 ${
          is0to3
            ? 'border-amber-200/90 hover:border-amber-500'
            : 'border-rose-200/90 hover:border-[#e13829]'
        }`}
      >
        {/* Hàng nhãn trên cùng: Độ tuổi */}
        <div className="flex items-center justify-between gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 ${
              is0to3
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-rose-100 text-[#e13829] border border-rose-300'
            }`}
          >
            <span className="material-symbols-outlined text-xs">
              child_care
            </span>
            <span>{channel.ageBadge}</span>
          </span>
        </div>

        {/* Ảnh đại diện của kênh (Banner + Avatar tròn chính thức của kênh YouTube) */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-stone-900 border border-stone-200">
          <img
            src={channel.coverImageUrl || fallbackVideoThumb}
            alt={channel.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (fallbackVideoThumb && target.src !== fallbackVideoThumb) {
                target.src = fallbackVideoThumb;
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#ff0000] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">
                play_arrow
              </span>
            </div>
          </div>

          {/* Ảnh đại diện chính thức của Kênh YouTube ở góc trái dưới */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={channel.avatarUrl || fallbackVideoThumb}
                alt={channel.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (fallbackVideoThumb && target.src !== fallbackVideoThumb) {
                    target.src = fallbackVideoThumb;
                  }
                }}
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md bg-white shrink-0"
              />
              <span className="text-xs font-black text-white drop-shadow-xs truncate">
                {channel.name}
              </span>
            </div>

            <span className="px-2 py-0.5 rounded-md bg-black/70 text-amber-300 text-[10px] font-extrabold shrink-0">
              {channel.durationBadge}
            </span>
          </div>
        </div>

        {/* Tên kênh & mô tả chủ đề nghe ngấm */}
        <div className="space-y-1">
          <h4 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-[#e13829] transition-colors line-clamp-1">
            {channel.name}
          </h4>
          <p className="text-xs font-semibold text-stone-600 line-clamp-2 leading-relaxed">
            {channel.themeDesc}
          </p>
        </div>

        {/* Chân thẻ: Mở kho video trong kênh */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-[#e13829] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              video_library
            </span>
            <span>Mở kho video trong kênh</span>
          </span>
        </div>
      </div>
    );
  };

  const quickTopics =
    activeChannel?.ageGroup === '0-3'
      ? IN_CHANNEL_QUICK_TOPICS_0_3
      : IN_CHANNEL_QUICK_TOPICS_3_6;

  return (
    <div
      id="tune-in-nghe-ngam"
      className="bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 rounded-3xl p-4 sm:p-6 border-2 border-[#e13829]/30 shadow-sm flex flex-col gap-5 scroll-mt-24"
    >
      {/* ==================================================================== */}
      {/* HEADER: TUNE IN - NGHE NGẤM + BỘ LỌC NHANH 0-3 TUỔI / 3-6 TUỔI        */}
      {/* ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-rose-200/80">
        <div className="flex flex-wrap items-center gap-3">
          <div
            onClick={() => setActiveChannelId(null)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="px-4 py-1.5 rounded-2xl bg-[#e13829] text-white font-black text-base sm:text-lg shadow-xs group-hover:scale-105 transition-transform flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">
                smart_display
              </span>
              <span>TUNE IN - NGHE NGẤM</span>
            </span>
          </div>

          <span className="text-xs sm:text-sm font-bold text-stone-600">
            Hệ thống kênh YouTube nghe ngấm tự nhiên chuẩn bản xứ cho bé 0–6 tuổi
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeChannelId ? (
            <button
              type="button"
              onClick={() => setActiveChannelId(null)}
              className="px-4 py-2 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-black cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">
                arrow_back
              </span>
              <span>← Đổi sang kênh khác</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setSelectedAgeFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  selectedAgeFilter === 'ALL'
                    ? 'bg-[#e13829] text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-white'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setSelectedAgeFilter('0-3')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  selectedAgeFilter === '0-3'
                    ? 'bg-amber-500 text-stone-950 shadow-2xs'
                    : 'text-stone-700 hover:bg-white'
                }`}
              >
                👶 0–3 tuổi ({channels0to3.length} kênh)
              </button>
              <button
                type="button"
                onClick={() => setSelectedAgeFilter('3-6')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  selectedAgeFilter === '3-6'
                    ? 'bg-[#e13829] text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-white'
                }`}
              >
                🧒 3–6 tuổi ({channels3to6.length} kênh)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* KHUNG TÍCH LUỸ GIỜ NGHE NGẤM MỖI NGÀY (GỌN GÀNG TRÊN 1 HÀNG)         */}
      {/* ==================================================================== */}
      <div className="rounded-2xl bg-white px-3.5 py-2.5 border border-amber-300/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isCountingNow
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {isCountingNow ? 'timer' : 'schedule'}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-black text-stone-900 uppercase tracking-tight">
            Tích luỹ giờ nghe ngấm
          </h4>

          {isLoggedIn ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="font-bold text-stone-700">
                Hôm nay:{' '}
                <strong className="text-[#e13829] font-black">
                  {formatDurationVietnamese(todaySeconds)}
                </strong>
              </span>
              <span className="text-stone-300">•</span>
              <span className="font-bold text-stone-700">
                Tổng:{' '}
                <strong className="text-emerald-700 font-black">
                  {formatDurationVietnamese(totalAccountSeconds)}
                </strong>
              </span>
            </div>
          ) : (
            guestSessionSeconds > 0 && (
              <span className="text-xs text-emerald-700 font-black">
                ({formatDurationVietnamese(guestSessionSeconds)})
              </span>
            )
          )}
        </div>

        {!isLoggedIn && (
          <button
            type="button"
            onClick={() => onOpenAuthModal?.('login')}
            className="px-3.5 py-1.5 rounded-xl bg-[#e13829] hover:bg-[#c8281b] text-white font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Đăng nhập tích luỹ giờ nghe</span>
          </button>
        )}
      </div>

      {/* ==================================================================== */}
      {/* CHẾ ĐỘ 1: KHÔNG GIAN MỞ RỘNG CHỌN VIDEO TRONG CÙNG KÊNH              */}
      {/* (CHỈ BẤM TRONG KÊNH, KHÔNG DẪN LINK RA NGOÀI KÊNH)                   */}
      {/* ==================================================================== */}
      {activeChannel ? (
        <div className="bg-stone-950 text-white rounded-3xl p-4 sm:p-6 border border-stone-800 shadow-xl space-y-5">
          {/* Thanh điều khiển kênh đang mở + Nút đổi bố cục mở rộng */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-stone-800">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveChannelId(null)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-950 font-black text-xs sm:text-sm cursor-pointer flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-lg text-[#e13829]">
                  arrow_back
                </span>
                <span>Chọn kênh khác</span>
              </button>

              <div className="flex items-center gap-2.5">
                <img
                  src={activeChannel.avatarUrl || activeChannel.coverImageUrl}
                  alt={activeChannel.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 bg-white shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-xl font-black text-white leading-tight">
                      {activeChannel.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[11px] font-black">
                      {activeChannel.ageBadge}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        verified_user
                      </span>
                      <span>Chỉ phát trong kênh ({currentChannelVideos.length} video)</span>
                    </span>
                  </div>
                  <p className="text-xs font-bold text-stone-400 mt-0.5">
                    {activeChannel.themeDesc}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWideCinemaLayout((prev) => !prev)}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs font-black cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-base">
                  {isWideCinemaLayout ? 'view_sidebar' : 'aspect_ratio'}
                </span>
                <span>
                  {isWideCinemaLayout
                    ? 'Chế độ Chia 2 Cột'
                    : 'Mở rộng toàn khung'}
                </span>
              </button>
            </div>
          </div>

          {/* BỐ CỤC CHÍNH: MÀN HÌNH PHÁT + KHO VIDEO TRONG CÙNG KÊNH */}
          <div
            className={`grid grid-cols-1 ${
              isWideCinemaLayout ? 'gap-5' : ' lg:grid-cols-12 gap-5'
            } items-start`}
          >
            {/* CỘT TRÁI / TRÊN: MÀN HÌNH PHÁT VIDEO (CÓ LỚP CHẶN BẤM RA NGOÀI YOUTUBE) */}
            <div
              className={`${
                isWideCinemaLayout ? 'w-full' : 'lg:col-span-7'
              } space-y-3`}
            >
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border-2 border-stone-800 shadow-inner">
                {getActiveEmbedUrl() ? (
                  <>
                    <iframe
                      key={`${activeChannel.id}-${currentVideoItem?.videoId || safeActiveIdx}`}
                      src={getActiveEmbedUrl()}
                      title={currentVideoItem?.title || activeChannel.name}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    {/* Lớp chắn thanh tiêu đề trên cùng & góc phải dưới của iframe để ngăn bấm văng ra ngoài kênh */}
                    <div
                      className="absolute top-0 left-0 right-0 h-14 z-10 cursor-default"
                      title={`Đang phát trong kênh ${activeChannel.name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                    <div
                      className="absolute bottom-0 right-12 w-36 h-12 z-10 cursor-default"
                      title={`Chỉ xem trong kênh ${activeChannel.name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm font-bold">
                    Đang tải video trong kênh...
                  </div>
                )}
              </div>

              {/* Thanh điều khiển chuyển bài nhanh trong cùng kênh */}
              <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#e13829] text-white text-[11px] font-black shrink-0 tabular-nums">
                      Video #{safeActiveIdx + 1}/{currentChannelVideos.length}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-white truncate">
                      {currentVideoItem?.title || activeChannel.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={safeActiveIdx <= 0}
                    onClick={() =>
                      setActiveVideoIdx((prev) => Math.max(0, prev - 1))
                    }
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-white text-xs font-black cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      skip_previous
                    </span>
                    <span>Bài trước</span>
                  </button>

                  <button
                    type="button"
                    disabled={safeActiveIdx >= currentChannelVideos.length - 1}
                    onClick={() =>
                      setActiveVideoIdx((prev) =>
                        Math.min(currentChannelVideos.length - 1, prev + 1)
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-[#e13829] hover:bg-[#c8281b] disabled:opacity-40 text-white text-xs font-black cursor-pointer flex items-center gap-1"
                  >
                    <span>Bài tiếp</span>
                    <span className="material-symbols-outlined text-sm">
                      skip_next
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentChannelVideos.length <= 1) return;
                      const rand = Math.floor(
                        Math.random() * currentChannelVideos.length
                      );
                      setActiveVideoIdx(rand);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-black cursor-pointer flex items-center gap-1"
                    title="Chọn ngẫu nhiên 1 video khác trong cùng kênh này"
                  >
                    <span className="material-symbols-outlined text-sm">
                      shuffle
                    </span>
                    <span>Ngẫu nhiên</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI / DƯỚI: KHO VIDEO MỞ RỘNG TRONG CÙNG KÊNH */}
            <div
              className={`${
                isWideCinemaLayout ? 'w-full' : 'lg:col-span-5'
              } bg-stone-900 rounded-2xl p-3.5 sm:p-4 border border-stone-800 flex flex-col gap-3`}
            >
              {/* Tiêu đề kho video + Tìm kiếm CHỈ TRONG KÊNH NÀY */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">
                      video_library
                    </span>
                    <span>
                      Kho Video Trong Kênh {activeChannel.name} (
                      {currentChannelVideos.length})
                    </span>
                  </span>

                  {isLoadingChannelVideos && (
                    <span className="text-[11px] font-bold text-emerald-400 animate-pulse">
                      Đang tải thêm video...
                    </span>
                  )}
                </div>

                {/* Thanh tìm kiếm video khoá chặt trong kênh đang mở */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setActiveVideoIdx(0);
                    setActiveInChannelQuery(inChannelSearchInput.trim());
                  }}
                  className="flex items-center gap-1.5"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inChannelSearchInput}
                      onChange={(e) => setInChannelSearchInput(e.target.value)}
                      placeholder={`Tìm bài hát / tập phim trong kênh ${activeChannel.name}...`}
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-400 focus:outline-none text-xs font-bold text-white placeholder:text-stone-500"
                    />
                    {inChannelSearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setInChannelSearchInput('');
                          setActiveInChannelQuery('');
                          setActiveVideoIdx(0);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">
                          close
                        </span>
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-[#e13829] hover:bg-[#c8281b] text-white text-xs font-black cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      search
                    </span>
                    <span>Tìm trong kênh</span>
                  </button>
                </form>

                {/* Các chủ đề gợi ý lọc nhanh TRONG KÊNH */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {quickTopics.map((topic) => {
                    const isSelected =
                      activeInChannelQuery.toLowerCase() ===
                      topic.query.toLowerCase();
                    return (
                      <button
                        key={topic.label}
                        type="button"
                        onClick={() => {
                          setInChannelSearchInput(topic.query);
                          setActiveInChannelQuery(topic.query);
                          setActiveVideoIdx(0);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950 shadow-2xs'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                        }`}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Danh sách / Lưới chọn thoải mái tất cả video trong cùng kênh */}
              <div
                className={`grid ${
                  isWideCinemaLayout
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-h-[540px]'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 max-h-[430px]'
                } gap-2 overflow-y-auto pr-1`}
              >
                {currentChannelVideos.map((vidItem, idx) => {
                  const isPlayingThis = safeActiveIdx === idx;
                  const thumbUrl = `https://i.ytimg.com/vi/${vidItem.videoId}/mqdefault.jpg`;

                  return (
                    <button
                      key={`${vidItem.videoId}-${idx}`}
                      type="button"
                      onClick={() => setActiveVideoIdx(idx)}
                      className={`w-full p-2 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition-all group ${
                        isPlayingThis
                          ? 'bg-[#e13829]/20 border-[#e13829] shadow-xs'
                          : 'bg-stone-950/70 hover:bg-stone-800/80 border-stone-800'
                      }`}
                    >
                      <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-stone-800 shrink-0 border border-stone-700">
                        <img
                          src={thumbUrl}
                          alt={vidItem.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {vidItem.duration && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-white text-[9px] font-black tabular-nums">
                            {vidItem.duration}
                          </span>
                        )}
                        {isPlayingThis && (
                          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-400 text-xl animate-pulse">
                              equalizer
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black tabular-nums ${
                              isPlayingThis
                                ? 'bg-[#e13829] text-white'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          {isPlayingThis && (
                            <span className="text-[10px] font-black text-amber-400">
                              Đang phát
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs font-extrabold line-clamp-2 leading-snug ${
                            isPlayingThis
                              ? 'text-white'
                              : 'text-stone-200 group-hover:text-white'
                          }`}
                        >
                          {vidItem.title ||
                            `${activeChannel.name} - Tập ${idx + 1}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Thanh chân trang khi đang mở kênh */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">
                timer
              </span>
              <span>
                {isLoggedIn
                  ? `Đang cộng dồn giờ nghe ngấm vào tài khoản (Hôm nay: ${formatDurationVietnamese(todaySeconds)})`
                  : `Đang nghe phiên hiện tại: ${formatDurationVietnamese(guestSessionSeconds)} (Hãy Đăng nhập để lưu vào tài khoản)`}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setActiveChannelId(null)}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 border border-stone-700"
            >
              <span className="material-symbols-outlined text-sm">
                grid_view
              </span>
              <span>← Đổi sang kênh khác</span>
            </button>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* CHẾ ĐỘ 2: 2 KHUNG ĐỘ TUỔI RÕ RỆT (0–3 TUỔI & 3–6 TUỔI)                */
        /* ==================================================================== */
        <div className="space-y-6">
          {/* KHUNG 1: 0 – 3 TUỔI */}
          {(selectedAgeFilter === 'ALL' || selectedAgeFilter === '0-3') && (
            <div className="rounded-3xl bg-amber-50/70 border-2 border-amber-300/90 p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="px-4 py-1.5 rounded-2xl bg-amber-500 text-stone-950 font-black text-sm sm:text-base shadow-2xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">
                    music_note
                  </span>
                  <span>ĐỘ TUỔI 0 – 3 TUỔI</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {channels0to3.map(renderChannelCard)}
              </div>
            </div>
          )}

          {/* KHUNG 2: 3 – 6 TUỔI */}
          {(selectedAgeFilter === 'ALL' || selectedAgeFilter === '3-6') && (
            <div className="rounded-3xl bg-rose-50/60 border-2 border-rose-300/90 p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="px-4 py-1.5 rounded-2xl bg-[#e13829] text-white font-black text-sm sm:text-base shadow-2xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">
                    face
                  </span>
                  <span>ĐỘ TUỔI 3 – 6 TUỔI</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {channels3to6.map(renderChannelCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

