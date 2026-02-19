import { Controller, Get } from "@nestjs/common";

@Controller()
export class RootController {
  @Get()
  welcome() {
    return {
      message: "🚀 Welcome to Dhanvarsha Server",
      service: " Dhanvarsha API",
      status: "running",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("health")
  health() {
    return {
      status: "ok",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}
