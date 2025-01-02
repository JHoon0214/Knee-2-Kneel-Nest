"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const httpApp = await core_1.NestFactory.create(app_module_1.AppModule);
    await httpApp.listen(3003);
    console.log('HTTP server is listening on port 3003');
}
bootstrap();
//# sourceMappingURL=main.js.map