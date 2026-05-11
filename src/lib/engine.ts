import type { EngineAnalysis, PvLine } from "@/types";

interface RawPvInfo {
  multipv: number;
  depth: number;
  score: { cp?: number; mate?: number };
  pv: string[];
}

function parseInfoLine(line: string): RawPvInfo | null {
  if (!line.startsWith("info") || !line.includes("pv")) return null;

  const multipvMatch = line.match(/multipv (\d+)/);
  const depthMatch = line.match(/\bdepth (\d+)/);
  const cpMatch = line.match(/score cp (-?\d+)/);
  const mateMatch = line.match(/score mate (-?\d+)/);
  const pvMatch = line.match(/ pv (.+)/);

  if (!depthMatch || !pvMatch) return null;

  const multipv = multipvMatch ? parseInt(multipvMatch[1]) : 1;
  const depth = parseInt(depthMatch[1]);
  const pv = pvMatch[1].trim().split(" ").filter(Boolean);
  const score: RawPvInfo["score"] = {};

  if (cpMatch) score.cp = parseInt(cpMatch[1]);
  else if (mateMatch) score.mate = parseInt(mateMatch[1]);

  return { multipv, depth, score, pv };
}

export class StockfishEngine {
  private worker: Worker | null = null;
  private ready = false;
  private initPromise: Promise<void>;
  // Sequential command queue to prevent concurrent UCI commands
  private commandQueue: Promise<unknown> = Promise.resolve();

  constructor() {
    this.initPromise = this.init();
  }

  private init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker("/stockfish.js");
        this.worker.onmessage = (e: MessageEvent) => {
          if (e.data === "uciok") {
            this.send("setoption name Hash value 16");
            this.send("isready");
          } else if (e.data === "readyok") {
            this.ready = true;
            resolve();
          }
        };
        this.worker.onerror = (err) => {
          console.error("Stockfish worker error:", err);
          reject(err);
        };
        this.send("uci");
      } catch (e) {
        reject(e);
      }
    });
  }

  private send(cmd: string) {
    this.worker?.postMessage(cmd);
  }

  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.commandQueue.then(fn) as Promise<T>;
    this.commandQueue = result.catch(() => {});
    return result;
  }

  async analyzePosition(
    fen: string,
    depth = 15,
    multiPv = 3
  ): Promise<EngineAnalysis> {
    return this.enqueue(() => this._analyzePosition(fen, depth, multiPv));
  }

  private _analyzePosition(
    fen: string,
    depth: number,
    multiPv: number
  ): Promise<EngineAnalysis> {
    return new Promise(async (resolve) => {
      await this.initPromise;
      if (!this.ready || !this.worker) throw new Error("Engine not ready");

      const w = this.worker;

      const pvMap = new Map<number, RawPvInfo>();
      let bestmoveStr = "";

      // Stockfish always reports scores from the side-to-move perspective.
      // Normalize to White's absolute perspective so evaluations are consistent
      // across the whole game (positive = White winning, negative = Black winning).
      const sideToMove = fen.split(" ")[1]; // "w" or "b"
      const sign = sideToMove === "b" ? -1 : 1;

      const handler = (e: MessageEvent) => {
        const line: string = e.data;
        if (line.startsWith("info")) {
          const parsed = parseInfoLine(line);
          if (parsed && parsed.depth >= 1) {
            pvMap.set(parsed.multipv, parsed);
          }
        } else if (line.startsWith("bestmove")) {
          bestmoveStr = line.split(" ")[1] ?? "";
          w.removeEventListener("message", handler);

          const primaryPv = pvMap.get(1);
          if (!primaryPv) {
            resolve({
              evaluation: 0,
              isMate: false,
              bestMove: bestmoveStr,
              multiPv: [],
              depth,
            });
            return;
          }

          const pvLines: PvLine[] = [];
          pvMap.forEach((info, rank) => {
            const isMate = info.score.mate !== undefined;
            pvLines.push({
              rank,
              evaluation: (info.score.cp ?? 0) * sign,
              isMate,
              mateIn: isMate ? (info.score.mate ?? 0) * sign : undefined,
              moves: info.pv,
            });
          });
          pvLines.sort((a, b) => a.rank - b.rank);

          const isMate = primaryPv.score.mate !== undefined;
          resolve({
            evaluation: (primaryPv.score.cp ?? 0) * sign,
            isMate,
            mateIn: isMate ? (primaryPv.score.mate ?? 0) * sign : undefined,
            bestMove: bestmoveStr,
            multiPv: pvLines,
            depth: primaryPv.depth,
          });
        }
      };

      w.addEventListener("message", handler);
      this.send("stop");
      // Reset to full strength for analysis
      this.send("setoption name Skill Level value 20");
      this.send(`setoption name MultiPV value ${multiPv}`);
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
    });
  }

  /** Get Stockfish's move at a given skill level (0-20). Returns UCI move string. */
  async getOpponentMove(fen: string, skillLevel: number): Promise<string> {
    return this.enqueue(() => this._getOpponentMove(fen, skillLevel));
  }

  private _getOpponentMove(fen: string, skillLevel: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      await this.initPromise;
      if (!this.ready || !this.worker) return reject(new Error("Engine not ready"));

      const w = this.worker;
      // Thinking time scales with skill level
      const moveTime = 200 + skillLevel * 80; // 200ms (skill 0) to 1800ms (skill 20)

      const handler = (e: MessageEvent) => {
        const line: string = e.data;
        if (line.startsWith("bestmove")) {
          const move = line.split(" ")[1] ?? "";
          w.removeEventListener("message", handler);
          resolve(move);
        }
      };

      w.addEventListener("message", handler);
      this.send("stop");
      this.send("setoption name MultiPV value 1");
      this.send(`setoption name Skill Level value ${skillLevel}`);
      this.send(`position fen ${fen}`);
      this.send(`go movetime ${moveTime}`);
    });
  }

  reinitialize() {
    this.worker?.terminate();
    this.ready = false;
    this.commandQueue = Promise.resolve();
    this.initPromise = this.init();
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
  }
}

let engineInstance: StockfishEngine | null = null;

export function getEngine(): StockfishEngine {
  if (!engineInstance) {
    engineInstance = new StockfishEngine();
  }
  return engineInstance;
}
