import 'dotenv/config';
import { McpApp } from '@nitrostack/core';
import { AppModule } from './app.module.js';

@McpApp({
  module: AppModule
})
export class Server {}
