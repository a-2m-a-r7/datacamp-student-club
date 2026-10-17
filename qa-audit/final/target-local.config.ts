import {defineConfig} from '@playwright/test';import base from './regression.config';
export default defineConfig({...base,use:{...base.use,baseURL:'http://127.0.0.1:3302'},webServer:undefined});
