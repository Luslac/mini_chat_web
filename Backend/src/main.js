import { server } from "./application/app.js";
import { logger } from "./application/logging.js";

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Server Connected To Port ${PORT}`)
})