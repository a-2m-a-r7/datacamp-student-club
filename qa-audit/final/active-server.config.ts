import {defineConfig} from '@playwright/test';
import base from './regression.config';
export default defineConfig({...base,webServer:undefined});
