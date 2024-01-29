import { createApp } from 'vue';
import App from './app';
import './styles';
import { router } from './routes';
import 'uno.css';

createApp(App).use(router).mount('#app');
