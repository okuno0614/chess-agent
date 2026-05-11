import type { OpeningInfo } from "@/types";

interface OpeningEntry {
  eco: string;
  name: string;
  moves: string; // space-separated SAN
  description?: string;
}

// Comprehensive opening database (ECO codes A-E)
// Sorted longest-first for prefix matching
const OPENINGS: OpeningEntry[] = [
  // === E openings: 1.d4 d5 / 1.d4 Nf6 2.c4 e6 ===
  { eco: "E00", name: "クイーンズ・ギャンビット拒否（オーソドックス）", moves: "d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 b6", description: "白がクイーンサイドをコントロールし、黒がソリッドな陣形を築く" },
  { eco: "E10", name: "クイーンズ・インディアン・ディフェンス", moves: "d4 Nf6 c4 e6 Nf3 b6", description: "黒がb6からビショップをフィアンケットしてクイーンサイドをコントロール" },
  { eco: "E15", name: "クイーンズ・インディアン（クラシック変化）", moves: "d4 Nf6 c4 e6 Nf3 b6 g3 Bb7 Bg2 Be7 O-O O-O", description: "現代的なクイーンズインディアン" },
  { eco: "E20", name: "ニムゾ・インディアン・ディフェンス", moves: "d4 Nf6 c4 e6 Nc3 Bb4", description: "黒がc3ナイトにピンをかけてd4ポーンの支配に挑戦する鋭い戦略" },
  { eco: "E32", name: "ニムゾ・インディアン（クラシック）", moves: "d4 Nf6 c4 e6 Nc3 Bb4 Qc2", description: "白がクイーンをc2に置いてダブルポーンを防ぐ" },
  { eco: "E40", name: "ニムゾ・インディアン（Eルービンシュタイン）", moves: "d4 Nf6 c4 e6 Nc3 Bb4 e3", description: "ソリッドなルービンシュタイン変化" },
  { eco: "E60", name: "キングズ・インディアン・ディフェンス", moves: "d4 Nf6 c4 g6", description: "黒がキングサイドにフィアンケットして反撃を狙うダイナミックな戦略" },
  { eco: "E62", name: "キングズ・インディアン（フィアンケット）", moves: "d4 Nf6 c4 g6 Nc3 Bg7 Nf3 O-O g3", description: "白もフィアンケットするソリッドな変化" },
  { eco: "E80", name: "キングズ・インディアン（サムシュ攻撃）", moves: "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f3", description: "白がe4とf3でセンターを固める攻撃的変化" },
  { eco: "E92", name: "キングズ・インディアン（クラシック変化）", moves: "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5", description: "最も古典的なキングズインディアン" },
  { eco: "E97", name: "キングズ・インディアン（マルのイキ変化）", moves: "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 Nd2", description: "鋭いカウンターアタック" },

  // === D openings: 1.d4 d5 ===
  { eco: "D00", name: "クイーンズ・ポーン・ゲーム", moves: "d4 d5", description: "1.d4 d5からの多様な展開" },
  { eco: "D02", name: "ロンドン・システム", moves: "d4 d5 Nf3 Nf6 Bf4", description: "白がBf4の早期展開によるソリッドで信頼性の高いシステム" },
  { eco: "D04", name: "コーラチョビッチ・ディフェンス", moves: "d4 d5 Nf3 Nf6 e3 e6 Bd3", description: "ソリッドなセンター構築" },
  { eco: "D06", name: "クイーンズ・ギャンビット", moves: "d4 d5 c4", description: "白がc4でクイーンサイドのスペースを争う古典的な戦略" },
  { eco: "D10", name: "スラブ・ディフェンス", moves: "d4 d5 c4 c6", description: "黒がc6でポーンを支えてクイーンズギャンビットに対抗" },
  { eco: "D12", name: "スラブ（エクスチェンジ変化）", moves: "d4 d5 c4 c6 Nf3 Nf6 e3 Bf5", description: "黒がビショップを早期に展開" },
  { eco: "D20", name: "クイーンズ・ギャンビット承認（QGA）", moves: "d4 d5 c4 dxc4", description: "黒がポーンを取って後で取り返す作戦" },
  { eco: "D30", name: "クイーンズ・ギャンビット拒否（QGD）", moves: "d4 d5 c4 e6", description: "最も堅実なクイーンズギャンビット対応" },
  { eco: "D35", name: "クイーンズ・ギャンビット拒否（エクスチェンジ）", moves: "d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5", description: "ポーン交換による開放的な陣形" },
  { eco: "D43", name: "セミ・スラブ", moves: "d4 d5 c4 c6 Nf3 Nf6 Nc3 e6", description: "スラブとQGDのハイブリッド" },
  { eco: "D45", name: "セミ・スラブ（モスコー変化）", moves: "d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 Bg5 h6", description: "黒がビショップを退けるアクティブな変化" },
  { eco: "D50", name: "クイーンズ・ギャンビット（テール変化）", moves: "d4 d5 c4 e6 Nc3 Nf6 Bg5", description: "白がビショップを早期展開" },
  { eco: "D56", name: "ラスカー・ディフェンス", moves: "d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 h6 Bh4 Ne4", description: "黒がナイトトレードを求めて主導権を握ろうとする" },
  { eco: "D70", name: "グリュンフェルト・ディフェンス", moves: "d4 Nf6 c4 g6 Nc3 d5", description: "黒がd5ポーンを捨てて反撃するハイパーモダン作戦" },
  { eco: "D85", name: "グリュンフェルト（エクスチェンジ変化）", moves: "d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7", description: "最もシャープなグリュンフェルト" },

  // === C openings: 1.e4 e5, 1.e4 e6, 1.e4 c5 ===
  { eco: "C00", name: "フランス・ディフェンス", moves: "e4 e6", description: "黒がソリッドな陣形からd5を目指す" },
  { eco: "C01", name: "フランス（エクスチェンジ変化）", moves: "e4 e6 d4 d5 exd5 exd5", description: "シンメトリカルな陣形" },
  { eco: "C02", name: "フランス（アドバンス変化）", moves: "e4 e6 d4 d5 e5", description: "白がスペースを取る攻撃的変化" },
  { eco: "C06", name: "フランス（タラッシュ変化）", moves: "e4 e6 d4 d5 Nd2 Nf6 e5 c5 c3 Nc6 f4", description: "タラッシュの攻撃的アプローチ" },
  { eco: "C10", name: "フランス（ルービンシュタイン変化）", moves: "e4 e6 d4 d5 Nc3 dxe4 Nxe4", description: "黒がセンターを解放" },
  { eco: "C11", name: "フランス（クラシック変化）", moves: "e4 e6 d4 d5 Nc3 Nf6 e5 Nfd7", description: "最も複雑な変化の一つ" },
  { eco: "C20", name: "キング・ポーン・ゲーム", moves: "e4 e5", description: "1.e4 e5の王道オープン" },
  { eco: "C23", name: "ビショップス・オープニング", moves: "e4 e5 Bc4", description: "白がビショップを早期展開してf7を狙う" },
  { eco: "C24", name: "ビショップス・オープニング（ベルリン変化）", moves: "e4 e5 Bc4 Nf6", description: "黒がカウンタープレーを求める" },
  { eco: "C25", name: "ウィーン・ゲーム", moves: "e4 e5 Nc3", description: "白がセンターの緊張を維持" },
  { eco: "C30", name: "キングズ・ギャンビット", moves: "e4 e5 f4", description: "白がf4でポーンを捧げる鋭い攻撃的戦略" },
  { eco: "C33", name: "キングズ・ギャンビット承認", moves: "e4 e5 f4 exf4", description: "黒がポーンを受け入れる" },
  { eco: "C40", name: "ペトロフ・ディフェンス（ロシアン）", moves: "e4 e5 Nf3 Nf6", description: "黒が対称的なナイト展開でドローを目指す" },
  { eco: "C41", name: "フィリドール・ディフェンス", moves: "e4 e5 Nf3 d6", description: "黒がソリッドに守るが受け身になりやすい" },
  { eco: "C42", name: "ペトロフ・ディフェンス（クラシック）", moves: "e4 e5 Nf3 Nf6 Nxe5 d6", description: "ペトロフの主流変化" },
  { eco: "C44", name: "スコッチ・ゲーム", moves: "e4 e5 Nf3 Nc6 d4", description: "白がd4でセンターをオープンにする積極策" },
  { eco: "C45", name: "スコッチ・ゲーム（クラシック）", moves: "e4 e5 Nf3 Nc6 d4 exd4 Nxd4", description: "スコッチの主流" },
  { eco: "C46", name: "スリー・ナイツ", moves: "e4 e5 Nf3 Nc6 Nc3", description: "白が3つ目のナイトを展開" },
  { eco: "C47", name: "フォー・ナイツ（スコッチ変化）", moves: "e4 e5 Nf3 Nc6 Nc3 Nf6 d4", description: "鋭いフォーナイツ変化" },
  { eco: "C50", name: "イタリアン・ゲーム", moves: "e4 e5 Nf3 Nc6 Bc4", description: "古典的なイタリアンオープニング。初心者に最適" },
  { eco: "C51", name: "エヴァンス・ギャンビット", moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 b4", description: "白がb4でポーンを捧げる古典的なギャンビット" },
  { eco: "C53", name: "イタリアン（クラシック変化）", moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3", description: "白がセンターを強化" },
  { eco: "C54", name: "ジョコ・ピアノ", moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4", description: "オープンでバランスの良いゲーム" },
  { eco: "C55", name: "二ナイト・ディフェンス", moves: "e4 e5 Nf3 Nc6 Bc4 Nf6", description: "黒がナイトで積極的に反撃" },
  { eco: "C57", name: "二ナイト（フリード・ライバー攻撃）", moves: "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5", description: "白がf7を狙う攻撃的変化" },
  { eco: "C60", name: "ルイ・ロペス（スパニッシュ）", moves: "e4 e5 Nf3 Nc6 Bb5", description: "チェスで最も研究された戦略オープニングの一つ" },
  { eco: "C61", name: "スパニッシュ（バード・ディフェンス）", moves: "e4 e5 Nf3 Nc6 Bb5 Nd4", description: "黒がアクティブなナイトを使って反撃" },
  { eco: "C62", name: "スパニッシュ（オールドスタイン変化）", moves: "e4 e5 Nf3 Nc6 Bb5 d6", description: "スタインニッツ・ディフェンス" },
  { eco: "C63", name: "スパニッシュ（スキアラ変化）", moves: "e4 e5 Nf3 Nc6 Bb5 f5", description: "黒が積極的に攻撃" },
  { eco: "C65", name: "スパニッシュ（ベルリン・ディフェンス）", moves: "e4 e5 Nf3 Nc6 Bb5 Nf6", description: "トップレベルで流行のドロー傾向が強い変化" },
  { eco: "C67", name: "スパニッシュ（ベルリン、リオ・デ・ジャネイロ変化）", moves: "e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 Re1 Nc5 Nxe5 Nxe5 Rxe5+", description: "エンドゲーム指向の現代的変化" },
  { eco: "C68", name: "スパニッシュ（エクスチェンジ変化）", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6", description: "白がダブルポーンを強制" },
  { eco: "C70", name: "スパニッシュ（オープン変化）", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4", description: "最も一般的なスパニッシュ" },
  { eco: "C78", name: "スパニッシュ（モレル変化）", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O", description: "白のキャスリングが特徴" },
  { eco: "C80", name: "スパニッシュ（オープン変化）", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Nxe4", description: "黒がe4ナイトで積極的に攻勢" },
  { eco: "C84", name: "スパニッシュ（クローズド変化）", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7", description: "クローズドなスパニッシュ" },
  { eco: "C86", name: "スパニッシュ（クローズド、Worrall攻撃）", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Qe2", description: "クイーンを早期展開" },
  { eco: "C88", name: "スパニッシュ（クローズド、アンチ・マーシャル）", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1", description: "マーシャル攻撃を防ぐ変化" },
  { eco: "C90", name: "スパニッシュ（マーシャル攻撃）", moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O d4", description: "黒がポーンを捧げる大胆なギャンビット" },

  // === B openings: 1.e4 c5 (Sicilian), 1.e4 c6, 1.e4 d6 ===
  { eco: "B00", name: "ニムゾビッチ・ディフェンス", moves: "e4 Nc6", description: "黒がd5に間接的に圧力をかける" },
  { eco: "B01", name: "スカンジナビアン・ディフェンス", moves: "e4 d5", description: "黒が1手目にd5でセンターを攻撃する鋭い戦略" },
  { eco: "B02", name: "アレクサイン・ディフェンス", moves: "e4 Nf6", description: "黒がナイトでe4ポーンを誘い込むハイパーモダン" },
  { eco: "B04", name: "アレクサイン（モダン変化）", moves: "e4 Nf6 e5 Nd5 d4 d6 Nf3", description: "主流のアレクサイン変化" },
  { eco: "B06", name: "モダン・ディフェンス", moves: "e4 g6", description: "黒がフィアンケットするハイパーモダン" },
  { eco: "B07", name: "ピルス・ディフェンス", moves: "e4 d6 Nf3 Nf6 Nc3 g6", description: "黒がフレキシブルな陣形を構築" },
  { eco: "B09", name: "ピルス（オーストリア攻撃）", moves: "e4 d6 d4 Nf6 Nc3 g6 f4", description: "白が攻撃的なf4推進" },
  { eco: "B10", name: "カロ・カン・ディフェンス", moves: "e4 c6", description: "黒がc6でd5をサポートするソリッドな防御" },
  { eco: "B12", name: "カロ・カン（アドバンス変化）", moves: "e4 c6 d4 d5 e5", description: "白がスペースを取る積極策" },
  { eco: "B13", name: "カロ・カン（エクスチェンジ変化）", moves: "e4 c6 d4 d5 exd5 cxd5", description: "対称的な構造" },
  { eco: "B14", name: "カロ・カン（パノフ・ボトビニック攻撃）", moves: "e4 c6 d4 d5 exd5 cxd5 c4", description: "クイーンズギャンビット風の攻撃" },
  { eco: "B17", name: "カロ・カン（スマスロフ変化）", moves: "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7", description: "黒のソリッドな応手" },
  { eco: "B18", name: "カロ・カン（クラシック変化）", moves: "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5", description: "最も人気の高いカロカン変化" },
  { eco: "B20", name: "シシリアン・ディフェンス", moves: "e4 c5", description: "チェスで最も人気の高い非対称的オープニング" },
  { eco: "B21", name: "シシリアン（スミス・モラ・ギャンビット）", moves: "e4 c5 d4 cxd4 c3", description: "白がポーンを捧げる積極的なギャンビット" },
  { eco: "B22", name: "シシリアン（アラピン変化）", moves: "e4 c5 c3", description: "白がd4センターを準備するソリッドな変化" },
  { eco: "B23", name: "シシリアン（クローズド変化）", moves: "e4 c5 Nc3", description: "d4を進めずクローズドに戦う" },
  { eco: "B27", name: "シシリアン（ハイパー・アレクサイン）", moves: "e4 c5 Nf3 g6", description: "フィアンケットするシシリアン" },
  { eco: "B28", name: "シシリアン（オライリー変化）", moves: "e4 c5 Nf3 a6", description: "オライリー変化" },
  { eco: "B30", name: "シシリアン（オールドライン）", moves: "e4 c5 Nf3 Nc6", description: "黒がNc6で展開するシシリアン" },
  { eco: "B32", name: "シシリアン（2手目Nc6）", moves: "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4", description: "オープン・シシリアン" },
  { eco: "B40", name: "シシリアン（オープン 2...e6）", moves: "e4 c5 Nf3 e6", description: "黒がe6でソリッドに対応" },
  { eco: "B43", name: "シシリアン（カン変化）", moves: "e4 c5 Nf3 e6 d4 cxd4 Nxd4 a6", description: "フレキシブルな黒の陣形" },
  { eco: "B44", name: "シシリアン（テイマノフ変化）", moves: "e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6", description: "クラシックなテイマノフ" },
  { eco: "B46", name: "シシリアン（テイマノフ・フォー・ナイツ）", moves: "e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6 Nc3 a6", description: "最も人気のテイマノフ変化" },
  { eco: "B50", name: "シシリアン（2.Nf3 d6）", moves: "e4 c5 Nf3 d6", description: "クラシックなシシリアン配置" },
  { eco: "B54", name: "シシリアン（ルービンシュタイン変化）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 f3", description: "英国攻撃の前身" },
  { eco: "B56", name: "シシリアン（オープン、Nge7変化）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3", description: "最も標準的な展開" },
  { eco: "B60", name: "シシリアン（リヒター・ライザー攻撃）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 Nc6 Bg5", description: "白がビショップを早期展開して圧力をかける" },
  { eco: "B70", name: "シシリアン・ドラゴン", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6", description: "gフィアンケットによる鋭いカウンターアタック" },
  { eco: "B72", name: "シシリアン・ドラゴン（クラシック変化）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 Be2", description: "白がソリッドに構える" },
  { eco: "B76", name: "シシリアン・ドラゴン（ユーゴスラフ攻撃）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O", description: "最もシャープなドラゴン変化" },
  { eco: "B80", name: "シシリアン・ショーベニンガー変化", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6", description: "フレキシブルな黒の戦略" },
  { eco: "B84", name: "シシリアン・ショーベニンガー（クラシック変化）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6 Be2 a6 O-O Be7 f4", description: "白がキングサイドで攻撃準備" },
  { eco: "B85", name: "シシリアン・ショーベニンガー（マクシモビッチ変化）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6 Be2 a6 Be3 Be7 f4", description: "b4ポーン前進を準備" },
  { eco: "B90", name: "シシリアン・ナイドルフ変化", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6", description: "世界最強の変化の一つ。フレキシブルな陣形" },
  { eco: "B92", name: "シシリアン・ナイドルフ（オファー変化）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2", description: "ソリッドな白の対応" },
  { eco: "B96", name: "シシリアン・ナイドルフ（フィッシャー攻撃）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5 e6 f4 Qb6", description: "激しい戦闘" },
  { eco: "B97", name: "シシリアン・ナイドルフ（ポイズン・ポーン変化）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5 e6 f4 Qb6 Qd2 Qxb2", description: "黒がb2ポーンを取る超高リスクの変化" },
  { eco: "B99", name: "シシリアン・ナイドルフ（メイン変化）", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5 e6 f4 Be7 Qf3 Qc7 O-O-O Nbd7", description: "最も研究されたナイドルフ" },

  // === A openings: 1.d4, 1.c4, 1.Nf3, other first moves ===
  { eco: "A00", name: "ニムゾビッチ・ラーソン攻撃", moves: "b3", description: "クイーンサイドフィアンケット" },
  { eco: "A01", name: "ニムゾビッチ・ラーソン攻撃", moves: "b3 d5 Bb2", description: "ハイパーモダン的アプローチ" },
  { eco: "A02", name: "バードズ・オープニング", moves: "f4", description: "f4でキングサイドを制圧" },
  { eco: "A04", name: "レティ・オープニング", moves: "Nf3", description: "フレキシブルなハイパーモダン開幕" },
  { eco: "A06", name: "レティ（ニム・インディアン変化）", moves: "Nf3 d5 b3", description: "フィアンケットするレティ" },
  { eco: "A07", name: "キングス・インディアン攻撃（KIA）", moves: "Nf3 d5 g3", description: "KIAセットアップ" },
  { eco: "A09", name: "レティ（アドバンス変化）", moves: "Nf3 d5 c4", description: "クイーンズギャンビット風のレティ" },
  { eco: "A10", name: "イングリッシュ・オープニング", moves: "c4", description: "c4でクイーンサイドをコントロールするオープニング" },
  { eco: "A15", name: "イングリッシュ（ニムゾビッチ変化）", moves: "c4 Nf6", description: "黒がナイトで早期展開" },
  { eco: "A20", name: "イングリッシュ（1...e5変化）", moves: "c4 e5", description: "シシリアン・リバーサル的展開" },
  { eco: "A22", name: "イングリッシュ（ハミッシュ変化）", moves: "c4 e5 Nc3 Nf6 Nf3", description: "ソリッドなイングリッシュ展開" },
  { eco: "A30", name: "イングリッシュ（対称変化）", moves: "c4 c5", description: "完全対称なダブルフィアンケット系" },
  { eco: "A34", name: "イングリッシュ（対称4ナイツ）", moves: "c4 c5 Nc3 Nc6 Nf3 Nf6 g3", description: "現代的な対称イングリッシュ" },
  { eco: "A45", name: "トランポリン・システム", moves: "d4 Nf6 Bg5", description: "白がビショップを早期展開" },
  { eco: "A46", name: "クイーンズ・ポーン・トーレ攻撃", moves: "d4 Nf6 Nf3 e6 Bg5", description: "トーレのシステム" },
  { eco: "A50", name: "インディアン・ディフェンス", moves: "d4 Nf6 c4", description: "1.d4 Nf6 2.c4の広い範囲" },
  { eco: "A51", name: "ブダペスト・ギャンビット", moves: "d4 Nf6 c4 e5", description: "黒がe5でポーンを捧げる鋭いギャンビット" },
  { eco: "A57", name: "ベンコ・ギャンビット", moves: "d4 Nf6 c4 c5 d5 b5", description: "黒がクイーンサイドに長期的圧力をかける" },
  { eco: "A80", name: "ダッチ・ディフェンス", moves: "d4 f5", description: "黒がf5でキングサイド展開を準備" },
  { eco: "A84", name: "ダッチ（クラシック変化）", moves: "d4 f5 c4 Nf6 Nc3 e6", description: "ソリッドなダッチ" },
  { eco: "A85", name: "ダッチ（ストーンウォール）", moves: "d4 f5 c4 Nf6 Nc3 e6 Nf3 d5 e3 c6 Bd3 Bd6 O-O O-O Ne5", description: "黒のソリッドなストーンウォール陣形" },
];

// Sort by move length (longest first for best matching)
const SORTED_OPENINGS = [...OPENINGS].sort(
  (a, b) => b.moves.split(" ").length - a.moves.split(" ").length
);

export function detectOpening(sanHistory: string[]): OpeningInfo | null {
  if (!sanHistory.length) return null;

  for (const opening of SORTED_OPENINGS) {
    const openingMoves = opening.moves.split(" ");
    if (openingMoves.length > sanHistory.length) continue;

    const matches = openingMoves.every((m, i) => m === sanHistory[i]);
    if (matches) {
      return {
        eco: opening.eco,
        name: opening.name,
        description: opening.description,
      };
    }
  }

  // Partial match: just first few moves
  const partialMatches = SORTED_OPENINGS.filter((o) => {
    const moves = o.moves.split(" ");
    if (moves.length > sanHistory.length) return false;
    return moves.every((m, i) => m === sanHistory[i]);
  });

  if (partialMatches.length > 0) {
    const best = partialMatches[0];
    return { eco: best.eco, name: best.name, description: best.description };
  }

  return null;
}
