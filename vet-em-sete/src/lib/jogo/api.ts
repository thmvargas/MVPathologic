import { z } from "zod";

export const AcaoSchema = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("palpite"), diagnosticoId: z.string().max(100) }),
  z.object({ tipo: z.literal("pular") }),
  z.object({ tipo: z.literal("exame"), exameId: z.string().max(100) }),
  z.object({ tipo: z.literal("tratamento"), condutas: z.array(z.string().max(100)).max(50) }),
]);

export const ModoLivreSchema = z.enum(["treino", "semestre", "arquivo", "exemplo"]);
