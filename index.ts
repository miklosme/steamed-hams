// Dev server for the player.
import { serve } from "./server";

const server = serve(Number(process.env.PORT ?? 3000));
console.log(`player: ${server.url}`);
