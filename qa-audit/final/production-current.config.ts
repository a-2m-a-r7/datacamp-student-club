import {defineConfig} from '@playwright/test';import base from './production.config';
export default defineConfig({...base,use:{...base.use,baseURL:'http://127.0.0.1:3300'}});
