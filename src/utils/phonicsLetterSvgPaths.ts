/**
 * Định nghĩa nét vẽ chuẩn quốc tế Jolly Phonics UK dạng Single-Stroke Monoline (Pre-cursive with exit flicks).
 * Nét thanh mảnh, đầu bo tròn (round cap), không quá đậm, chuẩn xác 100% như tài liệu giảng dạy gốc.
 */

export interface SvgLetterDefinition {
  width: number;
  height: number;
  paths: {
    d: string;
    fill?: string;
    stroke?: boolean;
  }[];
  dots?: {
    cx: number;
    cy: number;
    r: number;
  }[];
}

// Bảng tọa độ nét vẽ đơn lẻ cho từng ký tự a-z trong hệ quy chiếu tiêu chuẩn (cao 260)
export const LETTER_STROKES: Record<string, SvgLetterDefinition> = {
  // s: Nét cong mềm mại liền mạch không đứt đoạn, đầu bo tròn
  s: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 152 64 C 134 40, 104 33, 76 38 C 45 44, 32 70, 35 96 C 40 134, 85 152, 126 170 C 156 184, 168 206, 162 230 C 154 252, 115 258, 80 252 C 50 246, 28 232, 20 214',
        stroke: true,
      },
    ],
  },

  // a: Bụng tròn bên trái khép kín, thân đứng bên phải kéo thẳng xuống và uốn nét hất (exit flick)
  a: {
    width: 200,
    height: 260,
    paths: [
      // Bụng tròn
      {
        d: 'M 145 88 C 115 78, 65 78, 42 108 C 24 132, 24 165, 42 188 C 62 214, 115 214, 145 188',
        stroke: true,
      },
      // Thân đứng + nét hất
      {
        d: 'M 145 88 L 145 188 C 145 204, 160 216, 180 214',
        stroke: true,
      },
    ],
  },

  // t: Thân cao từ trên xuống uốn nét móc sang phải + nét gạch ngang cắt qua
  t: {
    width: 200,
    height: 260,
    paths: [
      // Nét gạch ngang
      {
        d: 'M 38 78 L 158 78',
        stroke: true,
      },
      // Thân thẳng từ trên xuống + nét móc
      {
        d: 'M 98 24 L 98 188 C 98 205, 115 216, 148 214',
        stroke: true,
      },
    ],
  },

  // i: Thân đứng uốn nét hất + dấu chấm tròn riêng biệt phía trên
  i: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 98 88 L 98 188 C 98 205, 114 216, 142 214',
        stroke: true,
      },
    ],
    dots: [
      {
        cx: 98,
        cy: 48,
        r: 10,
      },
    ],
  },

  // p: Thân kéo dài xuống dưới dòng kẻ (descender) + bụng tròn bên phải
  p: {
    width: 200,
    height: 260,
    paths: [
      // Thân dài xuống dưới
      {
        d: 'M 62 88 L 62 255',
        stroke: true,
      },
      // Bụng tròn bên phải
      {
        d: 'M 62 102 C 82 82, 135 80, 155 106 C 172 128, 172 165, 155 186 C 135 210, 82 210, 62 192',
        stroke: true,
      },
    ],
  },

  // n: Thân trái thẳng xuống + vòm cong sang phải có nét hất ở chân
  n: {
    width: 200,
    height: 260,
    paths: [
      // Nét đứng trái
      {
        d: 'M 52 88 L 52 208',
        stroke: true,
      },
      // Vòm cong + nét hất
      {
        d: 'M 52 135 C 65 98, 108 82, 140 106 C 152 116, 154 135, 154 160 L 154 188 C 154 205, 168 216, 188 214',
        stroke: true,
      },
    ],
  },

  // c: Nét cong mở sang phải
  c: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 152 112 C 132 86, 92 80, 62 106 C 36 128, 36 168, 62 192 C 92 218, 132 214, 155 186',
        stroke: true,
      },
    ],
  },

  // k: Thân cao + 2 nét chéo vào ra với nét hất
  k: {
    width: 200,
    height: 260,
    paths: [
      // Thân cao
      {
        d: 'M 62 24 L 62 208',
        stroke: true,
      },
      // Chéo trên
      {
        d: 'M 148 108 L 74 150',
        stroke: true,
      },
      // Chéo dưới + hất
      {
        d: 'M 74 150 L 138 206 C 148 214, 160 216, 172 212',
        stroke: true,
      },
    ],
  },

  // e: Gạch ngang giữa vòng lên cung tròn và uốn ra ngoài
  e: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 45 150 L 152 150 C 152 110, 126 82, 88 84 C 52 86, 34 116, 36 150 C 38 185, 62 214, 102 214 C 128 214, 146 202, 155 186',
        stroke: true,
      },
    ],
  },

  // h: Thân cao + vòm cong có nét hất
  h: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 52 24 L 52 208',
        stroke: true,
      },
      {
        d: 'M 52 135 C 65 98, 108 82, 140 106 C 152 116, 154 135, 154 160 L 154 188 C 154 205, 168 216, 188 214',
        stroke: true,
      },
    ],
  },

  // r: Thân thẳng + móc nhỏ bên phải
  r: {
    width: 180,
    height: 260,
    paths: [
      {
        d: 'M 58 88 L 58 208',
        stroke: true,
      },
      {
        d: 'M 58 135 C 68 98, 105 84, 142 96',
        stroke: true,
      },
    ],
  },

  // m: Thân trái + 2 vòm cong có nét hất
  m: {
    width: 240,
    height: 260,
    paths: [
      {
        d: 'M 38 88 L 38 208',
        stroke: true,
      },
      {
        d: 'M 38 135 C 48 98, 82 82, 98 106 C 104 115, 106 130, 106 155 L 106 208',
        stroke: true,
      },
      {
        d: 'M 106 135 C 116 98, 148 82, 165 106 C 172 116, 174 132, 174 155 L 174 188 C 174 204, 186 214, 206 212',
        stroke: true,
      },
    ],
  },

  // d: Bụng tròn bên trái + thân cao bên phải với nét hất
  d: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 145 88 C 115 78, 65 78, 42 108 C 24 132, 24 165, 42 188 C 62 214, 115 214, 145 188',
        stroke: true,
      },
      {
        d: 'M 145 24 L 145 188 C 145 204, 160 216, 180 214',
        stroke: true,
      },
    ],
  },

  // g: Bụng tròn trên + đuôi móc vòng xuống dưới
  g: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 145 88 C 115 78, 65 78, 42 108 C 24 132, 24 165, 42 188 C 62 214, 115 214, 145 188',
        stroke: true,
      },
      {
        d: 'M 145 88 L 145 220 C 145 248, 120 258, 85 256 C 58 254, 42 242, 38 230',
        stroke: true,
      },
    ],
  },

  // o: Hình tròn hoàn hảo khép kín
  o: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 100 84 C 55 84, 34 118, 34 150 C 34 184, 58 214, 100 214 C 142 214, 166 184, 166 150 C 166 118, 145 84, 100 84 Z',
        stroke: true,
      },
    ],
  },

  // u: Đáy chén uốn cong + thân phải kéo xuống hất nét
  u: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 48 88 L 48 175 C 48 202, 75 214, 110 214 C 132 214, 148 202, 154 182',
        stroke: true,
      },
      {
        d: 'M 154 88 L 154 188 C 154 204, 168 216, 186 214',
        stroke: true,
      },
    ],
  },

  // l: Thân cao vút từ trên xuống uốn nét hất
  l: {
    width: 180,
    height: 260,
    paths: [
      {
        d: 'M 92 24 L 92 188 C 92 204, 108 216, 138 214',
        stroke: true,
      },
    ],
  },

  // f: Cần câu uốn cong trên đỉnh + gạch ngang
  f: {
    width: 180,
    height: 260,
    paths: [
      {
        d: 'M 142 42 C 132 28, 115 24, 96 24 C 74 24, 64 38, 64 65 L 64 208',
        stroke: true,
      },
      {
        d: 'M 34 88 L 128 88',
        stroke: true,
      },
    ],
  },

  // b: Thân cao + bụng tròn bên phải
  b: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 62 24 L 62 208',
        stroke: true,
      },
      {
        d: 'M 62 135 C 78 98, 125 80, 154 105 C 172 126, 172 165, 154 188 C 135 212, 85 212, 62 195',
        stroke: true,
      },
    ],
  },

  // j: Móc dài xuống dưới + dấu chấm
  j: {
    width: 180,
    height: 260,
    paths: [
      {
        d: 'M 115 88 L 115 220 C 115 248, 92 258, 65 256 C 48 254, 38 244, 34 232',
        stroke: true,
      },
    ],
    dots: [
      {
        cx: 115,
        cy: 48,
        r: 10,
      },
    ],
  },

  // z: Nét zic-zac
  z: {
    width: 190,
    height: 260,
    paths: [
      {
        d: 'M 45 88 L 148 88 L 48 210 L 152 210',
        stroke: true,
      },
    ],
  },

  // w: Hai đáy nhọn
  w: {
    width: 220,
    height: 260,
    paths: [
      {
        d: 'M 32 88 L 56 210 L 102 125 L 148 210 L 176 88',
        stroke: true,
      },
    ],
  },

  // v: Đáy nhọn
  v: {
    width: 190,
    height: 260,
    paths: [
      {
        d: 'M 42 88 L 95 210 L 148 88',
        stroke: true,
      },
    ],
  },

  // y: Đáy chén + đuôi móc xuống dưới
  y: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 48 88 L 48 165 C 48 196, 75 208, 115 208 C 138 208, 150 196, 154 178',
        stroke: true,
      },
      {
        d: 'M 154 88 L 154 220 C 154 248, 125 258, 90 256 C 62 254, 48 242, 42 230',
        stroke: true,
      },
    ],
  },

  // x: Hai nét chéo
  x: {
    width: 190,
    height: 260,
    paths: [
      {
        d: 'M 42 88 L 148 210',
        stroke: true,
      },
      {
        d: 'M 148 88 L 42 210',
        stroke: true,
      },
    ],
  },

  // q: Bụng tròn bên trái + thân kéo xuống nét hất
  q: {
    width: 200,
    height: 260,
    paths: [
      {
        d: 'M 145 88 C 115 78, 65 78, 42 108 C 24 132, 24 165, 42 188 C 62 214, 115 214, 145 188',
        stroke: true,
      },
      {
        d: 'M 145 88 L 145 255 L 165 238',
        stroke: true,
      },
    ],
  },
};

/**
 * Ghép nét vẽ cho các âm đơn hoặc âm đôi (digraphs) / âm ba (trigraphs)
 */
export function getCompositeSvgSound(soundText: string): {
  viewBox: string;
  elements: {
    key: string;
    offsetX: number;
    letterDef: SvgLetterDefinition;
  }[];
  totalWidth: number;
  totalHeight: number;
} {
  const chars = soundText.toLowerCase().trim().split('');
  let currentX = 0;
  const spacing = 15; // khoảng cách giữa 2 chữ cái trong âm đôi
  const elements: {
    key: string;
    offsetX: number;
    letterDef: SvgLetterDefinition;
  }[] = [];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const def = LETTER_STROKES[ch];
    if (def) {
      elements.push({
        key: `${ch}_${i}`,
        offsetX: currentX,
        letterDef: def,
      });
      currentX += def.width + spacing;
    }
  }

  const totalWidth = Math.max(200, currentX > 0 ? currentX - spacing : 200);
  const totalHeight = 260;

  return {
    viewBox: `0 0 ${totalWidth} ${totalHeight}`,
    elements,
    totalWidth,
    totalHeight,
  };
}
